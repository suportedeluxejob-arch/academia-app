import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Dumbbell, 
  Home, 
  Compass, 
  BarChart2, 
  User,
  Clock,
  Flame,
  Zap,
  CheckCircle,
  Sparkles,
  ArrowRight,
  X,
  ChevronRight,
  TrendingUp,
  Cpu,
  Calendar,
  Check
} from 'lucide-react';
import { ref, onValue, set, get } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { db, auth } from './firebase';
import './App.css';
import Exercises from './Exercises';
import Explore from './Explore';
import Progress from './Progress';
import Auth from './Auth';

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [streak, setStreak] = useState(0);
  const [workoutsMonth, setWorkoutsMonth] = useState(0);
  const [isWorkoutDone, setIsWorkoutDone] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any[]>([]);

  // Workout Mode States
  const [activeWorkout, setActiveWorkout] = useState<any | null>(null);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  
  // Custom inline editing states for active exercise
  const [editedSets, setEditedSets] = useState<number>(4);
  const [editedReps, setEditedReps] = useState<string>('10-12');
  const [editedLoad, setEditedLoad] = useState<string>('0');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Custom grip/variations smooth cycling states
  const [variationIdx, setVariationIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [completedDates, setCompletedDates] = useState<Record<string, boolean>>({});
  const [userXp, setUserXp] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Firebase Realtime Data for Home
  useEffect(() => {
    if (!currentUser) return;
    const userRef = ref(db, `users/${currentUser.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStreak(data.streak || 0);
        setWorkoutsMonth(data.workoutsMonth || 0);
        setCurrentPlan(data.currentPlan || []);
        setCompletedDates(data.completedDates || {});
        setUserXp(data.xp || 0);
        
        // Check if last workout was today
        const today = new Date().toISOString().split('T')[0];
        setIsWorkoutDone(data.lastWorkoutDate === today);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  const currentExercise = activeWorkout?.exercises[currentExerciseIdx];

  // Dynamic grip variations smooth cycling timer (for W-Bar curls!)
  useEffect(() => {
    setVariationIdx(0);
    setFade(true);
  }, [currentExerciseIdx, activeWorkout]);

  useEffect(() => {
    if (currentExercise && currentExercise.variations && currentExercise.variations.length > 0) {
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setVariationIdx(prev => (prev + 1) % currentExercise.variations.length);
          setFade(true);
        }, 300); // matches the 0.3s CSS transition opacity fadeout
      }, 3500); // 3.5s per variation name
      return () => clearInterval(interval);
    }
  }, [currentExercise]);

  useEffect(() => {
    if (currentExercise) {
      const parsedSets = parseInt(String(currentExercise.sets)) || 4;
      setEditedSets(parsedSets);
      setEditedReps(String(currentExercise.reps));
      setEditedLoad(String(currentExercise.load));
    }
  }, [currentExerciseIdx, activeWorkout?.title]);


  const handleStartWorkout = (workout: any) => {
    setActiveWorkout(workout);
    setCurrentExerciseIdx(0);
  };

  const handleStartSingleExercise = (exercise: any) => {
    setActiveWorkout({
      title: 'Biblioteca de Treinos',
      duration: 10,
      intensity: 'Alta',
      muscles: [exercise.title],
      exercises: [
        {
          name: exercise.title,
          machine: exercise.machine,
          video: exercise.video,
          sets: exercise.sets,
          reps: exercise.reps,
          load: exercise.load,
          variations: exercise.variations || null // Pass W-Bar variations down
        }
      ]
    });
    setCurrentExerciseIdx(0);
  };
  const persistCustomExerciseSpecs = async (s: number, r: string, l: string) => {
    if (!activeWorkout || activeWorkout.title === 'Biblioteca de Treinos') return;
    
    // Update local active workout
    const updatedExercises = activeWorkout.exercises.map((ex: any, idx: number) => {
      if (idx === currentExerciseIdx) {
        return { ...ex, sets: s, reps: r, load: l };
      }
      return ex;
    });
    
    const updatedWorkout = { ...activeWorkout, exercises: updatedExercises };
    setActiveWorkout(updatedWorkout);

    // Sync to currentPlan array
    const updatedPlan = currentPlan.map((w: any) => {
      if (w.title === activeWorkout.title) {
        return updatedWorkout;
      }
      return w;
    });

    try {
      if (!currentUser) return;
      await set(ref(db, `users/${currentUser.uid}/currentPlan`), updatedPlan);
      console.log("Specs permanently persisted to database currentPlan!");
    } catch (err) {
      console.error("Failed to persist custom specs to database:", err);
      localStorage.setItem('fit_current_plan_backup', JSON.stringify(updatedPlan));
    }
  };

  const handleNextExercise = () => {
    if (!activeWorkout) return;
    
    // Save current custom specs before moving to next exercise
    persistCustomExerciseSpecs(editedSets, editedReps, editedLoad);

    if (currentExerciseIdx < activeWorkout.exercises.length - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
      // Auto play video for next exercise
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(err => console.log('Video play error:', err));
      }
    } else {
      // Completed last exercise
      handleFinishWorkout();
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeWorkout) return;

    // Save final specs
    persistCustomExerciseSpecs(editedSets, editedReps, editedLoad);

    const today = new Date().toISOString().split('T')[0];
    
    // Fallback variables in case database is offline or slow
    let newStreak = streak + 1;
    let newWorkoutsMonth = workoutsMonth + 1;
    let newXp = userXp + 100;
    const completed = { ...completedDates };
    completed[today] = true;

    try {
      if (!currentUser) return;
      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      const data = snapshot.val() || {};
      
      newStreak = (data.streak || 0) + 1;
      newWorkoutsMonth = (data.workoutsMonth || 0) + 1;
      newXp = (data.xp || 0) + 100;
      
      const firebaseCompleted = data.completedDates || {};
      firebaseCompleted[today] = true;

      const completedWorkouts = data.completedWorkouts || [];
      completedWorkouts.push({
        date: today,
        title: activeWorkout.title,
        exercisesCount: activeWorkout.exercises.length,
        duration: activeWorkout.duration || 10,
        xpEarned: 100
      });

      await set(userRef, {
        ...data,
        streak: newStreak,
        workoutsMonth: newWorkoutsMonth,
        lastWorkoutDate: today,
        completedDates: firebaseCompleted,
        completedWorkouts: completedWorkouts,
        xp: newXp
      });

      // Update state matching database success
      setStreak(newStreak);
      setWorkoutsMonth(newWorkoutsMonth);
      setCompletedDates(firebaseCompleted);
      setUserXp(newXp);

    } catch (error) {
      console.warn("Database sync failed, fall backing to local storage:", error);
      
      // Save locally to LocalStorage so progress is NEVER lost!
      const localBackup = {
        streak: newStreak,
        workoutsMonth: newWorkoutsMonth,
        completedDates: completed,
        xp: newXp
      };
      localStorage.setItem('fit_user_backup', JSON.stringify(localBackup));

      // Update state directly to maintain excellent UX
      setStreak(newStreak);
      setWorkoutsMonth(newWorkoutsMonth);
      setCompletedDates(completed);
      setUserXp(newXp);
    } finally {
      // Clear active workout and show the stunning reward celebration popup immediately!
      setActiveWorkout(null);
      setCelebrationStreak(newStreak);
      setShowCelebration(true);
    }
  };

  // Helper to generate the 7 days of the current week (Monday to Sunday)
  const getWeekDates = () => {
    const current = new Date();
    const week = [];
    const currentDay = current.getDay(); // 0 is Sunday, 1 is Monday, ...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    const dayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const fullDayLabels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dateStr = day.toISOString().split('T')[0];
      
      week.push({
        label: dayLabels[i],
        fullName: fullDayLabels[i],
        dateStr: dateStr,
        isToday: dateStr === current.toISOString().split('T')[0],
        isFuture: day > current
      });
    }
    return week;
  };

  const weekDays = getWeekDates();

  if (authLoading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080a' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(225, 255, 0, 0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="user-greeting" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <p>Bom dia,</p>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {currentUser?.displayName || 'Atleta'} <span className="level-badge">NÍVEL {Math.floor(userXp / 300) + 1}</span>
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="profile-btn" onClick={() => setActiveTab('progress')} title="Estatísticas">
                <User size={20} />
              </button>
              <button 
                className="profile-btn" 
                onClick={() => signOut(auth)} 
                title="Sair da Conta"
                style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#ff453a', border: '1px solid rgba(255, 59, 48, 0.15)', width: 'auto', padding: '0.5rem 0.8rem', borderRadius: '10px' }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>SAIR</span>
              </button>
            </div>
          </div>
          
          {/* Level Progress Bar */}
          <div className="xp-progress-container" style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
              <span>XP TOTAL: {userXp} XP</span>
              <span>{(userXp % 300)} / 300 XP PARA O PRÓXIMO NÍVEL</span>
            </div>
            <div className="xp-bar-bg" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div 
                className="xp-bar-fill" 
                style={{ 
                  height: '100%', 
                  width: `${((userXp % 300) / 300) * 100}%`, 
                  background: 'var(--accent-primary)',
                  boxShadow: '0 0 10px var(--accent-primary)',
                  transition: 'width 0.5s ease-out'
                }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        
        {activeTab === 'home' && (
          <>
            {/* Weekly Training Tracker & Daily Status Widget */}
            <section className="weekly-tracker-card glass-panel">
              <div className="tracker-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '0.02em' }}>SEMANA DO ATLETA</h3>
                </div>
                <span className="streak-badge">
                  <Flame size={14} fill="currentColor" style={{ marginRight: '2px' }} /> {streak}d Ofensiva
                </span>
              </div>

              {/* Days Row */}
              <div className="days-row">
                {weekDays.map((day, idx) => {
                  const done = completedDates[day.dateStr] === true;
                  return (
                    <div 
                      key={idx} 
                      className={`day-capsule ${day.isToday ? 'today' : ''} ${done ? 'completed' : ''} ${day.isFuture ? 'future' : ''}`}
                    >
                      <span className="day-label">{day.label}</span>
                      <div className="day-status-indicator">
                        {done ? (
                          <Check size={12} strokeWidth={3} />
                        ) : (
                          <div className="dot"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Daily Focus / Status Bar */}
              <div className="daily-status-container">
                {isWorkoutDone ? (
                  <div className="status-success-box">
                    <div className="success-glow-circle">
                      <CheckCircle size={20} color="#30d158" fill="rgba(48, 209, 88, 0.1)" />
                    </div>
                    <div>
                      <h4>Treino do Dia Concluído! 🔥</h4>
                      <p>Você cumpriu sua meta diária de saúde. Bom descanso, atleta!</p>
                    </div>
                  </div>
                ) : (
                  <div className="status-pending-box">
                    <div className="pending-glow-circle">
                      <Zap size={20} color="var(--accent-primary)" className="pulse" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4>Seu Treino te Espera</h4>
                      <p>Vamos garantir o treino de hoje e manter a sua consistência?</p>
                    </div>
                    {currentPlan.length > 0 && (
                      <button className="start-today-btn" onClick={() => handleStartWorkout(currentPlan[0])}>
                        INICIAR
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <Flame size={24} color="var(--accent-primary)" />
                  <div className="stat-value">{workoutsMonth}</div>
                  <div className="stat-label">Treinos no Mês</div>
                </div>
                <div className="stat-card">
                  <Zap size={24} color="var(--accent-primary)" />
                  <div className="stat-value">{streak}</div>
                  <div className="stat-label">Dias de Ofensiva</div>
                </div>
              </div>
            </section>

            {/* Recommended Workouts / Custom Plan */}
            <section className="workouts-section">
              <div className="section-header">
                <h3 className="section-title">
                  {currentPlan.length > 0 ? 'Seu Plano Inteligente' : 'Próximos Treinos'}
                </h3>
                {currentPlan.length > 0 && (
                  <button className="see-all" onClick={() => setActiveTab('explore')}>Reconfigurar</button>
                )}
              </div>
              
              {currentPlan.length > 0 ? (
                <div className="horizontal-scroll">
                  {currentPlan.map((w, idx) => (
                    <div 
                      key={idx} 
                      className="workout-card"
                      onClick={() => handleStartWorkout(w)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="workout-icon" style={{ background: 'rgba(225, 255, 0, 0.1)', color: 'var(--accent-primary)' }}>
                        <Dumbbell size={24} />
                      </div>
                      <h3>{w.title}</h3>
                      <div className="workout-meta">
                        <span className="meta-item"><Clock size={14} /> {w.duration} min</span>
                        <span className="meta-item"><Flame size={14} /> {w.intensity} Int.</span>
                      </div>
                      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Músculos: {w.muscles.join(', ')}
                      </div>
                      <div className="start-badge" style={{ marginTop: '1rem', background: 'var(--accent-primary-dim)', color: 'var(--accent-primary)', padding: '0.4rem', borderRadius: '8px', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
                        TOCAR PARA INICIAR
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-plan-card glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--border-color)', marginBottom: '1.5rem' }}>
                  <Sparkles size={32} color="var(--accent-primary)" style={{ marginBottom: '0.75rem' }} />
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Nenhum plano ativo</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '1rem' }}>Crie um plano inteligente e adaptado às especificações do seu corpo!</p>
                  <button className="primary-btn" style={{ margin: '0 auto', maxWidth: '200px' }} onClick={() => setActiveTab('explore')}>
                    Criar Plano <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'exercises' && (
          <Exercises onStartExercise={handleStartSingleExercise} />
        )}

        {activeTab === 'explore' && (
          <Explore />
        )}

        {activeTab === 'progress' && (
          <Progress />
        )}
        
      </main>

      {/* Workout Mode Full Screen Overlay */}
      {activeWorkout && currentExercise && (
        <div className="workout-mode-overlay">
          <div className="workout-mode-container glass-panel">
            <header className="workout-mode-header">
              <div>
                <span className="workout-mode-subtitle">{activeWorkout.title}</span>
                <h2 className="workout-mode-title">Treino em Andamento</h2>
              </div>
              <button className="close-workout-btn" onClick={() => setShowCancelConfirm(true)}>
                <X size={20} />
              </button>
            </header>

            <div className="workout-mode-content">
              {/* Intelligent Video Viewport */}
              <div className="workout-video-viewport" onClick={() => setShowVideoModal(true)} style={{ cursor: 'pointer', position: 'relative' }}>
                {currentExercise.video ? (
                  <>
                    <video 
                      ref={videoRef}
                      className="workout-exercise-video"
                      src={currentExercise.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                    <div className="video-expand-overlay">
                      <Play size={20} fill="var(--accent-primary)" color="var(--accent-primary)" />
                      <span>Ver em Tela Cheia 🔍</span>
                    </div>
                  </>
                ) : (
                  <div className="workout-video-placeholder">
                    <Cpu size={48} color="var(--accent-primary)" className="pulse" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Vídeo Demonstrativo</span>
                  </div>
                )}
                <div className="exercise-step-indicator">
                  Exercício {currentExerciseIdx + 1} de {activeWorkout.exercises.length}
                </div>
              </div>

              {/* Workout details - Factual and professional */}
              <div className="workout-details-box">
                <span className="workout-machine-tag">
                  {currentExercise.machine}
                </span>
                
                {/* Dynamically Faded Exercise Name/Variation Cycling */}
                <h3 className={`workout-exercise-name ${fade ? 'fade-in' : 'fade-out'}`}>
                  {currentExercise.variations && currentExercise.variations.length > 0
                    ? currentExercise.variations[variationIdx]
                    : currentExercise.name}
                </h3>

                <div className="workout-specs-grid">
                  {/* Series Card with Inline +/- controls */}
                  <div className="spec-card editable">
                    <span className="spec-label">Séries</span>
                    <div className="spec-controls">
                      <button 
                        className="control-btn minus" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const newSets = Math.max(1, editedSets - 1);
                          setEditedSets(newSets);
                          persistCustomExerciseSpecs(newSets, editedReps, editedLoad);
                        }}
                        type="button"
                      >
                        -
                      </button>
                      <span className="spec-value">{editedSets}</span>
                      <button 
                        className="control-btn plus" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const newSets = editedSets + 1;
                          setEditedSets(newSets);
                          persistCustomExerciseSpecs(newSets, editedReps, editedLoad);
                        }}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Reps Card with Text Input */}
                  <div className="spec-card editable">
                    <span className="spec-label">Repetições</span>
                    <div className="spec-controls-input">
                      <input 
                        type="text" 
                        className="spec-value-input" 
                        value={editedReps} 
                        onChange={(e) => setEditedReps(e.target.value)} 
                        onBlur={(e) => persistCustomExerciseSpecs(editedSets, e.target.value, editedLoad)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Ex: 10-12"
                      />
                    </div>
                  </div>

                  {/* Carga Card with text input AND +/- 2kg controls */}
                  <div className="spec-card highlight editable">
                    <span className="spec-label">Carga Indicada</span>
                    <div className="spec-controls">
                      <button 
                        className="control-btn minus" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const num = parseFloat(editedLoad) || 0;
                          const unit = editedLoad.includes('kg') ? ' kg' : editedLoad.includes('s') ? ' s' : ' kg';
                          const newLoad = `${Math.max(0, num - 2)}${unit}`;
                          setEditedLoad(newLoad);
                          persistCustomExerciseSpecs(editedSets, editedReps, newLoad);
                        }}
                        type="button"
                      >
                        -
                      </button>
                      <input 
                        type="text" 
                        className="spec-value-input highlight" 
                        value={editedLoad} 
                        onChange={(e) => setEditedLoad(e.target.value)} 
                        onBlur={(e) => persistCustomExerciseSpecs(editedSets, editedReps, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="96 kg"
                      />
                      <button 
                        className="control-btn plus" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const num = parseFloat(editedLoad) || 0;
                          const unit = editedLoad.includes('kg') ? ' kg' : editedLoad.includes('s') ? ' s' : ' kg';
                          const newLoad = `${num + 2}${unit}`;
                          setEditedLoad(newLoad);
                          persistCustomExerciseSpecs(editedSets, editedReps, newLoad);
                        }}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {currentExercise.variations && (
                  <div className="workout-tip glass-panel" style={{ borderColor: 'rgba(225,255,0,0.3)', background: 'rgba(225,255,0,0.02)' }}>
                    <Sparkles size={16} color="var(--accent-primary)" />
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {currentExercise.name.includes('Pernas') || currentExercise.name.includes('Halter')
                        ? 'Este vídeo contém 3 exercícios integrados de pernas (Sumô, Stiff e Levantamento Terra). Faça todas as séries de cada movimento!'
                        : 'Este vídeo contém 3 pegadas integradas. Faça todas para um treino de bíceps completo!'}
                    </p>
                  </div>
                )}

                <div className="workout-tip glass-panel">
                  <TrendingUp size={16} color="var(--accent-primary)" />
                  <p>Carga calculada de forma segura e proporcional de acordo com seu peso corporal.</p>
                </div>
              </div>

              <button className="primary-btn next-exercise-btn" onClick={handleNextExercise}>
                {currentExerciseIdx < activeWorkout.exercises.length - 1 ? (
                  <>
                    PRÓXIMO EXERCÍCIO <ChevronRight size={20} />
                  </>
                ) : (
                  <>
                    CONCLUIR TREINO <CheckCircle size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Video Reference Modal */}
      {showVideoModal && activeWorkout && currentExercise && currentExercise.video && (
        <div className="fullscreen-video-modal" onClick={() => setShowVideoModal(false)}>
          <div className="fullscreen-video-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-fullscreen-btn" onClick={() => setShowVideoModal(false)} type="button">
              <X size={24} color="#fff" />
            </button>
            <video 
              src={currentExercise.video} 
              autoPlay 
              loop 
              controls 
              playsInline
              className="fullscreen-video-element"
            />
            <div className="fullscreen-video-title">
              <span className="fullscreen-video-machine">{currentExercise.machine}</span>
              <h3>{currentExercise.name}</h3>
              <p>Toque no X ou fora da tela para fechar e voltar</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} />
          <span className="nav-label">Início</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          <Compass size={24} />
          <span className="nav-label">Criar Plano</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          <Dumbbell size={24} />
          <span className="nav-label">Treinos</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <BarChart2 size={24} />
          <span className="nav-label">Corpo</span>
        </button>
      </nav>

      {/* Gamified Celebration Overlay Modal */}
      {showCelebration && (
        <div className="celebration-overlay" onClick={() => setShowCelebration(false)}>
          <div className="celebration-card glass-panel anim-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="celebration-glow"></div>
            
            <div className="sparkles-container">
              <Sparkles size={48} color="var(--accent-primary)" className="sparkle-icon anim-pulse" />
            </div>

            <div className="success-icon-ring" style={{ width: '80px', height: '80px', background: 'rgba(225,255,0,0.15)', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(225,255,0,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              <CheckCircle size={40} color="var(--accent-primary)" />
            </div>

            <h2 className="celebration-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>Treino Concluído! 🎉</h2>
            <p className="celebration-subtitle" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>Você está cada dia mais forte e consistente.</p>

            <div className="rewards-grid" style={{ display: 'flex', gap: '1rem', width: '100%', marginBottom: '1.5rem' }}>
              <div className="reward-item glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <span className="reward-icon" style={{ fontSize: '1.5rem' }}>⚡</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="reward-value" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-primary)' }}>+100 XP</span>
                  <span className="reward-label" style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Bônus Diário</span>
                </div>
              </div>

              <div className="reward-item glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <span className="reward-icon" style={{ fontSize: '1.5rem', color: '#ff9500' }}>🔥</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="reward-value" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{celebrationStreak} Dias</span>
                  <span className="reward-label" style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Ofensiva Ativa</span>
                </div>
              </div>
            </div>

            <div className="habit-message-box glass-panel" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'rgba(225,255,0,0.02)', border: '1px solid rgba(225,255,0,0.1)', marginBottom: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>🌱 "A constância supera a intensidade. Você garantiu mais um dia de evolução!"</p>
            </div>

            <button 
              className="primary-btn celebration-btn" 
              onClick={() => setShowCelebration(false)}
              style={{ width: '100%', padding: '1.25rem', margin: 0 }}
              type="button"
            >
              FECHAR E CONTINUAR
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Canceling Active Workout */}
      {showCancelConfirm && (
        <div className="celebration-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="celebration-card glass-panel anim-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px', padding: '2rem 1.5rem' }}>
            <div className="success-icon-ring" style={{ width: '64px', height: '64px', background: 'rgba(255, 59, 48, 0.15)', marginBottom: '1.25rem', boxShadow: '0 0 20px rgba(255, 59, 48, 0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              <X size={32} color="#ff3b30" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>Cancelar Treino?</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', textAlign: 'center', lineHeight: 1.4 }}>
              Seu progresso atual deste treino será perdido. Tem certeza de que deseja parar agora?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <button 
                className="primary-btn" 
                onClick={() => setShowCancelConfirm(false)}
                style={{ width: '100%', padding: '1rem', margin: 0 }}
                type="button"
              >
                CONTINUAR TREINANDO
              </button>
              <button 
                className="primary-btn" 
                onClick={() => {
                  setShowCancelConfirm(false);
                  setActiveWorkout(null);
                }}
                style={{ width: '100%', padding: '1rem', margin: 0, background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.2)' }}
                type="button"
              >
                SIM, PARAR TREINO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
