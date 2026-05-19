import { useState, useEffect } from 'react';
import { Heart, Flame, Droplet, Scale, X, Activity, Ruler, Trophy, Zap, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { ref, onValue, set, get } from 'firebase/database';
import { db, auth } from './firebase';
import './Progress.css';

export default function Progress() {
  const [weight, setWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [water, setWater] = useState<number>(0);
  const [caloriesEaten, setCaloriesEaten] = useState<number>(0);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [gender, setGender] = useState<string>('male');
  const [activity, setActivity] = useState<string>('moderate');
  const [waist, setWaist] = useState<number | null>(null);
  const [arm, setArm] = useState<number | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<any[]>([]);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [userXp, setUserXp] = useState<number>(0);
  const [waterGoal, setWaterGoal] = useState<number>(3000);
  const [calorieGoal, setCalorieGoal] = useState<number>(2500);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => setCurrentUser(user));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const userRef = ref(db, `users/${currentUser.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWeight(data.weight !== undefined ? data.weight : null);
        setHeight(data.height !== undefined ? data.height : null);
        setWater(data.water || 0);
        setCaloriesEaten(data.caloriesEaten || 0);
        setCaloriesBurned(data.caloriesBurned || 0);
        setWaterGoal(data.waterGoal || 3000);
        setCalorieGoal(data.calorieGoal || 2500);
        setGender(data.gender || 'male');
        setActivity(data.activity || 'moderate');
        setWaist(data.waist !== undefined ? data.waist : null);
        setArm(data.arm !== undefined ? data.arm : null);
        setCompletedWorkouts(data.completedWorkouts || []);
        setWeightHistory(data.weightHistory || []);
        setStreak(data.streak || 0);
        setUserXp(data.xp || 0);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleSaveData = async () => {
    if (!inputValue || !currentUser) return;
    const userRef = ref(db, `users/${currentUser.uid}`);
    const snapshot = await get(userRef);
    const data = snapshot.val() || {};
    let updates: any = { ...data };

    if (activeModal === 'weight') {
      const newWeight = parseFloat(inputValue);
      updates.weight = newWeight;
      const today = new Date().toISOString().split('T')[0];
      const history = (data.weightHistory || []).filter((h: any) => h.date !== today);
      history.push({ date: today, value: newWeight });
      updates.weightHistory = history;
    } else if (activeModal === 'water') {
      updates.water = (updates.water || 0) + parseInt(inputValue, 10);
    } else if (activeModal === 'meal') {
      updates.caloriesEaten = (updates.caloriesEaten || 0) + parseInt(inputValue, 10);
    } else if (activeModal === 'exercise') {
      updates.caloriesBurned = (updates.caloriesBurned || 0) + parseInt(inputValue, 10);
    } else if (activeModal === 'waist') {
      updates.waist = parseFloat(inputValue);
    } else if (activeModal === 'arm') {
      updates.arm = parseFloat(inputValue);
    }

    set(userRef, updates).then(() => { setActiveModal(null); setInputValue(''); });
  };

  const openModal = (type: string) => { setActiveModal(type); setInputValue(''); };

  // Derived data
  const remainingKcal = Math.max(0, calorieGoal - caloriesEaten + caloriesBurned);
  const caloriePercent = Math.min(100, (caloriesEaten / calorieGoal) * 100);
  const waterPercent = Math.min(100, Math.round((water / waterGoal) * 100)) || 0;
  const userHeightMeters = height ? height / 100 : 1.75;
  const bmi = weight ? (weight / (userHeightMeters * userHeightMeters)).toFixed(1) : '--';

  // Weekly workouts
  const getThisWeekWorkouts = () => {
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() + (dow === 0 ? -6 : 1 - dow));
    monday.setHours(0, 0, 0, 0);
    return completedWorkouts.filter(w => new Date(w.date + 'T00:00:00') >= monday);
  };

  // Monthly workouts
  const getThisMonthWorkouts = () => {
    const now = new Date();
    return completedWorkouts.filter(w => {
      const d = new Date(w.date + 'T00:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  };

  const weekWorkouts = getThisWeekWorkouts();
  const monthWorkouts = getThisMonthWorkouts();
  const weekGoal = activity === 'sedentary' ? 2 : activity === 'moderate' ? 3 : 4;
  const weekPercent = Math.min(100, (weekWorkouts.length / weekGoal) * 100);
  const monthXp = monthWorkouts.length * 100;

  // Weight trend
  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null;
    const sorted = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0].value;
    const last = sorted[sorted.length - 1].value;
    const diff = parseFloat((last - first).toFixed(1));
    return { diff: Math.abs(diff), isLoss: diff < 0, isGain: diff > 0, isStable: diff === 0 };
  };
  const weightTrend = getWeightTrend();

  const level = Math.floor(userXp / 300) + 1;

  return (
    <div className="toolbox-container">

      {/* ===== EVOLUÇÃO SECTION ===== */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
          Sua Evolução 🚀
        </h2>

        {/* Top 3 stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem', marginBottom: '1rem' }}>
          <div className="evo-stat-card">
            <Flame size={18} color="#ff6b35" fill="#ff6b35" />
            <div className="evo-stat-value" style={{ color: '#ff6b35' }}>{streak}</div>
            <div className="evo-stat-label">Dias de Fogo</div>
          </div>
          <div className="evo-stat-card">
            <Trophy size={18} color="var(--accent-primary)" />
            <div className="evo-stat-value">{monthWorkouts.length}</div>
            <div className="evo-stat-label">Treinos/Mês</div>
          </div>
          <div className="evo-stat-card">
            <Zap size={18} color="#bf5af2" />
            <div className="evo-stat-value" style={{ color: '#bf5af2' }}>{monthXp}</div>
            <div className="evo-stat-label">XP no Mês</div>
          </div>
        </div>

        {/* Weekly progress */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '20px', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>Semana Atual</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: weekWorkouts.length >= weekGoal ? '#30d158' : 'var(--accent-primary)' }}>
              {weekWorkouts.length}/{weekGoal} treinos
            </span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${weekPercent}%`,
              background: weekWorkouts.length >= weekGoal
                ? 'linear-gradient(90deg, #30d158, #34c759)'
                : 'linear-gradient(90deg, var(--accent-primary), #c8ff00)',
              borderRadius: '100px',
              transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: weekWorkouts.length >= weekGoal ? '0 0 12px rgba(48,209,88,0.5)' : '0 0 12px rgba(225,255,0,0.4)'
            }} />
          </div>
          {weekWorkouts.length >= weekGoal && (
            <p style={{ fontSize: '0.75rem', color: '#30d158', fontWeight: 700, marginTop: '0.5rem', textAlign: 'center' }}>
              🎉 Meta da semana alcançada! Você é consistente!
            </p>
          )}
          {weekWorkouts.length > 0 && weekWorkouts.length < weekGoal && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Faltam <strong style={{ color: 'var(--accent-primary)' }}>{weekGoal - weekWorkouts.length} treino{weekGoal - weekWorkouts.length > 1 ? 's' : ''}</strong> para bater a meta desta semana!
            </p>
          )}
          {weekWorkouts.length === 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Nenhum treino esta semana ainda — vamos começar? 💪
            </p>
          )}
        </div>

        {/* Level + XP bar */}
        <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(225,255,0,0.12)', border: '1px solid rgba(225,255,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent-primary)' }}>N{level}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              <span>NÍVEL {level}</span>
              <span>{userXp % 300}/300 XP</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((userXp % 300) / 300) * 100}%`, background: 'var(--accent-primary)', borderRadius: '100px', boxShadow: '0 0 8px var(--accent-primary)', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== WIDGETS GRID ===== */}
      <div className="widgets-grid">
        {/* Activity */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <Heart size={16} color="#ff3b30" fill="#ff3b30" />
              <span>Atividade</span>
            </div>
            <div className="widget-value">
              <Flame size={12} color="var(--text-secondary)" />
              <span style={{color: 'var(--text-secondary)'}}>{caloriesBurned} cal</span>
            </div>
          </div>
          <div className="widget-body">
            <div className="activity-rings">
              <div className="ring ring-outer"></div>
              <div className="ring ring-middle"></div>
              <div className="ring ring-inner"></div>
            </div>
            <button className="widget-btn" onClick={() => openModal('exercise')}>Adicionar Exercício</button>
          </div>
        </div>

        {/* Calorie Tracker */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <Flame size={16} color="#ff9500" fill="#ff9500" />
              <span>Calorias</span>
            </div>
            <div className="widget-value">
              <span style={{color: 'var(--text-secondary)'}}>{caloriePercent.toFixed(0)}%</span>
            </div>
          </div>
          <div className="widget-body calorie-body">
            <div className="calorie-stats">
              <div className="stat-col">
                <span className="stat-label">+ INGERIDO</span>
                <span className="stat-number">{caloriesEaten}</span>
              </div>
              <div className="stat-col">
                <span className="stat-label">QUEIMADO</span>
                <span className="stat-number">{caloriesBurned}</span>
              </div>
            </div>
            <button className="widget-btn" onClick={() => openModal('meal')}>Registrar Refeição</button>
          </div>
          <div className="calorie-progress-container">
            <div className="calorie-progress-bar" style={{ background: `linear-gradient(90deg, #ffcc00 0%, #ff3b30 ${caloriePercent}%, rgba(255,255,255,0.1) ${caloriePercent}%)` }}></div>
            <span className="calorie-remaining">Restam {remainingKcal} kcal</span>
          </div>
        </div>

        {/* Water */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <Droplet size={16} color="#0a84ff" fill="#0a84ff" />
              <span>Água</span>
            </div>
            <div className="widget-value">
              <Droplet size={12} color="var(--text-secondary)" />
              <span style={{color: 'var(--text-secondary)'}}>{water}/{waterGoal}ml</span>
            </div>
          </div>
          <div className="widget-body">
            <div className="water-ring">
              <span className="water-percent">{waterPercent}%</span>
            </div>
            <button className="widget-btn" onClick={() => openModal('water')}>Registrar Água</button>
          </div>
        </div>

        {/* Weight with trend */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <Scale size={16} color="var(--text-secondary)" />
              <span>Peso</span>
            </div>
          </div>
          <div className="widget-body weight-body">
            <div>
              <div className="weight-value">{weight !== null ? weight.toFixed(1) : '--'} kg</div>
              <span className="weight-label">IMC: {bmi}</span>
              {weightTrend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
                  {weightTrend.isLoss && <TrendingDown size={14} color="#30d158" />}
                  {weightTrend.isGain && <TrendingUp size={14} color="#ff6b35" />}
                  {weightTrend.isStable && <Minus size={14} color="var(--text-secondary)" />}
                  <span style={{ fontSize: '0.6875rem', color: weightTrend.isLoss ? '#30d158' : weightTrend.isGain ? '#ff6b35' : 'var(--text-secondary)', fontWeight: 700 }}>
                    {weightTrend.isLoss ? `-${weightTrend.diff} kg` : weightTrend.isGain ? `+${weightTrend.diff} kg` : 'Estável'} desde o início
                  </span>
                </div>
              )}
            </div>
            <button className="widget-btn" onClick={() => openModal('weight')}>Atualizar Peso</button>
          </div>
          <div className="weight-scale">
            <div className="scale-gradient"></div>
            <div className="scale-pointer"></div>
          </div>
        </div>

        {/* Measurements */}
        <div className="widget-card" style={{ gridColumn: 'span 2' }}>
          <div className="widget-header">
            <div className="widget-title">
              <Ruler size={16} color="var(--accent-primary)" />
              <span>Medidas & Biometria</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
            <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Cintura (cm)</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{waist !== null ? `${waist} cm` : '--'}</span>
              <button className="widget-btn" style={{ padding: '0.25rem', fontSize: '0.6875rem', marginTop: '0.25rem' }} onClick={() => openModal('waist')}>Atualizar</button>
            </div>
            <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Braço (cm)</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{arm !== null ? `${arm} cm` : '--'}</span>
              <button className="widget-btn" style={{ padding: '0.25rem', fontSize: '0.6875rem', marginTop: '0.25rem' }} onClick={() => openModal('arm')}>Atualizar</button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
            <span>Sexo: {gender === 'male' ? 'Masculino' : 'Feminino'}</span>
            <span>Atividade: {activity === 'sedentary' ? 'Baixa' : activity === 'moderate' ? 'Moderada' : 'Alta'}</span>
          </div>
        </div>
      </div>

      {/* ===== HISTÓRICO DE TREINOS ===== */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-primary)" />
            Histórico de Treinos
          </h3>
          {completedWorkouts.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {completedWorkouts.length} total
            </span>
          )}
        </div>

        {completedWorkouts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🏋️‍♂️</span>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Nenhum treino concluído ainda. Complete um treino para ver seu histórico aqui!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[...completedWorkouts].reverse().map((w, idx) => {
              const isExpanded = expandedWorkout === idx;
              return (
                <div key={idx} className="glass-panel" style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  {/* Header row — always visible */}
                  <button
                    type="button"
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: 'transparent', textAlign: 'left', gap: '0.75rem' }}
                    onClick={() => setExpandedWorkout(isExpanded ? null : idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(225,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Flame size={18} color="var(--accent-primary)" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.title}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                          {w.exercisesCount} exercícios · {w.duration} min · {w.date}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent-primary)' }}>+{w.xpEarned} XP</div>
                        <div style={{ fontSize: '0.625rem', color: '#ff9500', fontWeight: 700 }}>CONCLUÍDO ✔</div>
                      </div>
                      {w.exercises && w.exercises.length > 0 && (
                        isExpanded ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />
                      )}
                    </div>
                  </button>

                  {/* Expanded exercises */}
                  {isExpanded && w.exercises && w.exercises.length > 0 && (
                    <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', margin: '0.75rem 0 0.5rem' }}>EXERCÍCIOS REALIZADOS</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {w.exercises.map((ex: any, ei: number) => (
                          <div key={ei} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                            <div>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{ex.name}</div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{ex.machine}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{ex.sets}×{ex.reps}</div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{ex.load}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {activeModal === 'weight' && 'Registrar Peso (kg)'}
                {activeModal === 'water' && 'Registrar Água (ml)'}
                {activeModal === 'meal' && 'Calorias da Refeição (kcal)'}
                {activeModal === 'exercise' && 'Registrar Gasto Calórico (kcal)'}
                {activeModal === 'waist' && 'Circunferência da Cintura (cm)'}
                {activeModal === 'arm' && 'Circunferência do Braço (cm)'}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            <input
              type="number"
              className="weight-input"
              placeholder={activeModal === 'weight' ? 'ex: 80.5' : activeModal === 'water' ? 'ex: 350' : activeModal === 'meal' ? 'ex: 450' : activeModal === 'exercise' ? 'ex: 300' : 'ex: 85'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
            <button className="primary-btn" style={{ width: '100%' }} onClick={handleSaveData}>
              SALVAR PROGRESSO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
