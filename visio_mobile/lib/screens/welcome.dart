import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

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
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: const [
                        BoxShadow(
                          color: AppTheme.primaryGlow,
                          blurRadius: 32,
                          spreadRadius: 8,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        'V',
                        style: GoogleFonts.syne(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 48,
                          letterSpacing: -2,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  // Title
                  Text(
                    'VISIO',
                    style: GoogleFonts.syne(
                      fontSize: 48,
                      fontWeight: FontWeight.w800,
                      color: textColor,
                      letterSpacing: 8,
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Tagline
                  Text(
                    'Marketplace Tech Pan-Africaine',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.dmSans(
                      fontSize: 16,
                      color: secondaryTextColor,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 48),
                  // Hero text
                  Text(
                    'La Tech Premium\nde l\'Afrique',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.syne(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: textColor,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Téléphones, tablettes, accessoires —\nau meilleur prix, livrés partout en Afrique.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.dmSans(
                      fontSize: 15,
                      color: secondaryTextColor,
                      height: 1.7,
                    ),
                  ),
                  const SizedBox(height: 48),
                  // Stats
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildStat('500+', 'Produits', textColor),
                      _buildStat('50+', 'Vendeurs', textColor),
                      _buildStat('10k+', 'Clients', textColor),
                    ],
                  ),
                  const SizedBox(height: 48),
                  // Buttons
                  GlassButton(
                    text: 'Explorer le catalogue',
                    onPressed: () => Navigator.pushNamed(context, '/catalog'),
                    isPrimary: true,
                  ),
                  const SizedBox(height: 16),
                  GlassButton(
                    text: 'Se connecter',
                    onPressed: () => Navigator.pushNamed(context, '/login'),
                    isPrimary: false,
                  ),
                  const SizedBox(height: 24),
                  // Register link
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/register'),
                    child: Text(
                      'Pas encore de compte ? S\'inscrire',
                      style: GoogleFonts.dmSans(
                        color: AppTheme.primary,
                        fontWeight: FontWeight.w600,
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

  Widget _buildStat(String value, String label, Color textColor) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.syne(
            fontSize: 24,
            fontWeight: FontWeight.w900,
            color: AppTheme.primary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.dmSans(
            fontSize: 13,
            color: textColor.withValues(alpha: 0.6),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
