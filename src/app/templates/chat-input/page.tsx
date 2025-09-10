"use client";
import { generateZustandContext } from "@/shared/hooks/generateZustandContext";
import { cn } from "@/shared/lib/utils";
import {
  File,
  Globe,
  Image,
  Lightbulb,
  Mic,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

const PLACEHOLDERS = [
  "Describe an app idea",
  "Start a Next.js project",
  "What is the meaning of life?",
  "How to learn React fast?",
  "How to cook a delicious meal?",
  "Summarize this text",
];

type FileItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  arrayBuffer?: ArrayBuffer;
  uint8Array?: Uint8Array;
  preview?: string;
};

type ChatInputStore = {
  inputValue: string;
  isActive: boolean;
  thinkActive: boolean;
  deepSearchActive: boolean;
  placeholderIndex: number;
  showPlaceholder: boolean;
  files: FileItem[];

  setInputValue: (value: string) => void;
  setIsActive: (active: boolean) => void;
  setThinkActive: (active: boolean) => void;
  setDeepSearchActive: (active: boolean) => void;
  setPlaceholderIndex: (index: number) => void;
  setShowPlaceholder: (show: boolean) => void;
  handleActivate: () => void;
  toggleThink: () => void;
  toggleDeepSearch: () => void;
  cyclePlaceholder: () => void;
  addFiles: (newFiles: FileList) => Promise<void>;
  removeFile: (fileId: string) => void;
  reset: () => void;
};

const [Provider, useStore] = generateZustandContext<ChatInputStore>();

const placeholderContainerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.025 } },
  exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
};

const letterVariants: Variants = {
  initial: {
    opacity: 0,
    filter: "blur(12px)",
    y: 10,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      opacity: { duration: 0.25 },
      filter: { duration: 0.4 },
      y: { type: "spring", stiffness: 80, damping: 20 },
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(12px)",
    y: -10,
    transition: {
      opacity: { duration: 0.2 },
      filter: { duration: 0.3 },
      y: { type: "spring", stiffness: 80, damping: 20 },
    },
  },
};

