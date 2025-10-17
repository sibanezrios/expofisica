/**
 * Motor de física para la simulación de levitación magnética
 * Sistema lineal con dos hileras de imanes enfrentadas
 * Con interdependencias dinámicas entre variables
 */

import type { PhysicsVariables, SimulationState } from '../types';

const GRAVITY = 9.81; // m/s²

// Distancia de referencia para calcular efectos de distancia entre imanes
const REFERENCE_MAGNET_DISTANCE = 4; // cm

/**
 * Calcula la fuerza magnética efectiva por imán según la distancia
 * La fuerza magnética disminuye con la distancia (ley del cuadrado inverso simplificada)
 */
function calculateEffectiveMagneticForce(
  baseMagneticForce: number,
  magnetDistance: number
): number {
  // Factor de reducción basado en la distancia
  // Si la distancia aumenta, la fuerza efectiva disminuye
  const distanceFactor = Math.pow(REFERENCE_MAGNET_DISTANCE / magnetDistance, 1.5);
  return baseMagneticForce * Math.min(distanceFactor, 1.2); // Max 20% de bonus por cercanía
}

/**
 * Calcula el factor de estabilidad según la separación entre hileras
 * Mayor separación = menor estabilidad = menor altura efectiva
 */
function calculateStabilityFactor(railSeparation: number): number {
  // Separación óptima: 6 cm
  const optimalSeparation = 6;
  const separationRatio = optimalSeparation / railSeparation;
  
  // Factor entre 0.5 y 1.0
  return Math.max(0.5, Math.min(1.0, separationRatio));
}

/**
 * Calcula la altura de levitación basada en la fuerza magnética vs peso
 * En el sistema lineal, hay dos hileras de imanes (superior e inferior)
 * que generan repulsión vertical
 * 
 * INTERDEPENDENCIAS:
 * - Distancia entre imanes afecta la fuerza magnética efectiva
 * - Separación entre hileras afecta la estabilidad
 */
function calculateLevitationHeight(variables: PhysicsVariables): number {
  const { trainMass, magneticForce, magnetCount, railSeparation, magnetDistance } = variables;
  
  // Calcular fuerza magnética efectiva (afectada por distancia entre imanes)
  const effectiveMagneticForce = calculateEffectiveMagneticForce(magneticForce, magnetDistance);
  
  // Fuerza magnética total de ambas hileras (2x porque son dos hileras)
  const totalMagneticForce = effectiveMagneticForce * magnetCount * 2;
  
  // Peso del vagón
  const weight = trainMass * GRAVITY;
  
  // Fuerza neta vertical
  const netForce = totalMagneticForce - weight;
  
  // Solo levita si la fuerza magnética supera el peso
  if (netForce <= 0) {
    return 0; // Sin levitación, pegado al suelo
  }
  
  // Factor de estabilidad según separación entre hileras
  const stabilityFactor = calculateStabilityFactor(railSeparation);
  
  // Altura proporcional a la fuerza neta disponible
  // Máximo: la mitad de la separación entre rieles para seguridad
  const heightFactor = netForce / weight;
  const maxHeight = (railSeparation / 2.5) * stabilityFactor;
  const calculatedHeight = ((heightFactor * railSeparation) / 3) * stabilityFactor;
  
  return Math.min(calculatedHeight, maxHeight);
}

/**
 * Calcula la fuerza neta resultante sobre el vagón
 * INTERDEPENDENCIAS:
 * - Afectada por distancia entre imanes (reduce fuerza magnética efectiva)
 * - Depende directamente de masa (peso)
 */
export function calculateNetForce(variables: PhysicsVariables): number {
  const { trainMass, magneticForce, magnetCount, magnetDistance } = variables;
  
  // Calcular fuerza magnética efectiva (reducida por distancia)
  const effectiveMagneticForce = calculateEffectiveMagneticForce(magneticForce, magnetDistance);
  
  const weight = trainMass * GRAVITY;
  const totalMagneticForce = effectiveMagneticForce * magnetCount * 2; // 2 hileras
  
  // Fuerza neta = Fuerza magnética - Peso
  return totalMagneticForce - weight;
}

/**
 * Determina si el vagón puede levitar
 */
function isLevitating(variables: PhysicsVariables): boolean {
  return calculateNetForce(variables) > 0;
}

/**
 * Calcula el factor de carga según la masa y la fuerza disponible
 * Mayor masa = mayor carga = menor eficiencia
 */
