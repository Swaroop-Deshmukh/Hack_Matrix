from typing import Optional, Tuple


def evaluate_operator(
    observed_val: float,
    operator: str,
    threshold: float,
    upper_threshold: Optional[float] = None
) -> Tuple[bool, Optional[float]]:
    """
    Evaluates a numerical property against a threshold operator.
    Returns:
        (is_passed, near_miss_difference)
        near_miss_difference is > 0 when violated, indicating how far off the observation is.
    """
    op = operator.upper()

    if op == "LT":
        passed = observed_val < threshold
        diff = max(0.0, observed_val - threshold) if not passed else 0.0
        return passed, round(diff, 4)

    elif op == "LTE":
        passed = observed_val <= threshold
        diff = max(0.0, observed_val - threshold) if not passed else 0.0
        return passed, round(diff, 4)

    elif op == "EQ":
        passed = abs(observed_val - threshold) < 1e-5
        diff = abs(observed_val - threshold) if not passed else 0.0
        return passed, round(diff, 4)

    elif op == "GTE":
        passed = observed_val >= threshold
        diff = max(0.0, threshold - observed_val) if not passed else 0.0
        return passed, round(diff, 4)

    elif op == "GT":
        passed = observed_val > threshold
        diff = max(0.0, threshold - observed_val) if not passed else 0.0
        return passed, round(diff, 4)

    elif op == "BETWEEN":
        if upper_threshold is None:
            upper_threshold = threshold
        lower = min(threshold, upper_threshold)
        upper = max(threshold, upper_threshold)
        passed = lower <= observed_val <= upper
        if passed:
            diff = 0.0
        elif observed_val < lower:
            diff = lower - observed_val
        else:
            diff = observed_val - upper
        return passed, round(diff, 4)

    raise ValueError(f"Unsupported operator: {operator}")
