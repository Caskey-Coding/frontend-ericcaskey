#!/usr/bin/env python3
"""Guard for public/ assets (B-071).

Fails if any file in public/ either:
  1. exceeds 500 KB (camera originals do not belong in a static export), or
  2. carries a GPS EXIF IFD (location-privacy leak).

Stdlib only so it runs identically on dev boxes and ubuntu-latest CI
runners. The GPS check parses real EXIF structures (JPEG APP1, WebP EXIF
chunk, PNG eXIf chunk) for TIFF tag 0x8825 (GPSInfo) rather than grepping
for byte patterns, so it has no false positives on pixel data.
"""

import struct
import sys
from pathlib import Path

MAX_BYTES = 500 * 1024
GPS_IFD_TAG = 0x8825
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}


def tiff_has_gps(tiff: bytes) -> bool:
    """Walk IFD0 of a TIFF blob and report whether tag 0x8825 is present."""
    if len(tiff) < 8 or tiff[:2] not in (b"II", b"MM"):
        return False
    bo = "<" if tiff[:2] == b"II" else ">"
    try:
        ifd0 = struct.unpack(bo + "I", tiff[4:8])[0]
        count = struct.unpack(bo + "H", tiff[ifd0 : ifd0 + 2])[0]
        for i in range(count):
            entry = ifd0 + 2 + i * 12
            tag = struct.unpack(bo + "H", tiff[entry : entry + 2])[0]
            if tag == GPS_IFD_TAG:
                return True
    except struct.error:
        return False
    return False


def extract_tiff(path: Path) -> bytes:
    """Pull the EXIF TIFF blob out of a JPEG, WebP, PNG, or bare TIFF."""
    data = path.read_bytes()
    if data[:2] in (b"II", b"MM"):  # bare TIFF
        return data
    if data[:2] == b"\xff\xd8":  # JPEG: scan APP1 segments
        off = 2
        while off + 4 <= len(data) and data[off] == 0xFF:
            marker, seglen = data[off + 1], struct.unpack(">H", data[off + 2 : off + 4])[0]
            if marker == 0xE1 and data[off + 4 : off + 10] == b"Exif\x00\x00":
                return data[off + 10 : off + 2 + seglen]
            if marker == 0xDA:  # start of scan: no more metadata
                break
            off += 2 + seglen
        return b""
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":  # WebP: EXIF chunk
        off = 12
        while off + 8 <= len(data):
            fourcc = data[off : off + 4]
            size = struct.unpack("<I", data[off + 4 : off + 8])[0]
            if fourcc == b"EXIF":
                chunk = data[off + 8 : off + 8 + size]
                return chunk[6:] if chunk[:6] == b"Exif\x00\x00" else chunk
            off += 8 + size + (size & 1)
        return b""
    if data[:8] == b"\x89PNG\r\n\x1a\n":  # PNG: eXIf chunk
        off = 8
        while off + 8 <= len(data):
            size = struct.unpack(">I", data[off : off + 4])[0]
            ctype = data[off + 4 : off + 8]
            if ctype == b"eXIf":
                return data[off + 8 : off + 8 + size]
            off += 12 + size
        return b""
    return b""


def main() -> int:
    public = Path(__file__).resolve().parent.parent / "public"
    failures = []
    for path in sorted(public.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(public.parent)
        size = path.stat().st_size
        if size > MAX_BYTES:
            failures.append(f"{rel}: {size} bytes exceeds {MAX_BYTES} (500 KB) limit")
        if path.suffix.lower() in IMAGE_SUFFIXES and tiff_has_gps(extract_tiff(path)):
            failures.append(f"{rel}: carries a GPS EXIF IFD (strip metadata before committing)")
    if failures:
        print("public/ asset guard FAILED:", file=sys.stderr)
        for f in failures:
            print(f"  - {f}", file=sys.stderr)
        return 1
    print("public/ asset guard passed (size <= 500 KB, no GPS EXIF).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
