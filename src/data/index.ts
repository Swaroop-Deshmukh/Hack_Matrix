import type { Material, Bottleneck, CandidatePathway, NodeLocation, NetworkRoute, MaterialFlowItem, MetricSummary } from '../types';

export const mockMetricSummary: MetricSummary = {
  totalMaterialTonnes: 12450,
  divertedTonnes: 9820,
  divertedPercentage: 78.9,
  netCostLakhs: 8.42,
  comparativeEmissionsDeltaTonnes: -1284,
  lastOptimizedTime: 'Today, 14:42'
};

export const mockMaterials: Material[] = [
  {
    id: 'FA-001',
    name: 'Fly Ash',
    quantity: 5000,
    unit: 't',
    source: 'Thermal Plant Unit 3',
    location: 'Nagpur, Maharashtra',
    evidenceCompleteness: 94,
    candidatePathwaysCount: 4,
    status: 'READY',
    availability: '01 Oct — 30 Nov 2026',
    createdAt: '2026-09-10',
    chemicalComposition: {
      SiO2: 54.2,
      Al2O3: 28.1,
      Fe2O3: 7.4,
      CaO: 4.8,
      MgO: 1.2,
      SO3: 0.9,
      LOI: 2.1
    },
    physicalProperties: {
      moisture: 3.4,
      fineness: 92,
      density: 2.2,
      particleSize: 22
    },
    evidenceRecords: [
      { property: 'SiO₂', value: '54.2%', type: 'LAB VERIFIED', source: 'Report FA-0926', date: '12 Sep 2026', status: 'Verified' },
      { property: 'LOI', value: '2.1%', type: 'LAB VERIFIED', source: 'Report FA-0926', date: '12 Sep 2026', status: 'Verified' },
      { property: 'Moisture', value: '3.4%', type: 'MODELED', source: 'Internal Sensor Log', date: '14 Sep 2026', status: 'Modeled' },
      { property: 'Fineness', value: '92%', type: 'LAB VERIFIED', source: 'Report FA-0926', date: '12 Sep 2026', status: 'Verified' }
    ]
  },
  {
    id: 'SL-002',
    name: 'Blast Furnace Slag',
    quantity: 3200,
    unit: 't',
    source: 'Steel Plant Blast Furnace 2',
    location: 'Bhilai, Chhattisgarh',
    evidenceCompleteness: 100,
    candidatePathwaysCount: 4,
    status: 'READY',
    availability: '15 Sep — 31 Dec 2026',
    createdAt: '2026-09-08',
    chemicalComposition: {
      SiO2: 35.4,
      Al2O3: 18.2,
      Fe2O3: 1.1,
      CaO: 38.6,
      MgO: 5.4,
      SO3: 0.4,
      LOI: 0.8
    },
    physicalProperties: {
      moisture: 1.8,
      fineness: 88,
      density: 2.85,
      particleSize: 35
    },
    evidenceRecords: [
      { property: 'SiO₂', value: '35.4%', type: 'LAB VERIFIED', source: 'Bhilai QMS #882', date: '10 Sep 2026', status: 'Verified' },
      { property: 'CaO', value: '38.6%', type: 'LAB VERIFIED', source: 'Bhilai QMS #882', date: '10 Sep 2026', status: 'Verified' },
      { property: 'Moisture', value: '1.8%', type: 'LAB VERIFIED', source: 'Moisture Probe B2', date: '15 Sep 2026', status: 'Verified' }
    ]
  },
  {
    id: 'MW-003',
    name: 'Mine Waste / Overburden',
    quantity: 4250,
    unit: 't',
    source: 'Open Pit Mining Site B',
    location: 'Balaghat, Madhya Pradesh',
    evidenceCompleteness: 72,
    candidatePathwaysCount: 3,
    status: 'REVIEW',
    availability: 'Continuous Production',
    createdAt: '2026-09-01',
    chemicalComposition: {
      SiO2: 62.1,
      Al2O3: 14.5,
      Fe2O3: 12.8,
      CaO: 2.1,
      MgO: 1.8,
      LOI: 4.2
    },
    physicalProperties: {
      moisture: 7.2,
      fineness: 45,
      density: 2.6,
      particleSize: 180
    },
    evidenceRecords: [
      { property: 'SiO₂', value: '62.1%', type: 'LAB VERIFIED', source: 'Geolab MP-104', date: '01 Aug 2026', status: 'Verified' },
      { property: 'Heavy Metals', value: 'Pending', type: 'UNVERIFIED', source: 'Awaiting ICP-MS test', date: '-', status: 'Pending' },
      { property: 'Moisture', value: '7.2%', type: 'MODELED', source: 'Seasonal Estimation Model', date: '01 Sep 2026', status: 'Modeled' }
    ]
  },
  {
    id: 'CS-004',
    name: 'Copper Slag',
    quantity: 1800,
    unit: 't',
    source: 'Smelter Complex Unit A',
    location: 'Dahej, Gujarat',
    evidenceCompleteness: 88,
    candidatePathwaysCount: 2,
    status: 'READY',
    availability: '01 Oct — 15 Dec 2026',
    createdAt: '2026-09-12',
    chemicalComposition: {
      SiO2: 34.0,
      Fe2O3: 52.0,
      Al2O3: 4.2,
      CaO: 3.1,
      LOI: 0.5
    },
    physicalProperties: {
      moisture: 0.8,
      fineness: 65,
      density: 3.5,
      particleSize: 75
    },
    evidenceRecords: [
      { property: 'Fe₂O₃', value: '52.0%', type: 'LAB VERIFIED', source: 'Dahej Quality Assay', date: '14 Sep 2026', status: 'Verified' },
      { property: 'Leaching Assay', value: 'PASS', type: 'LAB VERIFIED', source: 'EnvCert India #991', date: '05 Sep 2026', status: 'Verified' }
    ]
  },
  {
    id: 'RP-005',
    name: 'Red Mud / Bauxite Residue',
    quantity: 2200,
    unit: 't',
    source: 'Refinery Pond 4',
    location: 'Renukoot, Uttar Pradesh',
    evidenceCompleteness: 65,
    candidatePathwaysCount: 3,
    status: 'INCOMPLETE',
    availability: 'Requires Dewatering',
    createdAt: '2026-09-15',
    chemicalComposition: {
      Fe2O3: 42.0,
      Al2O3: 22.0,
      SiO2: 12.0,
      CaO: 8.5,
      LOI: 9.5
    },
    physicalProperties: {
      moisture: 24.5,
      fineness: 95,
      density: 2.7,
      particleSize: 15
    },
    evidenceRecords: [
      { property: 'Alkalinity pH', value: '11.8', type: 'LAB VERIFIED', source: 'Plant Lab', date: '15 Sep 2026', status: 'Verified' },
      { property: 'Moisture', value: '24.5%', type: 'UNVERIFIED', source: 'Sampling needed', date: '-', status: 'Pending' }
    ]
  }
];

