import { useState, useEffect } from 'react';
import { Bookmark, Play, Search, Grid, List as ListIcon } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db, auth } from './firebase';
import './Exercises.css';

interface ExercisesProps {
  onStartExercise: (exercise: any) => void;
}

export default function Exercises({ onStartExercise }: ExercisesProps) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [userWeight, setUserWeight] = useState<number>(80);

  // Fetch real weight from Firebase to calculate dynamic professional suggested load
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const weightRef = ref(db, `users/${user.uid}/weight`);
        const unsubscribeWeight = onValue(weightRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserWeight(data);
          }
        });
        return () => unsubscribeWeight();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // List of high-quality real video exercises!
  const targetExercises = [
    {
      id: 1,
      title: 'Agachamento no Hack',
      target: 'Quadríceps • Pernas',
      machine: 'Máquina Hack',
      video: '/TREINO PERNA - 01.mp4',
      sets: 4,
      reps: '10-12',
      load: `${Math.round(userWeight * 1.2)} kg`
    },
    {
      id: 2,
      title: 'Cadeira Extensora',
      target: 'Quadríceps • Pernas',
      machine: 'Aparelho Extensor',
      video: '/treino perna - 02.mp4',
      sets: 4,
      reps: '10-12',
      load: `${Math.round(userWeight * 0.6)} kg`
    },
    {
      id: 3,
      title: 'Rosca na Barra W (3 Pegadas)',
      target: 'Bíceps • Antebraço',
      machine: 'Barra W (EZ-Bar)',
      video: '/treino 03.mp4',
      sets: 3,
      reps: '10 rep. por pegada',
      load: `${Math.round(userWeight * 0.25)} kg`,
      variations: [
        'Rosca Direta na Barra W (Pegada Fechada)',
        'Rosca Direta na Barra W (Pegada Neutra)',
        'Rosca Inversa na Barra W (Pegada Pronada/Invertida)'
      ]
    },
    {
      id: 4,
      title: 'Remada Sentada no Triângulo',
      target: 'Costas • Dorsais',
      machine: 'Aparelho de Remada Baixa',
      video: '/treino 04.mp4',
      sets: 4,
      reps: '10-12',
      load: `${Math.round(userWeight * 0.5)} kg`
    },
    {
      id: 5,
      title: 'Puxada Aberta no Pulley',
      target: 'Costas • Dorsais',
      machine: 'Máquina Pulley',
      video: '/treino 06.mp4',
      sets: 4,
      reps: '10-12',
      load: `${Math.round(userWeight * 0.6)} kg`
    },
    {
      id: 6,
      title: 'Rosca Punho com Barra',
      target: 'Antebraço • Braços',
      machine: 'Barra Livre',
      video: '/treino 07.mp4',
      sets: 3,
      reps: '12-15',
      load: `${Math.round(userWeight * 0.15)} kg`
    },
    {
      id: 7,
      title: 'Combo de Pernas com Halter (3 Exercícios)',
      target: 'Quadríceps • Posterior • Glúteos',
      machine: 'Halteres',
      video: '/treino 08.mp4',
      sets: 4,
      reps: '10-12 reps por exercício',
      load: `${Math.round(userWeight * 0.4)} kg`,
      variations: [
        'Agachamento Sumô com Halter',
        'Stiff com Halter (RDL)',
        'Levantamento Terra Sumô com Halter'
      ]
    }
  ];

  const FILTERS = ['Todos', 'Pernas', 'Bíceps', 'Costas'];

  const filteredExercises = targetExercises.filter(ex => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Pernas') return ex.target.includes('Pernas') || ex.target.includes('Posterior') || ex.target.includes('Glúteos');
    if (activeFilter === 'Bíceps') return ex.target.includes('Bíceps') || ex.target.includes('Antebraço');
    if (activeFilter === 'Costas') return ex.target.includes('Costas');
    return true;
  });

  return (
    <div className="exercises-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div className="tab-switcher" style={{ margin: 0 }}>
          <h2 className="active">Biblioteca</h2>
          <h2>Planos</h2>
        </div>
        <button style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '50%' }}>
          <Search size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="filter-scroll">
        <button className="filter-pill" style={{ padding: '0.6rem' }}>
          <Bookmark size={18} />
        </button>
        {FILTERS.map(f => (
          <button 
            key={f} 
            className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Title & View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Todos os Exercícios</h3>
        <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <button style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '50%', color: 'inherit' }}>
            <ListIcon size={16} />
          </button>
          <button style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '50%', color: 'inherit' }}>
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Grid containing the real dynamic exercises */}
      <div className="exercise-grid">
        {filteredExercises.map(ex => (
          <div 
            key={ex.id}
            className="exercise-card" 
            onClick={() => onStartExercise(ex)}
            style={{ cursor: 'pointer' }}
          >
            {/* Real HTML Video playing as background preview */}
            <video 
              className="exercise-video-thumbnail" 
              src={ex.video}
              muted
              loop
              playsInline
              autoPlay
            />
            <div className="bookmark-icon">
              <Bookmark size={14} />
            </div>
            <div className="play-icon-overlay">
              <Play size={16} fill="var(--accent-primary)" />
            </div>
            <div className="exercise-overlay">
              <span className="exercise-target">{ex.target}</span>
              <h4 className="exercise-title">{ex.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
