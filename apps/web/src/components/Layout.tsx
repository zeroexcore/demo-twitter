import { Link, useNavigate } from "react-router-dom";
import { Home, User, LogOut, LogIn } from "lucide-react";
import { useAuthStore } from "../stores/auth";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container-app flex h-14 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary-600">
            Demo Twitter
          </Link>

          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/home"
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2",
                    "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Home className="h-5 w-5" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link
                  to={`/${user?.username}`}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2",
                    "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2",
                    "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2",
                  "bg-primary-600 text-white hover:bg-primary-700"
                )}
              >
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-4">{children}</main>

      {/* Mobile Bottom Nav */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white sm:hidden">
          <div className="flex justify-around py-2">
            <Link
              to="/home"
              className="flex flex-col items-center p-2 text-gray-600"
            >
              <Home className="h-6 w-6" />
            </Link>
            <Link
              to={`/${user?.username}`}
              className="flex flex-col items-center p-2 text-gray-600"
            >
              <User className="h-6 w-6" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-col items-center p-2 text-gray-600"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
