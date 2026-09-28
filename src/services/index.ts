import { 
  mockOptimizationRun, 
  mockAllocations, 
  mockImpactRecord, 
  mockDecisionActions, 
  mockAlternativeDecisions, 
  mockUnlockRequirements 
} from '../data';
import type { 
  OptimizationRun, 
  Allocation, 
  ImpactRecord, 
  DecisionAction, 
  AlternativeDecision, 
  UnlockRequirement,
  ScenarioResult 
} from '../types';

export const optimizationService = {
  async getLatestRun(): Promise<OptimizationRun> {
    return Promise.resolve(mockOptimizationRun);
  },
  async getAllocations(): Promise<Allocation[]> {
    return Promise.resolve(mockAllocations);
  },
  async simulateRun(objective: string): Promise<OptimizationRun> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockOptimizationRun,
          id: `RUN-${Math.floor(1000 + Math.random() * 9000)}`,
          objective: objective as any,
          timestamp: new Date().toISOString()
        });
      }, 1800);
    });
  }
};

export const impactService = {
  async getImpactRecord(): Promise<ImpactRecord> {
    return Promise.resolve(mockImpactRecord);
  }
};

export const scenarioService = {
  async simulateScenario(parameters: Record<string, any>): Promise<ScenarioResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'SCEN-01',
          name: parameters.presetName || 'Custom Stress Test',
          baselineDiversionPercentage: 78.9,
          scenarioDiversionPercentage: parameters.cementPlantAvailable === false ? 67.6 : 74.2,
          baselineCostLakhs: 8.42,
          scenarioCostLakhs: parameters.cementPlantAvailable === false ? 10.17 : 9.10,
          baselineEmissionsDeltaTonnes: -1284,
          scenarioEmissionsDeltaTonnes: parameters.cementPlantAvailable === false ? -842 : -1120,
          newBottlenecks: ['Block Plant B-01 Storage Silo (98% Cap)', 'Road R-01 Fleet Transport Bandwidth'],
          allocationsShift: [
            { destination: 'Block Plant B-01', changeTonnes: +1200 },
            { destination: 'Road Project R-01', changeTonnes: +900 },
            { destination: 'Regulated Disposal Ash Pond 2', changeTonnes: +1400 }
          ]
        });
      }, 1400);
    });
  }
};

export const decisionService = {
  async getDecisionActions(): Promise<DecisionAction[]> {
    return Promise.resolve(mockDecisionActions);
  },
  async getAlternativeDecisions(): Promise<AlternativeDecision[]> {
    return Promise.resolve(mockAlternativeDecisions);
  },
  async getUnlockRequirements(): Promise<UnlockRequirement[]> {
    return Promise.resolve(mockUnlockRequirements);
  }
};
