#!/usr/bin/env python3
"""Behavior and workflow-contract tests for EC-ROLLBACK-1 and EC-HEALTH-1."""

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
ROUTE_HEALTHCHECK = ".github/scripts/healthcheck.sh"
WORKFLOW = REPO_ROOT / ".github/workflows/rollback.yml"
PRODUCTION_WORKFLOW = REPO_ROOT / ".github/workflows/deploy-production.yml"
PR_WORKFLOW = REPO_ROOT / ".github/workflows/pr-validation.yml"
PRECHECK = REPO_ROOT / "scripts/precheck.sh"
EXPECTED_API_URL = "https://contact.example.test"
ARTIFACT_NAME = "rollback-static-export-${{ github.run_id }}"
PUBLIC_INPUT_PATTERN = re.compile(r"NEXT_PUBLIC_[A-Z0-9_]+")
SUPPLIED_INPUT_PATTERN = re.compile(r"(NEXT_PUBLIC_[A-Z0-9_]+): \$\{\{ vars\.")
BASH = shutil.which("bash") or "bash"

# Models the rollback target as it looked before the contact-parity gates
# existed: it accepts any export directory and never asserts the API URL.
# A rollback to such a ref must not be able to supply its own checker.
STALE_TARGET_EXPORT_CHECKER = """#!/usr/bin/env bash
set -euo pipefail
EXPORT_DIR="${1:-out}"
[ -d "$EXPORT_DIR" ] || exit 1
echo "stale target checker: export directory present"
"""


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
        # The scripts emit UTF-8 (✅/❌); decoding with the Windows locale
        # (cp1252) kills the reader thread on a failing route's ❌ and
        # yields stdout=None.
        encoding="utf-8",
        errors="replace",
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
        # The about fixture carries the body-unique marker healthcheck.sh
        # asserts (EC-HEALTH-1); the real page string lives in
        # src/app/about/page.tsx.
        "/about": "<h1>About</h1><p>produced over 300,000 activation codes</p>",
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
def serve_site(asset_body: str, routes: dict[str, str] | None = None):
    handler_attrs: dict[str, object] = {"asset_body": asset_body}
    if routes is not None:
        handler_attrs["route_bodies"] = routes
    handler = type("ConfiguredSiteHandler", (SiteHandler,), handler_attrs)
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


def production_supplied_build_inputs() -> set[str]:
    """Public build inputs production's build job feeds from repository vars.

    Production is the authority on what a rollback rebuild must also supply.
    Deriving the set rather than hard-coding it means a new NEXT_PUBLIC_*
    input production grows fails this contract until rollback supplies it.
    """
    production_job = workflow_job(
        PRODUCTION_WORKFLOW.read_text(encoding="utf-8"), "build"
    )
    return set(SUPPLIED_INPUT_PATTERN.findall(production_job))


def source_public_inputs_without_defaults() -> set[str]:
    """NEXT_PUBLIC_* the bundle reads with no usable in-source default.

    An input with a non-empty literal fallback bakes the same value whoever
    builds it, so it needs no workflow wiring. One without a fallback (or
    with an empty-string one, like the contact URL) is only correct when the
    build supplies it, which makes it a required input for rollback too.
    """
    names: set[str] = set()
    for source_file in (REPO_ROOT / "src").rglob("*.ts*"):
        text = source_file.read_text(encoding="utf-8")
        for name in PUBLIC_INPUT_PATTERN.findall(text):
            defaulted = re.search(
                rf"process\.env\.{re.escape(name)}\s*(?:\?\?|\|\|)\s*['\"][^'\"]+['\"]",
                text,
            )
            if not defaulted:
                names.add(name)
    return names


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


