class Schedule {
  final int scheduleId;
  final int sectionId;
  final String subjectName;
  final String subjectId;
  final String sectionCode;
  final String lecturerName;
  final int dayOfWeek;
  final int startPeriod;
  final int endPeriod;
  final String room;
  final int credits;

  Schedule({
    required this.scheduleId,
    required this.sectionId,
    required this.subjectName,
    required this.subjectId,
    required this.sectionCode,
    required this.lecturerName,
    required this.dayOfWeek,
    required this.startPeriod,
    required this.endPeriod,
    required this.room,
    required this.credits,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) {
    print('=== PARSING SCHEDULE JSON ===');
    print('Raw JSON: $json');
    
    try {
      final schedule = Schedule(
        scheduleId: _parseIntSafely(json['schedule_id'], 'schedule_id', 0),
        sectionId: _parseIntSafely(json['section_id'], 'section_id', 0),
        subjectName: _parseStringSafely(json['subject_name'], 'subject_name'),
        subjectId: _parseStringSafely(json['subject_id'], 'subject_id'),
        sectionCode: _parseStringSafely(json['section_code'], 'section_code'),
        lecturerName: _parseStringSafely(json['lecturer_name'], 'lecturer_name'),
        dayOfWeek: _parseDayOfWeek(json['day_of_week']),
        startPeriod: _parsePeriod(json['start_period'], 'start_period'),
        endPeriod: _parsePeriod(json['end_period'], 'end_period'),
        room: _parseStringSafely(json['room'], 'room'),
        credits: _parseIntSafely(json['credits'], 'credits', 0),
      );
      
      print('✅ Successfully parsed schedule: ${schedule.subjectName}');
      return schedule;
    } catch (e, stackTrace) {
      print('❌ Error parsing schedule JSON: $e');
      print('Stack trace: $stackTrace');
      print('Problematic JSON: $json');
      
      // Return a safe default schedule instead of crashing
      return Schedule(
        scheduleId: 0,
        sectionId: 0,
        subjectName: 'Error parsing schedule',
        subjectId: '',
        sectionCode: '',
        lecturerName: '',
        dayOfWeek: 1,
        startPeriod: 1,
        endPeriod: 1,
        room: '',
        credits: 0,
      );
    }
  }

  static int _parseIntSafely(dynamic value, String fieldName, int defaultValue) {
    if (value == null) {
      print('⚠️ $fieldName is null, using default: $defaultValue');
      return defaultValue;
    }
    
    if (value is int) {
      print('✅ $fieldName parsed as int: $value');
      return value;
    }
    
    if (value is String) {
      // Check for academic year format or other non-numeric strings
      if (value.contains('-') || value.isEmpty) {
        print('⚠️ $fieldName contains dash or empty, using default: $value -> $defaultValue');
        return defaultValue;
      }
      
      final parsed = int.tryParse(value.trim());
      if (parsed != null) {
        print('✅ $fieldName parsed from string: "$value" -> $parsed');
        return parsed;
      } else {
        print('❌ Failed to parse $fieldName from string: "$value", using default: $defaultValue');
        return defaultValue;
      }
    }
    
    print('❌ Unknown type for $fieldName: ${value.runtimeType}, value: $value, using default: $defaultValue');
    return defaultValue;
  }

  static String _parseStringSafely(dynamic value, String fieldName) {
    if (value == null) {
      print('⚠️ $fieldName is null, using empty string');
      return '';
    }
    
    final stringValue = value.toString();
    print('✅ $fieldName parsed as string: "$stringValue"');
    return stringValue;
  }

  static int _parseDayOfWeek(dynamic value) {
    final parsed = _parseIntSafely(value, 'day_of_week', 1);
    
    // Ensure day_of_week is in valid range (1-7)
    if (parsed < 1 || parsed > 7) {
      final corrected = ((parsed - 1) % 7) + 1;
      print('⚠️ day_of_week out of range: $parsed -> $corrected');
      return corrected;
    }
    
    return parsed;
  }

  static int _parsePeriod(dynamic value, String fieldName) {
    final parsed = _parseIntSafely(value, fieldName, 1);
    
    // Ensure period is in valid range (1-15)
    if (parsed < 1 || parsed > 15) {
      final corrected = parsed < 1 ? 1 : (parsed > 15 ? 15 : parsed);
      print('⚠️ $fieldName out of range: $parsed -> $corrected');
      return corrected;
    }
    
    return parsed;
  }

  String get dayName {
    const days = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    return dayOfWeek >= 1 && dayOfWeek <= 7 ? days[dayOfWeek] : 'Không xác định';
  }

  String get timeRange {
    return 'Tiết $startPeriod - $endPeriod';
  }

  String get periodTime {
    // Convert period to actual time
    if (startPeriod >= 1 && endPeriod <= 5) {
      return '07:00 - 11:30';
    } else if (startPeriod >= 6 && endPeriod <= 10) {
      return '13:00 - 17:30';
    } else if (startPeriod >= 11 && endPeriod <= 15) {
      return '18:30 - 22:00';
    } else {
      return 'Tiết $startPeriod - $endPeriod';
    }
  }
}