#!/usr/bin/env python3
"""
Script pour créer les icônes PWA optimisées pour iOS
Utilise PIL pour générer les icônes à partir du SVG
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_visio_icon(size, output_path):
    """Crée une icône Visio avec la taille spécifiée"""
    
    # Créer une image avec fond dégradé simulé
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Dessiner le fond avec dégradé simulé (rouge Visio)
    for y in range(size):
        # Dégradé de rouge
        red_top = 230  # #e63946 -> 230, 57, 70
        red_bottom = 193  # #c1121f -> 193, 18, 31
        
        current_red = int(red_top - (red_top - red_bottom) * (y / size))
        color = (current_red, 57 - int(39 * (y / size)), 70 - int(39 * (y / size)))
        
        draw.rectangle([(0, y), (size, y + 1)], fill=color)
    
    # Arrondir les coins (simuler border-radius)
    corner_radius = int(size * 0.18)  # 18% comme dans le SVG
    
    # Masque pour les coins arrondis
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (size, size)], corner_radius, fill=255)
    
    # Appliquer le masque
    img.putalpha(mask)
    
    # Dessiner le "V"
    # Calculer la taille de police basée sur la taille de l'image
    font_size = int(size * 0.68)  # 68% de la taille de l'image
    
    try:
        # Essayer d'utiliser une police système
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("Arial Black.ttf", font_size)
        except:
            # Police par défaut si aucune police système trouvée
            font = ImageFont.load_default()
    
    # Position du texte (centré)
    text = "V"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - int(size * 0.05)  # Légèrement vers le haut
    
    # Dessiner le V en blanc avec une ombre légère
    # Ombre
    draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, 100))
    # Texte principal
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    
    # Sauvegarder
    img.save(output_path, "PNG", optimize=True)
    print(f"✅ Créé {output_path} ({size}x{size})")

def main():
    """Génère toutes les icônes PWA nécessaires"""
    
    output_dir = "c:\\Users\\ndiay\\Desktop\\visio\\visio_frontend\\public"
    
    # Tailles d'icônes pour PWA et iOS
    sizes = [
        (16, "favicon-16x16.png"),
        (32, "favicon-32x32.png"),
        (57, "apple-icon-57x57.png"),
        (60, "apple-icon-60x60.png"),
        (72, "apple-icon-72x72.png"),
        (76, "apple-icon-76x76.png"),
        (114, "apple-icon-114x114.png"),
        (120, "apple-icon-120x120.png"),
        (144, "apple-icon-144x144.png"),
        (152, "apple-icon-152x152.png"),
        (180, "apple-icon-180x180.png"),
        (192, "logo192.png"),
        (512, "logo512.png"),
    ]
    
    print("🎨 Génération des icônes PWA Visio...")
    
    for size, filename in sizes:
        output_path = os.path.join(output_dir, filename)
        create_visio_icon(size, output_path)
    
    print("\n🎉 Toutes les icônes ont été générées avec succès!")
    print("\nPour une meilleure qualité, vous pouvez:")
    print("1. Utiliser un éditeur graphique professionnel (Photoshop, GIMP)")
    print("2. Partir du fichier SVG amélioré")
    print("3. Exporter aux tailles requises avec antialiasing")

if __name__ == "__main__":
    main()