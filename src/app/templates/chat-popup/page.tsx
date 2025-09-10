"use client";
import { cn } from "@/shared/lib/utils";
import {
  ArrowDownIcon,
  Bot,
  ChevronDown,
  Info,
  Lightbulb,
  Menu,
  Mic,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import React, {
  ComponentProps,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Streamdown } from "streamdown";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { useShallow } from "zustand/shallow";
import { ProviderChat, useChatContext } from "./Provider";
import { useChatStore } from "./store";

const FloatingButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useChatStore(
    useShallow((store) => [store.isChatOpen, store.setIsChatOpen])
  );

  return (
    <button
      id="floating-ai-button"
      className={cn(
        "hover:scale-105 overflow-hidden cursor-pointer will-change-transform duration-200 bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 relative w-16 h-16 rounded-full flex items-center justify-center transition-all transform aria-disabled:pointer-events-none",
        isChatOpen ? "rotate-90" : "rotate-0"
      )}
      aria-disabled={isChatOpen}
      onClick={() => setIsChatOpen(true)}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30"></div>
      <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
      <div className="relative z-10">
        {isChatOpen ? <X /> : <Bot className="w-8 h-8 text-white" />}
      </div>
      <div className="absolute inset-0 rounded-full animate-ping opacity-5 bg-zinc-500"></div>
    </button>
  );
};

const ChatHeader: React.FC = () => {
  const setIsChatOpen = useChatStore((store) => store.setIsChatOpen);

  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-2">
      <div className="flex items-center gap-1.5">
        <Menu className="size-4" />
        <span className="text-xs font-medium text-zinc-400">
          Conversaciones
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-zinc-800/60 text-zinc-300 rounded-2xl">
          GPT-4
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => setIsChatOpen(false)}
          className="p-1.5 rounded-full hover:bg-zinc-700/50 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );
};

const ChatInput: React.FC = () => {
  const [
    message,
    handleInputChange,
    // handleKeyDown,
    tokenCount,
    charCount,
    maxChars,
  ] = useChatStore(
    useShallow((store) => [
      store.message,
      store.handleInputChange,
      //   store.handleKeyDown,
      store.tokenCount,
      store.charCount,
      store.maxChars,
    ])
  );

  return (
    <div className="relative">
      <div className="relative overflow-hidden">
        <textarea
          value={message}
          onChange={handleInputChange}
          //   onKeyDown={handleKeyDown}
          rows={1}
          className="w-full border-none px-6 py-4 bg-transparent outline-none resize-none text-base font-normal leading-relaxed text-zinc-100 placeholder-zinc-500 scrollbar-none"
          placeholder="Hola! ¿En qué puedo ayudarte hoy?"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-zinc-800/5 to-transparent pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(39, 39, 42, 0.05), transparent)",
          }}
        ></div>
      </div>

      {message && (
        <div className="px-6 pb-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-zinc-500">
                <span className="text-zinc-400 font-medium">{tokenCount}</span>{" "}
                tokens
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500">
                <span className="text-zinc-400 font-medium">
                  {charCount}/{maxChars}
                </span>{" "}
                caracteres
              </span>
            </div>
            <div className="text-zinc-600">
              <span className="text-[10px] font-mono">GPT-4</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ConversationScrollButton: React.FC = () => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom({
      duration  : 200,
    });
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <button
        className={cn(
          "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full bg-zinc-800 p-2 shadow-xl z-10 border"
        )}
        onClick={handleScrollToBottom}
        type="button"
      >
        <ArrowDownIcon className="size-4" />
      </button>
    )
  );
};

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

const ChatMessages: React.FC = () => {
  const { messages } = useChatContext();

  return messages.map((message) => (
    <div
      className={cn("px-6 py-4", {
        "ml-auto text-muted-foreground rounded-2xl max-w-3/4 w-fit":
          message.role === "user",
      })}
      key={message.id}
    >
      {message.parts.map((part, index) => {
        switch (part.type) {
          case "text":
            return <Response key={index}>{part.text}</Response>;
          default:
            return null;
        }
      })}
    </div>
  ));
};

const ChatMessagesContent: React.FC = () => {
  return (
    <StickToBottom
      className="h-96 overflow-y-auto px-4 border-b max-h-96 scrollbar-thin relative"
      resize="smooth"
      initial="smooth"
      damping={0.1}
    >
      <StickToBottom.Content>
        <ChatMessages />
      </StickToBottom.Content>
      <ConversationScrollButton />
    </StickToBottom>
  );
};

const AttachmentButtons: React.FC = () => {
  const [droppedFiles, addDroppedFiles, maxFiles] = useChatStore(
    useShallow((store) => [
      store.droppedFiles,
      store.addDroppedFiles,
      store.maxFiles,
    ])
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const availableSlots = maxFiles - droppedFiles.length;
      addDroppedFiles(files.slice(0, availableSlots));
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
        <button
          className="group relative w-10 h-10 flex items-center justify-center bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 hover:scale-105 hover:-rotate-3 transform disabled:cursor-not-allowed disabled:hover:text-zinc-500 disabled:hover:bg-transparent"
          onClick={() => fileInputRef.current?.click()}
          disabled={droppedFiles.length >= maxFiles}
          aria-label="Upload files"
        >
          <Paperclip className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-12" />
          <div className="absolute will-change-transform -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-700/50 backdrop-blur-sm">
            Subir archivos
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-700/50"></div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileChange}
            disabled={droppedFiles.length >= maxFiles}
          />
        </button>
      </div>

      <button className="group relative w-10 h-10 flex items-center justify-center bg-transparent border border-zinc-700/30 rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-blue-400 hover:bg-zinc-800/80 hover:scale-110 hover:rotate-2 transform hover:border-blue-500/30">
        <Mic className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-3" />
        <div className="absolute will-change-transform -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-700/50 backdrop-blur-sm">
          Dictar
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-700/50"></div>
        </div>
      </button>
      <button className="group relative w-10 h-10 flex items-center justify-center bg-transparent border border-zinc-700/30 rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-blue-400 hover:bg-zinc-800/80 hover:scale-110 hover:rotate-2 transform hover:border-blue-500/30">
        <Lightbulb className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-3" />
        <div className="absolute will-change-transform -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-700/50 backdrop-blur-sm">
          Search
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-700/50"></div>
        </div>
      </button>
    </div>
  );
};

