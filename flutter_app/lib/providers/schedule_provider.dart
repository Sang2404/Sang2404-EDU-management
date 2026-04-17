import 'package:flutter/material.dart';
import '../models/schedule.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class ScheduleProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Schedule> _schedules = [];
  bool _isLoading = false;
  String? _error;

  List<Schedule> get schedules => _schedules;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Get schedules grouped by day
  Map<int, List<Schedule>> get schedulesByDay {
    final Map<int, List<Schedule>> grouped = {};
    for (final schedule in _schedules) {
      if (!grouped.containsKey(schedule.dayOfWeek)) {
        grouped[schedule.dayOfWeek] = [];
      }
      grouped[schedule.dayOfWeek]!.add(schedule);
    }
    
    // Sort schedules within each day by start period
    for (final day in grouped.keys) {
      grouped[day]!.sort((a, b) => a.startPeriod.compareTo(b.startPeriod));
    }
    
    return grouped;
  }

  // Get today's schedules
  List<Schedule> get todaySchedules {
    final today = DateTime.now().weekday;
    final dayOfWeek = today == 7 ? 7 : today + 1; // Convert to our day format
    return _schedules.where((s) => s.dayOfWeek == dayOfWeek).toList()
      ..sort((a, b) => a.startPeriod.compareTo(b.startPeriod));
  }

  // Fetch student schedules
  Future<void> fetchSchedules() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get(AppConstants.scheduleEndpoint);
      
      if (response['success'] == true) {
        final List<dynamic> schedulesData = response['schedules'] ?? [];
        _schedules = schedulesData.map((json) => Schedule.fromJson(json)).toList();
      } else {
        _error = response['message'] ?? 'Failed to fetch schedules';
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Refresh schedules
  Future<void> refreshSchedules() async {
    await fetchSchedules();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Get schedule for specific day
  List<Schedule> getSchedulesForDay(int dayOfWeek) {
    return _schedules.where((s) => s.dayOfWeek == dayOfWeek).toList()
      ..sort((a, b) => a.startPeriod.compareTo(b.startPeriod));
  }

  // Check if there's a class at specific time
  bool hasClassAt(int dayOfWeek, int period) {
    return _schedules.any((s) => 
      s.dayOfWeek == dayOfWeek && 
      period >= s.startPeriod && 
      period <= s.endPeriod
    );
  }
}