
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Shield, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login check - in a real app, this would be an API call
    setTimeout(() => {
      if (username === "admin" && password === "password") {
        toast({
          title: "Login successful",
          description: "Welcome to your personal archive!"
        });
        onLogin();
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 animate-pulse" 
             style={{ background: 'radial-gradient(circle, #0096FF 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 animate-pulse" 
             style={{ background: 'radial-gradient(circle, #0096FF 0%, transparent 70%)', animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gray-800 border border-gray-700">
              <Database className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
              Personal 
            </span>
            <span className="ml-2 text-primary">Archive</span>
          </h1>
          <p className="text-gray-400">Secure access to your private collection</p>
        </div>

        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-center flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Secure Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white font-medium">Username</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-primary" 
                       style={{ color: username ? '#0096FF' : undefined }} />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-primary" 
                       style={{ color: password ? '#0096FF' : undefined }} />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full text-white font-semibold py-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  "Access Archive"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <p className="text-sm text-gray-300 font-medium">Demo Access</p>
              </div>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Username: <span className="font-mono text-gray-300 bg-gray-700/50 px-2 py-0.5 rounded">admin</span></p>
                <p>Password: <span className="font-mono text-gray-300 bg-gray-700/50 px-2 py-0.5 rounded">password</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="w-3 h-3" />
            <span>Secure • Private • Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
