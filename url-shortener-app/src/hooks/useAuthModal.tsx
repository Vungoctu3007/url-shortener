import { useState } from "react";

export const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const open = (type: "login" | "register") => {
    setMode(type);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return { isOpen, mode, open, close };
};
