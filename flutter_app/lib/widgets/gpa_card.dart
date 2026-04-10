import 'package:flutter/material.dart';
import '../utils/constants.dart';

class GPACard extends StatelessWidget {
  final double gpa;
  final int totalCredits;
  final int completedCredits;
  final int completedSubjects;
  final int totalSubjects;

  const GPACard({
    super.key,
    required this.gpa,
    required this.totalCredits,
    required this.completedCredits,
    required this.completedSubjects,
    required this.totalSubjects,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppConstants.defaultPadding),
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _getGPAColor(gpa),
            _getGPAColor(gpa).withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: _getGPAColor(gpa).withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // GPA Display
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Column(
                children: [
                  Text(
                    'GPA TỔNG KẾT',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: Colors.white70,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    gpa.toStringAsFixed(2),
                    style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    _getGPALevel(gpa),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppConstants.defaultPadding),

          // Statistics
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  context,
                  'Tín chỉ',
                  '$completedCredits/$totalCredits',
                  Icons.school,
                ),
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white30,
              ),
              Expanded(
                child: _buildStatItem(
                  context,
                  'Môn học',
                  '$completedSubjects/$totalSubjects',
                  Icons.book,
                ),
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white30,
              ),
              Expanded(
                child: _buildStatItem(
                  context,
                  'Hoàn thành',
                  '${totalSubjects > 0 ? ((completedSubjects / totalSubjects) * 100).toInt() : 0}%',
                  Icons.check_circle,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(BuildContext context, String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(
          icon,
          color: Colors.white70,
          size: 20,
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Colors.white70,
          ),
        ),
      ],
    );
  }

  Color _getGPAColor(double gpa) {
    if (gpa >= 3.6) return Colors.green;
    if (gpa >= 3.2) return Colors.blue;
    if (gpa >= 2.5) return Colors.orange;
    if (gpa >= 2.0) return Colors.amber;
    return Colors.red;
  }

  String _getGPALevel(double gpa) {
    if (gpa >= 3.6) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung bình';
    return 'Yếu';
  }
}