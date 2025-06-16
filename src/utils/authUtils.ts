
export const validateCredentials = (username: string, password: string): boolean => {
  return username === "Raiyan" && password === "24530*#Raiyan";
};

export const setAuthStatus = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    localStorage.setItem("rhl_auth", "authenticated");
  } else {
    localStorage.removeItem("rhl_auth");
  }
};

export const getAuthStatus = (): boolean => {
  return localStorage.getItem("rhl_auth") === "authenticated";
};
