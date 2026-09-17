from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).parent
source = root.parent / 'audit-2026-09-16'
for name, reference, current in [
    ('profile', '04-reference-profile', 'profile'),
    ('hover', '11-reference-full-hover-move', 'full-hover'),
    ('gallery', '01-reference-idle', 'gallery'),
    ('detail', '06-reference-project-opening', 'detail-final'),
]:
    out = Image.new('RGB', (2560, 752), '#151515')
    d = ImageDraw.Draw(out)
    d.text((20,10),'REFERENCE',fill='white')
    d.text((1300,10),'REVISED DEMO',fill='white')
    out.paste(Image.open(source / f'{reference}.png').convert('RGB'), (0,32))
    out.paste(Image.open(root / f'{current}.png').convert('RGB'), (1280,32))
    out.save(root / f'compare-{name}.png')
