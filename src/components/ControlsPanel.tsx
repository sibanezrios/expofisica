/**
 * Panel de control para ajustar variables físicas
 */

import React from 'react';
import type { PhysicsVariables } from '../types';
import { Tooltip } from './Tooltip';
import './ControlsPanel.css';

interface ControlsPanelProps {
  variables: PhysicsVariables;
  onVariablesChange: (variables: PhysicsVariables) => void;
  onReset: () => void;
}

// Textos de ayuda para cada variable
const TOOLTIPS = {
  magneticForce: 'Representa la fuerza de repulsión vertical que genera cada imán. Mayor valor = más capacidad de levitar.',
  trainMass: 'Afecta el peso total del vagón. Si el peso supera la fuerza magnética, no habrá levitación.',
  railSeparation: 'Distancia entre las dos hileras de imanes. Muy grande = campo débil; muy pequeño = menor estabilidad.',
  magnetCount: 'Número de imanes activos en el sistema. Afecta la fuerza magnética total disponible.',
  magnetDistance: 'Afecta la distribución del campo. Muy amplia = menor densidad magnética.',
  motorSpeed: 'Afecta la velocidad del desplazamiento horizontal, no la levitación.',
  motorDirection: 'Cambia la dirección del movimiento del vagón. No afecta altura ni estabilidad.',
};

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  variables,
  onVariablesChange,
  onReset,
}) => {
  const handleChange = (key: keyof PhysicsVariables, value: number | string) => {
    let parsedValue: number | 1 | -1;
    
    if (key === 'motorDirection') {
      parsedValue = value === '1' ? 1 : -1;
    } else {
      parsedValue = parseFloat(value as string);
      if (isNaN(parsedValue)) return;
    }
    
    onVariablesChange({
      ...variables,
      [key]: parsedValue,
    });
  };

  return (
    <div className="controls-panel">
      <h2>⚙️ Panel de Control</h2>
      
      <div className="control-group">
        <label htmlFor="magneticForce">
          <span className="label-text">
            Fuerza Magnética por Imán (N)
            <Tooltip text={TOOLTIPS.magneticForce} multiline />
          </span>
          <span className="value-display">{variables.magneticForce.toFixed(1)}</span>
        </label>
        <input
          id="magneticForce"
          type="range"
          min="0.5"
          max="10"
          step="0.1"
          value={variables.magneticForce}
          onChange={(e) => handleChange('magneticForce', e.target.value)}
        />
        <input
          type="number"
          min="0.5"
          max="10"
          step="0.1"
          value={variables.magneticForce}
          onChange={(e) => handleChange('magneticForce', e.target.value)}
          className="number-input"
        />
      </div>
      
      <div className="control-group">
        <label htmlFor="trainMass">
          <span className="label-text">
            Masa del Vagón (kg)
            <Tooltip text={TOOLTIPS.trainMass} multiline />
          </span>
          <span className="value-display">{variables.trainMass.toFixed(2)}</span>
        </label>
        <input
          id="trainMass"
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={variables.trainMass}
          onChange={(e) => handleChange('trainMass', e.target.value)}
        />
        <input
          type="number"
          min="0.1"
          max="2"
          step="0.1"
          value={variables.trainMass}
          onChange={(e) => handleChange('trainMass', e.target.value)}
          className="number-input"
        />
      </div>

      <div className="control-group">
        <label htmlFor="magnetDistance">
          <span className="label-text">
            Distancia entre Imanes (cm)
            <Tooltip text={TOOLTIPS.magnetDistance} multiline />
          </span>
          <span className="value-display">{variables.magnetDistance.toFixed(1)}</span>
        </label>
        <input
          id="magnetDistance"
          type="range"
          min="2"
          max="15"
          step="0.5"
          value={variables.magnetDistance}
          onChange={(e) => handleChange('magnetDistance', e.target.value)}
        />
        <input
          type="number"
          min="2"
          max="15"
          step="0.5"
          value={variables.magnetDistance}
          onChange={(e) => handleChange('magnetDistance', e.target.value)}
          className="number-input"
        />
      </div>

      <div className="control-group">
        <label htmlFor="magnetCount">
          <span className="label-text">
            Cantidad de Imanes
            <Tooltip text={TOOLTIPS.magnetCount} multiline />
          </span>
          <span className="value-display">{variables.magnetCount}</span>
        </label>
        <input
          id="magnetCount"
          type="range"
          min="4"
          max="16"
          step="1"
          value={variables.magnetCount}
          onChange={(e) => handleChange('magnetCount', e.target.value)}
        />
        <input
          type="number"
          min="4"
          max="16"
          step="1"
          value={variables.magnetCount}
          onChange={(e) => handleChange('magnetCount', e.target.value)}
          className="number-input"
        />
      </div>

      <div className="control-group">
        <label htmlFor="railSeparation">
          <span className="label-text">
            Separación entre Hileras (cm)
            <Tooltip text={TOOLTIPS.railSeparation} multiline />
          </span>
          <span className="value-display">{variables.railSeparation.toFixed(1)}</span>
        </label>
        <input
          id="railSeparation"
          type="range"
          min="3"
          max="12"
          step="0.5"
          value={variables.railSeparation}
          onChange={(e) => handleChange('railSeparation', e.target.value)}
        />
        <input
          type="number"
          min="3"
          max="12"
          step="0.5"
          value={variables.railSeparation}
          onChange={(e) => handleChange('railSeparation', e.target.value)}
          className="number-input"
        />
      </div>

      <div className="control-group">
        <label htmlFor="motorSpeed">
          <span className="label-text">
            Velocidad del Motor (cm/s)
            <Tooltip text={TOOLTIPS.motorSpeed} multiline />
          </span>
          <span className="value-display">{variables.motorSpeed.toFixed(0)}</span>
        </label>
        <input
          id="motorSpeed"
          type="range"
          min="0"
          max="50"
          step="2"
          value={variables.motorSpeed}
          onChange={(e) => handleChange('motorSpeed', e.target.value)}
        />
        <input
          type="number"
          min="0"
          max="50"
          step="2"
          value={variables.motorSpeed}
          onChange={(e) => handleChange('motorSpeed', e.target.value)}
          className="number-input"
        />
      </div>

      <div className="control-group">
        <label htmlFor="motorDirection">
          <span className="label-text">
            Dirección del Motor
            <Tooltip text={TOOLTIPS.motorDirection} multiline />
          </span>
        </label>
        <div className="direction-buttons">
          <button
            type="button"
            className={`direction-btn ${variables.motorDirection === 1 ? 'active' : ''}`}
            onClick={() => handleChange('motorDirection', '1')}
          >
            ➡️ Derecha
          </button>
          <button
            type="button"
            className={`direction-btn ${variables.motorDirection === -1 ? 'active' : ''}`}
            onClick={() => handleChange('motorDirection', '-1')}
          >
            ⬅️ Izquierda
          </button>
        </div>
      </div>

      <button onClick={onReset} className="reset-button">
        🔄 Resetear Valores
      </button>

      <div className="info-section">
        <h3>ℹ️ Información</h3>
        <p><strong>Público:</strong> Físicos, estudiantes y entusiastas</p>
        <p><strong>Modelo:</strong> Sistema lineal de levitación magnética</p>
        <p><strong>Principio:</strong> Repulsión entre polos magnéticos iguales (N-N o S-S)</p>
        <p><strong>🔵 Azul:</strong> Polo Norte (N)</p>
        <p><strong>🔴 Rojo:</strong> Polo Sur (S)</p>
      </div>
    </div>
  );
};
