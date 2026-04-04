'use client';

import { useState, useEffect, useCallback, useRef } from "react";

export function useWritingTracker(initialTime = 0) {
  const [timeSeconds, setTimeSeconds] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const recordActivity = useCallback(() => {
    setIsActive(true);
    
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    
    // Pause tracker if no keystrokes for 3 seconds
    idleTimeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  return { timeSeconds, isActive, recordActivity, setTimeSeconds };
}
