import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) setLocation("/dashboard");
    else if (isLoaded && !isSignedIn) setLocation("/sign-in");
  }, [isLoaded, isSignedIn, setLocation]);

  return null;
}
