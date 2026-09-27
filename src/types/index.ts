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
