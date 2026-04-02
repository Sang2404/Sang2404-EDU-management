class AcademicRequest {
  final int requestId;
  final String studentId;
  final String requestType;
  final int? gradeId;
  final int? sectionId;
  final String reason;
  final String status;
  final String? adminResponse;
  final DateTime createdAt;
  final DateTime? updatedAt;
  
  // Additional fields from joins
  final String? subjectName;
  final String? sectionCode;
  final String? lecturerName;

  AcademicRequest({
    required this.requestId,
    required this.studentId,
    required this.requestType,
    this.gradeId,
    this.sectionId,
    required this.reason,
    required this.status,
    this.adminResponse,
    required this.createdAt,
    this.updatedAt,
    this.subjectName,
    this.sectionCode,
    this.lecturerName,
  });

  factory AcademicRequest.fromJson(Map<String, dynamic> json) {
    return AcademicRequest(
      requestId: json['request_id'] ?? 0,
      studentId: json['student_id']?.toString() ?? '',
      requestType: json['request_type'] ?? '',
      gradeId: json['grade_id'],
      sectionId: json['section_id'],
      reason: json['reason'] ?? '',
      status: json['status'] ?? '',
      adminResponse: json['admin_response'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
      subjectName: json['subject_name'],
      sectionCode: json['section_code'],
      lecturerName: json['lecturer_name'],
    );
  }

  String get typeDisplayName {
    switch (requestType) {
      case 'REVIEW':
        return 'Phúc khảo';
      case 'RESERVE':
        return 'Bảo lưu';
      case 'RETAKE':
        return 'Học lại';
      default:
        return requestType;
    }
  }

  String get statusDisplayName {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  }

  bool get isPending => status == 'PENDING';
  bool get isApproved => status == 'APPROVED';
  bool get isRejected => status == 'REJECTED';
}