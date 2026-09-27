from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import Base, engine, SessionLocal
from .seed.seed_data import seed_database
from .api.materials import router as materials_router
from .api.pathways import router as pathways_router
from .api.feasibility import router as feasibility_router


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
    title="RE:FLOW-X — Material Intelligence & Feasibility Engine",
    description="Deterministic Feasibility Engine, Material Passports, and Evidence Rigor Screening (Member 1 Module)",
    version="1.0.0",
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


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "module": "Member 1: Material Intelligence & Feasibility Engine",
        "version": "1.0.0",
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "platform": "RE:FLOW-X",
        "module": "Member 1: Material Intelligence & Feasibility Engine",
        "docs": "/docs",
        "api_materials": "/api/materials",
        "api_pathways": "/api/pathways",
        "api_feasibility": "/api/feasibility/check",
    }
