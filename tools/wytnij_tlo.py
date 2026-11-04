r"""Wycina tlo ze zdjec norigae i zapisuje dane potrzebne panelowi na stronie.

Uzycie: .venv\Scripts\python.exe _agent\narzedzia\wytnij_tlo.py <katalog wyjscia> <zdjecie> [<zdjecie> ...]
Wynik na zdjecie: <slug>.png (wzorzec), <slug>.webp (na strone) i wpis w wyciecia.json:
wymiary, kolor nici (tlo panelu), os wahadla i wezel (wspolna skala i srodek w panelu).
Z --plain (przedmiot bez sznurka i wezla, np. spinka): samo wyciecie do <nazwa zdjecia>.png.
"""
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove

CORD = 1.45  # cord every norigae gets above its knot, in knot widths


def measure(alpha):
    """Knot width, its row, the row where it starts, and the cord's centre line.

    ponytail: naive heuristic, the knot is the first bulge at least twice as wide
    as the cord. Holds for a norigae hanging on its cord; anything else needs a
    hand-set value in wyciecia.json.
    """
    solid = alpha > 0
    first = solid.argmax(1)
    last = solid.shape[1] - 1 - solid[:, ::-1].argmax(1)
    span = np.where(solid.any(1), last - first + 1, 0)
    span = np.median(np.lib.stride_tricks.sliding_window_view(np.pad(span, 4, mode="edge"), 9), axis=1)
    cord = np.median(span[:40])
    knot_y = 0
    for y, width in enumerate(span):
        if width > span[knot_y]:
            knot_y = y
        if span[knot_y] > 2 * cord and width < 0.85 * span[knot_y]:
            break
    knot = int(span[knot_y])
    # the knot is about as tall as it is wide: this row is safely above its loops
    return knot, knot_y, max(1, knot_y - round(0.6 * knot)), (first + last) / 2


# a hairpin has no cord and no knot: nothing to measure, straighten or stretch
plain = "--plain" in sys.argv
if plain:
    sys.argv.remove("--plain")
out_dir = Path(sys.argv[1])
out_dir.mkdir(parents=True, exist_ok=True)
meta_path = out_dir / "wyciecia.json"
meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
# birefnet keeps the thin cords; isnet-general-use dropped them
session = new_session("birefnet-general-lite")

for photo in map(Path, sys.argv[2:]):
    # Norigae_Pez_rojo__171Bhg.jpg -> pez-rojo
    slug = re.sub(r"__.*$", "", photo.stem).removeprefix("Norigae_").lower().replace("_", "-")
    cutout = remove(Image.open(photo).convert("RGB"), session=session)
    # the model leaves the inside at 235 to 254: make it opaque, drop the faint halo
    alpha = cutout.getchannel("A").point(lambda a: 0 if a < 16 else 255 if a >= 235 else a)
    cutout.putalpha(alpha)
    cutout = cutout.crop(alpha.getbbox())
    if plain:
        cutout.save(out_dir / f"{slug}.png")
        print(slug, cutout.size)
        continue

    # a hanging cord is plumb, so a leaning cord means the camera was tilted: undo it
    _, knot_y, _, centre = measure(np.asarray(cutout)[..., 3])
    rows = np.arange(int(knot_y * 0.6))
    lean = -math.degrees(math.atan(np.polyfit(rows, centre[rows], 1)[0]))
    if abs(lean) > 1:
        cutout = cutout.rotate(lean, resample=Image.BICUBIC, expand=True)
        cutout = cutout.crop(cutout.getchannel("A").getbbox())

    # a photo framed tight leaves too little cord to centre the piece in a panel: stretch it
    # ponytail: stretching softens the braid; past about 1.5 ask for a wider photo instead
    knot, _, knot_top, _ = measure(np.asarray(cutout)[..., 3])
    stretch = max(1, CORD * knot / knot_top)
    if stretch > 1:
        cord = cutout.crop((0, 0, cutout.width, knot_top)).resize((cutout.width, round(knot_top * stretch)), Image.LANCZOS)
        rest = cutout.crop((0, knot_top, cutout.width, cutout.height))
        cutout = Image.new("RGBA", (cutout.width, cord.height + rest.height))
        cutout.paste(cord, (0, 0))
        cutout.paste(rest, (0, cord.height))

    pixels = np.asarray(cutout).astype(int)
    rgb, opaque = pixels[..., :3], pixels[..., 3] == 255
    knot, knot_y, knot_top, centre = measure(pixels[..., 3])
    # cord and knot carry the colour the variant is named after
    top = slice(0, knot_y)
    vivid = opaque[top] & (rgb[top].max(-1) - rgb[top].min(-1) > 40)
    thread = rgb[top][vivid if vivid.any() else opaque[top]].mean(0).round().astype(int)

    cutout.save(out_dir / f"{slug}.png")
    cutout.save(out_dir / f"{slug}.webp", quality=90)
    meta[slug] = {
        "w": cutout.width,
        "h": cutout.height,
        "thread": "#%02X%02X%02X" % tuple(thread),
        "pivot": round(float(centre[:8].mean()) / cutout.width, 3),
        "knot": knot,
        "knot_top": knot_top,
        "lean": round(lean, 1),
        "cord_stretch": round(stretch, 2),
    }
    print(slug, meta[slug])

if meta:
    meta_path.write_text(json.dumps(meta, indent=1))
