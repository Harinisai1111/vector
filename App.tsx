import React, { useState, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton, useUser, useClerk } from "@clerk/clerk-react";
import { Layout } from './components/Layout';
import { Button, Card, SectionTitle, Header, Input } from './components/UIComponents';
import { MuscleMap } from './components/MuscleMap';
import { Icons } from './components/Icons';
import { generateWorkout } from './services/geminiService';
import { supabase } from './services/supabase';
import { AppView, Equipment, MuscleGroup, TimeOption, WorkoutPlan } from './types';
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS, TIME_OPTIONS } from './constants';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function VectorApp() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [view, setView] = useState<AppView>('LANDING');

  // Workout Configuration State
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);
  const [selectedTime, setSelectedTime] = useState<TimeOption | null>(null);

  // Session State
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [history, setHistory] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync view with auth state
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && (view === 'LANDING' || view === 'LOGIN')) {
        setView('DASHBOARD');
      } else if (!isSignedIn && view !== 'LANDING' && view !== 'LOGIN') {
        setView('LANDING');
      }
    }
  }, [isLoaded, isSignedIn, view]);

  // Load history from Supabase
  useEffect(() => {
    if (isSignedIn && user) {
      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          // Map snake_case database fields to camelCase typescript interface if needed
          // Assuming the JSON structure in 'exercises' column matches our types
          const mappedHistory: WorkoutPlan[] = data.map(item => ({
            id: item.id,
            timestamp: new Date(item.created_at).getTime(),
            muscleGroups: item.muscle_groups, // ensure this matches DB array type
            equipment: item.equipment,
            durationMinutes: item.duration_minutes,
            exercises: item.exercises, // JSONB
            estimatedCalories: item.estimated_calories
          }));
          setHistory(mappedHistory);
        } else if (error) {
          console.error("Error fetching history:", error);
        }
      };

      fetchHistory();
    }
  }, [isSignedIn, user]);

  const saveToHistory = async (plan: WorkoutPlan) => {
    // Optimistic update
    const updated = [plan, ...history];
    setHistory(updated);

    if (user) {
      const { error } = await supabase.from('workouts').insert({
        user_id: user.id,
        muscle_groups: plan.muscleGroups,
        equipment: plan.equipment,
        duration_minutes: plan.durationMinutes,
        exercises: plan.exercises,
        estimated_calories: plan.estimatedCalories
      });

      if (error) {
        console.error("Failed to save workout:", error);
        // Could revert optimistic update here if critical
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedEquipment || selectedMuscles.length === 0 || !selectedTime) return;

    setIsLoading(true);
    setView('GENERATING');
    setError(null);

    try {
      const plan = await generateWorkout(selectedEquipment, selectedMuscles, selectedTime);
      setGeneratedPlan(plan);
      setView('SESSION');
    } catch (err) {
      console.error(err);
      setError("System malfunction. Ensure API connectivity.");
      setView('DASHBOARD');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMuscle = (muscle: MuscleGroup) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const resetFlow = () => {
    setSelectedEquipment(null);
    setSelectedMuscles([]);
    setSelectedTime(null);
    setGeneratedPlan(null);
    setView('DASHBOARD');
  };

  // --- VIEWS ---

  // Enhanced loading check:
  // 1. Wait for Clerk to load (!isLoaded)
  // 2. Prevent flash if user is already signed in but effect hasn't fired (isSignedIn && view === 'LANDING')
  // 3. Detect if we are in a Clerk redirect flow (URL params) to prevent falling back to Landing during verification
  const isClerkFlow = window.location.search.includes('__clerk_status') ||
    window.location.search.includes('code=') ||
    window.location.search.includes('state=');

  if (!isLoaded || (isSignedIn && view === 'LANDING') || (isClerkFlow && !isSignedIn)) {
    return (
      <Layout className="flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-t-2 border-sky-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-2 border-slate-700 rounded-full animate-spin decoration-slice" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
          </div>
          <div>
            <h3 className="text-lg font-medium tracking-widest text-slate-200 uppercase animate-pulse">
              {isClerkFlow ? 'Verifying Security' : 'Initializing System'}
            </h3>
          </div>
        </div>
      </Layout>
    );
  }

  if (view === 'LANDING') {
    return (
      <Layout className="justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"></div>

        <div className="flex flex-col items-center justify-center min-h-screen px-8 relative z-10 w-full">
          <div className="space-y-8 max-w-lg w-full">
            <div className="space-y-2">
              <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter text-slate-100">VECTOR</h1>
              <p className="text-sm tracking-[0.2em] text-sky-500 uppercase font-mono">System v1.2.3</p>
            </div>

            <div className="h-px w-12 bg-slate-700" />

            <p className="text-slate-400 max-w-xs text-lg font-light leading-relaxed">
              Direction over motivation.<br />
              Precision muscle targeting.
            </p>

            <div className="pt-12">
              <SignedIn>
                <Button onClick={() => setView('DASHBOARD')}>
                  Enter Command <Icons.ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </SignedIn>
              <SignedOut>
                <Button onClick={() => setView('LOGIN')}>
                  Initialize System <Icons.ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </SignedOut>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (view === 'LOGIN') {
    return (
      <Layout className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Header title="AUTHENTICATION" onBack={() => setView('LANDING')} />
          <div className="mt-8 flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-slate-900 border border-slate-800 text-slate-200",
                  headerTitle: "text-slate-100",
                  headerSubtitle: "text-slate-400",
                  socialButtonsBlockButton: "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700",
                  formFieldLabel: "text-slate-400",
                  formFieldInput: "bg-slate-950 border-slate-800 text-slate-200",
                  footerActionLink: "text-sky-500 hover:text-sky-400"
                }
              }}
              signUpUrl={undefined} // handled automatically by clerk usually, or we can add sign-up
            />
          </div>
        </div>
      </Layout>
    );
  }

  if (view === 'DASHBOARD') {
    return (
      <Layout>
        {/* Pass user and signout handler to Header */}
        <Header
          title="COMMAND"
          user={user ? { name: user.firstName || user.username || 'PILOT', image: user.imageUrl } : undefined}
          onSignOut={() => signOut(() => setView('LANDING'))}
        />
        <main className="flex-1 flex flex-col p-6 lg:p-12 gap-6 justify-center max-w-2xl mx-auto w-full">

          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full rounded-full object-cover opacity-80" />
              ) : (
                <Icons.Activity className="w-10 h-10 text-sky-500" />
              )}
            </div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.3em]">System Ready</p>
            <p className="text-xs text-sky-500/50 uppercase tracking-widest mt-2">{user?.firstName || user?.username || 'PILOT'}</p>
          </div>

          <div className="space-y-4 w-full">
            <Button variant="primary" onClick={() => setView('SETUP_EQUIPMENT')} className="h-16 text-lg">
              INITIATE WORKOUT
            </Button>

            <Button variant="secondary" onClick={() => setView('HISTORY')} icon={<Icons.History className="w-4 h-4" />}>
              HISTORY LOG
            </Button>
          </div>

        </main>
      </Layout>
    );
  }

  if (view === 'SETUP_EQUIPMENT') {
    return (
      <Layout>
        <Header title="CONFIG // EQ" onBack={() => setView('DASHBOARD')} />
        <main className="flex-1 p-6 lg:p-12 flex flex-col items-center">
          <div className="w-full max-w-4xl">
            <SectionTitle subtitle="Select available hardware">Equipment</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <Card
                  key={eq}
                  active={selectedEquipment === eq}
                  onClick={() => {
                    setSelectedEquipment(eq);
                    setTimeout(() => setView('SETUP_MUSCLES'), 250);
                  }}
                  className="flex flex-col items-center justify-center text-center py-12 gap-4 group hover:scale-[1.02] active:scale-95"
                >
                  <Icons.Dumbbell className={`w-8 h-8 ${selectedEquipment === eq ? 'text-sky-400' : 'text-slate-600'}`} />
                  <span className="text-base font-medium tracking-wide uppercase group-hover:text-slate-200">{eq}</span>
                  {selectedEquipment === eq && <Icons.Check className="w-5 h-5 text-sky-400 absolute top-4 right-4" />}
                </Card>
              ))}
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (view === 'SETUP_MUSCLES') {
    return (
      <Layout>
        <Header title="CONFIG // ZONE" onBack={() => setView('SETUP_EQUIPMENT')} />
        <main className="flex-1 p-4 lg:p-8 flex flex-col h-full overflow-hidden">
          <SectionTitle subtitle="Target Systems">Muscle Groups</SectionTitle>

          <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-start justify-center h-full overflow-y-auto lg:overflow-hidden w-full max-w-7xl mx-auto">

            {/* Interactive Body Map - Scaled for better visibility */}
            <div className="flex-shrink-0 w-full lg:w-3/5 flex justify-center items-center py-4 min-h-[400px]">
              <MuscleMap
                selectedMuscles={selectedMuscles}
                onToggle={toggleMuscle}
                className="w-full h-full max-h-[600px]"
              />
            </div>

            {/* Selection Grid */}
            <div className="w-full lg:w-2/5 flex flex-col gap-6 p-4">
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                {MUSCLE_GROUPS.map((muscle) => (
                  <Card
                    key={muscle}
                    active={selectedMuscles.includes(muscle)}
                    onClick={() => toggleMuscle(muscle)}
                    className="flex items-center justify-between py-4 px-6 hover:bg-slate-800/80 transition-all"
                  >
                    <span className="text-xs lg:text-sm font-medium tracking-wide uppercase">{muscle}</span>
                    {selectedMuscles.includes(muscle) && <div className="w-2 h-2 bg-sky-500 rounded-full shadow-[0_0_8px_#0ea5e9]" />}
                  </Card>
                ))}
              </div>

              <div className="mt-6 lg:mt-auto">
                <Button
                  disabled={selectedMuscles.length === 0}
                  onClick={() => setView('SETUP_TIME')}
                  className="w-full"
                >
                  Confirm Target ({selectedMuscles.length})
                </Button>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (view === 'SETUP_TIME') {
    return (
      <Layout>
        <Header title="CONFIG // TIME" onBack={() => setView('SETUP_MUSCLES')} />
        <main className="flex-1 p-6 lg:p-12 flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <SectionTitle subtitle="Time Constraint">Duration (Min)</SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {TIME_OPTIONS.map((time) => (
                <Card
                  key={time}
                  active={selectedTime === time}
                  onClick={() => setSelectedTime(time)}
                  className="flex items-center justify-between p-8 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <Icons.Clock className={`w-6 h-6 ${selectedTime === time ? 'text-sky-400' : 'text-slate-600'}`} />
                    <span className="text-2xl font-mono">{time}:00</span>
                  </div>
                  {selectedTime === time && <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_15px_#38bdf8]" />}
                </Card>
              ))}
            </div>

            <div className="mt-12">
              <Button
                disabled={!selectedTime}
                onClick={handleGenerate}
                className="h-14 text-base"
              >
                GENERATE VECTOR
              </Button>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (view === 'GENERATING') {
    return (
      <Layout className="flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-t-2 border-sky-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-2 border-slate-700 rounded-full animate-spin decoration-slice" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icons.Activity className="w-8 h-8 text-sky-500 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium tracking-widest text-slate-200 uppercase animate-pulse">Computing Vector</h3>
            <p className="text-xs text-slate-500 mt-2 font-mono uppercase">Segmenting Anatomy...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (view === 'SESSION' && generatedPlan) {
    return (
      <SessionView
        plan={generatedPlan}
        onFinish={(completedPlan) => {
          saveToHistory(completedPlan);
          resetFlow();
        }}
        onAbort={resetFlow}
      />
    );
  }

  if (view === 'HISTORY') {
    return (
      <Layout>
        <Header title="LOGS" onBack={() => setView('DASHBOARD')} />
        <main className="flex-1 p-6 lg:p-12 w-full max-w-4xl mx-auto overflow-y-auto">
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <p className="text-xs uppercase tracking-widest">No flight logs found.</p>
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="border border-slate-800 bg-slate-900/50 p-6 rounded-sm hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                    <div className="flex gap-4">
                      <span className="text-xs font-mono text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                      <span className="text-xs font-bold text-slate-300 uppercase">{entry.muscleGroups.join(', ')}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-sky-500">{entry.durationMinutes} MIN</span>
                      {entry.estimatedCalories && (
                        <span className="block text-[10px] font-mono text-slate-500 mt-1">{entry.estimatedCalories} KCAL EST</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entry.exercises.map((ex, i) => (
                      <div key={i} className="flex justify-between items-baseline text-sm p-2 bg-slate-950/30 rounded border border-slate-800/50">
                        <span className="text-slate-300 font-medium truncate pr-4">{ex.name}</span>
                        <span className="text-slate-500 font-mono text-xs whitespace-nowrap">{ex.sets} x {ex.repsOrDuration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </Layout>
    );
  }

  // Error State or Fallback
  return (
    <Layout className="flex items-center justify-center p-8 text-center">
      <div className="space-y-4">
        <p className="text-red-400 font-mono uppercase text-sm">{error || "Critical Failure"}</p>
        <Button variant="secondary" onClick={() => setView('DASHBOARD')}>Return to Base</Button>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <VectorApp />
    </ClerkProvider>
  );
}

// --- SUB-COMPONENTS FOR SESSION ---

const SessionView = ({ plan, onFinish, onAbort }: { plan: WorkoutPlan, onFinish: (p: WorkoutPlan) => void, onAbort: () => void }) => {
  const [checkedIndices, setCheckedIndices] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);

  // Global Session Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setElapsed(e => e + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Rest Timer
  useEffect(() => {
    let interval: any;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const toggleCheck = (index: number) => {
    setCheckedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const startRest = (seconds: number) => {
    setRestTimeLeft(seconds);
    setIsResting(true);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const allComplete = checkedIndices.length === plan.exercises.length;

  return (
    // Reverting to document scroll for robust sticky behavior on mobile
    <Layout className="">
      <div className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 p-4 lg:p-6 sticky top-0 z-40 flex justify-between items-center shadow-2xl w-full">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Mission Timer</span>
          <div className="flex items-center gap-3">
            <div className={`flex items-baseline gap-2 ${isPaused ? 'opacity-50' : ''}`}>
              <span className="font-mono text-2xl text-sky-400">{formatTime(elapsed)}</span>
              {plan.estimatedCalories && (
                <span className="text-[10px] font-mono text-slate-500 uppercase hidden sm:inline">
                  / {plan.estimatedCalories} KCAL EST
                </span>
              )}
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-sm bg-slate-900 border border-slate-700 hover:border-sky-500 hover:text-sky-400 text-slate-400 transition-colors"
              aria-label={isPaused ? "Resume Timer" : "Pause Timer"}
            >
              {isPaused ? <Icons.Play className="w-3 h-3" /> : <Icons.Pause className="w-3 h-3" />}
            </button>

            {isPaused && <span className="text-[10px] text-yellow-500 font-bold tracking-wider uppercase animate-pulse ml-2">Paused</span>}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">System Progress</span>
          <div className="flex gap-1 mt-2 justify-end">
            {plan.exercises.map((_, i) => (
              <div key={i} className={`w-3 h-1.5 rounded-sm transition-colors duration-300 ${checkedIndices.includes(i) ? 'bg-sky-500 shadow-[0_0_8px_#0ea5e9]' : 'bg-slate-800'}`} />
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full pb-32 p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {plan.exercises.map((ex, idx) => {
            const isChecked = checkedIndices.includes(idx);
            return (
              <div
                key={idx}
                className={`relative transition-all duration-500 p-6 rounded border ${isChecked ? 'opacity-40 grayscale border-slate-800 bg-slate-900/20' : 'bg-slate-900/40 border-slate-700 hover:border-sky-500/30'}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleCheck(idx)}
                    className={`mt-1 flex-shrink-0 w-8 h-8 rounded-sm border flex items-center justify-center transition-colors ${isChecked ? 'bg-sky-900 border-sky-700' : 'border-slate-600 hover:border-slate-400'}`}
                  >
                    {isChecked && <Icons.Check className="w-5 h-5 text-sky-400" />}
                  </button>

                  <div className="flex-shrink-0">
                    <img
                      src={`https://image.pollinations.ai/prompt/${encodeURIComponent((ex.visualTag || ex.name) + ' minimal vector art gym dark bg')}?width=100&height=100&nologo=true`}
                      alt={ex.name}
                      className="w-16 h-16 rounded object-cover border border-slate-700 bg-slate-950"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <h4 className="text-lg font-medium text-slate-200">{ex.name}</h4>
                    </div>

                    <div className="flex items-center gap-8 text-sm pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Sets</span>
                        <span className="font-mono text-lg text-slate-200">{ex.sets}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Load</span>
                        <span className="font-mono text-lg text-slate-200">{ex.repsOrDuration}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Eq</span>
                        <span className="font-mono text-xs text-slate-400 uppercase mt-1">{ex.equipment}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 border-l-2 border-slate-700 pl-3 italic mt-2 leading-relaxed">
                      {ex.formGuidance}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-6 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-30 flex justify-center">
        <div className="w-full max-w-md lg:max-w-xl">
          {allComplete ? (
            <Button onClick={() => onFinish(plan)} className="animate-pulse shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              MISSION COMPLETE
            </Button>
          ) : checkedIndices.length > 0 ? (
            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  const completedExercises = plan.exercises.filter((_, i) => checkedIndices.includes(i));
                  const partialPlan = {
                    ...plan,
                    exercises: completedExercises,
                    // Improve: could also scale estimatedCalories
                  };
                  onFinish(partialPlan);
                }}
              >
                SAVE PROGRESS ({checkedIndices.length}/{plan.exercises.length})
              </Button>
              <Button variant="danger" onClick={onAbort} className="opacity-50 hover:opacity-100">
                ABORT SESSION
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={onAbort}>
              ABORT SESSION
            </Button>
          )}
        </div>
      </div>

      {/* Rest Overlay */}
      {isResting && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="text-center space-y-8">
            <span className="text-sm uppercase tracking-[0.3em] text-slate-400 animate-pulse">Recover</span>
            <div className="relative">
              <div className="text-9xl font-mono font-bold text-sky-400 tabular-nums relative z-10">
                {restTimeLeft}
              </div>
              <div className="absolute inset-0 bg-sky-500/20 blur-[50px] -z-10 rounded-full" />
            </div>
            <Button variant="secondary" onClick={() => setIsResting(false)} className="w-auto px-12 mx-auto">
              Skip Rest
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}