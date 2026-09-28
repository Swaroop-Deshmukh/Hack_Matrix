export interface ChemicalComposition {
  SiO2?: number;
  Al2O3?: number;
  Fe2O3?: number;
  CaO?: number;
  MgO?: number;
  SO3?: number;
  LOI?: number;
  [key: string]: number | undefined;
}

export interface PhysicalProperties {
  moisture?: number; // %
  fineness?: number; // % passing 45µm
  density?: number; // g/cm³
  particleSize?: number; // µm median
  [key: string]: number | undefined;
}

export interface EvidenceRecord {
  property: string;
  value: string | number;
  type: 'LAB VERIFIED' | 'MODELED' | 'UNVERIFIED';
  source: string;
  date?: string;
  status: 'Verified' | 'Modeled' | 'Pending';
}

export interface Material {
  id: string;
  name: string;
  quantity: number; // tonnes
  unit: string;
  source: string;
  location: string;
  evidenceCompleteness: number; // 0-100 %
  candidatePathwaysCount: number;
  status: 'READY' | 'REVIEW' | 'INCOMPLETE';
  chemicalComposition: ChemicalComposition;
  physicalProperties: PhysicalProperties;
  evidenceRecords: EvidenceRecord[];
  availability: string;
  createdAt: string;
}

export interface Bottleneck {
  id: string;
  title: string;
  facility: string;
  utilization: number; // percentage
  status: 'warning' | 'critical' | 'info';
  description: string;
}

export interface PathwayCheck {
  property: string;
  observed: string | number;
  requirement: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'MISSING';
}

export interface CandidatePathway {
  id: string;
  name: string;
  materialId: string;
  materialName: string;
  status: 'DIRECT' | 'PROCESS' | 'UNKNOWN' | 'FAIL';
  technicalFeasible: boolean;
  processingRequired: boolean;
  processingDetails?: string;
  evidenceVerified: boolean;
  propertyChecks: PathwayCheck[];
  unlokRequirement?: {
    type: 'EVIDENCE' | 'PROCESSING';
    description: string;
    actionNeeded: string;
  };
}

export interface NodeLocation {
  id: string;
  name: string;
  type: 'SOURCE' | 'PROCESSING' | 'DESTINATION' | 'DISPOSAL';
  coordinates: [number, number]; // [lng, lat]
  address: string;
  capacity?: string;
}

export interface NetworkRoute {
  id: string;
  sourceId: string;
  sourceName: string;
  processingId?: string;
  processingName?: string;
  destinationId: string;
  destinationName: string;
  materialId: string;
  materialName: string;
  quantity: number; // t
  distanceKm: number;
  transportCost: number; // Lakhs
  processingCost: number; // Lakhs
  yieldPercentage: number;
  residualTonnes: number;
  technicallyFeasible: boolean;
  capacityAvailable: boolean;
  demandAvailable: boolean;
  routeCoordinates: [number, number][];
  status: 'OPTIMAL' | 'SUBOPTIMAL' | 'FEASIBLE';
}

export interface MaterialFlowItem {
  id: string;
  sourceMaterial: string;
  pathway: string;
  destination: string;
  tonnes: number;
  color: string;
}

export interface MetricSummary {
  totalMaterialTonnes: number;
  divertedTonnes: number;
  divertedPercentage: number;
  netCostLakhs: number;
  comparativeEmissionsDeltaTonnes: number;
  lastOptimizedTime: string;
}

export interface OptimizationRun {
  id: string;
  timestamp: string;
  status: 'SOLVED' | 'FEASIBLE' | 'INFEASIBLE';
  divertedTonnes: number;
  divertedPercentage: number;
  netCostLakhs: number;
  emissionsDeltaTonnes: number;
  solverTimeMs: number;
  objective?: string;
}

export interface Allocation {
  id: string;
  materialId: string;
  materialName: string;
  sourceId?: string;
  sourceName?: string;
  destinationId?: string;
  destinationName?: string;
  destination?: string;
  pathwayId?: string;
  pathwayName?: string;
  pathway?: string;
  processingFacility?: string;
  quantityTonnes?: number;
  quantity?: number;
  netCostLakhs?: number;
  transportCostLakhs?: number;
  processingCostLakhs?: number;
  residualTonnes?: number;
  technicalStatus?: string;
  decisionReason?: string;
  unitCost?: number;
  totalCost?: number;
  emissionsSaved?: number;
  status: string;
}

export interface ImpactRecord {
  id?: string;
  optimizationRunId?: string;
  systemBoundary?: string;
  emissionFactorsVersion?: string;
  waterfallData?: Array<{ name: string; type: 'COST' | 'SAVING' | 'NET'; value: number }>;
  baselineDisposalCostLakhs: number;
  optimizedNetCostLakhs: number;
  costSavingsLakhs: number;
  virginMaterialOffsetTonnes: number;
  co2EmissionsAvoidedTonnes: number;
  landfillVolumeSavedM3: number;
  waterSavedKL: number;
  communityJobsSupported: number;
  circularityScore: number;
}

export interface DecisionAction {
  id: string;
  title: string;
  type: string;
  impact: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rationale: string;
  destinationFacility?: string;
  tonnes?: number;
  whyFeasible?: string[];
  whyCapacity?: string[];
  whyPortfolio?: string[];
}

export interface AlternativeDecision {
  id: string;
  title: string;
  tradeoff: string;
  netCostDelta: number;
  emissionsDelta: number;
  route?: string;
  rejectReason?: string;
}

export interface UnlockRequirement {
  id: string;
  materialId: string;
  materialName: string;
  missingProperty: string;
  actionRequired: string;
  potentialDivertedTonnes: number;
  route?: string;
  reasonText?: string;
  unlockActionText?: string;
}

export interface ScenarioResult {
  id: string;
  name?: string;
  scenarioName?: string;
  baselineDiversionPercentage?: number;
  scenarioDiversionPercentage?: number;
  baselineCostLakhs?: number;
  scenarioCostLakhs?: number;
  baselineEmissionsDeltaTonnes?: number;
  scenarioEmissionsDeltaTonnes?: number;
  newBottlenecks?: string[];
  allocationsShift?: Array<{ destination: string; changeTonnes: number }>;
  divertedTonnes?: number;
  costLakhs?: number;
  resilienceScore?: number;
}

