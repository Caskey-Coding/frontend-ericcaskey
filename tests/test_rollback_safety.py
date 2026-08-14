#!/usr/bin/env python3
"""Behavior and workflow-contract tests for EC-ROLLBACK-1."""

from __future__ import annotations

import contextlib
import http.server
import os
from pathlib import Path
import re
import shutil
import socketserver
import subprocess
import tempfile
import threading
import unittest


REPO_ROOT = Path(__file__).resolve().parents[1]
EXPORT_CHECKER = ".github/scripts/verify-contact-export.sh"
ROLLBACK_HEALTHCHECK = ".github/scripts/rollback-healthcheck.sh"
WORKFLOW = REPO_ROOT / ".github/workflows/rollback.yml"
PR_WORKFLOW = REPO_ROOT / ".github/workflows/pr-validation.yml"
PRECHECK = REPO_ROOT / "scripts/precheck.sh"
EXPECTED_API_URL = "https://contact.example.test"
BASH = shutil.which("bash") or "bash"


def run_bash(
    script: str,
    *args: str,
    env: dict[str, str] | None = None,
    extra_path: Path | None = None,
) -> subprocess.CompletedProcess[str]:
    command_env = os.environ.copy()
    if env:
        command_env.update(env)
    command = [BASH, script, *args]
    if extra_path is not None:
        command = [
            BASH,
            "-c",
            'export PATH="$1:$PATH"; shift; exec bash "$@"',
            "rollback-test",
            extra_path.as_posix(),
            script,
            *args,
        ]
    return subprocess.run(
        command,
        cwd=REPO_ROOT,
        env=command_env,
        capture_output=True,
        text=True,
        check=False,
    )


def write_export(root: Path, javascript: str) -> Path:
    export_dir = root / "out"
    static_dir = export_dir / "_next/static/chunks"
    static_dir.mkdir(parents=True)
    (static_dir / "contact.js").write_text(javascript, encoding="utf-8")
    return export_dir


def install_aws_stub(root: Path) -> tuple[Path, Path]:
    bin_dir = root / "bin"
    bin_dir.mkdir()
    aws_log = root / "aws.log"
    aws_stub = bin_dir / "aws"
    aws_stub.write_text(
        '#!/usr/bin/env bash\nprintf "%s\\n" "$*" >> "$AWS_CALL_LOG"\n',
        encoding="utf-8",
    )
    aws_stub.chmod(0o755)
    return bin_dir, aws_log


class SiteHandler(http.server.BaseHTTPRequestHandler):
    api_url = EXPECTED_API_URL
    asset_body = ""

    route_bodies = {
        "/": "<h1>Eric Caskey</h1>",
        "/about": "<h1>About</h1>",
        "/work": "<h1>Work</h1>",
        "/writing": "<h1>Writing</h1>",
        "/contact": (
            '<h1>Contact</h1><script src="/_next/static/chunks/contact.js"></script>'
        ),
    }

    def do_GET(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler contract
        if self.path == "/_next/static/chunks/contact.js":
            body = self.asset_body
            content_type = "application/javascript"
        elif self.path in self.route_bodies:
            body = self.route_bodies[self.path]
            content_type = "text/html"
        else:
            self.send_error(404)
            return

        payload = body.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, _format: str, *_args: object) -> None:
        return


@contextlib.contextmanager
def serve_site(asset_body: str):
    handler = type("ConfiguredSiteHandler", (SiteHandler,), {"asset_body": asset_body})
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as server:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            host, port = server.server_address
            yield f"http://{host}:{port}"
        finally:
            server.shutdown()
            thread.join(timeout=5)


def workflow_job(source: str, job_name: str) -> str:
    match = re.search(
        rf"(?ms)^  {re.escape(job_name)}:\s*$\n(.*?)(?=^  [a-zA-Z0-9_-]+:\s*$|\Z)",
        source,
    )
    if not match:
        raise AssertionError(f"workflow job not found: {job_name}")
    return match.group(1)


def workflow_step(job: str, step_name: str) -> tuple[int, str]:
    matches = list(re.finditer(r"(?m)^      - (?:name|uses): .+$", job))
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(job)
        block = job[match.start() : end]
        if re.search(rf"(?m)^      - name: {re.escape(step_name)}\s*$", block):
            return index, block
    raise AssertionError(f"workflow step not found: {step_name}")


