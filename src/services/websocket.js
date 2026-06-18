let socket = null;

export const connectSocket = (userId = null) => {
  // Agar socket pehle se open hai, toh naya connection mat banao
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  // ✅ Production Live Secure URL (WSS)
    // socket = new WebSocket("ws://localhost:5000/ws");

  socket = new WebSocket("wss://my-chat-application-s56u.onrender.com/ws");

  socket.onopen = () => {
    console.log("🔥 Socket Connected Live");
    // Registration payload tabhi bhejo jab userId mil jaye
    if (userId) {
      socket.send(JSON.stringify({ type: "register", userId }));
    }
  };

  socket.onerror = (e) => {
    console.log("❌ Socket Error", e);
  };

  socket.onclose = () => {
    console.log("⚠️ Socket Closed. Reconnecting in 3 seconds...");
    socket = null;
    
    // 🔄 Auto-Reconnect Engine: Agar user logged in hai, toh 3 seconds me loop back karo
    if (userId) {
      setTimeout(() => connectSocket(userId), 3000);
    }
  };

  return socket;
};

export const getSocket = () => socket;