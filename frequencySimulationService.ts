export class FrequencySimulationService {
  generateFrequency(): number {
    // Generate a random frequency between 20.0 and 30.0
    return Number((Math.random() * (30.0 - 20.0) + 20.0).toFixed(1));
  }
}

export const frequencySimulationService = new FrequencySimulationService();
