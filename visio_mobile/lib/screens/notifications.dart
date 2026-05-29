import 'package:flutter/material.dart';
import '../services/api.dart';
import '../services/auth_client.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  _NotificationsScreenState createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> _notifications = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await Api.fetchNotifications();
      setState(() {
        _notifications = data;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _markRead(int id) async {
    try {
      await Api.markNotificationRead(id);
      await _load();
    } catch (e) {
      if (e is AuthException) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Session expirée')));
        Navigator.pushReplacementNamed(context, '/login');
        return;
      }
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Erreur')));
    }
  }

  Future<void> _markAll() async {
    try {
      await Api.markAllNotificationsRead();
      await _load();
    } catch (e) {
      if (e is AuthException) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Session expirée')));
        Navigator.pushReplacementNamed(context, '/login');
        return;
      }
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Erreur')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications'), actions: [
        IconButton(onPressed: _markAll, icon: const Icon(Icons.mark_email_read))
      ]),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Erreur: $_error'))
              : _notifications.isEmpty
                  ? const Center(child: Text('Aucune notification'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        itemCount: _notifications.length,
                        itemBuilder: (context, i) {
                          final n = _notifications[i];
                          return ListTile(
                            title: Text(n['title'] ?? ''),
                            subtitle: Text(n['message'] ?? ''),
                            trailing: n['is_read'] == true
                                ? null
                                : TextButton(
                                    onPressed: () => _markRead(n['id']),
                                    child: const Text('Marquer lu')),
                          );
                        },
                      ),
                    ),
    );
  }
}
