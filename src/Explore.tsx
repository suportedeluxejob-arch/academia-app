import { useState } from 'react';
import { CheckCircle, ChevronRight, Scale, Activity, Droplet, Sparkles } from 'lucide-react';
import { ref, set, get } from 'firebase/database';
import { db, auth } from './firebase';
import './Explore.css';

function MuscleSilhouetteSVG({ muscleId, isSelected }: { muscleId: string; isSelected: boolean }) {
  const highlightColor = isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)';
  const bodyStroke = 'rgba(255, 255, 255, 0.25)';
  const bodyFill = 'rgba(255, 255, 255, 0.05)';
  const muscleGlow = isSelected ? 'drop-shadow(0 0 6px var(--accent-primary))' : 'none';

  // Front View SVG Base Body Outline
  const renderFrontBody = (musclePath: React.ReactNode) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* Head */}
      <circle cx="50" cy="12" r="7" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      {/* Neck */}
      <path d="M 46 19 L 46 23 L 54 23 L 54 19 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />
      {/* Torso & Arms Outline */}
      <path d="M 50 23 C 38 23, 29 27, 24 35 C 20 42, 17 58, 19 72 C 21 74, 25 72, 27 68 C 28 59, 32 44, 34 41 C 35 44, 37 72, 39 82 L 61 82 C 63 72, 65 44, 66 41 C 68 44, 72 59, 73 68 C 75 72, 79 74, 81 72 C 83 58, 80 42, 76 35 C 71 27, 62 23, 50 23 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      {/* Target Muscle Highlight */}
      <g style={{ filter: muscleGlow }}>
        {musclePath}
      </g>
    </svg>
  );

  // Back View SVG Base Body Outline
  const renderBackBody = (musclePath: React.ReactNode) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* Head */}
      <circle cx="50" cy="12" r="7" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      {/* Neck */}
      <path d="M 46 19 L 46 23 L 54 23 L 54 19 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />
      {/* Back Torso & Arms Outline */}
      <path d="M 50 23 C 38 23, 29 27, 24 35 C 20 42, 17 58, 19 72 C 21 74, 25 72, 27 68 C 28 59, 32 44, 34 41 C 35 44, 37 72, 39 82 L 61 82 C 63 72, 65 44, 66 41 C 68 44, 72 59, 73 68 C 75 72, 79 74, 81 72 C 83 58, 80 42, 76 35 C 71 27, 62 23, 50 23 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      {/* Spine Line */}
      <line x1="50" y1="23" x2="50" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,2" />
      {/* Target Muscle Highlight */}
      <g style={{ filter: muscleGlow }}>
        {musclePath}
      </g>
    </svg>
  );

  // Lower Body Front Base Outline (Quads)
  const renderLegsFrontBody = (musclePath: React.ReactNode) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* Hips & Pelvis */}
      <path d="M 32 15 L 68 15 L 60 40 L 40 40 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      {/* Upper Legs & Knees */}
      <path d="M 40 40 C 37 52, 35 68, 38 80 C 41 80, 45 78, 48 72 L 48 40 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      <path d="M 60 40 C 63 52, 65 68, 62 80 C 59 80, 55 78, 52 72 L 52 40 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      {/* Target Muscle Highlight */}
      <g style={{ filter: muscleGlow }}>
        {musclePath}
      </g>
    </svg>
  );

  // Lower Body Back Base Outline (Hamstrings, Glutes, Calves)
  const renderLegsBackBody = (musclePath: React.ReactNode) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* Pelvis & Buttocks base */}
      <path d="M 32 15 L 68 15 L 60 42 L 40 42 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      {/* Thighs back base */}
      <path d="M 40 42 C 37 54, 35 70, 38 82 C 41 82, 45 80, 48 74 L 48 42 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      <path d="M 60 42 C 63 54, 65 70, 62 82 C 59 82, 55 80, 52 74 L 52 42 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      {/* Target Muscle Highlight */}
      <g style={{ filter: muscleGlow }}>
        {musclePath}
      </g>
    </svg>
  );

  switch (muscleId) {
    case 'chest':
      return renderFrontBody(
        <>
          <path d="M 50 43 C 43 43, 35 41, 34 33 C 35 30, 42 29, 50 29 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M 50 43 C 57 43, 65 41, 66 33 C 65 30, 58 29, 50 29 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </>
      );
    case 'abs':
      return renderFrontBody(
        <g fill={highlightColor} stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.8">
          <rect x="42" y="46" width="7" height="6" rx="1.5" />
          <rect x="51" y="46" width="7" height="6" rx="1.5" />
          <rect x="42" y="54" width="7" height="6" rx="1.5" />
          <rect x="51" y="54" width="7" height="6" rx="1.5" />
          <rect x="43" y="62" width="6" height="6" rx="1.5" />
          <rect x="51" y="62" width="6" height="6" rx="1.5" />
        </g>
      );
    case 'back':
      return renderBackBody(
        <>
          {/* Lats (Costas) */}
          <path d="M 50 26 C 44 26, 35 30, 32 41 C 35 45, 41 50, 50 50 C 59 50, 65 45, 68 41 C 65 30, 56 26, 50 26 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          {/* Traps */}
          <path d="M 50 23 L 45 32 L 55 32 Z" fill={highlightColor} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
        </>
      );
    case 'biceps':
      return renderFrontBody(
        <>
          <path d="M 23 37 C 22 43, 24 49, 27 47 C 28 43, 26 37, 25 35 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 77 37 C 78 43, 76 49, 73 47 C 72 43, 74 37, 75 35 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        </>
      );
    case 'triceps':
      return renderBackBody(
        <>
          <path d="M 20 39 C 19 43, 20 53, 22 53 C 23 45, 23 39, 21 37 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 80 39 C 81 43, 80 53, 78 53 C 77 45, 77 39, 79 37 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        </>
      );
    case 'shoulders':
      return renderFrontBody(
        <>
          <path d="M 27 25 C 23 28, 20 33, 21 38 C 24 38, 27 33, 29 28 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 73 25 C 77 28, 80 33, 79 38 C 76 38, 73 33, 71 28 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        </>
      );
    case 'quads':
      return renderLegsFrontBody(
        <>
          <path d="M 40 42 C 39 50, 38 63, 41 67 C 43 65, 46 55, 46 42 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 60 42 C 61 50, 62 63, 59 67 C 57 65, 54 55, 54 42 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        </>
      );
    case 'hamstrings':
      return renderLegsBackBody(
        <>
          <path d="M 41 44 C 40 51, 42 62, 46 62 C 47 55, 47 44, 47 44 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 59 44 C 60 51, 58 62, 54 62 C 53 55, 53 44, 53 44 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        </>
      );
    case 'glutes':
      return renderLegsBackBody(
        <>
          <circle cx="43" cy="29" r="6" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <circle cx="57" cy="29" r="6" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        </>
      );
    case 'calves':
      return renderLegsBackBody(
        <>
          <path d="M 40 68 C 38 72, 39 78, 43 78 C 43 72, 42 68, 41 68 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 60 68 C 62 72, 61 78, 57 78 C 57 72, 58 68, 59 68 Z" fill={highlightColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        </>
      );
    default:
      return null;
  }
}

