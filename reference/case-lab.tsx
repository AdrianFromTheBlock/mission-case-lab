import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Landmark,
  Scale,
  Shield,
  Split,
  Users,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DISCOVERY, FUNCTIONS, PARTIES, PARTIAL_SCORES, type FnMode } from "@/lib/oas/catalog";
import {
  DIMENSIONS,
  FUNCTION_WEIGHTS,
  band,
  gate,
  health,
  readiness,
  sequence,
  serialCapacity,
  serviceRealization,
  systemStatus,
  type Condition,
  type Dimension,
} from "@/lib/oas/engine";

type Workspace = "brief" | "parties" | "functions" | "funds" | "health" | "scenario" | "actions";

const WORKSPACES: { id: Workspace; label: string }[] = [
  { id: "brief", label: "Brief" },
  { id: "parties", label: "Parties" },
  { id: "functions", label: "Functions" },
  { id: "funds", label: "Funds" },
  { id: "health", label: "Health" },
  { id: "scenario", label: "Scenario" },
  { id: "actions", label: "Actions" },
];

const STATUS_LABEL: Record<string, string> = {
  critical: "Critical — review now",
  unresolved: "Unresolved critical condition",
  at_risk: "At risk",
  provisional: "Provisional",
  no_flag_detected: "No flag on recorded conditions",
};

