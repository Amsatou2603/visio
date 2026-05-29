import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api.dart';
import '../services/auth_client.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  _CartScreenState createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _phoneController = TextEditingController();
  String _method = 'mobile_money';
  bool _loading = false;

  Future<void> _startPayment() async {
    setState(() => _loading = true);
    try {
      // In a real app, orderId would come from the server after creating the order.
      const orderId = 1;
      final resp = await Api.initiatePayment(
          orderId, _method, _phoneController.text.trim());
      setState(() => _loading = false);

      // Expecting a payment_url in response
      final paymentUrl = resp['payment_url'] ??
          resp['payment']['payment_url'] ??
          resp['payment_url_confirm'];
      if (paymentUrl != null && paymentUrl is String) {
        final uri = Uri.parse(paymentUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Impossible d\'ouvrir l\'URL de paiement')));
        }
      } else {
        // Fallback: show server response
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Réponse: ${resp.toString()}')));
      }
    } catch (e) {
      setState(() => _loading = false);
      if (e is AuthException) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Session expirée')));
        Navigator.pushReplacementNamed(context, '/login');
        return;
      }
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Erreur de paiement: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Panier')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Résumé du panier',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            const Text('Total: 1000 XOF'),
            const SizedBox(height: 20),
            TextField(
              controller: _phoneController,
              decoration:
                  const InputDecoration(labelText: 'Numéro de téléphone'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            DropdownButton<String>(
              value: _method,
              items: const [
                DropdownMenuItem(
                    value: 'mobile_money', child: Text('Mobile Money')),
                DropdownMenuItem(value: 'card', child: Text('Carte')),
              ],
              onChanged: (v) => setState(() => _method = v ?? 'mobile_money'),
            ),
            const SizedBox(height: 20),
            Center(
              child: ElevatedButton(
                onPressed: _loading ? null : _startPayment,
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Payer'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