const SendButton: React.FC = () => {
  const handleSend = useChatStore((store) => store.handleSend);
  const message = useChatStore((store) => store.message);
  const { sendMessage } = useChatContext();
  return (
    <button
      onClick={() => {
        sendMessage({
          text: message,
          files: [],
        });
        handleSend();
      }}
      className="group relative p-3 bg-gradient-to-r from-zinc-800 to-zinc-700 border-none rounded-xl cursor-pointer transition-all duration-300 text-white shadow-lg hover:from-blue-500 hover:to-blue-400 hover:scale-110 hover:shadow-blue-500/30 hover:shadow-xl active:scale-95 transform hover:-rotate-2 hover:animate-pulse"
      style={{
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(239, 68, 68, 0.4)",
        animation: "none",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.animation =
          "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.animation = "none";
      }}
    >
      <Send className="w-5 h-5 will-change-auto transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12 group-hover:scale-110" />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg transform scale-110"></div>
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-white/20 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl"></div>
      </div>
    </button>
  );
};

const ChatFiles: React.FC = () => {
  const [droppedFiles, removeFile, maxFiles] = useChatStore(
    useShallow((store) => [
      store.droppedFiles,
      store.removeFile,
      store.maxFiles,
    ])
  );
  return (
    <div className="px-4 pb-4 flex gap-2 flex-wrap">
      <div className="w-full">
        <span className="text-xs text-zinc-500 select-none">
          Archivos agregados: {droppedFiles.length}/{maxFiles}
        </span>
      </div>
      {droppedFiles.map((file, index) => (
        <div
          key={index}
          className="border flex items-center justify-between rounded-sm shadow-xl w-24 text-xs p-1 gap-1 bg-zinc-800/50"
        >
          <span className="truncate w-full">{file.name}</span>
          <button
            className="rounded-sm hover:bg-red-700 bg-zinc-700/50 p-1"
            onClick={() => removeFile(index)}
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

const ChatControls: React.FC = () => {
  return (
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between">
        <AttachmentButtons />
        <SendButton />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50 text-xs text-zinc-500 gap-6">
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <span>
            Arrastra o usa{" "}
            <kbd className="px-1.5 py-1 bg-zinc-800 border border-zinc-600 rounded [zoom:.7] will-change-transform text-zinc-400 font-mono font-semibold shadow-sm">
              Ctrl + V
            </kbd>{" "}
            para agregar archivos
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span>Listo para ayudarte</span>
        </div>
      </div>
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [isChatOpen, setIsChatOpen, addDroppedFiles] = useChatStore(
    useShallow((store) => [
      store.isChatOpen,
      store.setIsChatOpen,
      store.addDroppedFiles,
    ])
  );

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatRef.current &&
        event.target &&
        !chatRef.current.contains(event.target as Node)
      ) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsChatOpen]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!isChatOpen || !event.clipboardData?.files) return;

      const files = Array.from(event.clipboardData.files);

      if (files.length > 0) {
        event.preventDefault();
        addDroppedFiles(files);
        console.log(`📋 Archivos pegados: ${files.length} archivo(s)`);
      }
    };

    if (isChatOpen) {
      document.addEventListener("paste", handlePaste);
    }
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isChatOpen, addDroppedFiles]);

  const [isDragging, setIsDragging] = useState(false);

  if (!isChatOpen) return null;

  return (
    <div
      ref={chatRef}
      className="absolute bottom-20 right-0 w-max max-w-[500px] transition-all duration-300 origin-bottom-right"
      style={{
        animation:
          "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      }}
    >
      <div
        className={cn(
          "relative flex flex-col rounded-3xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 outline outline-zinc-500/50 shadow-2xl backdrop-blur-3xl",
          {
            "outline-2 outline-dashed outline-blue-400/70": isDragging,
          }
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!chatRef.current?.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);

          if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            addDroppedFiles(files);
          }
        }}
      >
        {isDragging && (
          <div className="absolute inset-0 size-full m-auto z-10 flex items-center justify-center rounded-[inherit] bg-blue-500/10 backdrop-blur-2xl pointer-events-none">
            <Paperclip className="size-8" />
          </div>
        )}
        <ChatHeader />
        <ChatMessagesContent />
        <ChatInput />
        <ChatFiles />
        <ChatControls />
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.01), transparent, rgba(37, 99, 235, 0.02))",
          }}
        ></div>
      </div>
    </div>
  );
};

const FloatingAiAssistant: React.FC = () => {
  return (
    <ProviderChat>
      <div className="fixed bottom-6 right-6 z-50">
        <FloatingButton />
        <ChatInterface />
      </div>
    </ProviderChat>
  );
};

export default FloatingAiAssistant;