const MUSCLE_GROUPS = [
  { id: 'quads', name: 'Quadríceps', icon: '🦵', exercises: 'Hack, Extensora, Combo Halter' },
  { id: 'hamstrings', name: 'Posterior', icon: '🍗', exercises: 'Combo Pernas (Stiff)' },
  { id: 'glutes', name: 'Glúteos', icon: '🍑', exercises: 'Combo Pernas (Sumô/Terra)' },
  { id: 'calves', name: 'Panturrilha', icon: '🏃', exercises: 'Gêmeos Sentado, em Pé' },
  { id: 'back', name: 'Costas', icon: '🦅', exercises: 'Remada Triângulo, Pulley' },
  { id: 'biceps', name: 'Bíceps', icon: '💪', exercises: 'Rosca Barra W, Rosca Punho' },
  { id: 'chest', name: 'Peito', icon: '🦍', exercises: 'Supino Conv., Crucifixo' },
  { id: 'shoulders', name: 'Ombros', icon: '🛡️', exercises: 'Shoulder Press, Elev. Lateral' },
  { id: 'triceps', name: 'Tríceps', icon: '⚡', exercises: 'Polia Corda, Testa Máquina' },
  { id: 'abs', name: 'Abdômen', icon: '🧘', exercises: 'Abdominal Polia, Elev. Pernas' }
];

