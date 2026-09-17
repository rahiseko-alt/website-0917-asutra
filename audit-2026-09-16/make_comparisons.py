from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).parent
for key, left, right in [
    ('comparison-profile', '04-reference-profile', '04-demo-profile'),
    ('comparison-hover', '11-reference-full-hover-move', '10-demo-full-hover'),
    ('comparison-gallery', '01-reference-idle', '01-demo-idle'),
    ('comparison-detail', '07-reference-project-scroll', '07-demo-project-scroll'),
]:
    out = Image.new('RGB', (2560, 776), '#171717')
    draw = ImageDraw.Draw(out)
    draw.text((24, 20), 'REFERENCE — Jesper Landberg', fill='white')
    draw.text((1304, 20), 'CURRENT PROTOTYPE', fill='white')
    out.paste(Image.open(root / (left + '.png')).convert('RGB'), (0, 56))
    out.paste(Image.open(root / (right + '.png')).convert('RGB'), (1280, 56))
    out.save(root / (key + '.png'))
