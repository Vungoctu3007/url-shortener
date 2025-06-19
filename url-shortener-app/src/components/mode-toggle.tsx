import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/ThemeProvider"
import clsx from "clsx"
import { useEffect, useState } from "react"

export function ModeToggle() {
  const { theme, setTheme, isSwitching } = useTheme()

  // State để nhận biết màn hình nhỏ hay lớn
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint trong Tailwind (640px)
    }

    handleResize() // set ngay từ đầu
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Nếu là mobile -> hiển thị toggle button
  if (isMobile) {
    return (
      <div className="fixed top-18 right-4 z-50">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          disabled={isSwitching}
          className={clsx(
            "p-3 rounded-full shadow-lg transition-colors duration-300",
            "bg-white dark:bg-[#121623] border border-gray-300 dark:border-[#2e3446]",
            "hover:scale-105 active:scale-95"
          )}
        >
          {theme === "light" ? (
            <Sun className="w-6 h-6 text-yellow-500" />
          ) : (
            <Moon className="w-6 h-6 text-blue-400" />
          )}
        </button>
      </div>
    )
  }

  // Nếu là màn hình lớn -> vẫn giữ như trước
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
      <div className={clsx(
        "flex flex-col items-center gap-4 p-3 shadow-lg rounded-3xl transition-colors duration-300",
        "bg-white dark:bg-[#121623] border border-gray-300 dark:border-[#2e3446]"
      )}>
        {/* Light Button */}
        <button
          onClick={() => setTheme("light")}
          disabled={isSwitching}
          className={clsx(
            "flex flex-col items-center justify-center w-8 h-24 rounded-2xl transition-all duration-300",
            theme === "light"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          )}
        >
          <Sun className="w-6 h-6 mb-2" />
          <span
            className="text-sm font-semibold"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(360deg)",
            }}
          >
            Light
          </span>
        </button>

        {/* Dark Button */}
        <button
          onClick={() => setTheme("dark")}
          disabled={isSwitching}
          className={clsx(
            "flex flex-col items-center justify-center w-8 h-24 rounded-2xl transition-all duration-300",
            theme === "dark"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          )}
        >
          <Moon className="w-6 h-6 mb-2" />
          <span
            className="text-sm font-semibold"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(360deg)",
            }}
          >
            Dark
          </span>
        </button>
      </div>
    </div>
  )
}
