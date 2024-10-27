import "./App.css";
import io from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "./Chat";

const socket = io.connect("http://localhost:3002");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    socket.on("room_status", (data) => {
      if (data.hasAdvocate && role === "advocate") {
        setError("This room already has an advocate. Please join as a client.");
      } else {
        setShowChat(true);
        setError("");
      }
    });
  }, [role]);

  const joinRoom = () => { 
    if (username !== "" && room !== "" && role !== "") {
      socket.emit("join_room", { room, role });
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join A Chat</h3>
          <input
            type="text"
            placeholder="John..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <select onChange={(event) => setRole(event.target.value)}>
            <option value="">Select Role</option>
            <option value="advocate">Advocate</option>
            <option value="client">Client</option>
          </select>
          <button onClick={joinRoom}>Join A Room</button>
          {error && <p className="error">{error}</p>}
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} role={role} />
      )}
    </div>
  );
}

export default App;
