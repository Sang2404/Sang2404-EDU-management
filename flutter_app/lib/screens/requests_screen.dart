import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/request_provider.dart';
import '../models/academic_request.dart';
import '../utils/constants.dart';
import '../widgets/request_card.dart';
import '../widgets/request_form.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_widget.dart';

class RequestsScreen extends StatefulWidget {
  const RequestsScreen({super.key});

  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RequestProvider>().initialize();
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
      body: Consumer<RequestProvider>(
        builder: (context, requestProvider, child) {
          if (requestProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (requestProvider.error != null) {
            return CustomErrorWidget(
              message: requestProvider.error!,
              onRetry: () => requestProvider.initialize(),
            );
          }

          return Column(
            children: [
              // Tab bar
              Container(
                color: Theme.of(context).colorScheme.surface,
                child: TabBar(
                  controller: _tabController,
                  isScrollable: true,
                  tabs: const [
                    Tab(text: 'Tất cả'),
                    Tab(text: 'Phúc khảo'),
                    Tab(text: 'Bảo lưu'),
                    Tab(text: 'Học lại'),
                  ],
                ),
              ),
              
              // Tab content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildAllRequests(requestProvider),
                    _buildRequestsByType(requestProvider, AppConstants.reviewRequest),
                    _buildRequestsByType(requestProvider, AppConstants.reserveRequest),
                    _buildRequestsByType(requestProvider, AppConstants.retakeRequest),
                  ],
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showRequestForm(),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildAllRequests(RequestProvider requestProvider) {
    final requests = requestProvider.requests;
    
    if (requests.isEmpty) {
      return const EmptyState(
        icon: Icons.assignment,
        title: 'Chưa có yêu cầu nào',
        subtitle: 'Bạn chưa gửi yêu cầu học vụ nào',
      );
    }

    return RefreshIndicator(
      onRefresh: () => requestProvider.refreshRequests(),
      child: ListView.builder(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        itemCount: requests.length,
        itemBuilder: (context, index) {
          return RequestCard(request: requests[index]);
        },
      ),
    );
  }

  Widget _buildRequestsByType(RequestProvider requestProvider, String type) {
    final requests = requestProvider.getRequestsByType(type);
    
    if (requests.isEmpty) {
      String emptyMessage;
      switch (type) {
        case AppConstants.reviewRequest:
          emptyMessage = 'Bạn chưa gửi yêu cầu phúc khảo nào';
          break;
        case AppConstants.reserveRequest:
          emptyMessage = 'Bạn chưa gửi yêu cầu bảo lưu nào';
          break;
        case AppConstants.retakeRequest:
          emptyMessage = 'Bạn chưa gửi yêu cầu học lại nào';
          break;
        default:
          emptyMessage = 'Không có yêu cầu nào';
      }

      return EmptyState(
        icon: Icons.assignment,
        title: 'Chưa có yêu cầu',
        subtitle: emptyMessage,
      );
    }

    return RefreshIndicator(
      onRefresh: () => requestProvider.refreshRequests(),
      child: ListView.builder(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        itemCount: requests.length,
        itemBuilder: (context, index) {
          return RequestCard(request: requests[index]);
        },
      ),
    );
  }

  void _showRequestForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.9,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: const RequestForm(),
      ),
    );
  }
}