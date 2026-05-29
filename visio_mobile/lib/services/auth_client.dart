import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthException implements Exception {
  final String? message;
  AuthException([this.message]);
  @override
  String toString() => 'AuthException: ${message ?? ''}';
}

class AuthHttpClient extends http.BaseClient {
  final http.Client _inner;
  final Future<void> Function() refresh;

  AuthHttpClient({http.Client? inner, required this.refresh})
      : _inner = inner ?? http.Client();

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    http.StreamedResponse streamed = await _inner.send(request);
    if (streamed.statusCode == 401) {
      try {
        await refresh();
        final newToken = prefs.getString('access_token');
        if (newToken == null) {
          throw AuthException('Refresh did not return token');
        }
        request.headers['Authorization'] = 'Bearer $newToken';
        streamed = await _inner.send(request);
      } catch (e) {
        throw AuthException(e.toString());
      }
    }
    return streamed;
  }
}
