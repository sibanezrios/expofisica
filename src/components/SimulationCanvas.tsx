/**
 * Canvas de renderizado visual para la simulación
 * Sistema lineal con movimiento infinito y paleta profesional
 */

import React, { useEffect, useRef, useState } from 'react';
import type { PhysicsVariables, SimulationState } from '../types';
import { BOARD_SIZE } from '../types';
import './SimulationCanvas.css';

interface SimulationCanvasProps {
  variables: PhysicsVariables;
  state: SimulationState;
}

// Paleta de colores profesional
const COLORS = {
  background: '#0F172A',        // Fondo azul-gris oscuro
  grid: '#334155',              // Líneas de cuadrícula sutiles
  border: '#475569',            // Borde discreto
  rail: '#1E293B',              // Rieles oscuros
  cartBody: '#9CA3AF',          // Vagón gris metálico
  cartShadow: 'rgba(0,0,0,0.3)', // Sombra del vagón
  northPole: '#3B82F6',         // Polo Norte azul sobrio
  southPole: '#EF4444',         // Polo Sur rojo desaturado
  forceLinePositive: '#10B981', // Líneas de fuerza verde ingenieril
  forceLineNegative: '#F59E0B', // Líneas de fuerza naranja advertencia
  text: '#E2E8F0',              // Texto claro
  textSecondary: '#94A3B8',     // Texto secundario
  noLevitation: '#DC2626',      // Rojo para sin levitación
};

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  variables,
  state,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  // Offset acumulado para el efecto de movimiento infinito
  const [backgroundOffset, setBackgroundOffset] = useState(0);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar canvas para pantallas de alta resolución (Retina/4K)
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = BOARD_SIZE.width * 12;
    const displayHeight = BOARD_SIZE.height * 12;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    ctx.scale(dpr, dpr);

    // Escala para convertir cm a píxeles (12 píxeles = 1 cm)
    const scale = 12;
    
    const draw = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // en segundos
      lastTimeRef.current = currentTime;

      // Actualizar offset del fondo para movimiento infinito
      // El fondo se mueve en dirección opuesta al movimiento del vagón
      if (state.isLevitating && state.actualSpeed > 0) {
        const movement = state.actualSpeed * deltaTime * scale * variables.motorDirection;
        setBackgroundOffset(prev => (prev + movement) % (variables.magnetDistance * scale * 2));
      }

      // Limpiar canvas con color profesional
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Dibujar tablero base
      drawBoard(ctx, scale);

      // Dibujar carriles con imanes (con offset para movimiento infinito)
      drawRailsLinear(ctx, scale, variables, backgroundOffset);

      // Dibujar vagón en posición fija (centro-derecha)
      drawTrainLinear(ctx, scale, state, variables);

      // Dibujar líneas de fuerza si hay levitación
      if (state.isLevitating && state.levitationHeight > 0) {
        drawForceLines(ctx, scale, state);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [variables, state, backgroundOffset]);

  return (
    <div className="simulation-container">
      <div className="canvas-wrapper">
        <h3>📊 Simulación en Vivo</h3>
        <div className="canvas-frame">
          <canvas
            ref={canvasRef}
            className="simulation-canvas"
          />
        </div>
      </div>
      
      <div className="physics-info-panel">
        <h3>⚡ Estado Físico</h3>
        <div className="physics-grid">
          <div className={`physics-item ${state.isLevitating ? 'levitating' : 'not-levitating'}`}>
            <div className="physics-item-label">Estado</div>
            <div className="physics-item-value">
              {state.isLevitating ? '✓ LEVITANDO' : '✗ NO LEVITA'}
            </div>
          </div>
          
          <div className="physics-item">
            <div className="physics-item-label">Altura</div>
            <div className="physics-item-value">
              {state.levitationHeight.toFixed(2)}
              <span className="physics-item-unit">cm</span>
            </div>
          </div>
          
          <div className="physics-item">
            <div className="physics-item-label">Velocidad Real</div>
            <div className="physics-item-value">
              {state.actualSpeed.toFixed(1)}
              <span className="physics-item-unit">cm/s</span>
            </div>
          </div>
          
          <div className="physics-item">
            <div className="physics-item-label">Fuerza Neta</div>
            <div className="physics-item-value">
              {state.netForce.toFixed(2)}
              <span className="physics-item-unit">N</span>
            </div>
          </div>
          
          <div className="physics-item">
            <div className="physics-item-label">F. Mag. Efectiva</div>
            <div className="physics-item-value">
              {(() => {
                const REFERENCE_DISTANCE = 4;
                const distanceFactor = Math.pow(REFERENCE_DISTANCE / variables.magnetDistance, 1.5);
                const effectiveMagneticForcePerMagnet = variables.magneticForce * Math.min(distanceFactor, 1.2);
                const totalEffectiveMagneticForce = effectiveMagneticForcePerMagnet * variables.magnetCount * 2;
                return totalEffectiveMagneticForce.toFixed(2);
              })()}
              <span className="physics-item-unit">N</span>
            </div>
          </div>
          
          <div className="physics-item">
            <div className="physics-item-label">Peso</div>
            <div className="physics-item-value">
              {(variables.trainMass * 9.81).toFixed(2)}
              <span className="physics-item-unit">N</span>
            </div>
          </div>
          
          <div className="physics-item">
            <div className="physics-item-label">Factor Distancia</div>
            <div className="physics-item-value">
              {(() => {
                const REFERENCE_DISTANCE = 4;
                const distanceFactor = Math.pow(REFERENCE_DISTANCE / variables.magnetDistance, 1.5);
                return (distanceFactor * 100).toFixed(0);
              })()}
              <span className="physics-item-unit">%</span>
            </div>
          </div>
          
          <div className="physics-item">
            <div className="physics-item-label">Factor Estabilidad</div>
            <div className="physics-item-value">
              {(() => {
                const stabilityFactor = Math.max(0.5, Math.min(1.0, 6 / variables.railSeparation));
                return (stabilityFactor * 100).toFixed(0);
              })()}
              <span className="physics-item-unit">%</span>
            </div>
          </div>
          
          <div className="physics-item">
            <div className="physics-item-label">Masa</div>
            <div className="physics-item-value">
              {variables.trainMass.toFixed(2)}
              <span className="physics-item-unit">kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== FUNCIONES DE DIBUJO ====================

/**
 * Dibuja el tablero base con cuadrícula profesional
 */
function drawBoard(ctx: CanvasRenderingContext2D, scale: number) {
  const width = BOARD_SIZE.width * scale;
  const height = BOARD_SIZE.height * scale;

  // Borde sutil
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Grid sutil
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 0.5;
  
  for (let i = 0; i < BOARD_SIZE.width; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i * scale, 0);
    ctx.lineTo(i * scale, height);
    ctx.stroke();
  }
  
  for (let i = 0; i < BOARD_SIZE.height; i += 5) {
    ctx.beginPath();
    ctx.moveTo(0, i * scale);
    ctx.lineTo(width, i * scale);
    ctx.stroke();
  }
}

