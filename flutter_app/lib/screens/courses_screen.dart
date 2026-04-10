import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/course_provider.dart';
import '../providers/grade_provider.dart';
import '../models/course.dart';
import '../models/grade.dart';
import '../utils/constants.dart';
import '../widgets/course_card.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_widget.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CourseProvider>().fetchCourses();
      context.read<GradeProvider>().fetchGrades();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Tab bar
          Container(
            color: Theme.of(context).colorScheme.surface,
            child: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Đang học', icon: Icon(Icons.school)),
                Tab(text: 'Đã hoàn thành', icon: Icon(Icons.check_circle)),
              ],
            ),
          ),
          
          // Tab content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildCurrentCourses(),
                _buildCompletedCourses(),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _refreshData(),
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _buildCurrentCourses() {
    return Consumer<CourseProvider>(
      builder: (context, courseProvider, child) {
        if (courseProvider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (courseProvider.error != null) {
          return CustomErrorWidget(
            message: courseProvider.error!,
            onRetry: () => courseProvider.fetchCourses(),
          );
        }

        final courses = courseProvider.courses;
        if (courses.isEmpty) {
          return const EmptyState(
            icon: Icons.school,
            title: 'Không có khóa học',
            subtitle: 'Bạn chưa đăng ký khóa học nào trong học kỳ này',
          );
        }

        return RefreshIndicator(
          onRefresh: () => courseProvider.refreshCourses(),
          child: ListView.builder(
            padding: const EdgeInsets.all(AppConstants.defaultPadding),
            itemCount: courses.length,
            itemBuilder: (context, index) {
              final course = courses[index];
              
              return Card(
                margin: const EdgeInsets.only(bottom: AppConstants.defaultPadding),
                child: Padding(
                  padding: const EdgeInsets.all(AppConstants.defaultPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Subject name and credits
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              course.subjectName,
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '${course.credits} tín chỉ',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.w500,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      // Section code
                      Row(
                        children: [
                          Icon(
                            Icons.class_,
                            size: 16,
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Lớp: ${course.sectionName}',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      
                      // Lecturer
                      Row(
                        children: [
                          Icon(
                            Icons.person,
                            size: 16,
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'GV: ${course.lecturerName}',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      
                      // Course duration
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today,
                            size: 16,
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Thời gian: ${course.courseDuration}',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ),
                        ],
                      ),
                      
                      // Schedule info
                      if (course.scheduleInfo != null && course.scheduleInfo!.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              Icons.schedule,
                              size: 16,
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Lịch học: ${course.scheduleInfo}',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                      
                      // Rooms
                      if (course.rooms != null && course.rooms!.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              Icons.room,
                              size: 16,
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Phòng học: ${course.rooms}',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildCompletedCourses() {
    return Consumer<GradeProvider>(
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

        final completedGrades = gradeProvider.grades.where((g) => g.isComplete).toList();
        if (completedGrades.isEmpty) {
          return const EmptyState(
            icon: Icons.check_circle,
            title: 'Chưa hoàn thành khóa học nào',
            subtitle: 'Bạn chưa hoàn thành khóa học nào',
          );
        }

        return RefreshIndicator(
          onRefresh: () => gradeProvider.refreshGrades(),
          child: ListView.builder(
            padding: const EdgeInsets.all(AppConstants.defaultPadding),
            itemCount: completedGrades.length,
            itemBuilder: (context, index) {
              final grade = completedGrades[index];
              
              return CourseCard(
                subjectName: grade.subjectName,
                subjectId: grade.subjectId,
                sectionCode: grade.sectionCode,
                lecturerName: grade.lecturerName,
                credits: grade.credits,
                grade: grade,
                isCompleted: true,
              );
            },
          ),
        );
      },
    );
  }

  void _refreshData() {
    context.read<CourseProvider>().refreshCourses();
    context.read<GradeProvider>().refreshGrades();
  }
}