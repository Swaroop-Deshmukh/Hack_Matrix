import math
from typing import Optional
from ..schemas.optimizer import TransportMode
from ..core.config import settings

EARTH_RADIUS_KM = 6371.0
DEFAULT_ROAD_DETOUR_FACTOR = 1.2

# Default commercial freight tariff rates ($/tonne-km)
DEFAULT_TRANSPORT_RATES = {
    TransportMode.TRUCK_DIESEL: 0.10,
    TransportMode.RAIL_FREIGHT: 0.04,
    TransportMode.TRUCK_ELECTRIC: 0.08,
}


def calculate_haversine_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    detour_factor: float = DEFAULT_ROAD_DETOUR_FACTOR
) -> float:
    """
    Computes great-circle geographical distance between two coordinate pairs
    with realistic overland routing circuitous/detour multiplier.
    Returns distance in kilometers.
    """
    if lat1 == lat2 and lon1 == lon2:
        return 0.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    direct_km = EARTH_RADIUS_KM * c

    return round(direct_km * detour_factor, 2)


def calculate_transport_cost(
    tonnes: float,
    distance_km: float,
    mode: TransportMode = TransportMode.TRUCK_DIESEL,
    custom_rate: Optional[float] = None
) -> float:
    """
    Calculates total transport cost in currency:
    Cost = Tonnes * Distance (km) * Unit Rate (currency/tonne-km)
    """
    if tonnes <= 0.0 or distance_km <= 0.0:
        return 0.0

    rate = custom_rate if custom_rate is not None and custom_rate > 0 else DEFAULT_TRANSPORT_RATES.get(mode, 0.10)
    return round(tonnes * distance_km * rate, 2)


def get_transport_emission_factor(mode: TransportMode) -> float:
    """
    Exposes transport emission benchmark factors (kg CO2e / ton-km) for Member 3 ledger linkage.
    """
    if mode == TransportMode.RAIL_FREIGHT:
        return settings.RAIL_FREIGHT_EMISSION_FACTOR
    elif mode == TransportMode.TRUCK_ELECTRIC:
        return settings.TRUCK_ELECTRIC_EMISSION_FACTOR
    return settings.TRUCK_DIESEL_EMISSION_FACTOR
