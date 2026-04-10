import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/grade_provider.dart';
import '../models/grade.dart';
import '../utils/constants.dart';
import '../widgets/grade_card.dart';
import '../widgets/gpa_card.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_widget.dart';

class GradesScreen extends StatefulWidget {
  const GradesScreen({super.key});

  @override
  State<GradesScreen> createState() => _GradesScreenState();
}

class _GradesScreenState extends State<GradesScreen> {
  String _selectedSemester = 'all';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<GradeProvider>().fetchGrades();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<GradeProvider>(
        builder: (context, gradeProvider, child) {
          if (gradeProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (gradeProvider.error != null) {
            return CustomErrorWidget(
              message: gradeProvider.error!,
              onRetry: () => gradeProvider.fetchGrades(),
            );
          }

          final gradesBySemester = gradeProvider.gradesBySemester;
          final semesters = gradesBySemester.keys.toList()..sort((a, b) => b.compareTo(a));

          return Column(
            children: [
              // GPA Summary
              GPACard(
                gpa: gradeProvider.gpa,
                totalCredits: gradeProvider.totalCredits,
                completedCredits: gradeProvider.completedCredits,
                completedSubjects: gradeProvider.completedGradesCount,
                totalSubjects: gradeProvider.grades.length,
              ),

              // Semester Filter
              if (semesters.isNotEmpty) _buildSemesterFilter(semesters),

              // Grades List
              Expanded(
                child: _buildGradesList(gradeProvider, gradesBySemester),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.read<GradeProvider>().refreshGrades(),
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _buildSemesterFilter(List<String> semesters) {
    return Container(
      height: 50,
      margin: const EdgeInsets.symmetric(vertical: AppConstants.smallPadding),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppConstants.defaultPadding),
        children: [
          _buildFilterChip('Tất cả', 'all'),
          ...semesters.map((semester) => _buildFilterChip(semester, semester)),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedSemester == value;
    
    return Container(
      margin: const EdgeInsets.only(right: AppConstants.smallPadding),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedSemester = value;
          });
        },
        backgroundColor: Theme.of(context).colorScheme.surface,
        selectedColor: Theme.of(context).colorScheme.primaryContainer,
        checkmarkColor: Theme.of(context).colorScheme.onPrimaryContainer,
      ),
    );
  }

  Widget _buildGradesList(GradeProvider gradeProvider, Map<String, List<Grade>> gradesBySemester) {
    if (gradeProvider.grades.isEmpty) {
      return const EmptyState(
        icon: Icons.grade,
        title: 'Chưa có điểm số',
        subtitle: 'Bạn chưa có điểm số nào được ghi nhận',
      );
    }

    if (_selectedSemester == 'all') {
      return _buildAllGrades(gradesBySemester);
    } else {
      final semesterGrades = gradesBySemester[_selectedSemester] ?? [];
      return _buildSemesterGrades(semesterGrades, _selectedSemester);
    }
  }

  Widget _buildAllGrades(Map<String, List<Grade>> gradesBySemester) {
    final semesters = gradesBySemester.keys.toList()..sort((a, b) => b.compareTo(a));

    return RefreshIndicator(
      onRefresh: () => context.read<GradeProvider>().refreshGrades(),
      child: ListView.builder(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        itemCount: semesters.length,
        itemBuilder: (context, index) {
          final semester = semesters[index];
          final grades = gradesBySemester[semester]!;
          final semesterGPA = context.read<GradeProvider>().getGpaForSemester(
            grades.first.semester,
            grades.first.academicYear,
          );

          return Card(
            margin: const EdgeInsets.only(bottom: AppConstants.defaultPadding),
            child: ExpansionTile(
              title: Text(
                semester,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              subtitle: Text('GPA: ${semesterGPA.toStringAsFixed(2)} • ${grades.length} môn'),
              children: grades.map((grade) => GradeCard(grade: grade)).toList(),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSemesterGrades(List<Grade> grades, String semester) {
    if (grades.isEmpty) {
      return EmptyState(
        icon: Icons.grade,
        title: 'Không có điểm số',
        subtitle: 'Không có điểm số nào cho $semester',
      );
    }

    final semesterGPA = context.read<GradeProvider>().getGpaForSemester(
      grades.first.semester,
      grades.first.academicYear,
    );

    return RefreshIndicator(
      onRefresh: () => context.read<GradeProvider>().refreshGrades(),
      child: Column(
        children: [
          // Semester GPA
          Container(
            margin: const EdgeInsets.all(AppConstants.defaultPadding),
            padding: const EdgeInsets.all(AppConstants.defaultPadding),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'GPA $semester',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                ),
                Text(
                  semesterGPA.toStringAsFixed(2),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                ),
              ],
            ),
          ),

          // Grades list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: AppConstants.defaultPadding),
              itemCount: grades.length,
              itemBuilder: (context, index) {
                return GradeCard(grade: grades[index]);
              },
            ),
          ),
        ],
      ),
    );
  }
}