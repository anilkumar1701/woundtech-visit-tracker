import { Toaster } from "react-hot-toast";
import { useTheme } from "../lib/theme";

export function AppToaster() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: isDark ? "#1e293b" : "#ffffff",
          color: isDark ? "#f1f5f9" : "#0f172a",
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
          boxShadow: "0 8px 24px -8px rgba(0,0,0,0.25)",
        },
      }}
    />
  );
}