export const mockMaterialFlows: MaterialFlowItem[] = [
  { id: 'f1', sourceMaterial: 'Fly Ash (5,000 t)', pathway: 'Cementitious', destination: 'Ultratech Cement (Nagpur)', tonnes: 4200, color: '#14b8a6' },
  { id: 'f2', sourceMaterial: 'Fly Ash (5,000 t)', pathway: 'Blocks', destination: 'EcoBricks Ltd (Wardha)', tonnes: 2100, color: '#0d9488' },
  { id: 'f3', sourceMaterial: 'Blast Furnace Slag (3,200 t)', pathway: 'Road Construction', destination: 'NH-44 Infra Project', tonnes: 2800, color: '#f59e0b' },
  { id: 'f4', sourceMaterial: 'Mine Waste (4,250 t)', pathway: 'Mine Filling', destination: 'Backfill Shaft #4', tonnes: 1700, color: '#3b82f6' },
  { id: 'f5', sourceMaterial: 'Remaining Material', pathway: 'Disposal / Storage', destination: 'Regulated Ash Pond 2', tonnes: 1650, color: '#64748b' }
];

export const mockBottlenecks: Bottleneck[] = [
  {
    id: 'b1',
    title: 'Processing Capacity',
    facility: 'Grinding Unit G-01',
    utilization: 96,
    status: 'critical',
    description: 'High throughput volume approaching maximum mechanical limit of 500 t/day.'
  },
  {
    id: 'b2',
    title: 'Destination Capacity',
    facility: 'Cement Plant C-01',
    utilization: 82,
    status: 'warning',
    description: 'Silo 4 storage space limited; delivery window requires coordination.'
  },
  {
    id: 'b3',
    title: 'Evidence Gap',
    facility: 'Mine Waste Overburden',
    utilization: 3,
    status: 'info',
    description: '3 material properties require accredited ICP-MS lab verification.'
  },
  {
    id: 'b4',
    title: 'Transport Logistics',
    facility: 'Nagpur-Bhilai Corridor',
    utilization: 64,
    status: 'info',
    description: 'Within configured fleet & distance limits (184 kmavg).'
  }
];

