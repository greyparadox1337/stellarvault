import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

export default function GlassCard({ children, className = "", accent = false }: GlassCardProps) {
  return (
    <div className={`glass-panel ${accent ? "glass-panel-accent" : ""} ${className}`}>
      {children}
    </div>
  );
}
