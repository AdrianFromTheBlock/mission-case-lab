"""Run the synthetic nonprofit case. No install. From this folder:

    python cli.py
    python -m unittest test_nonprofit.py -v
"""

from catalog import DISCOVERY, FUNCTIONS, NORTH_RIVER, PARTIAL_SCORES, PARTIES
from engine import (
    FUNCTION_WEIGHTS,
    MISSION_OBJECTIVE_WEIGHTS,
    band,
    gate,
    health,
    readiness,
    sequence,
    serial_capacity,
    service_realization,
    system_status,
)


def report() -> str:
    case = NORTH_RIVER
    h = health(PARTIAL_SCORES, FUNCTION_WEIGHTS)
    empty = health({}, FUNCTION_WEIGHTS)
    r = readiness(case["readiness"]["capability"], case["readiness"]["opportunity"], case["readiness"]["motivation"])
    r_unknown = readiness(0.9, 0.2, None)
    cap = serial_capacity(
        case["capacities"]["demand"],
        {k: v for k, v in case["capacities"].items() if k != "demand"},
    )
    sc = case["scenario"]
    scen = service_realization(
        sc["base"], sc["increment"], sc["demand"], sc["default_realization"], sc["contribution"], sc["recurring"]
    )
    zero = service_realization(sc["base"], sc["increment"], sc["demand"], 0, sc["contribution"], sc["recurring"])
    conditions_ok = [
        {"critical": True, "status": "pass", "label": "Unrestricted cash can meet payroll"},
        {"critical": True, "status": "pass", "label": "Restricted funds used only for purpose"},
        {"critical": True, "status": "pass", "label": "No recorded immediate harm"},
        {"critical": False, "status": "watch", "label": "Shared driver is the only route"},
    ]
    status_watch = system_status(conditions_ok, h["provisional"])
    status_payroll = system_status(
        [{**conditions_ok[0], "status": "fail"}] + conditions_ok[1:], h["provisional"]
    )
    status_empty = system_status(
        [
            {"critical": True, "status": "unknown"},
            {"critical": True, "status": "unknown"},
            {"critical": True, "status": "unknown"},
        ],
        True,
    )
    plan = sequence({"automate": ["reconcile"], "reconcile": []})
    lines = [
        f"{case['name']} — {case['label']}",
        case["protected_objective"],
        "",
        "Objective weights (nonprofit, not product-sales):",
    ]
    for name, w in MISSION_OBJECTIVE_WEIGHTS.items():
        lines.append(f"  {name}: {w:.0%}")
    lines += [
        "",
        f"Health (effectiveness only): {h['score']:.1f}  {band(h['score'])}",
        f"Coverage: {h['coverage']:.1f}%  provisional={h['provisional']}",
        f"Empty case health: {empty['score']}  coverage={empty['coverage']}",
        f"Readiness C×O×M: {r['point']:.3f}",
        f"Motivation unknown: point={r_unknown['point']} range={r_unknown['range'][0]:.3f}–{r_unknown['range'][1]:.3f}",
        f"Serial capacity binds at {', '.join(cap['binding'])}; throughput {cap['throughput']}",
        f"Scenario at 70%: encounters {scen['throughput']:.0f}; unrestricted net {scen['incremental']:.0f}",
        f"Break-even {scen['break_even_units']} encounters ({scen['break_even_realization'] * 100:.1f}% of added capacity)",
        f"At 0% realization, unrestricted net {zero['incremental']:.0f}",
        f"Status with thin evidence and a watch: {status_watch}",
        f"Status if payroll fails: {status_payroll}",
        f"Empty-case status: {status_empty}",
        f"Gate, grant spent on payroll: {gate(prohibited=True, mandatory=True)}",
        f"Prerequisite order: {' → '.join(plan)}",
        "",
        "Parties:",
    ]
    for p in PARTIES:
        lines.append(f"  {p['title']}: {p['detail']}")
    lines.append("")
    lines.append("Functions (mission name — do not score the sales name):")
    for f in FUNCTIONS:
        lines.append(f"  {f['id']} {f['mission_name']}  |  rejected: {f['rejected_metric']}")
    lines += ["", "Discovery queue when the case is empty:"]
    for i, q in enumerate(DISCOVERY, 1):
        lines.append(f"  {i:02d} {q}")
    lines.append("")
    lines.append("Funds stay apart: restricted 42000, unrestricted 18000, shop 8000.")
    lines.append("Shared driver is 40 hours, counted once.")
    return "\n".join(lines)


if __name__ == "__main__":
    print(report())
