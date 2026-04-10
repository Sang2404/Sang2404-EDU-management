import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
// import 'package:firebase_core/firebase_core.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'providers/auth_provider.dart';
import 'providers/schedule_provider.dart';
import 'providers/grade_provider.dart';
import 'providers/request_provider.dart';
import 'providers/course_provider.dart';
// import 'services/notification_service.dart';
import 'utils/app_theme.dart';
import 'screens/login_screen.dart';
import 'screens/schedule_screen.dart';
import 'screens/grades_screen.dart';
import 'screens/courses_screen.dart';
import 'screens/requests_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  // await Firebase.initializeApp();
  
  // Initialize notification service
  // await NotificationService.initialize();
  
  // Initialize date formatting for Vietnamese
  await initializeDateFormatting('vi_VN', null);
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ScheduleProvider()),
        ChangeNotifierProvider(create: (_) => GradeProvider()),
        ChangeNotifierProvider(create: (_) => RequestProvider()),
        ChangeNotifierProvider(create: (_) => CourseProvider()),
      ],
      child: MaterialApp(
        title: 'EDU Student App',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        home: const AuthWrapper(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    // Clear any existing auth data and force login
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _clearAuthAndInitialize();
    });
  }

  Future<void> _clearAuthAndInitialize() async {
    // Clear any stored auth data first
    final authProvider = context.read<AuthProvider>();
    await authProvider.logout(); // This will clear stored tokens
    
    // Then initialize (which should result in no user)
    await authProvider.initialize();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.isLoading) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }
        
        if (authProvider.isLoggedIn) {
          return const MainApp();
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}

class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  State<MainApp> createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> {
  int _currentIndex = 0;
  
  final List<Widget> _screens = [
    const ScheduleScreen(),
    const GradesScreen(),
    const CoursesScreen(),
    const RequestsScreen(),
  ];
  
  final List<String> _titles = [
    'Lịch học',
    'Điểm số',
    'Khóa học',
    'Yêu cầu',
  ];

  @override
  void initState() {
    super.initState();
    // Initialize data after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ScheduleProvider>().fetchSchedules();
      context.read<GradeProvider>().fetchGrades();
      context.read<RequestProvider>().fetchRequests();
      context.read<CourseProvider>().fetchCourses();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_currentIndex]),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                context.read<AuthProvider>().logout();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    const Icon(Icons.person),
                    const SizedBox(width: 8),
                    Text(context.read<AuthProvider>().user?.fullName ?? 'Hồ sơ'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout),
                    SizedBox(width: 8),
                    Text('Đăng xuất'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.schedule),
            label: 'Lịch học',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.grade),
            label: 'Điểm số',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.book),
            label: 'Khóa học',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment),
            label: 'Yêu cầu',
          ),
        ],
      ),
    );
  }
}