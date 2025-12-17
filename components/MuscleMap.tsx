import React from 'react';
import { MuscleGroup } from '../types';

interface MuscleMapProps {
  selectedMuscles: MuscleGroup[];
  onToggle: (muscle: MuscleGroup) => void;
  className?: string;
}

export const MuscleMap: React.FC<MuscleMapProps> = ({ selectedMuscles, onToggle, className = "" }) => {
  const isSelected = (m: MuscleGroup) => selectedMuscles.includes(m);
  
  // Tech/Aviation style colors
  const styles = (m: MuscleGroup) => ({
    fill: isSelected(m) ? "#0ea5e9" : "#0f172a", // Sky-500 vs Slate-900
    stroke: isSelected(m) ? "#38bdf8" : "#334155", // Sky-400 vs Slate-700
    fillOpacity: isSelected(m) ? 0.8 : 0.3,
    strokeWidth: isSelected(m) ? 2 : 1,
    filter: isSelected(m) ? "drop-shadow(0 0 8px rgba(14, 165, 233, 0.5))" : "none",
    transition: "all 0.3s ease",
    cursor: "pointer"
  });

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 400 700" className="h-[450px] lg:h-[600px] w-auto drop-shadow-2xl">
         <defs>
           <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="#0f172a" />
             <stop offset="50%" stopColor="#1e293b" />
             <stop offset="100%" stopColor="#0f172a" />
           </linearGradient>
           <filter id="glow">
             <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
             <feMerge>
               <feMergeNode in="coloredBlur"/>
               <feMergeNode in="SourceGraphic"/>
             </feMerge>
           </filter>
         </defs>

         {/* --- FRONT VIEW --- */}
         <g transform="translate(0, 0)">
           
           {/* Head & Neck (Non-interactive) */}
           <path d="M180,40 Q200,30 220,40 Q230,60 220,90 Q200,100 180,90 Q170,60 180,40 Z" fill="#1e293b" stroke="#334155" />
           <path d="M185,90 L175,110 L225,110 L215,90" fill="#1e293b" stroke="#334155" />

           {/* TRAPS (Shoulders/Back visual from front) */}
           <path 
             d="M175,110 L140,125 L150,110 L175,100 Z" 
             style={styles('Back')} onClick={() => onToggle('Back')} 
           />
           <path 
             d="M225,110 L260,125 L250,110 L225,100 Z" 
             style={styles('Back')} onClick={() => onToggle('Back')} 
           />

           {/* SHOULDERS (Deltoids) */}
           {/* Left Delt */}
           <path 
             d="M140,125 Q130,135 125,160 Q130,190 145,200 L155,160 L140,125 Z" 
             style={styles('Shoulders')} onClick={() => onToggle('Shoulders')} 
           />
           {/* Right Delt */}
           <path 
             d="M260,125 Q270,135 275,160 Q270,190 255,200 L245,160 L260,125 Z" 
             style={styles('Shoulders')} onClick={() => onToggle('Shoulders')} 
           />

           {/* CHEST (Pectoralis Major) */}
           {/* Left Pec */}
           <path 
             d="M200,120 L155,125 L155,160 Q160,190 180,195 L200,195 L200,120 Z" 
             style={styles('Chest')} onClick={() => onToggle('Chest')} 
           />
           {/* Right Pec */}
           <path 
             d="M200,120 L245,125 L245,160 Q240,190 220,195 L200,195 L200,120 Z" 
             style={styles('Chest')} onClick={() => onToggle('Chest')} 
           />
           {/* Pectoralis Minor / Upper Detail */}
           <path 
             d="M200,125 L165,130 L180,150 Z" 
             fill="rgba(255,255,255,0.05)" className="pointer-events-none"
           />
           <path 
             d="M200,125 L235,130 L220,150 Z" 
             fill="rgba(255,255,255,0.05)" className="pointer-events-none"
           />

           {/* ARMS (Biceps & Triceps visible from front) */}
           {/* Left Bicep */}
           <path 
             d="M145,200 L135,260 Q145,270 160,260 L165,205 Z" 
             style={styles('Arms')} onClick={() => onToggle('Arms')} 
           />
           {/* Right Bicep */}
           <path 
             d="M255,200 L265,260 Q255,270 240,260 L235,205 Z" 
             style={styles('Arms')} onClick={() => onToggle('Arms')} 
           />
           {/* Forearms */}
           <path d="M135,260 L125,320 L150,320 L160,260" style={styles('Arms')} onClick={() => onToggle('Arms')} />
           <path d="M265,260 L275,320 L250,320 L240,260" style={styles('Arms')} onClick={() => onToggle('Arms')} />

           {/* CORE (Abs & Obliques & Serratus) */}
           {/* Serratus (Side Ribs) */}
           <path d="M155,180 L145,220 L165,230" style={styles('Core')} onClick={() => onToggle('Core')} />
           <path d="M245,180 L255,220 L235,230" style={styles('Core')} onClick={() => onToggle('Core')} />
           
           {/* Rectus Abdominis (Six Pack) */}
           <path 
             d="M180,195 L220,195 L215,280 L185,280 Z" 
             style={styles('Core')} onClick={() => onToggle('Core')} 
           />
           {/* Ab Lines for detail */}
           <line x1="182" y1="215" x2="218" y2="215" stroke={isSelected('Core') ? "#0c4a6e" : "#1e293b"} strokeWidth="1" />
           <line x1="184" y1="235" x2="216" y2="235" stroke={isSelected('Core') ? "#0c4a6e" : "#1e293b"} strokeWidth="1" />
           <line x1="186" y1="255" x2="214" y2="255" stroke={isSelected('Core') ? "#0c4a6e" : "#1e293b"} strokeWidth="1" />

           {/* Obliques */}
           <path d="M165,230 L165,270 L185,280 L180,195" style={styles('Core')} onClick={() => onToggle('Core')} />
           <path d="M235,230 L235,270 L215,280 L220,195" style={styles('Core')} onClick={() => onToggle('Core')} />

           {/* LEGS (Quads) */}
           <path 
             d="M165,270 L155,380 Q160,400 180,400 L195,300 L185,280 Z" 
             style={styles('Legs')} onClick={() => onToggle('Legs')} 
           />
           <path 
             d="M235,270 L245,380 Q240,400 220,400 L205,300 L215,280 Z" 
             style={styles('Legs')} onClick={() => onToggle('Legs')} 
           />
           {/* Inner Thigh (Adductors) */}
           <path d="M195,300 L190,380 L180,400" style={styles('Legs')} onClick={() => onToggle('Legs')} />
           <path d="M205,300 L210,380 L220,400" style={styles('Legs')} onClick={() => onToggle('Legs')} />

           {/* Calves */}
           <path d="M160,410 L155,500 L180,500 L185,410" style={styles('Legs')} onClick={() => onToggle('Legs')} />
           <path d="M240,410 L245,500 L220,500 L215,410" style={styles('Legs')} onClick={() => onToggle('Legs')} />

         </g>
         
         {/* Labels - Left Side */}
         
         {/* Trapezius */}
         <text x="60" y="110" fill={isSelected('Back') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="end">TRAPEZIUS</text>
         <line x1="65" y1="108" x2="160" y2="115" stroke={isSelected('Back') ? "#38bdf8" : "#334155"} strokeWidth="1" />

         {/* Deltoid */}
         <text x="60" y="140" fill={isSelected('Shoulders') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="end">DELTOID</text>
         <line x1="65" y1="138" x2="140" y2="145" stroke={isSelected('Shoulders') ? "#38bdf8" : "#334155"} strokeWidth="1" />

         {/* Pectoralis */}
         <text x="60" y="180" fill={isSelected('Chest') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="end">PECTORALIS</text>
         <line x1="65" y1="178" x2="160" y2="150" stroke={isSelected('Chest') ? "#38bdf8" : "#334155"} strokeWidth="1" />
         
         {/* Obliques */}
         <text x="60" y="270" fill={isSelected('Core') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="end">OBLIQUES</text>
         <line x1="65" y1="268" x2="170" y2="250" stroke={isSelected('Core') ? "#38bdf8" : "#334155"} strokeWidth="1" />

         {/* Adductors */}
         <text x="60" y="340" fill={isSelected('Legs') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="end">ADDUCTORS</text>
         <line x1="65" y1="338" x2="190" y2="340" stroke={isSelected('Legs') ? "#38bdf8" : "#334155"} strokeWidth="1" />


         {/* Labels - Right Side */}
         
         {/* Biceps */}
         <text x="340" y="230" fill={isSelected('Arms') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="start">BICEPS</text>
         <line x1="335" y1="228" x2="255" y2="230" stroke={isSelected('Arms') ? "#38bdf8" : "#334155"} strokeWidth="1" />

         {/* Abdominals */}
         <text x="340" y="200" fill={isSelected('Core') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="start">ABDOMINAL</text>
         <line x1="335" y1="198" x2="210" y2="220" stroke={isSelected('Core') ? "#38bdf8" : "#334155"} strokeWidth="1" />

         {/* Forearms */}
         <text x="340" y="290" fill={isSelected('Arms') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="start">BRACHIORADIALIS</text>
         <line x1="335" y1="288" x2="270" y2="290" stroke={isSelected('Arms') ? "#38bdf8" : "#334155"} strokeWidth="1" />

         {/* Quadriceps */}
         <text x="340" y="340" fill={isSelected('Legs') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="start">QUADRICEPS</text>
         <line x1="335" y1="338" x2="230" y2="330" stroke={isSelected('Legs') ? "#38bdf8" : "#334155"} strokeWidth="1" />

         {/* Calves */}
         <text x="340" y="450" fill={isSelected('Legs') ? "#38bdf8" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="start">GASTROCNEMIUS</text>
         <line x1="335" y1="448" x2="230" y2="450" stroke={isSelected('Legs') ? "#38bdf8" : "#334155"} strokeWidth="1" />

      </svg>
    </div>
  );
};