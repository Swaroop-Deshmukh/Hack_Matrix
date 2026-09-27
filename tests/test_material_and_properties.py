from datetime import date
import pytest
from backend.app.models.material import Material
from backend.app.models.property import MaterialProperty


def test_create_and_retrieve_material(db_session):
    mat = Material(
        id="TEST-MAT-01",
        material_type="FLY_ASH",
        material_name="Test Silo Fly Ash",
        quantity_tonnes=500.0,
        location_name="Plant Site A",
        latitude=18.5204,
        longitude=73.8567,
        source_name="Boiler 1",
    )
    db_session.add(mat)
    db_session.commit()

    retrieved = db_session.query(Material).filter(Material.id == "TEST-MAT-01").first()
    assert retrieved is not None
    assert retrieved.material_name == "Test Silo Fly Ash"
    assert retrieved.quantity_tonnes == 500.0


def test_material_property_association(db_session):
    mat = Material(
        id="TEST-MAT-02",
        material_type="SLAG",
        material_name="Test Slag",
        quantity_tonnes=1000.0,
        location_name="Smelter B",
        latitude=19.0,
        longitude=74.0,
        source_name="Furnace",
    )
    db_session.add(mat)
    db_session.commit()

    prop1 = MaterialProperty(
        material_id="TEST-MAT-02",
        property_name="SiO2",
        value=38.5,
        unit="%",
        evidence_type="LAB_VERIFIED",
        confidence=0.95,
    )
    prop2 = MaterialProperty(
        material_id="TEST-MAT-02",
        property_name="moisture",
        value=2.1,
        unit="%",
        evidence_type="OBSERVED",
        confidence=0.90,
    )
    db_session.add_all([prop1, prop2])
    db_session.commit()

    retrieved = db_session.query(Material).filter(Material.id == "TEST-MAT-02").first()
    assert len(retrieved.properties) == 2
    prop_names = [p.property_name for p in retrieved.properties]
    assert "SiO2" in prop_names
    assert "moisture" in prop_names


def test_missing_properties_handled_gracefully(db_session):
    # Material created with NO properties
    mat = Material(
        id="TEST-BARE-03",
        material_type="MINE_WASTE",
        material_name="Bare Tailing",
        quantity_tonnes=200.0,
        location_name="Mine C",
        latitude=20.0,
        longitude=75.0,
        source_name="Shaft",
    )
    db_session.add(mat)
    db_session.commit()

    retrieved = db_session.query(Material).filter(Material.id == "TEST-BARE-03").first()
    assert len(retrieved.properties) == 0
