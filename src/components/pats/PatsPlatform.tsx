"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
  Download,
  FileText,
  Filter,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Plug,
  Plus,
  Route,
  Search,
  Send,
  Settings,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";

type NavKey =
  | "dashboard"
  | "trades"
  | "externalTrades"
  | "brokers"
  | "assets"
  | "workflows"
  | "documents"
  | "execution"
  | "integrations"
  | "activity"
  | "alerts"
  | "settings";

type StatusTone = "green" | "yellow" | "red" | "blue" | "gray" | "purple";

interface Trade {
  id: string;
  inboundTradeId: string;
  vantageTradeId: string;
  vantageBrokerId: string;
  patsBrokerProfileId?: string;
  privateAssetId?: string;
  brokerScopedTickerId?: string;
  workflowTemplateId?: string;
  userId?: string;
  accountId?: string;
  ticker: string;
  broker: string;
  asset: string;
  type: "Buy" | "Sell" | "Subscribe" | "Redeem";
  quantity: string;
  amount: string;
  status: "validated" | "workflow_required" | "unresolved" | "needs_review";
  workflowRequired: boolean;
  workflowReason: "no_template" | "every_trade" | "already_eligible" | "no_eligibility" | "unresolved" | "needs_review";
  routing: "FIX" | "SS&C" | "API" | "Manual";
  time: string;
  fillId: string;
}

interface Broker {
  patsBrokerProfileId: string;
  vantageBrokerId: string;
  name: string;
  code: string;
  status: "Active" | "Disconnected";
  systems: string[];
  inboundTrades: number;
  listedAssets: number;
  defaultRoute: string;
  defaultVantageRouterId: string | null;
  role: string;
  workflowOwner: string;
  fillReturnMethod: "vantage_blotter" | "manual" | "api_confirmation" | "workflow_event";
  fillReturn: string;
  contacts: string[];
}

interface Asset {
  privateAssetId: string;
  patsBrokerProfileId: string;
  brokerScopedTickerId: string;
  ticker: string;
  name: string;
  broker: string;
  assetClass: "private_equity" | "private_credit" | "venture_capital" | "hedge_fund" | "real_assets" | "other";
  preceptAssetClass: string;
  preceptStyle: string;
  fundStructure: string;
  gpSponsor: string;
  liquidityTerms: string;
  lockupPeriod: string;
  noticePeriod: string;
  taxDocumentSource: string;
  documentExecutionPlatform: string;
  status: "active" | "inactive" | "restricted";
  className: string;
  structure: string;
  sponsor: string;
  value: string;
  liquidity: "Low" | "Medium" | "High";
  lockup: string;
  notice: string;
  supply: string;
  units: string;
}

const trades: Trade[] = [
  { id: "TRD-001", inboundTradeId: "it_4eb00593", vantageTradeId: "vt_eligible_001", vantageBrokerId: "176f7a13d62244845b746b04c79fa621", patsBrokerProfileId: "pbp_gsas", privateAssetId: "pa_tech_a", brokerScopedTickerId: "bst_tech_a_gsas", workflowTemplateId: "wt_tech_subscription", userId: "user-123", accountId: "acct-123", ticker: "TECH-A", broker: "Goldman Sachs Advisor Solutions", asset: "TechCorp Series A", type: "Buy", quantity: "10,000", amount: "$452,000", status: "validated", workflowRequired: false, workflowReason: "already_eligible", routing: "API", time: "10:24 AM", fillId: "pending" },
  { id: "TRD-002", inboundTradeId: "it_d672e1c1", vantageTradeId: "vt_no_eligibility_001", vantageBrokerId: "176f7a13d62244845b746b04c79fa621", patsBrokerProfileId: "pbp_gsas", privateAssetId: "pa_tech_a", brokerScopedTickerId: "bst_tech_a_gsas", workflowTemplateId: "wt_tech_subscription", userId: "user-456", accountId: "acct-456", ticker: "TECH-A", broker: "Goldman Sachs Advisor Solutions", asset: "TechCorp Series A", type: "Subscribe", quantity: "10,000", amount: "$452,000", status: "workflow_required", workflowRequired: true, workflowReason: "no_eligibility", routing: "Manual", time: "10:18 AM", fillId: "pending" },
  { id: "TRD-003", inboundTradeId: "it_cb41f317", vantageTradeId: "vt_every_trade_001", vantageBrokerId: "35dc8d0f6703e35a81dac3912ec3b549", patsBrokerProfileId: "pbp_msalt", privateAssetId: "pa_health_b", brokerScopedTickerId: "bst_health_b_ms", workflowTemplateId: "wt_health_redemption", userId: "user-123", accountId: "acct-123", ticker: "HEALTH-B", broker: "Morgan Stanley Alternatives", asset: "HealthTech Preferred", type: "Redeem", quantity: "5,000", amount: "$642,500", status: "workflow_required", workflowRequired: true, workflowReason: "every_trade", routing: "Manual", time: "10:12 AM", fillId: "pending" },
  { id: "TRD-004", inboundTradeId: "it_a418e890", vantageTradeId: "vt_unresolved_001", vantageBrokerId: "35dc8d0f6703e35a81dac3912ec3b549", ticker: "DOES-NOT-EXIST", broker: "Morgan Stanley Alternatives", asset: "Not resolved", type: "Buy", quantity: "10,000", amount: "-", status: "unresolved", workflowRequired: false, workflowReason: "unresolved", routing: "Manual", time: "10:05 AM", fillId: "pending" },
  { id: "TRD-005", inboundTradeId: "it_a71e6d82", vantageTradeId: "vt_needs_review_001", vantageBrokerId: "cb2a2ee8e52d0c54e3af17fc32bb84c9", patsBrokerProfileId: "pbp_jpm", privateAssetId: "pa_energy_c", brokerScopedTickerId: "bst_energy_c_jpm", ticker: "ENERGY-C", broker: "JP Morgan Private Markets", asset: "CleanEnergy Fund", type: "Buy", quantity: "-", amount: "$1,380,000", status: "needs_review", workflowRequired: false, workflowReason: "needs_review", routing: "API", time: "9:58 AM", fillId: "pending" },
  { id: "TRD-006", inboundTradeId: "it_7bd6a44f", vantageTradeId: "vt_no_template_001", vantageBrokerId: "8a4c01a23b574ab5a8c11225efcd2299", patsBrokerProfileId: "pbp_icap", privateAssetId: "pa_fintech_d", brokerScopedTickerId: "bst_fintech_d_icap", ticker: "FINTECH-D", broker: "iCapital Marketplace", asset: "FinTech Growth", type: "Buy", quantity: "7,500", amount: "$1,580,625", status: "validated", workflowRequired: false, workflowReason: "no_template", routing: "API", time: "9:45 AM", fillId: "pending" },
];

const brokers: Broker[] = [
  { patsBrokerProfileId: "pbp_gsas", vantageBrokerId: "176f7a13d62244845b746b04c79fa621", name: "Goldman Sachs Advisor Solutions", code: "GSAS", status: "Active", systems: ["Vantage broker sync", "DocuSign"], inboundTrades: 24, listedAssets: 18, defaultRoute: "Private Asset Desk", defaultVantageRouterId: "router_gsas_private", role: "Owns private assets, scoped tickers, and workflow rules", workflowOwner: "Broker + PATS Ops", fillReturnMethod: "vantage_blotter", fillReturn: "PATS returns fills to Vantage", contacts: ["Maya Singh", "gsas-private-assets@example.com"] },
  { patsBrokerProfileId: "pbp_msalt", vantageBrokerId: "35dc8d0f6703e35a81dac3912ec3b549", name: "Morgan Stanley Alternatives", code: "MSALT", status: "Active", systems: ["Vantage broker sync", "Manual Review"], inboundTrades: 11, listedAssets: 12, defaultRoute: "Alternatives Desk", defaultVantageRouterId: "router_ms_alt", role: "Owns redemption checks and every-trade approvals", workflowOwner: "Broker workflow", fillReturnMethod: "manual", fillReturn: "Manual confirmation to PATS", contacts: ["Carlos Reed", "ms-alt-ops@example.com"] },
  { patsBrokerProfileId: "pbp_jpm", vantageBrokerId: "cb2a2ee8e52d0c54e3af17fc32bb84c9", name: "JP Morgan Private Markets", code: "JPM-PM", status: "Active", systems: ["Vantage broker sync"], inboundTrades: 8, listedAssets: 15, defaultRoute: "Private Markets API", defaultVantageRouterId: "router_jpm_pm", role: "Routes validated private asset orders", workflowOwner: "PATS Ops approval", fillReturnMethod: "api_confirmation", fillReturn: "API confirmation", contacts: ["Nina Walsh", "jpm-private@example.com"] },
  { patsBrokerProfileId: "pbp_icap", vantageBrokerId: "8a4c01a23b574ab5a8c11225efcd2299", name: "iCapital Marketplace", code: "ICAP", status: "Active", systems: ["iCapital", "Webhook planned"], inboundTrades: 6, listedAssets: 22, defaultRoute: "iCapital Workflow", defaultVantageRouterId: null, role: "External document and subscription workflow", workflowOwner: "External platform", fillReturnMethod: "workflow_event", fillReturn: "Workflow completion event", contacts: ["Platform Support", "icapital-support@example.com"] },
  { patsBrokerProfileId: "pbp_schwab", vantageBrokerId: "b45e6cb2154b4d8e865005c7f1d401cc", name: "Schwab Alternative Investments", code: "SCHWAB-AI", status: "Active", systems: ["Manual"], inboundTrades: 4, listedAssets: 9, defaultRoute: "Manual Review", defaultVantageRouterId: null, role: "Private asset custody and confirmation", workflowOwner: "PATS Ops", fillReturnMethod: "manual", fillReturn: "Ops-entered confirmation", contacts: ["Sofia Kim", "schwab-alt@example.com"] },
  { patsBrokerProfileId: "pbp_legacy", vantageBrokerId: "legacy_disabled", name: "Legacy Private Desk", code: "LEGACY", status: "Disconnected", systems: ["Manual"], inboundTrades: 0, listedAssets: 3, defaultRoute: "Manual Review", defaultVantageRouterId: null, role: "Legacy private asset processing", workflowOwner: "Ops only", fillReturnMethod: "manual", fillReturn: "Unavailable", contacts: ["Support Queue", "legacy-private@example.com"] },
];

