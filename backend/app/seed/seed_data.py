from datetime import date, datetime
from sqlalchemy.orm import Session
from ..core.database import SessionLocal, Base, engine
from ..models.material import Material
from ..models.property import MaterialProperty
from ..models.pathway import Pathway
from ..models.requirement import PathwayRequirement
from ..models.standard import StandardMetadata
from ..models.evidence import EvidenceType
from ..models.facility import Facility
from ..models.destination import Destination
from ..models.disposal import DisposalSite


def seed_database(db: Session = None):
    """
    Seeds database with initial demonstration standards, pathways, requirements, and materials.
    Demonstrates DIRECT, PROCESS, UNKNOWN, and FAIL feasibility states.
    All demonstration values are explicitly labeled.
    """
    close_db = False
    if db is None:
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        # 1. STANDARDS METADATA
        standards_data = [
            StandardMetadata(
                id="ASTM_C618",
                name="ASTM C618: Standard Specification for Coal Fly Ash and Raw/Calcined Natural Pozzolan",
                organization="ASTM International",
                version="2023",
                description="Technical specification for mineral admixtures in concrete.",
                is_synthetic_demo=False,
                source_reference="ASTM C618-23 / Section 4-7",
                disclaimer="Technical screening benchmark. Not official regulatory certification."
            ),
            StandardMetadata(
                id="EN_450_1",
                name="EN 450-1: Fly Ash for Concrete - Definitions, Specifications and Conformity Criteria",
                organization="CEN (European Committee for Standardization)",
                version="2012",
                description="European durability criteria for fly ash pozzolanic activity in concrete.",
                is_synthetic_demo=False,
                source_reference="EN 450-1:2012 / Clauses 5.2-5.4",
                disclaimer="Technical screening benchmark. Not official regulatory certification."
            ),
            StandardMetadata(
                id="IRC_SP20",
                name="IRC SP-20: Rural Roads Manual / Waste Material Utilization",
                organization="Indian Roads Congress",
                version="2022",
                description="Guidelines for utilization of industrial fly ash and slag in road sub-bases.",
                is_synthetic_demo=False,
                source_reference="IRC SP:20-2022 / Section 400",
                disclaimer="Technical screening benchmark. Not official regulatory certification."
            ),
            StandardMetadata(
                id="SYNTHETIC_DEMO_REQUIREMENT",
                name="RE:FLOW-X Synthetic Demonstration Engineering Benchmark",
                organization="RE:FLOW-X Consortium",
                version="DEMO-2026.1",
                description="Simulated threshold parameters used strictly for platform validation and testing.",
                is_synthetic_demo=True,
                source_reference="Internal Engineering Simulation Dataset",
                disclaimer="SYNTHETIC DEMONSTRATION DATA ONLY. Not an official engineering standard."
            ),
        ]

        for s in standards_data:
            if not db.query(StandardMetadata).filter(StandardMetadata.id == s.id).first():
                db.add(s)
        db.commit()

        # 2. REUSE PATHWAYS (Seed at least: CEMENTITIOUS, BLOCKS_BRICKS, ROAD_INFRASTRUCTURE, MINE_FILL)
        pathways_data = [
            Pathway(
                id="CEMENTITIOUS",
                name="Supplementary Cementitious Material (SCM) in Concrete",
                description="Direct pozzolanic replacement of Portland cement in ready-mix concrete and structural mortars.",
                sector="CONSTRUCTION",
                min_readiness_score=0.85,
                is_active=True
            ),
            Pathway(
                id="BLOCKS_BRICKS",
                name="Engineered Masonry Units, Autoclaved Bricks & Hollow Precast",
                description="Mineral binder and fine aggregate substitution in non-structural masonry blocks and paving units.",
                sector="CONSTRUCTION",
                min_readiness_score=0.70,
                is_active=True
            ),
            Pathway(
                id="ROAD_INFRASTRUCTURE",
                name="Road Sub-base, Embankment Fill & Soil Stabilization",
                description="Bulk structural filling and engineered subgrade stabilization in highway corridors.",
                sector="INFRASTRUCTURE",
                min_readiness_score=0.75,
                is_active=True
            ),
            Pathway(
                id="MINE_FILL",
                name="Underground Mine Void Fill & Paste Backfill",
                description="Engineered paste backfill and hydraulic void stabilization in underground mining excavations.",
                sector="MINING",
                min_readiness_score=0.65,
                is_active=True
            ),
        ]

        for p in pathways_data:
            if not db.query(Pathway).filter(Pathway.id == p.id).first():
                db.add(p)
        db.commit()

        # 3. PATHWAY REQUIREMENTS
        requirements_data = [
            # CEMENTITIOUS Requirements
            PathwayRequirement(
                pathway_id="CEMENTITIOUS",
                property_name="SiO2",
                operator="GTE",
                threshold_value=35.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="LAB_VERIFIED",
                standard_id="ASTM_C618",
                standard_version="2023",
                clause_reference="Table 1",
            ),
            PathwayRequirement(
                pathway_id="CEMENTITIOUS",
                property_name="SO3",
                operator="LTE",
                threshold_value=5.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="LAB_VERIFIED",
                standard_id="ASTM_C618",
                standard_version="2023",
                clause_reference="Table 1 - Sulfate limits",
            ),
            PathwayRequirement(
                pathway_id="CEMENTITIOUS",
                property_name="LOI",
                operator="LTE",
                threshold_value=5.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="LAB_VERIFIED",
                standard_id="ASTM_C618",
                standard_version="2023",
                clause_reference="Table 1 - Loss on ignition",
                processing_remedy="ELECTROSTATIC_SEPARATION",
                remedy_description="Electrostatic carbon separation to reduce unburnt carbon (LOI) to <= 5.0%"
            ),
            PathwayRequirement(
                pathway_id="CEMENTITIOUS",
                property_name="moisture",
                operator="LTE",
                threshold_value=3.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="LAB_VERIFIED",
                standard_id="EN_450_1",
                standard_version="2012",
                clause_reference="Clause 5.3.2",
                processing_remedy="DRYING",
                remedy_description="Rotary thermal drying to reduce moisture to <= 3.0%"
            ),
            PathwayRequirement(
                pathway_id="CEMENTITIOUS",
                property_name="chloride",
                operator="LTE",
                threshold_value=0.10,
                unit="%",
                requirement_type="HARD",
                required_evidence="LAB_VERIFIED",
                standard_id="EN_450_1",
                standard_version="2012",
                clause_reference="Clause 5.2.8",
                processing_remedy="WASHING",
                remedy_description="Aqueous washing / de-chlorination process"
            ),
            PathwayRequirement(
                pathway_id="CEMENTITIOUS",
                property_name="fineness",
                operator="LTE",
                threshold_value=34.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="LAB_VERIFIED",
                standard_id="ASTM_C618",
                standard_version="2023",
                clause_reference="Section 5 - 45um wet sieve retention",
                processing_remedy="GRINDING",
                remedy_description="Ball mill grinding / air classification to achieve sieve retention <= 34%"
            ),

            # BLOCKS_BRICKS Requirements
            PathwayRequirement(
                pathway_id="BLOCKS_BRICKS",
                property_name="SiO2",
                operator="GTE",
                threshold_value=30.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="SOURCE_BASED",
                standard_id="SYNTHETIC_DEMO_REQUIREMENT",
                standard_version="DEMO-2026.1",
                clause_reference="Demo Spec B-1",
            ),
            PathwayRequirement(
                pathway_id="BLOCKS_BRICKS",
                property_name="moisture",
                operator="LTE",
                threshold_value=12.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="SOURCE_BASED",
                standard_id="SYNTHETIC_DEMO_REQUIREMENT",
                standard_version="DEMO-2026.1",
                clause_reference="Demo Spec B-2",
                processing_remedy="DRYING",
                remedy_description="Mechanical dewatering or aeration to reduce moisture <= 12%"
            ),
            PathwayRequirement(
                pathway_id="BLOCKS_BRICKS",
                property_name="LOI",
                operator="LTE",
                threshold_value=10.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="SOURCE_BASED",
                standard_id="SYNTHETIC_DEMO_REQUIREMENT",
                standard_version="DEMO-2026.1",
                clause_reference="Demo Spec B-3",
            ),

            # ROAD_INFRASTRUCTURE Requirements
            PathwayRequirement(
                pathway_id="ROAD_INFRASTRUCTURE",
                property_name="bulk_density",
                operator="GTE",
                threshold_value=1.1,
                unit="g/cm3",
                requirement_type="HARD",
                required_evidence="OBSERVED",
                standard_id="IRC_SP20",
                standard_version="2022",
                clause_reference="Clause 4.1",
            ),
            PathwayRequirement(
                pathway_id="ROAD_INFRASTRUCTURE",
                property_name="moisture",
                operator="LTE",
                threshold_value=15.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="OBSERVED",
                standard_id="IRC_SP20",
                standard_version="2022",
                clause_reference="Clause 4.3",
                processing_remedy="DRYING",
                remedy_description="Solar drying or stockpile aeration to achieve optimum compaction moisture <= 15%"
            ),
            PathwayRequirement(
                pathway_id="ROAD_INFRASTRUCTURE",
                property_name="SO3",
                operator="LTE",
                threshold_value=8.0,
                unit="%",
                requirement_type="HARD",
                required_evidence="SOURCE_BASED",
                standard_id="IRC_SP20",
                standard_version="2022",
                clause_reference="Clause 4.5",
            ),

            # MINE_FILL Requirements
            PathwayRequirement(
                pathway_id="MINE_FILL",
                property_name="bulk_density",
                operator="GTE",
                threshold_value=1.0,
                unit="g/cm3",
                requirement_type="HARD",
                required_evidence="ASSUMED",
                standard_id="SYNTHETIC_DEMO_REQUIREMENT",
                standard_version="DEMO-2026.1",
                clause_reference="Demo Spec M-1",
            ),
            PathwayRequirement(
                pathway_id="MINE_FILL",
                property_name="arsenic",
                operator="LTE",
                threshold_value=50.0,
                unit="ppm",
                requirement_type="HARD",
                required_evidence="LAB_VERIFIED",
                standard_id="SYNTHETIC_DEMO_REQUIREMENT",
                standard_version="DEMO-2026.1",
                clause_reference="Demo Spec M-2 Environmental Leachate",
            ),
        ]

        for req in requirements_data:
            existing = (
                db.query(PathwayRequirement)
                .filter(
                    PathwayRequirement.pathway_id == req.pathway_id,
                    PathwayRequirement.property_name == req.property_name,
                )
                .first()
            )
            if not existing:
                db.add(req)
        db.commit()

        # 4. MATERIALS & PROPERTIES (FA-001, FA-002, SL-001, MW-001)

        # FA-001: Demonstrates DIRECT on CEMENTITIOUS
        fa001 = Material(
            id="FA-001",
            material_type="FLY_ASH",
            material_name="Dry Silo Coal Fly Ash (Class F)",
            quantity_tonnes=1850.0,
            location_name="NTPC Thermal Power Station, Solapur",
            latitude=17.6599,
            longitude=75.9064,
            availability_start=date(2026, 1, 1),
            availability_end=date(2026, 12, 31),
            source_name="Pulverized Coal Boiler Unit 3",
            description="Premium dry collection fly ash compliant with ASTM C618 Class F."
        )
        if not db.query(Material).filter(Material.id == "FA-001").first():
            db.add(fa001)
            db.commit()

            fa001_props = [
                MaterialProperty(material_id="FA-001", property_name="SiO2", value=53.4, unit="%", test_date=date(2026, 2, 10), evidence_type="LAB_VERIFIED", source="SGS Analytical Labs", confidence=0.98),
                MaterialProperty(material_id="FA-001", property_name="SO3", value=0.75, unit="%", test_date=date(2026, 2, 10), evidence_type="LAB_VERIFIED", source="SGS Analytical Labs", confidence=0.98),
                MaterialProperty(material_id="FA-001", property_name="LOI", value=2.4, unit="%", test_date=date(2026, 2, 10), evidence_type="LAB_VERIFIED", source="SGS Analytical Labs", confidence=0.95),
                MaterialProperty(material_id="FA-001", property_name="moisture", value=1.2, unit="%", test_date=date(2026, 2, 10), evidence_type="LAB_VERIFIED", source="SGS Analytical Labs", confidence=0.99),
                MaterialProperty(material_id="FA-001", property_name="chloride", value=0.02, unit="%", test_date=date(2026, 2, 10), evidence_type="LAB_VERIFIED", source="SGS Analytical Labs", confidence=0.95),
                MaterialProperty(material_id="FA-001", property_name="fineness", value=22.0, unit="%", test_date=date(2026, 2, 10), evidence_type="LAB_VERIFIED", source="SGS Analytical Labs", confidence=0.96),
                MaterialProperty(material_id="FA-001", property_name="bulk_density", value=1.22, unit="g/cm3", test_date=date(2026, 2, 10), evidence_type="OBSERVED", source="Site In-situ Measurement", confidence=0.90),
                MaterialProperty(material_id="FA-001", property_name="arsenic", value=8.5, unit="ppm", test_date=date(2026, 2, 10), evidence_type="LAB_VERIFIED", source="SGS Analytical Labs", confidence=0.95),
            ]
            db.add_all(fa001_props)
            db.commit()

        # FA-002: Demonstrates PROCESS on CEMENTITIOUS (Moisture=8.5% fails <=3%, Fineness=41% fails <=34%, both have remedies DRYING & GRINDING!)
        fa002 = Material(
            id="FA-002",
            material_type="FLY_ASH",
            material_name="Pond Wet Ash / Coarse Fraction",
            quantity_tonnes=3200.0,
            location_name="Koradi Ash Lagoon Basin",
            latitude=21.2483,
            longitude=79.0989,
            availability_start=date(2026, 1, 15),
            availability_end=date(2026, 12, 31),
            source_name="Ash Pond Lagoon Slurry Dredge",
            description="Wet reclaimed ash requiring thermal drying and milling to restore fineness."
        )
        if not db.query(Material).filter(Material.id == "FA-002").first():
            db.add(fa002)
            db.commit()

            fa002_props = [
                MaterialProperty(material_id="FA-002", property_name="SiO2", value=49.1, unit="%", test_date=date(2026, 1, 20), evidence_type="LAB_VERIFIED", source="GeoTech Testing Corp", confidence=0.95),
                MaterialProperty(material_id="FA-002", property_name="SO3", value=1.1, unit="%", test_date=date(2026, 1, 20), evidence_type="LAB_VERIFIED", source="GeoTech Testing Corp", confidence=0.95),
                MaterialProperty(material_id="FA-002", property_name="LOI", value=3.8, unit="%", test_date=date(2026, 1, 20), evidence_type="LAB_VERIFIED", source="GeoTech Testing Corp", confidence=0.92),
                MaterialProperty(material_id="FA-002", property_name="moisture", value=8.5, unit="%", test_date=date(2026, 1, 20), evidence_type="LAB_VERIFIED", source="GeoTech Testing Corp", confidence=0.99, notes="Fails direct limit 3.0%; unlockable via Rotary Drying"),
                MaterialProperty(material_id="FA-002", property_name="chloride", value=0.03, unit="%", test_date=date(2026, 1, 20), evidence_type="LAB_VERIFIED", source="GeoTech Testing Corp", confidence=0.95),
                MaterialProperty(material_id="FA-002", property_name="fineness", value=41.0, unit="%", test_date=date(2026, 1, 20), evidence_type="LAB_VERIFIED", source="GeoTech Testing Corp", confidence=0.94, notes="Fails direct limit 34.0%; unlockable via Grinding"),
                MaterialProperty(material_id="FA-002", property_name="bulk_density", value=1.35, unit="g/cm3", test_date=date(2026, 1, 20), evidence_type="OBSERVED", source="Dredge Site Meter", confidence=0.88),
                MaterialProperty(material_id="FA-002", property_name="arsenic", value=14.0, unit="ppm", test_date=date(2026, 1, 20), evidence_type="LAB_VERIFIED", source="GeoTech Testing Corp", confidence=0.93),
            ]
            db.add_all(fa002_props)
            db.commit()

        # SL-001: Demonstrates UNKNOWN on CEMENTITIOUS (Missing mandatory chloride and SO3 tests!)
        sl001 = Material(
            id="SL-001",
            material_type="SLAG",
            material_name="Granulated Blast Furnace Slag (Uncertified Batch)",
            quantity_tonnes=2500.0,
            location_name="Jindal Steel Complex, Bellary",
            latitude=15.1394,
            longitude=76.9214,
            availability_start=date(2026, 3, 1),
            availability_end=date(2026, 10, 31),
            source_name="Blast Furnace 4 Runner Granulator",
            description="Rapidly water-quenched glassy slag. Chemical assay incomplete pending laboratory release."
        )
        if not db.query(Material).filter(Material.id == "SL-001").first():
            db.add(sl001)
            db.commit()

            sl001_props = [
                MaterialProperty(material_id="SL-001", property_name="SiO2", value=36.8, unit="%", test_date=date(2026, 3, 5), evidence_type="LAB_VERIFIED", source="Plant XRF QA/QC", confidence=0.97),
                MaterialProperty(material_id="SL-001", property_name="moisture", value=1.8, unit="%", test_date=date(2026, 3, 5), evidence_type="OBSERVED", source="Warehouse Moisture Sensor", confidence=0.90),
                MaterialProperty(material_id="SL-001", property_name="bulk_density", value=1.18, unit="g/cm3", test_date=date(2026, 3, 5), evidence_type="OBSERVED", source="Scale Silo", confidence=0.92),
                # Note: SO3, chloride, LOI, and fineness are purposefully MISSING to demonstrate UNKNOWN status!
            ]
            db.add_all(sl001_props)
            db.commit()

        # MW-001: Demonstrates FAIL on CEMENTITIOUS & MINE_FILL (Severe arsenic=210 ppm > 50 ppm, SO3=15.2% > 5.0%, no remedy -> FAIL!)
        mw001 = Material(
            id="MW-001",
            material_type="MINE_WASTE",
            material_name="Sulfide Flotation Tailings Sludge",
            quantity_tonnes=4500.0,
            location_name="Zawar Lead-Zinc Processing Mill",
            latitude=24.3562,
            longitude=73.7144,
            availability_start=date(2026, 2, 1),
            availability_end=date(2026, 12, 31),
            source_name="Froth Flotation Reject Discharge",
            description="Pyrite-rich tailing rejects with high leachable heavy metals and sulfate content."
        )
        if not db.query(Material).filter(Material.id == "MW-001").first():
            db.add(mw001)
            db.commit()

            mw001_props = [
                MaterialProperty(material_id="MW-001", property_name="SiO2", value=22.4, unit="%", test_date=date(2026, 2, 15), evidence_type="LAB_VERIFIED", source="Bureau Veritas Minerals", confidence=0.98),
                MaterialProperty(material_id="MW-001", property_name="SO3", value=15.2, unit="%", test_date=date(2026, 2, 15), evidence_type="LAB_VERIFIED", source="Bureau Veritas Minerals", confidence=0.98, notes="Severe sulfate violation; no configured processing remedy"),
                MaterialProperty(material_id="MW-001", property_name="LOI", value=14.0, unit="%", test_date=date(2026, 2, 15), evidence_type="LAB_VERIFIED", source="Bureau Veritas Minerals", confidence=0.95),
                MaterialProperty(material_id="MW-001", property_name="moisture", value=18.0, unit="%", test_date=date(2026, 2, 15), evidence_type="LAB_VERIFIED", source="Bureau Veritas Minerals", confidence=0.99),
                MaterialProperty(material_id="MW-001", property_name="bulk_density", value=1.45, unit="g/cm3", test_date=date(2026, 2, 15), evidence_type="OBSERVED", source="Slurry Density Profiler", confidence=0.92),
                MaterialProperty(material_id="MW-001", property_name="arsenic", value=210.0, unit="ppm", test_date=date(2026, 2, 15), evidence_type="LAB_VERIFIED", source="Bureau Veritas Minerals", confidence=0.99, notes="Breaches toxic threshold (50 ppm) by 160 ppm!"),
            ]
            db.add_all(mw001_props)
            db.commit()

        # 5. MEMBER 2: PROCESSING FACILITIES
        facilities_data = [
            Facility(
                id="FAC-G01",
                name="Grinding & Rotary Drying Unit G-01",
                process_types="DRYING,GRINDING",
                capacity_tonnes=2500.0,
                processing_cost_per_ton=12.50,
                processing_yield=0.94,
                energy_kwh_per_ton=38.0,
                emissions_factor_kg_co2e_per_ton=16.5,
                location_name="Bhandara Road Industrial Zone, Nagpur, MH",
                latitude=21.1892,
                longitude=79.8321,
                is_active=True,
                description="High-throughput ball mill and thermal rotary drying circuit for reclaimed pond ash.",
            ),
            Facility(
                id="FAC-W01",
                name="Aqueous Dechlorination & Washing Unit W-02",
                process_types="WASHING,DEWATERING",
                capacity_tonnes=1800.0,
                processing_cost_per_ton=18.00,
                processing_yield=0.92,
                energy_kwh_per_ton=28.0,
                emissions_factor_kg_co2e_per_ton=12.0,
                location_name="Butibori MIDC, Nagpur, MH",
                latitude=20.9167,
                longitude=79.0000,
                is_active=True,
                description="Counter-current hydraulic washing for chloride and soluble salt removal.",
            ),
            Facility(
                id="FAC-ES01",
                name="Electrostatic Carbon Separator Unit ES-01",
                process_types="ELECTROSTATIC_SEPARATION",
                capacity_tonnes=1500.0,
                processing_cost_per_ton=22.00,
                processing_yield=0.88,
                energy_kwh_per_ton=45.0,
                emissions_factor_kg_co2e_per_ton=19.5,
                location_name="Chandrapur Industrial Cluster, MH",
                latitude=19.9615,
                longitude=79.2961,
                is_active=True,
                description="Triboelectric electrostatic separator to extract unburnt carbon from high-LOI ash.",
            ),
        ]
        for f in facilities_data:
            if not db.query(Facility).filter(Facility.id == f.id).first():
                db.add(f)
        db.commit()

        # 6. MEMBER 2: REUSE DESTINATIONS / OFFTAKERS
        destinations_data = [
            Destination(
                id="DEST-CEM-01",
                name="Ultratech Cement Plant C-01",
                pathway_id="CEMENTITIOUS",
                max_demand_tonnes=2500.0,
                min_demand_tonnes=0.0,
                purchase_price_per_ton=32.00,
                location_name="Bhilai Suburb Cement Hub, CG",
                latitude=21.1938,
                longitude=81.3856,
                is_active=True,
                description="Major cement plant accepting Class F fly ash as supplementary cementitious material.",
            ),
            Destination(
                id="DEST-BLK-01",
                name="EcoBricks Infrastructure Precast Yard",
                pathway_id="BLOCKS_BRICKS",
                max_demand_tonnes=2000.0,
                min_demand_tonnes=0.0,
                purchase_price_per_ton=22.00,
                location_name="Wardha Industrial Estate, MH",
                latitude=20.7453,
                longitude=78.6022,
                is_active=True,
                description="Automated precast masonry block and paver manufacturing facility.",
            ),
            Destination(
                id="DEST-ROAD-01",
                name="NH-44 Highway Expansion Sector 4",
                pathway_id="ROAD_INFRASTRUCTURE",
                max_demand_tonnes=3500.0,
                min_demand_tonnes=0.0,
                purchase_price_per_ton=14.00,
                location_name="Nagpur South Highway Corridor, MH",
                latitude=20.8000,
                longitude=79.4000,
                is_active=True,
                description="National highway embankment and subgrade construction corridor.",
            ),
            Destination(
                id="DEST-MINE-01",
                name="Underground Paste Backfill Shaft #4",
                pathway_id="MINE_FILL",
                max_demand_tonnes=1500.0,
                min_demand_tonnes=0.0,
                purchase_price_per_ton=10.00,
                location_name="Western Coalfields Void Basin, MH",
                latitude=20.5000,
                longitude=79.1000,
                is_active=True,
                description="Hydraulic void backfill and paste stabilization shaft.",
            ),
        ]
        for d in destinations_data:
            if not db.query(Destination).filter(Destination.id == d.id).first():
                db.add(d)
        db.commit()

        # 7. MEMBER 2: BASELINE DISPOSAL SITES
        disposal_sites_data = [
            DisposalSite(
                id="DISP-ASH-01",
                name="Regulated Industrial Ash Pond Lagoon #2",
                disposal_type="ASH_POND",
                gate_fee_per_ton=65.0,
                capacity_tonnes=100000.0,
                location_name="Koradi Ash Lagoon Basin Outskirts, MH",
                latitude=21.2500,
                longitude=78.9500,
                is_active=True,
                description="Permitted slurry ash storage reservoir with baseline environmental surveillance.",
            ),
            DisposalSite(
                id="DISP-LANDFILL-01",
                name="Central Sanitary Industrial Landfill",
                disposal_type="LANDFILL",
                gate_fee_per_ton=75.0,
                capacity_tonnes=250000.0,
                location_name="Nagpur Regional Engineered Landfill, MH",
                latitude=21.1000,
                longitude=79.0500,
                is_active=True,
                description="Engineered municipal/industrial non-hazardous solid waste landfill with leachate collection.",
            ),
        ]
        for s in disposal_sites_data:
            if not db.query(DisposalSite).filter(DisposalSite.id == s.id).first():
                db.add(s)
        db.commit()

        print("[Seed] RE:FLOW-X Members 1 & 2 Seed Database initialization complete.")
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_database()
