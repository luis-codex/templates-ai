import { encode } from "gpt-tokenizer";
import { create } from "zustand";

interface ChatStore {
  isChatOpen: boolean;
  message: string;
  charCount: number;
  tokenCount: number;
  maxChars: number;
  droppedFiles: File[];
  maxFiles: number;

  setIsChatOpen: (open: boolean) => void;
  setMessage: (message: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  addDroppedFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  canAddFiles: (newFilesCount: number) => boolean;
  calculateTokens: (text: string) => number;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  isChatOpen: false,
  message: "",
  charCount: 0,
  tokenCount: 0,
  maxChars: 2000,
  droppedFiles: [],
  maxFiles: 10,

  setIsChatOpen: (open: boolean) => set({ isChatOpen: open }),

  calculateTokens: (text: string) => {
    try {
      const tokens = encode(text);
      return tokens.length;
    } catch (error) {
      console.warn("Error calculating tokens:", error);
      return 0;
    }
  },

  setMessage: (message: string) => {
    const { calculateTokens } = get();
    const tokenCount = calculateTokens(message);
    set({ message, charCount: message.length, tokenCount });
  },

  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const { maxChars, calculateTokens } = get();
    if (value.length <= maxChars) {
      const tokenCount = calculateTokens(value);
      set({ message: value, charCount: value.length, tokenCount });
    }
  },

  handleSend: () => {
    const { message } = get();
    if (message.trim()) {
      console.log("Sending message:", message);
      set({ message: "", charCount: 0, tokenCount: 0 });
    }
  },

  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      get().handleSend();
    }
  },

  canAddFiles: (newFilesCount: number) => {
    const { droppedFiles, maxFiles } = get();
    return droppedFiles.length + newFilesCount <= maxFiles;
  },

  addDroppedFiles: (files: File[]) => {
    const { droppedFiles, maxFiles, canAddFiles } = get();

    if (!canAddFiles(files.length)) {
      const availableSlots = maxFiles - droppedFiles.length;
      if (availableSlots > 0) {
        const filesToAdd = files.slice(0, availableSlots);
        set((state) => ({
          droppedFiles: [...state.droppedFiles, ...filesToAdd],
        }));

        console.warn(
          `Solo se pudieron agregar ${filesToAdd.length} archivos. Límite máximo: ${maxFiles}`
        );
      } else {
        console.warn(
          `No se pueden agregar más archivos. Límite máximo: ${maxFiles}`
        );
      }
      return;
    }

    set((state) => ({
      droppedFiles: [...state.droppedFiles, ...files],
    }));
  },

  removeFile: (index: number) =>
    set((state) => ({
      droppedFiles: state.droppedFiles.filter((_, i) => i !== index),
    })),

  clearFiles: () => set({ droppedFiles: [] }),
}));