const assets: Asset[] = [
  { privateAssetId: "pa_tech_a", patsBrokerProfileId: "pbp_gsas", brokerScopedTickerId: "bst_tech_a_gsas", ticker: "TECH-A", name: "TechCorp Series A", broker: "Goldman Sachs Advisor Solutions", assetClass: "private_equity", preceptAssetClass: "equity_alternatives", preceptStyle: "late_stage_venture_growth_equity", fundStructure: "3(c)(7), feeder, drawdown", gpSponsor: "TechCorp Capital", liquidityTerms: "Illiquid / drawdown", lockupPeriod: "24 months", noticePeriod: "90 days", taxDocumentSource: "UMB", documentExecutionPlatform: "DocuSign", status: "active", className: "Private Equity", structure: "3(c)(7) feeder", sponsor: "TechCorp GP", value: "$2.4M", liquidity: "Low", lockup: "24 months", notice: "90 days", supply: "$12M", units: "48,000" },
  { privateAssetId: "pa_health_b", patsBrokerProfileId: "pbp_msalt", brokerScopedTickerId: "bst_health_b_ms", ticker: "HEALTH-B", name: "HealthTech Preferred", broker: "Morgan Stanley Alternatives", assetClass: "venture_capital", preceptAssetClass: "equity_alternatives", preceptStyle: "healthcare_growth", fundStructure: "3(c)(1), subscription", gpSponsor: "HealthTech Partners", liquidityTerms: "Quarterly windows", lockupPeriod: "12 months", noticePeriod: "60 days", taxDocumentSource: "Sponsor portal", documentExecutionPlatform: "iCapital", status: "active", className: "Venture Capital", structure: "3(c)(1)", sponsor: "HealthTech Partners", value: "$1.9M", liquidity: "Medium", lockup: "12 months", notice: "60 days", supply: "$8M", units: "31,000" },
  { privateAssetId: "pa_energy_c", patsBrokerProfileId: "pbp_jpm", brokerScopedTickerId: "bst_energy_c_jpm", ticker: "ENERGY-C", name: "CleanEnergy Fund", broker: "JP Morgan Private Markets", assetClass: "real_assets", preceptAssetClass: "real_assets", preceptStyle: "infrastructure_energy", fundStructure: "Evergreen", gpSponsor: "CleanEnergy GP", liquidityTerms: "Semi-annual liquidity", lockupPeriod: "18 months", noticePeriod: "45 days", taxDocumentSource: "UMB", documentExecutionPlatform: "Manual Upload", status: "restricted", className: "Real Assets", structure: "Evergreen", sponsor: "CleanEnergy GP", value: "$3.2M", liquidity: "Medium", lockup: "18 months", notice: "45 days", supply: "$15M", units: "62,500" },
  { privateAssetId: "pa_fintech_d", patsBrokerProfileId: "pbp_icap", brokerScopedTickerId: "bst_fintech_d_icap", ticker: "FINTECH-D", name: "FinTech Growth", broker: "iCapital Marketplace", assetClass: "private_credit", preceptAssetClass: "credit_alternatives", preceptStyle: "growth_credit", fundStructure: "Drawdown", gpSponsor: "FinTech Capital", liquidityTerms: "Monthly liquidity", lockupPeriod: "6 months", noticePeriod: "30 days", taxDocumentSource: "iCapital", documentExecutionPlatform: "iCapital", status: "active", className: "Private Credit", structure: "Drawdown", sponsor: "FinTech Capital", value: "$1.5M", liquidity: "High", lockup: "6 months", notice: "30 days", supply: "$6M", units: "18,200" },
];

const workflows = [
  { id: "wt_tech_subscription", policy: "once_per_user", name: "TechCorp subscription workflow", type: "Subscription", patsBrokerProfileId: "pbp_gsas", privateAssetId: "pa_tech_a", broker: "Goldman Sachs Advisor Solutions", asset: "TechCorp Series A", status: "active", requirements: "4 requirements", updated: "12 min ago", focus: "Subscription agreement, investor signature, Ops approval", requirementTypes: ["document", "signature", "approval", "manual_review"] },
  { id: "wt_health_redemption", policy: "every_trade", name: "HealthTech redemption workflow", type: "Redemption", patsBrokerProfileId: "pbp_msalt", privateAssetId: "pa_health_b", broker: "Morgan Stanley Alternatives", asset: "HealthTech Preferred", status: "active", requirements: "5 requirements", updated: "38 min ago", focus: "Notice period, liquidity review, broker approval", requirementTypes: ["notice_period_check", "liquidity_check", "document", "approval", "manual_review"] },
  { id: "wt_fintech_subscription", policy: "once_per_user", name: "FinTech iCapital package", type: "Approval", patsBrokerProfileId: "pbp_icap", privateAssetId: "pa_fintech_d", broker: "iCapital Marketplace", asset: "FinTech Growth", status: "active", requirements: "3 requirements", updated: "1 hour ago", focus: "External platform, approval callback, manual review", requirementTypes: ["external_platform", "signature", "manual_review"] },
];

const documents = [
  { documentId: "doc_sub_001", workflowRequirementId: "wr_subscription_agreement", tradeWorkflowStepId: "tws_doc_001", name: "Subscription Agreement", tradeId: "it_d672e1c1", asset: "TechCorp Series A", broker: "Goldman Sachs Advisor Solutions", platform: "DocuSign", envelope: "DS-44912", assignee: "Sarah Chen", status: "sent", due: "Today", callback: "Waiting for signature event" },
  { documentId: "doc_sig_001", workflowRequirementId: "wr_investor_signature", tradeWorkflowStepId: "tws_sig_001", name: "Investor Signature", tradeId: "it_d672e1c1", asset: "TechCorp Series A", broker: "Goldman Sachs Advisor Solutions", platform: "DocuSign", envelope: "DS-44912", assignee: "Investor", status: "pending", due: "Today", callback: "Envelope created" },
  { documentId: "doc_redemption_001", workflowRequirementId: "wr_redemption_notice", tradeWorkflowStepId: "tws_notice_001", name: "Redemption Notice", tradeId: "it_cb41f317", asset: "HealthTech Preferred", broker: "Morgan Stanley Alternatives", platform: "Manual Upload", envelope: "manual_upload", assignee: "Ops Team", status: "blocked", due: "Overdue", callback: "Missing uploaded file" },
  { documentId: "doc_tax_001", workflowRequirementId: "wr_tax_package", tradeWorkflowStepId: "tws_tax_001", name: "Tax Package", tradeId: "it_a71e6d82", asset: "CleanEnergy Fund", broker: "JP Morgan Private Markets", platform: "UMB", envelope: "-", assignee: "Tax Ops", status: "pending", due: "May 8", callback: "Manual document module pending" },
];

const workflowReviewChecks = [
  { group: "Intake requirements", checks: ["Broker selected", "Ticker must resolve", "Private asset must be active"], status: "Active", action: "Applies before routing" },
  { group: "Asset rules", checks: ["Supply available", "Lock-up allowed", "Notice period checked"], status: "Active", action: "Configured per asset" },
  { group: "Documents", checks: ["Subscription packet", "DocuSign signature", "External platform callback"], status: "Active", action: "Required before eligibility" },
  { group: "Internal approval", checks: ["Ops reviewer", "Compliance approval", "Manual override"], status: "Active", action: "Broker/PATS owned" },
  { group: "Execution gate", checks: ["Workflow complete", "Broker approval present", "Trade can be routed"], status: "Active", action: "Unlocks execution" },
];

const externalTrades = [
  { externalId: "vt_eligible_001", inboundTradeId: "it_4eb00593", source: "Vantage API", vantageBrokerId: "176f7a13d62244845b746b04c79fa621", patsBrokerProfileId: "pbp_gsas", privateAssetId: "pa_tech_a", brokerScopedTickerId: "bst_tech_a_gsas", broker: "Goldman Sachs Advisor Solutions", ticker: "TECH-A", asset: "TechCorp Series A", validation: "validated", execution: "already_eligible", received: "2 min ago" },
  { externalId: "vt_no_eligibility_001", inboundTradeId: "it_d672e1c1", source: "Vantage API", vantageBrokerId: "176f7a13d62244845b746b04c79fa621", patsBrokerProfileId: "pbp_gsas", privateAssetId: "pa_tech_a", brokerScopedTickerId: "bst_tech_a_gsas", broker: "Goldman Sachs Advisor Solutions", ticker: "TECH-A", asset: "TechCorp Series A", validation: "workflow_required", execution: "no_eligibility", received: "8 min ago" },
  { externalId: "vt_every_trade_001", inboundTradeId: "it_cb41f317", source: "Vantage API", vantageBrokerId: "35dc8d0f6703e35a81dac3912ec3b549", patsBrokerProfileId: "pbp_msalt", privateAssetId: "pa_health_b", brokerScopedTickerId: "bst_health_b_ms", broker: "Morgan Stanley Alternatives", ticker: "HEALTH-B", asset: "HealthTech Preferred", validation: "workflow_required", execution: "every_trade", received: "21 min ago" },
  { externalId: "vt_unresolved_001", inboundTradeId: "it_a418e890", source: "Vantage API", vantageBrokerId: "35dc8d0f6703e35a81dac3912ec3b549", patsBrokerProfileId: "-", privateAssetId: "-", brokerScopedTickerId: "-", broker: "Morgan Stanley Alternatives", ticker: "DOES-NOT-EXIST", asset: "Not resolved", validation: "unresolved", execution: "unresolved", received: "44 min ago" },
];

const fillDeliveries = [
  { tradeId: "it_4eb00593", fillId: "not_created_yet", destination: "Vantage", recipient: "future fill return", method: "not implemented", status: "validated", last: "2 min ago", next: "execution module" },
  { tradeId: "it_d672e1c1", fillId: "not_created_yet", destination: "TradeWorkflow", recipient: "ops checklist", method: "workflow steps", status: "workflow_required", last: "4 min ago", next: "complete required steps" },
  { tradeId: "it_a418e890", fillId: "not_created_yet", destination: "Ops review", recipient: "resolution queue", method: "manual review", status: "unresolved", last: "9 min ago", next: "create ticker mapping" },
];

const executionFlows = [
  {
    tradeWorkflowId: "tw_001",
    inboundTradeId: "it_d672e1c1",
    workflowTemplateId: "wt_tech_subscription",
    tradeId: "TRD-002",
    ticker: "TECH-A",
    broker: "Goldman Sachs Advisor Solutions",
    asset: "TechCorp Series A",
    fillId: "not_created_yet",
    status: "in_progress",
    currentStep: 2,
    blockedStep: null,
    destination: "Vantage Blotter",
    lastUpdate: "2 min ago",
  },
  {
    tradeWorkflowId: "tw_002",
    inboundTradeId: "it_cb41f317",
    workflowTemplateId: "wt_health_redemption",
    tradeId: "TRD-003",
    ticker: "HEALTH-B",
    broker: "Morgan Stanley Alternatives",
    asset: "HealthTech Preferred",
    fillId: "Pending",
    status: "pending",
    currentStep: 2,
    blockedStep: 2,
    destination: "Vantage Blotter",
    lastUpdate: "8 min ago",
  },
  {
    tradeWorkflowId: "tw_003",
    inboundTradeId: "it_4eb00593",
    workflowTemplateId: "wt_tech_subscription",
    tradeId: "TRD-001",
    ticker: "TECH-A",
    broker: "Goldman Sachs Advisor Solutions",
    asset: "TechCorp Series A",
    fillId: "pending",
    status: "completed",
    currentStep: 6,
    blockedStep: null,
    destination: "Vantage Blotter",
    lastUpdate: "4 min ago",
  },
];

const executionSteps = ["Inbound trade", "Ticker resolved", "Workflow required", "Required steps", "Eligibility update", "Validated", "Ready for execution"];

const activityEvents = [
  "InboundTrade received from Vantage API",
  "Ticker TECH-A matched to a private asset",
  "BrokerScopedTicker matched bst_tech_a_gsas",
  "PrivateAsset pa_tech_a selected",
  "WorkflowTemplate wt_tech_subscription loaded",
  "Eligibility check returned already_eligible",
  "InboundTrade status changed to validated",
  "TradeWorkflow created for user without eligibility",
  "Required workflow step completed by Ops",
];

const alerts = [
  { severity: "High", entity: "it_a418e890", issue: "Ticker could not be resolved", status: "Open", owner: "Operations", created: "21 min ago" },
  { severity: "Critical", entity: "tws_notice_001", issue: "Required workflow step is blocked", status: "In Review", owner: "Sarah Chen", created: "9 min ago" },
  { severity: "Medium", entity: "pa_energy_c", issue: "Private asset is restricted and needs review", status: "Open", owner: "Docs Team", created: "1 hour ago" },
  { severity: "Low", entity: "pbp_legacy", issue: "Broker profile is disconnected", status: "Open", owner: "Integrations", created: "3 hours ago" },
];

