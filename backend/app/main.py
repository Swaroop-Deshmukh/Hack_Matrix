from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import Base, engine, SessionLocal
from .seed.seed_data import seed_database
from .api.materials import router as materials_router
from .api.pathways import router as pathways_router
from .api.feasibility import router as feasibility_router
from .api.optimizer import (
    router as optimizer_router,
    facilities_router,
    destinations_router,
    disposal_router,
)
from .api.impact import router as impact_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed baseline demonstration data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="RE:FLOW-X — Circular Resource Optimization & Decision Engine",
    description="Material Intelligence, Deterministic Feasibility, Pre-treatment Matrix, and OR-Tools CP-SAT Allocation Engine (Members 1 & 2 Modules)",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes mounted at /api prefix as specified
app.include_router(materials_router, prefix="/api")
app.include_router(pathways_router, prefix="/api")
app.include_router(feasibility_router, prefix="/api")
app.include_router(optimizer_router, prefix="/api")
app.include_router(facilities_router, prefix="/api")
app.include_router(destinations_router, prefix="/api")
app.include_router(disposal_router, prefix="/api")
app.include_router(impact_router, prefix="/api")


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "modules": [
            "Member 1: Material Intelligence & Feasibility Engine",
            "Member 2: Processing, Transport & Allocation Optimizer",
        ],
        "version": "2.0.0",
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "platform": "RE:FLOW-X",
        "modules": "Member 1 (Material Feasibility) + Member 2 (Allocation Optimizer)",
        "docs": "/docs",
        "api_materials": "/api/materials",
        "api_pathways": "/api/pathways",
        "api_feasibility": "/api/feasibility/check",
        "api_optimize": "/api/optimize",
        "api_facilities": "/api/facilities",
        "api_destinations": "/api/destinations",
        "api_disposal": "/api/disposal-sites",
    }
