import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _username = TextEditingController();
  final _phone = TextEditingController();
  final _country = TextEditingController(text: 'Sénégal');
  final _city = TextEditingController();
  final _password = TextEditingController();
  final _password2 = TextEditingController();
  bool _loading = false;
  Map<String, String> _errors = {};

  void _submit() async {
    setState(() {
      _loading = true;
      _errors = {};
    });
    try {
      final payload = {
        'email': _email.text.trim(),
        'username': _username.text.trim(),
        'first_name': _firstName.text.trim(),
        'last_name': _lastName.text.trim(),
        'password': _password.text.trim(),
        'password2': _password2.text.trim(),
        'phone': _phone.text.trim(),
        'country': _country.text.trim(),
        'city': _city.text.trim(),
      };
      await Provider.of<AuthProvider>(context, listen: false).register(payload);
      setState(() => _loading = false);
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/catalog');
      }
    } catch (e) {
      setState(() {
        _loading = false;
        _errors = {'detail': 'Erreur lors de l\'inscription.'};
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor =
        isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary;
    final secondaryTextColor =
        isDark ? AppTheme.darkTextSecondary : AppTheme.lightTextSecondary;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: isDark
                ? [
                    AppTheme.darkBackground,
                    AppTheme.darkBackgroundSoft,
                  ]
                : [
                    AppTheme.lightBackground,
                    AppTheme.lightBackgroundSoft,
                  ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        'V',
                        style: GoogleFonts.syne(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 20,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Title
                  Text(
                    'Créer un compte',
                    style: GoogleFonts.syne(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Rejoignez la marketplace Visio',
                    style: GoogleFonts.dmSans(
                      fontSize: 14,
                      color: secondaryTextColor,
                    ),
                  ),
                  const SizedBox(height: 32),
                  // Form card
                  GlassCard(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        if (_errors.containsKey('detail'))
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: AppTheme.primary.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Text(
                              _errors['detail']!,
                              style: GoogleFonts.dmSans(
                                fontSize: 13,
                                color: AppTheme.primary,
                              ),
                            ),
                          ),
                        // First name and last name row
                        Row(
                          children: [
                            Expanded(
                              child: _buildTextField(
                                label: 'Prénom *',
                                controller: _firstName,
                                hintText: 'Jean',
                                isDark: isDark,
                                textColor: textColor,
                                error: _errors['first_name'],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildTextField(
                                label: 'Nom *',
                                controller: _lastName,
                                hintText: 'Doe',
                                isDark: isDark,
                                textColor: textColor,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        // Email
                        _buildTextField(
                          label: 'Email *',
                          controller: _email,
                          hintText: 'votre@email.com',
                          keyboardType: TextInputType.emailAddress,
                          isDark: isDark,
                          textColor: textColor,
                          error: _errors['email'],
                        ),
                        const SizedBox(height: 16),
                        // Username
                        _buildTextField(
                          label: 'Nom d\'utilisateur *',
                          controller: _username,
                          hintText: 'johndoe',
                          isDark: isDark,
                          textColor: textColor,
                          error: _errors['username'],
                        ),
                        const SizedBox(height: 16),
                        // Phone
                        _buildTextField(
                          label: 'Téléphone',
                          controller: _phone,
                          hintText: '+221 77 000 00 00',
                          keyboardType: TextInputType.phone,
                          isDark: isDark,
                          textColor: textColor,
                        ),
                        const SizedBox(height: 16),
                        // Country and city row
                        Row(
                          children: [
                            Expanded(
                              child: _buildTextField(
                                label: 'Pays',
                                controller: _country,
                                isDark: isDark,
                                textColor: textColor,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildTextField(
                                label: 'Ville',
                                controller: _city,
                                isDark: isDark,
                                textColor: textColor,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        // Password
                        _buildTextField(
                          label: 'Mot de passe *',
                          controller: _password,
                          hintText: '••••••••',
                          obscureText: true,
                          isDark: isDark,
                          textColor: textColor,
                          error: _errors['password'],
                        ),
                        const SizedBox(height: 16),
                        // Confirm password
                        _buildTextField(
                          label: 'Confirmer le mot de passe *',
                          controller: _password2,
                          hintText: '••••••••',
                          obscureText: true,
                          isDark: isDark,
                          textColor: textColor,
                        ),
                        const SizedBox(height: 24),
                        // Submit button
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primary,
                              foregroundColor: Colors.white,
                              elevation: 4,
                              shadowColor: AppTheme.shadowRed,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _loading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white,
                                      ),
                                    ),
                                  )
                                : Text(
                                    'Créer mon compte',
                                    style: GoogleFonts.dmSans(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Login link
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/login'),
                    child: Text.rich(
                      TextSpan(
                        text: 'Déjà un compte ? ',
                        style: GoogleFonts.dmSans(
                          fontSize: 13,
                          color: secondaryTextColor,
                        ),
                        children: [
                          TextSpan(
                            text: 'Se connecter',
                            style: GoogleFonts.dmSans(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    String? hintText,
    bool obscureText = false,
    TextInputType? keyboardType,
    required bool isDark,
    required Color textColor,
    String? error,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.dmSans(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: textColor,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hintText,
            filled: true,
            fillColor: isDark ? const Color(0x0DFFFFFF) : Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: isDark ? AppTheme.darkBorderStrong : AppTheme.lightBorderStrong,
                width: 1.5,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: isDark ? AppTheme.darkBorderStrong : AppTheme.lightBorderStrong,
                width: 1.5,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: AppTheme.primary,
                width: 1.5,
              ),
            ),
            errorText: error,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    _username.dispose();
    _phone.dispose();
    _country.dispose();
    _city.dispose();
    _password.dispose();
    _password2.dispose();
    super.dispose();
  }
}
