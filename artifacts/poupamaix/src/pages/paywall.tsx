import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Paywall() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/dashboard"); }, [setLocation]);
  return null;
}
