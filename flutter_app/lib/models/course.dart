class Course {
  final int sectionId;
  final String sectionName;
  final String subjectName;
  final int credits;
  final String lecturerName;
  final DateTime? enrollmentDate;
  final String? semester;
  final String? academicYear;
  final String? scheduleInfo;
  final String? rooms;

  Course({
    required this.sectionId,
    required this.sectionName,
    required this.subjectName,
    required this.credits,
    required this.lecturerName,
    this.enrollmentDate,
    this.semester,
    this.academicYear,
    this.scheduleInfo,
    this.rooms,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      sectionId: json['section_id'] ?? 0,
      sectionName: json['section_name'] ?? '',
      subjectName: json['subject_name'] ?? '',
      credits: json['credits'] ?? 0,
      lecturerName: json['lecturer_name'] ?? '',
      enrollmentDate: json['enrollment_date'] != null 
          ? DateTime.parse(json['enrollment_date']) 
          : null,
      semester: json['semester'],
      academicYear: json['academic_year'],
      scheduleInfo: json['schedule_info'],
      rooms: json['rooms'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'section_id': sectionId,
      'section_name': sectionName,
      'subject_name': subjectName,
      'credits': credits,
      'lecturer_name': lecturerName,
      'enrollment_date': enrollmentDate?.toIso8601String(),
      'semester': semester,
      'academic_year': academicYear,
      'schedule_info': scheduleInfo,
      'rooms': rooms,
    };
  }

  // Generate course duration based on semester and academic year
  String get courseDuration {
    if (semester != null && academicYear != null) {
      // Assuming semester format like "HK1", "HK2", etc.
      if (semester == 'HK1') {
        return 'Tháng 9 - Tháng 12 $academicYear';
      } else if (semester == 'HK2') {
        return 'Tháng 1 - Tháng 5 ${int.parse(academicYear!) + 1}';
      } else if (semester == 'HK3') {
        return 'Tháng 6 - Tháng 8 ${int.parse(academicYear!) + 1}';
      }
    }
    return 'Chưa xác định';
  }
}