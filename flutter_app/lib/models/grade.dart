class Grade {
  final int gradeId;
  final int sectionId;
  final String studentId;
  final String subjectName;
  final String subjectId;
  final String sectionCode;
  final String lecturerName;
  final double? attendance;
  final double? midterm;
  final double? final_;
  final double? average;
  final String? letterGrade;
  final int credits;
  final String semester;
  final String academicYear;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Grade({
    required this.gradeId,
    required this.sectionId,
    required this.studentId,
    required this.subjectName,
    required this.subjectId,
    required this.sectionCode,
    required this.lecturerName,
    this.attendance,
    this.midterm,
    this.final_,
    this.average,
    this.letterGrade,
    required this.credits,
    required this.semester,
    required this.academicYear,
    this.createdAt,
    this.updatedAt,
  });

  factory Grade.fromJson(Map<String, dynamic> json) {
    return Grade(
      gradeId: json['grade_id'] ?? 0,
      sectionId: json['section_id'] ?? 0,
      studentId: json['student_id']?.toString() ?? '',
      subjectName: json['subject_name'] ?? '',
      subjectId: json['subject_id'] ?? '',
      sectionCode: json['section_name'] ?? json['section_code'] ?? '',
      lecturerName: json['lecturer_name'] ?? '',
      attendance: _parseDouble(json['attendance']),
      midterm: _parseDouble(json['midterm']),
      final_: _parseDouble(json['final']),
      average: _parseDouble(json['average']),
      letterGrade: json['letter_grade'],
      credits: json['credits'] ?? 0,
      semester: json['semester'] ?? 'HK1',
      academicYear: json['academic_year'] ?? '2024-2025',
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) {
      // Trim whitespace and handle empty strings
      final trimmed = value.trim();
      if (trimmed.isEmpty) return null;
      try {
        return double.parse(trimmed);
      } catch (e) {
        print('Error parsing double from string: "$value" - $e');
        return null;
      }
    }
    print('Unexpected value type for double parsing: $value (${value.runtimeType})');
    return null;
  }

  bool get isComplete {
    // Có điểm trung bình hoặc có ít nhất một trong các điểm thành phần
    return average != null && average! > 0 || 
           (attendance != null || midterm != null || final_ != null);
  }

  bool get isPassing {
    return average != null && average! >= 4.0;
  }

  String get status {
    if (!isComplete) return 'Chưa có điểm';
    if (isPassing) return 'Đạt';
    return 'Không đạt';
  }

  String get displayAverage {
    if (average == null) return '--';
    return average!.toStringAsFixed(1);
  }
}