import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { connectSocket } from "../services/websocket";
import { useAuth } from "../context/AuthContext";

function Chat() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeSocket, setActiveSocket] = useState(null);

  // ==========================================
  // SOCKET INITIALIZATION & REGISTRATION
  // ==========================================
  useEffect(() => {
    if (!user?._id) return;

    const socket = connectSocket();
    
    const registerUser = () => {
      console.log("🚀 Sending registration for user:", user._id);
      socket.send(
        JSON.stringify({
          type: "register",
          userId: user._id,
        })
      );
      setActiveSocket(socket); // Active socket state set kar rahe hain
    };

    // Agar socket pehle se open hai toh direct register karo
    if (socket.readyState === WebSocket.OPEN) {
      registerUser();
    } else {
      // Agar connection process me hai, toh open hone ka wait karo
      socket.onopen = () => {
        console.log("🔥 Connected to WebSocket Server");
        registerUser();
      };
    }

  }, [user?._id]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Sidebar handles selecting a chat room */}
      <Sidebar onSelectChat={setSelectedChat} />

      {/* ChatBox handles rendering and sending messages */}
      <ChatBox 
        chat={selectedChat} 
        user={user} 
        socket={activeSocket} 
      />
    </div>
  );
}

export default Chat;