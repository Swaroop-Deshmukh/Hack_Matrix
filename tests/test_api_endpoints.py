import pytest


def test_api_health_and_root(client):
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"

    root_res = client.get("/")
    assert root_res.status_code == 200
    assert "RE:FLOW-X" in root_res.json()["platform"]


def test_api_materials_crud(client):
    # 1. Create
    payload = {
        "id": "API-TEST-01",
        "material_type": "FLY_ASH",
        "material_name": "API Created Fly Ash",
        "quantity_tonnes": 800.0,
        "location_name": "Terminal A",
        "latitude": 18.5,
        "longitude": 73.8,
        "source_name": "Boiler 2",
    }
    create_res = client.post("/api/materials", json=payload)
    assert create_res.status_code == 201
    assert create_res.json()["id"] == "API-TEST-01"

    # Duplicate create -> 409 Conflict
    dup_res = client.post("/api/materials", json=payload)
    assert dup_res.status_code == 409

    # 2. Get list with filter
    list_res = client.get("/api/materials?material_type=FLY_ASH")
    assert list_res.status_code == 200
    ids = [m["id"] for m in list_res.json()]
    assert "API-TEST-01" in ids

    # 3. Get single
    get_res = client.get("/api/materials/API-TEST-01")
    assert get_res.status_code == 200
    assert get_res.json()["material_name"] == "API Created Fly Ash"

    # Single not found -> 404
    nf_res = client.get("/api/materials/DOES_NOT_EXIST")
    assert nf_res.status_code == 404

    # 4. Patch
    patch_res = client.patch("/api/materials/API-TEST-01", json={"quantity_tonnes": 950.0})
    assert patch_res.status_code == 200
    assert patch_res.json()["quantity_tonnes"] == 950.0

    # Patch not found -> 404
    patch_nf = client.patch("/api/materials/DOES_NOT_EXIST", json={"quantity_tonnes": 100.0})
    assert patch_nf.status_code == 404

    # 5. Delete
    del_res = client.delete("/api/materials/API-TEST-01")
    assert del_res.status_code == 204

    # Delete not found -> 404
    del_nf = client.delete("/api/materials/DOES_NOT_EXIST")
    assert del_nf.status_code == 404


def test_api_material_properties(client):
    # Add property to seeded FA-001
    prop_payload = {
        "property_name": "loss_on_ignition",
        "value": 1.9,
        "unit": "%",
        "evidence_type": "LAB_VERIFIED",
        "confidence": 0.99
    }
    res = client.post("/api/materials/FA-001/properties", json=prop_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["property_name"] == "loss_on_ignition"
    assert data["value"] == 1.9

    # Post property for non-existent material -> 404
    prop_nf = client.post("/api/materials/DOES_NOT_EXIST/properties", json=prop_payload)
    assert prop_nf.status_code == 404

    # Retrieve all properties
    get_res = client.get("/api/materials/FA-001/properties")
    assert get_res.status_code == 200
    props = get_res.json()
    assert len(props) >= 5

    # Get properties for non-existent material -> 404
    get_nf = client.get("/api/materials/DOES_NOT_EXIST/properties")
    assert get_nf.status_code == 404


def test_api_pathways(client):
    res = client.get("/api/pathways")
    assert res.status_code == 200
    pathways = res.json()
    assert len(pathways) >= 4

    single_res = client.get("/api/pathways/CEMENTITIOUS")
    assert single_res.status_code == 200
    assert single_res.json()["id"] == "CEMENTITIOUS"

    # Pathway not found -> 404
    pw_nf = client.get("/api/pathways/DOES_NOT_EXIST")
    assert pw_nf.status_code == 404

    req_res = client.get("/api/pathways/CEMENTITIOUS/requirements")
    assert req_res.status_code == 200
    reqs = req_res.json()
    assert len(reqs) >= 4

    # Requirements for non-existent pathway -> 404
    req_nf = client.get("/api/pathways/DOES_NOT_EXIST/requirements")
    assert req_nf.status_code == 404


def test_api_feasibility_check(client):
    # 1. Single pathway check for FA-001
    res = client.post("/api/feasibility/check", json={"material_id": "FA-001", "pathway_id": "CEMENTITIOUS"})
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["status"] == "DIRECT"

    # Check for invalid material -> 404
    mat_nf = client.post("/api/feasibility/check", json={"material_id": "DOES_NOT_EXIST", "pathway_id": "CEMENTITIOUS"})
    assert mat_nf.status_code == 404

    # Check for invalid pathway -> 404
    pw_nf = client.post("/api/feasibility/check", json={"material_id": "FA-001", "pathway_id": "DOES_NOT_EXIST"})
    assert pw_nf.status_code == 404

    # 2. All pathways check for FA-002
    res_fa002 = client.get("/api/feasibility/FA-002")
    assert res_fa002.status_code == 200
    fa002_data = res_fa002.json()
    assert len(fa002_data) >= 4

    # GET feasibility for invalid material -> 404
    get_mat_nf = client.get("/api/feasibility/DOES_NOT_EXIST")
    assert get_mat_nf.status_code == 404

    # 3. Bulk check
    bulk_res = client.post("/api/feasibility/bulk-check", json={"material_ids": ["FA-001", "MW-001", "DOES_NOT_EXIST"]})
    assert bulk_res.status_code == 200
    bulk_data = bulk_res.json()
    assert len(bulk_data) == 2  # Missing ID is cleanly skipped
