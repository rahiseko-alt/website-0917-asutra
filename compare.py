from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).parent / 'evidence'
for label, left, right in [
    ('desktop', 'source-desktop.png', 'implementation-desktop.png'),
    ('mobile', 'source-mobile.png', 'implementation-mobile.png'),
    ('detail-mobile', 'source-detail-mobile.png', 'implementation-detail-mobile.png'),
]:
    a,b = Image.open(root/left).convert('RGB'),Image.open(root/right).convert('RGB')
    if a.size != b.size:
        b = ImageOps.contain(b,a.size)
    canvas=Image.new('RGB',(a.width+b.width+24,max(a.height,b.height)+32),'#222222')
    canvas.paste(a,(0,32));canvas.paste(b,(a.width+24,32))
    draw=ImageDraw.Draw(canvas);draw.text((10,10),'REFERENCE',fill='white');draw.text((a.width+34,10),'IMPLEMENTATION / DEMO ASSETS',fill='white')
    canvas.save(root/f'comparison-{label}.png')
    print(label,a.size,b.size)
