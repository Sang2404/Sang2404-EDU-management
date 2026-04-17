import 'package:flutter/material.dart';
import '../models/course.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class CourseProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Course> _courses = [];
  bool _isLoading = false;
  String? _error;

  List<Course> get courses => _courses;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Fetch student courses
  Future<void> fetchCourses() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get(AppConstants.coursesEndpoint);
      
      if (response['success'] == true) {
        final List<dynamic> coursesData = response['courses'] ?? [];
        _courses = coursesData.map((json) => Course.fromJson(json)).toList();
      } else {
        _error = response['message'] ?? 'Failed to fetch courses';
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Refresh courses
  Future<void> refreshCourses() async {
    await fetchCourses();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}