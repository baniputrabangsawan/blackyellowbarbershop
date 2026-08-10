import base64
import os
from PIL import Image
from io import BytesIO

svg_path = "public/brand/black-yellow-logo.svg"
png_path = "public/brand/favicon.png"

with open(svg_path, "r") as f:
    content = f.read()

start = content.find("base64,") + 7
end = content.find('"', start)
b64_data = content[start:end].replace('\n', '').replace('\r', '')

img_data = base64.b64decode(b64_data)
img = Image.open(BytesIO(img_data))

bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

width, height = img.size
max_dim = max(width, height)
square_img = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
offset = ((max_dim - width) // 2, (max_dim - height) // 2)
square_img.paste(img, offset)

square_img.save(png_path)
print(f"Saved cropped icon to {png_path} with size {max_dim}x{max_dim}")
