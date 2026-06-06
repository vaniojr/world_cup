"use client";
import Image from "next/image";
import { useState } from "react";

interface TeamFlagProps {
  flagUrl: string;
  countryCode: string;
  countryName: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: 24, md: 32, lg: 48 };

export function TeamFlag({ flagUrl, countryCode, countryName, size = "md" }: TeamFlagProps) {
  const [error, setError] = useState(false);
  const px = sizeMap[size];

  if (error) {
    return (
      <div
        className="rounded-sm bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
        style={{ width: px, height: Math.round(px * 0.67) }}
      >
        {countryCode.slice(0, 2)}
      </div>
    );
  }

  return (
    <Image
      src={flagUrl}
      alt={`Bandeira ${countryName}`}
      width={px}
      height={Math.round(px * 0.67)}
      className="rounded-sm object-cover shadow-sm"
      onError={() => setError(true)}
    />
  );
}
