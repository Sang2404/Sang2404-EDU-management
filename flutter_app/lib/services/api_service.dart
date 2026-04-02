import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';

import '../utils/constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final _storage = const FlutterSecureStorage();
  final _logger = Logger();
  
  String? _token;
  
  // Get stored token
  Future<String?> getToken() async {
    _token ??= await _storage.read(key: AppConstants.tokenKey);
    return _token;
  }
  
  // Set token
  Future<void> setToken(String token) async {
    _token = token;
    await _storage.write(key: AppConstants.tokenKey, value: token);
  }
  
  // Clear token
  Future<void> clearToken() async {
    _token = null;
    await _storage.delete(key: AppConstants.tokenKey);
  }
  
  // Get headers with auth
  Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
  
  // Generic GET request
  Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final url = Uri.parse('${AppConstants.baseUrl}$endpoint');
      final headers = await _getHeaders();
      
      _logger.d('GET: $url');
      
      final response = await http.get(url, headers: headers);
      
      _logger.d('Response: ${response.statusCode} - ${response.body}');
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else if (response.statusCode == 401) {
        await clearToken();
        throw Exception('Unauthorized - Please login again');
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Request failed');
      }
    } catch (e) {
      _logger.e('GET Error: $e');
      rethrow;
    }
  }
  
  // Generic POST request
  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final url = Uri.parse('${AppConstants.baseUrl}$endpoint');
      final headers = await _getHeaders();
      
      _logger.d('POST: $url');
      _logger.d('Data: $data');
      
      final response = await http.post(
        url,
        headers: headers,
        body: json.encode(data),
      );
      
      _logger.d('Response: ${response.statusCode} - ${response.body}');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else if (response.statusCode == 401) {
        await clearToken();
        throw Exception('Unauthorized - Please login again');
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Request failed');
      }
    } catch (e) {
      _logger.e('POST Error: $e');
      rethrow;
    }
  }
  
  // Generic PUT request
  Future<Map<String, dynamic>> put(String endpoint, Map<String, dynamic> data) async {
    try {
      final url = Uri.parse('${AppConstants.baseUrl}$endpoint');
      final headers = await _getHeaders();
      
      _logger.d('PUT: $url');
      _logger.d('Data: $data');
      
      final response = await http.put(
        url,
        headers: headers,
        body: json.encode(data),
      );
      
      _logger.d('Response: ${response.statusCode} - ${response.body}');
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else if (response.statusCode == 401) {
        await clearToken();
        throw Exception('Unauthorized - Please login again');
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Request failed');
      }
    } catch (e) {
      _logger.e('PUT Error: $e');
      rethrow;
    }
  }
  
  // Generic DELETE request
  Future<Map<String, dynamic>> delete(String endpoint) async {
    try {
      final url = Uri.parse('${AppConstants.baseUrl}$endpoint');
      final headers = await _getHeaders();
      
      _logger.d('DELETE: $url');
      
      final response = await http.delete(url, headers: headers);
      
      _logger.d('Response: ${response.statusCode} - ${response.body}');
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else if (response.statusCode == 401) {
        await clearToken();
        throw Exception('Unauthorized - Please login again');
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Request failed');
      }
    } catch (e) {
      _logger.e('DELETE Error: $e');
      rethrow;
    }
  }
}