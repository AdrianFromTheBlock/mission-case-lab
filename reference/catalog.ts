import type { Dimension } from "./engine";

export type FnMode = "internal" | "external" | "hybrid" | "not_applicable" | "unknown";

export type OrgFunction = {
  id: string;
  salesName: string;
  missionName: string;
  purpose: string;
  adaptation: string;
  mode: FnMode;
  naReason?: string;
  /** Product-sales KPI that must not be used as the mission score. */
  rejectedMetric: string;
  missionMetric: string;
};

export const FUNCTIONS: OrgFunction[] = [
  {
    id: "F01",
    salesName: "Product research and development",
    missionName: "Program design",
    purpose: "Identify the outcome that matters, and for whom.",
    adaptation: "Assortment and product launch become program design. Relevance is mission fit, not launch profitability.",
    mode: "internal",
    rejectedMetric: "New-product profit",
    missionMetric: "Outcome definition and beneficiary fit",
  },
  {
    id: "F02",
    salesName: "Procurement and supplier management",
    missionName: "Resource acquisition",
    purpose: "Acquire goods, services, and donated inputs the mission actually uses.",
    adaptation: "Donated goods are still a supply dependency. Record restriction, condition, and handling cost.",
    mode: "hybrid",
    rejectedMetric: "Purchase-price variance alone",
    missionMetric: "Landed cost of usable inputs, including donated-goods handling",
  },
  {
    id: "F03",
    salesName: "Production and processing",
    missionName: "Service provision",
    purpose: "Create the mission result. This is not a factory score.",
    adaptation: "No manufacturing throughput is invented. If a shop alters donated goods, that activity stays on the shop track.",
    mode: "internal",
    rejectedMetric: "Unit manufacturing cost",
    missionMetric: "Service units completed to standard",
  },
  {
    id: "F04",
    salesName: "Quality management",
    missionName: "Service integrity",
    purpose: "Verify that the service matches the promise made to beneficiaries and funders.",
    adaptation: "Defect rate becomes harm, error, and standards failure — not warranty cost.",
    mode: "internal",
    rejectedMetric: "Warranty claims",
    missionMetric: "Standards met, harm events, recurrence",
  },
  {
    id: "F05",
    salesName: "Inventory management",
    missionName: "Supplies and restricted stores",
    purpose: "Preserve and allocate supplies without treating restricted goods as free merchandise.",
    adaptation: "Program supplies and shop inventory are separate pools. Shared storage is allocated once.",
    mode: "internal",
    rejectedMetric: "Merchandise turnover as a mission score",
    missionMetric: "Usable supply availability and restriction compliance",
  },
  {
    id: "F06",
    salesName: "Marketing",
    missionName: "Mission communication",
    purpose: "Communicate the work to the people who need it and the people who fund it — separately.",
    adaptation: "Acquisition cost of donors is not beneficiary demand.",
    mode: "internal",
    rejectedMetric: "Customer acquisition cost blended with donor cost",
    missionMetric: "Reach to eligible people, and a separate donor-communication record",
  },
  {
    id: "F07",
    salesName: "Sales",
    missionName: "Fundraising and eligibility",
    purpose: "Bring in support and decide who may receive the service. These are not one conversion rate.",
    adaptation: "Where the beneficiary does not pay, there is no sale. Eligibility accuracy and restricted-fund yield stay apart.",
    mode: "internal",
    rejectedMetric: "Sales conversion and realized price",
    missionMetric: "Eligible people reached; restricted funds raised against purpose",
  },
  {
    id: "F08",
    salesName: "Logistics and fulfillment",
    missionName: "Beneficiary delivery",
    purpose: "Get the service or good to the person it is for, on the commitment made.",
    adaptation: "Order accuracy becomes delivery to the right beneficiary, not a retail shipment score.",
    mode: "internal",
    rejectedMetric: "On-time retail shipment",
    missionMetric: "Committed service encounters completed",
  },
  {
    id: "F09",
    salesName: "Customer support",
    missionName: "Participant support",
    purpose: "Maintain the relationship after the encounter, and feed problems back to the program.",
    adaptation: "Churn is not the mission metric. Unresolved harm and lost follow-through are.",
    mode: "internal",
    rejectedMetric: "Customer lifetime value",
    missionMetric: "Follow-through and unresolved participant problems",
  },
  {
    id: "F10",
    salesName: "Finance and accounting",
    missionName: "Stewardship",
    purpose: "Show sustainability and restricted-fund integrity as two results, not one margin.",
    adaptation: "Operating surplus does not prove mission success. Restricted cash is not available for unrestricted bills.",
    mode: "internal",
    rejectedMetric: "Net profit margin as the health score",
    missionMetric: "Unrestricted liquidity, restriction compliance, mission output beside it",
  },
  {
    id: "F11",
    salesName: "Organizational support",
    missionName: "Organizational support",
    purpose: "Keep people, systems, and facilities able to do the work.",
    adaptation: "Volunteer capacity is a resource with limits, not free infinite labor.",
    mode: "internal",
    rejectedMetric: "Headcount activity",
    missionMetric: "Availability of the support the programs actually use",
  },
  {
    id: "F12",
    salesName: "Management",
    missionName: "Management",
    purpose: "Coordinate programs so a local win does not break the whole.",
    adaptation: "A strong shop month that consumes the shared driver is not an organizational improvement.",
    mode: "internal",
    rejectedMetric: "Activity volume",
    missionMetric: "Protected objective still on track after tradeoffs",
  },
  {
    id: "F13",
    salesName: "Governance",
    missionName: "Governance",
    purpose: "Hold purpose, authority, and restricted-fund accountability.",
    adaptation: "Board authority is not staff convenience. Private benefit and purpose drift are hard gates, not score deductions.",
    mode: "internal",
    rejectedMetric: "Owner return",
    missionMetric: "Authority clarity, restriction oversight, no private benefit",
  },
];

export const PARTIES = [
  {
    id: "beneficiary",
    title: "Beneficiary",
    detail: "Receives the service. Often pays nothing. Their outcome is the protected objective.",
  },
  {
    id: "payer",
    title: "Payer",
    detail: "Grant, contract, or fee that funds delivery. May never meet the beneficiary.",
  },
  {
    id: "donor",
    title: "Donor",
    detail: "Gives money or goods. A restriction travels with the gift. A donor is not a customer.",
  },
  {
    id: "board",
    title: "Governing board",
    detail: "Holds mission, major policy, and executive accountability. Staff cannot approve their own exception.",
  },
];

export const DISCOVERY = [
  "Who receives the service, who pays, and who governs — as three different parties?",
  "Which cash and goods are restricted, to what purpose, and through what date?",
  "What single outcome is protected, and what measure would show it moved?",
  "Which of F01–F13 are actually performed? State N/A with a reason; do not drop the function.",
  "Can unrestricted cash meet near-term obligations without borrowing restricted funds?",
  "Which people, vehicles, or rooms are shared by the mission and any earned-income activity?",
  "What would a qualified reviewer need before any tax, employment, or legal conclusion?",
];

export const EMPTY_SCORES: Partial<Record<Dimension, number | null>> = {};

/** Only effectiveness is evidenced — coverage must stay at 25% and provisional. */
export const PARTIAL_SCORES: Partial<Record<Dimension, number | null>> = {
  effectiveness: 75,
};
