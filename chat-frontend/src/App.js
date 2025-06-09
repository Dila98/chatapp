import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('partner_found', () => setConnected(true));
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, { from: 'stranger', text: data.message }]);
    });
    socket.on('partner_left', () => {
      setConnected(false);
      setMessages([]);
      alert('Stranger left the chat.');
    });
  }, []);

  const sendMessage = () => {
    if (msg.trim()) {
      setMessages(prev => [...prev, { from: 'me', text: msg }]);
      socket.emit('send_message', { message: msg });
      setMsg('');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>Anonymous Chat</h2>
      {connected ? (
        <>
          <div style={{ height: 300, overflowY: 'auto', border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            {messages.map((m, i) => (
              <p key={i}><strong>{m.from}:</strong> {m.text}</p>
            ))}
          </div>
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </>
      ) : (
        <p>Searching for a stranger to chat...</p>
      )}
    </div>
  );
}

export default App;