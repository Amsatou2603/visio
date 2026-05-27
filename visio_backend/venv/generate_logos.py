import os
import math
from PIL import Image, ImageDraw, ImageFont

def draw_gradient_rect(width, height, r, color1, color2):
    # Create gradient image
    gradient = Image.new('RGB', (width, height), color1)
    
    # We want a linear gradient from top-left (0,0) to bottom-right (width, height)
    r1, g1, b1 = color1
    r2, g2, b2 = color2
    
    for y in range(height):
        for x in range(width):
            # Calculate distance ratio along the diagonal
            ratio = (x * width + y * height) / (width**2 + height**2)
            ratio = max(0.0, min(1.0, ratio))
            
            r_val = int(r1 + (r2 - r1) * ratio)
            g_val = int(g1 + (g2 - g1) * ratio)
            b_val = int(b1 + (b2 - b1) * ratio)
            
            gradient.putpixel((x, y), (r_val, g_val, b_val))
            
    # Now mask with a rounded rectangle
    mask = Image.new('L', (width, height), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, width-1, height-1], radius=r, fill=255)
    
    # Apply mask
    output = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    output.paste(gradient, (0, 0), mask=mask)
    return output

def generate_logo(size, filename):
    # SVG has rx="24" on 100x100 box -> 24% radius
    radius = int(size * 0.24)
    # Colors matching the SVG favicon
    color1 = (230, 57, 70)  # #e63946
    color2 = (193, 18, 31)  # #c1121f
    
    # Draw rounded rectangle with gradient
    img = draw_gradient_rect(size, size, radius, color1, color2)
    draw = ImageDraw.Draw(img)
    
    # Draw text 'V' in center
    font_size = int(size * 0.58)
    
    # Try different font families
    font = None
    for font_name in ["Arial Black", "Arial", "Trebuchet MS", "DejaVu Sans", "Helvetica"]:
        try:
            font = ImageFont.truetype(font_name, font_size)
            break
        except IOError:
            continue
            
    if font is None:
        font = ImageFont.load_default()
        
    # Get text dimensions
    bbox = draw.textbbox((0, 0), "V", font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center text
    x = (size - text_width) / 2 - bbox[0]
    y = (size - text_height) / 2 - bbox[1] - (size * 0.02)
    
    draw.text((x, y), "V", fill=(255, 255, 255, 255), font=font)
    
    # Save image
    img.save(filename, "PNG")
    print(f"Saved {filename}")

def generate_og_image(filename):
    # 1200x630
    width = 1200
    height = 630
    
    # Draw gradient background (no rounded corners for OG image)
    # Premium dark background matching the marketplace design
    bg_color = (11, 15, 25)
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Let's paste a 220x220 logo in the center
    logo_size = 220
    logo_filename = "temp_logo.png"
    generate_logo(logo_size, logo_filename)
    logo_img = Image.open(logo_filename)
    
    # Paste in center
    logo_x = (width - logo_size) // 2
    logo_y = (height - logo_size) // 2 - 40
    img.paste(logo_img, (logo_x, logo_y), mask=logo_img)
    
    # Remove temp logo
    try:
        os.remove(logo_filename)
    except:
        pass
        
    # Add text "Visio" below the logo
    font_large = None
    for font_name in ["Arial Black", "Arial", "Trebuchet MS", "DejaVu Sans", "Helvetica"]:
        try:
            font_large = ImageFont.truetype(font_name, 56)
            break
        except IOError:
            continue
    if font_large is None:
        font_large = ImageFont.load_default()
        
    font_sub = None
    for font_name in ["Arial", "Trebuchet MS", "DejaVu Sans", "Helvetica"]:
        try:
            font_sub = ImageFont.truetype(font_name, 28)
            break
        except IOError:
            continue
    if font_sub is None:
        font_sub = ImageFont.load_default()
        
    # Draw "VISIO"
    bbox_title = draw.textbbox((0, 0), "VISIO", font=font_large)
    title_w = bbox_title[2] - bbox_title[0]
    title_x = (width - title_w) // 2 - bbox_title[0]
    title_y = logo_y + logo_size + 20
    draw.text((title_x, title_y), "VISIO", fill=(255, 255, 255), font=font_large)
    
    # Draw "Marketplace Tech Africaine"
    sub_text = "Marketplace Tech Africaine"
    bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
    sub_w = bbox_sub[2] - bbox_sub[0]
    sub_x = (width - sub_w) // 2 - bbox_sub[0]
    sub_y = title_y + 70
    draw.text((sub_x, sub_y), sub_text, fill=(156, 163, 175), font=font_sub) # gray-400
    
    img.save(filename, "PNG")
    print(f"Saved {filename}")

if __name__ == "__main__":
    import sys
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    generate_logo(192, os.path.join(out_dir, "logo192.png"))
    generate_logo(512, os.path.join(out_dir, "logo512.png"))
    generate_og_image(os.path.join(out_dir, "og-image.png"))
