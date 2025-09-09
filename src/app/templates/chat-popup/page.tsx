"use client";

import { generateZustandContext } from "@/shared/hooks/generateZustandContext";
import { useShallow } from "zustand/shallow";

type ChatPopupState = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

const [PopupProvider, usePopup] = generateZustandContext<ChatPopupState>();

function ChatPopupProvider({ children }: { children: React.ReactNode }) {
  return (
    <PopupProvider
      create={(set) => ({
        isOpen: false,
        toggle: () => set((state) => ({ isOpen: !state.isOpen })),
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      })}
    >
      {children}
    </PopupProvider>
  );
}

export default function Page() {
  return (
    <ChatPopupProvider>
      <MainApp />
    </ChatPopupProvider>
  );
}

function MainApp() {
  const { isOpen, toggle } = usePopup(
    useShallow((state) => ({
      isOpen: state.isOpen,
      toggle: state.toggle,
    }))
  );

  return (
    <div className="p-4">
      <button
        onClick={toggle}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isOpen ? "Cerrar Chat" : "Abrir Chat"}
      </button>
      2{/* {isOpen && <ChatPopup />} */}
    </div>
  );
}
