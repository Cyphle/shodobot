import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Space, Spin, Alert, Input, Button } from 'antd';
import { SendOutlined, RobotOutlined } from '@ant-design/icons';
import type { Message } from '../types/chat';
import MarkdownRenderer from './MarkdownRenderer';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onSendMessage,
  isLoading,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ width: '50%', maxWidth: '800px' }}>
      {/* Messages Area */}
      <Card 
        style={{ 
          background: '#000000',
          border: '1px solid #333',
          borderRadius: '12px',
          marginBottom: '20px',
          minHeight: '400px',
          maxHeight: '500px',
          overflowY: 'auto'
        }}
        styles={{ body: { padding: '20px' } }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <RobotOutlined style={{ fontSize: '48px', color: '#DC2626', marginBottom: '16px' }} />
            <Title level={3} style={{ color: 'white', marginBottom: '8px' }}>
              Bienvenue sur ShodoBot
            </Title>
            <Text style={{ color: '#999', fontSize: '16px' }}>
              Comment puis-je vous aider aujourd'hui ?
            </Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: message.role === 'user' ? '#DC2626' : '#333',
                    color: 'white',
                    wordWrap: 'break-word'
                  }}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <Text style={{ color: 'white' }}>{message.content}</Text>
                  )}
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#333',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Spin size="small" />
                  <Text style={{ color: 'white' }}>ShodoBot réfléchit...</Text>
                </div>
              </div>
            )}

            {error && (
              <Alert
                message={`Erreur: ${error}`}
                type="error"
                style={{ marginTop: '16px' }}
              />
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Input Area */}
      <Card 
        style={{ 
          background: '#000000',
          border: '1px solid #333',
          borderRadius: '12px'
        }}
        styles={{ body: { padding: '20px' } }}
      >
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            disabled={isLoading}
            autoSize={{ minRows: 2, maxRows: 6 }}
            style={{
              background: '#111',
              border: '1px solid #333',
              color: 'white',
              borderRadius: '8px 0 0 8px'
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            style={{
              background: '#DC2626',
              borderColor: '#DC2626',
              borderRadius: '0 8px 8px 0',
              height: 'auto',
              minHeight: '40px',
              color: 'white'
            }}
          >
            Envoyer
          </Button>
        </Space.Compact>
        
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Text style={{ color: '#666', fontSize: '12px' }}>
            ShodoBot peut faire des erreurs. Vérifiez les informations importantes.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ChatContainer;