export const mockCandidatePathways: CandidatePathway[] = [
  {
    id: 'pw-1',
    name: 'Cementitious Application',
    materialId: 'FA-001',
    materialName: 'Fly Ash',
    status: 'DIRECT',
    technicalFeasible: true,
    processingRequired: false,
    evidenceVerified: true,
    propertyChecks: [
      { property: 'SiO₂', observed: '54.2%', requirement: '> 35.0%', status: 'PASS' },
      { property: 'LOI', observed: '2.1%', requirement: '< 5.0%', status: 'PASS' },
      { property: 'Moisture', observed: '3.4%', requirement: '< 5.0%', status: 'PASS' },
      { property: 'Fineness', observed: '92%', requirement: '> 80%', status: 'PASS' }
    ]
  },
  {
    id: 'pw-2',
    name: 'Fly Ash Concrete Blocks',
    materialId: 'FA-001',
    materialName: 'Fly Ash',
    status: 'DIRECT',
    technicalFeasible: true,
    processingRequired: false,
    evidenceVerified: true,
    propertyChecks: [
      { property: 'SiO₂ + Al₂O₃', observed: '82.3%', requirement: '> 70.0%', status: 'PASS' },
      { property: 'CaO', observed: '4.8%', requirement: '< 10.0%', status: 'PASS' },
      { property: 'LOI', observed: '2.1%', requirement: '< 6.0%', status: 'PASS' }
    ]
  },
  {
    id: 'pw-3',
    name: 'Road Sub-base Construction',
    materialId: 'FA-001',
    materialName: 'Fly Ash',
    status: 'PROCESS',
    technicalFeasible: true,
    processingRequired: true,
    processingDetails: 'Drying / Mechanical Screening to clear coarse fractions > 2mm',
    evidenceVerified: true,
    propertyChecks: [
      { property: 'Particle Size', observed: '22 µm', requirement: 'Uniform aggregate grad', status: 'WARNING' },
      { property: 'Moisture', observed: '3.4%', requirement: '< 2.0% target', status: 'WARNING' },
      { property: 'Compaction Test', observed: '1.8 g/cc', requirement: '> 1.95 g/cc', status: 'FAIL' }
    ],
    unlokRequirement: {
      type: 'PROCESSING',
      description: 'Requires rotary drying and vibrating screen separation at Grinding Unit G-01.',
      actionNeeded: 'Schedule Processing Unit G-01'
    }
  },
  {
    id: 'pw-4',
    name: 'Mine Backfill & Stabilization',
    materialId: 'FA-001',
    materialName: 'Fly Ash',
    status: 'UNKNOWN',
    technicalFeasible: false,
    processingRequired: false,
    evidenceVerified: false,
    propertyChecks: [
      { property: 'Heavy Metals Leaching', observed: 'Not Tested', requirement: 'TCLP Compliance Standard', status: 'MISSING' },
      { property: 'Sulfate Content (SO₃)', observed: '0.9%', requirement: '< 0.5%', status: 'FAIL' }
    ],
    unlokRequirement: {
      type: 'EVIDENCE',
      description: 'Leaching assay report is absent from property evidence registry.',
      actionNeeded: 'Upload Laboratory TCLP Certificate'
    }
  }
];

export const mockNodes: NodeLocation[] = [
  { id: 'n1', name: 'Nagpur Thermal Power Plant', type: 'SOURCE', coordinates: [79.0882, 21.1458], address: 'Nagpur Industrial Area, MH', capacity: '5,000 t/mo' },
  { id: 'n2', name: 'Grinding & Drying Unit G-01', type: 'PROCESSING', coordinates: [79.8321, 21.1892], address: 'Bhandara Road, MH', capacity: '500 t/day (96% utilized)' },
  { id: 'n3', name: 'Ultratech Cement Plant C-01', type: 'DESTINATION', coordinates: [81.3856, 21.1938], address: 'Bhilai Suburb, CG', capacity: '10,000 t demand' },
  { id: 'n4', name: 'NH-44 Infra Construction Sector 4', type: 'DESTINATION', coordinates: [79.4000, 20.8000], address: 'Nagpur South Highway', capacity: '4,000 t demand' },
  { id: 'n5', name: 'Regulated Ash Pond #2', type: 'DISPOSAL', coordinates: [78.9500, 21.2500], address: 'Nagpur Outskirts', capacity: 'Storage Reserve' }
];

