# RE:FLOW-X — Member 2: Processing, Transport & Allocation Optimization Module

## 🎯 Executive Overview

The **Processing, Transport & Allocation Optimizer** is the mathematical core of RE:FLOW-X. It takes raw industrial byproduct streams, consumes technical and environmental feasibility decisions from **Member 1 (Material Feasibility Engine)**, routes materials through pre-treatment beneficiation facilities when necessary, accounts for transport logistics, and determines the cost-optimal or diversion-optimal mass allocation across candidate reuse destinations and baseline disposal.

---

## 📐 Mathematical Formulation

### 1. Sets and Indices
* $i \in I$: Byproduct/waste streams (e.g. $FA\text{-}001$, $FA\text{-}002$, $SL\text{-}001$, $MW\text{-}001$) with available quantity $M_i$ [tonnes] and origin location $(lat_i, lon_i)$.
* $j \in J$: Reuse offtakers/destinations (e.g. Cement plants, block manufacturing yards, road construction projects) with pathway $pw_j$, maximum demand $C_j$ [tonnes], purchase price $R_j$ [$/tonne], and destination location $(lat_j, lon_j)$.
* $p \in P$: Processing/beneficiation facilities (e.g. rotary thermal drying, ball mill grinding, electrostatic carbon separation) with supported remedy processes $Proc_p$, throughput capacity $K_p$ [tonnes], unit operating cost $U_p$ [$/tonne], yield $\eta_p \in (0, 1]$, and location $(lat_p, lon_p)$.
* $d \in D$: Baseline disposal facilities (engineered landfill, ash pond) with gate fee $G_d$ [$/tonne], capacity $C_d$, and location $(lat_d, lon_d)$.

---

### 2. Decision Variables
* $x^{direct}_{i,j} \ge 0$: Mass of waste stream $i$ routed directly to reuse destination $j$ without processing [tonnes].
* $x^{proc}_{i,p,j} \ge 0$: Raw mass of waste stream $i$ routed to facility $p$ for beneficiation destined for offtaker $j$ [tonnes].
* $x^{disp}_{i,d} \ge 0$: Mass of waste stream $i$ sent directly to baseline disposal site $d$ [tonnes].

---

### 3. Mass Balance Conservation Law (Step 5 & Step 19)

Strict conservation of mass is enforced across every stream:
$$\sum_{j \in J_{direct}} x^{direct}_{i,j} + \sum_{(p,j) \in R_{proc}} x^{proc}_{i,p,j} + \sum_{d \in D} x^{disp}_{i,d} = M_i \quad \forall i \in I$$

#### Delivered Output vs. Processing Residuals:
For any material processed through facility $p$:
* **Delivered to Buyer**: $Q^{delivered}_{i,p,j} = x^{proc}_{i,p,j} \times \eta_p$
* **Processing Loss / Residual**: $Q^{residual}_{i,p} = x^{proc}_{i,p,j} \times (1 - \eta_p)$

#### Universal Mass Verification:
$$\text{Total Available Input} = \text{Total Delivered Reuse} + \text{Total Processing Residuals} + \text{Total Baseline Disposal}$$
$$\left| \sum M_i - \left( \sum Q^{delivered} + \sum Q^{residual} + \sum x^{disp} \right) \right| < 10^{-3} \text{ tonnes}$$

---

### 4. Feasibility Constraints (Step 6)

The optimizer directly consumes Member 1's `get_feasible_routes(material_id, db)`:
* **`DIRECT`**: Pathway meets all mandatory physical/chemical thresholds. Direct route variable $x^{direct}_{i,j}$ is enabled ($\eta = 1.0$, $U_p = 0$).
* **`PROCESS`**: Pathway has addressable property gaps with configured remedies $Rem_i$. Only processed route variables $x^{proc}_{i,p,j}$ where $Rem_i \subseteq Proc_p$ are enabled.
* **`UNKNOWN`**: Material has missing properties or unverified laboratory evidence. Ineligible for reuse ($x_{i,j} = 0$).
* **`FAIL`**: Material violates hard contaminant thresholds (e.g. excessive arsenic or heavy metal leaching) with no remedy. Strictly banned from circular reuse ($x_{i,j} = 0$).