function calculateLoadFactor(variables: PhysicsVariables): number {
  const netForce = calculateNetForce(variables);
  const weight = variables.trainMass * GRAVITY;
  
  if (netForce <= 0) return 0;
  
  // Factor entre 0.3 y 1.0 según qué tan cerca estemos del límite
  const forceRatio = netForce / weight;
  return Math.min(1.0, Math.max(0.3, forceRatio));
}

/**
 * Calcula la velocidad real del vagón basada en física (F = m·a)
 * INTERDEPENDENCIAS:
 * - Si no levita → velocidad = 0 (independiente de motorSpeed)
 * - Si levita → velocidad depende de:
 *   * Masa (más masa = menos velocidad)
 *   * Fuerza neta (más fuerza = más velocidad)
 *   * Separación entre hileras (afecta estabilidad)
 *   * Distancia entre imanes (afecta fuerza efectiva)
 */
function calculateActualSpeed(variables: PhysicsVariables): number {
  const { trainMass, motorSpeed, railSeparation } = variables;
  
  // Si no hay levitación, no hay movimiento
  if (!isLevitating(variables)) {
    return 0;
  }
  
  const netForce = calculateNetForce(variables);
  
  // Aceleración = Fuerza neta / Masa (Segunda ley de Newton)
  const acceleration = netForce / trainMass;
  
  // Factor de velocidad basado en la capacidad de aceleración
  // Más fuerza neta = más velocidad posible
  // Más masa = menos velocidad para la misma fuerza
  const accelerationFactor = Math.min(acceleration / GRAVITY, 3); // Max 3x
  
  // Factor de estabilidad (mayor separación = menos velocidad por inestabilidad)
  const stabilityFactor = calculateStabilityFactor(railSeparation);
  
  // Factor de carga (cuánto de la capacidad estamos usando)
  const loadFactor = calculateLoadFactor(variables);
  
  // Velocidad real = velocidad motor × factores
  return motorSpeed * accelerationFactor * stabilityFactor * loadFactor;
}

/**
 * Calcula la velocidad del vagón basada en la velocidad del motor y dirección
 */
export function calculateTrainVelocity(variables: PhysicsVariables): number {
  const { motorDirection } = variables;
  
  const actualSpeed = calculateActualSpeed(variables);
  
  // Aplicar dirección
  return actualSpeed * motorDirection;
}

/**
 * Actualiza el estado de la simulación basado en las variables físicas
 * Sistema lineal: el vagón se mueve horizontalmente de izquierda a derecha
 * 
 * MOVIMIENTO INFINITO: El vagón permanece en el centro y el fondo se mueve
 */
export function updateSimulation(
  variables: PhysicsVariables
): SimulationState {
  // Calcular nueva altura de levitación
  const levitationHeight = calculateLevitationHeight(variables);
  
  // Calcular fuerza neta
  const netForce = calculateNetForce(variables);
  
  // Determinar si está levitando
  const isLevitatingNow = isLevitating(variables);
  
  // Calcular velocidad real (dependiente de física)
  const actualSpeed = calculateActualSpeed(variables);
  
  // Calcular velocidad con dirección
  const velocity = calculateTrainVelocity(variables);
  
  // Posición fija del vagón (centro-derecha de la pantalla para efecto infinito)
  const fixedPositionX = 30; // El vagón se mantiene aquí visualmente
  const centerY = 15; // Centro vertical del tablero
  
  // El desplazamiento acumulado se usa para mover el fondo
  // (se manejará en SimulationCanvas)
  
  return {
    levitationHeight,
    positionX: fixedPositionX,
    positionY: centerY,
    velocity,
    platformAngle: 0, // No hay plataforma giratoria en sistema lineal
    netForce,
    isLevitating: isLevitatingNow,
    actualSpeed,
  };
}

/**
 * Inicializa el estado de la simulación (sistema lineal)
 */
export function initializeSimulation(variables: PhysicsVariables): SimulationState {
  return {
    levitationHeight: calculateLevitationHeight(variables),
    positionX: 30, // posición fija (centro-derecha)
    positionY: 15, // centro vertical del tablero
    velocity: 0,
    platformAngle: 0, // No usado en sistema lineal
    netForce: calculateNetForce(variables),
    isLevitating: isLevitating(variables),
    actualSpeed: 0,
  };
}
