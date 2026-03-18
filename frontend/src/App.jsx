import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(backendUrl);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [message, setMessage] = useState('');
  const [chatList, setChatList] = useState([]);
  
  // Party System State
  const [currentParty, setCurrentParty] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatList]);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      if (currentParty) {
        // Re-join logic
        socket.emit('join_party', currentParty);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('party_joined', (partyId) => {
      setCurrentParty(partyId);
      setErrorMsg('');
      setJoinCodeInput('');
    });

    socket.on('party_error', (msg) => {
      setErrorMsg(msg);
    });

    socket.on('load_history', (messages) => {
      setChatList(messages);
    });

    socket.on('receive_message', (data) => {
      setChatList((prevList) => [...prevList, data]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('party_joined');
      socket.off('party_error');
      socket.off('load_history');
      socket.off('receive_message');
    };
  }, [currentParty]);

  const generatePartyCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createAndJoinParty = () => {
    if (!userName.trim()) {
      setErrorMsg("Please enter your name first!");
      return;
    }
    const code = generatePartyCode();
    setChatList([]);
    socket.emit('create_party', code);
  };

  const joinExistingParty = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg("Please enter your name first!");
      return;
    }
    const code = joinCodeInput.trim().toUpperCase();
    if (code) {
      setChatList([]);
      socket.emit('join_party', code);
    }
  };

  const leaveParty = () => {
    setCurrentParty(null);
    setChatList([]);
    setErrorMsg('');
  };

  const sendMessage = (e) => {
    e.preventDefault(); 
    if (message.trim() !== '' && currentParty) {
      const messageData = {
        id: Date.now(),
        text: message,
        senderId: socket.id,
        senderName: userName.trim() || 'Anonymous',
        partyId: currentParty,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      socket.emit('send_message', messageData);
      setMessage('');
    }
  };

  // ---------------------------------------------------------------------------
  // WELCOME SCREEN RENDER 
  // ---------------------------------------------------------------------------
  if (!currentParty) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center font-sans relative overflow-hidden">
        
        {/* Cool, crisp mesh gradient background */}
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-blue-300/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0 pointer-events-none"></div>
        <div className="absolute top-[10%] right-[-20%] w-[50rem] h-[50rem] bg-cyan-300/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60rem] h-[60rem] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0 pointer-events-none"></div>

        <div className="w-full max-w-lg mx-4 bg-white/70 backdrop-blur-3xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[2.5rem] p-10 z-10 flex flex-col transform transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative">
          
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl opacity-20 blur-2xl"></div>

          <div className="text-center mb-10 mt-4 relative z-10">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-500 tracking-tight mb-3">
              Messenger
            </h1>
            <p className="text-slate-500 font-bold text-sm px-4 uppercase tracking-widest">
              Secure Chat Platform
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {errorMsg && (
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-red-600 font-bold">{errorMsg}</p>
              </div>
            )}

            {/* Name Input */}
            <div className="group">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-blue-500">Display Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={userName}
                  onChange={(e) => { setUserName(e.target.value); setErrorMsg(''); }}
                  className="w-full bg-white/90 border-2 border-slate-200/80 rounded-xl px-5 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-lg leading-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 pt-4">
              <button 
                onClick={createAndJoinParty}
                disabled={!isConnected}
                className="group relative w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Create New Room
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="h-[2px] bg-slate-200 w-full"></div>
                <span className="absolute bg-white px-4 text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">OR JOIN EXISTING</span>
              </div>

              <form onSubmit={joinExistingParty} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Room Code..."
                  value={joinCodeInput}
                  onChange={(e) => { setJoinCodeInput(e.target.value); setErrorMsg(''); }}
                  className="flex-1 bg-white border-2 border-slate-200/80 rounded-xl px-5 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 font-black uppercase tracking-widest transition-all shadow-sm"
                  maxLength={10}
                />
                <button 
                  type="submit"
                  disabled={!joinCodeInput.trim() || !isConnected}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-8 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:bg-slate-300 disabled:text-slate-500 uppercase tracking-wide"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-8 flex justify-center items-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CHAT SCREEN RENDER (Cool Boyish Mode)
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans items-center sm:py-6 overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden block">
        <div className="absolute top-[10%] left-[5%] w-[30rem] h-[30rem] bg-blue-200 rounded-full mix-blend-multiply filter blur-[90px] opacity-60"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] bg-cyan-200 rounded-full mix-blend-multiply filter blur-[90px] opacity-60"></div>
      </div>

      <div className="w-full h-full sm:w-[95vw] sm:max-w-6xl sm:h-[92vh] bg-white/80 backdrop-blur-3xl sm:rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white relative z-10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-6 sm:px-10 flex-shrink-0 z-30 shadow-sm relative">
           
           <div className="flex items-center gap-4">
             <button 
                onClick={leaveParty}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                title="Disconnect from Room"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
             </button>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Room Link Details</span>
                <div className="flex items-center gap-3 group cursor-pointer bg-slate-100/50 px-3 py-1 rounded-md border border-slate-200/50 hover:bg-slate-200 transition-colors" onClick={() => navigator.clipboard.writeText(currentParty)} title="Click to copy server ID">
                  <h2 className="text-xl font-black text-slate-800 tracking-widest leading-none">
                    {currentParty}
                  </h2>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
             </div>
           </div>

           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200/60">
             <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold shadow-sm">
               {userName.charAt(0).toUpperCase()}
             </div>
             <span className="font-bold text-slate-700 hidden sm:block">
               {userName}
             </span>
           </div>
        </div>

        {/* Message View Area */}
        <div className="flex-1 overflow-y-auto w-full relative bg-slate-50/60 flex flex-col justify-end custom-scrollbar">
          
          {/* Cool tech/gamer doodle pattern background */}
          <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
               style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 10 L10 30 L18 30 L15 50 L35 25 L25 25 Z' fill='%23eab308' opacity='0.7'/%3E%3Cg stroke='%233b82f6' stroke-width='2.5' fill='none'%3E%3Ccircle cx='80' cy='30' r='10'/%3E%3Cpath d='M80 15 v5 M80 40 v5 M65 30 h5 M90 30 h5'/%3E%3C/g%3E%3Cpath d='M30 80 L40 75 L50 80 L50 90 L40 95 L30 90 Z' stroke='%2306b6d4' stroke-width='2.5' fill='none'/%3E%3Cpath d='M80 85 V95 M85 80 V100 M90 87 V93 M95 82 V98' stroke='%23f97316' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")` 
               }}>
          </div>
          
          <div className="p-6 sm:p-10 space-y-6 relative z-10 w-full overflow-y-auto flex-1">
            {chatList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-5 pb-10">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center transform -rotate-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div className="text-center bg-white/80 px-6 py-4 rounded-xl border border-white shadow-sm backdrop-blur-md">
                  <h3 className="text-lg font-black text-slate-800 mb-1 uppercase tracking-wide">Waiting for friends</h3>
                  <p className="text-slate-500 font-medium text-sm">Send room code <strong className="text-slate-800 bg-slate-200 px-2 py-1 rounded-md tracking-widest">{currentParty}</strong></p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center mb-10 sticky top-4 z-20 pointer-events-none">
                  <div className="bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                    Secure Channel Open
                  </div>
                </div>

                {chatList.map((msg, index) => {
                  const isMe = msg.senderId === socket.id;
                  
                  return (
                    <div 
                      key={msg._id || msg.id || index} 
                      className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-200`}
                    >
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                        
                        {!isMe && (
                          <span className="text-[11px] font-black text-slate-500 ml-4 mb-1 tracking-widest uppercase">
                            {msg.senderName}
                          </span>
                        )}

                        <div className={`relative px-5 py-3.5 shadow-sm border ${
                          isMe 
                            ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl rounded-tr-sm border-transparent shadow-blue-500/20' 
                            : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border-slate-200'
                          }`}
                        >
                          <div className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap break-words">
                            {msg.text}
                          </div>
                          
                          <div className={`text-[10px] font-bold mt-1.5 flex justify-end gap-1 items-center ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                            {msg.timestamp}
                            {isMe && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-200" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            )}
          </div>
        </div>

        {/* Input Dock */}
        <div className="px-4 sm:px-10 pb-6 pt-2 z-20 flex-shrink-0 bg-transparent">
          <form onSubmit={sendMessage} className="w-full">
            <div className="flex bg-white/90 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-2 shadow-sm focus-within:shadow-md focus-within:border-blue-500 transition-all">
              
              <div className="pl-4 pr-2 py-2 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none py-3 text-slate-800 placeholder-slate-400 focus:outline-none text-base font-medium"
                disabled={!isConnected}
              />
              
              <button 
                type="submit"
                disabled={!isConnected || message.trim() === ''}
                className="ml-2 bg-slate-800 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl px-6 py-2 flex items-center justify-center transition-all font-bold tracking-wide uppercase shadow-sm active:scale-95 flex-shrink-0"
              >
                Send
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;