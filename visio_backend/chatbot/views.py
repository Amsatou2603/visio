import os
import logging
import requests
import re
# pyrefly: ignore [missing-import]
from django.conf import settings
# pyrefly: ignore [missing-import]
from django.db.models import Q
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.permissions import AllowAny
# pyrefly: ignore [missing-import]
from products.models import Product, Category, Brand
from .models import ChatLog

logger = logging.getLogger(__name__)

class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get('message', '').strip()
        history = request.data.get('history', [])

        if not message:
            return Response(
                {"error": "Le message ne peut pas être vide."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtenir l'IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        # Contexte dynamique des produits
        active_products = Product.objects.filter(is_active=True).select_related('category', 'brand')[:30]
        products_list = []
        for p in active_products:
            stock_status = f"{p.stock} en stock" if p.stock > 0 else "Rupture de stock"
            brand_name = p.brand.name if p.brand else "Générique"
            category_name = p.category.name if p.category else "Autre"
            products_list.append(
                f"- **{p.name}** (Marque: {brand_name}, Catégorie: {category_name}) : {int(p.price)} XOF - {stock_status}"
            )
        formatted_products = "\n".join(products_list)

        # Clé API Gemini
        # La clé peut être dans settings ou os.environ
        api_key = getattr(settings, 'GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY', ''))

        reply = ""
        used_api = False

        if api_key:
            try:
                # Préparation du prompt système
                system_prompt = (
                    "Tu es VisioBot, l'assistant virtuel officiel de la plateforme e-commerce Visio.\n"
                    "Visio est une boutique d'électronique et téléphonie haut de gamme en Afrique (Sénégal).\n"
                    "Ton but est d'aider de manière courtoise, concise et précise les clients et vendeurs.\n"
                    "Tu dois répondre uniquement en Français.\n\n"
                    "Informations importantes de la boutique :\n"
                    "- Lien WhatsApp de contact client : Le bouton est disponible en bas à gauche de l'écran (Numéro : +221 77 000 00 00).\n"
                    "- Modes de paiement : PayTech (Wave, Orange Money, Free Money) ou paiement à la livraison.\n"
                    "- Rôles des utilisateurs :\n"
                    "  * Les acheteurs peuvent parcourir les produits, les ajouter au panier et commander.\n"
                    "  * Les vendeurs peuvent s'inscrire via '/register-seller' et créer leur propre boutique pour vendre.\n\n"
                    "Voici le catalogue de produits actuellement disponibles sur Visio :\n"
                    f"{formatted_products}\n\n"
                    "Règles de comportement :\n"
                    "- Réponds avec précision en te basant sur le catalogue de produits ci-dessus.\n"
                    "- Si le client demande un produit qui n'est pas dans le catalogue, réponds poliment que nous ne l'avons pas actuellement mais suggère un produit équivalent s'il y en a un.\n"
                    "- Ne parle jamais au nom d'un autre site et ne donne pas d'informations inventées.\n"
                    "- Sois toujours poli, professionnel et chaleureux.\n"
                    "- Utilise des puces et du gras pour structurer tes réponses de manière esthétique."
                )

                # Formatage de l'historique pour Gemini
                contents_list = []
                for turn in history:
                    role = turn.get('role')
                    # Valider les rôles acceptés par l'API Gemini ('user' ou 'model')
                    if role not in ['user', 'model']:
                        role = 'user'
                    contents_list.append({
                        "role": role,
                        "parts": [{"text": turn.get('text', '')}]
                    })
                
                # Ajouter le message actuel
                contents_list.append({
                    "role": "user",
                    "parts": [{"text": message}]
                })

                # Construction du payload
                payload = {
                    "contents": contents_list,
                    "system_instruction": {
                        "parts": [
                            {"text": system_prompt}
                        ]
                    },
                    "generationConfig": {
                        "temperature": 0.3,
                        "maxOutputTokens": 800
                    }
                }

                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
                response = requests.post(url, json=payload, timeout=10)

                if response.status_code == 200:
                    resp_json = response.json()
                    candidates = resp_json.get('candidates', [])
                    if candidates:
                        parts = candidates[0].get('content', {}).get('parts', [])
                        if parts:
                            reply = parts[0].get('text', '')
                            used_api = True
                else:
                    logger.error(f"Gemini API returned error status {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"Exception while calling Gemini API: {str(e)}")

        # Fallback intelligent si l'API n'a pas été utilisée ou a échoué
        if not reply:
            reply = self._get_fallback_reply(message, active_products)

        # Enregistrement du log de chat
        try:
            ChatLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                message=message,
                reply=reply,
                ip_address=ip
            )
        except Exception as e:
            logger.error(f"Failed to save ChatLog: {str(e)}")

        return Response({
            "reply": reply,
            "used_api": used_api
        }, status=status.HTTP_200_OK)

    def _get_fallback_reply(self, message, active_products):
        msg_lower = message.lower()

        # 1. Salutations
        if any(greet in msg_lower for greet in ["bonjour", "salut", "hello", "hey", "bonsoir"]):
            return (
                "Bonjour ! Je suis **VisioBot**, votre conseiller virtuel. 😊\n\n"
                "Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur :\n"
                "- Nos téléphones et accessoires disponibles 🛍️\n"
                "- Comment passer une commande 📦\n"
                "- Devenir vendeur sur la plateforme 🤝\n"
                "- Les modes de paiement acceptés 💰"
            )

        # 2. Devenir Vendeur
        if any(k in msg_lower for k in ["vendeur", "vendre", "boutique", "inscription", "partenaire"]):
            return (
                "Pour devenir vendeur sur **Visio** et ouvrir votre propre boutique en ligne, c'est très simple :\n\n"
                "1. Rendez-vous sur la page d'inscription vendeur : `/register-seller`.\n"
                "2. Remplissez le formulaire avec vos coordonnées et les détails de votre boutique.\n"
                "3. Après examen et validation de votre profil par nos administrateurs, vous recevrez un accès à votre espace **Seller Dashboard**.\n"
                "4. Vous pourrez ensuite ajouter vos produits, fixer vos prix, gérer vos stocks et suivre vos commandes en toute autonomie !"
            )

        # 3. Comment commander
        if any(k in msg_lower for k in ["commander", "acheter", "panier", "commande", "processus"]):
            return (
                "Pour passer une commande sur **Visio** :\n\n"
                "1. Parcourez nos produits dans le catalogue et cliquez sur **Ajouter au panier** sur les articles de votre choix.\n"
                "2. Ouvrez votre panier en cliquant sur l'icône du panier en haut à droite.\n"
                "3. Cliquez sur le bouton **Commander** pour accéder à la page de paiement.\n"
                "4. Renseignez votre adresse de livraison au Sénégal.\n"
                "5. Choisissez votre mode de paiement : PayTech (Wave, Orange Money, Free Money) ou paiement à la livraison."
            )

        # 4. Modes de paiement
        if any(k in msg_lower for k in ["paiement", "payer", "paytech", "wave", "orange", "money", "argent", "livraison"]):
            return (
                "Sur **Visio**, nous proposons deux modes de paiement très pratiques et sécurisés :\n\n"
                "- **Paiement mobile (PayTech)** : Payez instantanément en ligne via **Wave**, **Orange Money** ou **Free Money**.\n"
                "- **Paiement à la livraison** : Vous payez en espèces ou par transfert directement au livreur lors de la réception de votre commande."
            )

        # 5. WhatsApp
        if any(k in msg_lower for k in ["whatsapp", "support", "contact", "aide", "telephone", "numéro", "appeler"]):
            return (
                "Besoin d'aide supplémentaire ou d'un conseil ? Notre support client est disponible sur WhatsApp !\n\n"
                "Cliquez simplement sur le bouton WhatsApp vert situé **en bas à gauche** de votre écran.\n"
                "Vous pouvez aussi nous contacter directement au numéro suivant : **+221 77 000 00 00**."
            )

        # 6. Recherche de produits (par mots clés dans la base locale)
        # Extraire les mots-clés du message utilisateur
        words = re.findall(r'\b\w{3,}\b', msg_lower)  # mots de 3 lettres ou plus
        stop_words = {"les", "des", "une", "pour", "dans", "avec", "avez", "vous", "quels", "quel", "quelle", "quelles", "prix", "combien"}
        keywords = [w for w in words if w not in stop_words]

        matched_products = []
        if keywords:
            query = Q()
            for kw in keywords:
                query |= Q(name__icontains=kw) | Q(description__icontains=kw) | Q(brand__name__icontains=kw) | Q(category__name__icontains=kw)
            
            matched_products = Product.objects.filter(query, is_active=True).select_related('brand', 'category')[:5]

        if matched_products:
            reply_lines = ["Voici les produits correspondants disponibles sur Visio :"]
            for p in matched_products:
                stock_txt = "en stock" if p.stock > 0 else "rupture de stock"
                reply_lines.append(f"- **{p.name}** : {int(p.price)} XOF ({stock_txt})")
            reply_lines.append("\nVous pouvez cliquer sur les produits dans le catalogue pour finaliser votre commande !")
            return "\n".join(reply_lines)

        # 7. Si l'utilisateur demande "catalogue" ou "produits" en général
        if any(k in msg_lower for k in ["produits", "catalogue", "stock", "téléphone", "iphone", "samsung", "tablette"]):
            reply_lines = ["Voici un aperçu de nos produits phares :"]
            for p in active_products[:6]:
                reply_lines.append(f"- **{p.name}** : {int(p.price)} XOF")
            reply_lines.append("\nDécouvrez l'intégralité de nos offres sur notre catalogue en ligne !")
            return "\n".join(reply_lines)

        # 8. Réponse par défaut
        return (
            "Je comprends votre question. Afin de vous apporter la réponse la plus précise :\n\n"
            "- Nous vendons des smartphones (iPhones, Samsung, Tecno, Infinix), des tablettes et des accessoires high-tech.\n"
            "- Vous pouvez commander en ligne avec paiement mobile (Wave/Orange Money) ou à la livraison.\n"
            "- Si vous souhaitez parler à un conseiller humain, cliquez sur le bouton WhatsApp vert situé **en bas à gauche** de l'écran."
        )
