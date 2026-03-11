import React from 'react';
import { Result, Button } from 'antd';

class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chunk loading error:', error, errorInfo);
    // Log to monitoring service if needed
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Lỗi tải trang"
          subTitle="Có lỗi xảy ra khi tải trang. Vui lòng thử lại."
          extra={
            <Button type="primary" onClick={this.handleRetry}>
              Thử lại
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
