"""Turn ImageGen's light checkerboard preview into true PNG transparency.

The generator occasionally returns a RGB PNG even when transparent output was
requested. This keeps dark metallic sprite detail intact and only keys out the
near-neutral, near-white checkerboard background.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def normalize(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, _ = pixels[x, y]
            neutral = max(red, green, blue) - min(red, green, blue) < 11
            if neutral and min(red, green, blue) >= 216:
                pixels[x, y] = (red, green, blue, 0)
    image.save(path, optimize=True)


if __name__ == "__main__":
    for source in sys.argv[1:]:
        normalize(Path(source))
