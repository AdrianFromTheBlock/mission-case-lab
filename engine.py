"""Nonprofit OAS numerical contract.

Missing stays None, never zero. Do not change formulas to match a story.
The fixture in cli.py and test_nonprofit.py is the acceptance check.
"""

from __future__ import annotations

import math
from typing import Mapping, Optional, Sequence

FUNCTION_WEIGHTS = {
    "effectiveness": 0.25,
    "efficiency": 0.20,
    "reliability": 0.15,
    "resilience": 0.20,
    "adaptability": 0.10,
    "control_and_integrity": 0.10,
}

HUMAN_WEIGHTS = {
    "capability_adequacy": 0.15,
    "resource_adequacy": 0.15,
    "objective_alignment": 0.15,
    "communication": 0.10,
    "relationships": 0.10,
    "coordination": 0.10,
    "adaptability": 0.10,
    "sustainability": 0.15,
}

# Board-level objective weights for a nonprofit. Not the product-sales set.
MISSION_OBJECTIVE_WEIGHTS = {
    "mission_reach": 0.30,
    "beneficiary_access": 0.20,
    "unrestricted_stability": 0.20,
    "governance_integrity": 0.15,
    "restriction_compliance": 0.10,
    "continuity": 0.05,
}


def health(
    scores: Mapping[str, Optional[float]],
    weights: Mapping[str, float],
    applicable: Optional[Sequence[str]] = None,
) -> dict:
    keys = sorted(applicable if applicable is not None else weights.keys())
    assessed = [k for k in keys if scores.get(k) is not None]
    total = sum(weights.get(k, 0.0) for k in keys)
    known = sum(weights.get(k, 0.0) for k in assessed)
    score = (
        sum(weights.get(k, 0.0) * float(scores[k]) for k in assessed) / known
        if known
        else None
    )
    coverage = (100.0 * known / total) if total else None
    return {
        "score": score,
        "coverage": coverage,
        "provisional": coverage is None or coverage < 70,
    }


def band(score: Optional[float]) -> str:
    if score is None:
        return "Unknown"
    if score >= 90:
        return "Exceptional"
    if score >= 75:
        return "Healthy"
    if score >= 50:
        return "Adequate"
    if score >= 25:
        return "Vulnerable"
    return "Severe"


def readiness(c: Optional[float], o: Optional[float], m: Optional[float]) -> dict:
    vals = [c, o, m]
    if any(v is None for v in vals):
        hi = 1.0
        for v in vals:
            hi *= 1.0 if v is None else v
        return {"point": None, "range": (0.0, hi), "conditional": True}
    point = float(c) * float(o) * float(m)
    return {"point": point, "range": (point, point), "conditional": True}


def system_status(conditions: Sequence[Mapping], provisional: bool = False) -> str:
    if any(c.get("critical") and c.get("status") == "fail" for c in conditions):
        return "critical"
    if any(c.get("critical") and c.get("status") == "unknown" for c in conditions):
        return "unresolved"
    if any(c.get("status") in ("watch", "fail") for c in conditions):
        return "at_risk"
    if not conditions or provisional or any(c.get("status") == "unknown" for c in conditions):
        return "provisional"
    return "no_flag_detected"


def serial_capacity(demand: Optional[float], capacities: Mapping[str, Optional[float]]) -> dict:
    items = {"demand": demand, **capacities}
    known = [(k, v) for k, v in items.items() if v is not None]
    bound = min(v for _, v in known) if known else None
    complete = all(v is not None for v in items.values()) and len(capacities) > 0
    return {
        "throughput": bound if complete else None,
        "upper_bound": bound,
        "binding": sorted(k for k, v in known if v == bound) if complete else [],
        "missing": sorted(k for k, v in items.items() if v is None),
    }


def _js_round(n: float) -> int:
    if n >= 0:
        return int(math.floor(n + 0.5))
    return int(math.ceil(n - 0.5))


def round6(n: float) -> float:
    return _js_round(n * 1e6) / 1e6


def service_realization(
    base: float,
    increment: float,
    demand: float,
    realization: float,
    contribution: float,
    recurring: float,
) -> dict:
    before = min(base, demand)
    after = min(demand, round6(base + increment * realization))
    incremental = round6((after - before) * contribution - recurring)
    break_even_units = math.ceil(recurring / contribution - 1e-9) if contribution > 0 else None
    potential = min(increment, max(demand - base, 0))
    fraction = (
        recurring / (increment * contribution)
        if increment > 0 and contribution > 0 and potential * contribution >= recurring
        else None
    )
    return {
        "baseline": before,
        "throughput": after,
        "incremental": incremental,
        "break_even_units": break_even_units,
        "break_even_realization": fraction,
    }


def gate(
    prohibited: bool = False,
    refer: bool = False,
    mandatory: bool = False,
    blocked: bool = False,
    needs_evidence: bool = False,
) -> str:
    if prohibited:
        return "prohibited"
    if refer:
        return "refer"
    if mandatory:
        return "mandatory"
    if blocked:
        return "blocked"
    if needs_evidence:
        return "needs_evidence"
    return "eligible"


def sequence(prerequisites: Mapping[str, Sequence[str]]) -> list:
    pending = {k: set(v) for k, v in prerequisites.items()}
    result = []
    guard = len(pending) + 2
    for _ in range(guard):
        if not pending:
            break
        ready = sorted(k for k, deps in pending.items() if not deps)
        if not ready:
            raise ValueError("prerequisite cycle")
        result.extend(ready)
        for k in ready:
            del pending[k]
        for deps in pending.values():
            for k in ready:
                deps.discard(k)
    return result
