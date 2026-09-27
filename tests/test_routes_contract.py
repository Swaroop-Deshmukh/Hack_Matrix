import pytest
from backend.app.engine.routes import get_feasible_routes


def test_shared_contract_format_and_stability(db_session):
    """
    Validates the exact shared contract structure consumed by Member 2:
    Return list of:
    {
      "pathway_id": "...",
      "status": "...",
      "required_processing": [...]
    }
    """
    routes = get_feasible_routes("FA-001", db=db_session)
    assert isinstance(routes, list)
    assert len(routes) >= 4

    cement_route = next((r for r in routes if r["pathway_id"] == "CEMENTITIOUS"), None)
    assert cement_route is not None
    assert cement_route["status"] == "DIRECT"
    assert isinstance(cement_route["required_processing"], list)
    assert len(cement_route["required_processing"]) == 0

    # FA-002 requires processing
    routes_fa002 = get_feasible_routes("FA-002", db=db_session)
    cement_fa002 = next((r for r in routes_fa002 if r["pathway_id"] == "CEMENTITIOUS"), None)
    assert cement_fa002 is not None
    assert cement_fa002["status"] == "PROCESS"
    assert "DRYING" in cement_fa002["required_processing"]
    assert "GRINDING" in cement_fa002["required_processing"]
