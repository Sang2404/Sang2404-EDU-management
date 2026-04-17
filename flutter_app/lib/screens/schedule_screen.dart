import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../providers/schedule_provider.dart';
import '../models/schedule.dart';
import '../utils/constants.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_widget.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  final List<String> _dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  final List<String> _dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ScheduleProvider>().fetchSchedules();
    });
  }

  List<DateTime> _getCurrentWeekDates() {
    final now = DateTime.now();
    final monday = now.subtract(Duration(days: now.weekday - 1));
    return List.generate(7, (index) => monday.add(Duration(days: index)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
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

          return RefreshIndicator(
            onRefresh: () => scheduleProvider.refreshSchedules(),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildOverviewCard(scheduleProvider),
                  _buildMainHeader(),
                  _buildWeeklySchedule(scheduleProvider),
                  const SizedBox(height: 80), // Space for FAB
                ],
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.read<ScheduleProvider>().refreshSchedules(),
        backgroundColor: const Color(0xFF1E2124),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.refresh, color: Colors.white),
      ),
    );
  }

  Widget _buildOverviewCard(ScheduleProvider provider) {
    final todaySchedules = provider.todaySchedules;
    final now = DateTime.now();
    
    final dayFormatter = DateFormat('EEEE', 'vi_VN');
    String dayName = dayFormatter.format(now);
    if (dayName.isNotEmpty) {
      dayName = dayName.split(' ').map((str) => str.isNotEmpty ? '${str[0].toUpperCase()}${str.substring(1).toLowerCase()}' : '').join(' ');
    }
    
    final dateStr = DateFormat('dd/MM/yyyy').format(now);
    final fullDate = '$dayName,\n$dateStr';

    final currentPeriod = _getCurrentPeriod(now);
    int remaining = 0;
    for (var s in todaySchedules) {
       if (s.startPeriod >= currentPeriod) remaining++;
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(20, 20, 20, 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2124),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ]
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'TỔNG QUAN LỊCH HỌC',
            style: TextStyle(
              color: Colors.white54,
              fontSize: 10,
              letterSpacing: 1.5,
              fontWeight: FontWeight.w600,
            )
          ),
          const SizedBox(height: 12),
          Text(
            fullDate,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
              height: 1.2,
            )
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'SỐ LỚP HÔM NAY',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 10,
                        letterSpacing: 1.0,
                        fontWeight: FontWeight.w600,
                      )
                    ),
                    const SizedBox(height: 4),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${todaySchedules.length}\n',
                            style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const TextSpan(
                            text: 'Lớp học',
                            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
                          ),
                        ]
                      )
                    )
                  ]
                )
              ),
              Container(
                height: 40,
                width: 1,
                color: Colors.white24,
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                     const Text(
                      'TRẠNG THÁI',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 10,
                        letterSpacing: 1.0,
                        fontWeight: FontWeight.w600,
                      )
                    ),
                    const SizedBox(height: 4),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '$remaining\n',
                            style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const TextSpan(
                            text: 'Còn lại',
                            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
                          ),
                        ]
                      )
                    )
                  ]
                )
              ),
            ]
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.08),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.play_arrow, color: Colors.black, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'LỚP TIẾP THEO',
                        style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _getNextClassName(todaySchedules),
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      )
                    ]
                  )
                ),
                const Icon(Icons.chevron_right, color: Colors.white54),
              ]
            )
          )
        ]
      )
    );
  }

  String _getNextClassName(List<Schedule> schedules) {
    if (schedules.isEmpty) return 'Không có lớp học nào';
    final now = DateTime.now();
    final currentPeriod = _getCurrentPeriod(now);
    
    for (final schedule in schedules) {
      if (schedule.startPeriod >= currentPeriod) {
        return schedule.subjectName;
      }
    }
    return schedules.last.subjectName;
  }

  int _getCurrentPeriod(DateTime time) {
    final hour = time.hour;
    final minute = time.minute;
    final totalMinutes = hour * 60 + minute;
    
    final startTime = 7 * 60; // 7:00 AM
    if (totalMinutes < startTime) return 0;
    
    return ((totalMinutes - startTime) ~/ 45) + 1;
  }
  
  Widget _buildMainHeader() {
    final now = DateTime.now();
    final monthStr = 'THÁNG ${now.month}, ${now.year}';
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Thời khóa biểu',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E2124),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.blueAccent.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              monthStr,
              style: const TextStyle(
                color: Colors.blueAccent,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          )
        ]
      )
    );
  }

  Widget _buildWeekHeader(List<DateTime> weekDates) {
    return SizedBox(
      height: 60,
      child: Row(
        children: List.generate(7, (index) {
          final date = weekDates[index];
          final dayLabel = _dayLabels[index];
          final isToday = _isToday(date);
          
          return Expanded(
            child: Container(
              margin: EdgeInsets.only(right: index < 6 ? 2 : 0),
              decoration: BoxDecoration(
                color: isToday ? const Color(0xFF1E2124) : Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    dayLabel,
                    style: TextStyle(
                      color: isToday ? Colors.white : const Color(0xFF1E2124),
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '(${DateFormat('dd/MM').format(date)})',
                    style: TextStyle(
                      color: isToday ? Colors.white70 : Colors.grey,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildWeeklySchedule(ScheduleProvider scheduleProvider) {
    final weekDates = _getCurrentWeekDates();
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          // Header row with day names
          _buildWeekHeader(weekDates),
          const SizedBox(height: 8),
          // Time slots grid
          _buildTimeGrid(scheduleProvider, weekDates),
        ],
      ),
    );
  }

  Widget _buildTimeGrid(ScheduleProvider scheduleProvider, List<DateTime> weekDates) {
    // Define time periods (morning, afternoon, and evening sessions)
    final List<Map<String, dynamic>> timePeriods = [
      {'label': 'Sáng', 'periods': [1, 2, 3, 4, 5], 'time': '7:00-11:30'},
      {'label': 'Chiều', 'periods': [6, 7, 8, 9, 10], 'time': '13:00-17:30'},
      {'label': 'Tối', 'periods': [11, 12, 13, 14, 15], 'time': '18:30-22:00'},
    ];
    
    return Column(
      children: timePeriods.map((timeSlot) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Time slot header
              Container(
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                decoration: BoxDecoration(
                  color: _getTimeSlotHeaderColor(timeSlot['label']),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      timeSlot['label'],
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      timeSlot['time'],
                      style: const TextStyle(
                        fontSize: 10,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              // Grid for this time slot
              SizedBox(
                height: 120, // Fixed height for each time slot
                child: Row(
                  children: List.generate(7, (dayIndex) {
                    final dayOfWeek = dayIndex == 6 ? 7 : dayIndex + 2;
                    final daySchedules = scheduleProvider.getSchedulesForDay(dayOfWeek);
                    
                    // Find schedule that overlaps with this time period
                    Schedule? schedule;
                    try {
                      schedule = daySchedules.firstWhere(
                        (s) => timeSlot['periods'].any((period) => 
                          period >= s.startPeriod && period <= s.endPeriod),
                      );
                    } catch (e) {
                      schedule = null;
                    }
                    
                    return Expanded(
                      child: Container(
                        margin: EdgeInsets.only(right: dayIndex < 6 ? 2 : 0),
                        child: schedule != null 
                          ? _buildScheduleBlock(schedule, timeSlot['label'])
                          : _buildEmptyBlock(),
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildScheduleBlock(Schedule schedule, String timeSlot) {
    // Determine colors based on time slot
    Color bgColor;
    Color borderColor;
    
    switch (timeSlot) {
      case 'Sáng':
        bgColor = Colors.blue.withOpacity(0.1);
        borderColor = Colors.blue;
        break;
      case 'Chiều':
        bgColor = Colors.orange.withOpacity(0.1);
        borderColor = Colors.orange;
        break;
      case 'Tối':
        bgColor = Colors.purple.withOpacity(0.1);
        borderColor = Colors.purple;
        break;
      default:
        bgColor = Colors.grey.withOpacity(0.1);
        borderColor = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            schedule.subjectName,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: borderColor,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          if (schedule.sectionCode.isNotEmpty)
            Text(
              '(${schedule.sectionCode})',
              style: TextStyle(
                fontSize: 9,
                color: borderColor.withOpacity(0.8),
              ),
            ),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (schedule.room.isNotEmpty)
                Text(
                  'Phòng: ${schedule.room}',
                  style: TextStyle(
                    fontSize: 9,
                    color: borderColor.withOpacity(0.8),
                  ),
                ),
              if (schedule.lecturerName.isNotEmpty)
                Text(
                  'GV: ${schedule.lecturerName}',
                  style: TextStyle(
                    fontSize: 9,
                    color: borderColor.withOpacity(0.8),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyBlock() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: const Center(
        child: Text(
          '',
          style: TextStyle(
            color: Colors.grey,
            fontSize: 10,
          ),
        ),
      ),
    );
  }

  Color _getTimeSlotHeaderColor(String timeSlot) {
    switch (timeSlot) {
      case 'Sáng':
        return Colors.blue;
      case 'Chiều':
        return Colors.orange;
      case 'Tối':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && 
           date.month == now.month && 
           date.day == now.day;
  }
}