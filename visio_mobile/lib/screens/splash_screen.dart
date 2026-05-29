import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animated_text_kit/animated_text_kit.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  final VoidCallback onDone;

  const SplashScreen({Key? key, required this.onDone}) : super(key: key);

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  double _progress = 0.0;
  bool _exiting = false;
  late AnimationController _circleController;
  late AnimationController _secondCircleController;

  @override
  void initState() {
    super.initState();
    _circleController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    
    _secondCircleController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    
    _animateProgress();
  }

  @override
  void dispose() {
    _circleController.dispose();
    _secondCircleController.dispose();
    super.dispose();
  }

  void _animateProgress() async {
    final steps = [
      {'target': 20.0, 'delay': 200},
      {'target': 45.0, 'delay': 600},
      {'target': 70.0, 'delay': 1200},
      {'target': 90.0, 'delay': 1800},
      {'target': 100.0, 'delay': 2300},
    ];

    for (var step in steps) {
      await Future.delayed(Duration(milliseconds: step['delay'] as int));
      if (mounted) {
        setState(() {
          _progress = step['target'] as double;
        });
      }
    }

    if (mounted) {
      setState(() {
        _exiting = true;
      });
      await Future.delayed(const Duration(milliseconds: 400));
      widget.onDone();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor =
        isDark ? AppTheme.darkBackground : AppTheme.lightBackground;
    final textColor =
        isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary;
    final secondaryTextColor =
        isDark ? AppTheme.darkTextSecondary : AppTheme.lightTextSecondary;

    return AnimatedOpacity(
      opacity: _exiting ? 0.0 : 1.0,
      duration: const Duration(milliseconds: 400),
      child: Container(
        color: backgroundColor,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Decorative circles
              Stack(
                alignment: Alignment.center,
                children: [
                  _buildDecorativeCircle(200, 0.06, _circleController),
                  _buildDecorativeCircle(140, 0.1, _secondCircleController),
                  // Logo
                  Container(
                    width: 88,
                    height: 88,
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
                          fontSize: 42,
                          letterSpacing: -2,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),
              // Title
              Text(
                'VISIO',
                style: GoogleFonts.syne(
                  fontSize: 45,
                  fontWeight: FontWeight.w800,
                  color: textColor,
                  letterSpacing: 8,
                  decoration: TextDecoration.none,
                ),
              ),
              const SizedBox(height: 8),
              // Tagline
              Text(
                'Marketplace Tech Pan-Africaine',
                style: GoogleFonts.dmSans(
                  fontSize: 14,
                  color: secondaryTextColor,
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.w500,
                  decoration: TextDecoration.none,
                ),
              ),
              const SizedBox(height: 32),
              // Progress bar
              Container(
                width: 200,
                height: 3,
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: FractionallySizedBox(
                  widthFactor: _progress / 100,
                  alignment: Alignment.centerLeft,
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Status message
              SizedBox(
                height: 18,
                child: AnimatedTextKit(
                  animatedTexts: [
                    TypewriterAnimatedText(
                      'Initialisation...',
                      textStyle: GoogleFonts.dmSans(
                        fontSize: 12,
                        color: secondaryTextColor,
                        letterSpacing: 0.5,
                        decoration: TextDecoration.none,
                      ),
                      speed: const Duration(milliseconds: 100),
                    ),
                    TypewriterAnimatedText(
                      'Chargement des produits...',
                      textStyle: GoogleFonts.dmSans(
                        fontSize: 12,
                        color: secondaryTextColor,
                        letterSpacing: 0.5,
                        decoration: TextDecoration.none,
                      ),
                      speed: const Duration(milliseconds: 100),
                    ),
                    TypewriterAnimatedText(
                      'Connexion au serveur...',
                      textStyle: GoogleFonts.dmSans(
                        fontSize: 12,
                        color: secondaryTextColor,
                        letterSpacing: 0.5,
                        decoration: TextDecoration.none,
                      ),
                      speed: const Duration(milliseconds: 100),
                    ),
                    TypewriterAnimatedText(
                      'Préparation de votre expérience...',
                      textStyle: GoogleFonts.dmSans(
                        fontSize: 12,
                        color: secondaryTextColor,
                        letterSpacing: 0.5,
                        decoration: TextDecoration.none,
                      ),
                      speed: const Duration(milliseconds: 100),
                    ),
                    TypewriterAnimatedText(
                      'Presque prêt...',
                      textStyle: GoogleFonts.dmSans(
                        fontSize: 12,
                        color: secondaryTextColor,
                        letterSpacing: 0.5,
                        decoration: TextDecoration.none,
                      ),
                      speed: const Duration(milliseconds: 100),
                    ),
                  ],
                  repeatForever: true,
                ),
              ),
              const SizedBox(height: 8),
              // Percentage
              Text(
                '${_progress.toInt()}%',
                style: GoogleFonts.syne(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primary,
                  letterSpacing: 1,
                  decoration: TextDecoration.none,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDecorativeCircle(double size, double opacity, AnimationController controller) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, child) {
        final value = Curves.easeInOut.transform(controller.value);
        return Transform.scale(
          scale: 1.0 + (value * 0.04),
          child: Opacity(
            opacity: 0.5 + (value * 0.5),
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppTheme.primary.withValues(alpha: opacity),
                  width: 1,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
