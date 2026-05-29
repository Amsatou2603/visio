import 'dart:convert';
import 'dart:developer' as developer;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_client.dart';

const String BASE_URL = String.fromEnvironment('VISIO_API_URL',
    defaultValue: 'https://visio-backend-sp1h.onrender.com/api');

class Api {
  // Singleton HTTP client that attaches token and can refresh on 401
  static final AuthHttpClient _client = AuthHttpClient(refresh: refreshToken);

  static void _log(String msg) => developer.log(msg, name: 'visio.api');
  static Future<void> login(String email, String password) async {
    final res = await http.post(Uri.parse('$BASE_URL/auth/login/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}));

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      String? access;
      String? refresh;
      if (data.containsKey('access') && data.containsKey('refresh')) {
        access = data['access'];
        refresh = data['refresh'];
      } else if (data.containsKey('tokens')) {
        access = data['tokens']['access'];
        refresh = data['tokens']['refresh'];
      }

      if (access != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('access_token', access);
        if (refresh != null) await prefs.setString('refresh_token', refresh);
        return;
      }
    }
    throw Exception('Login failed: ${res.statusCode}');
  }

  static Future<Map<String, dynamic>> register(
      Map<String, dynamic> payload) async {
    final res = await http.post(Uri.parse('$BASE_URL/auth/register/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload));
    if (res.statusCode == 201) {
      final data = jsonDecode(res.body);
      if (data['tokens'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('access_token', data['tokens']['access']);
        await prefs.setString('refresh_token', data['tokens']['refresh']);
      }
      return data;
    }
    throw Exception('Register failed: ${res.statusCode}');
  }

  static Future<List<dynamic>> fetchProducts() async {
    _log('GET $BASE_URL/products/');
    final res = await _client.get(Uri.parse('$BASE_URL/products/'));
    _log(' <- ${res.statusCode}');
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as List<dynamic>;
    }
    _log('Failed to load products: ${res.body}');
    throw Exception('Failed to load products: ${res.statusCode}');
  }

  static Future<List<dynamic>> fetchNotifications() async {
    _log('GET $BASE_URL/notifications/');
    final res = await _client.get(Uri.parse('$BASE_URL/notifications/'),
        headers: {'Content-Type': 'application/json'});
    _log(' <- ${res.statusCode}');
    if (res.statusCode == 200) return jsonDecode(res.body) as List<dynamic>;
    _log('Failed to load notifications: ${res.body}');
    throw Exception('Failed to load notifications: ${res.statusCode}');
  }

  static Future<void> markNotificationRead(int id) async {
    _log('POST $BASE_URL/notifications/$id/read/');
    final res = await _client.post(
        Uri.parse('$BASE_URL/notifications/$id/read/'),
        headers: {'Content-Type': 'application/json'});
    _log(' <- ${res.statusCode}');
    if (res.statusCode != 200) {
      _log('Failed to mark read: ${res.body}');
      throw Exception('Failed to mark read: ${res.statusCode}');
    }
  }

  static Future<void> markAllNotificationsRead() async {
    _log('POST $BASE_URL/notifications/read-all/');
    final res = await _client.post(
        Uri.parse('$BASE_URL/notifications/read-all/'),
        headers: {'Content-Type': 'application/json'});
    _log(' <- ${res.statusCode}');
    if (res.statusCode != 200) {
      _log('Failed to mark all read: ${res.body}');
      throw Exception('Failed to mark all read: ${res.statusCode}');
    }
  }

  static Future<Map<String, dynamic>> initiatePayment(
      int orderId, String method, String phone) async {
    final body = jsonEncode(
        {'order_id': orderId, 'method': method, 'phone_number': phone});
    _log('POST $BASE_URL/payments/initiate/ body=$body');
    final res = await _client.post(Uri.parse('$BASE_URL/payments/initiate/'),
        headers: {'Content-Type': 'application/json'}, body: body);
    _log(' <- ${res.statusCode} body=${res.body}');
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    _log('Payment initiation failed: ${res.body}');
    throw Exception('Payment initiation failed: ${res.statusCode}');
  }

  static Future<void> refreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    final refresh = prefs.getString('refresh_token');
    if (refresh == null) throw Exception('No refresh token');
    _log('POST $BASE_URL/auth/token/refresh/');
    final res = await _client.post(Uri.parse('$BASE_URL/auth/token/refresh/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh': refresh}));
    _log(' <- ${res.statusCode} body=${res.body}');
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data.containsKey('access')) {
        await prefs.setString('access_token', data['access']);
        return;
      }
    }
    _log('Refresh failed: ${res.body}');
    throw Exception('Refresh failed: ${res.statusCode}');
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
  }

  static Future<String?> getStoredAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }
}
