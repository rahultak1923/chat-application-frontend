import { useEffect, useState } from "react";
import API from "../services/api";
import { getSocket } from "../services/websocket"; 

function ChatBox({ chat, user, socket }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ==========================================
  // 1. LOAD MESSAGES FROM DATABASE (API)
  // ==========================================
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chat?._id) return;
      try {
        const res = await API.get(`/message/${chat._id}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.log("❌ API Fetch Error:", err);
      }
    };
    fetchMessages();
  }, [chat?._id]);

  // ==========================================
  // 2. REALTIME SOCKET LISTENER
  // ==========================================
  useEffect(() => {
    const activeSocket = socket || getSocket();
    if (!activeSocket || !chat?._id) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📥 Live Data Received in ChatBox:", data);

        if (data) {
          // Check ki message isi open chat window ka hai ya nahi
          const incomingChatId = data.chatId || data.chat;
          if (incomingChatId && String(incomingChatId) !== String(chat._id)) {
            return; 
          }

          setMessages((prev) => {
            // Database se aane wale messages ke liye strict duplicate check
            const isRealDuplicate = prev.some((m) => m._id === data._id);
            if (isRealDuplicate) return prev;

            // Agar optimistic ui wala temporary message pehle se hai,
            // toh use real DB message parameters ke sath replace kar do
            const hasTemp = prev.some(
              (m) => m.text === data.text && 
                     String(m.senderId || m.sender) === String(data.senderId) && 
                     m._id?.startsWith('temp-')
            );
            
            if (hasTemp) {
              return prev.map((m) => 
                m.text === data.text && 
                String(m.senderId || m.sender) === String(data.senderId) && 
                m._id?.startsWith('temp-') 
                  ? data 
                  : m
              );
            }

            return [...prev, data];
          });
        }
      } catch (err) {
        console.log("❌ Invalid socket data parsing error", err);
      }
    };

    activeSocket.addEventListener("message", handleMessage);

    return () => {
      activeSocket.removeEventListener("message", handleMessage);
    };
  }, [socket, chat?._id]);

  // ==========================================
  // 3. SEND MESSAGE WORKFLOW
  // ==========================================
  const sendMessage = () => {
    const activeSocket = socket || getSocket();
    if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN || !text.trim()) return;

    // Fail-proof extraction: Chahe backend se array aaye ya object, string ID extract hogi
    const receiverId = chat.participants
      ?.map(p => typeof p === 'object' ? p._id : p)
      .find((id) => String(id) !== String(user._id));

    console.log("📤 Sending Message. ReceiverId:", receiverId);

    const msgData = {
      type: "message",
      senderId: user._id,
      receiverId: receiverId, 
      chatId: chat._id,
      text: text.trim(),
    };

    activeSocket.send(JSON.stringify(msgData));

    // Optimistic Update: Screen par bina delay ke message push karna
    setMessages((prev) => [
      ...prev,
      {
        ...msgData,
        _id: `temp-${Date.now()}`,
        fromSelf: true
      },
    ]);

    setText("");
  };

  // Safe boundary placeholder agar koi chat selected na ho
  if (!chat) {
    return (
      <div style={{ flex: 1, padding: 20, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h3>Select a chat to start messaging</h3>
      </div>
    );
  }

  // ==========================================
  // 4. UI RENDER ENGINE
  // ==========================================
  return (
    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column" }}>
      <h3>Chat Window</h3>

      <div style={{ height: 400, overflowY: "auto", border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
        {messages.map((m, i) => {
          
          // 🔴 ULTIMATE REFRESH-PROOF ALIGNMENT CHECK:
          // Check karte hain ki data live socket se aaya hai (senderId) ya database se (sender)
          let messageSenderId = m.senderId || m.sender;

          // Agar backend se sender poora object hokar aa raha hai { _id: '...', name: '...' }
          if (messageSenderId && typeof messageSenderId === 'object') {
            messageSenderId = messageSenderId._id;
          }

          // Strict String comparison current logged-in user se
          const isMine = 
            (messageSenderId && String(messageSenderId) === String(user?._id)) || 
            m.fromSelf === true;

          return (
            <div
              key={m._id || i}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start", // Sender -> Right, Receiver -> Left
                margin: "8px 0",
              }}
            >
              <div
                style={{
                  background: isMine ? "#25D366" : "#343a40", // Green for me, Gray for receiver
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: isMine ? "14px 14px 0px 14px" : "14px 14px 14px 0px",
                  maxWidth: "60%",
                  wordBreak: "break-word",
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
          style={{ flex: 1, padding: 8 }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} style={{ padding: "8px 16px" }}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;