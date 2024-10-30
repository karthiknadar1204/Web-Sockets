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
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    const userName = params.get('username');
    const userRole = params.get('role');

    if (roomId && userName && userRole) {
      checkAndJoinRoom(roomId, userName, userRole);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAndJoinRoom = async (roomId, userName, userRole) => {
    try {
      const response = await fetch(`http://localhost:3002/api/room/${roomId}`);
      const roomData = await response.json();

      if (roomData) {
        if (userRole === 'advocate' && roomData.hasAdvocate) {
          setError("This room already has an advocate. Please join as a client.");
          setLoading(false);
          return;
        }

        setUsername(userName);
        setRoom(roomId);
        setRole(userRole);
        
        socket.emit("join_room", {
          room: roomId,
          role: userRole,
          username: userName
        });
      }
    } catch (error) {
      console.error("Error checking room:", error);
      setError("Error joining room");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    if (username.trim() !== "" && room.trim() !== "" && role !== "") {
      const roomNumber = room.trim();
      

      const url = new URL(window.location.href);
      url.searchParams.set('room', roomNumber);
      url.searchParams.set('username', username.trim());
      url.searchParams.set('role', role);
      window.history.pushState({}, '', url);

      socket.emit("join_room", {
        room: roomNumber,
        role,
        username: username.trim()
      });
    } else {
      setError("Please fill in all fields");
    }
  };

  useEffect(() => {
    socket.on("room_status", (data) => {
        if (data.error) {
            setError(data.error);
            setShowChat(false);
        } else if (data.success) {
            setShowChat(true);
            setError("");
            

            const url = new URL(window.location.href);
            url.searchParams.set('room', room);
            url.searchParams.set('username', username.trim());
            url.searchParams.set('role', role);
            window.history.pushState({}, '', url);
        }
    });

    return () => {
        socket.off("room_status");
    };
  }, [role, room, username]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join A Chat</h3>
          <input
            type="text"
            placeholder="John..."
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            value={room}
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <select value={role} onChange={(event) => setRole(event.target.value)}>
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