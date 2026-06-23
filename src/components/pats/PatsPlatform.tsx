"use client";

import { useState } from "react";
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

function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}
function saveLocal<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

type NavKey =
  | "dashboard"
  | "trades"
  | "externalTrades"
  | "review"
  | "brokers"
  | "assets"
  | "workflows"
  | "documents"
  | "households"
  | "execution"
  | "integrations"
  | "userAccess"
  | "activity"
  | "alerts"
  | "settings";

type StatusTone = "green" | "yellow" | "red" | "blue" | "gray" | "purple";
type AccessRole = "pats_ops" | "broker" | "wealth_manager" | "client_signer" | "asset_sponsor" | "external_platform";
type DocumentViewerRole = AccessRole;

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

interface HouseholdPerson {
  personId: string;
  householdId: string;
  entityType: "human" | "trust" | "llc" | "limited_partnership";
  firstName?: string;
  lastName?: string;
  entityName?: string;
  email: string;
  phone?: string;
  ssn?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  role: "primary" | "owner" | "joint_owner" | "spouse" | "authorized_signer" | "beneficiary" | "trustee" | "co_trustee" | "grantor" | "managing_member" | "general_partner" | "dependent";
  status: "active" | "inactive";
}

interface HouseholdAccount {
  accountId: string;
  householdId: string;
  primaryPersonId: string;
  accountNumber: string;
  accountType: "individual" | "joint" | "trust" | "ira" | "roth_ira" | "entity" | "limited_partnership";
  custodian: string;
  authorizedSignerIds: string[];
  grantorPersonId?: string;
  beneficiaryPersonIds?: string[];
  status: "active" | "inactive";
}

interface TradeDoc {
  tradeDocumentId: string;
  inboundTradeId: string;
  tradeWorkflowId?: string;
  tradeWorkflowStepId: string;
  workflowRequirementId: string;
  patsBrokerProfileId?: string;
  privateAssetId?: string;
  userId?: string;
  accountId?: string;
  name: string;
  type: "subscription_agreement" | "signature_packet" | "tax_document" | "redemption_notice" | "supporting_document" | "other";
  platform: "manual_upload" | "docusign" | "icapital" | "umb" | "other";
  source: "ops" | "broker" | "external_platform" | "system";
  status: "pending" | "uploaded" | "sent" | "signed" | "completed" | "blocked" | "cancelled";
  requiredActorType?: AccessRole;
  requiredActorId?: string;
  signerPersonId?: string;
  ownerContactId?: string;
  visibleToRoles?: AccessRole[];
  actionRequired?: boolean;
  actionLabel?: string;
  assignee?: string;
  dueDate?: string;
  fileKey?: string;
  externalEnvelopeId?: string;
  externalUrl?: string;
  sentAt?: string;
  signedAt?: string;
  completedAt?: string;
  blockedReason?: string;
  createdAt: string;
  updatedAt: string;
}

type AccessStatus = "pending" | "active" | "inactive" | "role_removed";

interface DocumentViewer {
  contactId: string;
  label: string;
  role: DocumentViewerRole;
  brokerIds?: string[];
  householdIds?: string[];
  accountIds?: string[];
  personIds?: string[];
  assetIds?: string[];
}

interface UserAccessRequest {
  userId: string;
  displayName: string;
  email: string;
  company: string;
  requestedRole?: AccessRole;
  assignedRole?: AccessRole;
  status: AccessStatus;
  scopeLabel: string;
  lastActivity: string;
  notes: string;
}

type ReviewStatus = "unresolved" | "needs_review";
type ReviewReason =
  | "missing_broker_ticker"
  | "unknown_private_asset"
  | "invalid_account"
  | "inactive_account"
  | "broker_asset_mismatch"
  | "inactive_private_asset"
  | "missing_user"
  | "eligibility_error"
  | "workflow_creation_error";

interface TradeReviewCase {
  reviewId: string;
  inboundTradeId: string;
  vantageTradeId: string;
  status: ReviewStatus;
  reason: ReviewReason;
  priority: "High" | "Medium" | "Low";
  receivedAt: string;
  source: "Vantage API" | "Manual";
  broker: string;
  vantageBrokerId: string;
  ticker: string;
  privateAsset: string;
  side: string;
  quantity: string;
  amount: string;
  accountId?: string;
  userId?: string;
  diagnosis: string;
  resolution: string;
  primaryAction: string;
  secondaryAction?: string;
  payload: Array<[string, string]>;
}

interface ExecutionFill {
  fillId: string;
  executionId: string;
  quantity: string;
  price: string;
  grossAmount: string;
  netAmount?: string;
  filledAt: string;
  status: "pending" | "confirmed" | "cancelled";
  returnStatus: "not_ready" | "ready_to_return" | "returned" | "return_failed" | "manual_return_required";
  returnedAt?: string;
  returnFailureReason?: string;
}

interface ExecutionFlowRecord {
  executionId?: string;
  inboundTradeId: string;
  tradeWorkflowId?: string;
  workflowTemplateId?: string;
  tradeId: string;
  ticker: string;
  broker: string;
  asset: string;
  side: string;
  quantity: string;
  amount: string;
  executionStatus: "not_created" | "pending" | "ready" | "routed" | "executed" | "failed" | "cancelled";
  routeMethod?: "manual";
  externalExecutionId?: string;
  fills: ExecutionFill[];
  currentStep: number;
  blockedStep: number | null;
  destination: string;
  lastUpdate: string;
}

