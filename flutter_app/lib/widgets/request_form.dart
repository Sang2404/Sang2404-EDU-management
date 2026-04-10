import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/request_provider.dart';
import '../models/grade.dart';
import '../utils/constants.dart';

class RequestForm extends StatefulWidget {
  const RequestForm({super.key});

  @override
  State<RequestForm> createState() => _RequestFormState();
}

class _RequestFormState extends State<RequestForm> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _reviewFormKey = GlobalKey<FormState>();
  final _reserveFormKey = GlobalKey<FormState>();
  final _retakeFormKey = GlobalKey<FormState>();

  final _reviewReasonController = TextEditingController();
  final _reserveReasonController = TextEditingController();
  final _retakeReasonController = TextEditingController();

  int? _selectedGradeId;
  int? _selectedReserveSectionId;
  int? _selectedRetakeSectionId;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _reviewReasonController.dispose();
    _reserveReasonController.dispose();
    _retakeReasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gửi yêu cầu học vụ'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Phúc khảo'),
            Tab(text: 'Bảo lưu'),
            Tab(text: 'Học lại'),
          ],
        ),
      ),
      body: Consumer<RequestProvider>(
        builder: (context, requestProvider, child) {
          return TabBarView(
            controller: _tabController,
            children: [
              _buildReviewForm(requestProvider),
              _buildReserveForm(requestProvider),
              _buildRetakeForm(requestProvider),
            ],
          );
        },
      ),
    );
  }

  Widget _buildReviewForm(RequestProvider requestProvider) {
    return Padding(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      child: Form(
        key: _reviewFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Yêu cầu phúc khảo điểm',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppConstants.smallPadding),
            Text(
              'Chọn môn học có điểm dưới 4.0 để gửi yêu cầu phúc khảo',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Grade selection
            DropdownButtonFormField<int>(
              value: _selectedGradeId,
              decoration: const InputDecoration(
                labelText: 'Chọn môn học',
                prefixIcon: Icon(Icons.book),
              ),
              items: requestProvider.availableGrades.map((grade) {
                return DropdownMenuItem<int>(
                  value: grade.gradeId,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(grade.subjectName),
                      Text(
                        '${grade.subjectId} - Điểm: ${grade.displayAverage}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedGradeId = value;
                });
              },
              validator: (value) {
                if (value == null) {
                  return 'Vui lòng chọn môn học';
                }
                return null;
              },
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Reason
            TextFormField(
              controller: _reviewReasonController,
              decoration: const InputDecoration(
                labelText: 'Lý do phúc khảo',
                prefixIcon: Icon(Icons.edit),
                alignLabelWithHint: true,
              ),
              maxLines: 4,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Vui lòng nhập lý do phúc khảo';
                }
                return null;
              },
            ),
            const Spacer(),

            // Submit button
            ElevatedButton(
              onPressed: requestProvider.isSubmitting
                  ? null
                  : () => _submitReviewRequest(requestProvider),
              child: requestProvider.isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Gửi yêu cầu phúc khảo'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReserveForm(RequestProvider requestProvider) {
    return Padding(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      child: Form(
        key: _reserveFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Yêu cầu bảo lưu học phần',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppConstants.smallPadding),
            Text(
              'Chọn lớp học phần bạn muốn bảo lưu',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Section selection
            DropdownButtonFormField<int>(
              value: _selectedReserveSectionId,
              decoration: const InputDecoration(
                labelText: 'Chọn lớp học phần',
                prefixIcon: Icon(Icons.class_),
              ),
              items: requestProvider.availableSections.map<DropdownMenuItem<int>>((section) {
                return DropdownMenuItem<int>(
                  value: section['section_id'],
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(section['subject_name'] ?? ''),
                      Text(
                        '${section['subject_id']} - ${section['section_code']}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedReserveSectionId = value;
                });
              },
              validator: (value) {
                if (value == null) {
                  return 'Vui lòng chọn lớp học phần';
                }
                return null;
              },
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Reason
            TextFormField(
              controller: _reserveReasonController,
              decoration: const InputDecoration(
                labelText: 'Lý do bảo lưu',
                prefixIcon: Icon(Icons.edit),
                alignLabelWithHint: true,
              ),
              maxLines: 4,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Vui lòng nhập lý do bảo lưu';
                }
                return null;
              },
            ),
            const Spacer(),

            // Submit button
            ElevatedButton(
              onPressed: requestProvider.isSubmitting
                  ? null
                  : () => _submitReserveRequest(requestProvider),
              child: requestProvider.isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Gửi yêu cầu bảo lưu'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRetakeForm(RequestProvider requestProvider) {
    return Padding(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      child: Form(
        key: _retakeFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Yêu cầu học lại',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppConstants.smallPadding),
            Text(
              'Chọn lớp học phần bạn muốn học lại',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Section selection
            DropdownButtonFormField<int>(
              value: _selectedRetakeSectionId,
              decoration: const InputDecoration(
                labelText: 'Chọn lớp học phần',
                prefixIcon: Icon(Icons.class_),
              ),
              items: requestProvider.availableSections.map<DropdownMenuItem<int>>((section) {
                return DropdownMenuItem<int>(
                  value: section['section_id'],
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(section['subject_name'] ?? ''),
                      Text(
                        '${section['subject_id']} - ${section['section_code']}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedRetakeSectionId = value;
                });
              },
              validator: (value) {
                if (value == null) {
                  return 'Vui lòng chọn lớp học phần';
                }
                return null;
              },
            ),
            const SizedBox(height: AppConstants.defaultPadding),

            // Reason
            TextFormField(
              controller: _retakeReasonController,
              decoration: const InputDecoration(
                labelText: 'Lý do học lại',
                prefixIcon: Icon(Icons.edit),
                alignLabelWithHint: true,
              ),
              maxLines: 4,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Vui lòng nhập lý do học lại';
                }
                return null;
              },
            ),
            const Spacer(),

            // Submit button
            ElevatedButton(
              onPressed: requestProvider.isSubmitting
                  ? null
                  : () => _submitRetakeRequest(requestProvider),
              child: requestProvider.isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Gửi yêu cầu học lại'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitReviewRequest(RequestProvider requestProvider) async {
    if (!_reviewFormKey.currentState!.validate()) return;

    final success = await requestProvider.submitReviewRequest(
      _selectedGradeId!,
      _reviewReasonController.text.trim(),
    );

    if (success && mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gửi yêu cầu phúc khảo thành công')),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(requestProvider.error ?? 'Có lỗi xảy ra')),
      );
    }
  }

  Future<void> _submitReserveRequest(RequestProvider requestProvider) async {
    if (!_reserveFormKey.currentState!.validate()) return;

    final success = await requestProvider.submitReserveRequest(
      _selectedReserveSectionId!,
      _reserveReasonController.text.trim(),
    );

    if (success && mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gửi yêu cầu bảo lưu thành công')),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(requestProvider.error ?? 'Có lỗi xảy ra')),
      );
    }
  }

  Future<void> _submitRetakeRequest(RequestProvider requestProvider) async {
    if (!_retakeFormKey.currentState!.validate()) return;

    final success = await requestProvider.submitRetakeRequest(
      _selectedRetakeSectionId!,
      _retakeReasonController.text.trim(),
    );

    if (success && mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gửi yêu cầu học lại thành công')),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(requestProvider.error ?? 'Có lỗi xảy ra')),
      );
    }
  }
}