const tradeGridClass = "grid-cols-[1.15fr_1.2fr_1.25fr_1.25fr_0.8fr_0.95fr_1fr]";

function toneFor(value: string): StatusTone {
  const lower = value.toLowerCase().replaceAll("_", " ");
  if (["buy", "subscribe", "filled", "active", "validated", "already eligible", "no template", "executed", "sent", "signed", "completed", "eligible", "connected", "approved", "fill returned"].includes(lower)) return "green";
  if (["pending", "partial", "in progress", "retrying", "needs review", "workflow required", "no eligibility", "every trade", "medium", "workflow pending", "docs pending", "returning fill", "waiting"].includes(lower)) return "yellow";
  if (["sell", "redeem", "failed", "rejected", "blocked", "critical", "high", "low", "disconnected", "unresolved", "revoked", "expired"].includes(lower)) return "red";
  if (["received", "routed", "open", "once per user"].includes(lower)) return "blue";
  if (["draft", "not started"].includes(lower)) return "gray";
  return "purple";
}

function badgeClasses(tone: StatusTone) {
  const classes: Record<StatusTone, string> = {
    green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    yellow: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    red: "border-rose-400/25 bg-rose-400/10 text-rose-300",
    blue: "border-sky-400/25 bg-sky-400/10 text-sky-300",
    gray: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    purple: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  };
  return classes[tone];
}

function displayLabel(value: string) {
  return value.replaceAll("_", " ");
}

function tradeNextAction(trade: Trade) {
  if (trade.status === "validated") return "Ready for execution";
  if (trade.status === "workflow_required") return "Complete workflow";
  if (trade.status === "unresolved") return "Map broker ticker";
  return "Ops review";
}

function tradeInvestorLabel(trade: Trade) {
  if (trade.accountId) return trade.accountId.replace("acct-", "Account ");
  if (trade.userId) return trade.userId.replace("user-", "User ");
  return "Not assigned";
}

function StatusBadge({ value, tone }: { value: string; tone?: StatusTone }) {
  return (
    <span className={`inline-flex h-4 w-fit items-center whitespace-nowrap rounded border px-1.5 text-[8px] font-semibold leading-none tracking-normal ${badgeClasses(tone ?? toneFor(value))}`}>
      {displayLabel(value)}
    </span>
  );
}

function ShellCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-800/90 bg-[#101318] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_18px_45px_rgba(0,0,0,0.25)] ${className}`}>
      {children}
    </div>
  );
}

function MetricCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <ShellCard className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-[8px] font-semibold text-slate-500">{label}</p>
        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-semibold leading-none text-slate-50">{value}</span>
        {delta && <span className="pb-0.5 text-[11px] font-semibold text-emerald-400">{delta}</span>}
      </div>
    </ShellCard>
  );
}

const navItems: Array<{ key: NavKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "trades", label: "PATS Blotter", icon: ArrowLeftRight },
  { key: "externalTrades", label: "Inbound Blotter", icon: Database },
  { key: "brokers", label: "Asset Brokers", icon: Building2 },
  { key: "assets", label: "Private Assets", icon: Briefcase },
  { key: "workflows", label: "Workflows", icon: ListChecks },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "execution", label: "Execution Flow", icon: CheckCircle2 },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "alerts", label: "Alerts", icon: AlertTriangle },
  { key: "settings", label: "Settings", icon: Settings },
];

function Sidebar({ active, onSelect }: { active: NavKey; onSelect: (key: NavKey) => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-slate-800 bg-[#0b0d11]">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-400/25 bg-sky-400/15">
          <ArrowUpRight className="h-4 w-4 text-sky-300" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide text-white">PATS</div>
          <div className="text-[9px] text-slate-500">Operations</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`group flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-xs font-medium transition ${
                selected ? "border border-sky-400/20 bg-sky-400/10 text-sky-200" : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${selected ? "text-sky-300" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span>{item.label}</span>
              {item.key === "alerts" && <span className="ml-auto rounded-md bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">4</span>}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <div className="rounded-md border border-slate-800 bg-slate-950/70 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-slate-500">Session</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <p className="mt-2 text-xs text-slate-300">Ops desk active</p>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-20 ml-60 flex h-14 items-center justify-between border-b border-slate-800 bg-[#0b0d11]/95 px-5 backdrop-blur">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className="h-9 w-full rounded-md border border-slate-800 bg-[#11151b] pl-10 pr-4 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-500/60"
          placeholder="Search trades, brokers, assets..."
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[9px] font-semibold text-emerald-300">Production</span>
        <div className="relative">
          <Bell className="h-4 w-4 text-slate-400" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-sky-400" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-900">
            <User className="h-3.5 w-3.5 text-slate-200" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-100">Sarah Chen</div>
            <div className="text-[8px] text-slate-500">Trader</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </header>
  );
}

function MarketContextBar() {
  const items = [
    ["Operating Date", "May 1, 2026"],
    ["Cutoff", "4:00 PM ET"],
    ["Open Exceptions", "4"],
    ["New Trades", "12"],
    ["Fill SLA", "98.7%"],
  ];

  return (
    <div className="ml-60 border-b border-slate-800 bg-[#0f1217] px-5 py-2">
      <div className="flex items-center gap-5">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-2.5 text-[11px]">
            <span className="font-semibold text-slate-600">{label}</span>
            <span className="font-medium text-slate-300">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between">
      <div>
        <h1 className="text-[23px] font-semibold text-slate-50">{title}</h1>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function BlotterLifecycleStrip() {
  const steps = [
    ["1", "Trade from Vantage", "External order arrives"],
    ["2", "PATS review", "Check and save"],
    ["3", "Asset match", "Broker ticker match"],
    ["4", "Workflow decision", "Rules and eligibility"],
    ["5", "Ops workflow", "Documents and approvals"],
    ["6", "Execution", "Future fill process"],
    ["7", "Return to Vantage", "Status or fill update"],
  ];

  return (
    <ShellCard className="mb-5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Full trade flow</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Final product flow from Vantage trade received to workflow completion, execution, and return back to Vantage.</p>
        </div>
        <StatusBadge value="final flow design" tone="blue" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {steps.map(([number, title, caption], index) => (
          <div key={title} className="relative rounded-md border border-slate-800 bg-slate-950/35 p-3">
            {index < steps.length - 1 && <span className="absolute left-[calc(100%+2px)] top-1/2 h-px w-2 -translate-y-1/2 bg-sky-400/25" />}
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-sky-400/25 bg-sky-400/10 text-[10px] font-semibold text-sky-300">{number}</span>
              <span className="text-xs font-semibold text-slate-100">{title}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">{caption}</p>
          </div>
        ))}
      </div>
    </ShellCard>
  );
}

function Dashboard({ onSelect }: { onSelect: (key: NavKey) => void }) {
  const activeBrokerCount = brokers.filter((broker) => broker.status === "Active").length;
  const workflowRequiredCount = trades.filter((trade) => trade.status === "workflow_required").length;
  const readyCount = trades.filter((trade) => trade.status === "validated").length;
  const exceptionCount = trades.filter((trade) => trade.status === "unresolved" || trade.status === "needs_review").length;
  const queueRows = trades.slice(0, 4).map((trade) => ({
    broker: trade.broker,
    asset: trade.asset,
    ticker: trade.ticker,
    size: trade.quantity !== "-" ? trade.quantity : trade.amount,
    status: trade.status,
    nextAction:
      trade.status === "validated"
        ? "Ready for execution"
        : trade.status === "workflow_required"
          ? "Complete workflow"
          : trade.status === "unresolved"
            ? "Create ticker mapping"
            : "Ops review",
  }));

  return (
    <>
      <PageTitle title="Operations Dashboard" subtitle="Private asset workspace for broker assets, workflow rules, and Vantage trades" />
      <BlotterLifecycleStrip />
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Active brokers" value={activeBrokerCount.toString()} delta="synced" />
        <MetricCard label="Private assets" value={assets.length.toString()} delta="catalogued" />
        <MetricCard label="Trades ready" value={readyCount.toString()} delta="can advance" />
        <MetricCard label="Needs action" value={(workflowRequiredCount + exceptionCount).toString()} delta="ops work" />
      </div>
      <div className="mt-5 grid grid-cols-[2fr_1fr] gap-5">
        <ShellCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Trades to review</h2>
              <p className="mt-1 text-xs text-slate-500">Trades from Vantage with the asset match, workflow result, and next action.</p>
            </div>
            <button onClick={() => onSelect("externalTrades")} className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {queueRows.map((trade) => (
              <button key={`${trade.broker}-${trade.ticker}-${trade.status}`} onClick={() => onSelect("externalTrades")} className="grid w-full grid-cols-[1.15fr_1fr_0.55fr_0.7fr_0.85fr_0.95fr] items-center rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2.5 text-left text-xs transition hover:bg-slate-800/40">
                <span className="text-slate-300">{trade.broker}</span>
                <span className="text-slate-400">{trade.asset}</span>
                <span className="font-semibold text-slate-100">{trade.ticker}</span>
                <span className="text-slate-400">{trade.size}</span>
                <StatusBadge value={trade.status} />
                <span className="font-semibold text-sky-300">{trade.nextAction}</span>
              </button>
            ))}
          </div>
        </ShellCard>
        <ShellCard className="p-5">
          <h2 className="text-base font-semibold text-white">Broker assets</h2>
          <p className="mt-1 text-xs text-slate-500">Shows each broker, the assets they own, their tickers, and workflow rules.</p>
          <div className="mt-4 divide-y divide-slate-800">
            {brokers.slice(0, 4).map((broker) => {
              const brokerAssets = assets.filter((asset) => asset.broker === broker.name);
              const brokerWorkflows = workflows.filter((workflow) => workflow.broker === broker.name);
              return (
                <div key={broker.name} className="grid grid-cols-[1fr_auto] gap-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${broker.status === "Active" ? "bg-emerald-400" : "bg-slate-500"}`} />
                      <span className="text-sm font-semibold text-white">{broker.name}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{broker.workflowOwner}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-right">
                    <div><p className="text-[8px] text-slate-600">Assets</p><p className="mt-1 text-sm font-semibold text-white">{brokerAssets.length}</p></div>
                    <div><p className="text-[8px] text-slate-600">Tickers</p><p className="mt-1 text-sm font-semibold text-white">{brokerAssets.length}</p></div>
                    <div><p className="text-[8px] text-slate-600">Workflows</p><p className="mt-1 text-sm font-semibold text-white">{brokerWorkflows.length}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </ShellCard>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4">
        {[
          ["Workflow follow-up", `${workflowRequiredCount} trades need required steps`, "Documents, signatures, approvals, or manual review must be completed before these trades continue.", "workflow_required"],
          ["Eligibility leverage", `${readyCount} trades can advance`, "These trades either have no template or the user/account already completed the private asset workflow.", "already_eligible"],
          ["Trades not matched", `${exceptionCount} trades need review`, "Ops should fix ticker mappings or review restricted asset conditions before the trade moves forward.", "needs_review"],
        ].map(([title, value, detail, status]) => (
          <ShellCard key={title} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-300">{value}</p>
              </div>
              <StatusBadge value={status} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
          </ShellCard>
        ))}
      </div>
      <ShellCard className="mt-5 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Integration status</h2>
            <p className="mt-1 text-xs text-slate-500">Vantage, broker, document, and fill delivery health</p>
          </div>
          <button onClick={() => onSelect("integrations")} className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">Manage <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {["Vantage Blotter API", "Private Broker API", "DocuSign / iCapital", "Fill Return API"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-800 bg-slate-950/35 p-3.5">
              <div className="text-sm font-semibold text-white">{item}</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Connected</div>
            </div>
          ))}
        </div>
      </ShellCard>
    </>
  );
}

