/**
 * Pantalla de Bienvenida - Opening UI
 */

import { useEffect, useState, useCallback } from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 800); // Duración de la animación fade-out
  }, [onEnter]);

  // Auto-cerrar después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      handleEnter();
    }, 5000);

    return () => clearTimeout(timer);
  }, [handleEnter]);

  return (
    <div className={`welcome-screen ${isExiting ? 'fade-out' : ''}`}>
      {/* Fondo animado con partículas */}
      <div className="welcome-bg">
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--duration': `${15 + Math.random() * 10}s`,
              '--delay': `${Math.random() * 5}s`
            } as React.CSSProperties} />
          ))}
        </div>
        
        {/* Grid de fondo tecnológico */}
        <div className="grid-overlay"></div>
      </div>

      {/* Contenido principal */}
      <div className="welcome-content">
        <div className="logo-container">
          <div className="magnetic-icon">
            <div className="magnet-n">N</div>
            <div className="magnet-s">S</div>
            <div className="field-lines"></div>
          </div>
        </div>

        <h1 className="welcome-title">
          <span className="title-line">LEVITACIÓN</span>
          <span className="title-line">MAGNÉTICA</span>
        </h1>

        <p className="welcome-subtitle">
          Explora la física de la repulsión magnética
        </p>

        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Simulación en Tiempo Real</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🧲</span>
            <span>Física Interactiva</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Interdependencias Dinámicas</span>
          </div>
        </div>

        <button className="enter-button" onClick={handleEnter}>
          <span className="button-text">INICIAR SIMULACIÓN</span>
          <span className="button-arrow">→</span>
        </button>

        <p className="welcome-footer">
          Diseñado para físicos, ingenieros y estudiantes
        </p>
      </div>

      {/* Indicador de carga */}
      <div className="loading-indicator">
        <div className="loading-bar"></div>
      </div>
    </div>
  );
};
