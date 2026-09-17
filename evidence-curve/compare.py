from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).parent
out=Image.new('RGB',(2560,752),'#141414')
draw=ImageDraw.Draw(out)
draw.text((20,10),'REFERENCE / FIXED CURVE FIELD',fill='white')
draw.text((1300,10),'REVISED / OPPOSING UPPER AND LOWER EDGES',fill='white')
out.paste(Image.open(root/'reference.png').convert('RGB'),(0,32))
out.paste(Image.open(root/'revised-rest.png').convert('RGB'),(1280,32))
out.save(root/'comparison.png')