/**
 * Dibuja los carriles lineales con imanes enfrentados
 * Con efecto de movimiento infinito mediante offset
 */
function drawRailsLinear(
  ctx: CanvasRenderingContext2D,
  scale: number,
  variables: PhysicsVariables,
  offset: number
) {
  const centerY = (BOARD_SIZE.height / 2) * scale;
  const railStartX = 0;
  const railEndX = BOARD_SIZE.width * scale;
  const railSeparation = variables.railSeparation * scale;
  
  const upperRailY = centerY - railSeparation / 2;
  const lowerRailY = centerY + railSeparation / 2;

  // Dibujar rieles
  ctx.fillStyle = COLORS.rail;
  ctx.fillRect(railStartX, upperRailY - 3, railEndX, 2);
  ctx.fillRect(railStartX, lowerRailY + 1, railEndX, 2);

  // Dibujar imanes con offset para movimiento infinito
  const magnetSpacing = variables.magnetDistance * scale;
  const magnetSize = 12;
  
  // Calcular cuántos imanes necesitamos para llenar la pantalla + buffer
  const totalMagnets = Math.ceil(railEndX / magnetSpacing) + 2;
  
  for (let i = -1; i < totalMagnets; i++) {
    const x = (i * magnetSpacing - offset) % (BOARD_SIZE.width * scale + magnetSpacing);
    
    if (x < -magnetSize || x > railEndX + magnetSize) continue;
    
    // Imán superior (Polo Sur hacia abajo - hacia el vagón)
    ctx.fillStyle = COLORS.northPole;
    ctx.fillRect(x - magnetSize / 2, upperRailY - magnetSize - 3, magnetSize, magnetSize / 2);
    ctx.fillStyle = COLORS.southPole;
    ctx.fillRect(x - magnetSize / 2, upperRailY - magnetSize / 2 - 3, magnetSize, magnetSize / 2);
    
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - magnetSize / 2, upperRailY - magnetSize - 3, magnetSize, magnetSize);
    
    // Etiquetas
    ctx.fillStyle = 'white';
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', x, upperRailY - 9);
    ctx.fillText('S', x, upperRailY - 3);
    
    // Imán inferior (Polo Sur hacia arriba - hacia el vagón)
    ctx.fillStyle = COLORS.southPole;
    ctx.fillRect(x - magnetSize / 2, lowerRailY + 3, magnetSize, magnetSize / 2);
    ctx.fillStyle = COLORS.northPole;
    ctx.fillRect(x - magnetSize / 2, lowerRailY + 3 + magnetSize / 2, magnetSize, magnetSize / 2);
    
    ctx.strokeRect(x - magnetSize / 2, lowerRailY + 3, magnetSize, magnetSize);
    
    ctx.fillStyle = 'white';
    ctx.fillText('S', x, lowerRailY + 9);
    ctx.fillText('N', x, lowerRailY + 14);
  }
}

