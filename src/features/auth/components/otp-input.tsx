"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function OtpInput({
  length = 6,
  onComplete,
  error,
  loading,
  disabled,
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (disabled || loading) return;

    const newValue = value.replace(/[^0-9]/g, "");
    if (newValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = newValue;
    setOtp(newOtp);

    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const completed = newOtp.join("");
    if (completed.length === length) {
      onComplete(completed);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || loading) return;

    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    const newOtp = pastedData.split("");
    
    while (newOtp.length < length) {
      newOtp.push("");
    }

    setOtp(newOtp);

    if (pastedData.length === length) {
      onComplete(pastedData);
      inputRefs.current[length - 1]?.focus();
    } else if (pastedData.length > 0) {
      inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled || loading}
            className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-slate-900 focus:ring-slate-900"
            } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </div>
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Verifying...</span>
        </div>
      )}
      {error && !loading && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-red-600 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