function Toolbar({ placeholder, children }: { placeholder: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <input className="h-9 w-full rounded-md border border-slate-800 bg-[#11151b] pl-9 pr-4 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-500/60" placeholder={placeholder} />
      </div>
      {children}
    </div>
  );
}

function TradeRow({ trade, compact = false, onClick }: { trade: Trade; compact?: boolean; onClick?: () => void }) {
  const typeIcon = trade.type === "Buy" || trade.type === "Subscribe" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />;
  return (
    <button onClick={onClick} className={`grid w-full items-center text-left transition hover:bg-slate-800/40 ${compact ? "grid-cols-[36px_1.4fr_1fr_1fr_96px_92px] rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2.5" : `${tradeGridClass} border-t border-slate-800/80 px-5 py-3.5 text-sm`}`}>
      {compact ? (
        <>
          <div className={`flex h-7 w-7 items-center justify-center rounded-md border ${trade.type === "Buy" || trade.type === "Subscribe" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-rose-400/20 bg-rose-400/10 text-rose-300"}`}>{typeIcon}</div>
          <div><div className="text-sm font-semibold text-slate-100">{trade.ticker}</div><div className="mt-0.5 text-[11px] text-slate-500">{trade.broker}</div></div>
          <div><div className="text-[8px] text-slate-600">Quantity</div><div className="mt-1 text-xs font-semibold text-slate-100">{trade.quantity}</div></div>
          <div><div className="text-[8px] text-slate-600">Amount</div><div className="mt-1 text-xs font-semibold text-slate-100">{trade.amount}</div></div>
          <span className="flex justify-start"><StatusBadge value={trade.status} /></span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Clock3 className="h-3.5 w-3.5" />{trade.time}</div>
        </>
      ) : (
        <>
          <span>
            <span className="block text-sm font-semibold text-slate-100">{trade.type} {trade.quantity !== "-" ? trade.quantity : trade.amount}</span>
            <span className="mt-0.5 block text-[11px] text-slate-500">Received {trade.time}</span>
          </span>
          <span className="text-slate-300">{trade.broker}</span>
          <span className="text-xs text-slate-400">{tradeInvestorLabel(trade)}</span>
          <span>
            <span className="block font-semibold text-slate-100">{trade.asset}</span>
            <span className="mt-0.5 block text-[11px] text-sky-300">{trade.ticker}</span>
          </span>
          <span><StatusBadge value={trade.status} /></span>
          <span><StatusBadge value={trade.workflowReason} /></span>
          <span className="text-xs font-semibold text-sky-300">{tradeNextAction(trade)}</span>
        </>
      )}
    </button>
  );
}

