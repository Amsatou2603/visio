#!/usr/bin/env python
"""
Script pour créer les images des produits en pointant vers Cloudinary
À exécuter après avoir uploadé les images sur Cloudinary
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Product, ProductImage

# Mapping des produits vers leurs images Cloudinary
PRODUCT_IMAGES = {
    'iphone-14-pro-max-256go': 'products/Apple_iPhone_14.jpg',
    'samsung-galaxy-s24-ultra': 'products/Galaxy_s24_ultra.jpg',
    'tecno-spark-20-pro': 'products/Techno_Spark_20.jpg',
    'infinix-hot-40-pro': 'products/Infinix_Hot_40.jpg',
    'samsung-galaxy-a55-5g': 'products/Samsung_Galaxy_A55.jpg',
    'ipad-pro-12-9-m2-256go-wifi': 'products/ipad_pro_129.jpg',
    'samsung-galaxy-tab-s9-fe': 'products/samsung_galaxy_a9.jpg',
    'samsung-25w-chargeur-rapide-usb-c': 'products/Samsung_Chargeur_45W.jpg',
    'airpods-pro-2eme-generation': 'products/Apple_Airpods_pro_2.jpg',
    'iphone-13-128go-reconditionne': 'products/iphone_13.jpg',
    'samsung-galaxy-z-flip-5': 'products/Samsung_Galaxy_Z_Flip5.jpg',
    'tecno-camon-20-premier': 'products/techno_20.jpg',
    'infinix-zero-30-5g': 'products/Infinix_not_40_pro.jpg',
    'apple-magsafe-charger': 'products/_MagSafe.jpg',
    'samsung-galaxy-buds-2-pro': 'products/buds_2_pro.jpg',
    'power-bank-20000mah-tecno': 'products/Power_Bank_20000mAh.jpg',
    'iphone-15-128go': 'products/Iphone_15_plus.jpg',
    'samsung-galaxy-a15': 'products/Samsung_Galaxy_A15.jpg',
    'ecouteurs-bluetooth-infinix': 'products/infinix_buds.jpg',
    'cable-usb-c-samsung': 'products/cable_usb-c.jpg',
}

def create_product_images():
    """Crée les images pour chaque produit"""
    print("="*70)
    print("🖼️  CRÉATION DES IMAGES PRODUITS")
    print("="*70)
    
    created = 0
    skipped = 0
    errors = 0
    
    for slug, image_path in PRODUCT_IMAGES.items():
        try:
            # Trouver le produit
            product = Product.objects.get(slug=slug)
            
            # Vérifier si une image existe déjà
            if ProductImage.objects.filter(product=product).exists():
                print(f"ℹ️  {product.name} - Image existe déjà")
                skipped += 1
                continue
            
            # Créer l'image
            ProductImage.objects.create(
                product=product,
                image=image_path,
                alt_text=product.name,
                is_primary=True,
                order=0
            )
            print(f"✅ {product.name} - Image créée")
            created += 1
            
        except Product.DoesNotExist:
            print(f"⚠️  Produit non trouvé: {slug}")
            errors += 1
        except Exception as e:
            print(f"❌ Erreur pour {slug}: {e}")
            errors += 1
    
    print("\n" + "="*70)
    print("📊 RÉSUMÉ")
    print("="*70)
    print(f"✅ Images créées: {created}")
    print(f"ℹ️  Images existantes: {skipped}")
    print(f"❌ Erreurs: {errors}")
    print("="*70 + "\n")

if __name__ == '__main__':
    try:
        create_product_images()
    except Exception as e:
        print(f"\n❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
