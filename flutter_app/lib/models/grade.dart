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
      sectionCode: json['section_code'] ?? '',
      lecturerName: json['lecturer_name'] ?? '',
      attendance: json['attendance']?.toDouble(),
      midterm: json['midterm']?.toDouble(),
      final_: json['final']?.toDouble(),
      average: json['average']?.toDouble(),
      letterGrade: json['letter_grade'],
      credits: json['credits'] ?? 0,
      semester: json['semester'] ?? '',
      academicYear: json['academic_year'] ?? '',
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }

  bool get isComplete {
    return attendance != null && midterm != null && final_ != null;
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