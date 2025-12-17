import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30 selection:text-sky-200 relative overflow-hidden flex flex-col items-center ${className}`}>
      
      {/* Background Gradients/Noise */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-900 to-transparent opacity-60" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Content Area - Responsive Width */}
      <div className="relative z-10 w-full max-w-md lg:max-w-6xl mx-auto min-h-screen flex flex-col border-x border-slate-900/50 bg-slate-950/20 backdrop-blur-sm shadow-2xl">
        {children}
      </div>

    </div>
  );
};