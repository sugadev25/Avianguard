
export enum UserRole {
  FARMER = 'FARMER',
  STUDENT = 'STUDENT',
  OFFICER = 'OFFICER'
}

export type BirdSpecies = 'parakeet' | 'sparrow' | 'crow' | 'pigeon' | 'unknown';

export interface HardwareDevice {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  battery: number;
  signalStrength: number;
  lastDetection?: number;
  location: { x: number; y: number };
  sensors: {
    pir: boolean;
    ultrasonic: number;
    lux: number;
  };
}

export interface HardwareEvent {
  id: string;
  deviceId: string;
  timestamp: number;
  triggerType: 'pir' | 'manual' | 'scheduled';
  birdDetected: BirdSpecies;
  actionTaken: string;
  effectiveness: number; // 0-100
  imageUrl?: string;
}

export interface FarmerProfile {
  id: string;
  name: string;
  role: UserRole;
  landType: string;
  cropType: string;
  challenges: string[];
  devices: string[];
}

export interface DamageReport {
  id: string;
  timestamp: number;
  cropStage: string;
  severity: number;
  birdType?: BirdSpecies;
  observation: string;
  coordinates: [number, number];
  isVerified: boolean;
}
