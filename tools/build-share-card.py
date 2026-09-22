"""Rebuild share-card.jpg from the studio master mark.

    python3 tools/build-share-card.py <master.png> <fonts-dir> [out.jpg]

<master.png> is heartstrings-mark-MASTER-1254.png from the studio's Drive (Misc
Graphics) — never an already-downscaled copy. <fonts-dir> holds
LibreCaslonDisplay.ttf and DMSans-Bold.ttf, the same two faces the page loads
from Google Fonts.

The card is 1200x630 (what Facebook, iMessage and Twitter crop to) on the Story
Room's dark walnut ground — the main site's shell — using the palette tokens
from styles.css. This is a
one-off tool, not a build step: the site itself still serves as plain static
files.
"""
import sys

from PIL import Image, ImageDraw, ImageFont

MASTER   = sys.argv[1] if len(sys.argv) > 1 else 'heartstrings-mark-MASTER-1254.png'
FONT_DIR = sys.argv[2].rstrip('/') if len(sys.argv) > 2 else 'fonts'
OUT      = sys.argv[3] if len(sys.argv) > 3 else 'share-card.jpg'

W, H      = 1200, 630
GROUND    = (39,  28,  22)    # --cream  #271c16 (the page ground)
INK       = (255, 241, 220)   # --ink    #fff1dc
AMBER     = (240, 184, 111)   # --rose   #f0b86f
AMBER_PAL = (242, 201, 142)   # --rose-deep #f2c98e
GRAD      = [(149, 101, 54), (201, 143, 79), (240, 184, 111)]  # --grad stops

caslon = lambda s: ImageFont.truetype(FONT_DIR + '/LibreCaslonDisplay.ttf', s)
sans   = lambda s: ImageFont.truetype(FONT_DIR + '/DMSans-Bold.ttf', s)

card = Image.new('RGB', (W, H), GROUND)

# The page's radial warmth at the top, so the card and the page share a ground.
glow = Image.new('L', (W, H), 0)
gd = ImageDraw.Draw(glow)
for i in range(120, 0, -1):
    r = i * 6
    gd.ellipse([W//2 - r, -140 - r, W//2 + r, -140 + r], fill=int(26 * (1 - i / 120)))
card.paste(Image.new('RGB', (W, H), AMBER), (0, 0), glow)

draw = ImageDraw.Draw(card)

# --- the mark, cut from the master exactly as logo.png is -------------------
src = Image.open(MASTER).convert('RGBA')
bbox = src.getchannel('A').point(lambda v: 255 if v >= 12 else 0).getbbox()
mark = src.crop(bbox)
mw = 210
mark = mark.resize((mw, round(mark.height * mw / mark.width)), Image.LANCZOS)
mark_y = 74
card.paste(mark, ((W - mark.width) // 2, mark_y), mark)

y = mark_y + mark.height + 34

def centered(text, font, fill, y, tracking=0):
    if tracking:
        widths = [draw.textlength(c, font=font) for c in text]
        total = sum(widths) + tracking * (len(text) - 1)
        x = (W - total) / 2
        for c, cw in zip(text, widths):
            draw.text((x, y), c, font=font, fill=fill)
            x += cw + tracking
    else:
        draw.text((W / 2, y), text, font=font, fill=fill, anchor='ma')

centered('Heartstrings Studio', caslon(78), INK, y)
y += 104

centered('THE STORY ROOM', sans(25), AMBER, y, tracking=9)
y += 58

# the site's --grad hairline
bar_w, bar_h = 300, 2
for i in range(bar_w):
    t = i / (bar_w - 1)
    if t < 0.55:
        a, b, u = GRAD[0], GRAD[1], t / 0.55
    else:
        a, b, u = GRAD[1], GRAD[2], (t - 0.55) / 0.45
    draw.rectangle([(W - bar_w) // 2 + i, y, (W - bar_w) // 2 + i, y + bar_h],
                   fill=tuple(round(a[k] + (b[k] - a[k]) * u) for k in range(3)))
y += 46

centered('Every song starts with a story.', caslon(40), AMBER_PAL, y)

card.save(OUT, quality=92, optimize=True, progressive=True)
print('wrote', OUT, card.size)
