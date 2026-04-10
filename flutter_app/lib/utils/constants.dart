class AppConstants {
  // API Configuration
  static const String baseUrl = 'http://localhost:5001/api';
  
  // Endpoints
  static const String loginEndpoint = '/auth/login-mobile';
  static const String scheduleEndpoint = '/academic/student-schedule';
  static const String gradesEndpoint = '/grades/student';
  static const String coursesEndpoint = '/academic/student-courses';
  static const String requestsEndpoint = '/academic-requests';
  static const String sectionsEndpoint = '/academic/student-sections';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String refreshTokenKey = 'refresh_token';
  
  // App Info
  static const String appName = 'EDU Student';
  static const String appVersion = '1.0.0';
  
  // UI Constants
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  
  // Colors
  static const int primaryColorValue = 0xFF1976D2;
  static const int secondaryColorValue = 0xFF03DAC6;
  
  // Request Types
  static const String reviewRequest = 'REVIEW';
  static const String reserveRequest = 'RESERVE';
  static const String retakeRequest = 'RETAKE';
  
  // Request Status
  static const String pendingStatus = 'PENDING';
  static const String approvedStatus = 'APPROVED';
  static const String rejectedStatus = 'REJECTED';
}