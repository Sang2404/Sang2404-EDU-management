import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../providers/schedule_provider.dart';
import '../models/schedule.dart';
import '../utils/constants.dart';
import '../widgets/schedule_card.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_widget.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _dayNames.length, vsync: this);
    
    // Set initial tab to today
    final today = DateTime.now().weekday;
    final initialIndex = today == 7 ? 6 : today - 1; // Convert to 0-based index
    _tabController.index = initialIndex;
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ScheduleProvider>().fetchSchedules();
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
      body: Consumer<ScheduleProvider>(
        builder: (context, scheduleProvider, child) {
          if (scheduleProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (scheduleProvider.error != null) {
            return CustomErrorWidget(
              message: scheduleProvider.error!,
              onRetry: () => scheduleProvider.fetchSchedules(),
            );
          }

          return Column(
            children: [
              // Today's summary card
              _buildTodaySummary(scheduleProvider),
              
              // Week view tabs
              Container(
                color: Theme.of(context).colorScheme.surface,
                child: TabBar(
                  controller: _tabController,
                  isScrollable: true,
                  tabs: _dayNames.map((day) => Tab(text: day)).toList(),
                ),
              ),
              
              // Schedule content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: List.generate(_dayNames.length, (index) {
                    final dayOfWeek = index == 6 ? 7 : index + 2; // Convert to our day format
                    final daySchedules = scheduleProvider.getSchedulesForDay(dayOfWeek);
                    
                    return _buildDaySchedule(daySchedules, _dayNames[index]);
                  }),
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.read<ScheduleProvider>().refreshSchedules(),
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _buildTodaySummary(ScheduleProvider scheduleProvider) {
    final todaySchedules = scheduleProvider.todaySchedules;
    final today = DateFormat('EEEE, dd/MM/yyyy', 'vi_VN').format(DateTime.now());

    return Container(
      margin: const EdgeInsets.all(AppConstants.defaultPadding),
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.primary.withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Hôm nay',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            today,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: AppConstants.smallPadding),
          Row(
            children: [
              Icon(Icons.class_, color: Colors.white, size: 20),
              const SizedBox(width: AppConstants.smallPadding),
              Text(
                '${todaySchedules.length} lớp học',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          if (todaySchedules.isNotEmpty) ...[
            const SizedBox(height: AppConstants.smallPadding),
            Text(
              'Tiết tiếp theo: ${_getNextClass(todaySchedules)}',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white70,
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _getNextClass(List<Schedule> schedules) {
    final now = DateTime.now();
    final currentPeriod = _getCurrentPeriod(now);
    
    for (final schedule in schedules) {
      if (schedule.startPeriod > currentPeriod) {
        return '${schedule.subjectName} (${schedule.timeRange})';
      }
    }
    
    return 'Không có lớp học nào';
  }

  int _getCurrentPeriod(DateTime time) {
    final hour = time.hour;
    final minute = time.minute;
    final totalMinutes = hour * 60 + minute;
    
    // Assuming each period is 45 minutes starting at 7:00
    final startTime = 7 * 60; // 7:00 AM in minutes
    if (totalMinutes < startTime) return 0;
    
    return ((totalMinutes - startTime) ~/ 45) + 1;
  }

  Widget _buildDaySchedule(List<Schedule> schedules, String dayName) {
    if (schedules.isEmpty) {
      return EmptyState(
        icon: Icons.event_busy,
        title: 'Không có lịch học',
        subtitle: 'Bạn không có lớp học nào vào $dayName',
      );
    }

    return RefreshIndicator(
      onRefresh: () => context.read<ScheduleProvider>().refreshSchedules(),
      child: ListView.builder(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        itemCount: schedules.length,
        itemBuilder: (context, index) {
          return ScheduleCard(schedule: schedules[index]);
        },
      ),
    );
  }
}