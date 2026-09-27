import pytest


def test_api_optimize_basic_run(client):
    """Test POST /api/optimize with seeded FA-001 material"""
    payload = {
        "material_id": "FA-001",
        "scenario": {
            "mode": "COST_MINIMIZATION",
            "name": "Standard Cost Min",
            "cost_weight": 1.0,
            "diversion_weight": 0.0,
        },
        "transport_mode": "TRUCK_DIESEL",
    }
    res = client.post("/api/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["status"] in ["OPTIMAL", "FEASIBLE"]
    assert "summary" in data
    assert data["summary"]["total_input_tonnes"] == 1850.0
    assert data["summary"]["mass_balance_verified"] is True
    assert isinstance(data["allocations"], list)
    assert len(data["allocations"]) > 0

    # Verify Member 3 contract is present
    assert "member3_ledger_input" in data
    assert data["member3_ledger_input"]["scenario_mode"] == "COST_MINIMIZATION"

    # Verify Frontend contracts are present
    assert "frontend_sankey_flows" in data
    assert "frontend_network_routes" in data


def test_api_optimize_scenarios_list(client):
    """Test GET /api/optimize/scenarios returns presets"""
    res = client.get("/api/optimize/scenarios")
    assert res.status_code == 200
    presets = res.json()
    assert len(presets) >= 4
    modes = [p["mode"] for p in presets]
    assert "COST_MINIMIZATION" in modes
    assert "MAX_DIVERSION" in modes
    assert "BALANCED" in modes
    assert "CUSTOM" in modes


def test_api_optimize_compare_scenarios(client):
    """Test POST /api/optimize/compare-scenarios returns comparative analysis"""
    payload = {
        "material_id": "FA-001",
    }
    res = client.post("/api/optimize/compare-scenarios", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) == 3
    modes = [s["scenario_mode"] for s in data["scenarios"]]
    assert "COST_MINIMIZATION" in modes
    assert "BALANCED" in modes
    assert "MAX_DIVERSION" in modes


def test_api_facilities_crud(client):
    """Test GET and POST /api/facilities"""
    # 1. List seeded facilities
    get_res = client.get("/api/facilities")
    assert get_res.status_code == 200
    facs = get_res.json()
    assert len(facs) >= 3

    # 2. Create new facility
    new_fac = {
        "id": "FAC-TEST-NEW",
        "name": "Test Milling Unit",
        "process_types": "GRINDING",
        "capacity_tonnes": 500.0,
        "processing_cost_per_ton": 14.0,
        "processing_yield": 0.96,
        "location_name": "Test Park",
        "latitude": 20.0,
        "longitude": 75.0,
    }
    post_res = client.post("/api/facilities", json=new_fac)
    assert post_res.status_code == 201
    assert post_res.json()["id"] == "FAC-TEST-NEW"

    # Duplicate create -> 409 Conflict
    dup_res = client.post("/api/facilities", json=new_fac)
    assert dup_res.status_code == 409

    # Get single facility
    single_res = client.get("/api/facilities/FAC-TEST-NEW")
    assert single_res.status_code == 200
    assert single_res.json()["name"] == "Test Milling Unit"

    # Non-existent -> 404
    nf_res = client.get("/api/facilities/DOES_NOT_EXIST")
    assert nf_res.status_code == 404


def test_api_destinations_crud(client):
    """Test GET and POST /api/destinations"""
    get_res = client.get("/api/destinations")
    assert get_res.status_code == 200
    dests = get_res.json()
    assert len(dests) >= 4

    new_dest = {
        "id": "DEST-TEST-NEW",
        "name": "Test Paver Plant",
        "pathway_id": "BLOCKS_BRICKS",
        "max_demand_tonnes": 1200.0,
        "purchase_price_per_ton": 25.0,
        "location_name": "Industrial Area B",
        "latitude": 20.5,
        "longitude": 76.5,
    }
    post_res = client.post("/api/destinations", json=new_dest)
    assert post_res.status_code == 201
    assert post_res.json()["id"] == "DEST-TEST-NEW"

    # Single
    s_res = client.get("/api/destinations/DEST-TEST-NEW")
    assert s_res.status_code == 200

    # 404
    nf_res = client.get("/api/destinations/DOES_NOT_EXIST")
    assert nf_res.status_code == 404


def test_api_disposal_sites_crud(client):
    """Test GET and POST /api/disposal-sites"""
    get_res = client.get("/api/disposal-sites")
    assert get_res.status_code == 200
    sites = get_res.json()
    assert len(sites) >= 2

    new_site = {
        "id": "DISP-TEST-NEW",
        "name": "North Engineered Landfill",
        "disposal_type": "LANDFILL",
        "gate_fee_per_ton": 80.0,
        "capacity_tonnes": 500000.0,
        "location_name": "North Outskirts",
        "latitude": 22.0,
        "longitude": 78.0,
    }
    post_res = client.post("/api/disposal-sites", json=new_site)
    assert post_res.status_code == 201
    assert post_res.json()["id"] == "DISP-TEST-NEW"


def test_api_input_validation_negative_quantity(client):
    """Test that invalid negative quantities are cleanly rejected with HTTP 422"""
    invalid_payload = {
        "custom_materials": [
            {
                "id": "MAT-BAD",
                "name": "Bad Material",
                "quantity_tonnes": -100.0,  # Negative!
                "location_name": "Site X",
                "latitude": 20.0,
                "longitude": 75.0,
            }
        ]
    }
    res = client.post("/api/optimize", json=invalid_payload)
    assert res.status_code == 422


def test_api_empty_request_graceful_handling(client):
    """Test empty request with no active materials handles cleanly without crashing"""
    empty_payload = {
        "material_ids": ["DOES_NOT_EXIST"],
    }
    res = client.post("/api/optimize", json=empty_payload)
    assert res.status_code == 200
    assert res.json()["summary"]["total_input_tonnes"] == 0.0
