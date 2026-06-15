import {
  createContext,
  useContext,
  useState,
} from "react";

const ChatContext =
  createContext();

export const ChatProvider =
  ({ children }) => {

    const [
      selectedChat,
      setSelectedChat,
    ] = useState(null);

    const [
      messages,
      setMessages,
    ] = useState([]);

    return (
      <ChatContext.Provider
        value={{
          selectedChat,
          setSelectedChat,
          messages,
          setMessages,
        }}
      >
        {children}
      </ChatContext.Provider>
    );
  };

export const useChat =
  () =>
    useContext(
      ChatContext
    );
    