export const mockNetworkRoutes: NetworkRoute[] = [
  {
    id: 'rt-101',
    sourceId: 'n1',
    sourceName: 'Nagpur Thermal Power Plant',
    processingId: 'n2',
    processingName: 'Grinding & Drying Unit G-01',
    destinationId: 'n3',
    destinationName: 'Ultratech Cement Plant C-01',
    materialId: 'FA-001',
    materialName: 'Fly Ash (FA-001)',
    quantity: 1200,
    distanceKm: 184,
    transportCost: 3.42,
    processingCost: 1.12,
    yieldPercentage: 94,
    residualTonnes: 72,
    technicallyFeasible: true,
    capacityAvailable: true,
    demandAvailable: true,
    routeCoordinates: [
      [79.0882, 21.1458],
      [79.8321, 21.1892],
      [81.3856, 21.1938]
    ],
    status: 'OPTIMAL'
  },
  {
    id: 'rt-102',
    sourceId: 'n1',
    sourceName: 'Nagpur Thermal Power Plant',
    destinationId: 'n4',
    destinationName: 'NH-44 Infra Construction Sector 4',
    materialId: 'FA-001',
    materialName: 'Fly Ash (FA-001)',
    quantity: 2100,
    distanceKm: 68,
    transportCost: 1.15,
    processingCost: 0,
    yieldPercentage: 100,
    residualTonnes: 0,
    technicallyFeasible: true,
    capacityAvailable: true,
    demandAvailable: true,
    routeCoordinates: [
      [79.0882, 21.1458],
      [79.4000, 20.8000]
    ],
    status: 'FEASIBLE'
  }
];

export const mockOptimizationRun = {
  id: 'RUN-2026-0928',
  timestamp: '2026-09-28 14:42',
  status: 'SOLVED' as const,
  divertedTonnes: 9820,
  divertedPercentage: 78.9,
  netCostLakhs: 8.42,
  emissionsDeltaTonnes: -1284,
  solverTimeMs: 342
};

export const mockAllocations = [
  { 
    id: 'al-1', 
    materialId: 'FA-001', 
    materialName: 'Fly Ash', 
    sourceId: 'n1',
    sourceName: 'Nagpur Thermal Power Plant',
    destinationId: 'n3',
    destinationName: 'Ultratech Cement Plant C-01',
    destination: 'Ultratech Cement Plant C-01', 
    pathwayId: 'pw-1',
    pathwayName: 'Cementitious Application',
    pathway: 'Cementitious Application', 
    processingFacility: 'Direct / Dry Handling',
    quantityTonnes: 3000,
    quantity: 3000, 
    netCostLakhs: 3.6,
    transportCostLakhs: 2.8,
    processingCostLakhs: 0.8,
    residualTonnes: 0,
    technicalStatus: 'Feasible',
    decisionReason: 'Optimal transport corridor cost and low moisture composition',
    unitCost: 120, 
    totalCost: 3.6, 
    emissionsSaved: 420, 
    status: 'OPTIMAL' 
  },
  { 
    id: 'al-2', 
    materialId: 'FA-001', 
    materialName: 'Fly Ash', 
    sourceId: 'n1',
    sourceName: 'Nagpur Thermal Power Plant',
    destinationId: 'n4',
    destinationName: 'EcoBricks Ltd (Wardha)',
    destination: 'EcoBricks Ltd (Wardha)', 
    pathwayId: 'pw-2',
    pathwayName: 'Fly Ash Concrete Blocks',
    pathway: 'Fly Ash Concrete Blocks', 
    processingFacility: 'Direct / Dry Handling',
    quantityTonnes: 2000,
    quantity: 2000, 
    netCostLakhs: 1.8,
    transportCostLakhs: 1.5,
    processingCostLakhs: 0.3,
    residualTonnes: 0,
    technicalStatus: 'Feasible',
    decisionReason: 'Proximity to Wardha block manufacturing unit',
    unitCost: 90, 
    totalCost: 1.8, 
    emissionsSaved: 280, 
    status: 'OPTIMAL' 
  }
];

