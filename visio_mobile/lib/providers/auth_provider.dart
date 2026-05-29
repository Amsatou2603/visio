import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  bool _loading = false;
  Timer? _refreshTimer;
  final Duration _refreshInterval = const Duration(minutes: 9);

  bool get isAuthenticated => _isAuthenticated;
  bool get loading => _loading;

  Future<void> tryAutoLogin() async {
    _loading = true;
    notifyListeners();
    final access = await Api.getStoredAccessToken();
    if (access != null) {
      _isAuthenticated = true;
      _loading = false;
      notifyListeners();
      _startRefreshTimer();
      return;
    }

    // try refresh
    try {
      await Api.refreshToken();
      _isAuthenticated = true;
      _startRefreshTimer();
    } catch (_) {
      _isAuthenticated = false;
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _loading = true;
    notifyListeners();
    try {
      await Api.login(email, password);
      _isAuthenticated = true;
      _startRefreshTimer();
    } catch (e) {
      _isAuthenticated = false;
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> register(Map<String, dynamic> payload) async {
    _loading = true;
    notifyListeners();
    try {
      await Api.register(payload);
      _isAuthenticated = true;
      _startRefreshTimer();
    } catch (e) {
      _isAuthenticated = false;
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await Api.logout();
    _isAuthenticated = false;
    _stopRefreshTimer();
    notifyListeners();
  }

  void _startRefreshTimer() {
    _stopRefreshTimer();
    _refreshTimer = Timer.periodic(_refreshInterval, (_) async {
      try {
        await Api.refreshToken();
      } catch (e) {
        // If refresh fails, log out locally
        await logout();
      }
    });
  }

  void _stopRefreshTimer() {
    _refreshTimer?.cancel();
    _refreshTimer = null;
  }

  @override
  void dispose() {
    _stopRefreshTimer();
    super.dispose();
  }
}