class AboutRouteMarkerTests(unittest.TestCase):
    """EC-HEALTH-1: the /about marker must come from the about body.

    The pre-fix marker matched nav chrome ("About" link, career copy) that
    renders on every page, so a CloudFront index-fallback serving the home
    shell at /about false-passed. The marker is now a string unique to the
    about page body.
    """

    # What CloudFront's index-fallback serves at /about: the home shell,
    # nav/header/footer chrome included, with HTTP 200.
    HOME_SHELL = (
        '<html><body><header><nav>'
        '<a href="/">Eric Caskey</a>'
        '<a href="/about">About</a>'
        '<a href="/work">Work</a>'
        '<a href="/writing">Writing</a>'
        '<a href="/contact">Contact</a>'
        "</nav></header>"
        "<h1>Eric Caskey</h1>"
        "<p>Platform engineer; 15 years of infrastructure career.</p>"
        '<footer><a href="/about">About</a></footer>'
        "</body></html>"
    )

    def test_home_shell_served_at_about_fails_the_about_check(self) -> None:
        # Fixture sanity: the shell must carry the nav words the old weak
        # marker matched, otherwise this test proves nothing.
        self.assertRegex(self.HOME_SHELL, r"(?i)(about|career)")
        self.assertNotRegex(self.HOME_SHELL, r"(?i)activation codes")

        routes = dict(SiteHandler.route_bodies)
        routes["/about"] = self.HOME_SHELL
        with serve_site('const api = "https://wrong.example.test";', routes=routes) as base_url:
            result = run_bash(ROUTE_HEALTHCHECK, base_url)

        self.assertNotEqual(
            result.returncode,
            0,
            "nav chrome alone must not satisfy the /about marker",
        )
        self.assertIn("/about : HTTP 200 but body did not match", result.stdout)

    def test_real_about_body_passes_the_about_check(self) -> None:
        with serve_site('const api = "https://wrong.example.test";') as base_url:
            result = run_bash(ROUTE_HEALTHCHECK, base_url)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Healthcheck passed: 5/5", result.stdout)


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

    def test_deploy_downloads_only_this_runs_verified_artifact(self) -> None:
        """Provenance: the deployed bytes are the ones this run built and verified."""
        build_job = workflow_job(self.source, "build")
        deploy_job = workflow_job(self.source, "deploy")
        _, upload = workflow_step(build_job, "Upload verified rollback artifact")
        _, download = workflow_step(deploy_job, "Download verified rollback artifact")

        self.assertIn(f"name: {ARTIFACT_NAME}", upload)
        self.assertIn(f"name: {ARTIFACT_NAME}", download)
        # Cross-run artifact download requires run-id (plus a token/repository).
        # Any of them would let the deploy job pull bytes no gate in this run
        # ever verified, so none may appear.
        for escape_hatch in ("run-id:", "github-token:", "repository:"):
            self.assertNotIn(
                escape_hatch,
                download,
                f"download step must stay bound to this run (found {escape_hatch})",
            )

    def test_focused_rollback_tests_run_in_ci_and_local_precheck(self) -> None:
        ci_source = PR_WORKFLOW.read_text(encoding="utf-8")
        precheck_source = PRECHECK.read_text(encoding="utf-8")

        self.assertIn("name: Rollback safety tests", ci_source)
        self.assertIn("run: python3 tests/test_rollback_safety.py", ci_source)
        self.assertIn("python3 tests/test_rollback_safety.py", precheck_source)


