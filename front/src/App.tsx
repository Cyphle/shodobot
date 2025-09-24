import ChatContainer from './components/ChatContainer';
import { useChat } from './hooks/useChat';

function App() {
  const { messages, isLoading, error, sendMessage } = useChat();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <ChatContainer
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

export default App;
