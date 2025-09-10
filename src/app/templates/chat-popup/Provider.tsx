import { UIMessage, useChat, UseChatHelpers } from "@ai-sdk/react";
import { UIDataTypes, UITools } from "ai";
import { createContext, useContext } from "react";

type StoreChat = UseChatHelpers<UIMessage<unknown, UIDataTypes, UITools>>;

const Context = createContext<StoreChat | null>(null);

export const ProviderChat: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const chat = useChat();
  return <Context.Provider value={chat}>{children}</Context.Provider>;
};

export const useChatContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
