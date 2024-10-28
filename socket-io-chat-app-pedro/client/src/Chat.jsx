import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room, role }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    // Clear messages when component mounts
    setMessageList([]);

    // Listen for previous messages when joining room
    socket.on("previous_messages", (messages) => {
      console.log("Received previous messages:", messages);
      if (Array.isArray(messages) && messages.length > 0) {
        // Set messages directly, don't append to empty array
        setMessageList(messages);
      }
    });

    socket.on("receive_message", (data) => {
      console.log("Received new message:", data);
      setMessageList((list) => [...list, data]);
    });

    socket.on("message_sent", (data) => {
      console.log("Message sent confirmation:", data);
      setMessageList((list) => [...list, data]);
    });

    socket.on("user_joined", (data) => {
      const systemMessage = {
        room: room,
        author: "System",
        message: data.message,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        role: "system"
      };
      setMessageList((list) => [...list, systemMessage]);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error.message);
      // Handle error appropriately in your UI
    });

    return () => {
      socket.off("previous_messages");
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("user_joined");
      socket.off("error");
    };
  }, [socket, room, username]); // Add username to dependencies

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: `${username} (${role})`,
        message: currentMessage,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        role: role
      };

      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  const renderMessage = (messageContent, index) => {
    const isSystem = messageContent.author === "System";
    const isCurrentUser = !isSystem && messageContent.author.split(' ')[0] === username;

    return (
      <div
        key={index}
        className="message"
        id={isSystem ? "system" : isCurrentUser ? "you" : "other"}
      >
        <div>
          <div className="message-content">
            <p>{messageContent.message}</p>
          </div>
          <div className="message-meta">
            <p id="time">{messageContent.time}</p>
            <p id="author">{messageContent.author}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat - Room {room}</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => 
            renderMessage(messageContent, index)
          )}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
