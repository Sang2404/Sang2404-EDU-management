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
    return Schedule(
      scheduleId: json['schedule_id'] ?? 0,
      sectionId: json['section_id'] ?? 0,
      subjectName: json['subject_name'] ?? '',
      subjectId: json['subject_id'] ?? '',
      sectionCode: json['section_code'] ?? '',
      lecturerName: json['lecturer_name'] ?? '',
      dayOfWeek: json['day_of_week'] ?? 0,
      startPeriod: json['start_period'] ?? 0,
      endPeriod: json['end_period'] ?? 0,
      room: json['room'] ?? '',
      credits: json['credits'] ?? 0,
    );
  }

  String get dayName {
    const days = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    return dayOfWeek >= 1 && dayOfWeek <= 7 ? days[dayOfWeek] : '';
  }

  String get timeRange {
    return 'Tiết $startPeriod - $endPeriod';
  }

  String get periodTime {
    // Convert period to actual time
    // Tiết 1-5: 7:00 - 11:30 (4.5 hours)
    // Tiết 6-10: 13:00 - 17:30 (4.5 hours)
    
    if (startPeriod >= 1 && endPeriod <= 5) {
      return '07:00 - 11:30';
    } else if (startPeriod >= 6 && endPeriod <= 10) {
      return '13:00 - 17:30';
    } else {
      // Fallback for other periods
      return 'Tiết $startPeriod - $endPeriod';
    }
  }
}