function money(n: number) {
  const sign = n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function pct(n: number | null) {
  if (n == null) return "—";
  return `${n.toFixed(1)}%`;
}

export function CaseLab() {
  const [caseKind, setCaseKind] = useState<"empty" | "river">("river");
  const [workspace, setWorkspace] = useState<Workspace>("brief");
  const [lens, setLens] = useState<"mission" | "sales">("mission");
  const [selected, setSelected] = useState("F07");
  const [scores, setScores] = useState<Partial<Record<Dimension, number | null>>>(PARTIAL_SCORES);
  const [payrollFail, setPayrollFail] = useState(false);
  const [restrictionUnknown, setRestrictionUnknown] = useState(false);
  const [realization, setRealization] = useState(0.7);
  const [capability, setCapability] = useState<number | null>(0.9);
  const [opportunity, setOpportunity] = useState<number | null>(0.2);
  const [motivation, setMotivation] = useState<number | null>(0.8);
  const [missionHours, setMissionHours] = useState(24);
  const [f03, setF03] = useState<FnMode>("internal");

  const empty = caseKind === "empty";
  const activeScores = empty ? {} : scores;
  const h = health(activeScores, FUNCTION_WEIGHTS);
  const ready = readiness(empty ? null : capability, empty ? null : opportunity, empty ? null : motivation);

  const conditions: Condition[] = empty
    ? [
        { critical: true, status: "unknown", label: "Unrestricted liquidity" },
        { critical: true, status: "unknown", label: "Restricted-fund integrity" },
        { critical: true, status: "unknown", label: "Safe service conditions" },
      ]
    : [
        {
          critical: true,
          status: payrollFail ? "fail" : "pass",
          label: "Unrestricted cash can meet payroll and near-term bills",
        },
        {
          critical: true,
          status: restrictionUnknown ? "unknown" : "pass",
          label: "Restricted funds used only for their stated purpose",
        },
        { critical: true, status: "pass", label: "No recorded immediate harm in service delivery" },
        { critical: false, status: "watch", label: "Shared driver is the only route to two sites" },
      ];

  const status = systemStatus(conditions, h.provisional || empty);
  const cap = serialCapacity(empty ? null : 1350, {
    eligibility: empty ? null : 1400,
    service: empty ? null : 1200,
    delivery: empty ? null : 800,
  });
  const scenario = serviceRealization(800, 300, 1350, realization, 16, 1000);
  const chart = [0, 0.3, 0.6, 0.7, 0.8, 1].map((r) => {
    const row = serviceRealization(800, 300, 1350, r, 16, 1000);
    return { r: `${Math.round(r * 100)}%`, net: row.incremental, encounters: row.throughput };
  });

  const fn = FUNCTIONS.find((f) => f.id === selected) ?? FUNCTIONS[6];
  const shopHours = 40 - missionHours;
  const doubleCount = missionHours + shopHours !== 40;

  const plan = useMemo(() => sequence({ automate: ["reconcile"], reconcile: [] }), []);

  function toggleDimension(dim: Dimension) {
    setScores((prev) => {
      const next = { ...prev };
      if (next[dim] == null) next[dim] = dim === "effectiveness" ? 75 : 70;
      else delete next[dim];
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-brass uppercase">OAS · nonprofit overlay</p>
              <h1 className="mt-1 text-3xl text-ink sm:text-4xl">Mission case lab</h1>
              <p className="mt-1 max-w-xl text-sm text-muted">
                A function is a responsibility, not a department. For a nonprofit, profitability is not the objective,
                and a sales label is not a mission score.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCaseKind("river")}
                className={`h-11 rounded-full px-4 text-sm ${caseKind === "river" ? "bg-ink text-brass-fg" : "bg-brass-soft text-ink"}`}
              >
                North River (synthetic)
              </button>
              <button
                type="button"
                onClick={() => setCaseKind("empty")}
                className={`h-11 rounded-full px-4 text-sm ${caseKind === "empty" ? "bg-ink text-brass-fg" : "bg-brass-soft text-ink"}`}
              >
                Empty case
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {WORKSPACES.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWorkspace(w.id)}
                className={`h-11 shrink-0 rounded-full px-4 text-sm ${workspace === w.id ? "bg-brass text-brass-fg" : "border border-line text-ink"}`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0 space-y-4">
          {workspace === "brief" && (
            <article className="rounded-card border border-line bg-paper p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.14em] text-muted uppercase">Case brief</p>
                  <h2 className="mt-1 text-2xl">
                    {empty ? "Unscoped matter" : "North River Family Services"}
                  </h2>
                </div>
                <StatusPill status={status} />
              </div>
              <p className="mt-3 text-sm text-muted">
                {empty
                  ? "Nothing has been collected. Health stays unknown. The queue below is what to ask next — not a score."
                  : "Synthetic community nonprofit. A family-support program and a donated-goods shop share one driver and one building. Neither track may be scored as the other."}
              </p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <Fact k="Protected objective" v={empty ? "—" : "Households complete a stable housing plan"} />
                <Fact k="Authority" v={empty ? "—" : "Board approves restricted-fund exceptions"} />
                <Fact k="Legal form" v={empty ? "—" : "Nonprofit corporation · tax status not concluded here"} />
                <Fact k="Lifecycle" v={empty ? "—" : "Mature program, restructuring the shop"} />
              </dl>
              <div className="mt-5 rounded-card bg-brass-soft p-4">
                <p className="text-sm font-medium">Objective weights for this organization</p>
                <p className="mt-1 text-sm text-muted">
                  Not the product-sales illustration (profitability 25%). These are the weights the case would carry
                  once the board confirms them.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <Weight name="Mission reach" w="30%" />
                  <Weight name="Beneficiary access" w="20%" />
                  <Weight name="Unrestricted stability" w="20%" />
                  <Weight name="Governance integrity" w="15%" />
                  <Weight name="Restriction compliance" w="10%" />
                  <Weight name="Continuity" w="5%" />
                </ul>
              </div>
              {empty && (
                <ol className="mt-5 space-y-2">
                  {DISCOVERY.map((q, i) => (
                    <li key={q} className="flex gap-3 text-sm">
                      <span className="font-serif text-brass">{String(i + 1).padStart(2, "0")}</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ol>
              )}
            </article>
          )}

          {workspace === "parties" && (
            <article className="space-y-3">
              <header className="px-1">
                <h2 className="text-2xl">Four parties, not one customer</h2>
                <p className="mt-1 text-sm text-muted">
                  The person helped, the person who pays, the person who gives, and the body that governs are different
                  relationships. Collapsing them into “sales” hides the obligation.
                </p>
              </header>
              <div className="grid gap-3 sm:grid-cols-2">
                {PARTIES.map((p) => (
                  <div key={p.id} className="rounded-card border border-line p-4">
                    <Users className="size-5 text-brass" aria-hidden />
                    <h3 className="mt-2 text-xl">{p.title}</h3>
                    <p className="mt-1 text-sm text-muted">{empty ? "Not identified. Do not assume." : p.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {workspace === "functions" && (
            <article className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <h2 className="text-2xl">Thirteen functions, mission names</h2>
                <div className="flex rounded-full border border-line p-1">
                  <button
                    type="button"
                    onClick={() => setLens("mission")}
                    className={`h-10 rounded-full px-3 text-sm ${lens === "mission" ? "bg-ink text-brass-fg" : ""}`}
                  >
                    Mission lens
                  </button>
                  <button
                    type="button"
                    onClick={() => setLens("sales")}
                    className={`h-10 rounded-full px-3 text-sm ${lens === "sales" ? "bg-ink text-brass-fg" : ""}`}
                  >
                    Sales labels
                  </button>
                </div>
              </div>
              {lens === "sales" && (
                <p className="rounded-card border border-alert bg-alert-soft px-4 py-3 text-sm">
                  Comparison only. These are the product-sales names. They are not scored. A nonprofit is not a retailer
                  with the word “customer” replaced.
                </p>
              )}
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line">
                {FUNCTIONS.map((f) => {
                  const mode = f.id === "F03" ? f03 : f.mode;
                  const name = lens === "mission" ? f.missionName : f.salesName;
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(f.id)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left ${selected === f.id ? "bg-brass-soft" : "bg-paper"}`}
                      >
                        <span className="w-10 shrink-0 font-serif text-brass">{f.id}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{name}</span>
                          <span className="block text-xs text-muted">
                            {mode === "not_applicable" ? "Not applicable" : mode} · {f.missionMetric}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </article>
          )}

          {workspace === "funds" && (
            <article className="space-y-4">
              <header className="px-1">
                <h2 className="text-2xl">Restricted and unrestricted, kept apart</h2>
                <p className="mt-1 text-sm text-muted">
                  Restricted cash is not a balance available for payroll. The shop’s surplus is not mission reach.
                </p>
              </header>
              {empty ? (
                <p className="rounded-card border border-line p-5 text-sm">
                  No ledger. Unknown is an em dash, not zero. Do not estimate a surplus.
                </p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Restricted program grant" value={money(42000)} note="Housing plans only" />
                    <Stat label="Unrestricted gifts" value={money(18000)} note="Available for operations" />
                    <Stat label="Shop proceeds" value={money(8000)} note="Separate track · donated goods" />
                  </div>
                  <div className="rounded-card border border-line p-4">
                    <div className="flex items-center gap-2">
                      <Split className="size-5 text-brass" aria-hidden />
                      <h3 className="text-xl">Shared driver · 40 hours</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      One van, one person. Hours assigned to the mission route cannot also be assigned to shop pickups.
                    </p>
                    <label className="mt-4 block text-sm">
                      Mission route hours: {missionHours}
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={missionHours}
                        onChange={(e) => setMissionHours(Number(e.target.value))}
                        className="mt-2 w-full accent-brass"
                      />
                    </label>
                    <p className="mt-2 text-sm">
                      Mission {missionHours} h · Shop {shopHours} h · Counted once {missionHours + shopHours} h
                      {doubleCount ? "" : ""}.
                    </p>
                  </div>
                  <label className="flex items-start gap-3 rounded-card border border-line p-4 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-alert"
                      checked={payrollFail}
                      onChange={(e) => setPayrollFail(e.target.checked)}
                    />
                    <span>
                      <span className="font-medium">Record a payroll shortfall on unrestricted cash.</span>
                      <span className="mt-1 block text-muted">
                        This is a critical fail. It overrides any healthy program score. Restricted grant dollars do not
                        clear it.
                      </span>
                    </span>
                  </label>
                </>
              )}
            </article>
          )}

          {workspace === "health" && (
            <article className="space-y-4">
              <header className="px-1">
                <h2 className="text-2xl">Health and coverage, apart</h2>
                <p className="mt-1 text-sm text-muted">
                  A high score with thin evidence stays provisional. A critical fail is not averaged away. Human
                  readiness is a task condition, not a ranking of people.
                </p>
              </header>
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat
                  label="Function health"
                  value={h.score == null ? "—" : h.score.toFixed(1)}
                  note={empty ? "No evidence" : `${band(h.score)} · ${h.provisional ? "provisional" : "coverage sufficient"}`}
                />
                <Stat label="Evidence coverage" value={h.coverage == null ? "—" : `${h.coverage.toFixed(0)}%`} note="Weight assessed / weight applicable" />
                <Stat label="System status" value={STATUS_LABEL[status] ?? status} note="Not blended with the score" />
              </div>
              {!empty && (
                <fieldset className="rounded-card border border-line p-4">
                  <legend className="px-1 text-sm font-medium">Evidence on the delivery function</legend>
                  <p className="mb-3 text-sm text-muted">
                    Start with only effectiveness. Coverage is 25% until more dimensions are actually supported.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {DIMENSIONS.map((dim) => (
                      <label key={dim} className="flex h-11 items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={scores[dim] != null}
                          onChange={() => toggleDimension(dim)}
                          className="size-4 accent-brass"
                        />
                        <span className="capitalize">{dim.replaceAll("_", " ")}</span>
                        <span className="ml-auto text-muted">{Math.round(FUNCTION_WEIGHTS[dim] * 100)}%</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="rounded-card border border-line p-4">
                <h3 className="text-xl">Task readiness · intake scheduling</h3>
                <p className="mt-1 text-sm text-muted">
                  R = capability × opportunity × motivation. A heuristic bottleneck, not a probability of compliance and
                  not an employment score. Private intentions stay unknown.
                </p>
                {empty ? (
                  <p className="mt-3 text-sm">— insufficient evidence. Point estimate unknown.</p>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Factor label="Capability" value={capability} onChange={setCapability} />
                    <Factor label="Opportunity" value={opportunity} onChange={setOpportunity} />
                    <Factor label="Motivation" value={motivation} onChange={setMotivation} />
                  </div>
                )}
                <p className="mt-3 text-sm">
                  Point {ready.point == null ? "—" : ready.point.toFixed(3)} · range {ready.range[0].toFixed(3)}–
                  {ready.range[1].toFixed(3)} · conditional
                </p>
                <button
                  type="button"
                  className="mt-3 h-11 rounded-full border border-line px-4 text-sm"
                  onClick={() => setMotivation(null)}
                  disabled={empty}
                >
                  Mark motivation unknown
                </button>
              </div>
            </article>
          )}

          {workspace === "scenario" && (
            <article className="space-y-4">
              <header className="px-1">
                <h2 className="text-2xl">Service capacity, not a sales forecast</h2>
                <p className="mt-1 text-sm text-muted">
                  Baseline delivery 800 encounters. A scheduling change could add 300. Demand from eligible households
                  is 1,350. Realization is an assumption you set — it is not the readiness index.
                </p>
              </header>
              {empty || cap.throughput == null ? (
                <p className="rounded-card border border-line p-5 text-sm">
                  {empty
                    ? "No capacities on file. Collect them before simulating. An unknown constraint is an upper bound, not a bottleneck."
                    : `Known upper bound ${cap.upperBound ?? "—"}. Missing: ${cap.missing.join(", ") || "none"}.`}
                </p>
              ) : (
                <>
                  <p className="text-sm">
                    Serial path binds at <span className="font-medium">{cap.binding.join(", ")}</span> — throughput{" "}
                    {cap.throughput} while eligibility can screen {1400}. Speeding eligibility does not deliver more
                    households.
                  </p>
                  <label className="block text-sm">
                    Additional capacity realized: {Math.round(realization * 100)}%
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(realization * 100)}
                      onChange={(e) => setRealization(Number(e.target.value) / 100)}
                      className="mt-2 w-full accent-brass"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Encounters" value={String(scenario.throughput)} note={`Baseline ${scenario.baseline}`} />
                    <Stat
                      label="Unrestricted net"
                      value={money(scenario.incremental)}
                      note="After $1,000 recurring cost · $16 per added encounter"
                    />
                    <Stat
                      label="Break-even"
                      value={scenario.breakEvenUnits == null ? "—" : `${scenario.breakEvenUnits} encounters`}
                      note={
                        scenario.breakEvenRealization == null
                          ? "Undefined"
                          : `${pct(scenario.breakEvenRealization * 100)} of the added capacity`
                      }
                    />
                  </div>
                  <div className="h-56 rounded-card border border-line p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chart}>
                        <CartesianGrid stroke="var(--color-line)" />
                        <XAxis dataKey="r" tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
                        <YAxis tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--color-paper)",
                            border: "1px solid var(--color-line)",
                            borderRadius: 12,
                          }}
                        />
                        <Line type="monotone" dataKey="net" name="Unrestricted net" stroke="var(--color-brass)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted">
                    Synthetic source example, restated for service encounters. No probability is assigned. 0% realization
                    loses the $1,000 cost; about 21% covers it.
                  </p>
                </>
              )}
            </article>
          )}

          {workspace === "actions" && (
            <article className="space-y-3">
              <header className="px-1">
                <h2 className="text-2xl">Gates before rank</h2>
                <p className="mt-1 text-sm text-muted">
                  A high mission impact does not make a prohibited use of funds eligible. OAS proposes. A person
                  approves. Nothing here is executed.
                </p>
              </header>
              <Action
                title="Spend the housing grant on general payroll"
                detail="Purpose clause does not allow it. Score is irrelevant."
                state={gate({ prohibited: true, mandatory: true })}
              />
              <Action
                title="Conclude unrelated-business tax treatment of the shop"
                detail="Track the activity. Refer a qualified reviewer. No automated legal result."
                state={gate({ refer: true })}
              />
              <Action
                title="Protect current households if payroll cannot be met"
                detail="Mandatory review. Separate from the opportunity list."
                state={payrollFail ? gate({ mandatory: true }) : "observe"}
              />
              <Action
                title="Automate intake before the restricted-fund ledger is reconciled"
                detail={`Prerequisite order: ${plan.join(" → ")}. Automation stays blocked until reconcile is done.`}
                state={gate({ blocked: true })}
              />
              <Action
                title="Pilot Saturday delivery on the mission route"
                detail="Eligible. Uses only hours not already given to the shop. Reversible. Measure encounters completed."
                state={gate({})}
              />
            </article>
          )}
        </section>

        <aside className="h-fit rounded-card border border-line p-4 lg:sticky lg:top-4">
          <p className="text-xs tracking-[0.14em] text-muted uppercase">Inspector</p>
          <h2 className="mt-1 text-xl">{fn.id}</h2>
          <p className="font-medium">{lens === "mission" ? fn.missionName : fn.salesName}</p>
          <p className="mt-2 text-sm text-muted">{fn.purpose}</p>
          <p className="mt-3 text-sm">{fn.adaptation}</p>
          {fn.id === "F03" && !empty && (
            <label className="mt-3 block text-sm">
              Implementation
              <select
                value={f03}
                onChange={(e) => setF03(e.target.value as FnMode)}
                className="mt-1 h-11 w-full rounded-lg border border-line bg-paper px-2"
              >
                <option value="internal">Internal service provision</option>
                <option value="external">External partner delivers</option>
                <option value="not_applicable">Not applicable — reason required</option>
              </select>
            </label>
          )}
          {f03 === "not_applicable" && fn.id === "F03" && (
            <p className="mt-2 text-sm text-muted">
              Reason on file would be required: this organization does not transform goods. The function stays in the
              model so the omission is explicit.
            </p>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-muted">Use</dt>
              <dd>{fn.missionMetric}</dd>
            </div>
            <div>
              <dt className="text-muted">Do not use</dt>
              <dd>{fn.rejectedMetric}</dd>
            </div>
            <div>
              <dt className="text-muted">Confidence</dt>
              <dd>{empty ? "Unknown" : h.provisional ? "Low — coverage under 70%" : "Separate from the score"}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-start gap-2 text-xs text-muted">
            <Shield className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
            <p>Decision support only. No hiring, firing, contact, or posting. Human conditions are not a personnel file.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const critical = status === "critical" || status === "unresolved";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${critical ? "bg-alert-soft text-alert" : "bg-brass-soft text-ink"}`}
    >
      {critical ? <AlertTriangle className="size-3.5" aria-hidden /> : <Scale className="size-3.5" aria-hidden />}
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-line px-3 py-2">
      <dt className="text-xs text-muted">{k}</dt>
      <dd className="text-sm">{v}</dd>
    </div>
  );
}

function Weight({ name, w }: { name: string; w: string }) {
  return (
    <li className="flex justify-between gap-3 border-b border-line/70 py-1 last:border-0">
      <span>{name}</span>
      <span className="font-medium">{w}</span>
    </li>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-card border border-line p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl leading-tight">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}

function Factor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
}) {
  return (
    <label className="text-sm">
      {label}: {value == null ? "unknown" : value.toFixed(2)}
      <input
        type="range"
        min={0}
        max={100}
        disabled={value == null}
        value={Math.round((value ?? 0) * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="mt-1 w-full accent-brass"
      />
    </label>
  );
}

function Action({ title, detail, state }: { title: string; detail: string; state: string }) {
  const bad = state === "prohibited" || state === "blocked";
  const Icon = state === "refer" ? Landmark : state === "mandatory" ? Shield : bad ? AlertTriangle : Wallet;
  return (
    <div className={`rounded-card border p-4 ${bad ? "border-alert bg-alert-soft" : "border-line"}`}>
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${bad ? "text-alert" : "text-brass"}`} aria-hidden />
        <p className="text-xs tracking-wide uppercase">{state.replaceAll("_", " ")}</p>
      </div>
      <h3 className="mt-1 text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted">{detail}</p>
    </div>
  );
}
