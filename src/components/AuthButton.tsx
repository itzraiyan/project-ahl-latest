import { useState } from "react";
import { LogIn, User, LogOut, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { validateCredentials, setAuthStatus } from "@/utils/authUtils";

interface AuthButtonProps {
  user: any;
  onAuthChange: () => void;
}

export const AuthButton = ({ user, onAuthChange }: AuthButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateCredentials(username, password)) {
      setAuthStatus(true);
      toast({
        title: "Login successful",
        description: "Welcome to AHL!"
      });
      setIsOpen(false);
      setUsername("");
      setPassword("");
      onAuthChange();
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setAuthStatus(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
    onAuthChange();
  };

  if (user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
      >
        <User className="w-4 h-4 mr-2" />
        {user.name}
        <LogOut className="w-4 h-4 ml-2" />
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 text-white max-w-md shadow-2xl">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Welcome Back
          </DialogTitle>
          <p className="text-gray-400 text-sm mt-2">Sign in to your AHL account</p>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300 font-medium">
                Username
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-11 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 transition-all duration-200 h-12"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-11 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 transition-all duration-200 h-12"
                  required
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-600 text-primary-foreground font-semibold py-3 h-12 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-primary/25"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </div>
            )}
          </Button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <p className="text-center text-gray-400 text-sm">
            Need access? Contact the administrator
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