const AnimatedPlaceholder = () => {
  const { placeholderIndex, showPlaceholder, isActive, inputValue } = useStore(
    useShallow((state) => ({
      placeholderIndex: state.placeholderIndex,
      showPlaceholder: state.showPlaceholder,
      isActive: state.isActive,
      inputValue: state.inputValue,
    }))
  );

  return (
    <div className="absolute left-0 top-0 w-full h-full pointer-events-none flex items-center px-3 py-2">
      <AnimatePresence mode="wait">
        {showPlaceholder && !isActive && !inputValue && (
          <motion.span
            key={placeholderIndex}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis z-0"
            variants={placeholderContainerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {PLACEHOLDERS[placeholderIndex].split("").map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

const getFileInfo = (file: FileItem) => {
  const info = {
    hasArrayBuffer: !!file.arrayBuffer,
    hasUint8Array: !!file.uint8Array,
    byteLength: file.arrayBuffer?.byteLength || 0,
    firstBytes: file.uint8Array?.slice(0, 16) || null,
  };
  return info;
};

const FileBadge = ({
  file,
  onRemove,
}: {
  file: FileItem;
  onRemove: () => void;
}) => {
  const isImage = file.type.startsWith("image/");
  const fileInfo = getFileInfo(file);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      layout
      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-2 text-sm"
    >
      {isImage && file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          className="w-6 h-6 rounded object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-300">
          {isImage ? (
            <Image size={14} className="text-gray-600" />
          ) : (
            <File size={14} className="text-gray-600" />
          )}
        </div>
      )}

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-gray-900 font-medium truncate max-w-[150px]">
            {file.name}
          </span>
          {fileInfo.hasArrayBuffer && (
            <span
              className="inline-block w-2 h-2 bg-green-500 rounded-full"
              title="File data ready (ArrayBuffer loaded)"
            />
          )}
        </div>
        <span className="text-gray-500 text-xs">
          {formatFileSize(file.size)}
          {fileInfo.hasArrayBuffer && (
            <span className="ml-1 text-green-600">• Processed</span>
          )}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-1 rounded-full hover:bg-gray-300 transition-colors ml-1"
        title="Remove file"
      >
        <X size={14} className="text-gray-600" />
      </button>
    </motion.div>
  );
};

const FilesDisplay = () => {
  const { files, removeFile } = useStore(
    useShallow((state) => ({
      files: state.files,
      removeFile: state.removeFile,
    }))
  );

  if (files.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="px-4 py-3 border-b border-gray-100"
    >
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <FileBadge
              key={file.id}
              file={file}
              onRemove={() => removeFile(file.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const InputControls = () => {
  const { inputValue, setInputValue, handleActivate, addFiles, files } =
    useStore(
      useShallow((state) => ({
        inputValue: state.inputValue,
        setInputValue: state.setInputValue,
        handleActivate: state.handleActivate,
        addFiles: state.addFiles,
        files: state.files,
      }))
    );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.md"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={handleAttachClick}
        className={cn(
          "p-3 rounded-full transition relative",
          files.length > 0
            ? "bg-blue-50 hover:bg-blue-100"
            : "hover:bg-gray-100"
        )}
        title="Attach file"
        type="button"
        tabIndex={-1}
      >
        <Paperclip
          size={20}
          className={files.length > 0 ? "text-blue-600" : ""}
        />
        {files.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {files.length}
          </span>
        )}
      </button>

      <div className="relative flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 border-0 outline-0 rounded-md py-2 text-base bg-transparent w-full font-normal"
          style={{ position: "relative", zIndex: 1 }}
          onFocus={handleActivate}
        />
        <AnimatedPlaceholder />
      </div>

      <button
        className="p-3 rounded-full hover:bg-gray-100 transition"
        title="Voice input"
        type="button"
        tabIndex={-1}
      >
        <Mic size={20} />
      </button>
      <button
        className="flex items-center gap-1 bg-black hover:bg-zinc-700 text-white p-3 rounded-full font-medium justify-center"
        title="Send"
        type="button"
        tabIndex={-1}
      >
        <Send size={18} />
      </button>
    </>
  );
};

const ToggleButton = ({
  isActive,
  onClick,
  icon: Icon,
  label,
  className = "",
}: {
  isActive: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  className?: string;
}) => (
  <button
    className={cn(
      "flex items-center gap-1 px-4 py-2 rounded-full transition-all font-medium group",
      className,
      isActive
        ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    )}
    title={label}
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <Icon
      className={
        label === "Think" ? "group-hover:fill-yellow-300 transition-all" : ""
      }
      size={18}
    />
    {label}
  </button>
);

const ExpandedControls = () => {
  const {
    isActive,
    inputValue,
    thinkActive,
    deepSearchActive,
    toggleThink,
    toggleDeepSearch,
    files,
  } = useStore(
    useShallow((state) => ({
      isActive: state.isActive,
      inputValue: state.inputValue,
      thinkActive: state.thinkActive,
      deepSearchActive: state.deepSearchActive,
      toggleThink: state.toggleThink,
      toggleDeepSearch: state.toggleDeepSearch,
      files: state.files,
    }))
  );

  const isExpanded = isActive || inputValue || files.length > 0;

  return (
    <motion.div
      className="w-full flex justify-start items-center text-sm"
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
          pointerEvents: "none" as const,
          transition: { duration: 0.25 },
        },
        visible: {
          opacity: 1,
          y: 0,
          pointerEvents: "auto" as const,
          transition: { duration: 0.35, delay: 0.08 },
        },
      }}
      initial="hidden"
      animate={isExpanded ? "visible" : "hidden"}
      style={{ marginTop: 8 }}
    >
      <div className="flex gap-3 items-center">
        <ToggleButton
          isActive={thinkActive}
          onClick={toggleThink}
          icon={Lightbulb}
          label="Think"
        />

        <motion.button
          className={cn(
            "flex items-center px-4 gap-1 py-2 rounded-full transition font-medium whitespace-nowrap overflow-hidden justify-start",
            deepSearchActive
              ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
          title="Deep Search"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleDeepSearch();
          }}
          initial={false}
          animate={{
            width: deepSearchActive ? 125 : 36,
            paddingLeft: deepSearchActive ? 8 : 9,
          }}
        >
          <div className="flex-1">
            <Globe size={18} />
          </div>
          <motion.span
            className="pb-[2px]"
            initial={false}
            animate={{
              opacity: deepSearchActive ? 1 : 0,
            }}
          >
            Deep Search
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const ChatInput = () => {
  const {
    isActive,
    inputValue,
    setIsActive,
    handleActivate,
    cyclePlaceholder,
    files,
    addFiles,
  } = useStore(
    useShallow((state) => ({
      isActive: state.isActive,
      inputValue: state.inputValue,
      setIsActive: state.setIsActive,
      handleActivate: state.handleActivate,
      cyclePlaceholder: state.cyclePlaceholder,
      files: state.files,
      addFiles: state.addFiles,
    }))
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (isActive || inputValue) return;

    const interval = setInterval(() => {
      cyclePlaceholder();
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, inputValue, cyclePlaceholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        if (!inputValue) setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, setIsActive]);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview && file.preview.startsWith("blob:")) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  const hasFiles = files.length > 0;
  const isExpanded = isActive || inputValue || hasFiles;

  const containerVariants: Variants = {
    collapsed: {
      height: 68,
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    expanded: {
      height: "auto",
      minHeight: hasFiles ? 150 : 128,
      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.16)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center text-black">
      <motion.div
        ref={wrapperRef}
        className={cn(
          "w-full max-w-3xl relative",
          isDragOver ? "ring-2 ring-blue-500 ring-opacity-50" : ""
        )}
        variants={containerVariants}
        animate={isExpanded ? "expanded" : "collapsed"}
        initial="collapsed"
        style={{ overflow: "hidden", borderRadius: 32, background: "#fff" }}
        onClick={handleActivate}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-50 rounded-[32px]"
            >
              <div className="text-center">
                <Paperclip size={32} className="text-blue-500 mx-auto mb-2" />
                <p className="text-blue-700 font-medium">
                  Drop files here to attach
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col items-stretch p-3 w-full h-full">
          <div className="flex items-center gap-2 rounded-full bg-white max-w-3xl w-full">
            <InputControls />
          </div>
          <FilesDisplay />
          <ExpandedControls />
        </div>
      </motion.div>
    </div>
  );
};

const ProviderChatInput = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider
      create={(set, get) => ({
        inputValue: "",
        isActive: false,
        thinkActive: false,
        deepSearchActive: false,
        placeholderIndex: 0,
        showPlaceholder: true,
        files: [],
        setInputValue: (value: string) => set({ inputValue: value }),
        setIsActive: (active: boolean) => set({ isActive: active }),
        setThinkActive: (active: boolean) => set({ thinkActive: active }),
        setDeepSearchActive: (active: boolean) =>
          set({ deepSearchActive: active }),
        setPlaceholderIndex: (index: number) =>
          set({ placeholderIndex: index }),
        setShowPlaceholder: (show: boolean) => set({ showPlaceholder: show }),

        handleActivate: () => set({ isActive: true }),

        toggleThink: () =>
          set((state: ChatInputStore) => ({
            thinkActive: !state.thinkActive,
          })),

        toggleDeepSearch: () =>
          set((state: ChatInputStore) => ({
            deepSearchActive: !state.deepSearchActive,
          })),

        cyclePlaceholder: () => {
          set({ showPlaceholder: false });
          setTimeout(() => {
            const currentState = get();
            set({
              placeholderIndex:
                (currentState.placeholderIndex + 1) % PLACEHOLDERS.length,
              showPlaceholder: true,
            });
          }, 400);
        },

        addFiles: async (newFiles: FileList) => {
          const currentState = get();
          const fileItems: FileItem[] = [];

          for (const file of Array.from(newFiles)) {
            try {
              const arrayBuffer = await file.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);

              const fileItem: FileItem = {
                id: `${Date.now()}-${file.name}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                name: file.name,
                size: file.size,
                type: file.type,
                file,
                arrayBuffer,
                uint8Array,
              };

              if (file.type.startsWith("image/")) {
                const blob = new Blob([uint8Array], { type: file.type });
                fileItem.preview = URL.createObjectURL(blob);
              }

              fileItems.push(fileItem);
            } catch (error) {
              console.error(`Error processing file ${file.name}:`, error);

              const fileItem: FileItem = {
                id: `${Date.now()}-${file.name}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                name: file.name,
                size: file.size,
                type: file.type,
                file,
              };
              fileItems.push(fileItem);
            }
          }

          set({
            files: [...currentState.files, ...fileItems],
            isActive: true,
          });
        },

        removeFile: (fileId: string) => {
          set((state: ChatInputStore) => {
            const fileToRemove = state.files.find((file) => file.id === fileId);

            if (
              fileToRemove?.preview &&
              fileToRemove.preview.startsWith("blob:")
            ) {
              URL.revokeObjectURL(fileToRemove.preview);
            }

            return {
              files: state.files.filter((file) => file.id !== fileId),
            };
          });
        },

        reset: () => {
          const currentState = get();

          currentState.files.forEach((file) => {
            if (file.preview && file.preview.startsWith("blob:")) {
              URL.revokeObjectURL(file.preview);
            }
          });

          set({
            inputValue: "",
            isActive: false,
            thinkActive: false,
            deepSearchActive: false,
            placeholderIndex: 0,
            showPlaceholder: true,
            files: [],
          });
        },
      })}
    >
      {children}
    </Provider>
  );
};

export default function Page() {
  return (
    <ProviderChatInput>
      <ChatInput />
    </ProviderChatInput>
  );
}
