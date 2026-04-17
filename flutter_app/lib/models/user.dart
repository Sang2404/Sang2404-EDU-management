class User {
  final String userId;
  final String email;
  final String username;
  final String fullName;
  final String role;
  final bool isActive;

  User({
    required this.userId,
    required this.email,
    required this.username,
    required this.fullName,
    required this.role,
    required this.isActive,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['user_id']?.toString() ?? '',
      email: json['email'] ?? '',
      username: json['username'] ?? '',
      fullName: json['full_name'] ?? '',
      role: json['role'] ?? '',
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'email': email,
      'username': username,
      'full_name': fullName,
      'role': role,
      'is_active': isActive,
    };
  }

  bool get isStudent => role == 'STUDENT';
}