---

### 5. Capacity & Logistics Constraints

* **Destination Maximum Offtake Capacity**:
  $$\sum_i x^{direct}_{i,j} + \sum_{i,p} \left( x^{proc}_{i,p,j} \times \eta_p \right) \le C_j \quad \forall j \in J$$

* **Processing Facility Throughput Capacity**:
  $$\sum_{i,j} x^{proc}_{i,p,j} \le K_p \quad \forall p \in P$$

* **Baseline Disposal Capacity**:
  $$\sum_i x^{disp}_{i,d} + \sum_{i,p,j} \left( x^{proc}_{i,p,j} \times (1 - \eta_p) \right) \le C_d \quad \forall d \in D$$

---

### 6. Objective Functions & Scenarios (Step 11, 13)

The optimizer supports four distinct scenario policies:

$$\min \quad \text{Total Transport Cost} + \text{Total Processing Cost} + \text{Total Disposal Cost} - \text{Total Offtake Revenue} + \text{Scenario Adjustment}$$

1. **`COST_MINIMIZATION`**:
   Minimizes net economic cost without artificial diversion bonuses.
2. **`MAX_DIVERSION`**:
   Introduces an explicit circular economy diversion credit ($W_{div} > 0$) per ton diverted, prioritizing landfill diversion even when marginal logistics cost is slightly positive.
3. **`BALANCED`**:
   Multi-objective Pareto trade-off balancing freight economics with circular diversion targets.
4. **`CUSTOM`**:
   Allows user-defined transport distance ceilings ($d_{max}$), custom tariffs, and custom penalty coefficients.

---

## 🔌 Integration Contracts

### Member 3 Contract (Economic & Environmental Dual-Ledger)
Member 2 **does NOT** compute final avoided greenhouse gas emissions (preventing double counting). Instead, it outputs a clean physical ledger for Member 3:
```json
{
  "run_id": "M3-LEDGER-1758920192",
  "scenario_mode": "COST_MINIMIZATION",
  "baseline_disposal": {
    "total_baseline_tonnes": 1850.0,
    "disposal_type": "LANDFILL",
    "default_gate_fee_usd_per_ton": 75.0,
    "baseline_emission_factor_kg_co2e_per_ton": 480.0
  },
  "reuse_allocations": [
    {
      "allocation_id": "DIR_FA-001_DEST-CEM-01",
      "material_id": "FA-001",
      "pathway_id": "CEMENTITIOUS",
      "destination_id": "DEST-CEM-01",
      "input_tonnes": 1850.0,
      "delivered_tonnes": 1850.0,
      "virgin_displacement_ratio": 1.0,
      "transport_distance_km": 184.2,
      "transport_mode": "TRUCK_DIESEL",
      "transport_emission_factor_kg_co2e_per_tkm": 0.092,
      "processing_required": false
    }
  ],
  "disposal_allocations": [],
  "processing_residuals": [],
  "economic_ledger": {
    "transport_cost": 34105.0,
    "processing_cost": 0.0,
    "disposal_cost": 0.0,
    "revenue": 59200.0,
    "net_cost": -25095.0
  }
}
```

### Member 4 Contract (Frontend Decision Platform UI)
Member 2 provides direct JSON data formatted for UI components:
* `frontend_sankey_flows`: Flow items with source, pathway, destination, tonnes, and palette colors.
* `frontend_network_routes`: Multi-segment coordinate arrays `[source, facility?, destination]` for MapLibre GIS routing.
* `bottlenecks`: Utilization indicators with `critical`, `warning`, and `info` status for decision dashboard alerts.

---

## 🚀 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/optimize` | Executes allocation optimization with selected solver and scenario. |
| `GET` | `/api/optimize/scenarios` | Lists available scenario presets and weights. |
| `POST` | `/api/optimize/compare-scenarios` | Runs multiple scenarios concurrently for comparative trade-off analysis. |
| `GET` / `POST` | `/api/facilities` | Lists and registers processing beneficiation facilities. |
| `GET` / `POST` | `/api/destinations` | Lists and registers reuse destinations and buyer demand. |
| `GET` / `POST` | `/api/disposal-sites` | Lists and registers baseline disposal sites. |
