from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from ..core.database import Base


class OptimizationRun(Base):
    """
    Historical Optimization Run Ledger (Member 2).
    Tracks executed optimization runs, allocations, and key performance metrics.
    """
    __tablename__ = "optimization_runs"

    id = Column(String(64), primary_key=True, index=True)
    scenario_mode = Column(String(64), nullable=False, default="COST_MINIMIZATION")
    total_input_tonnes = Column(Float, nullable=False)
    diverted_tonnes = Column(Float, nullable=False)
    disposed_tonnes = Column(Float, nullable=False)
    residual_tonnes = Column(Float, nullable=False, default=0.0)
    diversion_rate_pct = Column(Float, nullable=False)
    net_cost = Column(Float, nullable=False)
    solver_status = Column(String(64), nullable=False)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
