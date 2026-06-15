import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Register from "./pages/Register";

import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </BrowserRouter>

      </ChatProvider>
    </AuthProvider>
  );
}

export default App;