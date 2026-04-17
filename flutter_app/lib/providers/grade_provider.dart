import 'package:flutter/material.dart';
import '../models/grade.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class GradeProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Grade> _grades = [];
  bool _isLoading = false;
  String? _error;

  List<Grade> get grades => _grades;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Calculate GPA
  double get gpa {
    if (_grades.isEmpty) return 0.0;
    
    final completedGrades = _grades.where((g) => g.isComplete).toList();
    if (completedGrades.isEmpty) return 0.0;
    
    double totalPoints = 0.0;
    int totalCredits = 0;
    
    for (final grade in completedGrades) {
      if (grade.average != null) {
        totalPoints += grade.average! * grade.credits;
        totalCredits += grade.credits;
      }
    }
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
  }

  // Get grades by semester
  Map<String, List<Grade>> get gradesBySemester {
    final Map<String, List<Grade>> grouped = {};
    for (final grade in _grades) {
      final key = '${grade.semester} ${grade.academicYear}';
      if (!grouped.containsKey(key)) {
        grouped[key] = [];
      }
      grouped[key]!.add(grade);
    }
    return grouped;
  }

  // Get completed grades count
  int get completedGradesCount {
    return _grades.where((g) => g.isComplete).length;
  }

  // Get passing grades count
  int get passingGradesCount {
    return _grades.where((g) => g.isPassing).length;
  }

  // Get total credits
  int get totalCredits {
    return _grades.fold(0, (sum, grade) => sum + grade.credits);
  }

  // Get completed credits
  int get completedCredits {
    return _grades.where((g) => g.isComplete).fold(0, (sum, grade) => sum + grade.credits);
  }

  // Fetch student grades
  Future<void> fetchGrades() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get(AppConstants.gradesEndpoint);
      
      if (response['success'] == true) {
        final List<dynamic> gradesData = response['grades'] ?? [];
        _grades = gradesData.map((json) => Grade.fromJson(json)).toList();
        
        // Sort by semester and academic year (newest first)
        _grades.sort((a, b) {
          final aKey = '${a.academicYear}-${a.semester}';
          final bKey = '${b.academicYear}-${b.semester}';
          return bKey.compareTo(aKey);
        });
      } else {
        _error = response['message'] ?? 'Failed to fetch grades';
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Refresh grades
  Future<void> refreshGrades() async {
    await fetchGrades();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Get grades for specific semester
  List<Grade> getGradesForSemester(String semester, String academicYear) {
    return _grades.where((g) => 
      g.semester == semester && g.academicYear == academicYear
    ).toList();
  }

  // Calculate GPA for specific semester
  double getGpaForSemester(String semester, String academicYear) {
    final semesterGrades = getGradesForSemester(semester, academicYear)
        .where((g) => g.isComplete).toList();
    
    if (semesterGrades.isEmpty) return 0.0;
    
    double totalPoints = 0.0;
    int totalCredits = 0;
    
    for (final grade in semesterGrades) {
      if (grade.average != null) {
        totalPoints += grade.average! * grade.credits;
        totalCredits += grade.credits;
      }
    }
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
  }
}