export const mockImpactRecord = {
  id: 'REC-2026-IMP-01',
  optimizationRunId: 'RUN-2026-0928',
  systemBoundary: 'Cradle-to-Grave Gate',
  emissionFactorsVersion: 'IPCC 2026 AR6 Standard',
  waterfallData: [
    { name: 'Baseline Disposal Cost', type: 'COST' as const, value: 24.5 },
    { name: 'Haulage & Fleet Transport', type: 'COST' as const, value: -3.42 },
    { name: 'Rotary Screening & Processing', type: 'COST' as const, value: -1.12 },
    { name: 'Virgin Clinker Offset Savings', type: 'SAVING' as const, value: 11.54 },
    { name: 'Optimized Net Cost', type: 'NET' as const, value: 8.42 }
  ],
  baselineDisposalCostLakhs: 24.5,
  optimizedNetCostLakhs: 8.42,
  costSavingsLakhs: 16.08,
  virginMaterialOffsetTonnes: 9820,
  co2EmissionsAvoidedTonnes: 1284,
  landfillVolumeSavedM3: 7420,
  waterSavedKL: 18500,
  communityJobsSupported: 34,
  circularityScore: 84.5
};

export const mockDecisionActions = [
  { 
    id: 'dec-1', 
    title: 'Dispatch 3,000t Fly Ash to Ultratech Cement', 
    type: 'DISPATCH', 
    impact: '+3,000t Diverted', 
    urgency: 'HIGH' as const, 
    status: 'PENDING' as const, 
    rationale: 'High demand at destination; optimal transport corridor balance.',
    sourceMaterial: 'Fly Ash (FA-001)',
    destinationFacility: 'Ultratech Cement Plant C-01',
    tonnes: 3000,
    whyFeasible: ['SiO2 composition matches cement standard (>35%)', 'Moisture level within 3.4% limit'],
    whyCapacity: ['Cement Plant C-01 silo capacity available (10,000 t max)'],
    whyPortfolio: ['Lowest transport cost per tonne on Nagpur corridor']
  },
  { 
    id: 'dec-2', 
    title: 'Authorize Processing Unit G-01 Rotary Screen', 
    type: 'PROCESSING', 
    impact: '+1,200t Feasible', 
    urgency: 'MEDIUM' as const, 
    status: 'PENDING' as const, 
    rationale: 'Clears particle size bottleneck for Mine Waste road sub-base usage.',
    sourceMaterial: 'Mine Waste (MW-003)',
    destinationFacility: 'Grinding & Drying Unit G-01',
    tonnes: 1200,
    whyFeasible: ['Pre-treatment clears oversized fraction >2mm'],
    whyCapacity: ['Unit G-01 has 4% remaining daily capacity'],
    whyPortfolio: ['Unlocks high-volume road sub-base pathway']
  }
];

export const mockAlternativeDecisions = [
  { 
    id: 'alt-1', 
    title: 'Reroute 1,000t Fly Ash to Road Sub-base', 
    tradeoff: 'Lower transport cost, slightly higher residual waste', 
    netCostDelta: -0.45, 
    emissionsDelta: +12,
    route: 'Nagpur -> Sector 4 Highway',
    rejectReason: 'Road sub-base compaction requirement fails without processing'
  },
  { 
    id: 'alt-2', 
    title: 'Hold Mine Waste for TCLP Assay', 
    tradeoff: 'Delays dispatch by 3 days, ensures 100% evidence compliance', 
    netCostDelta: +0.20, 
    emissionsDelta: 0,
    route: 'Balaghat Open Pit -> Lab Assay',
    rejectReason: 'Pond holding capacity limit reached'
  }
];

export const mockUnlockRequirements = [
  { 
    id: 'unl-1', 
    materialId: 'RP-005', 
    materialName: 'Red Mud / Bauxite Residue', 
    missingProperty: 'Alkalinity Neutralization', 
    actionRequired: 'Submit Dewatering & pH Treatment Plan', 
    potentialDivertedTonnes: 2200,
    route: 'Renukoot Refinery -> EcoBricks',
    reasonText: 'pH level 11.8 exceeds alkaline limit of 9.0',
    unlockActionText: 'Run carbonation neutralizer unit'
  },
  { 
    id: 'unl-2', 
    materialId: 'MW-003', 
    materialName: 'Mine Waste / Overburden', 
    missingProperty: 'ICP-MS Heavy Metals', 
    actionRequired: 'Upload Accredited Lab Test Assay', 
    potentialDivertedTonnes: 1550,
    route: 'Balaghat Pit -> Mine Backfill',
    reasonText: 'Heavy metals trace assay certificate missing',
    unlockActionText: 'Request Geolab MP-104 express assay'
  }
];

