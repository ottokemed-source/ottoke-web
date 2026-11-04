r"""Cuts the background out of the photos the clients upload in the console, and makes share images.

Run by .github/workflows/recortar.yml after a save in Pages CMS, or by hand:
    python tools/procesar_fotos.py
For each norigae or hairpin whose "foto_recorte" is new (not the one in "recortado"):
- norigae: tools/wytnij_tlo.py cuts it, the PNG goes to src/assets/norigae/<slug>.png and the
  numbers the hanging card needs (thread, cutout) go into its JSON;
- hairpin: wytnij_tlo.py --plain, the PNG goes to src/assets/horquillas/<slug>.png;
- both: a 1200 x 630 share image in public/og/, the recipe of _agent/narzedzia/obrazy_strony.py.
Prints what it did; exits 0 when there was nothing to do.
"""
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

site = Path(__file__).resolve().parents[1]
cutter = site / "tools" / "wytnij_tlo.py"
HUESO = (0xF4, 0xF1, 0xE8)
MEDIA = (site / "src" / "assets" / "fotos").resolve()
# a phone photo is up to about 50 MP; anything bigger is refused before it is decoded
# (decompression bomb), and every photo is cut at most 2200 px long: enough for the card,
# light on the runner's memory, and the background model cuts it better (2026-11-03)
MAX_PIXELS = 60_000_000
LONG_SIDE = 2200
Image.MAX_IMAGE_PIXELS = MAX_PIXELS


def tint(thread, share=0.16):
    rgb = [int(thread[i : i + 2], 16) for i in (1, 3, 5)]
    return tuple(round(base + (value - base) * share) for value, base in zip(rgb, HUESO))


def share_image(piece, thread, out):
    card = Image.new("RGB", (1200, 630), tint(thread))
    small = piece.copy()
    small.thumbnail((1200, 590), Image.LANCZOS)
    card.paste(small, ((1200 - small.width) // 2, 20), small)
    card.save(out, quality=86)


def thread_of(piece):
    """The average colour of the opaque, vivid pixels: the tint of a hairpin's sheet."""
    pixels = [p for p in piece.convert("RGBA").resize((64, 64)).getdata() if p[3] == 255]
    vivid = [p for p in pixels if max(p[:3]) - min(p[:3]) > 30] or pixels
    return "#%02X%02X%02X" % tuple(round(sum(p[i] for p in vivid) / len(vivid)) for i in range(3))


def cut(photo, slug, plain):
    """Runs wytnij_tlo.py on a copy named so that it derives `slug`; returns (png, numbers)."""
    work = Path(tempfile.mkdtemp())
    named = work / f"Norigae_{slug.replace('-', '_')}.png"
    with Image.open(photo) as source:
        if source.width * source.height > MAX_PIXELS:
            raise ValueError(f"foto demasiado grande: {source.width} x {source.height}")
        # phones store the turn in EXIF: apply it, or the norigae hangs sideways
        small = ImageOps.exif_transpose(source).convert("RGB")
    small.thumbnail((LONG_SIDE, LONG_SIDE), Image.LANCZOS)
    small.save(named)
    args = [sys.executable, str(cutter), str(work / "out"), str(named)]
    if plain:
        args.insert(2, "--plain")
    subprocess.run(args, check=True)
    meta_path = work / "out" / "wyciecia.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    return work / "out" / f"{slug}.png", meta.get(slug)


def inside_media(source):
    """The upload as a path inside src/assets/fotos, or None: the console writes only there."""
    path = (site / source).resolve()
    return path if path.is_file() and path.is_relative_to(MEDIA) else None


changed, failed = 0, []
for kind in ("norigae", "horquillas"):
    for entry in sorted((site / "src" / "content" / kind).glob("*.json")):
        data = json.loads(entry.read_text(encoding="utf-8"))
        source = data.get("foto_recorte")
        if not source or source == data.get("recortado"):
            continue
        slug = entry.stem
        photo = inside_media(source)
        if not photo:
            failed.append(f"{kind}/{slug}: la foto no está en src/assets/fotos: {source}")
            continue
        # one bad photo must not hold back the others: report it and go on
        try:
            png, numbers = cut(photo, slug, plain=kind == "horquillas")
            piece = Image.open(png)
            if kind == "norigae" and not numbers:
                raise ValueError("no se encontró el nudo en la foto")
        except Exception as error:  # noqa: BLE001, any failure of one photo is reported the same way
            failed.append(f"{kind}/{slug}: {error}")
            continue
        if kind == "norigae":
            shutil.copy(png, site / "src" / "assets" / "norigae" / f"{slug}.png")
            data["thread"] = numbers["thread"]
            data["cutout"] = {k: numbers[v] for k, v in (("w", "w"), ("h", "h"), ("knot", "knot"), ("knotTop", "knot_top"), ("pivot", "pivot"))}
            share_image(piece, data["thread"], site / "public" / "og" / f"{slug}.jpg")
        else:
            target = site / "src" / "assets" / "horquillas" / f"{slug}.png"
            shutil.copy(png, target)
            data["cutout"] = target.relative_to(site).as_posix()
            data["thread"] = thread_of(piece)
            share_image(piece, data["thread"], site / "public" / "og" / f"horquilla-{slug}.jpg")
        data["recortado"] = source
        entry.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        changed += 1
        print(f"{kind}/{slug}: recortado")

print(f"{changed} recortes" if changed else "nada que recortar")
for line in failed:
    print(line, file=sys.stderr)
# the cuts that worked are saved by the workflow even when another failed; the run is still
# marked failed, so Maks gets GitHub's e-mail about it
sys.exit(1 if failed else 0)
