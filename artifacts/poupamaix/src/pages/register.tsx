import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/sign-up"); }, [setLocation]);
  return null;
}
