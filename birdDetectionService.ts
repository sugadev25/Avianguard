export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  birdDetected: boolean;
  birdName: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export class BirdDetectionService {
  private timer: NodeJS.Timeout | null = null;
  private isDetecting: boolean = false;

  startDetection(onResult: (result: DetectionResult) => void) {
    this.isDetecting = true;
    
    const runSimulation = () => {
      if (!this.isDetecting) return;

      // Random delay between 3 and 8 seconds
      const delay = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
      
      this.timer = setTimeout(() => {
        if (!this.isDetecting) return;
        
        // 70% chance of detecting a bird
        const detected = Math.random() < 0.7;
        
        if (detected) {
          const speciesList = ['Crow', 'Pigeon', 'Sparrow', 'Parrot'];
          const randomSpecies = speciesList[Math.floor(Math.random() * speciesList.length)];
          const randomConfidence = Number((Math.random() * (0.99 - 0.85) + 0.85).toFixed(2));
          
          // Random coordinates within standard 640x480 frame space
          const x = Math.floor(Math.random() * 200) + 100;
          const y = Math.floor(Math.random() * 150) + 80;
          const width = Math.floor(Math.random() * 100) + 150;
          const height = Math.floor(Math.random() * 80) + 100;

          onResult({
            birdDetected: true,
            birdName: randomSpecies,
            confidence: randomConfidence,
            boundingBox: { x, y, width, height }
          });
        } else {
          onResult({
            birdDetected: false,
            birdName: '',
            confidence: 0
          });
        }

        // Loop to schedule next detection
        runSimulation();
      }, delay);
    };

    runSimulation();
  }

  stopDetection() {
    this.isDetecting = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export const birdDetectionService = new BirdDetectionService();
