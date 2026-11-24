/** Numerical contract ported from the OAS reference core. Missing stays null, never zero. */

export const FUNCTION_WEIGHTS = {
  effectiveness: 0.25,
  efficiency: 0.2,
  reliability: 0.15,
  resilience: 0.2,
  adaptability: 0.1,
  control_and_integrity: 0.1,
} as const;

export type Dimension = keyof typeof FUNCTION_WEIGHTS;

export const DIMENSIONS = Object.keys(FUNCTION_WEIGHTS) as Dimension[];

export const HUMAN_WEIGHTS = {
  capability_adequacy: 0.15,
  resource_adequacy: 0.15,
  objective_alignment: 0.15,
  communication: 0.1,
  relationships: 0.1,
  coordination: 0.1,
  adaptability: 0.1,
  sustainability: 0.15,
} as const;

export type HealthResult = {
  score: number | null;
  coverage: number | null;
  provisional: boolean;
};

export function health(
  scores: Partial<Record<string, number | null>>,
  weights: Record<string, number>,
  applicable?: string[],
): HealthResult {
  const keys = (applicable ?? Object.keys(weights)).slice().sort();
  const assessed = keys.filter((k) => scores[k] != null);
  const total = keys.reduce((s, k) => s + (weights[k] ?? 0), 0);
  const known = assessed.reduce((s, k) => s + (weights[k] ?? 0), 0);
  const score = known
    ? assessed.reduce((s, k) => s + (weights[k] ?? 0) * (scores[k] as number), 0) / known
    : null;
  const coverage = total ? (100 * known) / total : null;
  return {
    score,
    coverage,
    provisional: coverage == null || coverage < 70,
  };
}

export function band(score: number | null): string {
  if (score == null) return "Unknown";
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Healthy";
  if (score >= 50) return "Adequate";
  if (score >= 25) return "Vulnerable";
  return "Severe";
}

export function readiness(c: number | null, o: number | null, m: number | null) {
  const vals = [c, o, m];
  if (vals.some((v) => v == null)) {
    const hi = vals.reduce<number>((p, v) => p * (v == null ? 1 : v), 1);
    return { point: null as number | null, range: [0, hi] as [number, number], conditional: true };
  }
  const point = (c as number) * (o as number) * (m as number);
  return { point, range: [point, point] as [number, number], conditional: true };
}

export type Condition = { critical: boolean; status: "pass" | "watch" | "fail" | "unknown"; label: string };

export function systemStatus(conditions: Condition[], provisional = false): string {
  if (conditions.some((c) => c.critical && c.status === "fail")) return "critical";
  if (conditions.some((c) => c.critical && c.status === "unknown")) return "unresolved";
  if (conditions.some((c) => c.status === "watch" || c.status === "fail")) return "at_risk";
  if (!conditions.length || provisional || conditions.some((c) => c.status === "unknown")) return "provisional";
  return "no_flag_detected";
}

export function serialCapacity(demand: number | null, capacities: Record<string, number | null>) {
  const items: Record<string, number | null> = { demand, ...capacities };
  const known = Object.entries(items).filter(([, v]) => v != null) as [string, number][];
  const bound = known.length ? Math.min(...known.map(([, v]) => v)) : null;
  const complete = Object.values(items).every((v) => v != null) && Object.keys(capacities).length > 0;
  return {
    throughput: complete ? bound : null,
    upperBound: bound,
    binding: complete ? known.filter(([, v]) => v === bound).map(([k]) => k).sort() : [],
    missing: Object.entries(items)
      .filter(([, v]) => v == null)
      .map(([k]) => k)
      .sort(),
  };
}

function round6(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

/** Service-capacity realization. Same arithmetic as the product-sales fulfillment fixture. */
export function serviceRealization(
  base: number,
  increment: number,
  demand: number,
  realization: number,
  contribution: number,
  recurring: number,
) {
  const before = Math.min(base, demand);
  const after = Math.min(demand, round6(base + increment * realization));
  const incremental = round6((after - before) * contribution - recurring);
  const breakEvenUnits = contribution > 0 ? Math.ceil(recurring / contribution - 1e-9) : null;
  const potential = Math.min(increment, Math.max(demand - base, 0));
  const fraction =
    increment > 0 && contribution > 0 && potential * contribution >= recurring
      ? recurring / (increment * contribution)
      : null;
  return {
    baseline: before,
    throughput: after,
    incremental,
    breakEvenUnits,
    breakEvenRealization: fraction,
  };
}

export function gate(flags: {
  prohibited?: boolean;
  refer?: boolean;
  mandatory?: boolean;
  blocked?: boolean;
  needsEvidence?: boolean;
}) {
  if (flags.prohibited) return "prohibited";
  if (flags.refer) return "refer";
  if (flags.mandatory) return "mandatory";
  if (flags.blocked) return "blocked";
  if (flags.needsEvidence) return "needs_evidence";
  return "eligible";
}

export function sequence(prerequisites: Record<string, string[]>): string[] {
  const pending: Record<string, Set<string>> = {};
  for (const [k, v] of Object.entries(prerequisites)) pending[k] = new Set(v);
  const result: string[] = [];
  const guard = Object.keys(pending).length + 2;
  for (let n = 0; n < guard && Object.keys(pending).length; n++) {
    const ready = Object.entries(pending)
      .filter(([, deps]) => deps.size === 0)
      .map(([k]) => k)
      .sort();
    if (!ready.length) throw new Error("prerequisite cycle");
    result.push(...ready);
    for (const k of ready) delete pending[k];
    for (const deps of Object.values(pending)) for (const k of ready) deps.delete(k);
  }
  return result;
}