// Database of exercises mapped to muscles
const EXERCISE_DATABASE: any = {
  abs: [
    { name: 'Abdominal na Polia Alta', machine: 'Polia Alta / Cross', loadFactor: 0.3 },
    { name: 'Elevação de Pernas Suspenso', machine: 'Barra Fixa / Paralela', loadFactor: 0 }
  ],
  back: [
    { name: 'Remada Sentada no Triângulo', machine: 'Aparelho de Remada Baixa', video: '/treino 04.mp4', loadFactor: 0.5 },
    { name: 'Puxada Aberta no Pulley', machine: 'Máquina Pulley', video: '/treino 06.mp4', loadFactor: 0.6 }
  ],
  biceps: [
    { 
      name: 'Rosca na Barra W (3 Pegadas)', 
      machine: 'Barra W (EZ-Bar)', 
      video: '/treino 03.mp4', 
      loadFactor: 0.25,
      variations: [
        'Rosca Direta na Barra W (Pegada Fechada)',
        'Rosca Direta na Barra W (Pegada Neutra)',
        'Rosca Inversa na Barra W (Pegada Pronada/Invertida)'
      ]
    },
    {
      name: 'Rosca Punho com Barra',
      machine: 'Barra Livre',
      video: '/treino 07.mp4',
      loadFactor: 0.15
    }
  ],
  calves: [
    { name: 'Gêmeos Sentado', machine: 'Aparelho de Sóleo', loadFactor: 0.4 },
    { name: 'Gêmeos em Pé', machine: 'Máquina Smith / Hack', loadFactor: 0.8 }
  ],
  chest: [
    { name: 'Supino Reto Convergente', machine: 'Máquina Supino Reto', loadFactor: 0.6 },
    { name: 'Crucifixo Máquina', machine: 'Peck Deck / Voador', loadFactor: 0.4 }
  ],
  glutes: [
    { 
      name: 'Combo de Pernas com Halter (3 Exercícios)', 
      machine: 'Halteres', 
      video: '/treino 08.mp4', 
      loadFactor: 0.4,
      variations: [
        'Agachamento Sumô com Halter',
        'Stiff com Halter (RDL)',
        'Levantamento Terra Sumô com Halter'
      ]
    }
  ],
  hamstrings: [
    { name: 'Cadeira Flexora', machine: 'Aparelho Flexor', loadFactor: 0.4 },
    { 
      name: 'Combo de Pernas com Halter (3 Exercícios)', 
      machine: 'Halteres', 
      video: '/treino 08.mp4', 
      loadFactor: 0.4,
      variations: [
        'Agachamento Sumô com Halter',
        'Stiff com Halter (RDL)',
        'Levantamento Terra Sumô com Halter'
      ]
    }
  ],
  quads: [
    // Connected to USER'S target leg videos 1 & 2!
    { name: 'Agachamento no Hack', machine: 'Máquina Hack', video: '/TREINO PERNA - 01.mp4', loadFactor: 1.2 },
    { name: 'Cadeira Extensora', machine: 'Aparelho Extensor', video: '/treino perna - 02.mp4', loadFactor: 0.6 },
    { 
      name: 'Combo de Pernas com Halter (3 Exercícios)', 
      machine: 'Halteres', 
      video: '/treino 08.mp4', 
      loadFactor: 0.4,
      variations: [
        'Agachamento Sumô com Halter',
        'Stiff com Halter (RDL)',
        'Levantamento Terra Sumô com Halter'
      ]
    }
  ],
  shoulders: [
    { name: 'Desenvolvimento Máquina', machine: 'Aparelho Shoulder Press', loadFactor: 0.3 },
    { name: 'Elevação Lateral na Polia', machine: 'Cross Over', loadFactor: 0.1 }
  ],
  triceps: [
    { name: 'Tríceps Polia Corda', machine: 'Cross Over / Polia', loadFactor: 0.2 },
    { name: 'Tríceps Testa na Máquina', machine: 'Polia Alta / Banco', loadFactor: 0.2 }
  ]
};