class ExportGateTests(unittest.TestCase):
    def test_empty_contact_url_is_refused_before_any_aws_command(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            temp_path = Path(temp)
            export_dir = write_export(temp_path, EXPECTED_API_URL)
            bin_dir, aws_log = install_aws_stub(temp_path)
            result = run_bash(
                EXPORT_CHECKER,
                export_dir.as_posix(),
                env={"NEXT_PUBLIC_CONTACT_API_URL": "", "AWS_CALL_LOG": str(aws_log)},
                extra_path=bin_dir,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("NEXT_PUBLIC_CONTACT_API_URL", result.stdout + result.stderr)
            self.assertFalse(aws_log.exists(), "preflight must not invoke AWS")

    def test_export_without_exact_contact_url_is_refused_before_aws(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            temp_path = Path(temp)
            export_dir = write_export(temp_path, "https://wrong.example.test")
            bin_dir, aws_log = install_aws_stub(temp_path)
            result = run_bash(
                EXPORT_CHECKER,
                export_dir.as_posix(),
                env={
                    "NEXT_PUBLIC_CONTACT_API_URL": EXPECTED_API_URL,
                    "AWS_CALL_LOG": str(aws_log),
                },
                extra_path=bin_dir,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("does not contain", result.stdout + result.stderr)
            self.assertFalse(aws_log.exists(), "preflight must not invoke AWS")

    def test_export_with_exact_contact_url_is_accepted(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            export_dir = write_export(Path(temp), f'const api = "{EXPECTED_API_URL}";')
            result = run_bash(
                EXPORT_CHECKER,
                export_dir.as_posix(),
                env={"NEXT_PUBLIC_CONTACT_API_URL": EXPECTED_API_URL},
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


class LiveRollbackHealthTests(unittest.TestCase):
    def test_five_healthy_routes_do_not_hide_wrong_live_contact_config(self) -> None:
        with serve_site('const api = "https://wrong.example.test";') as base_url:
            result = run_bash(
                ROLLBACK_HEALTHCHECK,
                base_url,
                env={"NEXT_PUBLIC_CONTACT_API_URL": EXPECTED_API_URL},
            )

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Healthcheck passed: 5/5", result.stdout)
        self.assertIn("contact API URL", result.stdout + result.stderr)

    def test_five_healthy_routes_and_exact_live_contact_config_are_accepted(self) -> None:
        with serve_site(f'const api = "{EXPECTED_API_URL}";') as base_url:
            result = run_bash(
                ROLLBACK_HEALTHCHECK,
                base_url,
                env={"NEXT_PUBLIC_CONTACT_API_URL": EXPECTED_API_URL},
            )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


class WorkflowControlPlaneTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = WORKFLOW.read_text(encoding="utf-8")

    def test_build_uses_current_controls_and_configured_target(self) -> None:
        job = workflow_job(self.source, "build")
        control_index, control = workflow_step(job, "Checkout rollback controls")
        target_index, target = workflow_step(job, "Checkout rollback target")
        assert_index, configured = workflow_step(job, "Assert contact API URL is configured")
        build_index, build = workflow_step(job, "Build rollback target")
        verify_index, verify = workflow_step(job, "Verify contact API URL baked into export")
        upload_index, upload = workflow_step(job, "Upload verified rollback artifact")

        self.assertIn("ref: ${{ github.sha }}", control)
        self.assertIn("path: rollback-control", control)
        self.assertIn("ref: ${{ inputs.ref }}", target)
        self.assertIn("path: rollback-target", target)
        self.assertIn("NEXT_PUBLIC_CONTACT_API_URL: ${{ vars.NEXT_PUBLIC_CONTACT_API_URL }}", configured)
        self.assertIn("working-directory: rollback-target", build)
        self.assertIn("NEXT_PUBLIC_CONTACT_API_URL: ${{ vars.NEXT_PUBLIC_CONTACT_API_URL }}", build)
        self.assertIn("rollback-control/.github/scripts/verify-contact-export.sh", verify)
        self.assertIn("rollback-target/out", verify)
        self.assertIn("path: rollback-target/out/", upload)
        self.assertLess(control_index, target_index)
        self.assertLess(target_index, assert_index)
        self.assertLess(assert_index, build_index)
        self.assertLess(build_index, verify_index)
        self.assertLess(verify_index, upload_index)

    def test_downloaded_artifact_is_reverified_before_aws_credentials(self) -> None:
        job = workflow_job(self.source, "deploy")
        self.assertRegex(job, r"(?m)^    needs: build\s*$")
        _, verify = workflow_step(job, "Reverify downloaded rollback artifact")
        verify_index, _ = workflow_step(job, "Reverify downloaded rollback artifact")
        credentials_index, _ = workflow_step(job, "Configure AWS credentials")
        sync_index, _ = workflow_step(job, "Sync verified export to S3")

        self.assertIn("rollback-control/.github/scripts/verify-contact-export.sh", verify)
        self.assertIn("NEXT_PUBLIC_CONTACT_API_URL: ${{ vars.NEXT_PUBLIC_CONTACT_API_URL }}", verify)
        self.assertLess(verify_index, credentials_index)
        self.assertLess(credentials_index, sync_index)

    def test_health_waits_for_cloudfront_invalidation_to_finish(self) -> None:
        deploy_job = workflow_job(self.source, "deploy")
        sync_index, _ = workflow_step(deploy_job, "Sync verified export to S3")
        invalidation_index, invalidation = workflow_step(
            deploy_job, "Invalidate CloudFront and wait"
        )

        self.assertLess(sync_index, invalidation_index)
        self.assertIn("aws cloudfront wait invalidation-completed", invalidation)
        self.assertIn('--id "$INVALIDATION_ID"', invalidation)

    def test_healthcheck_cannot_be_downgraded_by_old_target(self) -> None:
        job = workflow_job(self.source, "healthcheck")
        self.assertRegex(job, r"(?m)^    needs: deploy\s*$")
        _, control = workflow_step(job, "Checkout rollback controls")
        _, health = workflow_step(job, "Run rollback healthcheck")

        self.assertIn("ref: ${{ github.sha }}", control)
        self.assertNotIn("inputs.ref", job)
        self.assertIn("rollback-control/.github/scripts/rollback-healthcheck.sh", health)
        self.assertIn("NEXT_PUBLIC_CONTACT_API_URL: ${{ vars.NEXT_PUBLIC_CONTACT_API_URL }}", health)

    def test_focused_rollback_tests_run_in_ci_and_local_precheck(self) -> None:
        ci_source = PR_WORKFLOW.read_text(encoding="utf-8")
        precheck_source = PRECHECK.read_text(encoding="utf-8")

        self.assertIn("name: Rollback safety tests", ci_source)
        self.assertIn("run: python3 tests/test_rollback_safety.py", ci_source)
        self.assertIn("python3 tests/test_rollback_safety.py", precheck_source)


if __name__ == "__main__":
    unittest.main(verbosity=2)
