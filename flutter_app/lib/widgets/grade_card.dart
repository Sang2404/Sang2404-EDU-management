import 'package:flutter/material.dart';
import '../models/grade.dart';
import '../utils/constants.dart';

class GradeCard extends StatelessWidget {
  final Grade grade;

  const GradeCard({
    super.key,
    required this.grade,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppConstants.defaultPadding),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Subject name and average
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        grade.subjectName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${grade.subjectId} - ${grade.sectionCode}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppConstants.defaultPadding,
                    vertical: AppConstants.smallPadding,
                  ),
                  decoration: BoxDecoration(
                    color: _getGradeColor(context, grade.average),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    grade.displayAverage,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Grade breakdown - luôn hiển thị 3 cột điểm
            Row(
              children: [
                Expanded(
                  child: _buildGradeItem(
                    context,
                    'Chuyên cần',
                    grade.attendance?.toStringAsFixed(1) ?? '--',
                  ),
                ),
                Expanded(
                  child: _buildGradeItem(
                    context,
                    'Giữa kỳ',
                    grade.midterm?.toStringAsFixed(1) ?? '--',
                  ),
                ),
                Expanded(
                  child: _buildGradeItem(
                    context,
                    'Cuối kỳ',
                    grade.final_?.toStringAsFixed(1) ?? '--',
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Additional info
            Row(
              children: [
                Icon(
                  Icons.person,
                  size: 16,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    grade.lecturerName,
                    style: Theme.of(context).textTheme.bodyMedium,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: AppConstants.defaultPadding),
                Icon(
                  Icons.school,
                  size: 16,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 4),
                Text(
                  '${grade.credits} TC',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            const SizedBox(height: AppConstants.smallPadding),

            // Status
            Row(
              children: [
                Icon(
                  grade.isPassing ? Icons.check_circle : Icons.cancel,
                  size: 16,
                  color: grade.isPassing ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 4),
                Text(
                  grade.status,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: grade.isPassing ? Colors.green : Colors.red,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                if (grade.letterGrade != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppConstants.smallPadding,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.secondaryContainer,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      grade.letterGrade!,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSecondaryContainer,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGradeItem(BuildContext context, String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Color _getGradeColor(BuildContext context, double? average) {
    if (average == null) return Colors.grey;
    if (average >= 8.5) return Colors.green;
    if (average >= 7.0) return Colors.blue;
    if (average >= 5.5) return Colors.orange;
    if (average >= 4.0) return Colors.amber;
    return Colors.red;
  }
}