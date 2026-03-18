import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Use the environment variable, with a fallback just in case
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(backendUrl);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [message, setMessage] = useState('');
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Load message history from the server
    socket.on('load_history', (messages) => {
      setChatList(messages);
    });

    // Listen for incoming messages from the server
    socket.on('receive_message', (data) => {
      // Add the new message to our list of chats
      setChatList((prevList) => [...prevList, data]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('load_history');
      socket.off('receive_message');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault(); // Prevent page reload
    if (message.trim() !== '') {
      const messageData = {
        id: Date.now(),
        text: message,
        senderId: socket.id, // Keep track of who sent it
        timestamp: new Date().toLocaleTimeString(),
      };

      // Send the message to the backend
      socket.emit('send_message', messageData);
      
      // Clear the input field
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-sans p-4">
      
      {/* Header and Connection Status */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-wide">Real-Time Chat</h1>
        <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-300 font-mono">
             {isConnected ? socket.id.substring(0, 6) + '...' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-gray-800 w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
        
        {/* Message Display Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
          {chatList.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
             chatList.map((msg) => (
              <div 
                key={msg._id || msg.id} 
                className={`flex flex-col max-w-[75%] ${msg.senderId === socket.id ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div className={`px-4 py-3 rounded-2xl ${msg.senderId === socket.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-700 text-gray-100 rounded-tl-none'}`}>
                  {msg.text}
                </div>
                <span className="text-xs text-gray-500 mt-1">{msg.timestamp}</span>
              </div>
            ))
          )}
        </div>

        {/* Input Form Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!isConnected || message.trim() === ''}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;