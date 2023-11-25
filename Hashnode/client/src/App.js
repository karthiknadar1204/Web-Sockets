import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

const App = () => {
  const [message, setMessage] = useState('');
  const [messageReceived,setMessageReceived]=useState()

  const sendMessage = () => {
    socket.emit('send_message', { message });
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
        setMessageReceived(data.message);
    });
  }, []);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div className="app">
      <input
        type="text"
        placeholder="message"
        value={message}
        onChange={handleInputChange}
      />
      <button onClick={sendMessage}>Send message</button>
      <h1>Message:</h1>
      {messageReceived}
    </div>
  );
};

export default App;