export default function Explore() {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(0);
  const [goal, setGoal] = useState('hypertrophy'); // hypertrophy | fat_loss | performance | wellness
  
  // Body Info States
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male'); // male, female
  const [activity, setActivity] = useState('moderate'); // sedentary, moderate, active
  const [waist, setWaist] = useState('85');
  const [arm, setArm] = useState('34');

  // Selected muscles
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(['quads', 'calves', 'back']);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Calculated Results
  const [waterGoal, setWaterGoal] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(0);
  const [bmi, setBmi] = useState<number>(0);
  const [bmiClass, setBmiClass] = useState<string>('');
  const [minWeight, setMinWeight] = useState<number>(0);
  const [maxWeight, setMaxWeight] = useState<number>(0);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<any[]>([]);

  const toggleMuscle = (id: string) => {
    setSelectedMuscles(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const calculateAndGeneratePlan = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (isNaN(w) || isNaN(h) || isNaN(a)) return;

    // 1. Water Calculation
    const calculatedWater = Math.round(w * 35);
    setWaterGoal(calculatedWater);

    // 2. BMI Calculation and classification
    const heightMeters = h / 100;
    const computedBmi = parseFloat((w / (heightMeters * heightMeters)).toFixed(1));
    setBmi(computedBmi);

    let classification = '';
    if (computedBmi < 18.5) classification = 'Abaixo do Peso';
    else if (computedBmi >= 18.5 && computedBmi < 25) classification = 'Peso Ideal (Saudável)';
    else if (computedBmi >= 25 && computedBmi < 30) classification = 'Sobrepeso';
    else classification = 'Obesidade';
    setBmiClass(classification);

    // 3. Recommended Ideal Weight Range
    setMinWeight(Math.round(18.5 * (heightMeters * heightMeters)));
    setMaxWeight(Math.round(24.9 * (heightMeters * heightMeters)));

    // 4. Calorie calculation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    let multiplier = 1.375;
    if (activity === 'sedentary') multiplier = 1.2;
    else if (activity === 'active') multiplier = 1.725;

    const calculatedCalories = Math.round(bmr * multiplier);
    setCalorieGoal(calculatedCalories);

    // 5. Sets/reps based on GOAL first, then adjusted by BMI
    let sets = 4;
    let reps = '10-12';
    if (goal === 'hypertrophy') { sets = 4; reps = '8-12'; }
    else if (goal === 'fat_loss') { sets = 4; reps = '12-15'; }
    else if (goal === 'performance') { sets = 5; reps = '5-8'; }
    else if (goal === 'wellness') { sets = 3; reps = '12-15'; }
    // BMI override for extremes
    if (computedBmi < 18.5) { sets = 3; reps = '8-10'; }

    // Split selected muscles into max 2 training sheets
    let workouts: any[] = [];
    const musclesToProcess = selectedMuscles.filter(id => EXERCISE_DATABASE[id]);

    if (musclesToProcess.length > 0) {
      const mid = Math.ceil(musclesToProcess.length / 2);
      const groupA = musclesToProcess.slice(0, mid);
      const groupB = musclesToProcess.slice(mid);

      const generateSheet = (group: string[], sheetLetter: string) => {
        let sheetExercises: any[] = [];
        group.forEach(muscleId => {
          const exercises = EXERCISE_DATABASE[muscleId] || [];
          exercises.forEach((ex: any) => {
            const calculatedLoad = ex.loadFactor > 0 ? Math.round(w * ex.loadFactor) : 0;
            // Prevent duplicate exercise generation in the same sheet
            if (sheetExercises.some(item => item.name === ex.name)) return;

            sheetExercises.push({
              name: ex.name,
              machine: ex.machine,
              video: ex.video || null,
              sets: sets,
              reps: reps,
              load: calculatedLoad > 0 ? `${calculatedLoad} kg` : 'Peso Corporal',
              variations: ex.variations || null
            });
          });
        });

        const muscleNames = group.map(id => MUSCLE_GROUPS.find(m => m.id === id)?.name);
        return {
          title: `Treino ${sheetLetter} - Foco ${muscleNames.join(' e ')}`,
          duration: 15 + (sheetExercises.length * 10),
          intensity: computedBmi >= 25 ? 'Moderada' : 'Alta',
          muscles: muscleNames,
          exercises: sheetExercises
        };
      };

      workouts.push(generateSheet(groupA, 'A'));
      if (groupB.length > 0) {
        workouts.push(generateSheet(groupB, 'B'));
      }
    } else {
      workouts.push({
        title: 'Treino A - Geral Fullbody',
        duration: 45,
        intensity: 'Média',
        muscles: ['Corpo Inteiro'],
        exercises: [
          { name: 'Agachamento no Hack', machine: 'Máquina Hack', video: '/TREINO PERNA - 01.mp4', sets: sets, reps: reps, load: `${Math.round(w * 0.8)} kg` },
          { name: 'Cadeira Extensora', machine: 'Aparelho Extensor', video: '/treino perna - 02.mp4', sets: sets, reps: reps, load: `${Math.round(w * 0.5)} kg` }
        ]
      });
    }

    setGeneratedWorkouts(workouts);
    setStep(3);
  };

  const handleActivatePlan = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);
    // Preserve existing progress (streak, XP, history, etc.)
    const snapshot = await get(userRef);
    const existing = snapshot.val() || {};
    await set(userRef, {
      ...existing,
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: parseInt(age),
      gender,
      activity,
      goal,
      waist: parseFloat(waist),
      arm: parseFloat(arm),
      waterGoal,
      calorieGoal,
      currentPlan: generatedWorkouts,
      // Reset only daily trackers, not progress
      water: 0,
      caloriesEaten: 0,
      caloriesBurned: 0,
    });
    setShowSuccessModal(true);
  };

  return (
    <div className="explore-container">
      {/* Top Header */}
      <div className="explore-header glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Plano Personalizado</h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {step === 1 ? (subStep === 0 ? 'Etapa 1 de 5' : `Etapa ${subStep + 1} de 5`) : step === 2 ? 'Etapa Foco' : 'Concluído'}
          </span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: step === 1 
                ? `${((subStep + 1) / 5) * 100}%`
                : step === 2 
                  ? '90%' 
                  : '100%',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          ></div>
        </div>
      </div>

      <div className="explore-content">
        
        {step === 1 && (
          <div className="step-container">
            
            {subStep === 0 && (
              <div className="substep-card anim-slide-in">
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎯</div>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.35rem' }}>Qual é o seu Objetivo?</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>Isso define toda a prescrição do seu plano — séries, cargas, intensidade e volume.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {[
                    { id: 'hypertrophy', icon: '💪', title: 'Hipertrofia', desc: 'Ganhar massa muscular e volume', color: '#ff6b35' },
                    { id: 'fat_loss',    icon: '🔥', title: 'Emagrecimento', desc: 'Queimar gordura e definir o corpo', color: '#ff9500' },
                    { id: 'performance', icon: '⚡', title: 'Performance', desc: 'Aumentar força e resistência atlética', color: '#bf5af2' },
                    { id: 'wellness',    icon: '🧘', title: 'Saúde & Bem-estar', desc: 'Manutenção saudável e qualidade de vida', color: '#30d158' },
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      className={`frequency-card ${goal === g.id ? 'selected' : ''}`}
                      onClick={() => setGoal(g.id)}
                      style={{ position: 'relative', overflow: 'hidden' }}
                    >
                      {goal === g.id && <div style={{ position: 'absolute', inset: 0, background: `${g.color}10`, borderRadius: 'inherit' }} />}
                      <span className="freq-icon">{g.icon}</span>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <span className="freq-title" style={{ color: goal === g.id ? g.color : undefined }}>{g.title}</span>
                        <span className="freq-subtitle">{g.desc}</span>
                      </div>
                      {goal === g.id && <CheckCircle size={18} color={g.color} />}
                    </button>
                  ))}
                </div>
                <button className="primary-btn continue-btn" style={{ marginTop: '2.5rem' }} onClick={() => setSubStep(1)}>
                  CONTINUAR <ChevronRight size={20} color="#000" />
                </button>
              </div>
            )}

            {subStep === 1 && (
              <div className="substep-card anim-slide-in">
                <div style={{ marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>Gênero & Idade</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Usado para calibrar a taxa metabólica basal de forma precisa.</p>
                </div>

                <div className="input-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ marginBottom: '0.75rem', display: 'block' }}>Sexo Biológico</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      className={`gender-card-btn ${gender === 'male' ? 'selected' : ''}`}
                      onClick={() => setGender('male')}
                      type="button"
                    >
                      <span className="gender-symbol" style={{ color: '#0a84ff' }}>♂</span>
                      <span className="gender-label">Masculino</span>
                    </button>
                    <button 
                      className={`gender-card-btn ${gender === 'female' ? 'selected' : ''}`}
                      onClick={() => setGender('female')}
                      type="button"
                    >
                      <span className="gender-symbol" style={{ color: '#ff375f' }}>♀</span>
                      <span className="gender-label">Feminino</span>
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label>Idade Atual</label>
                    <span className="slider-value-bubble">{age} Anos</span>
                  </div>
                  <input 
                    type="range" 
                    min="14" 
                    max="80"
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    className="slider-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    <span>14 anos</span>
                    <span>80 anos</span>
                  </div>
                </div>

                <button className="primary-btn continue-btn" style={{ marginTop: '2.5rem' }} onClick={() => setSubStep(2)}>
                  CONTINUAR
                  <ChevronRight size={20} color="#000" />
                </button>
              </div>
            )}

            {subStep === 2 && (
              <div className="substep-card anim-slide-in">
                <div style={{ marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>Peso & Altura</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Usado para calcular seu IMC e cargas personalizadas sugeridas.</p>
                </div>

                <div className="input-group" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label>Peso Corporal</label>
                    <span className="slider-value-bubble">{weight} kg</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="180"
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)} 
                    className="slider-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    <span>40 kg</span>
                    <span>180 kg</span>
                  </div>
                </div>

                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label>Altura Estatura</label>
                    <span className="slider-value-bubble">{height} cm</span>
                  </div>
                  <input 
                    type="range" 
                    min="130" 
                    max="220"
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)} 
                    className="slider-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    <span>130 cm</span>
                    <span>220 cm</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button className="widget-btn" style={{ flex: 1, padding: '1rem' }} onClick={() => setSubStep(1)}>
                    VOLTAR
                  </button>
                  <button className="primary-btn continue-btn" style={{ flex: 2, margin: 0 }} onClick={() => setSubStep(3)}>
                    CONTINUAR
                    <ChevronRight size={20} color="#000" />
                  </button>
                </div>
              </div>
            )}

            {subStep === 3 && (
              <div className="substep-card anim-slide-in">
                <div style={{ marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>Medidas Corporais</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Para avaliação precisa da composição corporal regional.</p>
                </div>

                <div className="input-group" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label>Circunferência da Cintura</label>
                    <span className="slider-value-bubble">{waist} cm</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="150"
                    value={waist} 
                    onChange={(e) => setWaist(e.target.value)} 
                    className="slider-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    <span>50 cm</span>
                    <span>150 cm</span>
                  </div>
                </div>

                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label>Circunferência do Braço</label>
                    <span className="slider-value-bubble">{arm} cm</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="60"
                    value={arm} 
                    onChange={(e) => setArm(e.target.value)} 
                    className="slider-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    <span>20 cm</span>
                    <span>60 cm</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button className="widget-btn" style={{ flex: 1, padding: '1rem' }} onClick={() => setSubStep(2)}>
                    VOLTAR
                  </button>
                  <button className="primary-btn continue-btn" style={{ flex: 2, margin: 0 }} onClick={() => setSubStep(4)}>
                    CONTINUAR
                    <ChevronRight size={20} color="#000" />
                  </button>
                </div>
              </div>
            )}

            {subStep === 4 && (
              <div className="substep-card anim-slide-in">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>Frequência Semanal</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Quantos dias por semana você vai assumir o compromisso de treinar?</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button 
                    type="button"
                    className={`frequency-card ${activity === 'sedentary' ? 'selected' : ''}`}
                    onClick={() => setActivity('sedentary')}
                  >
                    <span className="freq-icon">🌱</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <span className="freq-title">Iniciante / Ocasional</span>
                      <span className="freq-subtitle">1 a 2 dias por semana • Adaptação muscular</span>
                    </div>
                  </button>

                  <button 
                    type="button"
                    className={`frequency-card ${activity === 'moderate' ? 'selected' : ''}`}
                    onClick={() => setActivity('moderate')}
                  >
                    <span className="freq-icon">🔥</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <span className="freq-title">Intermediário / Ativo</span>
                      <span className="freq-subtitle">3 a 4 dias por semana • Hipertrofia & Queima</span>
                    </div>
                  </button>

                  <button 
                    type="button"
                    className={`frequency-card ${activity === 'active' ? 'selected' : ''}`}
                    onClick={() => setActivity('active')}
                  >
                    <span className="freq-icon">⚡</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <span className="freq-title">Performance Máxima</span>
                      <span className="freq-subtitle">5 ou mais dias por semana • Atleta dedicado</span>
                    </div>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button className="widget-btn" style={{ flex: 1, padding: '1rem' }} onClick={() => setSubStep(3)}>
                    VOLTAR
                  </button>
                  <button className="primary-btn continue-btn" style={{ flex: 2, margin: 0 }} onClick={() => setStep(2)}>
                    SELECIONAR FOCOS
                    <Sparkles size={20} color="#000" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {step === 2 && (
          <div className="step-container">
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Músculos de Foco</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Escolha os músculos prioritários para a divisão de treino</p>
            </div>

            <div className="muscle-grid">
              {MUSCLE_GROUPS.map(muscle => {
                const isSelected = selectedMuscles.includes(muscle.id);
                return (
                  <button 
                    key={muscle.id}
                    className={`muscle-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleMuscle(muscle.id)}
                  >
                    <div className="muscle-silhouette-ref">
                      <MuscleSilhouetteSVG muscleId={muscle.id} isSelected={isSelected} />
                      {isSelected && (
                        <div className="muscle-selected-check">
                          <CheckCircle size={14} fill="var(--accent-primary)" color="#000" />
                        </div>
                      )}
                    </div>
                    <div className="muscle-info-box">
                      <span className="muscle-name">{muscle.name}</span>
                      <span className="muscle-exercises-ref">{muscle.exercises}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="widget-btn" style={{ flex: 1, padding: '1rem' }} onClick={() => setStep(1)}>
                VOLTAR
              </button>
              <button className="primary-btn continue-btn" style={{ flex: 2, margin: 0 }} onClick={calculateAndGeneratePlan}>
                GERAR PLANO
                <Sparkles size={20} color="#000" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (() => {
          const goalMap: any = {
            hypertrophy: { icon: '💪', label: 'MODO HIPERTROFIA', color: '#ff6b35' },
            fat_loss:    { icon: '🔥', label: 'MODO EMAGRECIMENTO', color: '#ff9500' },
            performance: { icon: '⚡', label: 'MODO PERFORMANCE', color: '#bf5af2' },
            wellness:    { icon: '🧘', label: 'MODO BEM-ESTAR', color: '#30d158' },
          };
          const g = goalMap[goal] || goalMap.hypertrophy;
          // Weekly schedule based on frequency
          const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
          const scheduleMap: any = {
            sedentary: ['A', '-', 'B', '-', '-', '-', '-'],
            moderate:  ['A', '-', 'B', '-', 'A', '-', '-'],
            active:    ['A', 'B', '-', 'A', 'B', '-', '-'],
          };
          const schedule = scheduleMap[activity] || scheduleMap.moderate;
          return (
          <div className="step-container">
            {/* Goal Badge */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: `${g.color}15`, border: `1px solid ${g.color}40`, borderRadius: '100px', padding: '0.5rem 1.25rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{g.icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: g.color, letterSpacing: '0.08em' }}>{g.label} ATIVADO</span>
              </div>
              <div className="success-icon-ring">
                <Sparkles size={32} color="var(--accent-primary)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1rem' }}>Seu Perfil Atlético Gerado!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Cargas, séries e hidratação calculadas para o seu corpo</p>
            </div>

            {/* Weekly Schedule */}
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '16px', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>DIVISÃO SEMANAL RECOMENDADA</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
                {days.map((d, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>{d}</div>
                    <div style={{
                      padding: '0.4rem 0.1rem',
                      borderRadius: '8px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: schedule[i] !== '-' ? `${g.color}20` : 'rgba(255,255,255,0.04)',
                      color: schedule[i] !== '-' ? g.color : 'var(--text-secondary)',
                      border: schedule[i] !== '-' ? `1px solid ${g.color}40` : '1px solid transparent',
                    }}>{schedule[i] !== '-' ? schedule[i] : '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="results-card glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0 }}>
                <Activity size={18} color="var(--accent-primary)" /> Resultados & Metas Fisiológicas
              </h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Classificação do seu IMC:</span>
                <span style={{ fontWeight: 700, color: bmiClass === 'Peso Ideal (Saudável)' ? '#30d158' : '#ff9f0a' }}>
                  {bmi} • {bmiClass}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Peso Ideal Sugerido:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {minWeight} kg a {maxWeight} kg
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Meta de Hidratação Diária (35ml/kg):</span>
                <span style={{ fontWeight: 700, color: '#0a84ff', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Droplet size={16} /> {(waterGoal / 1000).toFixed(2)} Litros ({waterGoal}ml)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gasto Calórico Diário Recomendado:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Scale size={16} /> {calorieGoal} kcal
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Planilhas de Treino Personalizadas:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {generatedWorkouts.map((w, idx) => (
                  <div key={idx} className="workout-sheet glass-panel" style={{ padding: '1rem', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div>
                        <h5 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{w.title}</h5>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {w.exercises.length} exercícios • {w.duration} min
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: g.color, fontWeight: 700, background: `${g.color}15`, padding: '0.25rem 0.625rem', borderRadius: '100px' }}>{w.intensity}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {w.exercises.map((ex: any, ei: number) => (
                        <div key={ei} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{ex.name}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{ex.machine}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{ex.sets}x {ex.reps}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{ex.load}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="primary-btn" style={{ width: '100%', padding: '1.25rem' }} onClick={handleActivatePlan}>
              ATIVAR MEU PLANO AGORA ⚡
            </button>
          </div>
          );
        })()}

      {showSuccessModal && (
        <div className="celebration-overlay">
          <div className="celebration-card glass-panel anim-scale-up" style={{ maxWidth: '360px', padding: '2.5rem 1.75rem' }}>
            <div className="success-icon-ring" style={{ width: '80px', height: '80px', background: 'rgba(225, 255, 0, 0.15)', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(225, 255, 0, 0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              <Sparkles size={40} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>Plano Ativado! ⚡</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center', lineHeight: 1.4 }}>
              Seu plano personalizado de treino e biometria corporal foi calculado e ativado com sucesso!
            </p>
            <button 
              className="primary-btn" 
              onClick={() => window.location.reload()}
              style={{ width: '100%', padding: '1.15rem', margin: 0 }}
              type="button"
            >
              COMEÇAR TREINOS
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
