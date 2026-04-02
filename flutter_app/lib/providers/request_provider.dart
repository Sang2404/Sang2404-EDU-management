import 'package:flutter/material.dart';
import '../models/academic_request.dart';
import '../models/grade.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class RequestProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<AcademicRequest> _requests = [];
  List<Grade> _availableGrades = [];
  List<dynamic> _availableSections = [];
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _error;

  List<AcademicRequest> get requests => _requests;
  List<Grade> get availableGrades => _availableGrades;
  List<dynamic> get availableSections => _availableSections;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get error => _error;

  // Get requests by type
  List<AcademicRequest> getRequestsByType(String type) {
    return _requests.where((r) => r.requestType == type).toList();
  }

  // Get pending requests
  List<AcademicRequest> get pendingRequests {
    return _requests.where((r) => r.isPending).toList();
  }

  // Fetch student requests
  Future<void> fetchRequests() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get(AppConstants.requestsEndpoint);
      
      if (response['success'] == true) {
        final List<dynamic> requestsData = response['requests'] ?? [];
        _requests = requestsData.map((json) => AcademicRequest.fromJson(json)).toList();
        
        // Sort by created date (newest first)
        _requests.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      } else {
        _error = response['message'] ?? 'Failed to fetch requests';
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Fetch available grades for review requests
  Future<void> fetchAvailableGrades() async {
    try {
      final response = await _apiService.get(AppConstants.gradesEndpoint);
      
      if (response['success'] == true) {
        final List<dynamic> gradesData = response['grades'] ?? [];
        _availableGrades = gradesData
            .map((json) => Grade.fromJson(json))
            .where((grade) => grade.isComplete && grade.average != null && grade.average! < 4.0)
            .toList();
      }
    } catch (e) {
      // Handle error silently for now
    }
    notifyListeners();
  }

  // Fetch available sections for reserve/retake requests
  Future<void> fetchAvailableSections() async {
    try {
      final response = await _apiService.get(AppConstants.sectionsEndpoint);
      
      if (response['success'] == true) {
        _availableSections = response['sections'] ?? [];
      }
    } catch (e) {
      // Handle error silently for now
    }
    notifyListeners();
  }

  // Submit review request
  Future<bool> submitReviewRequest(int gradeId, String reason) async {
    _isSubmitting = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post(AppConstants.requestsEndpoint, {
        'request_type': AppConstants.reviewRequest,
        'grade_id': gradeId,
        'reason': reason,
      });

      if (response['success'] == true) {
        await fetchRequests(); // Refresh requests
        _isSubmitting = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to submit request';
        _isSubmitting = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }

  // Submit reserve request
  Future<bool> submitReserveRequest(int sectionId, String reason) async {
    _isSubmitting = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post(AppConstants.requestsEndpoint, {
        'request_type': AppConstants.reserveRequest,
        'section_id': sectionId,
        'reason': reason,
      });

      if (response['success'] == true) {
        await fetchRequests(); // Refresh requests
        _isSubmitting = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to submit request';
        _isSubmitting = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }

  // Submit retake request
  Future<bool> submitRetakeRequest(int sectionId, String reason) async {
    _isSubmitting = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post(AppConstants.requestsEndpoint, {
        'request_type': AppConstants.retakeRequest,
        'section_id': sectionId,
        'reason': reason,
      });

      if (response['success'] == true) {
        await fetchRequests(); // Refresh requests
        _isSubmitting = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to submit request';
        _isSubmitting = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }

  // Refresh requests
  Future<void> refreshRequests() async {
    await fetchRequests();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Initialize - fetch all data
  Future<void> initialize() async {
    await Future.wait([
      fetchRequests(),
      fetchAvailableGrades(),
      fetchAvailableSections(),
    ]);
  }
}