import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from './firebase';
import { Dumbbell, Mail, Lock, User, ArrowRight } from 'lucide-react';
import './Auth.css';

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess();
      } else {
        // Register
        if (!name.trim()) {
          throw new Error('Por favor, informe seu nome.');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile name
        await updateProfile(user, { displayName: name });

        // Initialize Firebase Realtime Database node for this specific user UID!
        const userRef = ref(db, `users/${user.uid}`);
        const defaultProfile = {
          name: name,
          email: email,
          xp: 0,
          streak: 0,
          workoutsMonth: 0,
          weight: 80,
          height: 175,
          age: 25,
          gender: 'male',
          activity: 'moderate',
          waist: 85,
          arm: 34,
          waterGoal: 2800,
          calorieGoal: 2400,
          water: 0,
          caloriesEaten: 0,
          caloriesBurned: 0,
          currentPlan: []
        };
        await set(userRef, defaultProfile);
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está sendo utilizado.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(err.message || 'Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-background-glow"></div>
      
      <div className="auth-card glass-panel anim-scale-up">
        <div className="auth-header">
          <div className="auth-logo-ring">
            <Dumbbell size={32} color="var(--accent-primary)" />
          </div>
          <h1 className="auth-title">ACADEMIA FIT</h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Conecte-se para acompanhar sua evolução corporal' 
              : 'Crie seu perfil inteligente para começar a evoluir'}
          </p>
        </div>

        {error && (
          <div className="auth-error-box">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-input-group">
              <label className="auth-label">Nome Completo</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input 
                  type="text" 
                  className="auth-input-field" 
                  placeholder="ex: João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label">E-mail</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input 
                type="email" 
                className="auth-input-field" 
                placeholder="ex: email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group" style={{ marginBottom: '2rem' }}>
            <label className="auth-label">Senha</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input 
                type="password" 
                className="auth-input-field" 
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="primary-btn auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                {isLogin ? 'ENTRAR AGORA' : 'CADASTRAR E COMEÇAR'} 
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
          </span>
          <button 
            type="button" 
            className="auth-toggle-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Criar Conta Grátis' : 'Entrar na minha Conta'}
          </button>
        </div>
      </div>
    </div>
  );
}
