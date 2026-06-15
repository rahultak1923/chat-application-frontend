let socket = null;

export const connectSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  // socket = new WebSocket("ws://localhost:5000/ws");
  socket = new WebSocket("https://my-chat-application-s56u.onrender.com/ws");

  socket.onopen = () => {
    console.log("🔥 Socket Connected");
  };

  socket.onmessage = (event) => {
    console.log("📩 Message received:", event.data);
  };

  socket.onerror = (e) => {
    console.log("❌ Socket Error", e);
  };

  socket.onclose = () => {
    console.log("⚠️ Socket Closed");
    socket = null;
  };

  return socket;
};

export const getSocket = () => socket;