/**
 * Dibuja el vagón en posición fija con imanes
 * La posición es fija para dar efecto de movimiento infinito
 */
function drawTrainLinear(
  ctx: CanvasRenderingContext2D,
  scale: number,
  state: SimulationState,
  variables: PhysicsVariables
) {
  const x = state.positionX * scale;
  const centerY = (BOARD_SIZE.height / 2) * scale;
  const railSeparation = variables.railSeparation * scale;
  
  // Calcular posición Y según levitación
  // Si no levita, está en el fondo (lowerRail)
  const baseY = state.isLevitating 
    ? centerY
    : centerY + railSeparation / 2 - 10; // Pegado al riel inferior
  
  const y = baseY - (state.levitationHeight * scale);
  
  const trainWidth = 6 * scale;
  const trainHeight = 3 * scale;

  // Sombra (solo si levita)
  if (state.isLevitating) {
    ctx.fillStyle = COLORS.cartShadow;
    ctx.beginPath();
    ctx.ellipse(x, centerY, trainWidth * 0.6, trainHeight * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cuerpo del vagón
  const bodyColor = state.isLevitating ? COLORS.cartBody : COLORS.noLevitation;
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - trainWidth / 2, y - trainHeight / 2, trainWidth, trainHeight);

  ctx.strokeStyle = state.isLevitating ? '#6B7280' : '#991B1B';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - trainWidth / 2, y - trainHeight / 2, trainWidth, trainHeight);

  // Imanes del vagón
  const magnetWidth = 10;
  const magnetHeight = 8;
  const magnetX1 = x - trainWidth / 4;
  const magnetX2 = x + trainWidth / 4;
  
  // Imanes superiores (Polo Sur hacia arriba)
  const magnetTopY = y - trainHeight / 2 - magnetHeight;
  
  [magnetX1, magnetX2].forEach(mx => {
    ctx.fillStyle = COLORS.southPole;
    ctx.fillRect(mx - magnetWidth / 2, magnetTopY, magnetWidth, magnetHeight / 2);
    ctx.fillStyle = COLORS.northPole;
    ctx.fillRect(mx - magnetWidth / 2, magnetTopY + magnetHeight / 2, magnetWidth, magnetHeight / 2);
    
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(mx - magnetWidth / 2, magnetTopY, magnetWidth, magnetHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 6px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', mx, magnetTopY + 4);
    ctx.fillText('N', mx, magnetTopY + magnetHeight - 1);
  });
  
  // Imanes inferiores (Polo Sur hacia abajo)
  const magnetBottomY = y + trainHeight / 2;
  
  [magnetX1, magnetX2].forEach(mx => {
    ctx.fillStyle = COLORS.northPole;
    ctx.fillRect(mx - magnetWidth / 2, magnetBottomY, magnetWidth, magnetHeight / 2);
    ctx.fillStyle = COLORS.southPole;
    ctx.fillRect(mx - magnetWidth / 2, magnetBottomY + magnetHeight / 2, magnetWidth, magnetHeight / 2);
    
    ctx.strokeRect(mx - magnetWidth / 2, magnetBottomY, magnetWidth, magnetHeight);
    
    ctx.fillStyle = 'white';
    ctx.fillText('N', mx, magnetBottomY + 4);
    ctx.fillText('S', mx, magnetBottomY + magnetHeight - 1);
  });

  // Indicador de dirección
  if (state.isLevitating && state.actualSpeed > 0) {
    ctx.fillStyle = COLORS.forceLinePositive;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    const arrow = variables.motorDirection > 0 ? '→' : '←';
    ctx.fillText(arrow, x, y - trainHeight - 10);
  }
}

/**
 * Dibuja líneas de fuerza magnética
 */
function drawForceLines(
  ctx: CanvasRenderingContext2D,
  scale: number,
  state: SimulationState
) {
  const x = state.positionX * scale;
  const centerY = (BOARD_SIZE.height / 2) * scale;
  const y = centerY - (state.levitationHeight * scale);

  // Líneas de repulsión sutiles
  ctx.strokeStyle = `${COLORS.forceLinePositive}40`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);

  for (let i = -1; i <= 1; i++) {
    const offsetX = i * 15;
    
    // Fuerza superior
    ctx.beginPath();
    ctx.moveTo(x + offsetX, y - 15);
    ctx.lineTo(x + offsetX, y - 30);
    ctx.stroke();
    
    // Fuerza inferior
    ctx.beginPath();
    ctx.moveTo(x + offsetX, y + 15);
    ctx.lineTo(x + offsetX, y + 30);
    ctx.stroke();
  }

  ctx.setLineDash([]);
}