class BuildInputParityTests(unittest.TestCase):
    """A rollback rebuild must get every public build input production gets."""

    def test_every_public_input_the_bundle_needs_is_supplied_by_production(self) -> None:
        """No required input may depend on the ambient build environment."""
        required = production_supplied_build_inputs()
        unwired = source_public_inputs_without_defaults() - required
        self.assertEqual(
            unwired,
            set(),
            f"{sorted(unwired)} are read with no usable default and no build wiring; "
            "production and rollback would bake different values",
        )

    def test_rollback_rebuild_supplies_every_production_public_build_input(self) -> None:
        required = production_supplied_build_inputs()
        self.assertIn(
            "NEXT_PUBLIC_CONTACT_API_URL",
            required,
            "contact API URL must remain a derived production build input",
        )

        source = WORKFLOW.read_text(encoding="utf-8")
        build_job = workflow_job(source, "build")
        deploy_job = workflow_job(source, "deploy")
        health_job = workflow_job(source, "healthcheck")
        _, assert_step = workflow_step(build_job, "Assert contact API URL is configured")
        _, build_step = workflow_step(build_job, "Build rollback target")
        _, verify_step = workflow_step(
            build_job, "Verify contact API URL baked into export"
        )
        _, reverify_step = workflow_step(
            deploy_job, "Reverify downloaded rollback artifact"
        )
        _, health_step = workflow_step(health_job, "Run rollback healthcheck")

        gates = (
            ("assert", assert_step),
            ("build", build_step),
            ("build verify", verify_step),
            ("deploy reverify", reverify_step),
            ("healthcheck", health_step),
        )
        for name in sorted(required):
            supplied = f"{name}: ${{{{ vars.{name} }}}}"
            for label, block in gates:
                self.assertIn(
                    supplied,
                    block,
                    f"rollback {label} step must supply {name} the way production does",
                )
            self.assertIn(
                f'-z "${name}"',
                assert_step,
                f"rollback must refuse an empty {name} before rebuilding",
            )


class OldCheckerTests(unittest.TestCase):
    """The rollback target must never supply the gate that judges it."""

    def test_stale_target_export_checker_accepts_what_control_checker_refuses(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temp:
            temp_path = Path(temp)
            export_dir = write_export(temp_path, 'const api = "https://wrong.example.test";')
            bin_dir, aws_log = install_aws_stub(temp_path)
            stale_checker = temp_path / "stale-verify-contact-export.sh"
            stale_checker.write_text(STALE_TARGET_EXPORT_CHECKER, encoding="utf-8")
            env = {
                "NEXT_PUBLIC_CONTACT_API_URL": EXPECTED_API_URL,
                "AWS_CALL_LOG": str(aws_log),
            }

            stale = run_bash(
                stale_checker.as_posix(),
                export_dir.as_posix(),
                env=env,
                extra_path=bin_dir,
            )
            control = run_bash(
                EXPORT_CHECKER, export_dir.as_posix(), env=env, extra_path=bin_dir
            )

            self.assertEqual(
                stale.returncode,
                0,
                "fixture is only meaningful if the stale target checker passes",
            )
            self.assertNotEqual(
                control.returncode,
                0,
                "the dispatched revision's checker must refuse the mis-baked export",
            )
            self.assertIn("does not contain", control.stdout + control.stderr)
            self.assertFalse(aws_log.exists(), "neither checker may invoke AWS")

    def test_stale_target_health_checker_accepts_what_control_health_refuses(
        self,
    ) -> None:
        # The pre-hardening rollback gate was healthcheck.sh alone: five routes,
        # no contact-config assertion. It is the real old checker, not a mock.
        with serve_site('const api = "https://wrong.example.test";') as base_url:
            stale = run_bash(ROUTE_HEALTHCHECK, base_url)
            control = run_bash(
                ROLLBACK_HEALTHCHECK,
                base_url,
                env={"NEXT_PUBLIC_CONTACT_API_URL": EXPECTED_API_URL},
            )

        self.assertEqual(
            stale.returncode,
            0,
            "the old routes-only gate is what silently passed a mis-configured rollback",
        )
        self.assertIn("Healthcheck passed: 5/5", stale.stdout)
        self.assertNotEqual(
            control.returncode,
            0,
            "the dispatched revision's health gate must catch the live config mismatch",
        )

    def test_workflow_runs_every_checker_from_the_control_plane(self) -> None:
        source = WORKFLOW.read_text(encoding="utf-8")
        self.assertNotIn("rollback-target/.github", source)
        for job_name in ("build", "deploy", "healthcheck"):
            job = workflow_job(source, job_name)
            invocations = re.findall(r"bash (\S+)", job)
            for script in invocations:
                self.assertTrue(
                    script.startswith("rollback-control/.github/scripts/"),
                    f"{job_name} runs {script} outside the dispatched revision",
                )


if __name__ == "__main__":
    unittest.main(verbosity=2)
