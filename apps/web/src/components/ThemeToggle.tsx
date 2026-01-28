import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../stores/theme";
import { cn } from "../lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          type="button"
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "rounded-md p-2 transition-colors",
            theme === value
              ? "bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