function Trades({ openNewTrade, openTrade }: { openNewTrade: () => void; openTrade: (trade: Trade) => void }) {
  return (
    <>
      <PageTitle
        title="PATS Trade Blotter"
        subtitle="Trades after PATS checks the broker, asset, workflow, and next action"
        action={<button onClick={openNewTrade} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white shadow-lg shadow-sky-950/30"><Plus className="h-3.5 w-3.5" />New Manual Trade</button>}
      />
      <Toolbar placeholder="Search trade, ticker, broker, private asset, investor, or workflow status...">
        <button className="rounded-lg border border-slate-800 bg-[#11151b] px-4 text-sm text-slate-200">All Status</button>
        <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#11151b] px-4 text-sm text-slate-200"><Filter className="h-4 w-4" />Filters</button>
        <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#11151b] px-4 text-sm text-slate-200"><Download className="h-4 w-4" />Export</button>
      </Toolbar>
      <ShellCard className="overflow-hidden">
        <TradeTableHeader />
        <div className="space-y-px">
          {trades.map((trade) => <TradeRow key={trade.id} trade={trade} onClick={() => openTrade(trade)} />)}
        </div>
      </ShellCard>
    </>
  );
}

function TableHeader({ columns }: { columns: string[] }) {
  return (
    <div className="grid border-b border-slate-800 bg-slate-950/60 px-5 py-2 text-[8px] font-semibold text-slate-600" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
      {columns.map((column) => <span key={column}>{column}</span>)}
    </div>
  );
}

function TradeTableHeader() {
  return (
    <div className={`grid ${tradeGridClass} border-b border-slate-800 bg-slate-950/60 px-5 py-2 text-[8px] font-semibold text-slate-600`}>
      <span>Trade</span>
      <span>Broker</span>
      <span>Investor / account</span>
      <span>Private asset</span>
      <span>Status</span>
      <span>Workflow</span>
      <span>Next action</span>
    </div>
  );
}

function ExternalTrades({ openItem }: { openItem: (id: string) => void }) {
  return (
    <>
      <PageTitle title="Inbound Blotter" subtitle="Trades received from Vantage and what PATS decided for each one" />
      <Toolbar placeholder="Search source, broker, ticker, private asset, PATS result, or received time...">
        <button className="flex items-center gap-2 rounded-md border border-slate-800 bg-[#11151b] px-3.5 text-xs font-semibold text-slate-200"><Filter className="h-3.5 w-3.5" />Filters</button>
      </Toolbar>
      <ShellCard className="overflow-hidden">
        <TableHeader columns={["Source", "Broker", "Ticker received", "Matched asset", "PATS result", "Next action", "Received"]} />
        <div className="divide-y divide-slate-800/80">
          {externalTrades.map((item) => (
            <button key={item.externalId} onClick={() => openItem(item.externalId)} className="grid w-full grid-cols-7 items-center px-5 py-3.5 text-left text-sm transition hover:bg-slate-900/65">
              <span className="text-xs font-medium text-sky-300">Vantage</span>
              <span className="text-xs text-slate-300">{item.broker}</span>
              <span className="text-sm font-semibold text-slate-100">{item.ticker}</span>
              <span className="text-xs text-slate-300">{item.asset}</span>
              <span><StatusBadge value={item.validation} /></span>
              <span className="text-xs font-semibold text-sky-300">{item.validation === "validated" ? "Move to blotter" : item.validation === "workflow_required" ? "Start workflow" : "Ops review"}</span>
              <span className="text-xs text-slate-500">{item.received}</span>
            </button>
          ))}
        </div>
      </ShellCard>
    </>
  );
}

function Brokers({ openNewBroker }: { openNewBroker: () => void }) {
  const [expandedBroker, setExpandedBroker] = useState<string | null>(null);

  return (
    <>
      <PageTitle title="Asset Brokers" subtitle="Brokers from Vantage with the PATS settings needed for private asset trades" action={<button onClick={openNewBroker} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" />Enable Broker</button>} />
      <Toolbar placeholder="Search broker, workflow owner, fill return, asset, or ticker..." />
      <ShellCard className="overflow-hidden">
        <div className="grid grid-cols-[1.55fr_0.7fr_1fr_1.05fr_0.55fr_0.55fr_0.55fr_0.35fr] border-b border-slate-800 bg-slate-950/60 px-5 py-2 text-[8px] font-semibold text-slate-600">
          <span>Broker</span>
          <span>Status</span>
          <span>Workflow owner</span>
          <span>Fill return</span>
          <span className="text-right">Assets</span>
          <span className="text-right">Tickers</span>
          <span className="text-right">Trades</span>
          <span />
        </div>
        <div className="divide-y divide-slate-800/90">
          {brokers.map((broker) => {
            const isOpen = expandedBroker === broker.name;
            const brokerAssets = assets.filter((asset) => asset.broker === broker.name);
            const brokerWorkflows = workflows.filter((workflow) => workflow.broker === broker.name);

            return (
              <div key={broker.name}>
                <button
                  onClick={() => setExpandedBroker(isOpen ? null : broker.name)}
                  className="grid w-full grid-cols-[1.55fr_0.7fr_1fr_1.05fr_0.55fr_0.55fr_0.55fr_0.35fr] items-center px-5 py-3.5 text-left text-sm transition hover:bg-slate-900/65"
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${broker.status === "Active" ? "bg-emerald-400" : "bg-slate-500"}`} />
                    <span>
                      <span className="block font-semibold text-slate-100">{broker.name}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">{broker.code}</span>
                    </span>
                  </span>
                  <span><StatusBadge value={broker.status} /></span>
                  <span className="text-xs text-slate-400">{broker.workflowOwner}</span>
                  <span className="text-xs text-slate-400">{broker.fillReturn}</span>
                  <span className="text-right text-sm font-semibold text-slate-100">{brokerAssets.length}</span>
                  <span className="text-right text-sm font-semibold text-slate-100">{brokerAssets.length}</span>
                  <span className="text-right text-sm font-semibold text-slate-100">{broker.inboundTrades}</span>
                  <span className="flex justify-end text-slate-500"><ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180 text-sky-300" : ""}`} /></span>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-800 bg-slate-950/35 px-5 py-4">
                    <div className="grid grid-cols-[0.9fr_1.3fr_1fr] gap-5">
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Broker setup</p>
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <Info label="Source" value="Vantage" />
                          <Info label="PATS status" value={broker.status} />
                          <Info label="Assets" value={brokerAssets.length.toString()} />
                          <Info label="Workflow rules" value={brokerWorkflows.length.toString()} />
                          <Info label="Workflow owner" value={broker.workflowOwner} />
                          <Info label="Fill return" value={broker.fillReturn} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Broker tickers</p>
                        <p className="mt-1 text-[11px] text-slate-500">These symbols only have meaning inside this broker relationship.</p>
                        <div className="mt-2 space-y-2">
                          {brokerAssets.length > 0 ? brokerAssets.map((asset) => (
                            <div key={asset.ticker} className="grid grid-cols-[0.45fr_1fr_auto] items-center rounded-md border border-slate-800 bg-[#101318] px-3 py-2 text-xs">
                              <span className="font-semibold text-sky-300">{asset.ticker}</span>
                              <span className="text-slate-300">{asset.name}</span>
                              <StatusBadge value={asset.liquidity} tone={asset.liquidity === "High" ? "green" : asset.liquidity === "Medium" ? "yellow" : "red"} />
                            </div>
                          )) : <p className="text-xs text-slate-500">No broker-scoped tickers configured.</p>}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Operations notes</p>
                        <div className="mt-2 space-y-1.5 text-xs text-slate-400">
                          <p>Private assets must belong to this broker before tickers or workflows can be created.</p>
                          <p>Workflow owner decides who completes documents, signatures, approvals, or manual review.</p>
                          <p>Fill return controls how completed execution results go back to Vantage.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ShellCard>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[8px] font-semibold text-slate-600">{label}</p><p className="mt-1 text-[13px] font-semibold text-slate-100">{value}</p></div>;
}

function PrivateAssets() {
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  return (
    <>
      <PageTitle title="Private Assets" subtitle="Investment products owned by brokers, with their tickers, terms, documents, and workflow rules" />
      <Toolbar placeholder="Search asset, broker, ticker, sponsor, document platform, or workflow rule...">
        <button className="flex items-center gap-2 rounded-md border border-slate-800 bg-[#11151b] px-3.5 text-xs font-semibold text-slate-200"><Filter className="h-3.5 w-3.5" />Filters</button>
      </Toolbar>
      <ShellCard className="overflow-hidden">
        <div className="grid grid-cols-[1.45fr_1.05fr_0.65fr_0.7fr_1fr_0.9fr_1.1fr_0.35fr] border-b border-slate-800 bg-slate-950/60 px-5 py-2 text-[8px] font-semibold text-slate-600">
          <span>Asset</span>
          <span>Broker</span>
          <span>Ticker</span>
          <span>Status</span>
          <span>Terms</span>
          <span>Documents</span>
          <span>Workflow rule</span>
          <span />
        </div>
        <div className="divide-y divide-slate-800/90">
          {assets.map((asset) => {
            const isOpen = expandedAsset === asset.ticker;
            const workflow = workflows.find((flow) => flow.privateAssetId === asset.privateAssetId);
            const workflowLabel = workflow ? displayLabel(workflow.policy) : "No workflow";
            const canTrade = asset.status === "active" && workflow;

            return (
              <div key={asset.ticker}>
                <button
                  onClick={() => setExpandedAsset(isOpen ? null : asset.ticker)}
                  className="grid w-full grid-cols-[1.45fr_1.05fr_0.65fr_0.7fr_1fr_0.9fr_1.1fr_0.35fr] items-center px-5 py-3.5 text-left text-sm transition hover:bg-slate-900/65"
                >
                  <span>
                    <span className="block font-semibold text-slate-100">{asset.name}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{asset.className} - {asset.gpSponsor}</span>
                  </span>
                  <span className="text-xs text-slate-400">{asset.broker}</span>
                  <span className="text-sm font-semibold text-sky-300">{asset.ticker}</span>
                  <span><StatusBadge value={asset.status} tone={asset.status === "active" ? "green" : asset.status === "restricted" ? "yellow" : "red"} /></span>
                  <span className="text-xs text-slate-400">{asset.liquidityTerms}</span>
                  <span className="text-xs text-slate-400">{asset.documentExecutionPlatform}</span>
                  <span><StatusBadge value={workflowLabel} tone={workflow?.policy === "every_trade" ? "yellow" : workflow ? "blue" : "gray"} /></span>
                  <span className="flex justify-end text-slate-500"><ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180 text-sky-300" : ""}`} /></span>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-800 bg-slate-950/35 px-5 py-4">
                    <div className="grid grid-cols-[0.95fr_1.05fr_1.15fr] gap-5">
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Broker setup</p>
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <Info label="Broker" value={asset.broker} />
                          <Info label="Ticker" value={asset.ticker} />
                          <Info label="Status" value={displayLabel(asset.status)} />
                          <Info label="Sponsor" value={asset.gpSponsor} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Investment terms</p>
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <Info label="Asset class" value={asset.className} />
                          <Info label="Structure" value={asset.fundStructure} />
                          <Info label="Liquidity" value={asset.liquidityTerms} />
                          <Info label="Lock-up" value={asset.lockupPeriod} />
                          <Info label="Notice" value={asset.noticePeriod} />
                          <Info label="Tax documents" value={asset.taxDocumentSource} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Trade readiness</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          {[
                            ["Broker enabled", true],
                            ["Asset active", asset.status === "active"],
                            ["Ticker mapped", true],
                            ["Workflow set", Boolean(workflow)],
                            ["Documents defined", Boolean(workflow)],
                            ["Ready to trade", Boolean(canTrade)],
                          ].map(([step, done]) => (
                            <div key={step.toString()} className={`rounded-md border px-2.5 py-2 ${done ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-slate-800 bg-[#101318] text-slate-500"}`}>
                              {step}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 rounded-md border border-slate-800 bg-[#101318] px-3 py-2 text-xs text-slate-400">
                          {workflow ? `${workflow.name} - ${displayLabel(workflow.policy)}` : "No workflow template configured for this asset."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ShellCard>
    </>
  );
}

function WorkflowsLegacy() {
  return (
    <>
      <PageTitle title="Workflows" subtitle="Business rules that decide whether a trade can move forward or needs operational steps first" action={<button className="flex h-9 items-center gap-2 rounded-md bg-sky-500 px-3.5 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" />New Template</button>} />
      <div className="grid grid-cols-[0.85fr_1.25fr] gap-5">
        <ShellCard className="overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-100">Workflow templates by asset</h2>
            <p className="mt-1 text-[11px] text-slate-500">Each template belongs to a broker-owned private asset and controls repeated workflow behavior.</p>
          </div>
          {workflows.map((flow) => (
            <div key={flow.id} className="border-t border-slate-800/80 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-sky-300">{flow.type}</span>
                    <StatusBadge value={flow.status} />
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-100">{flow.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{flow.broker} · {flow.asset}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-300">{flow.requirements}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{flow.updated}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-3 rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2 text-xs">
                <span className="text-slate-400">{flow.focus}</span>
                <StatusBadge value={flow.policy} tone={flow.policy === "every_trade" ? "yellow" : "blue"} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {flow.requirementTypes.map((type) => <StatusBadge key={type} value={type} tone="gray" />)}
              </div>
            </div>
          ))}
        </ShellCard>
        <ShellCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Requirement builder</h2>
              <p className="mt-1 text-xs text-slate-500">How PATS decides if an incoming trade needs workflow or can continue.</p>
            </div>
            <StatusBadge value="Template Active" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {workflowReviewChecks.map((section) => {
              const tone = toneFor(section.status);
              const isBlocked = section.status === "Blocked";
              return (
                <div key={section.group} className={`rounded-md border p-3 ${isBlocked ? "border-rose-400/25 bg-rose-400/10" : "border-slate-800 bg-slate-950/35"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{section.group}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{section.action}</p>
                    </div>
                    <StatusBadge value={section.status} tone={tone} />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {section.checks.map((check) => (
                      <div key={check} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className={`h-1.5 w-1.5 rounded-full ${isBlocked && check.includes("not") ? "bg-rose-400" : "bg-emerald-400"}`} />
                        {check}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-md border border-slate-800 bg-[#0c1117] p-3 text-xs text-slate-400">
            This is the template level. When an inbound trade needs workflow, a TradeWorkflow instance uses these requirements as real steps.
          </div>
        </ShellCard>
      </div>
    </>
  );
}

function Workflows() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id ?? "");
  const [workflowPanel, setWorkflowPanel] = useState<"template" | "requirement" | null>(null);
  const selectedWorkflow = workflows.find((flow) => flow.id === selectedWorkflowId) ?? workflows[0];
  const selectedAsset = assets.find((asset) => asset.privateAssetId === selectedWorkflow.privateAssetId);
  const selectedRequirements = selectedWorkflow.requirementTypes.map((type, index) => ({
    type,
    title: displayLabel(type),
    required: true,
    sortOrder: index + 1,
    status: "active",
  }));

  return (
    <>
      <PageTitle
        title="Workflows"
        subtitle="Rules for each private asset that decide if a trade can move forward or needs steps first"
        action={
          <div className="flex gap-2">
            <button onClick={() => setWorkflowPanel("requirement")} className="flex h-9 items-center gap-1.5 rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs font-semibold text-slate-200"><Plus className="h-3.5 w-3.5" />Add Requirement</button>
            <button onClick={() => setWorkflowPanel("template")} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" />Create Template</button>
          </div>
        }
      />
      <Toolbar placeholder="Search workflow, broker, private asset, policy, requirement, or status..." />
      <div className="grid grid-cols-[0.95fr_1.4fr] gap-5">
        <ShellCard className="overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-100">Templates by private asset</h2>
            <p className="mt-1 text-[11px] text-slate-500">One active template tells PATS what steps are needed for that broker-owned asset.</p>
          </div>
          <div className="divide-y divide-slate-800/80">
            {workflows.map((flow) => {
              const isSelected = flow.id === selectedWorkflow.id;
              return (
                <button
                  key={flow.id}
                  onClick={() => setSelectedWorkflowId(flow.id)}
                  className={`w-full px-5 py-4 text-left transition ${isSelected ? "bg-sky-400/10" : "hover:bg-slate-900/65"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge value={flow.status} />
                        <StatusBadge value={displayLabel(flow.policy)} tone={flow.policy === "every_trade" ? "yellow" : "blue"} />
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-slate-100">{flow.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{flow.broker}</p>
                      <p className="mt-0.5 text-xs font-semibold text-sky-300">{flow.asset}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-300">{flow.requirements}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{flow.updated}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ShellCard>

        <div className="space-y-5">
          <ShellCard className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedWorkflow.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{selectedWorkflow.broker} - {selectedWorkflow.asset}</p>
              </div>
              <StatusBadge value={selectedWorkflow.status} />
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <p className="text-[8px] font-semibold text-slate-600">Private asset</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{selectedWorkflow.asset}</p>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <p className="text-[8px] font-semibold text-slate-600">Broker</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{selectedWorkflow.broker}</p>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <p className="text-[8px] font-semibold text-slate-600">When it applies</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{displayLabel(selectedWorkflow.policy)}</p>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <p className="text-[8px] font-semibold text-slate-600">Requirements</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{selectedRequirements.length}</p>
              </div>
            </div>
            <div className="mt-4 rounded-md border border-slate-800 bg-[#101318] p-3 text-xs text-slate-400">
              {selectedWorkflow.policy === "once_per_user"
                ? "Once the user or account completes this workflow, future trades for this asset can skip the same steps through eligibility."
                : "Every trade for this asset must complete these steps before it can move forward."}
            </div>
          </ShellCard>

          <ShellCard className="overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-100">Requirements in order</h2>
              <p className="mt-1 text-[11px] text-slate-500">These are the steps PATS uses when this template creates a trade workflow.</p>
            </div>
            <div className="grid grid-cols-[0.35fr_1fr_0.8fr_0.6fr_0.55fr] border-b border-slate-800 bg-slate-950/40 px-5 py-2 text-[8px] font-semibold text-slate-600">
              <span>Order</span>
              <span>Requirement</span>
              <span>Type</span>
              <span>Required</span>
              <span>Status</span>
            </div>
            {selectedRequirements.map((requirement) => (
              <div key={`${selectedWorkflow.id}-${requirement.type}`} className="grid grid-cols-[0.35fr_1fr_0.8fr_0.6fr_0.55fr] items-center border-t border-slate-800/80 px-5 py-3 text-sm">
                <span className="text-xs font-semibold text-slate-500">{requirement.sortOrder}</span>
                <span className="font-semibold text-slate-100">{requirement.title}</span>
                <span><StatusBadge value={displayLabel(requirement.type)} tone="gray" /></span>
                <span className="text-xs text-slate-300">{requirement.required ? "Yes" : "No"}</span>
                <span><StatusBadge value={requirement.status} /></span>
              </div>
            ))}
          </ShellCard>

          <ShellCard className="p-5">
            <h2 className="text-sm font-semibold text-white">How this affects a trade</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {["Trade received", "Asset matched", "Template checked", selectedWorkflow.policy === "once_per_user" ? "Eligibility checked" : "Steps required", "Trade can continue"].map((step, index) => (
                <div key={step} className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-sky-400/25 bg-sky-400/10 text-[10px] font-semibold text-sky-300">{index + 1}</span>
                  <p className="mt-2 text-xs font-semibold text-slate-100">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Info label="Document platform" value={selectedAsset?.documentExecutionPlatform ?? "Not set"} />
              <Info label="Tax document source" value={selectedAsset?.taxDocumentSource ?? "Not set"} />
            </div>
          </ShellCard>
        </div>
      </div>
      {workflowPanel === "template" && <CreateWorkflowTemplatePanel onClose={() => setWorkflowPanel(null)} />}
      {workflowPanel === "requirement" && <AddWorkflowRequirementPanel workflow={selectedWorkflow} onClose={() => setWorkflowPanel(null)} />}
    </>
  );
}

function CreateWorkflowTemplatePanel({ onClose }: { onClose: () => void }) {
  return (
    <DetailPanel title="Create Workflow Template" subtitle="Define the workflow rules for one broker-owned private asset" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Template owner</h3>
          <p className="mt-1 text-xs text-slate-500">A workflow template must belong to one broker and one private asset.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Broker">
              <select className={compactInputClass}>
                {brokers.filter((broker) => broker.status === "Active").map((broker) => <option key={broker.patsBrokerProfileId}>{broker.name}</option>)}
              </select>
            </FormField>
            <FormField label="Private asset">
              <select className={compactInputClass}>
                {assets.map((asset) => <option key={asset.privateAssetId}>{asset.name}</option>)}
              </select>
            </FormField>
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Workflow rule</h3>
          <div className="mt-4 space-y-3">
            <FormField label="Template name">
              <input className={compactInputClass} placeholder="Subscription workflow" />
            </FormField>
            <FormField label="Description">
              <input className={compactInputClass} placeholder="Required documents and approvals before trading" />
            </FormField>
            <FormField label="When should this workflow apply?">
              <select className={compactInputClass}>
                <option value="once_per_user">Once per user or account</option>
                <option value="every_trade">Every trade</option>
              </select>
            </FormField>
          </div>
        </ShellCard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={onClose} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Create Template</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function AddWorkflowRequirementPanel({ workflow, onClose }: { workflow: typeof workflows[number]; onClose: () => void }) {
  return (
    <DetailPanel title="Add Requirement" subtitle={`Add a step to ${workflow.name}`} onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Selected template</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Info label="Template" value={workflow.name} />
            <Info label="Private asset" value={workflow.asset} />
            <Info label="Broker" value={workflow.broker} />
            <Info label="Policy" value={displayLabel(workflow.policy)} />
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Requirement details</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Type">
              <select className={compactInputClass}>
                <option value="document">Document</option>
                <option value="signature">Signature</option>
                <option value="approval">Approval</option>
                <option value="liquidity_check">Liquidity check</option>
                <option value="lockup_check">Lock-up check</option>
                <option value="notice_period_check">Notice period check</option>
                <option value="manual_review">Manual review</option>
                <option value="external_platform">External platform</option>
              </select>
            </FormField>
            <FormField label="Order">
              <input className={compactInputClass} placeholder="1" />
            </FormField>
            <FormField label="Title">
              <input className={compactInputClass} placeholder="Subscription agreement" />
            </FormField>
            <FormField label="Required">
              <select className={compactInputClass}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </FormField>
          </div>
          <div className="mt-3">
            <FormField label="Description">
              <input className={compactInputClass} placeholder="What Ops must complete before the trade moves forward" />
            </FormField>
          </div>
        </ShellCard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={onClose} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Add Requirement</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function DocumentsLegacy() {
  return (
    <>
      <PageTitle title="Documents" subtitle="Mocked document records derived from workflow requirements; the real Documents module is the next backend step" />
      <Toolbar placeholder="Search document, trade, asset, broker, platform, assignee, or status..." />
      <div className="grid grid-cols-[1.05fr_0.95fr] gap-5">
        <ShellCard className="overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-100">Workflow document requirements</h2>
            <p className="mt-1 text-[11px] text-slate-500">These records come from workflow requirements for each broker-owned private asset.</p>
          </div>
          <div className="grid grid-cols-[1.15fr_0.65fr_0.85fr_0.85fr_0.75fr_0.75fr] border-b border-slate-800 bg-slate-950/40 px-5 py-2 text-[8px] font-semibold text-slate-600">
            <span>Document</span>
            <span>Trade</span>
            <span>Platform</span>
            <span>Envelope</span>
            <span>Status</span>
            <span>Due</span>
          </div>
          {documents.map((doc) => (
            <div key={doc.name} className="grid grid-cols-[1.15fr_0.65fr_0.85fr_0.85fr_0.75fr_0.75fr] items-center border-t border-slate-800/80 px-5 py-4 text-sm">
              <span>
                <span className="block font-semibold text-slate-100">{doc.name}</span>
                <span className="mt-1 block text-[11px] text-slate-500">{doc.asset} · {doc.broker}</span>
              </span>
              <span className="text-xs text-sky-300">{doc.tradeId.replace("it_", "Trade ")}</span>
              <span className="text-xs text-slate-300">{doc.platform}</span>
              <span className="text-xs text-slate-500">{doc.envelope}</span>
              <span><StatusBadge value={doc.status} /></span>
              <span className={`text-xs ${doc.due === "Overdue" ? "font-semibold text-rose-300" : "text-slate-400"}`}>{doc.due}</span>
            </div>
          ))}
        </ShellCard>
        <ShellCard className="p-5">
          <h2 className="text-base font-semibold text-white">Document module target flow</h2>
          <p className="mt-1 text-xs text-slate-500">The UI is showing the intended lifecycle, but today these records are still mocked until the Documents backend exists.</p>
          <div className="mt-5 space-y-3">
            {[
              ["1", "Workflow step requires document", "A document or signature is needed before the trade can continue.", "completed"],
              ["2", "Ops uploads or creates envelope", "Initial approach is manual upload by Ops; DocuSign/iCapital can be added behind this module.", "sent"],
              ["3", "Document status changes", "pending, sent, signed, completed, or blocked is stored on the future document entity.", "waiting"],
              ["4", "Step can complete", "When the document satisfies the requirement, the related TradeWorkflowStep can be completed.", "pending"],
            ].map(([number, title, description, status]) => (
              <div key={title} className="grid grid-cols-[24px_1fr_auto] gap-3 rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-sky-400/25 bg-sky-400/10 text-[10px] font-semibold text-sky-300">{number}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{description}</p>
                </div>
                <StatusBadge value={status} />
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Info label="Module status" value="Planned module" />
            <Info label="First source" value="Manual Ops upload" />
          </div>
        </ShellCard>
      </div>
    </>
  );
}

function documentNextAction(doc: typeof documents[number]) {
  if (doc.status === "pending") return doc.platform === "Manual Upload" ? "Upload document" : "Send for signature";
  if (doc.status === "sent") return "Wait for signature";
  if (doc.status === "signed") return "Complete step";
  if (doc.status === "completed") return "No action";
  if (doc.status === "blocked") return "Fix document issue";
  return "Review";
}

function Documents() {
  const [selectedDocumentId, setSelectedDocumentId] = useState(documents[0]?.documentId ?? "");
  const selectedDocument = documents.find((doc) => doc.documentId === selectedDocumentId) ?? documents[0];
  const relatedTrade = trades.find((trade) => trade.inboundTradeId === selectedDocument.tradeId);
  const documentFlow = [
    ["Required", "Workflow step needs this document"],
    ["Prepared", selectedDocument.platform === "Manual Upload" ? "Ops uploads the file" : "Envelope or platform task is created"],
    ["Signed / uploaded", "Investor, broker, or Ops completes the document"],
    ["Completed", "The related workflow step can be completed"],
  ];
  const activeStep = selectedDocument.status === "completed" ? 4 : selectedDocument.status === "signed" ? 3 : selectedDocument.status === "sent" ? 2 : 1;

  return (
    <>
      <PageTitle title="Documents" subtitle="Documents and signatures required by workflows before a trade can continue" />
      <Toolbar placeholder="Search document, broker, private asset, platform, status, or next action..." />
      <div className="grid grid-cols-[1.25fr_0.95fr] gap-5">
        <ShellCard className="overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-100">Document work</h2>
            <p className="mt-1 text-[11px] text-slate-500">Each item is tied to a workflow step for a broker-owned private asset.</p>
          </div>
          <div className="grid grid-cols-[1.2fr_1fr_0.7fr_0.65fr_0.9fr] border-b border-slate-800 bg-slate-950/40 px-5 py-2 text-[8px] font-semibold text-slate-600">
            <span>Document</span>
            <span>Asset / broker</span>
            <span>Platform</span>
            <span>Status</span>
            <span>Next action</span>
          </div>
          <div className="divide-y divide-slate-800/80">
            {documents.map((doc) => {
              const isSelected = doc.documentId === selectedDocument.documentId;
              return (
                <button
                  key={doc.documentId}
                  onClick={() => setSelectedDocumentId(doc.documentId)}
                  className={`grid w-full grid-cols-[1.2fr_1fr_0.7fr_0.65fr_0.9fr] items-center px-5 py-4 text-left text-sm transition ${isSelected ? "bg-sky-400/10" : "hover:bg-slate-900/65"}`}
                >
                  <span>
                    <span className="block font-semibold text-slate-100">{doc.name}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{doc.due === "Overdue" ? "Overdue" : `Due ${doc.due}`}</span>
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-300">{doc.asset}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{doc.broker}</span>
                  </span>
                  <span className="text-xs text-slate-300">{doc.platform}</span>
                  <span><StatusBadge value={doc.status} /></span>
                  <span className="text-xs font-semibold text-sky-300">{documentNextAction(doc)}</span>
                </button>
              );
            })}
          </div>
        </ShellCard>

        <div className="space-y-5">
          <ShellCard className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedDocument.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{selectedDocument.asset} - {selectedDocument.broker}</p>
              </div>
              <StatusBadge value={selectedDocument.status} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Info label="Platform" value={selectedDocument.platform} />
              <Info label="Due" value={selectedDocument.due} />
              <Info label="Related trade" value={relatedTrade ? `${relatedTrade.ticker} - ${tradeInvestorLabel(relatedTrade)}` : "Not assigned"} />
              <Info label="Next action" value={documentNextAction(selectedDocument)} />
            </div>
            <div className="mt-4 rounded-md border border-slate-800 bg-[#101318] p-3 text-xs text-slate-400">
              {selectedDocument.callback}
            </div>
          </ShellCard>

          <ShellCard className="p-5">
            <h2 className="text-sm font-semibold text-white">Document progress</h2>
            <div className="mt-4 space-y-3">
              {documentFlow.map(([title, description], index) => {
                const isDone = index + 1 <= activeStep && selectedDocument.status !== "blocked";
                const isBlocked = selectedDocument.status === "blocked" && index === 1;
                return (
                  <div key={title} className={`grid grid-cols-[24px_1fr] gap-3 rounded-md border p-3 ${isBlocked ? "border-rose-400/25 bg-rose-400/10" : isDone ? "border-emerald-400/20 bg-emerald-400/10" : "border-slate-800 bg-slate-950/35"}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${isBlocked ? "border-rose-400/30 bg-rose-400/10 text-rose-300" : isDone ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-slate-700 bg-slate-900 text-slate-500"}`}>{index + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{title}</p>
                      <p className="mt-1 text-xs text-slate-500">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ShellCard>

          <ShellCard className="p-5">
            <h2 className="text-sm font-semibold text-white">Backend direction</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">The first version should support manual Ops upload. DocuSign and iCapital can be added later behind the same document status flow.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Upload document</button>
              <button className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Mark complete</button>
            </div>
          </ShellCard>
        </div>
      </div>
    </>
  );
}

function Execution() {
  return (
    <>
      <PageTitle title="Execution Flow" subtitle="TradeWorkflow instances and step status before a trade can move from workflow_required to validated" />
      <div className="space-y-4">
        {executionFlows.map((flow) => (
          <ShellCard key={flow.tradeId} className="p-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-sky-300">{flow.tradeId}</span>
                  <span className="text-sm font-semibold text-white">{flow.ticker}</span>
                  <StatusBadge value={flow.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{flow.asset} · {flow.broker}</p>
              </div>
              <div className="grid grid-cols-3 gap-5 text-right">
                <Info label="Workflow" value={flow.status} />
                <Info label="Private asset" value={flow.asset} />
                <Info label="Updated" value={flow.lastUpdate} />
              </div>
            </div>

            <div className="mt-5">
              <div className="grid grid-cols-7 gap-2">
                {executionSteps.map((step, index) => {
                  const isDone = index < flow.currentStep && flow.blockedStep !== index;
                  const isCurrent = index === flow.currentStep;
                  const isBlocked = flow.blockedStep === index;
                  const toneClass = isBlocked
                    ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
                    : isDone
                      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                      : isCurrent
                        ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
                        : "border-slate-800 bg-slate-950/40 text-slate-500";

                  return (
                    <div key={step} className={`relative rounded-md border px-3 py-3 ${toneClass}`}>
                      {index < executionSteps.length - 1 && (
                        <span className={`absolute left-[calc(100%+2px)] top-1/2 h-px w-2 -translate-y-1/2 ${isDone ? "bg-emerald-400/50" : "bg-slate-800"}`} />
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${isBlocked ? "bg-rose-400" : isDone ? "bg-emerald-400" : isCurrent ? "bg-sky-400" : "bg-slate-600"}`} />
                        <span className="text-xs font-semibold">{step}</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-80">
                        {isBlocked ? "Blocked" : isDone ? "Done" : isCurrent ? "Current" : "Waiting"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_1fr] gap-3">
              <div className="rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2 text-xs text-slate-400">
                Source: inbound trade -&gt; ticker resolution -&gt; workflow decision
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2 text-xs text-slate-400">
                Result: required steps completed -&gt; inbound trade validated -&gt; eligibility can be created
              </div>
            </div>

            <div className="mt-4 hidden grid-cols-[1fr_1fr] gap-3">
              <div className="rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2 text-xs text-slate-400">
                Source: Vantage Blotter → PATS → {flow.broker}
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2 text-xs text-slate-400">
                Return: Broker Fill → PATS normalized fill → {flow.destination}
              </div>
            </div>
          </ShellCard>
        ))}
      </div>
    </>
  );
}

function Integrations() {
  const rows = [
    ["Vantage Blotter API", "Inbound trades and outbound fill return", "1,245", "99.9%", "42ms", "2 minutes ago"],
    ["Private Broker API", "Broker routing, confirmations, and fill intake", "3,882", "99.7%", "18ms", "1 minute ago"],
    ["Document Platforms", "DocuSign, iCapital, and manual document steps", "941", "99.5%", "62ms", "5 minutes ago"],
    ["Fill Return Webhook", "Normalized fill delivery back to Vantage", "728", "99.4%", "58ms", "3 minutes ago"],
  ];
  return (
    <>
      <PageTitle title="Integrations" subtitle="Manage Vantage, broker, document, and fill-return connections" />
      <div className="mb-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />All systems operational</div>
        <p className="mt-2 text-xs text-slate-400">Inbound blotter, broker routing, workflow documents, and fill return are currently healthy.</p>
      </div>
      <div className="space-y-4">
        {rows.map(([name, desc, requests, uptime, latency, last]) => (
          <ShellCard key={name} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-400/10"><Plug className="h-4 w-4 text-sky-300" /></div>
                <div><h2 className="text-sm font-semibold text-white">{name}</h2><p className="mt-1 text-xs text-slate-500">{desc}</p></div>
              </div>
              <div className="flex items-center gap-4"><StatusBadge value="Connected" /><Settings className="h-4 w-4 text-slate-500" /></div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              <InfoBox label="Requests Today" value={requests} />
              <InfoBox label="Uptime" value={uptime} accent />
              <InfoBox label="Avg Latency" value={latency} />
              <InfoBox label="Last Activity" value={last} />
            </div>
          </ShellCard>
        ))}
      </div>
    </>
  );
}

function InfoBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3"><p className="text-[10px] text-slate-500">{label}</p><p className={`mt-1.5 text-base font-semibold ${accent ? "text-emerald-400" : "text-white"}`}>{value}</p></div>;
}

function ActivityLog() {
  return (
    <>
      <PageTitle title="Activity" subtitle="Audit log for users, systems, and external events" />
      <ShellCard className="p-6">
        <Timeline items={activityEvents} current={activityEvents.length - 1} />
      </ShellCard>
    </>
  );
}

function AlertsPage() {
  return (
    <>
      <PageTitle title="Alerts & Exceptions" subtitle="Operational issues that need review or resolution" />
      <ShellCard className="overflow-hidden">
        <TableHeader columns={["Severity", "Entity", "Issue", "Status", "Owner", "Created"]} />
        {alerts.map((alert) => (
          <div key={alert.entity} className="grid grid-cols-6 items-center border-t border-slate-800/80 px-5 py-4 text-sm">
            <span><StatusBadge value={alert.severity} tone={alert.severity === "Critical" || alert.severity === "High" ? "red" : alert.severity === "Medium" ? "yellow" : "blue"} /></span>
            <span className="text-xs text-sky-300">{alert.entity}</span>
            <span className="text-sm text-slate-100">{alert.issue}</span>
            <span><StatusBadge value={alert.status} /></span>
            <span className="text-xs text-slate-300">{alert.owner}</span>
            <span className="text-xs text-slate-500">{alert.created}</span>
          </div>
        ))}
      </ShellCard>
    </>
  );
}

function SettingsPage() {
  const settings = [
    ["Users and Roles", "Trader, Operations, Admin, Compliance", Users],
    ["Broker Configuration", "Routes, settlement, supported asset classes", Building2],
    ["Integration Credentials", "SS&C, FIX, API credentials", KeyRound],
    ["Fill Return Destinations", "Outbound fill delivery back to Vantage", Send],
    ["Trade Validation Rules", "Lock-up, supply, ticker and workflow rules", Shield],
    ["Status Mapping", "Normalize external statuses into PATS lifecycle", Route],
  ] as const;
  return (
    <>
      <PageTitle title="Settings" subtitle="Admin configuration for users, integrations, brokers, and rules" />
      <div className="grid grid-cols-2 gap-5">
        {settings.map(([title, desc, Icon]) => (
          <ShellCard key={title} className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10"><Icon className="h-6 w-6 text-blue-300" /></div>
              <div><h2 className="text-lg font-semibold text-white">{title}</h2><p className="mt-1 text-sm text-slate-400">{desc}</p></div>
            </div>
          </ShellCard>
        ))}
      </div>
    </>
  );
}

function Timeline({ items, current, blocked }: { items: string[]; current: number; blocked?: number }) {
  return (
    <div className="mt-5 space-y-3.5">
      {items.map((item, index) => {
        const state = blocked === index ? "blocked" : index < current ? "done" : index === current ? "current" : "pending";
        return (
          <div key={item} className="flex gap-3">
            <div className={`mt-1 h-2.5 w-2.5 rounded-full border ${state === "done" ? "border-emerald-400 bg-emerald-400" : state === "current" ? "border-sky-400 bg-sky-400" : state === "blocked" ? "border-rose-400 bg-rose-400" : "border-slate-600"}`} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">{item}</p>
              <p className={`mt-0.5 text-xs ${state === "blocked" ? "text-rose-300" : state === "done" ? "text-emerald-300/80" : state === "current" ? "text-sky-300/80" : "text-slate-500"}`}>
                {state === "blocked" ? "Blocked by missing requirement" : state === "done" ? "Completed" : state === "current" ? "Current step" : "Pending"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailPanel({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <button
        aria-label="Close panel overlay"
        className="fixed inset-0 z-[35] cursor-default bg-black/55 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-40 w-[540px] border-l border-slate-800 bg-[#0d1015] shadow-2xl">
        <div className="flex h-20 items-start justify-between border-b border-slate-800 p-5">
          <div><h2 className="text-lg font-semibold text-white">{title}</h2>{subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="h-[calc(100vh-80px)] overflow-y-auto p-5">{children}</div>
      </div>
    </>
  );
}

function TradeDetails({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  return (
    <DetailPanel title="Trade Details" subtitle={`${trade.ticker} · ${trade.broker}`} onClose={onClose}>
      <ShellCard className="mb-5 p-6"><p className="text-sm text-slate-500">Current Status</p><div className="mt-5"><StatusBadge value={trade.status} /></div></ShellCard>
      <ShellCard className="mb-5 p-6">
        <h3 className="mb-5 text-lg font-semibold text-white">Trade summary</h3>
        <div className="grid grid-cols-2 gap-5">
          <Info label="Broker" value={trade.broker} />
          <Info label="Private asset" value={trade.asset} />
          <Info label="Ticker" value={trade.ticker} />
          <Info label="Side / action" value={trade.type} />
          <Info label="Quantity" value={trade.quantity} />
          <Info label="Amount" value={trade.amount} />
          <Info label="Investor / account" value={`${trade.userId?.replace("user-", "User ") ?? "Unknown"} / ${trade.accountId?.replace("acct-", "Account ") ?? "Unknown"}`} />
          <Info label="Workflow needed" value={trade.workflowRequired ? "Yes" : "No"} />
          <Info label="Business reason" value={displayLabel(trade.workflowReason)} />
        </div>
      </ShellCard>
      <ShellCard className="mb-5 p-6">
        <h3 className="text-lg font-semibold text-white">Workflow process</h3>
        <Timeline items={["Trade received from Vantage", "Broker ticker matched to private asset", "Workflow template checked", "Eligibility reviewed", trade.workflowRequired ? "Ops must complete workflow steps" : "Trade can move forward"]} current={trade.status === "validated" ? 5 : trade.status === "workflow_required" ? 4 : 2} />
      </ShellCard>
      <ShellCard className="p-6">
        <h3 className="text-lg font-semibold text-white">Action for operations</h3>
        <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/35 p-4">
          <p className="text-sm font-semibold text-slate-100">
            {trade.workflowRequired ? "Complete the required workflow before this trade can continue." : "No additional workflow action is required right now."}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {trade.workflowReason === "already_eligible"
              ? "This user or account already completed the private asset requirements."
              : trade.workflowReason === "no_template"
                ? "No workflow template is configured for this asset, so the trade can continue."
                : trade.workflowReason === "every_trade"
                  ? "This private asset requires review on every trade."
                  : trade.workflowReason === "no_eligibility"
                    ? "This user or account has not completed the required onboarding yet."
                    : "Operations needs to review the trade before it can move forward."}
          </p>
        </div>
      </ShellCard>
    </DetailPanel>
  );
}

function BrokerDetails({ broker, onClose }: { broker: Broker; onClose: () => void }) {
  return (
    <DetailPanel title={broker.name} subtitle="Private asset broker profile" onClose={onClose}>
      <ShellCard className="mb-5 p-6">
        <h3 className="text-lg font-semibold text-white">Overview</h3>
        <div className="mt-5 grid grid-cols-2 gap-5">
          <Info label="Broker code" value={broker.code} />
          <Info label="Sync source" value="Vantage" />
          <Info label="Inbound Trades" value={broker.inboundTrades.toString()} />
          <Info label="Listed Assets" value={broker.listedAssets.toString()} />
          <Info label="Workflow Owner" value={broker.workflowOwner} />
          <Info label="Fill return" value={broker.fillReturn} />
        </div>
      </ShellCard>
      <ShellCard className="mb-5 p-6">
        <h3 className="text-lg font-semibold text-white">Broker Tickers</h3>
        <p className="mt-2 text-sm text-slate-400">Broker → Broker Ticker → Private Asset</p>
        <div className="mt-5 space-y-3">
          {assets.filter((asset) => asset.broker === broker.name).map((asset) => (
            <div key={asset.ticker} className="rounded-xl bg-white/5 p-4">
              <div className="font-semibold text-white">{broker.name}</div>
              <div className="mt-2 text-sm text-slate-400">{asset.ticker} → {asset.name}</div>
            </div>
          ))}
        </div>
      </ShellCard>
      <ShellCard className="p-6">
        <h3 className="text-lg font-semibold text-white">Contacts & Rules</h3>
        <div className="mt-5 space-y-3 text-sm text-slate-300">
          {broker.contacts.map((contact) => <p key={contact}>{contact}</p>)}
          <p>Required documents: Subscription Agreement, Tax Package</p>
          <p>Systems: {broker.systems.join(", ")}</p>
          <p>Confirmation: {broker.fillReturn}</p>
        </div>
      </ShellCard>
    </DetailPanel>
  );
}

function AssetDetails({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  return (
    <DetailPanel title={asset.name} subtitle={`${asset.ticker} · ${asset.broker}`} onClose={onClose}>
      <ShellCard className="mb-5 p-6">
        <h3 className="text-lg font-semibold text-white">Lifecycle</h3>
        <Timeline items={["Asset created", "Broker ticker created", "Onboarding started", "Documents in progress", "Trade routed", "Fill returned to Vantage"]} current={3} blocked={3} />
      </ShellCard>
      <ShellCard className="mb-5 p-6">
        <h3 className="text-lg font-semibold text-white">Terms</h3>
        <div className="mt-5 grid grid-cols-2 gap-5">
          <Info label="Broker" value={asset.broker} />
          <Info label="Broker ticker" value={asset.ticker} />
          <Info label="Asset class" value={asset.className} />
          <Info label="Precept category" value={asset.preceptAssetClass} />
          <Info label="Fund structure" value={asset.fundStructure} />
          <Info label="Sponsor" value={asset.gpSponsor} />
          <Info label="Tax source" value={asset.taxDocumentSource} />
          <Info label="Document platform" value={asset.documentExecutionPlatform} />
        </div>
      </ShellCard>
      <ShellCard className="p-6">
        <h3 className="text-lg font-semibold text-white">Broker Listing</h3>
        <div className="mt-5 rounded-xl bg-white/5 p-4 text-slate-300">{asset.broker} → {asset.ticker} → {asset.name}</div>
      </ShellCard>
    </DetailPanel>
  );
}

function ExternalTradeDetails({ id, onClose }: { id: string; onClose: () => void }) {
  const item = externalTrades.find((trade) => trade.externalId === id) ?? externalTrades[0];
  return (
    <DetailPanel title="Inbound Trade Review" subtitle={`${item.ticker} · ${item.broker}`} onClose={onClose}>
      <ShellCard className="mb-5 p-5">
        <h3 className="text-sm font-semibold text-white">Business summary</h3>
        <div className="mt-5 grid grid-cols-2 gap-5">
          <Info label="Source" value={item.source} />
          <Info label="Broker" value={item.broker} />
          <Info label="Ticker" value={item.ticker} />
          <Info label="Private asset" value={item.asset} />
          <Info label="PATS result" value={displayLabel(item.validation)} />
          <Info label="Workflow result" value={displayLabel(item.execution)} />
        </div>
      </ShellCard>
      <ShellCard className="mb-5 p-5">
        <h3 className="text-sm font-semibold text-white">What PATS did</h3>
        <Timeline items={["Received the trade from Vantage", "Matched broker ticker to a private asset", "Checked if the asset has workflow rules", "Checked eligibility for this user or account", "Assigned the next operational status"]} current={item.validation === "validated" ? 5 : item.validation === "workflow_required" ? 4 : 2} />
      </ShellCard>
      <ShellCard className="p-5">
        <h3 className="text-sm font-semibold text-white">Recommended action</h3>
        <p className="mt-3 text-sm text-slate-300">
          {item.validation === "validated"
            ? item.execution === "already_eligible"
              ? "This trade can continue because the user or account already completed the private asset requirements."
              : "This trade can continue because PATS did not find any blocking workflow requirement."
            : item.validation === "workflow_required"
              ? "Operations should open the workflow checklist and complete the required steps before this trade continues."
              : "Operations should review the broker ticker mapping or asset configuration before this trade continues."}
        </p>
      </ShellCard>
    </DetailPanel>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const compactInputClass = "h-9 w-full rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-500/60";

function NewTradePanel({ onClose }: { onClose: () => void }) {
  return (
    <DetailPanel title="New Manual Trade" subtitle="Manual entry for trades not received from Vantage Blotter" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Trade context</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["Broker", "Broker ticker", "Linked private asset"].map((label) => (
              <FormField key={label} label={label}>
                <select className={compactInputClass}>
                  <option>Select {label.toLowerCase()}</option>
                </select>
              </FormField>
            ))}
          </div>
          <div className="mt-3">
            <FormField label="Source">
              <select className={compactInputClass}>
                <option>Manual / PATS</option>
                <option>Vantage Blotter correction</option>
              </select>
            </FormField>
          </div>
          <div className="mt-3">
            <FormField label="Account / investor / entity">
              <select className={compactInputClass}>
                <option>Select account / investor / entity</option>
              </select>
            </FormField>
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Order details</h3>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-300">Trade type</span>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {["Buy", "Sell", "Subscribe", "Redeem"].map((type, index) => (
                <button key={type} className={`h-8 rounded-md border text-xs font-semibold ${index === 0 ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : type === "Sell" || type === "Redeem" ? "border-rose-400/20 bg-rose-400/10 text-rose-300" : "border-slate-700 bg-slate-900 text-slate-300"}`}>{type}</button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <FormField label="Quantity or amount">
              <input className={compactInputClass} placeholder="10,000 or $500,000" />
            </FormField>
          </div>
          <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/35 p-3">
            <p className="text-xs font-semibold text-slate-100">PATS will run the same checks used for Vantage inbound trades.</p>
            <p className="mt-1 text-xs text-slate-500">Broker ticker match, private asset ownership, workflow policy, and eligibility decide the next operational status.</p>
          </div>
        </ShellCard>

        <div className="rounded-md border border-amber-400/25 bg-amber-400/10 p-3">
          <div className="flex gap-2.5 text-amber-200"><AlertTriangle className="mt-0.5 h-3.5 w-3.5" /><div><p className="text-xs font-semibold">Workflow checks required</p><p className="mt-1 text-xs text-amber-100/70">Documents and lock-up rules will be validated before routing.</p></div></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Create Trade</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function ConfigureBrokerPanel({ onClose }: { onClose: () => void }) {
  return (
    <DetailPanel title="Enable Broker" subtitle="Select a Vantage broker and set the PATS rules used for private asset trades" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Broker from Vantage</h3>
          <p className="mt-1 text-xs text-slate-500">PATS keeps the Vantage broker as the source and adds private asset rules on top.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Vantage broker">
              <select className={compactInputClass}>
                <option>Goldman Sachs Advisor Solutions</option>
                <option>Morgan Stanley Alternatives</option>
                <option>JP Morgan Private Markets</option>
                <option>Schwab Alternative Investments</option>
              </select>
            </FormField>
            <FormField label="PATS status">
              <select className={compactInputClass}>
                <option>Enabled</option>
                <option>Pending setup</option>
                <option>Disabled</option>
              </select>
            </FormField>
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">PATS settings</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Workflow owner">
              <select className={compactInputClass}>
                <option>Broker + PATS Ops</option>
                <option>PATS Ops</option>
                <option>Broker workflow</option>
                <option>External platform</option>
              </select>
            </FormField>
            <FormField label="Fill return method">
              <select className={compactInputClass}>
                <option>PATS returns fill to Vantage</option>
                <option>API confirmation to PATS</option>
                <option>Manual confirmation to PATS</option>
                <option>Workflow completion event</option>
              </select>
            </FormField>
          </div>
          <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/35 p-3">
            <p className="text-xs font-semibold text-slate-100">Private assets, broker tickers, and workflow templates are configured after the broker is enabled.</p>
            <p className="mt-1 text-xs text-slate-500">This keeps broker setup focused and avoids mixing broker configuration with asset setup.</p>
          </div>
        </ShellCard>

        <ShellCard className="hidden p-4">
          <h3 className="text-sm font-semibold text-white">Initial broker-scoped ticker</h3>
          <p className="mt-1 text-xs text-slate-500">Optional setup to show the Broker → Ticker → Private Asset relationship.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Ticker code">
              <input className={compactInputClass} placeholder="TECH-A" />
            </FormField>
            <FormField label="Linked asset">
              <select className={compactInputClass}>
                <option>Select private asset</option>
                {assets.map((asset) => <option key={asset.ticker}>{asset.name}</option>)}
              </select>
            </FormField>
          </div>
        </ShellCard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Enable Broker</button>
        </div>
      </div>
    </DetailPanel>
  );
}

export default function PatsPlatform() {
  const [active, setActive] = useState<NavKey>("dashboard");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedExternal, setSelectedExternal] = useState<string | null>(null);
  const [newTradeOpen, setNewTradeOpen] = useState(false);
  const [newBrokerOpen, setNewBrokerOpen] = useState(false);

  const content = useMemo(() => {
    switch (active) {
      case "dashboard": return <Dashboard onSelect={setActive} />;
      case "trades": return <Trades openNewTrade={() => setNewTradeOpen(true)} openTrade={setSelectedTrade} />;
      case "externalTrades": return <ExternalTrades openItem={setSelectedExternal} />;
      case "brokers": return <Brokers openNewBroker={() => setNewBrokerOpen(true)} />;
      case "assets": return <PrivateAssets />;
      case "workflows": return <Workflows />;
      case "documents": return <Documents />;
      case "execution": return <Execution />;
      case "integrations": return <Integrations />;
      case "activity": return <ActivityLog />;
      case "alerts": return <AlertsPage />;
      case "settings": return <SettingsPage />;
      default: return null;
    }
  }, [active]);

  return (
    <div className="min-h-screen bg-[#080a0d] font-sans text-slate-100 [font-feature-settings:'tnum']">
      <Sidebar active={active} onSelect={setActive} />
      <TopBar />
      <MarketContextBar />
      <main className="ml-60 min-h-[calc(100vh-94px)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.055),transparent_32%),linear-gradient(180deg,#0b0d11_0%,#080a0d_100%)] px-5 py-5">
        <div className="mx-auto max-w-[1560px]">{content}</div>
      </main>
      {selectedTrade && <TradeDetails trade={selectedTrade} onClose={() => setSelectedTrade(null)} />}
      {selectedExternal && <ExternalTradeDetails id={selectedExternal} onClose={() => setSelectedExternal(null)} />}
      {newTradeOpen && <NewTradePanel onClose={() => setNewTradeOpen(false)} />}
      {newBrokerOpen && <ConfigureBrokerPanel onClose={() => setNewBrokerOpen(false)} />}
    </div>
  );
}


