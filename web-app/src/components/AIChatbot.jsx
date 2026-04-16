import { useState, useEffect, useRef } from 'react';
import { Button, Card, Input, Avatar, Space, Spin, message, Badge, Tooltip } from 'antd';
import { 
  MessageOutlined, 
  CloseOutlined, 
  SendOutlined, 
  RobotOutlined,
  UserOutlined,
  BulbOutlined
} from '@ant-design/icons';
import api from '../config/axios';
import '../styles/AIChatbot.css';

const { TextArea } = Input;

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    
    // Load suggested questions
    loadSuggestedQuestions();
    
    // Welcome message
    if (messages.length === 0) {
      setMessages([{
        type: 'bot',
        content: `Xin chào ${userData?.full_name || 'bạn'}! 👋\n\nTôi là trợ lý học tập AI của bạn. Tôi có thể giúp bạn:\n\n📊 Phân tích điểm số và GPA\n💡 Tư vấn cải thiện học tập\n📚 Gợi ý môn học phù hợp\n🎯 Đưa ra lời khuyên cụ thể\n\nHãy hỏi tôi bất cứ điều gì về kết quả học tập của bạn!`,
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestedQuestions = async () => {
    try {
      const response = await api.get('/ai-chat/suggestions');
      setSuggestedQuestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.post('/ai-chat/message', {
        message: messageText
      });

      const botMessage = {
        type: 'bot',
        content: response.data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      message.error('Không thể kết nối với AI. Vui lòng thử lại!');
      const errorMessage = {
        type: 'bot',
        content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau! 😔',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    sendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Tooltip title="Trợ lý AI - Hỏi về điểm số của bạn" placement="left">
          <Badge dot={messages.length === 1}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<RobotOutlined style={{ fontSize: 24 }} />}
              onClick={() => setIsOpen(true)}
              className="ai-chatbot-button"
              style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                width: 60,
                height: 60,
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
                zIndex: 1000
              }}
            />
          </Badge>
        </Tooltip>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className="ai-chatbot-window"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 400,
            height: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}
          bodyStyle={{ 
            padding: 0, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '8px 8px 0 0'
          }}>
            <Space>
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#fff', color: '#1890ff' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Trợ lý AI</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Luôn sẵn sàng hỗ trợ bạn</div>
              </div>
            </Space>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
              style={{ color: 'white' }}
            />
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f5f5f5'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 12
                }}
              >
                {msg.type === 'bot' && (
                  <Avatar 
                    icon={<RobotOutlined />} 
                    size="small" 
                    style={{ marginRight: 8, backgroundColor: '#1890ff' }} 
                  />
                )}
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    backgroundColor: msg.type === 'user' ? '#1890ff' : 'white',
                    color: msg.type === 'user' ? 'white' : 'black',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.content}
                </div>
                {msg.type === 'user' && (
                  <Avatar 
                    icon={<UserOutlined />} 
                    size="small" 
                    style={{ marginLeft: 8, backgroundColor: '#52c41a' }} 
                  />
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<RobotOutlined />} size="small" style={{ backgroundColor: '#1890ff' }} />
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <Spin size="small" /> Đang suy nghĩ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && suggestedQuestions.length > 0 && (
            <div style={{ 
              padding: '12px 16px', 
              borderTop: '1px solid #f0f0f0',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ 
                fontSize: 12, 
                color: '#666', 
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <BulbOutlined /> Gợi ý câu hỏi:
              </div>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    size="small"
                    type="link"
                    onClick={() => handleSuggestedQuestion(question)}
                    style={{ 
                      textAlign: 'left', 
                      padding: '4px 8px',
                      height: 'auto',
                      whiteSpace: 'normal'
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </Space>
            </div>
          )}

          {/* Input */}
          <div style={{ 
            padding: '12px 16px', 
            borderTop: '1px solid #f0f0f0',
            backgroundColor: 'white'
          }}>
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi về điểm số của bạn..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                disabled={loading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => sendMessage()}
                loading={loading}
                disabled={!inputMessage.trim()}
              />
            </Space.Compact>
          </div>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
