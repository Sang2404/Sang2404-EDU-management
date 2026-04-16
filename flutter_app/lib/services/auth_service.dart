import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/user.dart';
import '../utils/constants.dart';
import 'api_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final _apiService = ApiService();
  final _storage = const FlutterSecureStorage();

  // Login
  Future<User> login(String email, String password) async {
    final response = await _apiService.post(AppConstants.loginEndpoint, {
      'email': email,
      'password': password,
    });

    if (response['success'] == true) {
      final token = response['token'];
      final userData = response['user'];

      // Store token and user data
      await _apiService.setToken(token);
      await _storage.write(key: AppConstants.userKey, value: json.encode(userData));

      return User.fromJson(userData);
    } else {
      throw Exception(response['message'] ?? 'Login failed');
    }
  }

  // Get current user from storage and verify token
  Future<User?> getCurrentUser() async {
    try {
      final token = await _apiService.getToken();
      final userJson = await _storage.read(key: AppConstants.userKey);
      
      if (token == null || userJson == null) {
        return null;
      }

      // Verify token is still valid by making a test API call
      try {
        await _apiService.get('/auth/verify');
        final userData = json.decode(userJson);
        return User.fromJson(userData);
      } catch (e) {
        // Token is invalid, clear stored data
        await logout();
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await _apiService.getToken();
    final user = await getCurrentUser();
    return token != null && user != null;
  }

  // Logout
  Future<void> logout() async {
    await _apiService.clearToken();
    await _storage.delete(key: AppConstants.userKey);
  }

  // Refresh token (if needed)
  Future<void> refreshToken() async {
    // Implementation depends on your backend refresh token logic
    // For now, just check if current token is still valid
    try {
      await _apiService.get('/auth/verify');
    } catch (e) {
      // Token is invalid, logout user
      await logout();
      throw Exception('Session expired');
    }
  }
}