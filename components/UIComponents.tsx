import React from 'react';
import { Icons } from './Icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "w-full py-4 px-6 rounded-sm font-medium tracking-wide flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs sm:text-sm";
  
  const variants = {
    primary: "bg-slate-100 text-slate-900 hover:bg-white border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    secondary: "bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-slate-100",
    ghost: "bg-transparent text-slate-500 hover:text-slate-300",
    danger: "bg-red-950/20 text-red-400 border border-red-900/50 hover:border-red-500/50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="w-full space-y-2">
      <label className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">{label}</label>
      <input 
        className={`w-full bg-slate-900/50 border border-slate-800 text-slate-200 text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-sky-500/50 focus:bg-slate-900 transition-colors placeholder-slate-600 ${className}`}
        {...props}
      />
    </div>
  );
};

interface CardProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, active, onClick, className = '' }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        p-6 rounded-sm border cursor-pointer transition-all duration-300
        ${active 
          ? 'bg-slate-800/50 border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.1)]' 
          : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const SectionTitle: React.FC<{ children: React.ReactNode, subtitle?: string }> = ({ children, subtitle }) => (
  <div className="mb-8 text-center">
    <h2 className="text-xl font-medium tracking-widest text-slate-100 uppercase">{children}</h2>
    {subtitle && <p className="text-xs text-slate-500 mt-2 tracking-wide uppercase font-mono">{subtitle}</p>}
  </div>
);

interface HeaderProps {
  title: string;
  onBack?: () => void;
  user?: { image?: string; name?: string };
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, user, onSignOut }) => (
  <header className="flex items-center justify-between py-6 px-6 border-b border-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
    <div className="w-20 flex justify-start">
      {onBack && (
        <button onClick={onBack} className="text-slate-500 hover:text-sky-400 transition-colors p-2 -ml-2">
          <Icons.ArrowLeft className="w-6 h-6" /> 
        </button>
      )}
    </div>
    
    <h1 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase text-center flex-1">{title}</h1>
    
    <div className="w-20 flex justify-end">
      {user && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 overflow-hidden shadow-[0_0_10px_rgba(14,165,233,0.2)]">
            {user.image ? (
              <img src={user.image} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <Icons.User className="w-4 h-4" />
              </div>
            )}
          </div>
          {onSignOut && (
             <button 
               onClick={onSignOut} 
               className="text-slate-500 hover:text-red-400 transition-colors"
               title="Sign Out"
             >
               <Icons.LogOut className="w-4 h-4" />
             </button>
          )}
        </div>
      )}
    </div>
  </header>
);