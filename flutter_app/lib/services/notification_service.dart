import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:logger/logger.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  final Logger _logger = Logger();

  static Future<void> initialize() async {
    final instance = NotificationService();
    // await instance._initializeFirebase();
    await instance._initializeLocalNotifications();
  }

  Future<void> _initializeFirebase() async {
    try {
      // Request permission
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      _logger.d('User granted permission: ${settings.authorizationStatus}');

      // Get FCM token
      String? token = await _firebaseMessaging.getToken();
      _logger.d('FCM Token: $token');

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);

      // Handle notification taps
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      // Handle initial message (app opened from terminated state)
      RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
      if (initialMessage != null) {
        _handleNotificationTap(initialMessage);
      }
    } catch (e) {
      _logger.e('Firebase initialization error: $e');
    }
  }

  Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _handleLocalNotificationTap,
    );
  }

  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    _logger.d('Foreground message: ${message.messageId}');
    
    // Show local notification for foreground messages
    await _showLocalNotification(
      title: message.notification?.title ?? 'Thông báo',
      body: message.notification?.body ?? '',
      payload: message.data.toString(),
    );
  }

  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    final logger = Logger();
    logger.d('Background message: ${message.messageId}');
  }

  void _handleNotificationTap(RemoteMessage message) {
    _logger.d('Notification tapped: ${message.messageId}');
    // Handle navigation based on message data
    _navigateBasedOnNotification(message.data);
  }

  void _handleLocalNotificationTap(NotificationResponse response) {
    _logger.d('Local notification tapped: ${response.payload}');
    // Handle navigation based on payload
  }

  Future<void> _showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'edu_channel',
      'EDU Notifications',
      channelDescription: 'Notifications for EDU Student App',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: false,
    );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails();

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      platformChannelSpecifics,
      payload: payload,
    );
  }

  void _navigateBasedOnNotification(Map<String, dynamic> data) {
    // Implement navigation logic based on notification data
    final type = data['type'];
    switch (type) {
      case 'grade_update':
        // Navigate to grades page
        break;
      case 'schedule_change':
        // Navigate to schedule page
        break;
      case 'request_response':
        // Navigate to requests page
        break;
      default:
        // Navigate to home
        break;
    }
  }

  Future<String?> getFCMToken() async {
    return await _firebaseMessaging.getToken();
  }
}