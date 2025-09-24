import { Layout, Typography, theme } from 'antd';
import ChatContainer from './components/ChatContainer';
import { useChat } from './hooks/useChat';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh', background: '#000000' }}>
      <Header style={{ 
        background: '#000000', 
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#DC2626',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>S</Text>
          </div>
          <div>
            <Title level={3} style={{ color: 'white', margin: 0 }}>ShodoBot</Title>
            <Text style={{ color: '#999' }}>Assistant IA Shodo</Text>
          </div>
        </div>
      </Header>
      
      <Content style={{ 
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <ChatContainer
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          error={error}
        />
      </Content>
    </Layout>
  );
}

export default App;
