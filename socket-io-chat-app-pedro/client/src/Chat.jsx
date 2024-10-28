import React, { useEffect, useState, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

function Chat({ socket, username, room, role }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const storage = getStorage(app);

  useEffect(() => {
    setMessageList([]);

    socket.on("previous_messages", (messages) => {
      console.log("Received previous messages:", messages);
      if (Array.isArray(messages) && messages.length > 0) {
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
    });

    return () => {
      socket.off("previous_messages");
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("user_joined");
      socket.off("error");
    };
  }, [socket, room, username]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPEG, and PNG files are allowed');
        return;
      }

      if (file.size > maxSize) {
        alert('File size should not exceed 5MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const uploadFile = async (file) => {
    try {
      const fileRef = ref(storage, `chat-files/${room}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "" || selectedFile) {
      setUploading(true);
      try {
        let fileUrl = null;
        if (selectedFile) {
          fileUrl = await uploadFile(selectedFile);
        }

        const messageData = {
          room: room,
          author: `${username} (${role})`,
          message: currentMessage,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          role: role,
          fileUrl: fileUrl,
          fileName: selectedFile?.name || null,
          fileType: selectedFile?.type || null
        };

        await socket.emit("send_message", messageData);
        setCurrentMessage("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      } finally {
        setUploading(false);
      }
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
            {messageContent.fileUrl && (
              <div className="file-attachment">
                {messageContent.fileType?.startsWith('image/') ? (
                  <img 
                    src={messageContent.fileUrl} 
                    alt="attachment" 
                    className="image-preview"
                  />
                ) : (
                  <a 
                    href={messageContent.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    📎 {messageContent.fileName || 'Attachment'}
                  </a>
                )}
              </div>
            )}
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
            event.key === "Enter" && !uploading && sendMessage();
          }}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="attach-button"
          disabled={uploading}
        >
          📎
        </button>
        <button 
          onClick={sendMessage}
          disabled={uploading}
        >
          {uploading ? '⌛' : '➤'}
        </button>
      </div>
      {selectedFile && (
        <div className="selected-file">
          📎 {selectedFile.name}
          <button onClick={() => {
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}>✕</button>
        </div>
      )}
    </div>
  );
}

export default Chat;
