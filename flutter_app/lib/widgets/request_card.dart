import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/academic_request.dart';
import '../utils/constants.dart';

class RequestCard extends StatelessWidget {
  final AcademicRequest request;

  const RequestCard({
    super.key,
    required this.request,
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
            // Header with type and status
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppConstants.defaultPadding,
                    vertical: AppConstants.smallPadding,
                  ),
                  decoration: BoxDecoration(
                    color: _getTypeColor(request.requestType),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    request.typeDisplayName,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppConstants.defaultPadding,
                    vertical: AppConstants.smallPadding,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(request.status),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getStatusIcon(request.status),
                        size: 14,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        request.statusDisplayName,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Subject information
            if (request.subjectName != null) ...[
              Row(
                children: [
                  Icon(
                    Icons.book,
                    size: 16,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      request.subjectName!,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              if (request.sectionCode != null) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    const SizedBox(width: 20),
                    Text(
                      'Lớp: ${request.sectionCode}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ],
              if (request.lecturerName != null) ...[
                const SizedBox(width: 4),
                Row(
                  children: [
                    const SizedBox(width: 20),
                    Text(
                      'GV: ${request.lecturerName}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: AppConstants.defaultPadding),
            ],

            // Reason
            Text(
              'Lý do:',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppConstants.defaultPadding),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                request.reason,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),

            // Admin response (if available)
            if (request.adminResponse != null) ...[
              const SizedBox(height: AppConstants.defaultPadding),
              Text(
                'Phản hồi:',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppConstants.defaultPadding),
                decoration: BoxDecoration(
                  color: _getStatusColor(request.status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _getStatusColor(request.status).withOpacity(0.3),
                  ),
                ),
                child: Text(
                  request.adminResponse!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ],

            const SizedBox(height: AppConstants.defaultPadding),

            // Timestamps
            Row(
              children: [
                Icon(
                  Icons.access_time,
                  size: 14,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 4),
                Text(
                  'Gửi: ${DateFormat('dd/MM/yyyy HH:mm').format(request.createdAt)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                if (request.updatedAt != null) ...[
                  const SizedBox(width: AppConstants.defaultPadding),
                  Icon(
                    Icons.update,
                    size: 14,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Cập nhật: ${DateFormat('dd/MM/yyyy HH:mm').format(request.updatedAt!)}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case AppConstants.reviewRequest:
        return Colors.blue;
      case AppConstants.reserveRequest:
        return Colors.orange;
      case AppConstants.retakeRequest:
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case AppConstants.pendingStatus:
        return Colors.amber;
      case AppConstants.approvedStatus:
        return Colors.green;
      case AppConstants.rejectedStatus:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case AppConstants.pendingStatus:
        return Icons.hourglass_empty;
      case AppConstants.approvedStatus:
        return Icons.check_circle;
      case AppConstants.rejectedStatus:
        return Icons.cancel;
      default:
        return Icons.help;
    }
  }
}