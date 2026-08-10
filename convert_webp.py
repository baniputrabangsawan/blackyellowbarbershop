from PIL import Image

input_path = "public/brand/blackyellow-logo.webp"
output_path = "public/brand/blackyellow-logo.png"

try:
    img = Image.open(input_path)
    img.save(output_path, "PNG")
    print(f"Successfully converted to {output_path}")
except Exception as e:
    print(f"Error: {e}")