interface HouseholdRecord {
  householdId: string;
  name: string;
  primaryContactId: string | null;
  notes: string;
  status: "active" | "inactive";
  createdAt: string;
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
type WorkflowRecord = typeof workflows[number];

const tradeDocuments: TradeDoc[] = [
  { tradeDocumentId: "tdoc_001", inboundTradeId: "it_d672e1c1", tradeWorkflowId: "tw_001", tradeWorkflowStepId: "tws_doc_001", workflowRequirementId: "wr_subscription_agreement", patsBrokerProfileId: "pbp_gsas", privateAssetId: "pa_tech_a", userId: "user-456", accountId: "acc_001", name: "Subscription Agreement", type: "subscription_agreement", platform: "docusign", source: "system", status: "sent", requiredActorType: "client_signer", requiredActorId: "per_001", signerPersonId: "per_001", visibleToRoles: ["pats_ops", "broker", "wealth_manager", "client_signer"], actionRequired: true, actionLabel: "Sign document", assignee: "Sarah Chen", dueDate: "2026-05-22", externalEnvelopeId: "DS-44912", externalUrl: "https://demo.docusign.net/signing/example", sentAt: "2026-05-01T14:30:00Z", createdAt: "2026-05-01T10:00:00Z", updatedAt: "2026-05-01T14:30:00Z" },
  { tradeDocumentId: "tdoc_002", inboundTradeId: "it_d672e1c1", tradeWorkflowId: "tw_001", tradeWorkflowStepId: "tws_sig_001", workflowRequirementId: "wr_investor_signature", patsBrokerProfileId: "pbp_gsas", privateAssetId: "pa_tech_a", userId: "user-456", accountId: "acc_001", name: "Investor Signature Packet", type: "signature_packet", platform: "docusign", source: "system", status: "pending", requiredActorType: "broker", requiredActorId: "pbp_gsas", signerPersonId: "per_001", visibleToRoles: ["pats_ops", "broker", "wealth_manager"], actionRequired: true, actionLabel: "Prepare envelope", assignee: "Goldman broker", dueDate: "2026-05-21", externalEnvelopeId: "DS-44912", createdAt: "2026-05-01T10:00:00Z", updatedAt: "2026-05-01T10:00:00Z" },
  { tradeDocumentId: "tdoc_003", inboundTradeId: "it_cb41f317", tradeWorkflowId: "tw_002", tradeWorkflowStepId: "tws_notice_001", workflowRequirementId: "wr_redemption_notice", patsBrokerProfileId: "pbp_msalt", privateAssetId: "pa_health_b", accountId: "acc_002", name: "Redemption Notice", type: "redemption_notice", platform: "manual_upload", source: "ops", status: "blocked", requiredActorType: "pats_ops", requiredActorId: "ops_pats", visibleToRoles: ["pats_ops", "broker"], actionRequired: true, actionLabel: "Review blocker", assignee: "PATS Ops", dueDate: "2026-05-20", blockedReason: "Required file not uploaded - contact Ops team to provide the signed notice", createdAt: "2026-05-01T09:00:00Z", updatedAt: "2026-05-01T11:00:00Z" },
  { tradeDocumentId: "tdoc_004", inboundTradeId: "it_a71e6d82", tradeWorkflowStepId: "tws_tax_001", workflowRequirementId: "wr_tax_package", patsBrokerProfileId: "pbp_jpm", privateAssetId: "pa_energy_c", accountId: "acc_003", name: "Tax Package", type: "tax_document", platform: "umb", source: "broker", status: "pending", requiredActorType: "broker", requiredActorId: "pbp_jpm", visibleToRoles: ["pats_ops", "broker", "wealth_manager"], actionRequired: true, actionLabel: "Prepare tax package", assignee: "JP Morgan Private Markets", dueDate: "2026-05-24", createdAt: "2026-05-01T08:00:00Z", updatedAt: "2026-05-01T08:00:00Z" },
  { tradeDocumentId: "tdoc_005", inboundTradeId: "it_7bd6a44f", tradeWorkflowStepId: "tws_sub_002", workflowRequirementId: "wr_icap_sub", patsBrokerProfileId: "pbp_icap", privateAssetId: "pa_fintech_d", accountId: "acc_004", name: "iCapital Subscription Package", type: "subscription_agreement", platform: "icapital", source: "external_platform", status: "uploaded", requiredActorType: "external_platform", requiredActorId: "icapital", visibleToRoles: ["pats_ops", "broker", "wealth_manager", "asset_sponsor"], actionRequired: true, actionLabel: "Send package", assignee: "iCapital", dueDate: "2026-05-23", fileKey: "icap/tdoc_005/subscription.pdf", createdAt: "2026-05-01T07:30:00Z", updatedAt: "2026-05-01T13:00:00Z" },
  { tradeDocumentId: "tdoc_006", inboundTradeId: "it_d672e1c1", tradeWorkflowId: "tw_001", tradeWorkflowStepId: "tws_kyc_001", workflowRequirementId: "wr_kyc_docs", patsBrokerProfileId: "pbp_gsas", privateAssetId: "pa_tech_a", accountId: "acc_001", name: "Accredited Investor Letter", type: "supporting_document", platform: "manual_upload", source: "system", status: "pending", requiredActorType: "client_signer", requiredActorId: "per_001", signerPersonId: "per_001", visibleToRoles: ["pats_ops", "broker", "wealth_manager", "client_signer"], actionRequired: true, actionLabel: "Upload letter", assignee: "Sarah Chen", dueDate: "2026-05-25", createdAt: "2026-05-01T10:15:00Z", updatedAt: "2026-05-01T10:15:00Z" },
  { tradeDocumentId: "tdoc_007", inboundTradeId: "it_7bd6a44f", tradeWorkflowStepId: "tws_sponsor_001", workflowRequirementId: "wr_accreditation", patsBrokerProfileId: "pbp_icap", privateAssetId: "pa_fintech_d", accountId: "acc_004", name: "Sponsor Acceptance Memo", type: "supporting_document", platform: "other", source: "broker", status: "pending", requiredActorType: "asset_sponsor", requiredActorId: "sponsor_techcorp", visibleToRoles: ["pats_ops", "wealth_manager", "asset_sponsor"], actionRequired: true, actionLabel: "Review memo", assignee: "FinTech Capital", dueDate: "2026-05-26", createdAt: "2026-05-01T10:20:00Z", updatedAt: "2026-05-01T10:20:00Z" },
];

function mergeDocumentSeeds(storedDocs: TradeDoc[]) {
  const storedById = new Map(storedDocs.map((doc) => [doc.tradeDocumentId, doc]));
  const mergedSeeds = tradeDocuments.map((seed) => {
    const stored = storedById.get(seed.tradeDocumentId);
    if (!stored) return seed;
    return {
      ...seed,
      ...stored,
      requiredActorType: stored.requiredActorType ?? seed.requiredActorType,
      requiredActorId: stored.requiredActorId ?? seed.requiredActorId,
      signerPersonId: stored.signerPersonId ?? seed.signerPersonId,
      visibleToRoles: stored.visibleToRoles ?? seed.visibleToRoles,
      actionRequired: stored.actionRequired ?? seed.actionRequired,
      actionLabel: stored.actionLabel ?? seed.actionLabel,
      assignee: stored.assignee ?? seed.assignee,
      dueDate: stored.dueDate ?? seed.dueDate,
    };
  });
  const customDocs = storedDocs.filter((doc) => !tradeDocuments.some((seed) => seed.tradeDocumentId === doc.tradeDocumentId));
  return [...mergedSeeds, ...customDocs];
}

const workflowSteps = [
  { tradeWorkflowStepId: "tws_doc_001", tradeWorkflowId: "tw_001", inboundTradeId: "it_d672e1c1", name: "Subscription documents" },
  { tradeWorkflowStepId: "tws_sig_001", tradeWorkflowId: "tw_001", inboundTradeId: "it_d672e1c1", name: "Investor signature" },
  { tradeWorkflowStepId: "tws_notice_001", tradeWorkflowId: "tw_002", inboundTradeId: "it_cb41f317", name: "Redemption notice upload" },
  { tradeWorkflowStepId: "tws_tax_001", tradeWorkflowId: "tw_004", inboundTradeId: "it_a71e6d82", name: "Tax package collection" },
  { tradeWorkflowStepId: "tws_sub_002", tradeWorkflowId: "tw_005", inboundTradeId: "it_7bd6a44f", name: "iCapital subscription" },
];

const workflowRequirements = [
  { workflowRequirementId: "wr_subscription_agreement", name: "Subscription agreement" },
  { workflowRequirementId: "wr_investor_signature", name: "Investor signature" },
  { workflowRequirementId: "wr_redemption_notice", name: "Redemption notice" },
  { workflowRequirementId: "wr_tax_package", name: "Tax package" },
  { workflowRequirementId: "wr_icap_sub", name: "iCapital subscription package" },
  { workflowRequirementId: "wr_accreditation", name: "Investor accreditation letter" },
  { workflowRequirementId: "wr_kyc_docs", name: "KYC documentation" },
];

const documentViewers: DocumentViewer[] = [
  { contactId: "ops_pats", label: "PATS Ops", role: "pats_ops" },
  { contactId: "broker_gsas", label: "Goldman broker", role: "broker", brokerIds: ["pbp_gsas"] },
  { contactId: "wm_chen", label: "Wealth manager", role: "wealth_manager", householdIds: ["hh_001", "hh_002"], accountIds: ["acc_001", "acc_002", "acc_003", "acc_004"] },
  { contactId: "per_001", label: "Client signer", role: "client_signer", householdIds: ["hh_001"], accountIds: ["acc_001", "acc_002"], personIds: ["per_001"] },
  { contactId: "sponsor_techcorp", label: "Asset sponsor", role: "asset_sponsor", assetIds: ["pa_tech_a", "pa_fintech_d"] },
  { contactId: "icapital_platform", label: "External platform", role: "external_platform" },
];

const accessRoleLabels: Record<AccessRole, string> = {
  pats_ops: "Ops",
  broker: "Broker",
  wealth_manager: "Wealth Manager",
  client_signer: "Client Signer",
  asset_sponsor: "Asset Sponsor",
  external_platform: "External Platform",
};

const accessRoleScopeHints: Record<AccessRole, string> = {
  pats_ops: "All operational queues",
  broker: "Broker profile scope",
  wealth_manager: "Household or account scope",
  client_signer: "Person and signature scope",
  asset_sponsor: "Private asset scope",
  external_platform: "Platform contact scope",
};

interface RolePermissionDefinition {
  summary: string;
  nav: NavKey[];
  dashboard: string;
  documents: string;
  documentCreation: string;
  documentOperations: string;
  signatureTasks: string;
  sponsorReview: string;
  tradesWorkflows: string;
  accounts: string;
  households: string;
  contacts: string;
  privateAssets: string;
  roleAdministration: string;
  canCreateDocuments: boolean;
  canCreateTrades: boolean;
  canManageBrokers: boolean;
  canManageWorkflows: boolean;
  canManageHouseholds: boolean;
  canOperateExecution: boolean;
  canManageIntegrations: boolean;
  canAdministerRoles: boolean;
}

const rolePermissions: Record<AccessRole, RolePermissionDefinition> = {
  pats_ops: {
    summary: "Internal operations role with global visibility and administration controls.",
    nav: ["dashboard", "trades", "externalTrades", "review", "brokers", "assets", "workflows", "documents", "households", "execution", "integrations", "userAccess", "activity", "alerts", "settings"],
    dashboard: "Full operations overview",
    documents: "All documents",
    documentCreation: "Allowed",
    documentOperations: "Allowed",
    signatureTasks: "Hidden",
    sponsorReview: "Allowed",
    tradesWorkflows: "Full operation",
    accounts: "All accounts",
    households: "All households",
    contacts: "All contacts",
    privateAssets: "All private assets",
    roleAdministration: "Allowed",
    canCreateDocuments: true,
    canCreateTrades: true,
    canManageBrokers: true,
    canManageWorkflows: true,
    canManageHouseholds: true,
    canOperateExecution: true,
    canManageIntegrations: true,
    canAdministerRoles: true,
  },
  broker: {
    summary: "Broker team role for scoped private asset operations and document preparation.",
    nav: ["dashboard", "trades", "externalTrades", "brokers", "assets", "workflows", "documents", "households", "execution", "activity", "alerts"],
    dashboard: "Broker scoped overview",
    documents: "Scoped documents",
    documentCreation: "Allowed",
    documentOperations: "Allowed in broker scope",
    signatureTasks: "Hidden",
    sponsorReview: "Hidden",
    tradesWorkflows: "Operate scoped trades",
    accounts: "Broker scoped accounts",
    households: "Scoped households",
    contacts: "Related contacts",
    privateAssets: "Broker scoped assets",
    roleAdministration: "Hidden",
    canCreateDocuments: true,
    canCreateTrades: true,
    canManageBrokers: false,
    canManageWorkflows: false,
    canManageHouseholds: false,
    canOperateExecution: false,
    canManageIntegrations: false,
    canAdministerRoles: false,
  },
  wealth_manager: {
    summary: "Advisor visibility role for client status, documents, and assigned households.",
    nav: ["dashboard", "trades", "assets", "workflows", "documents", "households", "activity"],
    dashboard: "Advisor scoped overview",
    documents: "View documents",
    documentCreation: "Hidden",
    documentOperations: "Hidden",
    signatureTasks: "Hidden",
    sponsorReview: "Hidden",
    tradesWorkflows: "Read only",
    accounts: "Assigned household/account scope",
    households: "Assigned households",
    contacts: "Related contacts",
    privateAssets: "Read only when applicable",
    roleAdministration: "Hidden",
    canCreateDocuments: false,
    canCreateTrades: false,
    canManageBrokers: false,
    canManageWorkflows: false,
    canManageHouseholds: false,
    canOperateExecution: false,
    canManageIntegrations: false,
    canAdministerRoles: false,
  },
  client_signer: {
    summary: "Client signing role focused on personal documents and associated profile data.",
    nav: ["dashboard", "documents", "households", "activity"],
    dashboard: "Simple personal overview",
    documents: "Own documents",
    documentCreation: "Hidden",
    documentOperations: "Hidden",
    signatureTasks: "Allowed",
    sponsorReview: "Hidden",
    tradesWorkflows: "Limited read only",
    accounts: "Associated accounts/persons",
    households: "Limited read only",
    contacts: "Own profile",
    privateAssets: "Read only when applicable",
    roleAdministration: "Hidden",
    canCreateDocuments: false,
    canCreateTrades: false,
    canManageBrokers: false,
    canManageWorkflows: false,
    canManageHouseholds: false,
    canOperateExecution: false,
    canManageIntegrations: false,
    canAdministerRoles: false,
  },
  asset_sponsor: {
    summary: "Sponsor role for assigned private assets and sponsor document review.",
    nav: ["dashboard", "assets", "documents", "workflows", "activity"],
    dashboard: "Sponsor scoped overview",
    documents: "Asset related documents",
    documentCreation: "Hidden",
    documentOperations: "Hidden",
    signatureTasks: "Hidden",
    sponsorReview: "Allowed",
    tradesWorkflows: "Own assets read only",
    accounts: "Hidden",
    households: "Hidden",
    contacts: "Hidden",
    privateAssets: "Own assets",
    roleAdministration: "Hidden",
    canCreateDocuments: false,
    canCreateTrades: false,
    canManageBrokers: false,
    canManageWorkflows: false,
    canManageHouseholds: false,
    canOperateExecution: false,
    canManageIntegrations: false,
    canAdministerRoles: false,
  },
  external_platform: {
    summary: "Integration user for limited document operations and technical handoffs.",
    nav: ["dashboard", "externalTrades", "documents", "execution", "integrations", "activity"],
    dashboard: "Technical integration overview",
    documents: "Platform documents",
    documentCreation: "Hidden",
    documentOperations: "Limited",
    signatureTasks: "Hidden",
    sponsorReview: "Hidden",
    tradesWorkflows: "Limited operation",
    accounts: "Hidden",
    households: "Hidden",
    contacts: "Hidden",
    privateAssets: "Hidden",
    roleAdministration: "Hidden",
    canCreateDocuments: false,
    canCreateTrades: false,
    canManageBrokers: false,
    canManageWorkflows: false,
    canManageHouseholds: false,
    canOperateExecution: false,
    canManageIntegrations: false,
    canAdministerRoles: false,
  },
};

const userAccessSeeds: UserAccessRequest[] = [
  { userId: "usr_pending_001", displayName: "Mariana Lopez", email: "mariana.lopez@acme.com", company: "Acme Capital", requestedRole: "wealth_manager", status: "pending", scopeLabel: "Chen household group", lastActivity: "Today, 8:42 AM", notes: "New advisor user waiting for household scope review" },
  { userId: "usr_pending_002", displayName: "Daniel Brooks", email: "daniel.brooks@gsas.com", company: "Goldman Sachs Advisor Solutions", requestedRole: "broker", status: "pending", scopeLabel: "GSAS private asset desk", lastActivity: "Today, 8:11 AM", notes: "Broker user created after Vantage broker sync" },
  { userId: "usr_pending_003", displayName: "Sarah Chen", email: "sarah.chen@example.com", company: "Chen Family Office", requestedRole: "client_signer", status: "pending", scopeLabel: "Sarah Chen person record", lastActivity: "Yesterday, 4:30 PM", notes: "Client needs signer access before subscription packet is sent" },
  { userId: "usr_active_001", displayName: "Maya Singh", email: "maya.singh@gsas.com", company: "Goldman Sachs Advisor Solutions", assignedRole: "broker", status: "active", scopeLabel: "Goldman broker profile", lastActivity: "Today, 7:55 AM", notes: "Can prepare broker-owned documents and review scoped trades" },
  { userId: "usr_active_002", displayName: "System Admin", email: "ops@pats.local", company: "PATS Operations", assignedRole: "pats_ops", status: "active", scopeLabel: "All PATS operations", lastActivity: "Today, 7:21 AM", notes: "Full operations access" },
  { userId: "usr_inactive_001", displayName: "Nina Walsh", email: "nina.walsh@jpm.com", company: "JP Morgan Private Markets", assignedRole: "asset_sponsor", status: "inactive", scopeLabel: "CleanEnergy Fund", lastActivity: "May 28, 2026", notes: "Temporarily inactive while sponsor contact is updated" },
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

const tradeReviewCases: TradeReviewCase[] = [
  {
    reviewId: "rev_account_001",
    inboundTradeId: "it_00d9115f",
    vantageTradeId: "8e77290ac393d1f1ae1f8631e064b889",
    status: "needs_review",
    reason: "invalid_account",
    priority: "High",
    receivedAt: "11:12 AM",
    source: "Vantage API",
    broker: "B Riley",
    vantageBrokerId: "240a05cdff561717446a56d9580c13e5",
    ticker: "FCP",
    privateAsset: "Fondo de Capital Privado I",
    side: "Buy",
    quantity: "1,000",
    amount: "-",
    accountId: "gs-ecef",
    userId: "luisa.perez@bblabs.io",
    diagnosis: "Vantage sent an account code that does not match an active account in PATS.",
    resolution: "Attach the trade to an existing PATS account or leave account unassigned and continue with Ops review.",
    primaryAction: "Assign PATS account",
    secondaryAction: "Clear Vantage account",
    payload: [["Broker account code", "GS-ECEF"], ["Expected format", "Active PATS account"], ["Review trigger", "Account not found in PATS"]],
  },
  {
    reviewId: "rev_ticker_001",
    inboundTradeId: "it_a418e890",
    vantageTradeId: "vt_unresolved_001",
    status: "unresolved",
    reason: "missing_broker_ticker",
    priority: "High",
    receivedAt: "10:05 AM",
    source: "Vantage API",
    broker: "Morgan Stanley Alternatives",
    vantageBrokerId: "35dc8d0f6703e35a81dac3912ec3b549",
    ticker: "DOES-NOT-EXIST",
    privateAsset: "Not resolved",
    side: "Buy",
    quantity: "10,000",
    amount: "-",
    diagnosis: "No broker-scoped ticker exists for this Vantage broker and ticker combination.",
    resolution: "Create a broker ticker mapping to an active private asset, then reprocess the inbound trade.",
    primaryAction: "Map broker ticker",
    secondaryAction: "Reject inbound trade",
    payload: [["Broker", "Morgan Stanley Alternatives"], ["Ticker", "DOES-NOT-EXIST"], ["Review trigger", "No broker ticker mapping"]],
  },
  {
    reviewId: "rev_asset_001",
    inboundTradeId: "it_a71e6d82",
    vantageTradeId: "vt_needs_review_001",
    status: "needs_review",
    reason: "inactive_private_asset",
    priority: "Medium",
    receivedAt: "9:58 AM",
    source: "Vantage API",
    broker: "JP Morgan Private Markets",
    vantageBrokerId: "cb2a2ee8e52d0c54e3af17fc32bb84c9",
    ticker: "ENERGY-C",
    privateAsset: "CleanEnergy Fund",
    side: "Buy",
    quantity: "-",
    amount: "$1,380,000",
    accountId: "acc_003",
    diagnosis: "The ticker resolved, but the private asset is restricted or inactive.",
    resolution: "Reactivate the private asset if trading is allowed, or keep the trade blocked for Ops disposition.",
    primaryAction: "Review asset status",
    secondaryAction: "Hold trade",
    payload: [["Private asset", "CleanEnergy Fund"], ["Asset status", "Restricted"], ["Review trigger", "Asset is not active"]],
  },
  {
    reviewId: "rev_mismatch_001",
    inboundTradeId: "it_broker_mismatch",
    vantageTradeId: "vt_broker_mismatch_001",
    status: "needs_review",
    reason: "broker_asset_mismatch",
    priority: "High",
    receivedAt: "9:41 AM",
    source: "Vantage API",
    broker: "Schwab Alternative Investments",
    vantageBrokerId: "b45e6cb2154b4d8e865005c7f1d401cc",
    ticker: "TECH-A",
    privateAsset: "TechCorp Series A",
    side: "Subscribe",
    quantity: "5,000",
    amount: "-",
    diagnosis: "The broker ticker points to a broker profile that does not match the private asset owner.",
    resolution: "Correct the broker-scoped ticker or move the private asset to the expected broker profile.",
    primaryAction: "Fix broker mapping",
    secondaryAction: "Open asset profile",
    payload: [["Ticker broker", "Schwab Alternative Investments"], ["Asset owner", "Goldman Sachs Advisor Solutions"], ["Review trigger", "Broker ownership mismatch"]],
  },
  {
    reviewId: "rev_user_001",
    inboundTradeId: "it_user_lookup",
    vantageTradeId: "vt_user_lookup_001",
    status: "needs_review",
    reason: "missing_user",
    priority: "Medium",
    receivedAt: "9:20 AM",
    source: "Vantage API",
    broker: "Goldman Sachs Advisor Solutions",
    vantageBrokerId: "176f7a13d62244845b746b04c79fa621",
    ticker: "TECH-A",
    privateAsset: "TechCorp Series A",
    side: "Buy",
    quantity: "2,500",
    amount: "-",
    userId: "external-user-441",
    diagnosis: "The trade references a user that PATS cannot hydrate from Cognito or contact context.",
    resolution: "Link the external user to a PATS contact, or keep the trade unassigned.",
    primaryAction: "Link contact",
    secondaryAction: "Clear user",
    payload: [["Received investor", "External user from Vantage"], ["Lookup result", "No matching PATS contact"], ["Review trigger", "Investor could not be matched"]],
  },
  {
    reviewId: "rev_workflow_001",
    inboundTradeId: "it_workflow_error",
    vantageTradeId: "vt_workflow_error_001",
    status: "needs_review",
    reason: "workflow_creation_error",
    priority: "High",
    receivedAt: "8:54 AM",
    source: "Vantage API",
    broker: "iCapital Marketplace",
    vantageBrokerId: "8a4c01a23b574ab5a8c11225efcd2299",
    ticker: "FINTECH-D",
    privateAsset: "FinTech Growth",
    side: "Subscribe",
    quantity: "7,500",
    amount: "$1,580,625",
    accountId: "acc_004",
    diagnosis: "Eligibility required a workflow, but workflow creation failed before all steps/documents were saved.",
    resolution: "Retry workflow creation after checking template, requirements, and document repository health.",
    primaryAction: "Retry workflow",
    secondaryAction: "Inspect template",
    payload: [["Workflow", "FinTech iCapital package"], ["Document source", "iCapital"], ["Review trigger", "Workflow could not be created"]],
  },
  {
    reviewId: "rev_unknown_asset_001",
    inboundTradeId: "it_unknown_asset",
    vantageTradeId: "vt_unknown_asset_001",
    status: "unresolved",
    reason: "unknown_private_asset",
    priority: "High",
    receivedAt: "8:30 AM",
    source: "Vantage API",
    broker: "Schwab Alternative Investments",
    vantageBrokerId: "b45e6cb2154b4d8e865005c7f1d401cc",
    ticker: "SCHWAB-RE",
    privateAsset: "Not resolved",
    side: "Subscribe",
    quantity: "3,000",
    amount: "-",
    diagnosis: "The broker was identified as Schwab Alternative Investments, but no private asset record in PATS matches this ticker. The trade cannot continue until the asset is created or an existing asset is mapped to this ticker.",
    resolution: "Create a new private asset for this ticker and broker, or map this ticker to an existing PATS asset.",
    primaryAction: "Create private asset",
    secondaryAction: "Map to existing",
    payload: [["Broker", "Schwab Alternative Investments"], ["Ticker received", "SCHWAB-RE"], ["Review trigger", "No private asset found for this ticker"]],
  },
  {
    reviewId: "rev_eligibility_001",
    inboundTradeId: "it_eligibility_error",
    vantageTradeId: "vt_eligibility_001",
    status: "needs_review",
    reason: "eligibility_error",
    priority: "Medium",
    receivedAt: "7:45 AM",
    source: "Vantage API",
    broker: "Goldman Sachs Advisor Solutions",
    vantageBrokerId: "176f7a13d62244845b746b04c79fa621",
    ticker: "TECH-A",
    privateAsset: "TechCorp Series A",
    side: "Subscribe",
    quantity: "5,000",
    amount: "$226,000",
    accountId: "acc_003",
    userId: "nina.walsh@example.com",
    diagnosis: "The eligibility check for this investor and asset returned an error. The investor may have a prior eligibility record that expired, or the eligibility service could not complete the verification.",
    resolution: "Manually mark the investor as eligible, route the trade directly to a workflow, or retry the eligibility check after reviewing the investor's record.",
    primaryAction: "Mark eligible",
    secondaryAction: "Retry check",
    payload: [["Investor", "nina.walsh@example.com"], ["Asset", "TechCorp Series A"], ["Review trigger", "Eligibility check failed"]],
  },
];

const executionFlows: ExecutionFlowRecord[] = [
  {
    tradeWorkflowId: "tw_001",
    inboundTradeId: "it_d672e1c1",
    workflowTemplateId: "wt_tech_subscription",
    tradeId: "TRD-002",
    ticker: "TECH-A",
    broker: "Goldman Sachs Advisor Solutions",
    asset: "TechCorp Series A",
    side: "Subscribe",
    quantity: "10,000",
    amount: "$452,000",
    executionStatus: "not_created",
    fills: [],
    currentStep: 3,
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
    side: "Redeem",
    quantity: "5,000",
    amount: "$642,500",
    executionStatus: "not_created",
    fills: [],
    currentStep: 2,
    blockedStep: 2,
    destination: "Manual broker workflow",
    lastUpdate: "8 min ago",
  },
  {
    executionId: "ex_001",
    tradeWorkflowId: "tw_003",
    inboundTradeId: "it_4eb00593",
    workflowTemplateId: "wt_tech_subscription",
    tradeId: "TRD-001",
    ticker: "TECH-A",
    broker: "Goldman Sachs Advisor Solutions",
    asset: "TechCorp Series A",
    side: "Buy",
    quantity: "10,000",
    amount: "$452,000",
    executionStatus: "executed",
    routeMethod: "manual",
    externalExecutionId: "GSAS-EXEC-44912",
    fills: [
      {
        fillId: "fill_001",
        executionId: "ex_001",
        quantity: "10,000",
        price: "$45.20",
        grossAmount: "$452,000",
        netAmount: "$451,500",
        filledAt: "10:33 AM",
        status: "confirmed",
        returnStatus: "returned",
        returnedAt: "10:38 AM",
      },
    ],
    currentStep: 6,
    blockedStep: null,
    destination: "Vantage Blotter",
    lastUpdate: "4 min ago",
  },
  {
    executionId: "ex_002",
    inboundTradeId: "it_7bd6a44f",
    workflowTemplateId: "wt_fintech_subscription",
    tradeId: "TRD-006",
    ticker: "FINTECH-D",
    broker: "iCapital Marketplace",
    asset: "FinTech Growth",
    side: "Buy",
    quantity: "7,500",
    amount: "$1,580,625",
    executionStatus: "routed",
    routeMethod: "manual",
    externalExecutionId: "ICAP-ROUTE-7781",
    fills: [
      {
        fillId: "fill_002",
        executionId: "ex_002",
        quantity: "3,000",
        price: "$210.75",
        grossAmount: "$632,250",
        netAmount: "$631,900",
        filledAt: "9:59 AM",
        status: "confirmed",
        returnStatus: "manual_return_required",
      },
      {
        fillId: "fill_003",
        executionId: "ex_002",
        quantity: "4,500",
        price: "$210.75",
        grossAmount: "$948,375",
        filledAt: "10:06 AM",
        status: "pending",
        returnStatus: "not_ready",
      },
    ],
    currentStep: 6,
    blockedStep: null,
    destination: "Manual return queue",
    lastUpdate: "12 min ago",
  },
];

const executionSteps = ["Inbound trade", "Asset resolved", "Workflow done", "Execution created", "Fill confirmed", "Return closed"];

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

const households: HouseholdRecord[] = [
  { householdId: "hh_001", name: "Chen Family Trust", primaryContactId: "per_001", notes: "Multi-asset family trust with active private equity positions", status: "active", createdAt: "Jan 12, 2026" },
  { householdId: "hh_002", name: "Walsh Capital Group", primaryContactId: "per_003", notes: "Institutional-style family office with multiple accounts", status: "active", createdAt: "Feb 3, 2026" },
  { householdId: "hh_003", name: "Reed & Associates LLC", primaryContactId: "per_005", notes: "Entity account with trust structure for alternative investments", status: "active", createdAt: "Mar 17, 2026" },
  { householdId: "hh_004", name: "Kim Foundation", primaryContactId: null, notes: "Foundation account — onboarding pending primary contact", status: "inactive", createdAt: "Apr 22, 2026" },
];

const householdPersons: HouseholdPerson[] = [
  { personId: "per_001", householdId: "hh_001", entityType: "human", firstName: "Sarah", lastName: "Chen", email: "sarah.chen@example.com", phone: "+1 (415) 555-0101", ssn: "XXX-XX-4421", address: "142 Oak Street", city: "San Francisco", state: "CA", role: "primary", status: "active" },
  { personId: "per_002", householdId: "hh_001", entityType: "human", firstName: "Michael", lastName: "Chen", email: "m.chen@example.com", phone: "+1 (415) 555-0102", ssn: "XXX-XX-8830", role: "joint_owner", status: "active" },
  { personId: "per_007", householdId: "hh_001", entityType: "trust", entityName: "Chen Family Trust 2019", email: "sarah.chen@example.com", taxId: "XX-4421891", role: "trustee", status: "active" },
  { personId: "per_003", householdId: "hh_002", entityType: "human", firstName: "Nina", lastName: "Walsh", email: "nina.walsh@example.com", phone: "+1 (212) 555-0201", ssn: "XXX-XX-7712", address: "88 Park Avenue", city: "New York", state: "NY", role: "primary", status: "active" },
  { personId: "per_004", householdId: "hh_002", entityType: "human", firstName: "David", lastName: "Walsh", email: "d.walsh@example.com", phone: "+1 (212) 555-0202", ssn: "XXX-XX-3301", role: "trustee", status: "active" },
  { personId: "per_008", householdId: "hh_002", entityType: "llc", entityName: "Walsh Capital Management LLC", email: "nina.walsh@example.com", taxId: "XX-8823401", role: "managing_member", status: "active" },
  { personId: "per_005", householdId: "hh_003", entityType: "human", firstName: "Carlos", lastName: "Reed", email: "carlos.reed@example.com", phone: "+1 (312) 555-0301", ssn: "XXX-XX-6644", address: "500 N Michigan Ave", city: "Chicago", state: "IL", role: "primary", status: "active" },
  { personId: "per_006", householdId: "hh_003", entityType: "human", firstName: "Maya", lastName: "Reed", email: "maya.reed@example.com", phone: "+1 (312) 555-0302", ssn: "XXX-XX-9915", role: "co_trustee", status: "active" },
  { personId: "per_009", householdId: "hh_003", entityType: "limited_partnership", entityName: "Reed & Associates LP", email: "carlos.reed@example.com", taxId: "XX-3301774", role: "general_partner", status: "active" },
];

const householdAccounts: HouseholdAccount[] = [
  { accountId: "acc_001", householdId: "hh_001", primaryPersonId: "per_001", accountNumber: "GS-4492-A", accountType: "trust", custodian: "Goldman Sachs", authorizedSignerIds: ["per_001", "per_002"], grantorPersonId: "per_001", beneficiaryPersonIds: ["per_002"], status: "active" },
  { accountId: "acc_002", householdId: "hh_001", primaryPersonId: "per_001", accountNumber: "MSALT-7721", accountType: "individual", custodian: "Morgan Stanley", authorizedSignerIds: ["per_001"], status: "active" },
  { accountId: "acc_003", householdId: "hh_002", primaryPersonId: "per_003", accountNumber: "JPM-3310-B", accountType: "joint", custodian: "JP Morgan", authorizedSignerIds: ["per_003", "per_004"], status: "active" },
  { accountId: "acc_004", householdId: "hh_002", primaryPersonId: "per_008", accountNumber: "ICAP-8854", accountType: "entity", custodian: "iCapital", authorizedSignerIds: ["per_003", "per_008"], status: "active" },
  { accountId: "acc_005", householdId: "hh_003", primaryPersonId: "per_005", accountNumber: "SCHWAB-1190", accountType: "trust", custodian: "Schwab", authorizedSignerIds: ["per_005", "per_006"], grantorPersonId: "per_005", beneficiaryPersonIds: ["per_006"], status: "active" },
  { accountId: "acc_006", householdId: "hh_003", primaryPersonId: "per_009", accountNumber: "SCHWAB-LP-002", accountType: "limited_partnership", custodian: "Schwab", authorizedSignerIds: ["per_009", "per_005"], status: "active" },
];

const tradeGridClass = "grid-cols-[1.15fr_1.2fr_1.25fr_1.25fr_0.8fr_0.95fr_1fr]";

function toneFor(value: string): StatusTone {
  const lower = value.toLowerCase().replaceAll("_", " ");
  if (["buy", "subscribe", "filled", "active", "validated", "already eligible", "no template", "executed", "sent", "signed", "completed", "uploaded", "eligible", "connected", "approved", "fill returned", "returned", "confirmed"].includes(lower)) return "green";
  if (["pending", "partial", "in progress", "retrying", "needs review", "workflow required", "no eligibility", "every trade", "medium", "workflow pending", "docs pending", "returning fill", "waiting", "ready to return", "manual return required", "manual return"].includes(lower)) return "yellow";
  if (["sell", "redeem", "failed", "return failed", "rejected", "blocked", "cancelled", "critical", "high", "low", "disconnected", "unresolved", "revoked", "expired"].includes(lower)) return "red";
  if (["received", "routed", "ready", "open", "once per user"].includes(lower)) return "blue";
  if (["draft", "not started", "not ready", "not created"].includes(lower)) return "gray";
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

function personDisplayName(p: HouseholdPerson): string {
  if (p.entityType === "human") return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
  return p.entityName ?? "—";
}

function actorLabel(doc: TradeDoc) {
  if (doc.assignee) return doc.assignee;
  if (doc.requiredActorType) return displayLabel(doc.requiredActorType);
  return "Unassigned";
}

function documentVisibleToViewer(doc: TradeDoc, viewer: DocumentViewer) {
  if (viewer.role === "pats_ops") return true;
  if (viewer.role === "external_platform") return doc.source === "external_platform" || doc.requiredActorType === "external_platform";
  if (doc.visibleToRoles && !doc.visibleToRoles.includes(viewer.role)) return false;
  if (viewer.brokerIds?.includes(doc.patsBrokerProfileId ?? "")) return true;
  if (viewer.accountIds?.includes(doc.accountId ?? "")) return true;
  if (viewer.personIds?.includes(doc.signerPersonId ?? "")) return true;
  if (viewer.assetIds?.includes(doc.privateAssetId ?? "")) return true;
  return false;
}

function documentCanCreate(viewer: DocumentViewer) {
  return rolePermissions[viewer.role].canCreateDocuments;
}

function documentCanOperate(doc: TradeDoc, viewer: DocumentViewer) {
  if (viewer.role === "pats_ops") return true;
  if (viewer.role === "broker" && viewer.brokerIds?.includes(doc.patsBrokerProfileId ?? "")) return true;
  if (viewer.role === "asset_sponsor" && viewer.assetIds?.includes(doc.privateAssetId ?? "")) return doc.requiredActorType === "asset_sponsor";
  if (viewer.role === "external_platform") return doc.source === "external_platform" || doc.requiredActorType === "external_platform";
  return false;
}

function documentCanSignerAct(doc: TradeDoc, viewer: DocumentViewer) {
  return viewer.role === "client_signer" && viewer.personIds?.includes(doc.signerPersonId ?? "");
}

function documentPrimaryCta(doc: TradeDoc, viewer: DocumentViewer) {
  if (documentCanSignerAct(doc, viewer)) {
    if (doc.platform === "manual_upload") return "Upload file";
    if (doc.status === "sent" && doc.externalUrl) return "Sign document";
    return doc.actionLabel ?? "Complete assigned action";
  }
  if (documentCanOperate(doc, viewer)) return doc.actionLabel ?? documentNextAction(doc);
  if (viewer.role === "wealth_manager") return doc.actionRequired ? "Follow up" : "View status";
  return "View status";
}

function entityTypeLabel(t: HouseholdPerson["entityType"]): string {
  if (t === "human") return "Human";
  if (t === "trust") return "Trust";
  if (t === "llc") return "LLC";
  if (t === "limited_partnership") return "LP";
  return t;
}

function entityTypeTone(t: HouseholdPerson["entityType"]): StatusTone {
  if (t === "human") return "gray";
  if (t === "trust") return "blue";
  if (t === "llc") return "purple";
  if (t === "limited_partnership") return "yellow";
  return "gray";
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

function executionFillSummary(flow: ExecutionFlowRecord) {
  if (flow.fills.length === 0) return "No fill yet";
  const confirmed = flow.fills.filter(fill => fill.status === "confirmed").length;
  return `${confirmed}/${flow.fills.length} confirmed`;
}

function executionReturnSummary(flow: ExecutionFlowRecord) {
  if (flow.fills.length === 0) return "Not ready";
  if (flow.fills.some(fill => fill.returnStatus === "return_failed")) return "Return failed";
  if (flow.fills.some(fill => fill.returnStatus === "manual_return_required")) return "Manual return";
  if (flow.fills.every(fill => fill.returnStatus === "returned")) return "Returned";
  if (flow.fills.some(fill => fill.returnStatus === "ready_to_return")) return "Ready to return";
  return "Not ready";
}

function executionPrimaryAction(flow: ExecutionFlowRecord) {
  if (!flow.executionId) return "Create execution";
  if (flow.fills.length === 0) return "Create fill";
  if (flow.fills.some(fill => fill.status === "pending")) return "Confirm fill";
  if (flow.fills.some(fill => fill.returnStatus === "ready_to_return")) return "Return to Vantage";
  if (flow.fills.some(fill => fill.returnStatus === "manual_return_required")) return "Manual return required";
  if (flow.fills.some(fill => fill.returnStatus === "return_failed")) return "Review return failure";
  return "View completed flow";
}

function nextMockId(prefix: string) {
  return `${prefix}_${Date.now().toString(36).slice(-6)}`;
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

function ReadOnlyNotice({ label }: { label: string }) {
  return (
    <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs text-amber-100">
      <span className="font-semibold text-amber-200">View only.</span> {label}
    </div>
  );
}

const navItems: Array<{ key: NavKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "trades", label: "PATS Blotter", icon: ArrowLeftRight },
  { key: "externalTrades", label: "Inbound Blotter", icon: Database },
  { key: "review", label: "Review Center", icon: Shield },
  { key: "brokers", label: "Asset Brokers", icon: Building2 },
  { key: "assets", label: "Private Assets", icon: Briefcase },
  { key: "workflows", label: "Workflows", icon: ListChecks },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "households", label: "Contacts", icon: Users },
  { key: "execution", label: "Execution Flow", icon: CheckCircle2 },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "userAccess", label: "User Access", icon: Shield },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "alerts", label: "Alerts", icon: AlertTriangle },
  { key: "settings", label: "Settings", icon: Settings },
];

function roleCanAccessNav(role: AccessRole, key: NavKey) {
  return rolePermissions[role].nav.includes(key);
}

function navItemsForRole(role: AccessRole) {
  return navItems.filter((item) => roleCanAccessNav(role, item.key));
}

function RoleSelect({
  value,
  onChange,
  compact = false,
  leadingIcon,
  className = "",
}: {
  value: AccessRole;
  onChange: (role: AccessRole) => void;
  compact?: boolean;
  leadingIcon?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = accessRoleLabels[value];

  return (
    <div className={`relative ${className}`}>
      {open && (
        <button
          type="button"
          aria-label="Close role menu"
          onClick={() => setOpen(false)}
          className="fixed bottom-0 right-0 top-0 left-60 z-40 cursor-default bg-black/35 backdrop-blur-[1px]"
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`relative z-50 flex w-full items-center justify-between gap-2 rounded-md border border-slate-700 bg-[#0b0d11] text-left font-semibold text-slate-100 outline-none transition hover:border-sky-400/50 hover:bg-slate-950 focus:border-sky-400/70 ${
          compact ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-xs"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {leadingIcon}
          <span className="truncate">{selectedLabel}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition ${open ? "rotate-180 text-sky-300" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[220px] rounded-lg border border-slate-700 bg-[#080a0d] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
          {Object.entries(accessRoleLabels).map(([roleValue, label]) => {
            const role = roleValue as AccessRole;
            const selected = role === value;
            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  onChange(role);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left transition ${
                  selected ? "bg-sky-400/12 text-sky-100" : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${selected ? "bg-sky-300" : "bg-slate-600"}`} />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{label}</span>
                  <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">{accessRoleScopeHints[role]}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sidebar({ active, role, onSelect }: { active: NavKey; role: AccessRole; onSelect: (key: NavKey) => void }) {
  const visibleNavItems = navItemsForRole(role);

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
        {visibleNavItems.map((item) => {
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
            <span className="text-[8px] text-slate-500">Role scope</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-300">{accessRoleLabels[role]}</p>
          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{rolePermissions[role].summary}</p>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ role, onRoleChange }: { role: AccessRole; onRoleChange: (role: AccessRole) => void }) {
  return (
    <header className="sticky top-0 z-50 ml-60 flex h-14 items-center justify-between border-b border-slate-800 bg-[#0b0d11]/95 px-5 backdrop-blur">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className="h-9 w-full rounded-md border border-slate-800 bg-[#11151b] pl-10 pr-4 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-500/60"
          placeholder="Search trades, brokers, assets..."
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[9px] font-semibold text-emerald-300">Production</span>
        <RoleSelect
          value={role}
          onChange={onRoleChange}
          compact
          leadingIcon={<Shield className="h-3.5 w-3.5 shrink-0 text-sky-300" />}
          className="w-48"
        />
        <div className="relative">
          <Bell className="h-4 w-4 text-slate-400" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-sky-400" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-900">
            <User className="h-3.5 w-3.5 text-slate-200" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-100">{accessRoleLabels[role]}</div>
            <div className="text-[8px] text-slate-500">{accessRoleScopeHints[role]}</div>
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

function Dashboard({ role, onSelect }: { role: AccessRole; onSelect: (key: NavKey) => void }) {
  const activeBrokerCount = brokers.filter((broker) => broker.status === "Active").length;
  const workflowRequiredCount = trades.filter((trade) => trade.status === "workflow_required").length;
  const readyCount = trades.filter((trade) => trade.status === "validated").length;
  const exceptionCount = trades.filter((trade) => trade.status === "unresolved" || trade.status === "needs_review").length;
  const tradeReviewTarget: NavKey = roleCanAccessNav(role, "review") ? "review" : roleCanAccessNav(role, "externalTrades") ? "externalTrades" : roleCanAccessNav(role, "trades") ? "trades" : "documents";
  const canOpenIntegrations = roleCanAccessNav(role, "integrations");
  const integrationsActionLabel = rolePermissions[role].canManageIntegrations ? "Manage" : "View";
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
            {roleCanAccessNav(role, tradeReviewTarget) && (
              <button onClick={() => onSelect(tradeReviewTarget)} className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {queueRows.map((trade) => (
              <button key={`${trade.broker}-${trade.ticker}-${trade.status}`} onClick={() => onSelect(tradeReviewTarget)} className="grid w-full grid-cols-[1.15fr_1fr_0.55fr_0.7fr_0.85fr_0.95fr] items-center rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2.5 text-left text-xs transition hover:bg-slate-800/40">
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
          {canOpenIntegrations && <button onClick={() => onSelect("integrations")} className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">{integrationsActionLabel} <ChevronRight className="h-3.5 w-3.5" /></button>}
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

function Trades({ trades: localTrades, role, openNewTrade, openTrade }: { trades: Trade[]; role: AccessRole; openNewTrade: () => void; openTrade: (trade: Trade) => void }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const canCreateTrades = rolePermissions[role].canCreateTrades;

  const uniqueBrokers = Array.from(new Set(localTrades.map(t => t.broker)));
  const statuses = ["all", "validated", "workflow_required", "unresolved", "needs_review"];
  const filtered = localTrades.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (brokerFilter !== "all" && t.broker !== brokerFilter) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    return true;
  });

  const activeFilters = [brokerFilter !== "all", typeFilter !== "all"].filter(Boolean).length;

  const exportCSV = () => {
    const header = ["ID", "Type", "Broker", "Ticker", "Asset", "Quantity", "Amount", "Status", "Workflow", "Time"].join(",");
    const rows = filtered.map(t => [t.id, t.type, `"${t.broker}"`, t.ticker, `"${t.asset}"`, t.quantity, t.amount, t.status, t.workflowReason, t.time].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "pats-trades.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageTitle
        title="PATS Trade Blotter"
        subtitle="Trades after PATS checks the broker, asset, workflow, and next action"
        action={canCreateTrades ? <button onClick={openNewTrade} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white shadow-lg shadow-sky-950/30"><Plus className="h-3.5 w-3.5" />New Manual Trade</button> : undefined}
      />
      {!canCreateTrades && <ReadOnlyNotice label="This role can inspect trades and workflow status, but cannot create manual trades or change trade routing." />}
      <Toolbar placeholder="Search trade, ticker, broker, private asset, investor, or workflow status...">
        <div className="relative">
          <button onClick={() => setStatusDropOpen(v => !v)} className="h-9 rounded-lg border border-slate-800 bg-[#11151b] px-4 text-sm text-slate-200">
            {statusFilter === "all" ? "All Status" : displayLabel(statusFilter)}
          </button>
          {statusDropOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-slate-800 bg-[#0d1015] shadow-xl">
              {statuses.map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setStatusDropOpen(false); }}
                  className={`block w-full px-3 py-2 text-left text-xs hover:bg-slate-800/60 ${statusFilter === s ? "font-semibold text-sky-400" : "text-slate-300"}`}>
                  {s === "all" ? "All Status" : displayLabel(s)}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setShowFilters(v => !v)} className={`flex h-9 items-center gap-2 rounded-lg border px-4 text-sm transition ${showFilters ? "border-sky-500/50 bg-sky-500/10 text-sky-300" : "border-slate-800 bg-[#11151b] text-slate-200"}`}>
          <Filter className="h-4 w-4" />Filters
          {activeFilters > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-white">{activeFilters}</span>}
        </button>
        <button onClick={exportCSV} className="flex h-9 items-center gap-2 rounded-lg border border-slate-800 bg-[#11151b] px-4 text-sm text-slate-200"><Download className="h-4 w-4" />Export</button>
      </Toolbar>
      {showFilters && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0d1015] px-4 py-3">
          <span className="text-[10px] font-semibold text-slate-500">FILTER BY</span>
          <select value={brokerFilter} onChange={e => setBrokerFilter(e.target.value)} className="h-7 rounded border border-slate-800 bg-[#11151b] px-2 text-xs text-slate-200 outline-none">
            <option value="all">All brokers</option>
            {uniqueBrokers.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-7 rounded border border-slate-800 bg-[#11151b] px-2 text-xs text-slate-200 outline-none">
            <option value="all">All types</option>
            {["Buy", "Sell", "Subscribe", "Redeem"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {activeFilters > 0 && <button onClick={() => { setBrokerFilter("all"); setTypeFilter("all"); }} className="ml-auto text-xs text-rose-400 hover:text-rose-300">Clear filters</button>}
        </div>
      )}
      <ShellCard className="overflow-hidden">
        <TradeTableHeader />
        <div className="space-y-px">
          {filtered.length === 0
            ? <p className="px-5 py-6 text-xs text-slate-500">No trades match the current filters.</p>
            : filtered.map((trade) => <TradeRow key={trade.id} trade={trade} onClick={() => openTrade(trade)} />)}
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
  const [showFilters, setShowFilters] = useState(false);
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");

  const uniqueBrokers = Array.from(new Set(externalTrades.map(t => t.broker)));
  const filtered = externalTrades.filter(t => {
    if (brokerFilter !== "all" && t.broker !== brokerFilter) return false;
    if (resultFilter !== "all" && t.validation !== resultFilter) return false;
    return true;
  });
  const activeFilters = [brokerFilter !== "all", resultFilter !== "all"].filter(Boolean).length;

  return (
    <>
      <PageTitle title="Inbound Blotter" subtitle="Trades received from Vantage and what PATS decided for each one" />
      <Toolbar placeholder="Search source, broker, ticker, private asset, PATS result, or received time...">
        <button onClick={() => setShowFilters(v => !v)} className={`flex h-9 items-center gap-2 rounded-md border px-3.5 text-xs font-semibold transition ${showFilters ? "border-sky-500/50 bg-sky-500/10 text-sky-300" : "border-slate-800 bg-[#11151b] text-slate-200"}`}>
          <Filter className="h-3.5 w-3.5" />Filters
          {activeFilters > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-white">{activeFilters}</span>}
        </button>
      </Toolbar>
      {showFilters && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0d1015] px-4 py-3">
          <span className="text-[10px] font-semibold text-slate-500">FILTER BY</span>
          <select value={brokerFilter} onChange={e => setBrokerFilter(e.target.value)} className="h-7 rounded border border-slate-800 bg-[#11151b] px-2 text-xs text-slate-200 outline-none">
            <option value="all">All brokers</option>
            {uniqueBrokers.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={resultFilter} onChange={e => setResultFilter(e.target.value)} className="h-7 rounded border border-slate-800 bg-[#11151b] px-2 text-xs text-slate-200 outline-none">
            <option value="all">All results</option>
            <option value="validated">Validated</option>
            <option value="workflow_required">Workflow required</option>
            <option value="unresolved">Unresolved</option>
          </select>
          {activeFilters > 0 && <button onClick={() => { setBrokerFilter("all"); setResultFilter("all"); }} className="ml-auto text-xs text-rose-400 hover:text-rose-300">Clear filters</button>}
        </div>
      )}
      <ShellCard className="overflow-hidden">
        <TableHeader columns={["Source", "Broker", "Ticker received", "Matched asset", "PATS result", "Next action", "Received"]} />
        <div className="divide-y divide-slate-800/80">
          {filtered.map((item) => (
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
          {filtered.length === 0 && <p className="px-5 py-4 text-xs text-slate-500">No trades match the current filters.</p>}
        </div>
      </ShellCard>
    </>
  );
}

function reviewReasonLabel(reason: ReviewReason) {
  const labels: Record<ReviewReason, string> = {
    missing_broker_ticker: "Missing broker ticker",
    unknown_private_asset: "Unknown private asset",
    invalid_account: "Invalid account",
    inactive_account: "Inactive account",
    broker_asset_mismatch: "Broker asset mismatch",
    inactive_private_asset: "Inactive private asset",
    missing_user: "Missing user",
    eligibility_error: "Eligibility error",
    workflow_creation_error: "Workflow creation error",
  };
  return labels[reason];
}

function reviewActionHint(reason: ReviewReason) {
  const hints: Record<ReviewReason, string> = {
    missing_broker_ticker: "Create or update the broker-scoped ticker mapping, then reprocess.",
    unknown_private_asset: "Create the private asset reference or attach the ticker to an existing asset.",
    invalid_account: "Assign an active PATS account or clear the external account before continuing.",
    inactive_account: "Reactivate the account or choose another household account.",
    broker_asset_mismatch: "Align the broker ticker mapping with the private asset owner.",
    inactive_private_asset: "Review the asset status before the trade can continue.",
    missing_user: "Link the external user to a PATS contact or leave the investor unassigned.",
    eligibility_error: "Retry the eligibility check after correcting account/user context.",
    workflow_creation_error: "Retry workflow creation after checking the template and document setup.",
  };
  return hints[reason];
}

function reviewPartyLabel(item: TradeReviewCase) {
  if (item.reason === "invalid_account" || item.reason === "inactive_account") return "Account needs mapping";
  if (item.reason === "missing_user") return "Investor needs mapping";
  if (item.accountId) return "Account assigned";
  if (item.userId?.includes("@")) return item.userId;
  if (item.userId) return "Investor linked";
  return "Not assigned";
}

function reviewAccountLabel(item: TradeReviewCase) {
  if (item.reason === "invalid_account") return "Needs account mapping";
  if (item.reason === "inactive_account") return "Inactive account";
  if (item.accountId) return "Assigned";
  return "Not assigned";
}

function reviewUserLabel(item: TradeReviewCase) {
  if (item.reason === "missing_user") return "Needs investor mapping";
  if (item.userId?.includes("@")) return item.userId;
  if (item.userId) return "Linked";
  return "Not assigned";
}

function ReviewCenter({ role }: { role: AccessRole }) {
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [reasonFilter, setReasonFilter] = useState<"all" | ReviewReason>("all");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const cases = tradeReviewCases;
  const filtered = cases.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (reasonFilter !== "all" && item.reason !== reasonFilter) return false;
    return true;
  });
  const unresolvedCount = cases.filter((item) => item.status === "unresolved").length;
  const needsReviewCount = cases.filter((item) => item.status === "needs_review").length;
  const highPriorityCount = cases.filter((item) => item.priority === "High").length;
  const reasonOptions = Array.from(new Set(cases.map((item) => item.reason)));

  if (role !== "pats_ops") {
    return <ReadOnlyNotice label="Review Center is reserved for PATS Ops because it can change mappings, account assignment, and trade disposition." />;
  }

  return (
    <>
      <PageTitle title="Review Center" subtitle="Resolve unresolved and needs review trades before they continue to workflow or execution" />
      <div className="mb-5 grid grid-cols-4 gap-4">
        <MetricCard label="Open review cases" value={cases.length.toString()} delta="ops queue" />
        <MetricCard label="Unresolved" value={unresolvedCount.toString()} delta="mapping needed" />
        <MetricCard label="Needs review" value={needsReviewCount.toString()} delta="manual decision" />
        <MetricCard label="High priority" value={highPriorityCount.toString()} delta="same day" />
      </div>
      <ShellCard className="mb-5 p-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Intake match", "Broker + ticker must resolve to an active broker-scoped private asset."],
            ["Investor context", "Optional user/account values must map to PATS records before they are trusted."],
            ["Workflow recovery", "Eligibility and workflow errors can be retried once the blocking data is corrected."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
              <p className="text-xs font-semibold text-slate-100">{title}</p>
              <p className="mt-1.5 text-[11px] leading-4 text-slate-500">{copy}</p>
            </div>
          ))}
        </div>
      </ShellCard>
      <Toolbar placeholder="Search inbound id, Vantage id, broker, ticker, account, or reason...">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | ReviewStatus)} className="h-9 rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs font-semibold text-slate-200 outline-none">
          <option value="all">All statuses</option>
          <option value="unresolved">Unresolved</option>
          <option value="needs_review">Needs review</option>
        </select>
        <select value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value as "all" | ReviewReason)} className="h-9 rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs font-semibold text-slate-200 outline-none">
          <option value="all">All reasons</option>
          {reasonOptions.map((reason) => <option key={reason} value={reason}>{reviewReasonLabel(reason)}</option>)}
        </select>
      </Toolbar>
      <ShellCard className="overflow-hidden">
        <div className="grid grid-cols-[0.9fr_1.1fr_0.9fr_1.25fr_1.25fr_1fr_0.85fr_0.5fr] border-b border-slate-800 bg-slate-950/60 px-5 py-2 text-[8px] font-semibold text-slate-600">
          <span>Status</span><span>Reason</span><span>Trade</span><span>Broker</span><span>Asset / ticker</span><span>Account / user</span><span>Received</span><span />
        </div>
        <div className="divide-y divide-slate-800/80">
          {filtered.map((item) => {
            const isOpen = expandedCase === item.reviewId;
            return (
              <div key={item.reviewId}>
                <button
                  onClick={() => setExpandedCase(isOpen ? null : item.reviewId)}
                  className={`grid w-full grid-cols-[0.9fr_1.1fr_0.9fr_1.25fr_1.25fr_1fr_0.85fr_0.5fr] items-center px-5 py-3.5 text-left transition hover:bg-slate-900/65 ${isOpen ? "bg-slate-900/50" : ""}`}
                >
                  <span><StatusBadge value={item.status} /></span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-100">{reviewReasonLabel(item.reason)}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-500">{item.priority} priority</span>
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-100">{item.side}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-500">{item.quantity !== "-" ? item.quantity : item.amount}</span>
                  </span>
                  <span>
                    <span className="block text-xs text-slate-300">{item.broker}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-500">{item.source}</span>
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-100">{item.privateAsset}</span>
                    <span className="mt-0.5 block text-[10px] text-sky-300">{item.ticker}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">{reviewPartyLabel(item)}</span>
                  <span className="text-xs text-slate-500">{item.receivedAt}</span>
                  <span className="flex justify-end">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180 text-sky-400" : "text-slate-600"}`} />
                  </span>
                </button>
                {isOpen && <ReviewCaseExpanded item={item} />}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="px-5 py-6 text-xs text-slate-500">No review cases match the current filters.</p>}
        </div>
      </ShellCard>
    </>
  );
}

function reviewAccountDisplay(item: TradeReviewCase): { label: string; value: string } | null {
  if (!item.accountId) return null;
  const found = householdAccounts.find((a) => a.accountId === item.accountId);
  if (found) {
    const hh = households.find((h) => h.householdId === found.householdId);
    return { label: "Account", value: `${found.accountNumber} · ${hh?.name ?? found.custodian}` };
  }
  return { label: "Broker account code", value: item.accountId.toUpperCase() };
}

function reviewUserDisplay(item: TradeReviewCase): { label: string; value: string } | null {
  if (!item.userId) return null;
  if (item.userId.includes("@")) return { label: "Investor", value: item.userId };
  return { label: "Investor code from broker", value: item.userId };
}

function ReviewCaseExpanded({ item }: { item: TradeReviewCase }) {
  const accountInfo = reviewAccountDisplay(item);
  const userInfo = reviewUserDisplay(item);

  return (
    <div className="border-t border-slate-800 bg-slate-950/40 px-5 py-5">
      <div className="grid grid-cols-[1fr_1.65fr] gap-6">
        <div className="space-y-4">
          <div>
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-slate-600">Trade context</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Info label="Received" value={item.receivedAt} />
              <Info label="Source" value={item.source} />
              <Info label="Broker" value={item.broker} />
              <Info label="Priority" value={item.priority} />
              <Info label="Ticker" value={item.ticker} />
              <Info label="Private asset" value={item.privateAsset} />
              <Info label="Side" value={item.side} />
              <Info label="Qty / Amount" value={`${item.quantity} / ${item.amount}`} />
              {accountInfo && <Info label={accountInfo.label} value={accountInfo.value} />}
              {userInfo && <Info label={userInfo.label} value={userInfo.value} />}
            </div>
          </div>
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-slate-600">Diagnosis</p>
            <p className="text-xs leading-5 text-slate-300">{item.diagnosis}</p>
          </div>
          <div>
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-slate-600">What was received</p>
            <div className="space-y-1.5">
              {item.payload.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[0.8fr_1.2fr] rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2 text-xs">
                  <span className="font-semibold text-slate-500">{label}</span>
                  <span className="truncate text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-slate-600">Resolution options</p>
          <div className="mb-4 rounded-md border border-sky-400/20 bg-sky-400/10 p-3">
            <p className="text-xs font-semibold text-sky-200">{item.resolution}</p>
            <p className="mt-1 text-[11px] text-sky-100/70">{reviewActionHint(item.reason)}</p>
          </div>
          {item.reason === "invalid_account" && <InvalidAccountPanel item={item} />}
          {item.reason === "inactive_account" && <InactiveAccountPanel item={item} />}
          {item.reason === "missing_broker_ticker" && <MissingTickerPanel item={item} />}
          {item.reason === "unknown_private_asset" && <UnknownAssetPanel item={item} />}
          {item.reason === "missing_user" && <MissingUserPanel item={item} />}
          {item.reason === "broker_asset_mismatch" && <BrokerMismatchPanel item={item} />}
          {item.reason === "inactive_private_asset" && <InactiveAssetPanel item={item} />}
          {item.reason === "eligibility_error" && <EligibilityErrorPanel item={item} />}
          {item.reason === "workflow_creation_error" && <WorkflowErrorPanel item={item} />}
        </div>
      </div>
    </div>
  );
}

function ReviewOptionTab<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className={`mb-4 grid gap-2`} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)}
          className={`rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${value === v ? "border-sky-500/50 bg-sky-500/15 text-sky-300" : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ReceivedBadge({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2.5">
      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-amber-300">{label}</p>
        <p className="mt-0.5 truncate font-mono text-xs text-amber-100">{value}</p>
      </div>
      <span className="flex-shrink-0 text-[10px] font-semibold text-amber-400/70">{note}</span>
    </div>
  );
}

function InvalidAccountPanel({ item }: { item: TradeReviewCase }) {
  const [mode, setMode] = useState<"assign" | "add" | "clear">("assign");
  const [selectedHousehold, setSelectedHousehold] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountType, setNewAccountType] = useState("individual");
  const [newCustodian, setNewCustodian] = useState("");

  const hhAccounts = householdAccounts.filter((a) => a.householdId === selectedHousehold && a.status === "active");
  const selectedAccountObj = householdAccounts.find((a) => a.accountId === selectedAccount);
  const selectedHhObj = households.find((h) => h.householdId === selectedHousehold);

  return (
    <div>
      <ReceivedBadge label="Account code sent by broker" value={(item.accountId ?? "—").toUpperCase()} note="Not in PATS" />
      <ReviewOptionTab
        options={[["assign", "Assign existing account"], ["add", "Add to household"], ["clear", "Continue without account"]] as ["assign" | "add" | "clear", string][]}
        value={mode} onChange={setMode}
      />
      {mode === "assign" && (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">Household</label>
            <select value={selectedHousehold} onChange={(e) => { setSelectedHousehold(e.target.value); setSelectedAccount(""); }}
              className="h-9 w-full rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs text-slate-200 outline-none">
              <option value="">Select household...</option>
              {households.filter((h) => h.status === "active").map((hh) => (
                <option key={hh.householdId} value={hh.householdId}>{hh.name}</option>
              ))}
            </select>
          </div>
          {selectedHousehold && (
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">Select account</label>
              {hhAccounts.length > 0 ? (
                <div className="space-y-2">
                  {hhAccounts.map((acct) => {
                    const primary = householdPersons.find((p) => p.personId === acct.primaryPersonId);
                    const primaryName = primary ? (primary.firstName ? `${primary.firstName} ${primary.lastName}` : primary.entityName) : "—";
                    const isSelected = selectedAccount === acct.accountId;
                    return (
                      <button key={acct.accountId} onClick={() => setSelectedAccount(acct.accountId)}
                        className={`w-full rounded-md border px-3 py-2.5 text-left transition ${isSelected ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-100">{acct.accountNumber}</span>
                          <div className="flex items-center gap-2">
                            <StatusBadge value={acct.accountType} />
                            <StatusBadge value={acct.status} />
                          </div>
                        </div>
                        <div className="mt-1 flex gap-2 text-[10px] text-slate-500">
                          <span>{primaryName}</span><span>·</span><span>{acct.custodian}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No active accounts in this household.</p>
              )}
            </div>
          )}
          <button disabled={!selectedAccount}
            className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40">
            {selectedAccountObj ? `Assign ${selectedAccountObj.accountNumber} & reprocess trade` : "Assign account & reprocess trade"}
          </button>
        </div>
      )}
      {mode === "add" && (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">Household</label>
            <select value={selectedHousehold} onChange={(e) => setSelectedHousehold(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs text-slate-200 outline-none">
              <option value="">Select household...</option>
              {households.filter((h) => h.status === "active").map((hh) => (
                <option key={hh.householdId} value={hh.householdId}>{hh.name}</option>
              ))}
            </select>
          </div>
          {selectedHousehold && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">Account number</label>
                  <input type="text" placeholder="e.g. GSAS-4492" value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs text-slate-200 outline-none placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">Account type</label>
                  <select value={newAccountType} onChange={(e) => setNewAccountType(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs text-slate-200 outline-none">
                    <option value="individual">Individual</option>
                    <option value="joint">Joint</option>
                    <option value="trust">Trust</option>
                    <option value="ira">IRA</option>
                    <option value="roth_ira">Roth IRA</option>
                    <option value="entity">Entity</option>
                    <option value="limited_partnership">Limited partnership</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">Custodian</label>
                <input type="text" placeholder="e.g. Goldman Sachs" value={newCustodian} onChange={(e) => setNewCustodian(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs text-slate-200 outline-none placeholder:text-slate-600" />
              </div>
              <button disabled={!newAccountNumber.trim() || !newCustodian.trim()}
                className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40">
                Add account to {selectedHhObj?.name ?? "household"} & reprocess trade
              </button>
            </>
          )}
        </div>
      )}
      {mode === "clear" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            The broker account code <span className="font-mono text-slate-200">{(item.accountId ?? "").toUpperCase()}</span> will be cleared. The trade will continue without an assigned account — Ops must verify disposition before routing to execution.
          </div>
          <button className="h-9 w-full rounded-md border border-amber-400/30 bg-amber-400/10 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/15">
            Clear account & reprocess trade
          </button>
        </div>
      )}
    </div>
  );
}

function InactiveAccountPanel({ item }: { item: TradeReviewCase }) {
  const [mode, setMode] = useState<"reactivate" | "reassign" | "clear">("reactivate");
  const [selectedHousehold, setSelectedHousehold] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  const currentAccount = householdAccounts.find((a) => a.accountId === item.accountId);
  const hhAccounts = householdAccounts.filter((a) => a.householdId === selectedHousehold && a.status === "active" && a.accountId !== item.accountId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-[10px] font-semibold text-amber-300">Inactive account</p>
            <p className="mt-0.5 font-mono text-xs text-amber-100">{currentAccount?.accountNumber ?? item.accountId}</p>
          </div>
        </div>
        <StatusBadge value="inactive" />
      </div>
      <ReviewOptionTab
        options={[["reactivate", "Reactivate account"], ["reassign", "Use different account"], ["clear", "Clear reference"]] as ["reactivate" | "reassign" | "clear", string][]}
        value={mode} onChange={setMode}
      />
      {mode === "reactivate" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            Account <span className="text-slate-200">{currentAccount?.accountNumber ?? item.accountId}</span> will be set to active. The trade will be reprocessed automatically once the account is reactivated.
          </div>
          <button className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400">
            Reactivate account & reprocess trade
          </button>
        </div>
      )}
      {mode === "reassign" && (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">Household</label>
            <select value={selectedHousehold} onChange={(e) => { setSelectedHousehold(e.target.value); setSelectedAccount(""); }}
              className="h-9 w-full rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs text-slate-200 outline-none">
              <option value="">Select household...</option>
              {households.filter((h) => h.status === "active").map((hh) => (
                <option key={hh.householdId} value={hh.householdId}>{hh.name}</option>
              ))}
            </select>
          </div>
          {selectedHousehold && (
            <div className="space-y-2">
              {hhAccounts.length > 0 ? hhAccounts.map((acct) => {
                const primary = householdPersons.find((p) => p.personId === acct.primaryPersonId);
                const primaryName = primary ? (primary.firstName ? `${primary.firstName} ${primary.lastName}` : primary.entityName) : "—";
                const isSelected = selectedAccount === acct.accountId;
                return (
                  <button key={acct.accountId} onClick={() => setSelectedAccount(acct.accountId)}
                    className={`w-full rounded-md border px-3 py-2.5 text-left transition ${isSelected ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-100">{acct.accountNumber}</span>
                      <StatusBadge value={acct.accountType} />
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{primaryName} · {acct.custodian}</div>
                  </button>
                );
              }) : <p className="text-xs text-slate-500">No other active accounts in this household.</p>}
            </div>
          )}
          <button disabled={!selectedAccount}
            className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40">
            Reassign account & reprocess trade
          </button>
        </div>
      )}
      {mode === "clear" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            The account reference will be cleared. The trade will continue without an assigned account — Ops must verify disposition before routing to execution.
          </div>
          <button className="h-9 w-full rounded-md border border-amber-400/30 bg-amber-400/10 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/15">
            Clear account & reprocess trade
          </button>
        </div>
      )}
    </div>
  );
}

function MissingTickerPanel({ item }: { item: TradeReviewCase }) {
  const [mode, setMode] = useState<"map" | "reject">("map");
  const [selectedAsset, setSelectedAsset] = useState("");

  const brokerAssets = assets.filter((a) => a.broker === item.broker && a.status === "active");

  return (
    <div>
      <ReceivedBadge label="Ticker sent by broker — no mapping found" value={`${item.ticker} · ${item.broker}`} note="Unresolved" />
      <ReviewOptionTab
        options={[["map", "Map to private asset"], ["reject", "Reject trade"]] as ["map" | "reject", string][]}
        value={mode} onChange={setMode}
      />
      {mode === "map" && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-slate-500">Active assets under {item.broker}</p>
          {brokerAssets.length > 0 ? (
            <div className="space-y-2">
              {brokerAssets.map((a) => {
                const isSelected = selectedAsset === a.privateAssetId;
                return (
                  <button key={a.privateAssetId} onClick={() => setSelectedAsset(a.privateAssetId)}
                    className={`w-full rounded-md border px-3 py-2.5 text-left transition ${isSelected ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-100">{a.name}</span>
                      <StatusBadge value={a.status} />
                    </div>
                    <div className="mt-0.5 flex gap-2 text-[10px] text-slate-500">
                      <span className="text-sky-400">{a.ticker}</span><span>·</span>
                      <span>{a.assetClass.replace(/_/g, " ")}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No active assets for this broker. Create a private asset first.</p>
          )}
          <button disabled={!selectedAsset}
            className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40">
            Map {item.ticker} to selected asset & reprocess trade
          </button>
        </div>
      )}
      {mode === "reject" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            Inbound trade for ticker <span className="font-mono text-slate-200">{item.ticker}</span> will be rejected and removed from the active queue. This cannot be undone.
          </div>
          <button className="h-9 w-full rounded-md border border-rose-400/30 bg-rose-400/10 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/15">
            Reject inbound trade
          </button>
        </div>
      )}
    </div>
  );
}

function MissingUserPanel({ item }: { item: TradeReviewCase }) {
  const [mode, setMode] = useState<"link" | "clear">("link");
  const [selectedPerson, setSelectedPerson] = useState("");

  const activePersons = householdPersons.filter((p) => p.status === "active");
  const isEmail = item.userId?.includes("@");

  return (
    <div>
      <ReceivedBadge
        label={isEmail ? "Investor email from broker — no PATS match" : "Investor code from broker — no PATS match"}
        value={item.userId ?? "—"}
        note="Not found"
      />
      <ReviewOptionTab
        options={[["link", "Link to existing contact"], ["clear", "Clear reference"]] as ["link" | "clear", string][]}
        value={mode} onChange={setMode}
      />
      {mode === "link" && (
        <div className="space-y-3">
          <label className="block text-[10px] font-semibold text-slate-500">Select PATS contact</label>
          <div className="max-h-52 space-y-2 overflow-y-auto pr-0.5">
            {activePersons.map((p) => {
              const name = p.firstName ? `${p.firstName} ${p.lastName}` : (p.entityName ?? "—");
              const hh = households.find((h) => h.householdId === p.householdId);
              const isSelected = selectedPerson === p.personId;
              return (
                <button key={p.personId} onClick={() => setSelectedPerson(p.personId)}
                  className={`w-full rounded-md border px-3 py-2.5 text-left transition ${isSelected ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-100">{name}</span>
                    <StatusBadge value={p.entityType} />
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{hh?.name} · {p.email}</div>
                </button>
              );
            })}
          </div>
          <button disabled={!selectedPerson}
            className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40">
            Link investor & reprocess trade
          </button>
        </div>
      )}
      {mode === "clear" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            The investor reference <span className="text-slate-200">{item.userId}</span> will be cleared. The trade will continue without an assigned investor — Ops must verify disposition before routing to execution.
          </div>
          <button className="h-9 w-full rounded-md border border-amber-400/30 bg-amber-400/10 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/15">
            Clear investor & reprocess trade
          </button>
        </div>
      )}
    </div>
  );
}

function BrokerMismatchPanel({ item }: { item: TradeReviewCase }) {
  const [mode, setMode] = useState<"move_ticker" | "open_asset">("move_ticker");
  const assetObj = assets.find((a) => a.ticker === item.ticker);

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2.5">
          <p className="text-[10px] font-semibold text-amber-300">Ticker broker</p>
          <p className="mt-0.5 text-xs text-amber-100">{item.broker}</p>
        </div>
        <div className="rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2.5">
          <p className="text-[10px] font-semibold text-rose-300">Asset owner</p>
          <p className="mt-0.5 text-xs text-rose-100">{assetObj?.broker ?? "Goldman Sachs Advisor Solutions"}</p>
        </div>
      </div>
      <ReviewOptionTab
        options={[["move_ticker", "Move ticker to asset's broker"], ["open_asset", "Open asset profile"]] as ["move_ticker" | "open_asset", string][]}
        value={mode} onChange={setMode}
      />
      {mode === "move_ticker" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            Ticker <span className="font-mono text-slate-200">{item.ticker}</span> will be re-scoped from <span className="text-slate-300">{item.broker}</span> to <span className="text-slate-300">{assetObj?.broker ?? "the asset owner"}</span>. The trade will be reprocessed after the move.
          </div>
          <button className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400">
            Move ticker to {assetObj?.broker ?? "asset's broker"} & reprocess trade
          </button>
        </div>
      )}
      {mode === "open_asset" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/35 px-3 py-3 text-xs">
            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-slate-500">Asset</span><span className="text-slate-100">{item.privateAsset}</span>
              <span className="text-slate-500">Ticker</span><span className="font-mono text-sky-300">{item.ticker}</span>
              <span className="text-slate-500">Owner broker</span><span className="text-slate-100">{assetObj?.broker ?? "—"}</span>
              <span className="text-slate-500">Status</span><span><StatusBadge value={assetObj?.status ?? "unknown"} /></span>
            </div>
          </div>
          <button className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 transition hover:border-slate-600">
            Open asset profile →
          </button>
        </div>
      )}
    </div>
  );
}

function InactiveAssetPanel({ item }: { item: TradeReviewCase }) {
  const [mode, setMode] = useState<"reactivate" | "hold">("reactivate");
  const assetObj = assets.find((a) => a.ticker === item.ticker);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-[10px] font-semibold text-amber-300">Asset status</p>
            <p className="mt-0.5 text-xs text-amber-100">{item.privateAsset}</p>
          </div>
        </div>
        <StatusBadge value={assetObj?.status ?? "restricted"} />
      </div>
      <ReviewOptionTab
        options={[["reactivate", "Reactivate asset"], ["hold", "Hold trade"]] as ["reactivate" | "hold", string][]}
        value={mode} onChange={setMode}
      />
      {mode === "reactivate" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            <span className="text-slate-300">{item.privateAsset}</span> will be set to active. Confirm with the asset sponsor that trading is permitted before reactivating.
          </div>
          <button className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400">
            Reactivate {item.privateAsset} & reprocess trade
          </button>
        </div>
      )}
      {mode === "hold" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            The trade will remain in the review queue until the asset is reactivated or a disposition decision is made by Ops.
          </div>
          <button className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 transition hover:border-slate-600">
            Hold trade in queue
          </button>
        </div>
      )}
    </div>
  );
}

function WorkflowErrorPanel({ item }: { item: TradeReviewCase }) {
  const [mode, setMode] = useState<"retry" | "inspect">("retry");
  const workflow = workflows.find((w) => w.asset === item.privateAsset);

  return (
    <div>
      <div className="mb-4 rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
            <p className="text-[10px] font-semibold text-amber-300">Failed workflow template</p>
          </div>
          <StatusBadge value="error" />
        </div>
        <p className="mt-1.5 text-xs text-amber-100">{workflow?.name ?? "Template not found"}</p>
      </div>
      <ReviewOptionTab
        options={[["retry", "Retry workflow creation"], ["inspect", "Inspect template"]] as ["retry" | "inspect", string][]}
        value={mode} onChange={setMode}
      />
      {mode === "retry" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            PATS will attempt to create the trade workflow again using template <span className="text-slate-300">{workflow?.name}</span>. All steps and documents will be initialized from the template definition.
          </div>
          <button className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400">
            Retry workflow creation & reprocess trade
          </button>
        </div>
      )}
      {mode === "inspect" && (
        <div className="space-y-3">
          {workflow ? (
            <>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 px-3 py-3 text-xs">
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-slate-500">Template</span><span className="text-slate-100">{workflow.name}</span>
                  <span className="text-slate-500">Type</span><span className="text-slate-100">{workflow.type}</span>
                  <span className="text-slate-500">Policy</span><span className="text-slate-100">{workflow.policy}</span>
                  <span className="text-slate-500">Requirements</span><span className="text-slate-100">{workflow.requirements}</span>
                  <span className="text-slate-500">Status</span><span><StatusBadge value={workflow.status} /></span>
                </div>
              </div>
              <button className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 transition hover:border-slate-600">
                Open workflow template →
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-500">No matching template found for this asset.</p>
          )}
        </div>
      )}
    </div>
  );
}

function UnknownAssetPanel({ item }: { item: TradeReviewCase }) {
  const [mode, setMode] = useState<"map" | "create" | "reject">("map");
  const [selectedAsset, setSelectedAsset] = useState("");

  const allActiveAssets = assets.filter((a) => a.status === "active");

  return (
    <div>
      <ReceivedBadge label="Ticker sent by broker — no private asset found" value={`${item.ticker} · ${item.broker}`} note="Unresolved" />
      <ReviewOptionTab
        options={[["map", "Map to existing asset"], ["create", "Create new private asset"], ["reject", "Reject trade"]] as ["map" | "create" | "reject", string][]}
        value={mode} onChange={setMode}
      />
      {mode === "map" && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-slate-500">Select the PATS private asset this ticker represents</p>
          <div className="max-h-52 space-y-2 overflow-y-auto pr-0.5">
            {allActiveAssets.map((a) => {
              const isSelected = selectedAsset === a.privateAssetId;
              return (
                <button key={a.privateAssetId} onClick={() => setSelectedAsset(a.privateAssetId)}
                  className={`w-full rounded-md border px-3 py-2.5 text-left transition ${isSelected ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-100">{a.name}</span>
                    <StatusBadge value={a.status} />
                  </div>
                  <div className="mt-0.5 flex gap-2 text-[10px] text-slate-500">
                    <span className="text-sky-400">{a.ticker}</span><span>·</span>
                    <span>{a.broker}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <button disabled={!selectedAsset}
            className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40">
            Map {item.ticker} to selected asset & reprocess trade
          </button>
        </div>
      )}
      {mode === "create" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            You will be taken to the Private Assets section to create a new asset record for ticker <span className="font-mono text-slate-200">{item.ticker}</span> under <span className="text-slate-300">{item.broker}</span>. Once created, return here to reprocess the trade.
          </div>
          <button className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 transition hover:border-slate-600">
            Go to Private Assets → create {item.ticker}
          </button>
        </div>
      )}
      {mode === "reject" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            The inbound trade for <span className="font-mono text-slate-200">{item.ticker}</span> from <span className="text-slate-300">{item.broker}</span> will be rejected and removed from the queue. This action cannot be undone.
          </div>
          <button className="h-9 w-full rounded-md border border-rose-400/30 bg-rose-400/10 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/15">
            Reject inbound trade
          </button>
        </div>
      )}
    </div>
  );
}

function EligibilityErrorPanel({ item }: { item: TradeReviewCase }) {
  const [mode, setMode] = useState<"mark_eligible" | "create_workflow" | "retry">("mark_eligible");

  const accountObj = householdAccounts.find((a) => a.accountId === item.accountId);
  const accountHh = households.find((h) => h.householdId === accountObj?.householdId);
  const assetObj = assets.find((a) => a.ticker === item.ticker);
  const workflowTemplate = workflows.find((w) => w.asset === item.privateAsset);

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2.5">
          <p className="text-[10px] font-semibold text-slate-500">Investor</p>
          <p className="mt-0.5 truncate text-xs text-slate-100">{item.userId ?? "Not assigned"}</p>
        </div>
        <div className="rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2.5">
          <p className="text-[10px] font-semibold text-amber-300">Eligibility status</p>
          <p className="mt-0.5 text-xs text-amber-100">Check failed</p>
        </div>
        {accountObj && (
          <div className="col-span-2 rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-slate-500">Account</p>
            <p className="mt-0.5 text-xs text-slate-100">{accountObj.accountNumber} · {accountHh?.name}</p>
          </div>
        )}
      </div>
      <ReviewOptionTab
        options={[["mark_eligible", "Mark eligible manually"], ["create_workflow", "Route to workflow"], ["retry", "Retry check"]] as ["mark_eligible" | "create_workflow" | "retry", string][]}
        value={mode} onChange={setMode}
      />
      {mode === "mark_eligible" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            The investor will be manually marked as eligible for <span className="text-slate-300">{item.privateAsset}</span>. This bypasses the automated eligibility check and logs the Ops override. Confirm this is appropriate before proceeding.
          </div>
          <button className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400">
            Mark eligible & reprocess trade
          </button>
        </div>
      )}
      {mode === "create_workflow" && (
        <div className="space-y-3">
          {workflowTemplate ? (
            <>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 px-3 py-3 text-xs">
                <p className="mb-2 text-[10px] font-semibold text-slate-500">Workflow that will be created</p>
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-slate-500">Template</span><span className="text-slate-100">{workflowTemplate.name}</span>
                  <span className="text-slate-500">Type</span><span className="text-slate-100">{workflowTemplate.type}</span>
                  <span className="text-slate-500">Policy</span><span className="text-slate-100">{workflowTemplate.policy}</span>
                  <span className="text-slate-500">Requirements</span><span className="text-slate-100">{workflowTemplate.requirements}</span>
                </div>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
                A trade workflow will be created directly, skipping the eligibility check. The investor will need to complete all workflow requirements before the trade routes to execution.
              </div>
              <button className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white transition hover:bg-sky-400">
                Create workflow & reprocess trade
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-500">No workflow template found for {item.privateAsset}. Create one in the Workflows section first.</p>
          )}
        </div>
      )}
      {mode === "retry" && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
            PATS will re-run the eligibility check for <span className="text-slate-300">{item.userId ?? "this investor"}</span> against <span className="text-slate-300">{item.privateAsset}</span>. If the check passes this time, the trade will continue automatically.
          </div>
          <button className="h-9 w-full rounded-md border border-sky-500/40 bg-sky-500/10 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/15">
            Retry eligibility check & reprocess trade
          </button>
        </div>
      )}
    </div>
  );
}

function Brokers({ brokers: localBrokers, role, updateBroker, openNewBroker }: { brokers: Broker[]; role: AccessRole; updateBroker: (id: string, p: Partial<Broker>) => void; openNewBroker: () => void }) {
  const [expandedBroker, setExpandedBroker] = useState<string | null>(null);
  const canManageBrokers = rolePermissions[role].canManageBrokers;

  return (
    <>
      <PageTitle title="Asset Brokers" subtitle="Brokers from Vantage with the PATS settings needed for private asset trades" action={canManageBrokers ? <button onClick={openNewBroker} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" />Enable Broker</button> : undefined} />
      {!canManageBrokers && <ReadOnlyNotice label="Broker settings are visible for context, but enabling, disabling, or editing broker routing is reserved for Ops." />}
      <Toolbar placeholder="Search broker, workflow owner, fill return, asset, or ticker..." />
      <ShellCard className="overflow-hidden">
        <div className="grid grid-cols-[1.55fr_0.7fr_1fr_1.05fr_0.55fr_0.55fr_0.55fr_0.35fr] border-b border-slate-800 bg-slate-950/60 px-5 py-2 text-[8px] font-semibold text-slate-600">
          <span>Broker</span><span>Status</span><span>Workflow owner</span><span>Fill return</span>
          <span className="text-right">Assets</span><span className="text-right">Tickers</span><span className="text-right">Trades</span><span />
        </div>
        <div className="divide-y divide-slate-800/90">
          {localBrokers.map((broker) => {
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
                        {canManageBrokers && (
                          <div className="mt-4">
                            {broker.status === "Active" ? (
                              <button
                                onClick={() => updateBroker(broker.patsBrokerProfileId, { status: "Disconnected" })}
                                className="flex h-8 items-center gap-1.5 rounded-md border border-rose-400/30 bg-rose-400/10 px-3 text-xs font-semibold text-rose-300 hover:bg-rose-400/20"
                              >
                                Disable broker
                              </button>
                            ) : (
                              <button
                                onClick={() => updateBroker(broker.patsBrokerProfileId, { status: "Active" })}
                                className="flex h-8 items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20"
                              >
                                Re-enable broker
                              </button>
                            )}
                          </div>
                        )}
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

function PrivateAssets({
  localAssets,
  localBrokers,
  role,
  onAddAsset,
  onMapTicker,
}: {
  localAssets: Asset[];
  localBrokers: Broker[];
  role: AccessRole;
  onAddAsset: (asset: Asset) => void;
  onMapTicker: (assetId: string, ticker: string) => void;
}) {
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assetPanel, setAssetPanel] = useState<"create" | "resolution" | null>(null);
  const canManageAssets = rolePermissions[role].canManageBrokers;

  const uniqueBrokers = Array.from(new Set(localAssets.map(a => a.broker)));
  const filteredAssets = localAssets.filter(a => {
    if (brokerFilter !== "all" && a.broker !== brokerFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });
  const activeFilters = [brokerFilter !== "all", statusFilter !== "all"].filter(Boolean).length;

  return (
    <>
      <PageTitle
        title="Private Assets"
        subtitle="Manage private investments and the broker tickers used to identify them in incoming trades"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setAssetPanel("resolution")} className="flex h-9 items-center gap-1.5 rounded-md border border-slate-700 bg-[#11151b] px-3 text-xs font-semibold text-slate-200 transition hover:border-sky-500/50 hover:text-sky-300">
              <Route className="h-3.5 w-3.5" />Ticker resolution
            </button>
            {canManageAssets && (
              <button onClick={() => setAssetPanel("create")} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white shadow-lg shadow-sky-950/30">
                <Plus className="h-3.5 w-3.5" />New private asset
              </button>
            )}
          </div>
        }
      />
      {!canManageAssets && <ReadOnlyNotice label="Asset creation and ticker mapping are reserved for PATS Ops. You can still test ticker resolution for brokers in your scope." />}
      <Toolbar placeholder="Search asset, broker, ticker, sponsor, document platform, or workflow rule...">
        <button onClick={() => setShowFilters(v => !v)} className={`flex h-9 items-center gap-2 rounded-md border px-3.5 text-xs font-semibold transition ${showFilters ? "border-sky-500/50 bg-sky-500/10 text-sky-300" : "border-slate-800 bg-[#11151b] text-slate-200"}`}>
          <Filter className="h-3.5 w-3.5" />Filters
          {activeFilters > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-white">{activeFilters}</span>}
        </button>
      </Toolbar>
      {showFilters && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0d1015] px-4 py-3">
          <span className="text-[10px] font-semibold text-slate-500">FILTER BY</span>
          <select value={brokerFilter} onChange={e => setBrokerFilter(e.target.value)} className="h-7 rounded border border-slate-800 bg-[#11151b] px-2 text-xs text-slate-200 outline-none">
            <option value="all">All brokers</option>
            {uniqueBrokers.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-7 rounded border border-slate-800 bg-[#11151b] px-2 text-xs text-slate-200 outline-none">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="restricted">Restricted</option>
            <option value="inactive">Inactive</option>
          </select>
          {activeFilters > 0 && <button onClick={() => { setBrokerFilter("all"); setStatusFilter("all"); }} className="ml-auto text-xs text-rose-400 hover:text-rose-300">Clear filters</button>}
        </div>
      )}
      <ShellCard className="overflow-hidden">
        <div className="grid grid-cols-[1.45fr_1.05fr_0.65fr_0.7fr_1fr_0.9fr_1.1fr_0.35fr] border-b border-slate-800 bg-slate-950/60 px-5 py-2 text-[8px] font-semibold text-slate-600">
          <span>Asset</span><span>Broker</span><span>Ticker</span><span>Status</span><span>Terms</span><span>Documents</span><span>Workflow rule</span><span />
        </div>
        <div className="divide-y divide-slate-800/90">
          {filteredAssets.map((asset) => {
            const isOpen = expandedAsset === asset.privateAssetId;
            const workflow = workflows.find((flow) => flow.privateAssetId === asset.privateAssetId);
            const workflowLabel = workflow ? displayLabel(workflow.policy) : "No workflow";
            const hasTickerMapping = Boolean(asset.ticker && asset.brokerScopedTickerId);
            const canTrade = asset.status === "active" && hasTickerMapping && workflow;

            return (
              <div key={asset.privateAssetId}>
                <button
                  onClick={() => setExpandedAsset(isOpen ? null : asset.privateAssetId)}
                  className="grid w-full grid-cols-[1.45fr_1.05fr_0.65fr_0.7fr_1fr_0.9fr_1.1fr_0.35fr] items-center px-5 py-3.5 text-left text-sm transition hover:bg-slate-900/65"
                >
                  <span>
                    <span className="block font-semibold text-slate-100">{asset.name}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{asset.className} - {asset.gpSponsor}</span>
                  </span>
                  <span className="text-xs text-slate-400">{asset.broker}</span>
                  <span className={`text-sm font-semibold ${hasTickerMapping ? "text-sky-300" : "text-slate-600"}`}>{asset.ticker || "Not mapped"}</span>
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
                          <Info label="Ticker" value={asset.ticker || "Not mapped"} />
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
                            ["Ticker mapped", hasTickerMapping],
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
          {filteredAssets.length === 0 && <p className="px-5 py-6 text-xs text-slate-500">No assets match the current filters.</p>}
        </div>
      </ShellCard>
      {assetPanel === "create" && canManageAssets && (
        <CreatePrivateAssetPanel brokers={localBrokers} onAdd={onAddAsset} onClose={() => setAssetPanel(null)} />
      )}
      {assetPanel === "resolution" && (
        <TickerResolutionPanel
          assets={localAssets}
          brokers={localBrokers}
          canCreateMapping={canManageAssets}
          onMapTicker={onMapTicker}
          onClose={() => setAssetPanel(null)}
        />
      )}
    </>
  );
}

const privateAssetClassOptions: Array<{ value: Asset["assetClass"]; label: string }> = [
  { value: "private_equity", label: "Private Equity" },
  { value: "private_credit", label: "Private Credit" },
  { value: "venture_capital", label: "Venture Capital" },
  { value: "hedge_fund", label: "Hedge Fund" },
  { value: "real_assets", label: "Real Assets" },
  { value: "other", label: "Other" },
];

function CreatePrivateAssetPanel({ brokers: brokerOptions, onAdd, onClose }: { brokers: Broker[]; onAdd: (asset: Asset) => void; onClose: () => void }) {
  const activeBrokers = brokerOptions.filter((broker) => broker.status === "Active");
  const [brokerName, setBrokerName] = useState(activeBrokers[0]?.name ?? "");
  const [name, setName] = useState("");
  const [assetClass, setAssetClass] = useState<Asset["assetClass"]>("private_equity");
  const [preceptAssetClass, setPreceptAssetClass] = useState("equity_alternatives");
  const [preceptStyle, setPreceptStyle] = useState("late_stage_venture_growth_equity");
  const [fundStructure, setFundStructure] = useState("");
  const [gpSponsor, setGpSponsor] = useState("");
  const [liquidityTerms, setLiquidityTerms] = useState("");
  const [lockupPeriod, setLockupPeriod] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [taxDocumentSource, setTaxDocumentSource] = useState("");
  const [documentExecutionPlatform, setDocumentExecutionPlatform] = useState("");
  const [value, setValue] = useState("");
  const [supply, setSupply] = useState("");
  const [units, setUnits] = useState("");

  const handleCreate = () => {
    const broker = brokerOptions.find((item) => item.name === brokerName);
    if (!broker || !name.trim()) return;
    const assetClassLabel = privateAssetClassOptions.find((item) => item.value === assetClass)?.label ?? displayLabel(assetClass);
    onAdd({
      privateAssetId: `pa_mock_${Date.now().toString(36)}`,
      patsBrokerProfileId: broker.patsBrokerProfileId,
      brokerScopedTickerId: "",
      ticker: "",
      name: name.trim(),
      broker: broker.name,
      assetClass,
      preceptAssetClass,
      preceptStyle,
      fundStructure,
      gpSponsor,
      liquidityTerms,
      lockupPeriod,
      noticePeriod,
      taxDocumentSource,
      documentExecutionPlatform,
      status: "active",
      className: assetClassLabel,
      structure: fundStructure || "Not specified",
      sponsor: gpSponsor || "Not specified",
      value: value || "$0",
      liquidity: "Low",
      lockup: lockupPeriod || "Not specified",
      notice: noticePeriod || "Not specified",
      supply: supply || "$0",
      units: units || "0",
    });
    onClose();
  };

  return (
    <DetailPanel title="New Private Asset" subtitle="Step 1 of 2 - create the broker-owned asset record" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Ownership and classification</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="col-span-2"><FormField label="Broker"><select className={compactInputClass} value={brokerName} onChange={(event) => setBrokerName(event.target.value)}>{activeBrokers.map((broker) => <option key={broker.patsBrokerProfileId} value={broker.name}>{broker.name}</option>)}</select></FormField></div>
            <div className="col-span-2"><FormField label="Asset name"><input className={compactInputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Northstar Growth Fund III" /></FormField></div>
            <FormField label="Private asset class"><select className={compactInputClass} value={assetClass} onChange={(event) => setAssetClass(event.target.value as Asset["assetClass"])}>{privateAssetClassOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></FormField>
            <FormField label="Precept asset class"><select className={compactInputClass} value={preceptAssetClass} onChange={(event) => setPreceptAssetClass(event.target.value)}><option value="equity_alternatives">Equity Alternatives</option><option value="fixed_income_alternatives">Fixed Income Alternatives</option><option value="real_assets">Real Assets</option><option value="structured_products">Structured Products</option></select></FormField>
            <div className="col-span-2"><FormField label="Investment style"><select className={compactInputClass} value={preceptStyle} onChange={(event) => setPreceptStyle(event.target.value)}><option value="late_stage_venture_growth_equity">Late Stage Venture / Growth Equity</option><option value="lower_middle_market_private_credit">Lower Middle Market Private Credit</option><option value="upper_middle_market_private_credit">Upper Middle Market Private Credit</option><option value="upper_middle_market_private_equity">Upper Middle Market Private Equity</option><option value="real_estate_private_credit">Real Estate Private Credit</option><option value="infrastructure_funds">Infrastructure Funds</option><option value="hedge_funds">Hedge Funds</option><option value="multi_asset">Multi Asset</option></select></FormField></div>
          </div>
        </ShellCard>
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Terms and operations</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Fund structure"><input className={compactInputClass} value={fundStructure} onChange={(event) => setFundStructure(event.target.value)} placeholder="3(c)(7), feeder, drawdown" /></FormField>
            <FormField label="GP / Sponsor"><input className={compactInputClass} value={gpSponsor} onChange={(event) => setGpSponsor(event.target.value)} placeholder="Northstar Capital" /></FormField>
            <div className="col-span-2"><FormField label="Liquidity terms"><input className={compactInputClass} value={liquidityTerms} onChange={(event) => setLiquidityTerms(event.target.value)} placeholder="Quarterly windows" /></FormField></div>
            <FormField label="Lock-up period"><input className={compactInputClass} value={lockupPeriod} onChange={(event) => setLockupPeriod(event.target.value)} placeholder="24 months" /></FormField>
            <FormField label="Notice period"><input className={compactInputClass} value={noticePeriod} onChange={(event) => setNoticePeriod(event.target.value)} placeholder="90 days" /></FormField>
            <FormField label="Tax document source"><input className={compactInputClass} value={taxDocumentSource} onChange={(event) => setTaxDocumentSource(event.target.value)} placeholder="UMB" /></FormField>
            <FormField label="Document platform"><input className={compactInputClass} value={documentExecutionPlatform} onChange={(event) => setDocumentExecutionPlatform(event.target.value)} placeholder="DocuSign" /></FormField>
          </div>
        </ShellCard>
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Position metadata</h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <FormField label="Value"><input className={compactInputClass} value={value} onChange={(event) => setValue(event.target.value)} placeholder="$2.4M" /></FormField>
            <FormField label="Supply"><input className={compactInputClass} value={supply} onChange={(event) => setSupply(event.target.value)} placeholder="$12M" /></FormField>
            <FormField label="Units"><input className={compactInputClass} value={units} onChange={(event) => setUnits(event.target.value)} placeholder="48,000" /></FormField>
          </div>
        </ShellCard>
        <div className="grid grid-cols-2 gap-3"><button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button><button onClick={handleCreate} disabled={!brokerName || !name.trim()} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Create asset</button></div>
      </div>
    </DetailPanel>
  );
}

function TickerResolutionPanel({ assets: assetOptions, brokers: brokerOptions, canCreateMapping, onMapTicker, onClose }: { assets: Asset[]; brokers: Broker[]; canCreateMapping: boolean; onMapTicker: (assetId: string, ticker: string) => void; onClose: () => void }) {
  const activeBrokers = brokerOptions.filter((broker) => broker.status === "Active");
  const [mode, setMode] = useState<"resolve" | "map">("resolve");
  const [brokerName, setBrokerName] = useState(activeBrokers[0]?.name ?? "");
  const [ticker, setTicker] = useState("");
  const [assetName, setAssetName] = useState("");
  const [hasResolved, setHasResolved] = useState(false);
  const [mappingError, setMappingError] = useState("");
  const brokerAssets = assetOptions.filter((asset) => asset.broker === brokerName);
  const resolvedAsset = hasResolved ? brokerAssets.find((asset) => asset.ticker === ticker.trim().toUpperCase() && asset.status === "active") : undefined;

  const switchMode = (nextMode: "resolve" | "map") => { setMode(nextMode); setTicker(""); setAssetName(""); setHasResolved(false); setMappingError(""); };
  const createMapping = () => {
    const selectedAsset = brokerAssets.find((asset) => asset.name === assetName);
    if (!selectedAsset || !ticker.trim()) return;
    const normalizedTicker = ticker.trim().toUpperCase();
    const existingTicker = brokerAssets.find((asset) => asset.ticker === normalizedTicker && asset.privateAssetId !== selectedAsset.privateAssetId);
    if (existingTicker) {
      setMappingError(`${normalizedTicker} already resolves to ${existingTicker.name} for this broker.`);
      setHasResolved(false);
      return;
    }
    setMappingError("");
    onMapTicker(selectedAsset.privateAssetId, normalizedTicker);
    setHasResolved(true);
  };

  return (
    <DetailPanel title="Ticker Resolution" subtitle="Find which private asset a broker ticker represents" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 rounded-md border border-slate-800 bg-slate-950/50 p-1">
          <button onClick={() => switchMode("resolve")} className={`h-8 rounded text-xs font-semibold ${mode === "resolve" ? "bg-sky-500 text-white" : "text-slate-400"}`}>Test resolution</button>
          <button onClick={() => canCreateMapping && switchMode("map")} disabled={!canCreateMapping} className={`h-8 rounded text-xs font-semibold ${mode === "map" ? "bg-sky-500 text-white" : "text-slate-400 disabled:cursor-not-allowed disabled:opacity-40"}`}>Create mapping</button>
        </div>
        <div className="rounded-md border border-slate-800 bg-[#0c1117] p-3 text-xs text-slate-400">
          {mode === "resolve" ? "Choose the broker and enter the ticker received with the trade." : "Choose an active asset owned by this broker and assign the ticker it uses."}
        </div>
        <ShellCard className="p-4">
          <div className="space-y-3">
            <FormField label="Broker"><select className={compactInputClass} value={brokerName} onChange={(event) => { setBrokerName(event.target.value); setAssetName(""); setHasResolved(false); setMappingError(""); }}>{activeBrokers.map((item) => <option key={item.patsBrokerProfileId} value={item.name}>{item.name}</option>)}</select></FormField>
            {mode === "map" && <FormField label="Private asset"><select className={compactInputClass} value={assetName} onChange={(event) => setAssetName(event.target.value)}><option value="">Select an asset owned by this broker</option>{brokerAssets.filter((asset) => asset.status === "active").map((asset) => <option key={asset.privateAssetId} value={asset.name}>{asset.name}{asset.ticker ? ` (${asset.ticker})` : " - not mapped"}</option>)}</select></FormField>}
            <FormField label="Ticker"><input className={compactInputClass} value={ticker} onChange={(event) => { setTicker(event.target.value.toUpperCase()); setHasResolved(false); setMappingError(""); }} placeholder="NORTHSTAR-III" maxLength={32} /></FormField>
          </div>
        </ShellCard>
        {mode === "resolve" ? (
          <button onClick={() => setHasResolved(true)} disabled={!brokerName || !ticker.trim()} className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white disabled:opacity-40">Resolve ticker</button>
        ) : (
          <button onClick={createMapping} disabled={!assetName || !ticker.trim()} className="h-9 w-full rounded-md bg-sky-500 text-xs font-semibold text-white disabled:opacity-40">Save ticker mapping</button>
        )}
        {hasResolved && mode === "resolve" && (
          resolvedAsset ? <ShellCard className="border-emerald-400/20 bg-emerald-400/5 p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-emerald-300">Match found</p><h3 className="mt-1 text-base font-semibold text-white">{resolvedAsset.name}</h3></div><StatusBadge value="active" tone="green" /></div><div className="mt-4 grid grid-cols-2 gap-4"><Info label="Ticker" value={resolvedAsset.ticker} /><Info label="Broker" value={resolvedAsset.broker} /><Info label="Asset class" value={resolvedAsset.className} /><Info label="Sponsor" value={resolvedAsset.gpSponsor} /></div></ShellCard>
          : <div className="rounded-md border border-rose-400/20 bg-rose-400/10 p-4"><p className="text-xs font-semibold text-rose-300">No matching asset found</p><p className="mt-1 text-xs text-slate-400">Check the selected broker and ticker, or create a ticker mapping first.</p></div>
        )}
        {hasResolved && mode === "map" && <div className="rounded-md border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs text-emerald-300">Mapping created in mock data. Switch to Test resolution to verify the same broker and ticker.</div>}
        {mappingError && <div className="rounded-md border border-rose-400/20 bg-rose-400/10 p-4 text-xs text-rose-300">{mappingError}</div>}
      </div>
    </DetailPanel>
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

function Workflows({ workflows: localWorkflows, role, onAddWorkflow, onUpdateWorkflow }: { workflows: WorkflowRecord[]; role: AccessRole; onAddWorkflow: (w: WorkflowRecord) => void; onUpdateWorkflow: (id: string, p: Partial<WorkflowRecord>) => void }) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(localWorkflows[0]?.id ?? "");
  const [workflowPanel, setWorkflowPanel] = useState<"template" | "requirement" | null>(null);
  const canManageWorkflows = rolePermissions[role].canManageWorkflows;
  const selectedWorkflow = localWorkflows.find((flow) => flow.id === selectedWorkflowId) ?? localWorkflows[0];
  const selectedAsset = assets.find((asset) => asset.privateAssetId === selectedWorkflow?.privateAssetId);
  const selectedRequirements = (selectedWorkflow?.requirementTypes ?? []).map((type, index) => ({
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
          canManageWorkflows ? (
            <div className="flex gap-2">
              <button onClick={() => setWorkflowPanel("requirement")} className="flex h-9 items-center gap-1.5 rounded-md border border-slate-800 bg-[#11151b] px-3 text-xs font-semibold text-slate-200"><Plus className="h-3.5 w-3.5" />Add Requirement</button>
              <button onClick={() => setWorkflowPanel("template")} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" />Create Template</button>
            </div>
          ) : undefined
        }
      />
      {!canManageWorkflows && <ReadOnlyNotice label="Workflow rules are shown for traceability, but this role cannot create templates or add requirements." />}
      <Toolbar placeholder="Search workflow, broker, private asset, policy, requirement, or status..." />
      <div className="grid grid-cols-[0.95fr_1.4fr] gap-5">
        <ShellCard className="overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-100">Templates by private asset</h2>
            <p className="mt-1 text-[11px] text-slate-500">One active template tells PATS what steps are needed for that broker-owned asset.</p>
          </div>
          <div className="divide-y divide-slate-800/80">
            {localWorkflows.map((flow) => {
              const isSelected = flow.id === selectedWorkflow?.id;
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
      {canManageWorkflows && workflowPanel === "template" && <CreateWorkflowTemplatePanel onAdd={onAddWorkflow} onClose={() => setWorkflowPanel(null)} />}
      {canManageWorkflows && workflowPanel === "requirement" && selectedWorkflow && <AddWorkflowRequirementPanel workflow={selectedWorkflow} onUpdate={(types) => onUpdateWorkflow(selectedWorkflow.id, { requirementTypes: types, requirements: `${types.length} requirement${types.length !== 1 ? "s" : ""}` })} onClose={() => setWorkflowPanel(null)} />}
    </>
  );
}

function CreateWorkflowTemplatePanel({ onAdd, onClose }: { onAdd: (w: WorkflowRecord) => void; onClose: () => void }) {
  const activeBrokers = brokers.filter(b => b.status === "Active");
  const [selectedBroker, setSelectedBroker] = useState(activeBrokers[0]?.name ?? "");
  const [selectedAsset, setSelectedAsset] = useState(assets[0]?.name ?? "");
  const [templateName, setTemplateName] = useState("");
  const [policy, setPolicy] = useState<"once_per_user" | "every_trade">("once_per_user");

  const handleCreate = () => {
    if (!templateName.trim()) return;
    const broker = brokers.find(b => b.name === selectedBroker);
    const asset = assets.find(a => a.name === selectedAsset);
    onAdd({
      id: `wt_${Date.now()}`,
      name: templateName.trim(),
      broker: selectedBroker,
      asset: selectedAsset,
      privateAssetId: asset?.privateAssetId ?? "",
      patsBrokerProfileId: broker?.patsBrokerProfileId ?? "",
      type: "Subscription",
      policy,
      status: "active",
      focus: `Workflow for ${selectedAsset}`,
      requirements: "0 requirements",
      requirementTypes: [],
      updated: "Just now",
    });
    onClose();
  };

  return (
    <DetailPanel title="Create Workflow Template" subtitle="Define the workflow rules for one broker-owned private asset" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Template owner</h3>
          <p className="mt-1 text-xs text-slate-500">A workflow template must belong to one broker and one private asset.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Broker">
              <select className={compactInputClass} value={selectedBroker} onChange={e => setSelectedBroker(e.target.value)}>
                {activeBrokers.map(b => <option key={b.patsBrokerProfileId}>{b.name}</option>)}
              </select>
            </FormField>
            <FormField label="Private asset">
              <select className={compactInputClass} value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)}>
                {assets.map(a => <option key={a.privateAssetId}>{a.name}</option>)}
              </select>
            </FormField>
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Workflow rule</h3>
          <div className="mt-4 space-y-3">
            <FormField label="Template name">
              <input className={compactInputClass} placeholder="Subscription workflow" value={templateName} onChange={e => setTemplateName(e.target.value)} />
            </FormField>
            <FormField label="When should this workflow apply?">
              <select className={compactInputClass} value={policy} onChange={e => setPolicy(e.target.value as "once_per_user" | "every_trade")}>
                <option value="once_per_user">Once per user or account</option>
                <option value="every_trade">Every trade</option>
              </select>
            </FormField>
          </div>
        </ShellCard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={handleCreate} disabled={!templateName.trim()} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white disabled:opacity-40">Create Template</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function AddWorkflowRequirementPanel({ workflow, onUpdate, onClose }: { workflow: WorkflowRecord; onUpdate: (types: string[]) => void; onClose: () => void }) {
  const [reqType, setReqType] = useState("document");
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    const key = title.trim() ? title.trim().toLowerCase().replaceAll(" ", "_") : reqType;
    onUpdate([...workflow.requirementTypes, key]);
    onClose();
  };

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
              <select className={compactInputClass} value={reqType} onChange={e => setReqType(e.target.value)}>
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
              <input className={compactInputClass} value={workflow.requirementTypes.length + 1} readOnly />
            </FormField>
            <div className="col-span-2">
              <FormField label="Title">
                <input className={compactInputClass} placeholder="Subscription agreement" value={title} onChange={e => setTitle(e.target.value)} />
              </FormField>
            </div>
          </div>
        </ShellCard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={handleAdd} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Add Requirement</button>
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
          {tradeDocuments.map((doc) => {
            const docAsset = assets.find((asset) => asset.privateAssetId === doc.privateAssetId);
            const docTrade = trades.find((trade) => trade.inboundTradeId === doc.inboundTradeId);
            return (
              <div key={doc.tradeDocumentId} className="grid grid-cols-[1.15fr_0.65fr_0.85fr_0.85fr_0.75fr_0.75fr] items-center border-t border-slate-800/80 px-5 py-4 text-sm">
                <span>
                  <span className="block font-semibold text-slate-100">{doc.name}</span>
                  <span className="mt-1 block text-[11px] text-slate-500">{docAsset?.name ?? "No asset assigned"}</span>
                </span>
                <span className="text-xs text-sky-300">{docTrade ? `${docTrade.type} ${docTrade.ticker}` : "Trade pending"}</span>
                <span className="text-xs text-slate-300">{displayLabel(doc.platform)}</span>
                <span><StatusBadge value={displayLabel(doc.type)} tone="gray" /></span>
                <span><StatusBadge value={doc.status} /></span>
                <span className="text-xs text-slate-400">{displayLabel(doc.source)}</span>
              </div>
            );
          })}
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

function documentNextAction(doc: TradeDoc) {
  if (doc.actionLabel && doc.actionRequired) return doc.actionLabel;
  if (doc.status === "pending") return doc.platform === "manual_upload" ? "Upload file" : "Send for signature";
  if (doc.status === "uploaded") return "Send for signature";
  if (doc.status === "sent") return "Waiting for signature";
  if (doc.status === "signed") return "Mark complete";
  if (doc.status === "completed") return "No action needed";
  if (doc.status === "blocked") return "Fix: " + (doc.blockedReason ?? "Review issue").slice(0, 32);
  if (doc.status === "cancelled") return "Cancelled";
  return "Review";
}

function documentPrimaryAction(doc: TradeDoc) {
  if (doc.platform === "manual_upload") return "Upload document";
  if (doc.platform === "docusign") return "Open DocuSign";
  if (doc.platform === "icapital") return "Open iCapital";
  if (doc.platform === "umb") return "Open UMB portal";
  return "Open document";
}

function DocumentRoleContext({ viewer, actionCount }: { viewer: DocumentViewer; actionCount: number }) {
  return (
    <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950/35 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-400/20 bg-sky-400/10">
            <Shield className="h-3.5 w-3.5 text-sky-300" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-100">{accessRoleLabels[viewer.role]}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">{accessRoleScopeHints[viewer.role]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge value={`${actionCount} action${actionCount === 1 ? "" : "s"}`} tone={actionCount > 0 ? "yellow" : "green"} />
          <span className="text-[10px] font-semibold text-slate-500">Controlled by navbar role</span>
        </div>
      </div>
    </div>
  );
}

function ClientSignerDocumentsView({ docs, viewer }: { docs: TradeDoc[]; viewer: DocumentViewer }) {
  const pendingDocs = docs.filter((doc) => doc.status !== "completed" && doc.status !== "cancelled");
  const completedDocs = docs.filter((doc) => doc.status === "completed");

  return (
    <div className="grid grid-cols-[1fr_0.72fr] gap-5">
      <ShellCard className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Your document tasks</h2>
            <p className="mt-1 text-xs text-slate-500">Simple signing and upload view. No workflow IDs, broker controls, or ops-only actions.</p>
          </div>
          <StatusBadge value={`${pendingDocs.length} open`} tone={pendingDocs.length ? "yellow" : "green"} />
        </div>
        <div className="mt-5 space-y-3">
          {pendingDocs.map((doc) => {
            const asset = assets.find((a) => a.privateAssetId === doc.privateAssetId);
            return (
              <div key={doc.tradeDocumentId} className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{doc.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{asset?.name ?? "Private asset"} · Due {doc.dueDate ?? "not set"}</p>
                  </div>
                  <StatusBadge value={doc.status} />
                </div>
                <div className="mt-3 rounded-md border border-slate-800 bg-[#0d1117] px-3 py-2 text-xs text-slate-400">
                  {doc.platform === "manual_upload" ? "Upload the requested file so Ops can review it." : "Open the signing link and complete the envelope."}
                </div>
                <button className="mt-4 h-10 w-full rounded-md bg-sky-500 text-sm font-semibold text-white shadow-lg shadow-sky-950/30">
                  {documentPrimaryCta(doc, viewer)}
                </button>
              </div>
            );
          })}
        </div>
        {completedDocs.length > 0 && (
          <div className="mt-5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm font-semibold text-emerald-200">{completedDocs.length} completed document{completedDocs.length === 1 ? "" : "s"}</p>
            <p className="mt-1 text-xs text-emerald-300/70">Completed items stay visible as confirmation, but no action is needed.</p>
          </div>
        )}
      </ShellCard>
      <ShellCard className="p-5">
        <h2 className="text-sm font-semibold text-white">Signing progress</h2>
        <div className="mt-4 space-y-3">
          {[
            ["Review request", true],
            ["Sign or upload", pendingDocs.length === 0],
            ["Ops verifies", docs.some((doc) => doc.status === "signed" || doc.status === "completed")],
            ["Done", pendingDocs.length === 0],
          ].map(([label, done]) => (
            <div key={String(label)} className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2">
              <span className={`h-2.5 w-2.5 rounded-full ${done ? "bg-emerald-400" : "bg-amber-300"}`} />
              <span className="text-xs font-semibold text-slate-200">{label}</span>
            </div>
          ))}
        </div>
      </ShellCard>
    </div>
  );
}

function WealthManagerDocumentsView({ docs }: { docs: TradeDoc[] }) {
  const accountIds = Array.from(new Set(docs.map((doc) => doc.accountId).filter(Boolean)));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Client documents" value={`${docs.length}`} />
        <MetricCard label="Need action" value={`${docs.filter((doc) => doc.actionRequired).length}`} />
        <MetricCard label="Blocked" value={`${docs.filter((doc) => doc.status === "blocked").length}`} />
      </div>
      <div className="grid grid-cols-2 gap-5">
        {accountIds.map((accountId, index) => {
          const accountDocs = docs.filter((doc) => doc.accountId === accountId);
          const open = accountDocs.filter((doc) => doc.status !== "completed" && doc.status !== "cancelled").length;
          return (
            <ShellCard key={accountId} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Account package {index + 1}</p>
                  <p className="mt-1 text-xs text-slate-500">Household follow-up package</p>
                </div>
                <StatusBadge value={open ? `${open} open` : "clear"} tone={open ? "yellow" : "green"} />
              </div>
              <div className="mt-4 space-y-2">
                {accountDocs.slice(0, 3).map((doc) => (
                  <div key={doc.tradeDocumentId} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2">
                    <span className="text-xs font-semibold text-slate-200">{doc.name}</span>
                    <StatusBadge value={doc.status} />
                  </div>
                ))}
              </div>
            </ShellCard>
          );
        })}
      </div>
      <ShellCard className="overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Household document status</h2>
          <p className="mt-1 text-[11px] text-slate-500">Wealth manager view is for follow-up and visibility, not document operations.</p>
        </div>
        {docs.map((doc) => {
          const asset = assets.find((a) => a.privateAssetId === doc.privateAssetId);
          return (
            <div key={doc.tradeDocumentId} className="grid grid-cols-[1fr_0.75fr_0.75fr_0.7fr] border-b border-slate-800/70 px-5 py-4 text-sm last:border-b-0">
              <div>
                <p className="font-semibold text-slate-100">{doc.name}</p>
                <p className="mt-1 text-xs text-slate-500">{asset?.name ?? "Asset pending"} - Account assigned</p>
              </div>
              <span className="text-xs text-slate-300">{actorLabel(doc)}</span>
              <span className="text-xs text-slate-400">{doc.dueDate ?? "-"}</span>
              <StatusBadge value={doc.status} />
            </div>
          );
        })}
      </ShellCard>
    </div>
  );
}

function SponsorDocumentsView({ docs, viewer }: { docs: TradeDoc[]; viewer: DocumentViewer }) {
  return (
    <div className="grid grid-cols-[0.85fr_1.15fr] gap-5">
      <ShellCard className="p-5">
        <h2 className="text-sm font-semibold text-white">Sponsor scope</h2>
        <p className="mt-2 text-xs text-slate-500">This role sees documents tied to the sponsor or fund platform. Client household details stay limited.</p>
        <div className="mt-4 space-y-2">
          {(viewer.assetIds ?? []).map((assetId) => {
            const asset = assets.find((item) => item.privateAssetId === assetId);
            return <Info key={assetId} label="Private asset" value={asset?.name ?? "Asset pending"} />;
          })}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Info label="Review queue" value={`${docs.filter((doc) => doc.actionRequired).length} open`} />
          <Info label="Client data" value="Limited" />
        </div>
      </ShellCard>
      <ShellCard className="overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Sponsor review queue</h2>
          <p className="mt-1 text-[11px] text-slate-500">Focused on fund acceptance, platform package status, and sponsor-side approvals.</p>
        </div>
        {docs.map((doc) => (
          <div key={doc.tradeDocumentId} className="grid grid-cols-[1fr_0.65fr_0.65fr_0.7fr] items-center border-b border-slate-800/70 px-5 py-4 last:border-b-0">
            <div>
              <p className="text-sm font-semibold text-white">{doc.name}</p>
              <p className="mt-1 text-xs text-slate-500">{displayLabel(doc.platform)} · {doc.dueDate ?? "No due date"}</p>
            </div>
            <StatusBadge value={doc.status} />
            <button className="h-8 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">{documentPrimaryCta(doc, viewer)}</button>
          </div>
        ))}
      </ShellCard>
    </div>
  );
}

function BrokerDocumentsView({ docs, viewer, onUpdateDoc, onAddDoc }: { docs: TradeDoc[]; viewer: DocumentViewer; onUpdateDoc: (id: string, p: Partial<TradeDoc>) => void; onAddDoc: () => void }) {
  const broker = brokers.find((item) => viewer.brokerIds?.includes(item.patsBrokerProfileId));
  const ownedAssets = assets.filter((asset) => viewer.brokerIds?.includes(asset.patsBrokerProfileId));
  const actionDocs = docs.filter((doc) => documentCanOperate(doc, viewer) && doc.status !== "completed" && doc.status !== "cancelled");
  const waitingDocs = docs.filter((doc) => !documentCanOperate(doc, viewer) && doc.status !== "completed" && doc.status !== "cancelled");
  const canCreateDocuments = documentCanCreate(viewer);
  const isExternalPlatform = viewer.role === "external_platform";
  const workbenchTitle = isExternalPlatform ? "External platform operations" : broker?.name ?? viewer.label;
  const workbenchDescription = isExternalPlatform
    ? "Limited document operations for platform handoffs and callback status."
    : "Broker workbench for documents this broker owns or must prepare.";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[0.9fr_1.1fr] gap-5">
        <ShellCard className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">{workbenchTitle}</h2>
              <p className="mt-1 text-xs text-slate-500">{workbenchDescription}</p>
            </div>
            <StatusBadge value={broker?.status ?? "active"} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Info label={isExternalPlatform ? "Platform assets" : "Owned assets"} value={`${ownedAssets.length}`} />
            <Info label={isExternalPlatform ? "Platform actions" : "Broker actions"} value={`${actionDocs.length}`} />
            <Info label="Waiting on others" value={`${waitingDocs.length}`} />
            <Info label="Fill return" value={broker?.fillReturn ?? "Not set"} />
          </div>
          {canCreateDocuments ? (
            <button onClick={onAddDoc} className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-sky-500 text-xs font-semibold text-white shadow-lg shadow-sky-950/30">
              <Plus className="h-3.5 w-3.5" /> Add broker document
            </button>
          ) : (
            <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/35 px-3 py-2.5 text-[11px] font-semibold text-slate-500">
              Document creation is hidden for this role
            </div>
          )}
        </ShellCard>

        <ShellCard className="p-5">
          <h2 className="text-base font-semibold text-white">{isExternalPlatform ? "Platform handoff scope" : "Broker-owned assets"}</h2>
          <p className="mt-1 text-xs text-slate-500">{isExternalPlatform ? "The platform only sees document work assigned to its integration." : "The broker only sees documents in its relationship scope."}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {ownedAssets.map((asset) => (
              <div key={asset.privateAssetId} className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{asset.name}</p>
                    <p className="mt-1 text-xs text-sky-300">{asset.ticker}</p>
                  </div>
                  <StatusBadge value={asset.status} />
                </div>
                <p className="mt-3 text-[11px] text-slate-500">{asset.documentExecutionPlatform} documents - {asset.taxDocumentSource} tax source</p>
              </div>
            ))}
            {ownedAssets.length === 0 && <p className="col-span-2 rounded-md border border-slate-800 bg-slate-950/35 p-3 text-xs text-slate-500">No private asset scope is exposed for this role.</p>}
          </div>
        </ShellCard>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-5">
        <ShellCard className="overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-3">
            <h2 className="text-sm font-semibold text-white">{isExternalPlatform ? "Platform action queue" : "Broker action queue"}</h2>
            <p className="mt-1 text-[11px] text-slate-500">{isExternalPlatform ? "Operate only the documents assigned to the external platform integration." : "Prepare envelopes, upload broker files, and send packages owned by this broker."}</p>
          </div>
          <div className="divide-y divide-slate-800/70">
            {actionDocs.map((doc) => {
              const asset = assets.find((item) => item.privateAssetId === doc.privateAssetId);
              return (
                <div key={doc.tradeDocumentId} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{doc.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{asset?.name ?? "Private asset"} - due {doc.dueDate ?? "not set"}</p>
                    </div>
                    <StatusBadge value={doc.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="h-8 rounded-md bg-sky-500 text-xs font-semibold text-white">{documentPrimaryCta(doc, viewer)}</button>
                    <button
                      onClick={() => onUpdateDoc(doc.tradeDocumentId, { status: "sent", sentAt: new Date().toISOString(), actionLabel: "Waiting for signature", actionRequired: false })}
                      className="h-8 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200"
                    >
                      Mark sent
                    </button>
                  </div>
                </div>
              );
            })}
            {actionDocs.length === 0 && <p className="p-5 text-xs text-slate-500">{isExternalPlatform ? "No platform document actions right now." : "No broker-owned document actions right now."}</p>}
          </div>
        </ShellCard>

        <ShellCard className="overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Waiting on client or Ops</h2>
            <p className="mt-1 text-[11px] text-slate-500">Visible to the broker, but not directly controlled by the broker.</p>
          </div>
          <div className="divide-y divide-slate-800/70">
            {waitingDocs.map((doc) => {
              const asset = assets.find((item) => item.privateAssetId === doc.privateAssetId);
              return (
                <div key={doc.tradeDocumentId} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{doc.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{asset?.name ?? "Private asset"} - responsible: {actorLabel(doc)}</p>
                  </div>
                  <StatusBadge value={doc.status} />
                </div>
              );
            })}
            {waitingDocs.length === 0 && <p className="p-5 text-xs text-slate-500">Nothing is waiting on another party.</p>}
          </div>
        </ShellCard>
      </div>
    </div>
  );
}

function Documents({
  docs,
  activeRole,
  onAddDoc,
  onUpdateDoc,
}: {
  docs: TradeDoc[];
  activeRole: AccessRole;
  onAddDoc: (d: TradeDoc) => void;
  onUpdateDoc: (id: string, p: Partial<TradeDoc>) => void;
}) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(docs[0]?.tradeDocumentId ?? "");
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [blockInput, setBlockInput] = useState("");
  const [showBlockInput, setShowBlockInput] = useState(false);
  const viewer = documentViewers.find((v) => v.role === activeRole) ?? documentViewers[0];
  const visibleDocs = docs.filter((doc) => documentVisibleToViewer(doc, viewer));
  const actionRequiredCount = visibleDocs.filter((doc) => doc.actionRequired && doc.status !== "completed" && doc.status !== "cancelled").length;
  const selectedDocument = visibleDocs.find((doc) => doc.tradeDocumentId === selectedDocumentId) ?? visibleDocs[0];
  const relatedTrade = trades.find((trade) => trade.inboundTradeId === selectedDocument?.inboundTradeId);
  const relatedAsset = assets.find((a) => a.privateAssetId === selectedDocument?.privateAssetId);
  const relatedBroker = brokers.find((b) => b.patsBrokerProfileId === selectedDocument?.patsBrokerProfileId);
  const canCreateDocuments = documentCanCreate(viewer);
  const canOperateSelected = selectedDocument ? documentCanOperate(selectedDocument, viewer) : false;
  const canActAsSigner = selectedDocument ? documentCanSignerAct(selectedDocument, viewer) : false;

  if (!selectedDocument) return (
    <>
      <PageTitle title="Documents" subtitle="Trade documents and signatures required by workflow steps before a trade can continue"
        action={canCreateDocuments ? <button onClick={() => setAddDocOpen(true)} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white shadow-lg shadow-sky-950/30"><Plus className="h-3.5 w-3.5" />Add Document</button> : undefined}
      />
      <DocumentRoleContext viewer={viewer} actionCount={0} />
      <p className="mt-8 text-center text-xs text-slate-500">No documents are visible for this role.</p>
      {addDocOpen && canCreateDocuments && <AddDocumentPanel viewer={viewer} onAdd={onAddDoc} onClose={() => setAddDocOpen(false)} />}
    </>
  );

  const documentFlow = [
    ["Required", "Workflow step added this document — Ops must fulfill it before the trade can continue"],
    ["Uploaded / Prepared", selectedDocument.platform === "manual_upload" ? "Ops uploads the file via the document API" : `${displayLabel(selectedDocument.platform)} envelope or task is created`],
    ["Signed / Confirmed", "Investor, broker, or external platform completes the document"],
    ["Completed", "The related TradeWorkflowStep can now be marked complete"],
  ];
  const activeStep =
    selectedDocument.status === "completed" ? 4 :
    selectedDocument.status === "signed" ? 3 :
    (selectedDocument.status === "sent" || selectedDocument.status === "uploaded") ? 2 : 1;

  const roleContext = <DocumentRoleContext viewer={viewer} actionCount={actionRequiredCount} />;

  if (viewer.role === "client_signer") {
    return (
      <>
        <PageTitle title="Documents" subtitle="Documents assigned to you for signature or upload" />
        {roleContext}
        <ClientSignerDocumentsView docs={visibleDocs} viewer={viewer} />
      </>
    );
  }

  if (viewer.role === "wealth_manager") {
    return (
      <>
        <PageTitle title="Documents" subtitle="Client document status across your households and accounts" />
        {roleContext}
        <WealthManagerDocumentsView docs={visibleDocs} />
      </>
    );
  }

  if (viewer.role === "asset_sponsor") {
    return (
      <>
        <PageTitle title="Documents" subtitle="Sponsor and platform review for private asset documents" />
        {roleContext}
        <SponsorDocumentsView docs={visibleDocs} viewer={viewer} />
      </>
    );
  }

  if (viewer.role === "external_platform") {
    return (
      <>
        <PageTitle title="Documents" subtitle="Limited platform document operations and callback status" />
        {roleContext}
        <BrokerDocumentsView docs={visibleDocs} viewer={viewer} onUpdateDoc={onUpdateDoc} onAddDoc={() => setAddDocOpen(true)} />
      </>
    );
  }

  if (viewer.role === "broker") {
    return (
      <>
        <PageTitle
          title="Broker Documents"
          subtitle="Broker-owned document workbench for private asset workflows"
        />
        <Toolbar placeholder="Search broker documents, asset, signer, platform, or status..." />
        {roleContext}
        <BrokerDocumentsView docs={visibleDocs} viewer={viewer} onUpdateDoc={onUpdateDoc} onAddDoc={() => setAddDocOpen(true)} />
        {addDocOpen && canCreateDocuments && <AddDocumentPanel viewer={viewer} onAdd={onAddDoc} onClose={() => setAddDocOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <PageTitle
        title="Documents"
        subtitle="Full operations queue for trade documents and signatures"
        action={
          canCreateDocuments ? (
          <button onClick={() => setAddDocOpen(true)} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white shadow-lg shadow-sky-950/30">
            <Plus className="h-3.5 w-3.5" />Add Document
          </button>
          ) : undefined
        }
      />
      <Toolbar placeholder="Search by document name, inbound trade ID, platform, type, or status..." />
      {roleContext}
      <div className="grid grid-cols-[1.25fr_0.95fr] gap-5">
        <ShellCard className="overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-100">Document queue</h2>
            <p className="mt-1 text-[11px] text-slate-500">Each item is tied to a TradeWorkflowStep. Completing it unblocks the workflow.</p>
          </div>
          <div className="grid grid-cols-[1.2fr_0.75fr_0.8fr_0.7fr_0.7fr_0.95fr] border-b border-slate-800 bg-slate-950/40 px-5 py-2 text-[8px] font-semibold text-slate-600">
            <span>Document</span>
            <span>Type</span>
            <span>Responsible</span>
            <span>Due</span>
            <span>Status</span>
            <span>Next action</span>
          </div>
          <div className="divide-y divide-slate-800/80">
            {visibleDocs.map((doc) => {
              const isSelected = doc.tradeDocumentId === selectedDocument.tradeDocumentId;
              const docAsset = assets.find((a) => a.privateAssetId === doc.privateAssetId);
              const docTrade = trades.find((trade) => trade.inboundTradeId === doc.inboundTradeId);
              return (
                <button
                  key={doc.tradeDocumentId}
                  onClick={() => { setSelectedDocumentId(doc.tradeDocumentId); setShowBlockInput(false); }}
                  className={`grid w-full grid-cols-[1.2fr_0.75fr_0.8fr_0.7fr_0.7fr_0.95fr] items-center px-5 py-4 text-left text-sm transition ${isSelected ? "bg-sky-400/10" : "hover:bg-slate-900/65"}`}
                >
                  <span>
                    <span className="block font-semibold text-slate-100">{doc.name}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{docAsset?.name ?? "No asset assigned"}{docTrade ? ` - ${docTrade.type} ${docTrade.ticker}` : ""}</span>
                  </span>
                  <span><StatusBadge value={displayLabel(doc.type)} tone="gray" /></span>
                  <span className="text-xs text-slate-300">{actorLabel(doc)}</span>
                  <span className="text-xs text-slate-400">{doc.dueDate ?? "-"}</span>
                  <span><StatusBadge value={doc.status} /></span>
                  <span className={`text-xs font-semibold ${doc.actionRequired ? "text-amber-200" : "text-sky-300"}`}>{documentPrimaryCta(doc, viewer)}</span>
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
                <p className="mt-1 text-xs text-slate-500">{relatedAsset?.name ?? "No asset"} - {relatedBroker?.name ?? "No broker"}</p>
              </div>
              <StatusBadge value={selectedDocument.status} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Info label="Type" value={displayLabel(selectedDocument.type)} />
              <Info label="Platform" value={displayLabel(selectedDocument.platform)} />
              <Info label="Source" value={displayLabel(selectedDocument.source)} />
              <Info label="Responsible" value={actorLabel(selectedDocument)} />
              <Info label="Required actor" value={displayLabel(selectedDocument.requiredActorType ?? "not assigned")} />
              <Info label="Due date" value={selectedDocument.dueDate ?? "Not set"} />
              <Info label="Action required" value={selectedDocument.actionRequired ? "Yes" : "No"} />
              <Info label="Trade" value={relatedTrade ? `${relatedTrade.type} ${relatedTrade.ticker}` : "Trade pending"} />
              {selectedDocument.accountId && <Info label="Account" value="Assigned" />}
              {selectedDocument.signerPersonId && <Info label="Signer" value={personDisplayName(householdPersons.find((p) => p.personId === selectedDocument.signerPersonId) ?? householdPersons[0])} />}
              {selectedDocument.tradeWorkflowId && <Info label="Workflow" value="Started" />}
              {selectedDocument.externalEnvelopeId && <Info label="Envelope" value="Available" />}
              {selectedDocument.sentAt && <Info label="Sent at" value={new Date(selectedDocument.sentAt).toLocaleString()} />}
              {selectedDocument.signedAt && <Info label="Signed at" value={new Date(selectedDocument.signedAt).toLocaleString()} />}
              {selectedDocument.completedAt && <Info label="Completed at" value={new Date(selectedDocument.completedAt).toLocaleString()} />}
              {selectedDocument.fileKey && <Info label="File" value={selectedDocument.fileKey} />}
            </div>
            {selectedDocument.status === "blocked" && selectedDocument.blockedReason && (
              <div className="mt-4 rounded-md border border-rose-400/25 bg-rose-400/10 p-3 text-xs font-semibold text-rose-300">
                Blocked: {selectedDocument.blockedReason}
              </div>
            )}
            {relatedTrade && (
              <div className="mt-3 rounded-md border border-slate-800 bg-[#101318] p-3 text-xs text-slate-400">
                Related trade: {relatedTrade.ticker} · {relatedTrade.broker} · <StatusBadge value={relatedTrade.status} />
              </div>
            )}
          </ShellCard>

          <ShellCard className="p-5">
            <h2 className="text-sm font-semibold text-white">Document lifecycle</h2>
            <div className="mt-4 space-y-2.5">
              {documentFlow.map(([title, description], index) => {
                const isDone = index + 1 <= activeStep && selectedDocument.status !== "blocked" && selectedDocument.status !== "cancelled";
                const isBlocked = selectedDocument.status === "blocked" && index === 1;
                const isCancelled = selectedDocument.status === "cancelled";
                return (
                  <div key={title} className={`grid grid-cols-[24px_1fr] gap-3 rounded-md border p-3 ${isBlocked ? "border-rose-400/25 bg-rose-400/10" : isCancelled ? "border-slate-700 bg-slate-900/40" : isDone ? "border-emerald-400/20 bg-emerald-400/10" : "border-slate-800 bg-slate-950/35"}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${isBlocked ? "border-rose-400/30 bg-rose-400/10 text-rose-300" : isCancelled ? "border-slate-600 bg-slate-800 text-slate-500" : isDone ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-slate-700 bg-slate-900 text-slate-500"}`}>{index + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ShellCard>

          <ShellCard className="p-5">
            <h2 className="text-sm font-semibold text-white">Actions</h2>
            <p className="mt-1 text-xs text-slate-500">
              {canOperateSelected
                ? "Operational actions are available for this role."
                : canActAsSigner
                  ? "This signer only sees the action needed to move the document forward."
                  : "This role can monitor status, but operational controls are hidden."}
            </p>
            {showBlockInput && canOperateSelected && (
              <div className="mt-3 flex gap-2">
                <input
                  className="h-9 flex-1 rounded-md border border-rose-400/30 bg-rose-400/5 px-3 text-xs text-rose-200 outline-none placeholder:text-rose-400/40"
                  placeholder="Reason for blocking..."
                  value={blockInput}
                  onChange={e => setBlockInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && blockInput.trim()) { onUpdateDoc(selectedDocument.tradeDocumentId, { status: "blocked", blockedReason: blockInput.trim() }); setShowBlockInput(false); setBlockInput(""); } }}
                  autoFocus
                />
                <button onClick={() => setShowBlockInput(false)} className="h-9 rounded-md border border-slate-800 bg-slate-900 px-3 text-xs text-slate-400">Cancel</button>
                <button onClick={() => { if (blockInput.trim()) { onUpdateDoc(selectedDocument.tradeDocumentId, { status: "blocked", blockedReason: blockInput.trim() }); setShowBlockInput(false); setBlockInput(""); } }} className="h-9 rounded-md border border-rose-400/50 bg-rose-400/20 px-3 text-xs font-semibold text-rose-300">Confirm</button>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button
                className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                onClick={() => alert(`${documentPrimaryCta(selectedDocument, viewer)} for ${selectedDocument.name}`)}
              >{documentPrimaryCta(selectedDocument, viewer)}</button>
              {canOperateSelected && (
                <>
                  <button
                    disabled={selectedDocument.status === "completed" || selectedDocument.status === "cancelled"}
                    onClick={() => onUpdateDoc(selectedDocument.tradeDocumentId, { status: "completed", completedAt: new Date().toISOString(), actionRequired: false })}
                    className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white shadow-lg shadow-sky-950/30 disabled:opacity-40"
                  >Complete document</button>
                  <button
                    disabled={selectedDocument.status === "completed" || selectedDocument.status === "cancelled"}
                    onClick={() => setShowBlockInput(v => !v)}
                    className={`h-9 rounded-md border text-xs font-semibold disabled:opacity-40 ${showBlockInput ? "border-rose-400/50 bg-rose-400/20 text-rose-300" : "border-rose-400/30 bg-rose-400/10 text-rose-300"}`}
                  >{showBlockInput ? "Cancel block" : "Block with reason"}</button>
                  <button
                    disabled={selectedDocument.status === "completed" || selectedDocument.status === "cancelled"}
                    onClick={() => { onUpdateDoc(selectedDocument.tradeDocumentId, { status: "cancelled", actionRequired: false }); setShowBlockInput(false); }}
                    className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-400 disabled:opacity-40"
                  >Cancel document</button>
                </>
              )}
            </div>
          </ShellCard>
        </div>
      </div>
      {addDocOpen && canCreateDocuments && <AddDocumentPanel viewer={viewer} onAdd={onAddDoc} onClose={() => setAddDocOpen(false)} />}
    </>
  );
}

function AddDocumentPanel({ viewer, onAdd, onClose }: { viewer: DocumentViewer; onAdd: (d: TradeDoc) => void; onClose: () => void }) {
  const [selectedTradeId, setSelectedTradeId] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("manual_upload");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState<TradeDoc["type"]>("subscription_agreement");
  const [selectedStepId, setSelectedStepId] = useState("");
  const [selectedReqId, setSelectedReqId] = useState("");
  const [docSource, setDocSource] = useState<TradeDoc["source"]>("ops");
  const [requiredActorType, setRequiredActorType] = useState<NonNullable<TradeDoc["requiredActorType"]>>(viewer.role === "broker" ? "broker" : "client_signer");
  const [assignee, setAssignee] = useState(viewer.role === "broker" ? viewer.label : "");
  const [dueDate, setDueDate] = useState("");
  const stepsForTrade = selectedTradeId
    ? workflowSteps.filter((s) => s.inboundTradeId === selectedTradeId)
    : workflowSteps;
  const selectedTrade = trades.find((t) => t.inboundTradeId === selectedTradeId);

  const handleCreate = () => {
    if (!docName.trim() || !selectedTradeId) return;
    const step = stepsForTrade.find(s => s.tradeWorkflowStepId === selectedStepId) ?? stepsForTrade[0];
    const req = workflowRequirements.find(r => r.workflowRequirementId === selectedReqId) ?? workflowRequirements[0];
    onAdd({
      tradeDocumentId: nextMockId("tdoc"),
      inboundTradeId: selectedTradeId,
      tradeWorkflowStepId: step?.tradeWorkflowStepId ?? "tws_doc_001",
      workflowRequirementId: req?.workflowRequirementId ?? "wr_subscription_agreement",
      name: docName.trim(),
      type: docType,
      platform: selectedPlatform as TradeDoc["platform"],
      source: docSource,
      status: "pending",
      requiredActorType,
      requiredActorId: requiredActorType === "broker" ? viewer.brokerIds?.[0] : requiredActorType === "client_signer" ? "per_001" : viewer.contactId,
      signerPersonId: requiredActorType === "client_signer" ? "per_001" : undefined,
      visibleToRoles: ["pats_ops", "broker", "wealth_manager", requiredActorType === "client_signer" ? "client_signer" : "asset_sponsor"],
      actionRequired: true,
      actionLabel: requiredActorType === "client_signer" ? "Sign document" : requiredActorType === "broker" ? "Prepare document" : "Review document",
      assignee: assignee.trim() || displayLabel(requiredActorType),
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <DetailPanel title="Add Document" subtitle="Register a new document requirement for a workflow step" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Workflow context</h3>
          <p className="mt-1 text-xs text-slate-500">Links this document to an inbound trade and a specific workflow step.</p>
          <div className="mt-4 space-y-3">
            <FormField label="Inbound trade">
              <select className={compactInputClass} value={selectedTradeId} onChange={(e) => setSelectedTradeId(e.target.value)}>
                <option value="">— Select inbound trade —</option>
                {trades.map((t) => (
                  <option key={t.inboundTradeId} value={t.inboundTradeId}>
                    {t.ticker} · {t.broker} · {t.type}
                  </option>
                ))}
              </select>
            </FormField>
            {selectedTrade && (
              <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-[11px] text-slate-500">
                {selectedTrade.ticker} · {selectedTrade.asset} · {selectedTrade.type} · <StatusBadge value={selectedTrade.status} />
              </div>
            )}
            <FormField label="Workflow step">
              <select className={compactInputClass} value={selectedStepId} onChange={e => setSelectedStepId(e.target.value)} disabled={stepsForTrade.length === 0}>
                <option value="">— Select step —</option>
                {stepsForTrade.map((s) => (
                  <option key={s.tradeWorkflowStepId} value={s.tradeWorkflowStepId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Workflow requirement">
              <select className={compactInputClass} value={selectedReqId} onChange={e => setSelectedReqId(e.target.value)}>
                <option value="">— Select requirement —</option>
                {workflowRequirements.map((r) => (
                  <option key={r.workflowRequirementId} value={r.workflowRequirementId}>
                    {r.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Document identity</h3>
          <div className="mt-4 space-y-3">
            <FormField label="Document name">
              <input className={compactInputClass} placeholder="Subscription Agreement" value={docName} onChange={e => setDocName(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Type">
                <select className={compactInputClass} value={docType} onChange={e => setDocType(e.target.value as TradeDoc["type"])}>
                  <option value="subscription_agreement">Subscription agreement</option>
                  <option value="signature_packet">Signature packet</option>
                  <option value="tax_document">Tax document</option>
                  <option value="redemption_notice">Redemption notice</option>
                  <option value="supporting_document">Supporting document</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
              <FormField label="Platform">
                <select className={compactInputClass} value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                  <option value="manual_upload">Manual upload</option>
                  <option value="docusign">DocuSign</option>
                  <option value="icapital">iCapital</option>
                  <option value="umb">UMB</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
              {selectedPlatform === "manual_upload" && (
                <div className="col-span-2">
                  <label
                    className={`relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${dragOver ? "border-sky-400 bg-sky-400/10" : uploadedFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-700 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-900/60"}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setUploadedFile(f); }}
                  >
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg" onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); }} />
                    {uploadedFile ? (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                          <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-xs font-semibold text-emerald-400">{uploadedFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(uploadedFile.size / 1024).toFixed(0)} KB · click to replace</p>
                      </>
                    ) : (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                        <p className="text-xs font-semibold text-slate-300">Drag and drop or <span className="text-sky-400">browse</span></p>
                        <p className="text-[10px] text-slate-500">PDF, DOC, DOCX, PNG, JPG</p>
                      </>
                    )}
                  </label>
                </div>
              )}
              <FormField label="Source">
                <select className={compactInputClass} value={docSource} onChange={e => setDocSource(e.target.value as TradeDoc["source"])}>
                  <option value="ops">Ops</option>
                  <option value="broker">Broker</option>
                  <option value="external_platform">External platform</option>
                  <option value="system">System</option>
                </select>
              </FormField>
              <FormField label="Required actor">
                <select className={compactInputClass} value={requiredActorType} onChange={e => setRequiredActorType(e.target.value as NonNullable<TradeDoc["requiredActorType"]>)}>
                  <option value="client_signer">Client signer</option>
                  <option value="broker">Broker</option>
                  <option value="pats_ops">PATS Ops</option>
                  <option value="asset_sponsor">Asset sponsor</option>
                  <option value="external_platform">External platform</option>
                </select>
              </FormField>
              <FormField label="Assignee">
                <input className={compactInputClass} placeholder="Sarah Chen, PATS Ops, Broker desk..." value={assignee} onChange={e => setAssignee(e.target.value)} />
              </FormField>
              <FormField label="Due date">
                <input className={compactInputClass} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </FormField>
            </div>
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Optional context</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <FormField label="Broker">
              <select className={compactInputClass}>
                <option value="">— None —</option>
                {brokers.map((b) => (
                  <option key={b.patsBrokerProfileId} value={b.patsBrokerProfileId}>{b.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Private asset">
              <select className={compactInputClass}>
                <option value="">— None —</option>
                {assets.map((a) => (
                  <option key={a.privateAssetId} value={a.privateAssetId}>{a.name}</option>
                ))}
              </select>
            </FormField>
          </div>
        </ShellCard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={handleCreate} disabled={!docName.trim() || !selectedTradeId} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white disabled:opacity-40">Create Document</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function Execution({ role }: { role: AccessRole }) {
  const [flows, setFlows] = useState<ExecutionFlowRecord[]>(executionFlows);
  const [fillPanelFlow, setFillPanelFlow] = useState<ExecutionFlowRecord | null>(null);
  const [failedFill, setFailedFill] = useState<{ flowId: string; fillId: string } | null>(null);
  const canOperateExecution = rolePermissions[role].canOperateExecution;

  const updateFlow = (tradeId: string, updater: (flow: ExecutionFlowRecord) => ExecutionFlowRecord) => {
    setFlows(current => current.map(flow => flow.tradeId === tradeId ? updater(flow) : flow));
  };

  const createExecution = (flow: ExecutionFlowRecord) => {
    updateFlow(flow.tradeId, current => ({
      ...current,
      executionId: nextMockId("ex"),
      executionStatus: "pending",
      routeMethod: "manual",
      externalExecutionId: nextMockId("route"),
      currentStep: Math.max(current.currentStep, 4),
      blockedStep: null,
      lastUpdate: "Just now",
    }));
  };

  const addFill = (tradeId: string, fill: ExecutionFill) => {
    updateFlow(tradeId, current => ({
      ...current,
      executionStatus: "executed",
      fills: [...current.fills, fill],
      currentStep: Math.max(current.currentStep, 4),
      blockedStep: null,
      lastUpdate: "Just now",
    }));
  };

  const updateFill = (tradeId: string, fillId: string, updater: (fill: ExecutionFill) => ExecutionFill) => {
    updateFlow(tradeId, current => {
      const fills = current.fills.map(fill => fill.fillId === fillId ? updater(fill) : fill);
      const allReturned = fills.length > 0 && fills.every(fill => fill.returnStatus === "returned");
      const hasReturnFailure = fills.some(fill => fill.returnStatus === "return_failed");
      return {
        ...current,
        fills,
        currentStep: allReturned ? 6 : Math.max(current.currentStep, 5),
        blockedStep: hasReturnFailure ? 5 : null,
        lastUpdate: "Just now",
      };
    });
  };

  return (
    <>
      <PageTitle title="Execution Flow" subtitle="Validated trades, execution records, fills, and return status back to Vantage" />
      {!canOperateExecution && <ReadOnlyNotice label="Execution status, fills, and return state are visible, but this role cannot create executions, add fills, confirm fills, or mark returns." />}
      <div className="space-y-4">
        {flows.map((flow) => (
          <ShellCard key={flow.tradeId} className="p-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{flow.ticker}</span>
                  <StatusBadge value={flow.executionStatus} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{flow.asset} · {flow.broker}</p>
              </div>
              <div className="grid grid-cols-4 gap-5 text-right">
                <Info label="Execution" value={displayLabel(flow.executionStatus)} />
                <Info label="Fill" value={executionFillSummary(flow)} />
                <Info label="Return" value={executionReturnSummary(flow)} />
                <Info label="Updated" value={flow.lastUpdate} />
              </div>
            </div>

            <div className="mt-5">
              <div className="grid grid-cols-6 gap-2">
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

            <div className="mt-5 grid grid-cols-[0.9fr_1.25fr_1fr] gap-3">
              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white">Execution</h3>
                  <Route className="h-3.5 w-3.5 text-sky-300" />
                </div>
                <div className="mt-3 space-y-2">
                  <Info label="Execution" value={flow.executionId ? "Created" : "Not created"} />
                  <Info label="Route method" value={flow.routeMethod ? displayLabel(flow.routeMethod) : "Waiting"} />
                  <Info label="Vantage return" value={flow.externalExecutionId ? "Linked" : "Not linked"} />
                  <Info label="Action" value={executionPrimaryAction(flow)} />
                </div>
                {canOperateExecution && !flow.executionId && (
                  <button onClick={() => createExecution(flow)} className="mt-4 h-8 w-full rounded-md bg-sky-500 text-xs font-semibold text-white">
                    Create Execution
                  </button>
                )}
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white">Fills</h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={executionFillSummary(flow)} tone={flow.fills.length ? undefined : "gray"} />
                    {canOperateExecution && flow.executionId && (
                      <button onClick={() => setFillPanelFlow(flow)} className="rounded-md border border-sky-400/30 px-2 py-1 text-[11px] font-semibold text-sky-300 hover:bg-sky-400/10">
                        {flow.fills.length ? "Add Fill" : "Create Fill"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {flow.fills.length === 0 ? (
                    <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-500">
                      No fill has been created yet. After execution, Ops can register quantity, price, gross amount, and filled time.
                    </div>
                  ) : flow.fills.map((fill) => (
                    <div key={fill.fillId} className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-100">Fill recorded</p>
                          <p className="mt-1 text-[11px] text-slate-500">{fill.quantity} @ {fill.price} - {fill.filledAt}</p>
                        </div>
                        <StatusBadge value={fill.status} />
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <Info label="Gross" value={fill.grossAmount} />
                        <Info label="Net" value={fill.netAmount ?? "-"} />
                        <Info label="Return" value={displayLabel(fill.returnStatus)} />
                      </div>
                      {canOperateExecution && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {fill.status === "pending" && (
                            <button
                              onClick={() => updateFill(flow.tradeId, fill.fillId, current => ({ ...current, status: "confirmed", returnStatus: "ready_to_return" }))}
                              className="h-7 rounded-md bg-emerald-500 px-3 text-[11px] font-semibold text-white"
                            >
                              Confirm Fill
                            </button>
                          )}
                          {fill.status === "confirmed" && fill.returnStatus === "ready_to_return" && (
                            <>
                              <button
                                onClick={() => updateFill(flow.tradeId, fill.fillId, current => ({ ...current, returnStatus: "returned", returnedAt: "Just now" }))}
                                className="h-7 rounded-md bg-sky-500 px-3 text-[11px] font-semibold text-white"
                              >
                                Mark Returned
                              </button>
                              <button
                                onClick={() => updateFill(flow.tradeId, fill.fillId, current => ({ ...current, returnStatus: "manual_return_required" }))}
                                className="h-7 rounded-md border border-amber-400/30 px-3 text-[11px] font-semibold text-amber-300"
                              >
                                Manual Return
                              </button>
                              <button
                                onClick={() => setFailedFill({ flowId: flow.tradeId, fillId: fill.fillId })}
                                className="h-7 rounded-md border border-rose-400/30 px-3 text-[11px] font-semibold text-rose-300"
                              >
                                Return Failed
                              </button>
                            </>
                          )}
                          {fill.status === "confirmed" && fill.returnStatus === "manual_return_required" && (
                            <button
                              onClick={() => updateFill(flow.tradeId, fill.fillId, current => ({ ...current, returnStatus: "returned", returnedAt: "Just now" }))}
                              className="h-7 rounded-md bg-sky-500 px-3 text-[11px] font-semibold text-white"
                            >
                              Mark Manual Returned
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white">Return control</h3>
                  <Send className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <div className="mt-3 space-y-2">
                  <Info label="Destination" value={flow.destination} />
                  <Info label="Broker rule" value={brokers.find(item => item.name === flow.broker)?.fillReturn ?? "Manual confirmation"} />
                  <Info label="Return status" value={executionReturnSummary(flow)} />
                  {flow.fills.some(fill => fill.returnFailureReason) && (
                    <div className="rounded-md border border-rose-400/20 bg-rose-400/10 p-2 text-[11px] text-rose-200">
                      {flow.fills.find(fill => fill.returnFailureReason)?.returnFailureReason}
                    </div>
                  )}
                </div>
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
      {canOperateExecution && fillPanelFlow && (
        <ExecutionFillPanel
          flow={fillPanelFlow}
          onClose={() => setFillPanelFlow(null)}
          onAdd={(fill) => {
            addFill(fillPanelFlow.tradeId, fill);
            setFillPanelFlow(null);
          }}
        />
      )}
      {canOperateExecution && failedFill && (
        <ReturnFailedPanel
          onClose={() => setFailedFill(null)}
          onSave={(reason) => {
            updateFill(failedFill.flowId, failedFill.fillId, current => ({
              ...current,
              returnStatus: "return_failed",
              returnFailureReason: reason,
            }));
            setFailedFill(null);
          }}
        />
      )}
    </>
  );
}

function ExecutionFillPanel({ flow, onAdd, onClose }: { flow: ExecutionFlowRecord; onAdd: (fill: ExecutionFill) => void; onClose: () => void }) {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [netAmount, setNetAmount] = useState("");
  const [filledAt, setFilledAt] = useState(new Date().toISOString().slice(0, 16));

  const canCreate = quantity.trim() && price.trim() && grossAmount.trim() && filledAt.trim();
  const handleCreate = () => {
    if (!canCreate || !flow.executionId) return;
    onAdd({
      fillId: nextMockId("fill"),
      executionId: flow.executionId,
      quantity,
      price,
      grossAmount,
      netAmount: netAmount.trim() || undefined,
      filledAt: new Date(filledAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
      status: "pending",
      returnStatus: "not_ready",
    });
  };

  return (
    <DetailPanel title="Create Execution Fill" subtitle={`${flow.ticker} - ${flow.asset}`} onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Execution context</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Info label="Execution" value={flow.executionId ? "Created" : "Not created"} />
            <Info label="Trade" value={`${flow.side} ${flow.ticker}`} />
            <Info label="Broker" value={flow.broker} />
            <Info label="Private asset" value={flow.asset} />
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Fill details</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Quantity">
              <input className={compactInputClass} value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="10000" />
            </FormField>
            <FormField label="Price">
              <input className={compactInputClass} value={price} onChange={e => setPrice(e.target.value)} placeholder="45.20" />
            </FormField>
            <FormField label="Gross amount">
              <input className={compactInputClass} value={grossAmount} onChange={e => setGrossAmount(e.target.value)} placeholder="452000" />
            </FormField>
            <FormField label="Net amount optional">
              <input className={compactInputClass} value={netAmount} onChange={e => setNetAmount(e.target.value)} placeholder="451500" />
            </FormField>
            <div className="col-span-2">
              <FormField label="Filled at">
                <input className={compactInputClass} type="datetime-local" value={filledAt} onChange={e => setFilledAt(e.target.value)} />
              </FormField>
            </div>
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Backend action</h3>
          <p className="mt-2 text-xs text-slate-500">This mock represents POST /executions/{`{executionId}`}/fills. The fill starts as pending and returnStatus starts as not_ready.</p>
        </ShellCard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={handleCreate} disabled={!canCreate} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white disabled:opacity-40">Create Fill</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function ReturnFailedPanel({ onSave, onClose }: { onSave: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");

  return (
    <DetailPanel title="Mark Return Failed" subtitle="Capture why the fill could not be returned to Vantage" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <FormField label="Failure reason">
            <textarea
              className="min-h-28 w-full rounded-md border border-slate-800 bg-[#11151b] px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-500/60"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Vantage return endpoint unavailable"
            />
          </FormField>
        </ShellCard>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={() => onSave(reason)} disabled={!reason.trim()} className="h-9 rounded-md bg-rose-500 text-xs font-semibold text-white disabled:opacity-40">Save Failure</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function Integrations({ role }: { role: AccessRole }) {
  const canManageIntegrations = rolePermissions[role].canManageIntegrations;
  const rows = [
    ["Vantage Blotter API", "Inbound trades and outbound fill return", "1,245", "99.9%", "42ms", "2 minutes ago"],
    ["Private Broker API", "Broker routing, confirmations, and fill intake", "3,882", "99.7%", "18ms", "1 minute ago"],
    ["Document Platforms", "DocuSign, iCapital, and manual document steps", "941", "99.5%", "62ms", "5 minutes ago"],
    ["Fill Return Webhook", "Normalized fill delivery back to Vantage", "728", "99.4%", "58ms", "3 minutes ago"],
  ];
  return (
    <>
      <PageTitle title="Integrations" subtitle="Manage Vantage, broker, document, and fill-return connections" />
      {!canManageIntegrations && <ReadOnlyNotice label="Integration health is visible, but credentials, routing configuration, and connection settings are hidden for this role." />}
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
              <div className="flex items-center gap-4">
                <StatusBadge value="Connected" />
                {canManageIntegrations ? <Settings className="h-4 w-4 text-slate-500" /> : <StatusBadge value="View only" tone="gray" />}
              </div>
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

function accessStatusTone(status: AccessStatus): StatusTone {
  if (status === "active") return "green";
  if (status === "pending") return "yellow";
  if (status === "inactive") return "gray";
  return "red";
}

function rolePermissionTone(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("view only")) return "border-sky-400/25 bg-sky-400/10 text-sky-200";
  if (normalized.includes("hidden")) return "border-slate-800 bg-slate-950/40 text-slate-500";
  if (normalized.includes("limited")) return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  if (normalized.includes("read only") || normalized.includes("view")) return "border-sky-400/25 bg-sky-400/10 text-sky-200";
  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
}

function RoleAccessPreview({ role, onRoleChange }: { role: AccessRole; onRoleChange: (role: AccessRole) => void }) {
  const permissions = rolePermissions[role];
  const visibleViews = navItemsForRole(role);
  const permissionGroups = [
    {
      title: "Core workspace",
      caption: "Landing views and general visibility",
      icon: LayoutDashboard,
      items: [
        ["Dashboard", permissions.dashboard],
        ["Visible views", `${visibleViews.length} screens`],
      ],
    },
    {
      title: "Documents",
      caption: "Creation, operation, signing, and sponsor review",
      icon: FileText,
      items: [
        ["Document view", permissions.documents],
        ["Create", permissions.documentCreation],
        ["Operate", permissions.documentOperations],
        ["Sign", permissions.signatureTasks],
        ["Sponsor review", permissions.sponsorReview],
      ],
    },
    {
      title: "Trading",
      caption: "Trade visibility, workflows, and manual intake",
      icon: ArrowLeftRight,
      items: [
        ["Trades / Workflows", permissions.tradesWorkflows],
        ["Manual trades", permissions.canCreateTrades ? "Allowed" : "Hidden"],
        ["Workflow setup", permissions.canManageWorkflows ? "Allowed" : "View only / hidden actions"],
      ],
    },
    {
      title: "Client data",
      caption: "Accounts, households, contacts, and assets",
      icon: Users,
      items: [
        ["Accounts", permissions.accounts],
        ["Households", permissions.households],
        ["Contacts", permissions.contacts],
        ["Private assets", permissions.privateAssets],
        ["Edit contacts", permissions.canManageHouseholds ? "Allowed" : roleCanAccessNav(role, "households") ? "View only" : "Hidden"],
      ],
    },
    {
      title: "Operations",
      caption: "Broker setup, execution, and integrations",
      icon: Route,
      items: [
        ["Broker config", permissions.canManageBrokers ? "Allowed" : "View only / hidden actions"],
        ["Execution actions", permissions.canOperateExecution ? "Allowed" : roleCanAccessNav(role, "execution") ? "View only" : "Hidden"],
        ["Integration settings", permissions.canManageIntegrations ? "Allowed" : roleCanAccessNav(role, "integrations") ? "View only" : "Hidden"],
      ],
    },
    {
      title: "Administration",
      caption: "User role and scope assignment",
      icon: Shield,
      items: [
        ["Role admin view", permissions.roleAdministration],
        ["Assign roles", permissions.canAdministerRoles ? "Allowed" : "Hidden"],
      ],
    },
  ];

  return (
    <ShellCard className="mb-5 overflow-visible">
      <div className="grid grid-cols-[0.95fr_1.65fr] gap-0">
        <div className="border-r border-slate-800/80 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Role access model</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">{permissions.summary}</p>
            </div>
            <StatusBadge value={accessRoleLabels[role]} tone="blue" />
          </div>

          <RoleSelect value={role} onChange={onRoleChange} className="mt-5" />

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Info label="Visible views" value={`${visibleViews.length}`} />
            <Info label="Document create" value={permissions.canCreateDocuments ? "Yes" : "No"} />
            <Info label="Execution actions" value={permissions.canOperateExecution ? "Yes" : "No"} />
            <Info label="Admin actions" value={permissions.canAdministerRoles ? "Yes" : "No"} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {visibleViews.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.key} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/45 px-2 text-[10px] font-semibold text-slate-300">
                  <Icon className="h-3 w-3 text-sky-300" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-950/20 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Permission profile</h3>
              <p className="mt-1 text-[11px] text-slate-500">Grouped by the surfaces the frontend needs to render or hide.</p>
            </div>
            <span className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 text-[10px] font-semibold text-slate-400">Role based UI</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {permissionGroups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.title} className="rounded-lg border border-slate-800 bg-[#0c1016] p-4 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-sky-400/20 bg-sky-400/10">
                      <Icon className="h-4 w-4 text-sky-300" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-100">{group.title}</h4>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{group.caption}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {group.items.map(([label, value]) => (
                      <div key={`${group.title}-${label}`} className="flex items-center justify-between gap-3 rounded-md border border-slate-800/70 bg-slate-950/35 px-2.5 py-2">
                        <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                        <span className={`inline-flex min-h-5 max-w-[160px] items-center truncate rounded-md border px-2 text-[9px] font-semibold ${rolePermissionTone(value)}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ShellCard>
  );
}

function UserAccessPage({
  users,
  onUpdateUser,
}: {
  users: UserAccessRequest[];
  onUpdateUser: (userId: string, patch: Partial<UserAccessRequest>) => void;
}) {
  const [previewRole, setPreviewRole] = useState<AccessRole>("pats_ops");
  const pending = users.filter((user) => user.status === "pending").length;
  const active = users.filter((user) => user.status === "active").length;
  const inactive = users.filter((user) => user.status === "inactive").length;
  const removed = users.filter((user) => user.status === "role_removed").length;

  function currentRole(user: UserAccessRequest): AccessRole {
    return user.assignedRole ?? user.requestedRole ?? "client_signer";
  }

  function setDraftRole(user: UserAccessRequest, role: AccessRole) {
    onUpdateUser(user.userId, user.status === "pending" ? { requestedRole: role } : { assignedRole: role });
  }

  function assignRole(user: UserAccessRequest) {
    const role = currentRole(user);
    onUpdateUser(user.userId, {
      assignedRole: role,
      requestedRole: undefined,
      status: "active",
      notes: `Access approved as ${accessRoleLabels[role]}`,
    });
  }

  function inactivateRole(user: UserAccessRequest) {
    onUpdateUser(user.userId, {
      status: "inactive",
      notes: "Role is inactive. User keeps a record but cannot operate in scoped views.",
    });
  }

  function removeRole(user: UserAccessRequest) {
    onUpdateUser(user.userId, {
      assignedRole: undefined,
      requestedRole: undefined,
      status: "role_removed",
      notes: "Role removed by Ops. User needs a new assignment before seeing restricted views.",
    });
  }

  return (
    <>
      <PageTitle title="User Access" subtitle="Ops review for new users, role assignment, scoped access, and inactive roles" />

      <div className="mb-5 grid grid-cols-4 gap-4">
        <MetricCard label="Pending review" value={`${pending}`} delta="new users" />
        <MetricCard label="Active roles" value={`${active}`} delta="approved" />
        <MetricCard label="Inactive" value={`${inactive}`} delta="paused" />
        <MetricCard label="Removed" value={`${removed}`} delta="no role" />
      </div>

      <RoleAccessPreview role={previewRole} onRoleChange={setPreviewRole} />

      <ShellCard className="overflow-visible">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Role administration</h2>
            <p className="mt-1 text-xs text-slate-500">New registered users stay pending until Ops assigns a role and scope.</p>
          </div>
          <StatusBadge value={`${pending} Pending`} tone={pending > 0 ? "yellow" : "green"} />
        </div>

        <TableHeader columns={["User", "Status", "Role", "Scope", "Activity", "Actions"]} />
        {users.map((user) => {
          const role = currentRole(user);
          const canAssign = user.status !== "active";
          const canInactivate = user.status === "active";
          const canRemove = user.status !== "role_removed";

          return (
            <div key={user.userId} className="grid grid-cols-[1.6fr_0.55fr_1fr_1.3fr_1.15fr_1.05fr] items-center gap-5 border-t border-slate-800/80 px-6 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900">
                    <User className="h-3.5 w-3.5 text-sky-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">{user.displayName}</p>
                    <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <p className="mt-2 truncate text-[11px] text-slate-500">{user.company}</p>
              </div>

              <StatusBadge value={user.status.replace("_", " ")} tone={accessStatusTone(user.status)} />

              <div>
                <RoleSelect value={role} onChange={(nextRole) => setDraftRole(user, nextRole)} compact />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-200">{user.scopeLabel}</p>
                <p className="mt-1 truncate text-[10px] text-slate-500">{accessRoleScopeHints[role]}</p>
              </div>

              <div>
                <p className="text-xs text-slate-300">{user.lastActivity}</p>
                <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{user.notes}</p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                {canAssign && (
                  <button onClick={() => assignRole(user)} className="flex h-7 items-center gap-1.5 rounded-md bg-sky-500 px-2.5 text-[11px] font-semibold text-white hover:bg-sky-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />Assign
                  </button>
                )}
                {canInactivate && (
                  <button onClick={() => inactivateRole(user)} className="flex h-7 items-center gap-1.5 rounded-md border border-slate-700 px-2.5 text-[11px] font-semibold text-slate-300 hover:border-amber-300/40 hover:text-amber-200">
                    <Clock3 className="h-3.5 w-3.5" />Inactive
                  </button>
                )}
                {canRemove && (
                  <button onClick={() => removeRole(user)} className="flex h-7 items-center gap-1.5 rounded-md border border-rose-400/25 px-2.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-400/10">
                    <X className="h-3.5 w-3.5" />Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
          <Info label="Investor / account" value={tradeInvestorLabel(trade)} />
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

function NewTradePanel({ allTrades, onAdd, onClose }: { allTrades: Trade[]; onAdd: (t: Trade) => void; onClose: () => void }) {
  const [tradeType, setTradeType] = useState<Trade["type"]>("Buy");
  const [selectedBrokerName, setSelectedBrokerName] = useState(brokers[0]?.name ?? "");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [qty, setQty] = useState("");

  const brokerAssets = assets.filter(a => a.broker === selectedBrokerName);
  const selectedAsset = assets.find(a => a.privateAssetId === selectedAssetId);
  const selectedBroker = brokers.find(b => b.name === selectedBrokerName);

  const handleCreate = () => {
    if (!selectedBrokerName) return;
    const num = allTrades.length + 1;
    onAdd({
      id: `TRD-${String(num).padStart(3, "0")}`,
      inboundTradeId: `it_manual_${Date.now()}`,
      vantageTradeId: `vt_manual_${Date.now()}`,
      vantageBrokerId: selectedBroker?.vantageBrokerId ?? "",
      patsBrokerProfileId: selectedBroker?.patsBrokerProfileId,
      privateAssetId: selectedAsset?.privateAssetId,
      brokerScopedTickerId: selectedAsset?.brokerScopedTickerId,
      ticker: selectedAsset?.ticker ?? "MANUAL",
      broker: selectedBrokerName,
      asset: selectedAsset?.name ?? "Manual entry",
      type: tradeType,
      quantity: qty || "-",
      amount: "-",
      status: "workflow_required",
      workflowRequired: true,
      workflowReason: "every_trade",
      routing: "Manual",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      fillId: "pending",
    });
    onClose();
  };

  return (
    <DetailPanel title="New Manual Trade" subtitle="Manual entry for trades not received from Vantage Blotter" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Trade context</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Broker">
              <select className={compactInputClass} value={selectedBrokerName} onChange={e => { setSelectedBrokerName(e.target.value); setSelectedAssetId(""); }}>
                <option value="">— Select broker —</option>
                {brokers.map(b => <option key={b.patsBrokerProfileId} value={b.name}>{b.name}</option>)}
              </select>
            </FormField>
            <FormField label="Private asset">
              <select className={compactInputClass} value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} disabled={brokerAssets.length === 0}>
                <option value="">— Select asset —</option>
                {brokerAssets.map(a => <option key={a.privateAssetId} value={a.privateAssetId}>{a.name} ({a.ticker})</option>)}
              </select>
            </FormField>
          </div>
          {selectedAsset && (
            <div className="mt-3 rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-[11px] text-slate-500">
              {selectedAsset.ticker} · {selectedAsset.className} · {selectedAsset.broker}
            </div>
          )}
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Order details</h3>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-300">Trade type</span>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(["Buy", "Sell", "Subscribe", "Redeem"] as const).map((type) => (
                <button key={type} onClick={() => setTradeType(type)} className={`h-8 rounded-md border text-xs font-semibold ${tradeType === type ? (type === "Buy" || type === "Subscribe" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-rose-400/30 bg-rose-400/10 text-rose-300") : "border-slate-700 bg-slate-900 text-slate-300"}`}>{type}</button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <FormField label="Quantity or amount">
              <input className={compactInputClass} placeholder="10,000 or $500,000" value={qty} onChange={e => setQty(e.target.value)} />
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
          <button onClick={handleCreate} disabled={!selectedBrokerName} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white disabled:opacity-40">Create Trade</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function ConfigureBrokerPanel({ onAdd, onClose }: { onAdd: (b: Broker) => void; onClose: () => void }) {
  const [selectedVantageBroker, setSelectedVantageBroker] = useState("Goldman Sachs Advisor Solutions");
  const [brokerStatus, setBrokerStatus] = useState<"Enabled" | "Disabled">("Enabled");
  const [fillReturn, setFillReturn] = useState("PATS returns fill to Vantage");

  const fillReturnMethodMap: Record<string, Broker["fillReturnMethod"]> = {
    "PATS returns fill to Vantage": "vantage_blotter",
    "API confirmation to PATS": "api_confirmation",
    "Manual confirmation to PATS": "manual",
    "Workflow completion event": "workflow_event",
  };

  const handleEnable = () => {
    const shortCode = selectedVantageBroker.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 8);
    onAdd({
      patsBrokerProfileId: `pbp_${shortCode.toLowerCase()}_${Date.now()}`,
      vantageBrokerId: `vb_${shortCode.toLowerCase()}_${Date.now()}`,
      name: selectedVantageBroker,
      code: shortCode,
      status: brokerStatus === "Enabled" ? "Active" : "Disconnected",
      systems: ["Vantage broker sync"],
      inboundTrades: 0,
      listedAssets: 0,
      defaultRoute: "Manual Review",
      defaultVantageRouterId: null,
      role: "Private asset processing",
      workflowOwner: "Sarah Chen",
      fillReturnMethod: fillReturnMethodMap[fillReturn] ?? "manual",
      fillReturn,
      contacts: [],
    });
    onClose();
  };

  return (
    <DetailPanel title="Enable Broker" subtitle="Select a Vantage broker and set the basic PATS settings for private asset trades" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Broker from Vantage</h3>
          <p className="mt-1 text-xs text-slate-500">PATS uses the Vantage broker as the source record.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Vantage broker">
              <select className={compactInputClass} value={selectedVantageBroker} onChange={e => setSelectedVantageBroker(e.target.value)}>
                <option>Goldman Sachs Advisor Solutions</option>
                <option>Morgan Stanley Alternatives</option>
                <option>JP Morgan Private Markets</option>
                <option>Schwab Alternative Investments</option>
                <option>Fidelity Institutional</option>
                <option>UBS Alternative Investments</option>
              </select>
            </FormField>
            <FormField label="PATS status">
              <select className={compactInputClass} value={brokerStatus} onChange={e => setBrokerStatus(e.target.value as "Enabled" | "Disabled")}>
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </FormField>
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">PATS settings</h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <FormField label="Fill return method">
              <select className={compactInputClass} value={fillReturn} onChange={e => setFillReturn(e.target.value)}>
                <option>PATS returns fill to Vantage</option>
                <option>API confirmation to PATS</option>
                <option>Manual confirmation to PATS</option>
                <option>Workflow completion event</option>
              </select>
            </FormField>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Owner</p>
              <p className="mt-1 text-xs font-semibold text-slate-100">Current user</p>
              <p className="mt-1 text-xs text-slate-500">Saved by PATS from the active session.</p>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Next setup</p>
              <p className="mt-1 text-xs font-semibold text-slate-100">Assets and workflows</p>
              <p className="mt-1 text-xs text-slate-500">Configured after the broker is enabled.</p>
            </div>
          </div>
        </ShellCard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={handleEnable} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Enable Broker</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function Households({ role }: { role: AccessRole }) {
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(households[0]?.householdId ?? "");
  const [householdPanel, setHouseholdPanel] = useState<"create" | "person" | "account" | null>(null);
  const canManageHouseholds = rolePermissions[role].canManageHouseholds;
  const selectedHousehold = households.find((h) => h.householdId === selectedHouseholdId) ?? households[0];
  const primaryContact = householdPersons.find((p) => p.personId === selectedHousehold.primaryContactId);
  const personsInHousehold = householdPersons.filter((p) => p.householdId === selectedHousehold.householdId);
  const accountsInHousehold = householdAccounts.filter((a) => a.householdId === selectedHousehold.householdId);

  return (
    <>
      <PageTitle
        title="Contacts"
        subtitle="Households, persons, and accounts associated with private asset trading"
        action={
          canManageHouseholds ? <button onClick={() => setHouseholdPanel("create")} className="flex h-9 items-center gap-1.5 rounded-md bg-sky-500 px-3 text-xs font-semibold text-white shadow-lg shadow-sky-950/30">
            <Plus className="h-3.5 w-3.5" />New Household
          </button> : undefined
        }
      />
      {!canManageHouseholds && <ReadOnlyNotice label="Contact, household, person, and account information is visible according to scope, but add/edit actions are hidden." />}
      <Toolbar placeholder="Search household, person, account, custodian, or status..." />
      <div className="grid grid-cols-[0.85fr_1.5fr] gap-5">
        <ShellCard className="overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-100">Households</h2>
            <p className="mt-1 text-[11px] text-slate-500">Each household groups persons and accounts for private asset trading.</p>
          </div>
          <div className="divide-y divide-slate-800/80">
            {households.map((hh) => {
              const isSelected = hh.householdId === selectedHousehold.householdId;
              const persons = householdPersons.filter((p) => p.householdId === hh.householdId);
              const accounts = householdAccounts.filter((a) => a.householdId === hh.householdId);
              const primary = householdPersons.find((p) => p.personId === hh.primaryContactId);
              return (
                <button
                  key={hh.householdId}
                  onClick={() => setSelectedHouseholdId(hh.householdId)}
                  className={`w-full px-5 py-4 text-left transition ${isSelected ? "bg-sky-400/10" : "hover:bg-slate-900/65"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{hh.name}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">{primary ? personDisplayName(primary) : "No primary contact"}</p>
                    </div>
                    <StatusBadge value={hh.status} tone={hh.status === "active" ? "green" : "gray"} />
                  </div>
                  <div className="mt-2.5 flex gap-3 text-[11px] text-slate-500">
                    <span><span className="font-semibold text-slate-300">{persons.length}</span> persons</span>
                    <span><span className="font-semibold text-slate-300">{accounts.length}</span> accounts</span>
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
                <h2 className="text-lg font-semibold text-white">{selectedHousehold.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{selectedHousehold.notes}</p>
              </div>
              <StatusBadge value={selectedHousehold.status} tone={selectedHousehold.status === "active" ? "green" : "gray"} />
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <p className="text-[8px] font-semibold text-slate-600">Primary contact</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{primaryContact ? personDisplayName(primaryContact) : "Not assigned"}</p>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <p className="text-[8px] font-semibold text-slate-600">Persons</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{personsInHousehold.length}</p>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <p className="text-[8px] font-semibold text-slate-600">Accounts</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{accountsInHousehold.length}</p>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3">
                <p className="text-[8px] font-semibold text-slate-600">Created</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{selectedHousehold.createdAt}</p>
              </div>
            </div>
          </ShellCard>

          <ShellCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Persons</h2>
                <p className="mt-1 text-[11px] text-slate-500">Members, signers, and trustees associated with this household.</p>
              </div>
              {canManageHouseholds && (
                <button onClick={() => setHouseholdPanel("person")} className="flex items-center gap-1 text-[11px] font-semibold text-sky-400">
                  <Plus className="h-3 w-3" />Add
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-800/80">
              {personsInHousehold.length === 0 ? (
                <p className="px-5 py-4 text-xs text-slate-500">No persons added yet.</p>
              ) : personsInHousehold.map((person) => (
                <div key={person.personId} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${person.entityType === "human" ? "bg-slate-800 text-slate-300" : "bg-slate-800/60 text-sky-400"}`}>
                        {person.entityType === "human"
                          ? `${(person.firstName ?? "?")[0]}${(person.lastName ?? "?")[0]}`
                          : person.entityType === "trust" ? "T" : person.entityType === "llc" ? "L" : "LP"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-100">{personDisplayName(person)}</span>
                          <StatusBadge value={entityTypeLabel(person.entityType)} tone={entityTypeTone(person.entityType)} />
                        </div>
                        <span className="text-[10px] text-slate-600">{person.email ?? displayLabel(person.role)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge value={displayLabel(person.role)} tone="gray" />
                      <StatusBadge value={person.status} tone={person.status === "active" ? "green" : "gray"} />
                    </div>
                  </div>
                  <div className="mt-3 ml-[42px] flex flex-wrap gap-x-6 gap-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="text-[9px] font-semibold text-slate-600">EMAIL</span>
                      {person.email}
                    </span>
                    {person.phone && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="text-[9px] font-semibold text-slate-600">PHONE</span>
                        {person.phone}
                      </span>
                    )}
                    {person.entityType === "human" && person.ssn && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="text-[9px] font-semibold text-slate-600">SSN</span>
                        {person.ssn}
                      </span>
                    )}
                    {person.entityType !== "human" && person.taxId && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="text-[9px] font-semibold text-slate-600">EIN</span>
                        {person.taxId}
                      </span>
                    )}
                    {person.entityType === "human" && person.city && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="text-[9px] font-semibold text-slate-600">ADDR</span>
                        {person.city}, {person.state}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ShellCard>

          <ShellCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Accounts</h2>
                <p className="mt-1 text-[11px] text-slate-500">Custodian accounts linked to this household with their authorized signers.</p>
              </div>
              {canManageHouseholds && (
                <button onClick={() => setHouseholdPanel("account")} className="flex items-center gap-1 text-[11px] font-semibold text-sky-400">
                  <Plus className="h-3 w-3" />Add
                </button>
              )}
            </div>
            <div className="grid grid-cols-[1fr_0.85fr_0.9fr_1.5fr_1.3fr_0.65fr] border-b border-slate-800 bg-slate-950/40 px-5 py-2 text-[8px] font-semibold text-slate-600">
              <span>Account number</span>
              <span>Type</span>
              <span>Custodian</span>
              <span>Trust / LP details</span>
              <span>Authorized signers</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-slate-800/80">
              {accountsInHousehold.length === 0 ? (
                <p className="px-5 py-4 text-xs text-slate-500">No accounts added yet.</p>
              ) : accountsInHousehold.map((account) => {
                const signers = account.authorizedSignerIds.map((id) => householdPersons.find((p) => p.personId === id)).filter(Boolean) as HouseholdPerson[];
                const grantor = account.grantorPersonId ? householdPersons.find((p) => p.personId === account.grantorPersonId) : undefined;
                const beneficiaries = (account.beneficiaryPersonIds ?? []).map((id) => householdPersons.find((p) => p.personId === id)).filter(Boolean) as HouseholdPerson[];
                return (
                  <div key={account.accountId} className="grid grid-cols-[1fr_0.85fr_0.9fr_1.5fr_1.3fr_0.65fr] items-start px-5 py-3.5 text-sm">
                    <span>
                      <span className="block font-semibold text-slate-100">{account.accountNumber}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">{account.custodian}</span>
                    </span>
                    <span className="pt-0.5"><StatusBadge value={displayLabel(account.accountType)} tone="blue" /></span>
                    <span className="text-xs text-slate-300 pt-0.5">{account.custodian}</span>
                    <span className="space-y-1 pt-0.5">
                      {grantor && (
                        <div>
                          <span className="text-[9px] font-semibold text-slate-600">GRANTOR</span>
                          <span className="ml-1.5 text-[11px] text-slate-300">{personDisplayName(grantor)}</span>
                        </div>
                      )}
                      {beneficiaries.length > 0 && (
                        <div>
                          <span className="text-[9px] font-semibold text-slate-600">BENEFICIAR{beneficiaries.length > 1 ? "IES" : "Y"}</span>
                          <span className="ml-1.5 text-[11px] text-slate-300">{beneficiaries.map(personDisplayName).join(", ")}</span>
                        </div>
                      )}
                      {!grantor && beneficiaries.length === 0 && (
                        <span className="text-[11px] text-slate-600">—</span>
                      )}
                    </span>
                    <span className="pt-0.5">
                      <div className="flex flex-wrap gap-1">
                        {signers.map((signer) => (
                          <span key={signer.personId} className="inline-flex items-center rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-300">
                            {personDisplayName(signer)}
                          </span>
                        ))}
                      </div>
                    </span>
                    <span className="pt-0.5"><StatusBadge value={account.status} tone={account.status === "active" ? "green" : "gray"} /></span>
                  </div>
                );
              })}
            </div>
          </ShellCard>
        </div>
      </div>
      {canManageHouseholds && householdPanel === "create" && <CreateHouseholdPanel onClose={() => setHouseholdPanel(null)} />}
      {canManageHouseholds && householdPanel === "person" && <AddPersonPanel household={selectedHousehold} onClose={() => setHouseholdPanel(null)} />}
      {canManageHouseholds && householdPanel === "account" && <AddAccountPanel household={selectedHousehold} persons={personsInHousehold} onClose={() => setHouseholdPanel(null)} />}
    </>
  );
}

function CreateHouseholdPanel({ onClose }: { onClose: () => void }) {
  return (
    <DetailPanel title="Create Household" subtitle="Register a new household to group persons and accounts" onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Household details</h3>
          <div className="mt-4 space-y-3">
            <FormField label="Household name">
              <input className={compactInputClass} placeholder="Chen Family Trust" />
            </FormField>
            <FormField label="Notes">
              <input className={compactInputClass} placeholder="Brief description of the household" />
            </FormField>
          </div>
        </ShellCard>
        <div className="rounded-md border border-slate-800 bg-[#0c1117] p-3 text-xs text-slate-400">
          After creating the household, add persons and link accounts. The primary contact is set from an existing person.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={onClose} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Create Household</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function AddPersonPanel({ household, onClose }: { household: HouseholdRecord; onClose: () => void }) {
  const [entityType, setEntityType] = useState<HouseholdPerson["entityType"]>("human");
  const isHuman = entityType === "human";

  const entityTypeOptions: { value: HouseholdPerson["entityType"]; label: string; desc: string }[] = [
    { value: "human", label: "Individual", desc: "A natural person" },
    { value: "trust", label: "Trust", desc: "Revocable or irrevocable trust" },
    { value: "llc", label: "LLC", desc: "Limited liability company" },
    { value: "limited_partnership", label: "LP", desc: "Limited partnership" },
  ];

  return (
    <DetailPanel title="Add Person / Entity" subtitle={`Add a member to ${household.name}`} onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Type</h3>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {entityTypeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEntityType(opt.value)}
                className={`rounded-md border px-3 py-2.5 text-left transition ${entityType === opt.value ? "border-sky-500 bg-sky-500/10 text-sky-300" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"}`}
              >
                <span className="block text-xs font-semibold">{opt.label}</span>
                <span className="mt-0.5 block text-[10px] text-slate-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">{isHuman ? "Personal info" : "Entity info"}</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {isHuman ? (
              <>
                <FormField label="First name">
                  <input className={compactInputClass} placeholder="Sarah" />
                </FormField>
                <FormField label="Last name">
                  <input className={compactInputClass} placeholder="Chen" />
                </FormField>
              </>
            ) : (
              <div className="col-span-2">
                <FormField label="Legal entity name">
                  <input className={compactInputClass} placeholder={entityType === "trust" ? "Chen Family Trust 2019" : entityType === "llc" ? "Walsh Capital LLC" : "Reed & Associates LP"} />
                </FormField>
              </div>
            )}
            <FormField label="Email">
              <input className={compactInputClass} placeholder="contact@example.com" />
            </FormField>
            {isHuman && (
              <FormField label="Phone">
                <input className={compactInputClass} placeholder="+1 (415) 555-0100" />
              </FormField>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {isHuman ? (
              <>
                <FormField label="SSN (last 4 stored only)">
                  <input className={compactInputClass} placeholder="XXX-XX-0000" />
                </FormField>
                <div />
                <div className="col-span-2">
                  <FormField label="Address">
                    <input className={compactInputClass} placeholder="142 Oak Street" />
                  </FormField>
                </div>
                <FormField label="City">
                  <input className={compactInputClass} placeholder="San Francisco" />
                </FormField>
                <FormField label="State">
                  <input className={compactInputClass} placeholder="CA" />
                </FormField>
              </>
            ) : (
              <div className="col-span-2">
                <FormField label="Tax ID / EIN">
                  <input className={compactInputClass} placeholder="XX-0000000" />
                </FormField>
              </div>
            )}
          </div>
        </ShellCard>

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Role in household</h3>
          <div className="mt-3">
            <FormField label="Role">
              <select className={compactInputClass}>
                {isHuman ? (
                  <>
                    <option value="primary">Primary contact</option>
                    <option value="owner">Owner</option>
                    <option value="joint_owner">Joint owner</option>
                    <option value="spouse">Spouse</option>
                    <option value="authorized_signer">Authorized signer</option>
                    <option value="beneficiary">Beneficiary</option>
                    <option value="trustee">Trustee</option>
                    <option value="co_trustee">Co-trustee</option>
                    <option value="grantor">Grantor</option>
                    <option value="dependent">Dependent</option>
                  </>
                ) : (
                  <>
                    {entityType === "trust" && <option value="trustee">Trustee (trust entity)</option>}
                    {entityType === "llc" && <option value="managing_member">Managing member</option>}
                    {entityType === "limited_partnership" && <option value="general_partner">General partner</option>}
                    <option value="authorized_signer">Authorized signer</option>
                  </>
                )}
              </select>
            </FormField>
          </div>
        </ShellCard>

        <div className="rounded-md border border-slate-800 bg-[#0c1117] p-3 text-xs text-slate-400">
          {isHuman
            ? "SSN is stored masked. Authorized signers can be linked to accounts in this household. Only one person should be set as the primary contact."
            : "Entities (trust, LLC, LP) are stored as persons and can be linked as authorized signers on accounts. Use Tax ID / EIN for document auto-population."}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={onClose} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Add {isHuman ? "Person" : "Entity"}</button>
        </div>
      </div>
    </DetailPanel>
  );
}

function AddAccountPanel({ household, persons, onClose }: { household: HouseholdRecord; persons: HouseholdPerson[]; onClose: () => void }) {
  const [accountType, setAccountType] = useState<HouseholdAccount["accountType"]>("individual");
  const isTrust = accountType === "trust";
  const isLP = accountType === "limited_partnership";

  return (
    <DetailPanel title="Add Account" subtitle={`Link an account to ${household.name}`} onClose={onClose}>
      <div className="space-y-4">
        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Account details</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Account number">
              <input className={compactInputClass} placeholder="GS-4492-A" />
            </FormField>
            <FormField label="Account type">
              <select className={compactInputClass} value={accountType} onChange={(e) => setAccountType(e.target.value as HouseholdAccount["accountType"])}>
                <option value="individual">Individual</option>
                <option value="joint">Joint</option>
                <option value="trust">Trust</option>
                <option value="ira">IRA</option>
                <option value="roth_ira">Roth IRA</option>
                <option value="entity">Entity</option>
                <option value="limited_partnership">Limited Partnership</option>
              </select>
            </FormField>
            <FormField label="Custodian">
              <select className={compactInputClass}>
                <option>Goldman Sachs</option>
                <option>Morgan Stanley</option>
                <option>JP Morgan</option>
                <option>iCapital</option>
                <option>Schwab</option>
              </select>
            </FormField>
            <FormField label="Primary person / entity">
              <select className={compactInputClass}>
                {persons.length === 0
                  ? <option>No persons added yet</option>
                  : persons.map((p) => <option key={p.personId} value={p.personId}>{personDisplayName(p)}</option>)
                }
              </select>
            </FormField>
          </div>
        </ShellCard>

        {(isTrust || isLP) && (
          <ShellCard className="p-4">
            <h3 className="text-sm font-semibold text-white">{isTrust ? "Trust details" : "Partnership details"}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {isTrust ? "Specify the grantor and beneficiaries for this trust account. These are used to auto-populate subscription documents." : "Specify the general partner for this LP account."}
            </p>
            <div className="mt-4 space-y-3">
              {isTrust && (
                <FormField label="Grantor">
                  <select className={compactInputClass}>
                    <option value="">— Select grantor —</option>
                    {persons.map((p) => (
                      <option key={p.personId} value={p.personId}>{personDisplayName(p)} ({displayLabel(p.role)})</option>
                    ))}
                  </select>
                </FormField>
              )}
              {isLP && (
                <FormField label="General partner">
                  <select className={compactInputClass}>
                    <option value="">— Select general partner —</option>
                    {persons.filter((p) => p.role === "general_partner" || p.entityType === "limited_partnership").map((p) => (
                      <option key={p.personId} value={p.personId}>{personDisplayName(p)}</option>
                    ))}
                    {persons.filter((p) => p.role !== "general_partner" && p.entityType !== "limited_partnership").map((p) => (
                      <option key={p.personId} value={p.personId}>{personDisplayName(p)} ({displayLabel(p.role)})</option>
                    ))}
                  </select>
                </FormField>
              )}
              {isTrust && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold text-slate-500">Beneficiaries</p>
                  <div className="space-y-2">
                    {persons.map((person) => (
                      <label key={person.personId} className="flex cursor-pointer items-center gap-2.5 rounded-md border border-slate-800 px-3 py-2 text-xs text-slate-300">
                        <input type="checkbox" className="h-3.5 w-3.5 accent-sky-500" defaultChecked={person.role === "beneficiary"} />
                        <span className="font-semibold">{personDisplayName(person)}</span>
                        <StatusBadge value={entityTypeLabel(person.entityType)} tone={entityTypeTone(person.entityType)} />
                        <StatusBadge value={displayLabel(person.role)} tone="gray" />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ShellCard>
        )}

        <ShellCard className="p-4">
          <h3 className="text-sm font-semibold text-white">Authorized signers</h3>
          <p className="mt-1 text-xs text-slate-500">Select persons or entities from this household who can sign documents for this account.</p>
          <div className="mt-3 space-y-2">
            {persons.length === 0 ? (
              <p className="text-xs text-slate-500">Add persons to the household first.</p>
            ) : persons.map((person) => (
              <label key={person.personId} className="flex cursor-pointer items-center gap-2.5 rounded-md border border-slate-800 px-3 py-2.5 text-xs text-slate-300">
                <input type="checkbox" className="h-3.5 w-3.5 accent-sky-500" defaultChecked={person.role === "primary" || person.role === "authorized_signer"} />
                <span className="font-semibold flex-1">{personDisplayName(person)}</span>
                <StatusBadge value={entityTypeLabel(person.entityType)} tone={entityTypeTone(person.entityType)} />
                <StatusBadge value={displayLabel(person.role)} tone="gray" />
              </label>
            ))}
          </div>
        </ShellCard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-9 rounded-md border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200">Cancel</button>
          <button onClick={onClose} className="h-9 rounded-md bg-sky-500 text-xs font-semibold text-white">Add Account</button>
        </div>
      </div>
    </DetailPanel>
  );
}

export default function PatsPlatform() {
  const [active, setActive] = useState<NavKey>("dashboard");
  const [activeRole, setActiveRole] = useState<AccessRole>("pats_ops");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedExternal, setSelectedExternal] = useState<string | null>(null);
  const [newTradeOpen, setNewTradeOpen] = useState(false);
  const [newBrokerOpen, setNewBrokerOpen] = useState(false);

  const [localTrades, setLocalTrades] = useState<Trade[]>(() => loadLocal("pats_trades", trades));
  const [localBrokers, setLocalBrokers] = useState<Broker[]>(() => loadLocal("pats_brokers", brokers));
  const [localAssets, setLocalAssets] = useState<Asset[]>(() => loadLocal("pats_private_assets", assets));
  const [localDocs, setLocalDocs] = useState<TradeDoc[]>(() => mergeDocumentSeeds(loadLocal("pats_docs", tradeDocuments)));
  const [localWorkflows, setLocalWorkflows] = useState<WorkflowRecord[]>(() => loadLocal("pats_workflows", workflows));
  const [localUserAccess, setLocalUserAccess] = useState<UserAccessRequest[]>(() => loadLocal("pats_user_access", userAccessSeeds));

  const addTrade = (t: Trade) => { const n = [t, ...localTrades]; setLocalTrades(n); saveLocal("pats_trades", n); };
  const updateBroker = (id: string, p: Partial<Broker>) => { const n = localBrokers.map(b => b.patsBrokerProfileId === id ? { ...b, ...p } : b); setLocalBrokers(n); saveLocal("pats_brokers", n); };
  const addBroker = (b: Broker) => { const n = [...localBrokers, b]; setLocalBrokers(n); saveLocal("pats_brokers", n); };
  const addAsset = (asset: Asset) => { const n = [asset, ...localAssets]; setLocalAssets(n); saveLocal("pats_private_assets", n); };
  const mapAssetTicker = (assetId: string, ticker: string) => {
    const normalizedTicker = ticker.trim().toUpperCase();
    const n = localAssets.map((asset) => asset.privateAssetId === assetId ? {
      ...asset,
      ticker: normalizedTicker,
      brokerScopedTickerId: `bst_mock_${Date.now().toString(36)}`,
    } : asset);
    setLocalAssets(n);
    saveLocal("pats_private_assets", n);
  };
  const addDoc = (d: TradeDoc) => { const n = [...localDocs, d]; setLocalDocs(n); saveLocal("pats_docs", n); };
  const updateDoc = (id: string, p: Partial<TradeDoc>) => { const n = localDocs.map(d => d.tradeDocumentId === id ? { ...d, ...p } : d); setLocalDocs(n); saveLocal("pats_docs", n); };
  const addWorkflow = (w: WorkflowRecord) => { const n = [...localWorkflows, w]; setLocalWorkflows(n); saveLocal("pats_workflows", n); };
  const updateWorkflow = (id: string, p: Partial<WorkflowRecord>) => { const n = localWorkflows.map(w => w.id === id ? { ...w, ...p } : w); setLocalWorkflows(n); saveLocal("pats_workflows", n); };
  const updateUserAccess = (id: string, p: Partial<UserAccessRequest>) => { const n = localUserAccess.map(u => u.userId === id ? { ...u, ...p } : u); setLocalUserAccess(n); saveLocal("pats_user_access", n); };
  const selectNav = (key: NavKey) => {
    if (roleCanAccessNav(activeRole, key)) setActive(key);
  };
  const changeRole = (role: AccessRole) => {
    setActiveRole(role);
    if (!rolePermissions[role].canCreateTrades) setNewTradeOpen(false);
    if (!rolePermissions[role].canManageBrokers) setNewBrokerOpen(false);
    if (!roleCanAccessNav(role, active)) setActive("dashboard");
  };

  return (
    <div className="min-h-screen bg-[#080a0d] font-sans text-slate-100 [font-feature-settings:'tnum']">
      <Sidebar active={active} role={activeRole} onSelect={selectNav} />
      <TopBar role={activeRole} onRoleChange={changeRole} />
      <MarketContextBar />
      <main className="ml-60 min-h-[calc(100vh-94px)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.055),transparent_32%),linear-gradient(180deg,#0b0d11_0%,#080a0d_100%)] px-5 py-5">
        <div className="mx-auto max-w-[1560px]">
          {active === "dashboard" && <Dashboard role={activeRole} onSelect={selectNav} />}
          {active === "trades" && <Trades trades={localTrades} role={activeRole} openNewTrade={() => setNewTradeOpen(true)} openTrade={setSelectedTrade} />}
          {active === "externalTrades" && <ExternalTrades openItem={setSelectedExternal} />}
          {active === "review" && <ReviewCenter role={activeRole} />}
          {active === "brokers" && <Brokers brokers={localBrokers} role={activeRole} updateBroker={updateBroker} openNewBroker={() => setNewBrokerOpen(true)} />}
          {active === "assets" && <PrivateAssets localAssets={localAssets} localBrokers={localBrokers} role={activeRole} onAddAsset={addAsset} onMapTicker={mapAssetTicker} />}
          {active === "workflows" && <Workflows workflows={localWorkflows} role={activeRole} onAddWorkflow={addWorkflow} onUpdateWorkflow={updateWorkflow} />}
          {active === "documents" && <Documents docs={localDocs} activeRole={activeRole} onAddDoc={addDoc} onUpdateDoc={updateDoc} />}
          {active === "households" && <Households role={activeRole} />}
          {active === "execution" && <Execution role={activeRole} />}
          {active === "integrations" && <Integrations role={activeRole} />}
          {active === "userAccess" && <UserAccessPage users={localUserAccess} onUpdateUser={updateUserAccess} />}
          {active === "activity" && <ActivityLog />}
          {active === "alerts" && <AlertsPage />}
          {active === "settings" && <SettingsPage />}
        </div>
      </main>
      {selectedTrade && <TradeDetails trade={selectedTrade} onClose={() => setSelectedTrade(null)} />}
      {selectedExternal && <ExternalTradeDetails id={selectedExternal} onClose={() => setSelectedExternal(null)} />}
      {newTradeOpen && rolePermissions[activeRole].canCreateTrades && <NewTradePanel allTrades={localTrades} onAdd={addTrade} onClose={() => setNewTradeOpen(false)} />}
      {newBrokerOpen && rolePermissions[activeRole].canManageBrokers && <ConfigureBrokerPanel onAdd={addBroker} onClose={() => setNewBrokerOpen(false)} />}
    </div>
  );
}
