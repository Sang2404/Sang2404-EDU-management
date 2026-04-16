import 'package:flutter/material.dart';
import '../models/schedule.dart';
import '../models/grade.dart';
import '../utils/constants.dart';

class CourseCard extends StatelessWidget {
  final String subjectName;
  final String subjectId;
  final String sectionCode;
  final String lecturerName;
  final int credits;
  final List<Schedule>? schedules;
  final Grade? grade;
  final bool isCompleted;

  const CourseCard({
    super.key,
    required this.subjectName,
    required this.subjectId,
    required this.sectionCode,
    required this.lecturerName,
    required this.credits,
    this.schedules,
    this.grade,
    required this.isCompleted,
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
            // Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        subjectName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '$subjectId - $sectionCode',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isCompleted && grade != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppConstants.defaultPadding,
                      vertical: AppConstants.smallPadding,
                    ),
                    decoration: BoxDecoration(
                      color: _getGradeColor(context, grade!.average),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      grade!.displayAverage,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Lecturer and credits
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
                    lecturerName,
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
                  '$credits tín chỉ',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),

            // Schedule information for current courses
            if (!isCompleted && schedules != null && schedules!.isNotEmpty) ...[
              const SizedBox(height: AppConstants.defaultPadding),
              const Divider(),
              const SizedBox(height: AppConstants.smallPadding),
              Text(
                'Lịch học:',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: AppConstants.smallPadding),
              ...schedules!.map((schedule) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    SizedBox(
                      width: 60,
                      child: Text(
                        schedule.dayName,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                    Text(
                      schedule.timeRange,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(width: AppConstants.defaultPadding),
                    Icon(
                      Icons.location_on,
                      size: 12,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      schedule.room,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              )),
            ],

            // Grade breakdown for completed courses
            if (isCompleted && grade != null && grade!.isComplete) ...[
              const SizedBox(height: AppConstants.defaultPadding),
              const Divider(),
              const SizedBox(height: AppConstants.smallPadding),
              Row(
                children: [
                  Expanded(
                    child: _buildGradeItem(
                      context,
                      'CC',
                      grade!.attendance?.toStringAsFixed(1) ?? '--',
                    ),
                  ),
                  Expanded(
                    child: _buildGradeItem(
                      context,
                      'GK',
                      grade!.midterm?.toStringAsFixed(1) ?? '--',
                    ),
                  ),
                  Expanded(
                    child: _buildGradeItem(
                      context,
                      'CK',
                      grade!.final_?.toStringAsFixed(1) ?? '--',
                    ),
                  ),
                  Expanded(
                    child: _buildGradeItem(
                      context,
                      'Kết quả',
                      grade!.isPassing ? 'Đạt' : 'Không đạt',
                      color: grade!.isPassing ? Colors.green : Colors.red,
                    ),
                  ),
                ],
              ),
            ],

            // Status for completed courses
            if (isCompleted && grade != null) ...[
              const SizedBox(height: AppConstants.smallPadding),
              Row(
                children: [
                  Icon(
                    grade!.isPassing ? Icons.check_circle : Icons.cancel,
                    size: 16,
                    color: grade!.isPassing ? Colors.green : Colors.red,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    grade!.status,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: grade!.isPassing ? Colors.green : Colors.red,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${grade!.semester} ${grade!.academicYear}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildGradeItem(BuildContext context, String label, String value, {Color? color}) {
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
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
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