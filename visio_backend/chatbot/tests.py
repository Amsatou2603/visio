# pyrefly: ignore [missing-import]
from django.urls import reverse
# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.test import APITestCase
from users.models import User
from products.models import Product, Category
from .models import ChatLog


class ChatbotAPITests(APITestCase):

    def setUp(self):
        # Configuration de base (catégorie et produit)
        self.category = Category.objects.create(name="Smartphones", slug="smartphones")
        
        # Création d'un vendeur
        self.seller = User.objects.create_user(
            email="seller@visio.com",
            username="seller_test",
            password="Password123!",
            role="seller"
        )
        
        # Création d'un produit
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="iPhone 14 Pro Max",
            description="Le dernier téléphone Apple",
            price=950000,
            stock=5,
            is_active=True
        )

        self.url = reverse('chatbot_ask')

    def test_empty_message_returns_bad_request(self):
        """Envoyer un message vide doit retourner un code 400"""
        response = self.client.post(self.url, {"message": ""})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_valid_message_returns_ok_and_reply(self):
        """Envoyer un message valide doit retourner un code 200 et une réponse"""
        response = self.client.post(self.url, {"message": "Bonjour"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("reply", response.data)
        self.assertIn("used_api", response.data)
        
        # Vérifier qu'un ChatLog a été enregistré
        self.assertEqual(ChatLog.objects.count(), 1)
        log = ChatLog.objects.first()
        self.assertEqual(log.message, "Bonjour")
        self.assertEqual(log.reply, response.data["reply"])

    def test_fallback_greeting(self):
        """Vérifier que le chatbot répond correctement aux salutations"""
        response = self.client.post(self.url, {"message": "Salut ! Comment vas-tu ?"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("VisioBot", response.data["reply"])
        self.assertIn("conseiller virtuel", response.data["reply"])

    def test_fallback_payment_queries(self):
        """Vérifier que le chatbot répond correctement aux questions de paiement"""
        response = self.client.post(self.url, {"message": "Comment puis-je payer ?"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("PayTech", response.data["reply"])
        self.assertIn("livraison", response.data["reply"])

    def test_fallback_product_search(self):
        """Vérifier que la recherche de produits locale fonctionne en fallback"""
        response = self.client.post(self.url, {"message": "Avez-vous des iPhones ?"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("iPhone 14 Pro Max", response.data["reply"])
        self.assertIn("950000", response.data["reply"])
