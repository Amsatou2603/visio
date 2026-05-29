import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/welcome.dart';
import 'screens/login.dart';
import 'screens/register.dart';
import 'screens/catalog.dart';
import 'screens/splash_screen.dart';
import 'screens/product_detail.dart';
import 'screens/cart.dart';
import 'screens/notifications.dart';
import 'providers/auth_provider.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(VisioApp());
}

class VisioApp extends StatefulWidget {
  const VisioApp({super.key});

  @override
  _VisioAppState createState() => _VisioAppState();
}

class _VisioAppState extends State<VisioApp> {
  bool _wasAuthenticated = false;
  bool _dialogShown = false;
  bool _splashDone = false;

  void _maybeShowReconnectDialog(
      BuildContext context, bool wasAuth, bool isAuth, bool loading) {
    if (wasAuth && !isAuth && !loading && !_dialogShown) {
      _dialogShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Text('Session expirée'),
            content: const Text(
                'Votre session a expiré. Veuillez vous reconnecter.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pushReplacementNamed('/login');
                },
                child: const Text('Se connecter'),
              ),
            ],
          ),
        ).then((_) => _dialogShown = false);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider()..tryAutoLogin(),
      child: MaterialApp(
        title: 'Visio Mobile',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.light,
        debugShowCheckedModeBanner: false,
        home: Consumer<AuthProvider>(builder: (context, auth, _) {
          final prev = _wasAuthenticated;
          _wasAuthenticated = auth.isAuthenticated;
          _maybeShowReconnectDialog(
              context, prev, auth.isAuthenticated, auth.loading);

          return _splashDone
              ? (auth.loading
                  ? const Scaffold(
                      body: Center(
                        child: CircularProgressIndicator(
                          color: AppTheme.primary,
                        ),
                      ),
                    )
                  : (auth.isAuthenticated ? CatalogScreen() : WelcomeScreen()))
              : SplashScreen(
                  onDone: () {
                    setState(() {
                      _splashDone = true;
                    });
                  },
                );
        }),
        routes: {
          '/login': (c) => LoginScreen(),
          '/register': (c) => RegisterScreen(),
          '/catalog': (c) => CatalogScreen(),
          '/cart': (c) => CartScreen(),
          '/notifications': (c) => NotificationsScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name?.startsWith('/product/') ?? false) {
            final id = settings.name!.replaceFirst('/product/', '');
            return MaterialPageRoute(
                builder: (_) => ProductDetailScreen(productId: id));
          }
          return null;
        },
      ),
    );
  }
}
