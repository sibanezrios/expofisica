/**
 * Tipos de datos para la simulación de levitación magnética
 */

export interface PhysicsVariables {
  // Masa del vagón en kilogramos
  trainMass: number;
  
  // Distancia entre imanes en centímetros
  magnetDistance: number;
  
  // Fuerza magnética estimada por imán en Newtons
  magneticForce: number;
  
  // Cantidad de imanes por carril
  magnetCount: number;
  
  // Separación entre hileras de imanes (altura del canal) en centímetros
  railSeparation: number;
  
  // Velocidad del motor en cm/s
  motorSpeed: number;
  
  // Dirección del motor (1 = adelante, -1 = atrás)
  motorDirection: 1 | -1;
}

export interface SimulationState {
  // Altura de levitación del vagón en centímetros
  levitationHeight: number;
  
  // Posición X del vagón en centímetros
  positionX: number;
  
  // Posición Y del vagón en centímetros
  positionY: number;
  
  // Velocidad del vagón en cm/s
  velocity: number;
  
  // Ángulo actual de la plataforma en grados
  platformAngle: number;
  
  // Fuerza neta resultante en Newtons
  netForce: number;
  
  // Estado de levitación
  isLevitating: boolean;
  
  // Velocidad real calculada basada en física
  actualSpeed: number;
}

export interface BoardDimensions {
  width: number;  // cm
  height: number; // cm
}

export const DEFAULT_VARIABLES: PhysicsVariables = {
  trainMass: 0.5,           // 500 gramos
  magnetDistance: 4,         // 4 cm entre imanes
  magneticForce: 2.5,        // 2.5 N por imán
  magnetCount: 10,           // 10 imanes por carril
  railSeparation: 6,         // 6 cm entre hileras
  motorSpeed: 20,            // 20 cm/s
  motorDirection: 1,         // adelante
};

export const BOARD_SIZE: BoardDimensions = {
  width: 50,   // 50 cm
  height: 30,  // 30 cm
};
