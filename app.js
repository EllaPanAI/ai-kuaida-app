(function () {
  const STORAGE_KEY = "ai-kuaida-workspace-v1";
  const APP_TODAY = new Date("2026-06-07T00:00:00+08:00");

  const statusMeta = {
    draft: { label: "Draft", className: "draft" },
    review: { label: "Pending Review", className: "review" },
    changes: { label: "Changes Required", className: "changes" },
    approved: { label: "Approved", className: "approved" },
  };

  const riskMeta = {
    low: { label: "Low", className: "low" },
    medium: { label: "Medium", className: "medium" },
    high: { label: "High", className: "high" },
  };

  const roleModel = [
    {
      role: "System Administrator",
      scope: "Users, SMEs, knowledge library and health dashboard",
      permissions: ["Manage users", "Maintain knowledge library", "View health dashboard", "Configure reminders"],
      defaultView: "Health Dashboard",
    },
    {
      role: "SME",
      scope: "Review questionnaire answers, comments and sign-off",
      permissions: ["View pending review questions", "Edit review comments", "Approve or return answers", "View review history"],
      defaultView: "Approval Queue",
    },
    {
      role: "Operator / Project Delivery User",
      scope: "Upload questionnaires, match answers and submit for review",
      permissions: ["Import questionnaires", "Generate Draft", "Apply knowledge library", "Submit for SME review"],
      defaultView: "workspace",
    },
    {
      role: "Client Manager",
      scope: "View final status and download output documents",
      permissions: ["View project progress", "Download Word", "Download AFME matrix", "View client submission version"],
      defaultView: "Office",
    },
  ];

  const qualityRules = [
    {
      id: "QR01",
      name: "Client Data and Privacy",
      severity: "high",
      keywords: ["client data", "personal data", "privacy", "data residency", "confidential", "client data", "privacy", "confidential"],
      action: "Must cite the security policy and be reviewed by InfoSec",
    },
    {
      id: "QR02",
      name: "Regulatory and Compliance Commitments",
      severity: "high",
      keywords: ["regulatory", "compliance", "sec", "mas", "fca", "regulation", "compliance", "licence"],
      action: "Wording must be confirmed by Compliance",
    },
    {
      id: "QR03",
      name: "Absolute Wording",
      severity: "high",
      keywords: ["guarantee", "always", "never", "zero risk", "guarantee", "always", "never", "zero risk"],
      action: "Replace with verifiable and appropriately qualified wording",
    },
    {
      id: "QR04",
      name: "Fees and Commercial Terms",
      severity: "medium",
      keywords: ["fee", "pricing", "commercial", "fees", "pricing", "rates"],
      action: "Mark for Commercial team confirmation",
    },
    {
      id: "QR05",
      name: "Service Levels and Timeliness",
      severity: "medium",
      keywords: ["sla", "turnaround", "incident", "response time", "service level", "response time", "incident"],
      action: "Check SLA attachments and historical service data",
    },
  ];

  const knowledgeBase = [
    {
      id: "KB001",
      title: "Client Asset Segregation and Custody Controls",
      source: "Global Custody Control Standard v4.2",
      owner: "Custody SME",
      updated: "2026-05-18",
      expiry: "2026-12-31",
      trust: 96,
      tags: ["custody", "asset segregation", "fund services", "control"],
      question: "How are client assets segregated from proprietary assets?",
      answer:
        "Client assets are maintained in segregated custody accounts and are not commingled with proprietary assets. Account opening, reconciliation, entitlement processing, and exception handling are governed by documented controls, maker-checker review, and periodic independent oversight. Where local market structures require omnibus arrangements, the operating model and disclosure language are reviewed by Legal and Compliance.",
    },
    {
      id: "KB002",
      title: "NAV Calculation and Valuation Controls",
      source: "Fund Accounting Operating Model",
      owner: "Fund Accounting SME",
      updated: "2026-04-29",
      expiry: "2026-12-31",
      trust: 94,
      tags: ["NAV", "valuation", "fund accounting", "pricing"],
      question: "Describe the NAV calculation and price validation process.",
      answer:
        "NAV production follows a documented fund accounting calendar with automated price feeds, tolerance checks, exception queues, and independent review before release. Material price overrides, stale prices, and corporate action impacts are escalated according to the fund's valuation policy and retained in the audit record.",
    },
    {
      id: "KB003",
      title: "Information Security and Data Protection",
      source: "Information Security Policy 2026",
      owner: "InfoSec",
      updated: "2026-05-07",
      expiry: "2026-11-30",
      trust: 98,
      tags: ["security", "client data", "privacy", "encryption", "access control"],
      question: "How do you protect confidential client data?",
      answer:
        "Confidential client data is protected through role-based access control, encryption in transit and at rest, logging, periodic access recertification, and security monitoring. Access is granted on a least-privilege basis and is reviewed through formal governance. Security incidents follow the firm's incident response and notification procedures.",
    },
    {
      id: "KB004",
      title: "Business Continuity and Disaster Recovery",
      source: "Business Continuity Plan",
      owner: "Operations Resilience",
      updated: "2026-03-22",
      expiry: "2026-10-31",
      trust: 92,
      tags: ["BCP", "disaster recovery", "resilience", "incident"],
      question: "Describe business continuity and disaster recovery capabilities.",
      answer:
        "Critical services are covered by business continuity and disaster recovery plans with defined recovery objectives, alternate operating procedures, and periodic testing. Results, issues, and remediation actions are tracked by the resilience governance forum and are available for client due diligence review where appropriate.",
    },
    {
      id: "KB005",
      title: "KYC/AML Due Diligence Process",
      source: "Financial Crime Compliance Procedure",
      owner: "Compliance",
      updated: "2026-05-11",
      expiry: "2026-12-31",
      trust: 95,
      tags: ["KYC", "AML", "sanctions", "compliance", "screening"],
      question: "What KYC and AML controls are applied?",
      answer:
        "KYC, AML, sanctions, and client screening controls are applied in accordance with the firm's financial crime compliance framework. Client onboarding, periodic review, beneficial ownership checks, and escalation decisions are documented and subject to quality assurance and independent oversight.",
    },
    {
      id: "KB006",
      title: "Regulatory Reporting and Client Reporting",
      source: "Regulatory Reporting Service Catalogue",
      owner: "Regulatory Reporting SME",
      updated: "2026-04-08",
      expiry: "2026-10-31",
      trust: 89,
      tags: ["regulatory", "reporting", "client report", "compliance"],
      question: "What regulatory reporting services can be supported?",
      answer:
        "Regulatory reporting support depends on jurisdiction, fund structure, data availability, and contracted scope. The operating team can provide standard reporting data extracts and workflow support, while final regulatory responsibility and filing obligations remain subject to the agreed service model and legal review.",
    },
    {
      id: "KB007",
      title: "Service SLAs and Issue Escalation",
      source: "Client Service Operating Procedures",
      owner: "Client Service",
      updated: "2026-05-20",
      expiry: "2026-12-31",
      trust: 91,
      tags: ["SLA", "service", "incident", "escalation"],
      question: "How are service issues and escalations handled?",
      answer:
        "Service issues are logged, categorized, assigned an owner, and managed through defined escalation paths. Response and resolution targets are aligned to the contracted service model. Major incidents include communication governance, root-cause review, remediation tracking, and client-facing updates as agreed.",
    },
    {
      id: "KB008",
      title: "Sub-custodian Network Governance",
      source: "Sub-Custodian Network Governance",
      owner: "Network Management",
      updated: "2026-02-16",
      expiry: "2026-09-30",
      trust: 88,
      tags: ["sub-custodian", "network", "market", "oversight"],
      question: "How is the sub-custodian network governed?",
      answer:
        "The sub-custodian network is governed through due diligence, risk assessment, market monitoring, contractual standards, and periodic review. Material network changes and market restrictions are assessed through governance forums and communicated according to client service arrangements.",
    },
  ];

  const defaultQuestions = [
    {
      id: "Q001",
      text: "Please describe how client assets are segregated from the firm's proprietary assets, including any omnibus account arrangements.",
      section: "Custody Controls",
      owner: "Custody SME",
      status: "review",
      tags: ["custody", "control"],
    },
    {
      id: "Q002",
      text: "Describe the NAV calculation process, price validation controls, exception handling, and approval workflow.",
      section: "Fund Accounting",
      owner: "Fund Accounting SME",
      status: "draft",
      tags: ["NAV", "valuation"],
    },
    {
      id: "Q003",
      text: "How do you protect confidential client data and ensure access is limited to authorized staff?",
      section: "Information Security",
      owner: "InfoSec",
      status: "review",
      tags: ["security", "client data"],
    },
    {
      id: "Q004",
      text: "What business continuity and disaster recovery capabilities are in place for critical custody and fund services?",
      section: "Operational Resilience",
      owner: "Operations Resilience",
      status: "draft",
      tags: ["BCP", "resilience"],
    },
    {
      id: "Q005",
      text: "Explain the KYC, AML, sanctions screening, and periodic review controls applied during onboarding and ongoing monitoring.",
      section: "Compliance",
      owner: "Compliance",
      status: "draft",
      tags: ["KYC", "AML", "compliance"],
    },
    {
      id: "Q006",
      text: "Can you guarantee zero regulatory reporting errors across all supported jurisdictions?",
      section: "Regulatory Reporting",
      owner: "Compliance",
      status: "changes",
      tags: ["regulatory", "reporting"],
    },
    {
      id: "Q007",
      text: "Please provide the service escalation model, incident response process, and expected response time for priority issues.",
      section: "Client Service",
      owner: "Client Service",
      status: "draft",
      tags: ["SLA", "incident"],
    },
    {
      id: "Q008",
      text: "Describe how the sub-custodian network is selected, monitored, reviewed, and communicated to clients.",
      section: "Network Management",
      owner: "Network Management",
      status: "draft",
      tags: ["sub-custodian", "network"],
    },
  ];

  let state;
  state = loadState();

  function mergeById(items) {
    const map = new Map();
    items.filter(Boolean).forEach((item) => {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    });
    return [...map.values()];
  }

  function baseKnowledge() {
    return mergeById([...knowledgeBase, ...((window.HSBC_AFME_PACK && window.HSBC_AFME_PACK.knowledge) || [])]).map(normalizeKnowledgeItem);
  }

  function baseQuestionTemplates() {
    return mergeById([...defaultQuestions, ...((window.HSBC_AFME_PACK && window.HSBC_AFME_PACK.questions) || [])]);
  }

  function loadState() {
    const baselineKb = baseKnowledge();
    const baselineQuestions = seedQuestions(baseQuestionTemplates());
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          kb: mergeById([...baselineKb, ...(parsed.kb || [])]).map(normalizeKnowledgeItem),
          questions: mergeById([...baselineQuestions, ...(parsed.questions || [])]).map(normalizeQuestion),
          selectedId: parsed.selectedId || "Q001",
          audit: parsed.audit || [],
          workflow: normalizeWorkflowState(parsed.workflow),
          mapping: normalizeMappingState(parsed.mapping),
          librarySearch: normalizeLibrarySearchState(parsed.librarySearch),
          questionView: parsed.questionView || "needs-action",
        };
      } catch (error) {
        console.warn("Failed to parse saved state", error);
      }
    }
    return {
      kb: baselineKb.map(normalizeKnowledgeItem),
      questions: baselineQuestions.map(normalizeQuestion),
      selectedId: "Q001",
      audit: [],
      workflow: normalizeWorkflowState(),
      mapping: normalizeMappingState(),
      librarySearch: normalizeLibrarySearchState(),
      questionView: "needs-action",
    };
  }

  function normalizeMappingState(saved = {}) {
    return {
      questionnaireName: saved.questionnaireName || "Alpha Securities DDQ 2026",
      clientName: saved.clientName || "Alpha Securities",
      questionnaireType: saved.questionnaireType || "DDQ",
      deadline: saved.deadline || "2026-06-28",
      detectedTemplateType: saved.detectedTemplateType || "Custom DDQ / RFP Template",
      readyForMatching: saved.readyForMatching ?? true,
      bestHistoricalId: saved.bestHistoricalId || "hist-alpha-custody-2025",
      historicalMatches: Array.isArray(saved.historicalMatches) ? saved.historicalMatches : [],
      autoFillProgress: saved.autoFillProgress || {},
      differenceReport: saved.differenceReport || {},
      lastRunAt: saved.lastRunAt || "",
    };
  }

  function normalizeLibrarySearchState(saved = {}) {
    return {
      globalQuery: saved.globalQuery || "",
      contextQuery: saved.contextQuery || "",
      contextQuestionId: saved.contextQuestionId || "Q001",
      savedCandidates: Array.isArray(saved.savedCandidates) ? saved.savedCandidates : [],
    };
  }

  function workflowConfig() {
    return window.AI_KUAIDA_WORKFLOW || { defaultMode: "standard", selectedTemplateId: "standard-four-step", stageLibrary: [], templates: [], stageTypes: {}, exportReadinessRules: [], reassignmentReasons: [] };
  }

  function normalizeWorkflowState(saved = {}) {
    const cfg = workflowConfig();
    return {
      mode: saved.mode || cfg.defaultMode || "standard",
      templateId: saved.templateId || cfg.selectedTemplateId || cfg.templates?.[0]?.id || "",
      customStages: Array.isArray(saved.customStages) ? saved.customStages : [],
      stageOverrides: saved.stageOverrides || {},
      reassignments: Array.isArray(saved.reassignments) ? saved.reassignments : seedReassignments(),
    };
  }

  function seedReassignments() {
    return [
      {
        item: "Q003 Data protection",
        originalOwner: "InfoSec SME A",
        reassignedTo: "Data Owner SME",
        scope: "Single Question",
        reason: "Data owner input required",
        acceptanceStatus: "Accepted",
        dueDate: "2026-06-15",
        pmAction: "Monitor",
        count: 1,
      },
      {
        item: "Q006 Regulatory reporting",
        originalOwner: "Compliance SME",
        reassignedTo: "Regulatory Reporting SME",
        scope: "Single Question",
        reason: "Need specialist input",
        acceptanceStatus: "Pending Acceptance",
        dueDate: "2026-06-16",
        pmAction: "Follow up",
        count: 1,
      },
      {
        item: "Information Security Section",
        originalOwner: "SME D",
        reassignedTo: "Vendor Risk SME",
        scope: "Entire Section",
        reason: "Product-specific expertise required",
        acceptanceStatus: "Declined",
        dueDate: "2026-06-17",
        pmAction: "Reassign",
        count: 2,
      },
    ];
  }

  function seedQuestions(templates) {
    return templates.map((item) => {
      const analyzed = analyzeQuestion(item.text);
      return {
        ...normalizeQuestion(item),
        draft: analyzed.draft,
        confidence: analyzed.confidence,
        risk: analyzed.risk,
        rules: analyzed.rules,
        matches: analyzed.matches,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function tokenize(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s/-]/gu, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1);
  }

  function unique(items) {
    return [...new Set(items.filter(Boolean))];
  }

  function isoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function daysUntil(dateText) {
    if (!dateText) return 9999;
    return Math.ceil((new Date(`${dateText}T00:00:00+08:00`) - APP_TODAY) / 86400000);
  }

  function inferSourceType(item) {
    const source = `${item.source || ""} ${item.sourceUrl || ""}`.toLowerCase();
    if (source.includes("hsbc.com") || source.includes("afme") || source.includes("official")) return "External Reliable Source";
    return "Internal Review";
  }

  function normalizeKnowledgeItem(item, index = 0) {
    const lastReview = item.lastReview || item.updated || isoDate(addDays(APP_TODAY, -30 - (index % 7) * 12));
    const sourceType = item.sourceType || inferSourceType(item);
    const nextReview = item.nextReview || item.expiry || isoDate(addDays(new Date(`${lastReview}T00:00:00+08:00`), sourceType === "External Reliable Source" ? 120 : 180));
    const contentStatus = item.contentStatus || (item.trust >= 82 && sourceType === "Internal Review" ? "Approved" : item.trust >= 72 ? "In Review" : "Draft");
    return {
      theme: item.theme || item.section || "General",
      section: item.section || item.theme || "General",
      sourceType,
      lastReview,
      nextReview,
      sme: item.sme || item.owner || "Unassigned SME",
      contentStatus,
      confidence: item.confidence || item.trust || 70,
      reviewHistory:
        item.reviewHistory ||
        [
          {
            by: item.owner || "System",
            action: sourceType === "Internal Review" ? "Initial approval record" : "Public-source intake",
            at: `${lastReview}T09:00:00+08:00`,
          },
        ],
      ...item,
    };
  }

  function normalizeQuestion(item) {
    return {
      answerRequired: item.answerRequired ?? true,
      sourceType: item.sourceType || "Pending Match",
      reviewComments: item.reviewComments || [],
      signoffBy: item.signoffBy || "",
      signoffAt: item.signoffAt || "",
      reviewStatus: item.reviewStatus || (statusMeta[item.status]?.label || "Draft"),
      historicalMatch: item.historicalMatch || null,
      libraryValidation: item.libraryValidation || null,
      bestAnswerSource: item.bestAnswerSource || item.sourceType || "Pending Match",
      suggestedAction: item.suggestedAction || "Run Matching",
      differenceFlag: item.differenceFlag || "Unmatched",
      reviewRequired: item.reviewRequired ?? true,
      autoFillStatus: item.autoFillStatus || "Not Filled",
      questionLibraryLinks: item.questionLibraryLinks || [],
      ...item,
    };
  }

  function getMatches(questionText) {
    const qTokens = tokenize(questionText);
    const activeKb = state && state.kb ? state.kb : baseKnowledge();
    return activeKb
      .map((item) => {
        const corpus = `${item.title} ${item.theme || ""} ${item.section || ""} ${item.question} ${item.answer} ${item.source || ""} ${item.tags.join(" ")}`;
        const kTokens = tokenize(corpus);
        const overlap = qTokens.filter((token) => kTokens.includes(token)).length;
        const keywordHits = item.tags.filter((tag) => questionText.toLowerCase().includes(tag.toLowerCase())).length;
        const score = Math.min(0.98, overlap * 0.075 + keywordHits * 0.16 + item.trust * 0.0025);
        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  function triggeredRules(text) {
    const haystack = (text || "").toLowerCase();
    return qualityRules
      .filter((rule) => rule.keywords.some((keyword) => haystack.includes(keyword.toLowerCase())))
      .map((rule) => rule.id);
  }

  function levelFromRules(ruleIds) {
    const rules = qualityRules.filter((rule) => ruleIds.includes(rule.id));
    if (rules.some((rule) => rule.severity === "high")) return "high";
    if (rules.some((rule) => rule.severity === "medium")) return "medium";
    return "low";
  }

  function analyzeQuestion(text) {
    const matches = getMatches(text);
    const best = matches[0];
    const ruleIds = triggeredRules(`${text} ${best?.answer || ""}`);
    const risk = levelFromRules(ruleIds);
    const penalty = risk === "high" ? 18 : risk === "medium" ? 8 : 0;
    const confidence = Math.max(38, Math.min(96, Math.round((best?.score || 0.36) * 100 + (best?.trust || 80) * 0.08 - penalty)));
    const draft = buildDraft(text, matches, risk);
    return { matches, rules: ruleIds, risk, confidence, draft };
  }

  function buildDraft(text, matches, risk) {
    const best = matches[0];
    if (!best || best.score < 0.26) {
      return [
        "We are reviewing the applicable operating model and approved response content for this question.",
        "A subject matter expert should confirm the final response before submission because the current knowledge base does not contain a sufficiently close approved answer.",
      ].join("\n\n");
    }

    const guardrail =
      risk === "high"
        ? "The final wording should be reviewed by the responsible SME and Compliance/InfoSec where applicable before client submission."
        : "The wording should be aligned to the contracted service model and reviewed by the responsible SME before final submission.";

    return `${best.answer}\n\n${guardrail}\n\nSource basis: ${best.source}.`;
  }

  function getSelectedQuestion() {
    return state.questions.find((question) => question.id === state.selectedId) || state.questions[0];
  }

  function addAudit(action, questionId) {
    state.audit.unshift({
      action,
      questionId,
      at: new Date().toISOString(),
    });
    state.audit = state.audit.slice(0, 80);
  }

  function confidenceClass(value) {
    if (value >= 78) return "good";
    if (value >= 58) return "medium";
    return "high-risk";
  }

  function workflowTemplateById(templateId) {
    const cfg = workflowConfig();
    return cfg.templates.find((template) => template.id === templateId) || cfg.templates[0] || { id: "", name: "No Workflow", stages: [] };
  }

  function activeWorkflowTemplate() {
    return workflowTemplateById(state.workflow?.templateId);
  }

  function libraryIdFromStageRef(ref) {
    return String(ref || "").split("::")[0];
  }

  function stageByLibraryId(id) {
    return workflowConfig().stageLibrary.find((stage) => stage.id === id);
  }

  function createStageRef(libraryId) {
    return `${libraryId}::${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function activeStageRefs() {
    const custom = state.workflow?.customStages || [];
    if (custom.length) return custom;
    return activeWorkflowTemplate().stages || [];
  }

  function activeWorkflowStages() {
    return activeStageRefs()
      .map((ref, index) => {
        const base = stageByLibraryId(libraryIdFromStageRef(ref));
        if (!base) return null;
        return {
          ...base,
          instanceId: ref,
          libraryId: base.id,
          stageNo: index + 1,
          displayName: state.workflow?.stageOverrides?.[ref] || base.name,
        };
      })
      .filter(Boolean);
  }

  function ensureCustomWorkflow() {
    state.workflow = normalizeWorkflowState(state.workflow);
    if (!state.workflow.customStages.length) {
      state.workflow.customStages = (activeWorkflowTemplate().stages || []).map((id) => createStageRef(id));
    }
    state.workflow.mode = "custom";
  }

  function currentWorkflowStageName() {
    const stages = activeWorkflowStages();
    if (!stages.length) return "No Workflow";
    const reviewIndex = stages.findIndex((stage) => stage.type === "Review");
    return stages[Math.max(0, reviewIndex)]?.displayName || stages[0].displayName;
  }

  function pct(value, total) {
    return total ? Math.round((value / total) * 100) : 0;
  }

  function avg(items, getter) {
    return items.length ? Math.round(items.reduce((sum, item) => sum + Number(getter(item) || 0), 0) / items.length) : 0;
  }

  function safeTheme(item) {
    return item.theme || item.section || "General";
  }

  function canonicalQuestionStatus(question) {
    if (question.signoffAt) return "Final Approved";
    if (question.status === "approved") return "SME Approved";
    if (question.status === "review") return "In SME Review";
    if (question.status === "changes") return "Rejected";
    if (question.draft) return "Auto Matched";
    return "Not Started";
  }

  function historicalQuestionnaireLibrary() {
    const kb = state?.kb || baseKnowledge();
    const standardQuestions = kb.slice(0, 24).map((item, index) => ({
      id: `H${String(index + 1).padStart(3, "0")}`,
      section: safeTheme(item),
      text: item.question || item.title,
      answer: item.answer,
      status: item.contentStatus === "Approved" ? "Approved" : "Submitted",
      submittedDate: index % 3 ? "2025-09-12" : "2025-06-18",
      owner: item.owner,
      tags: item.tags || [],
      sourceType: item.sourceType || "Historical",
      sourceName: item.source || item.title,
      reviewStatus: item.contentStatus || "Submitted",
    }));
    const baseHistorical = [
      {
        id: "hist-alpha-custody-2025",
        name: "Alpha Securities Custody DDQ 2025",
        client: "Alpha Securities",
        type: "DDQ",
        product: "Securities Services / Custody",
        region: "HK",
        submittedDate: "2025-09-12",
        answerQuality: 94,
        reuseSuccess: 91,
        questions: standardQuestions,
      },
      {
        id: "hist-alpha-fund-rfp-2024",
        name: "Alpha Securities Fund Services RFP 2024",
        client: "Alpha Securities",
        type: "RFP",
        product: "Fund Services",
        region: "APAC",
        submittedDate: "2024-11-03",
        answerQuality: 88,
        reuseSuccess: 84,
        questions: standardQuestions.slice(0, 18).map((item) => ({ ...item, submittedDate: "2024-11-03" })),
      },
      {
        id: "hist-global-afme-2025",
        name: "Global Custody AFME 2025",
        client: "Similar Client",
        type: "AFME",
        product: "Securities Services / Post Trade",
        region: "Global",
        submittedDate: "2025-06-18",
        answerQuality: 86,
        reuseSuccess: 79,
        questions: standardQuestions.slice(4).map((item) => ({ ...item, submittedDate: "2025-06-18" })),
      },
    ];
    return baseHistorical;
  }

  function textSimilarity(a, b) {
    const aTokens = unique(tokenize(a));
    const bTokens = unique(tokenize(b));
    if (!aTokens.length || !bTokens.length) return 0;
    const bSet = new Set(bTokens);
    const overlap = aTokens.filter((token) => bSet.has(token)).length;
    const union = unique([...aTokens, ...bTokens]).length;
    const contained = overlap / Math.min(aTokens.length, bTokens.length);
    const jaccard = overlap / union;
    return Math.round(Math.min(99, (contained * 0.68 + jaccard * 0.32) * 100));
  }

  function isNewerDate(a, b) {
    if (!a) return false;
    if (!b) return true;
    return new Date(`${a}T00:00:00+08:00`) > new Date(`${b}T00:00:00+08:00`);
  }

  function scoreHistoricalQuestionnaire(history) {
    const questions = state.questions || [];
    const sections = unique(questions.map((question) => question.section));
    const histSections = unique(history.questions.map((question) => question.section));
    const sectionOverlap = sections.length ? sections.filter((section) => histSections.includes(section)).length / sections.length : 0;
    const questionScores = questions.map((question) => {
      const best = history.questions.reduce((top, candidate) => {
        const score = textSimilarity(question.text, candidate.text);
        return score > top ? score : top;
      }, 0);
      return best;
    });
    const questionSimilarity = questionScores.length ? avg(questionScores, (score) => score) : 0;
    const sameClient = history.client === state.mapping.clientName;
    const sameType = history.type === state.mapping.questionnaireType;
    const recencyBoost = Math.max(0, 18 - Math.floor(daysUntil(history.submittedDate) / -60));
    const score = Math.min(99, Math.round(questionSimilarity * 0.52 + sectionOverlap * 18 + (sameClient ? 12 : 0) + (sameType ? 8 : 0) + history.answerQuality * 0.06 + history.reuseSuccess * 0.04 + recencyBoost * 0.2));
    const reusable = questionScores.filter((scoreValue) => scoreValue >= 75).length;
    return { ...history, similarity: score, sameClient, reusableAnswers: reusable };
  }

  function bestHistoricalQuestionMatch(question, history) {
    const best = (history.questions || [])
      .map((candidate) => ({ ...candidate, similarity: textSimilarity(question.text, candidate.text) }))
      .sort((a, b) => b.similarity - a.similarity)[0];
    if (!best || best.similarity < 50) return null;
    const matchType = best.similarity >= 94 ? "Exact Match" : best.similarity >= 82 ? "Highly Similar" : best.similarity >= 62 ? "Modified / Partial Match" : "New Questions";
    return {
      questionId: best.id,
      questionText: best.text,
      answer: best.answer,
      similarity: best.similarity,
      matchType,
      submittedDate: best.submittedDate || history.submittedDate,
      status: best.status || "Submitted",
      historicalQuestionnaire: history.name,
      sourceId: history.id,
      sourceName: history.name,
    };
  }

  function validateAgainstLibrary(question, historicalMatch) {
    const candidates = getMatches(question.text).filter((item) => item.contentStatus === "Approved" || item.contentStatus === "In Review");
    const best = candidates[0];
    if (!best) return { status: "No Knowledge Hub Match", recommendedItem: null, message: "No matching content was found in the Knowledge Hub" };
    const isApproved = best.contentStatus === "Approved";
    const newer = historicalMatch ? isNewerDate(best.lastReview || best.updated, historicalMatch.submittedDate) : true;
    if (historicalMatch && newer && isApproved) {
      return {
        status: "Newer Approved Answer Available",
        recommendedItem: best,
        message: `A newer approved Knowledge Hub answer is available. Historical answer submission date: ${historicalMatch.submittedDate}. Knowledge Hub answer review date: ${best.lastReview || best.updated}.`,
      };
    }
    if (historicalMatch && best.answer && historicalMatch.answer && textSimilarity(best.answer, historicalMatch.answer) < 42) {
      return { status: "Conflict Detected", recommendedItem: best, message: "The historical answer differs from the Knowledge Hub standard answer. Compare or SME Review is recommended." };
    }
    if (historicalMatch && daysUntil(historicalMatch.submittedDate) < -365) {
      return { status: "Historical Answer Needs Review", recommendedItem: best, message: "The historical answer has passed the review threshold and requires Library validation." };
    }
    if (isApproved) return { status: "Approved Answer Recommended", recommendedItem: best, message: "A prioritised Approved Answer is available in the Knowledge Hub." };
    return { status: "Historical Answer Valid", recommendedItem: best, message: "The historical answer remains suitable as a draft basis; no stronger Approved Answer is currently available in the Knowledge Hub." };
  }

  function suggestedUseFromResult(result, question) {
    if (result.reviewStatus === "Expired" || result.reviewStatus === "Draft") return "Do Not Use";
    if (question?.risk === "high") return "SME Review Required";
    if (result.similarity >= 90 && result.reviewStatus === "Approved") return "Direct Use";
    if (result.similarity >= 75) return "Use with Edits";
    return "SME Review Required";
  }

  function runHistoricalMapping({ autoFill = true, preserveExistingDraft = true } = {}) {
    if (!state.questions.length) return;
    const historicalMatches = historicalQuestionnaireLibrary().map(scoreHistoricalQuestionnaire).sort((a, b) => b.similarity - a.similarity);
    const bestHistory = historicalMatches[0];
    state.mapping.historicalMatches = historicalMatches.map((item) => ({
      id: item.id,
      name: item.name,
      client: item.client,
      type: item.type,
      submittedDate: item.submittedDate,
      similarity: item.similarity,
      sameClient: item.sameClient,
      reusableAnswers: item.reusableAnswers,
      totalAnswers: item.questions.length,
    }));
    state.mapping.bestHistoricalId = bestHistory?.id || "";

    state.questions.forEach((question) => {
      const historicalMatch = bestHistory ? bestHistoricalQuestionMatch(question, bestHistory) : null;
      const validation = validateAgainstLibrary(question, historicalMatch);
      const libraryItem = validation.recommendedItem;
      const highRisk = question.risk === "high";
      let source = "AI Draft";
      let suggestedAction = "AI Draft";
      let autoFillStatus = "Draft Only";
      let reviewRequired = true;
      let chosenAnswer = question.draft || "";

      if (libraryItem && validation.status === "Newer Approved Answer Available") {
        source = "Latest Approved Knowledge Hub Answer";
        suggestedAction = "Replace with Approved Answer";
        chosenAnswer = libraryItem.answer;
        autoFillStatus = highRisk ? "Draft Only" : "Filled";
        reviewRequired = highRisk;
      } else if (historicalMatch && historicalMatch.matchType === "Exact Match" && historicalMatch.status !== "Draft" && bestHistory.sameClient && historicalMatch.similarity >= 94) {
        source = "Same Client + Recent Historical Submitted Answer";
        suggestedAction = highRisk ? "SME Review" : "Auto-fill";
        chosenAnswer = historicalMatch.answer;
        autoFillStatus = highRisk ? "Draft Only" : "Filled";
        reviewRequired = highRisk;
      } else if (libraryItem && libraryItem.contentStatus === "Approved" && (historicalMatch?.similarity || 0) >= 90) {
        source = "Approved Standard Answer";
        suggestedAction = "Auto-fill / Review Recommended";
        chosenAnswer = libraryItem.answer;
        autoFillStatus = "Draft Only";
        reviewRequired = true;
      } else if (historicalMatch && historicalMatch.similarity >= 75) {
        source = "Similar Historical Answer";
        suggestedAction = "Review";
        chosenAnswer = historicalMatch.answer;
        autoFillStatus = "Draft Only";
        reviewRequired = true;
      } else if (libraryItem) {
        source = libraryItem.sourceType === "External Reliable Source" ? "Golden Source Based Answer" : "Semantic Search Candidate";
        suggestedAction = "Search Hub";
        chosenAnswer = libraryItem.answer;
        autoFillStatus = "Draft Only";
        reviewRequired = true;
      }

      question.historicalMatch = historicalMatch;
      question.libraryValidation = {
        status: validation.status,
        message: validation.message,
        libraryItemId: libraryItem?.id || "",
        libraryTitle: libraryItem?.title || "",
        libraryReviewDate: libraryItem?.lastReview || libraryItem?.updated || "",
      };
      question.bestAnswerSource = source;
      question.suggestedAction = suggestedAction;
      question.differenceFlag = historicalMatch?.matchType || "New Questions";
      question.reviewRequired = reviewRequired;
      question.autoFillStatus = autoFillStatus;
      question.sourceType = source;
      question.questionLibraryLinks = libraryItem
        ? [
            {
              knowledgeItemId: libraryItem.id,
              title: libraryItem.title,
              similarity: Math.round((libraryItem.score || 0) * 100),
              validationStatus: validation.status,
              linkedAt: new Date().toISOString(),
            },
          ]
        : question.questionLibraryLinks || [];

      if (autoFill && chosenAnswer && (!preserveExistingDraft || !question.draft || question.autoFillStatus === "Not Filled")) {
        question.draft = `${chosenAnswer}\n\nSource basis: ${source}${historicalMatch ? ` · ${historicalMatch.sourceName}` : libraryItem ? ` · ${libraryItem.source}` : ""}.`;
      }
      if (reviewRequired && question.status !== "approved") {
        question.status = highRisk ? "review" : question.status || "draft";
        question.reviewStatus = highRisk ? "SME Review Required" : "Review Recommended";
      }
    });

    state.mapping.autoFillProgress = buildAutofillProgress();
    state.mapping.differenceReport = buildDifferenceReport();
    state.mapping.lastRunAt = new Date().toISOString();
    addAudit("Run Historical Mapping and Knowledge Validation", "ALL");
  }

  function buildAutofillProgress() {
    const questions = state.questions;
    return {
      historical: questions.filter((q) => /Historical/.test(q.bestAnswerSource || "") && q.autoFillStatus === "Filled").length,
      replacedByLibrary: questions.filter((q) => q.libraryValidation?.status === "Newer Approved Answer Available").length,
      draftSimilar: questions.filter((q) => q.autoFillStatus === "Draft Only" && q.differenceFlag !== "New Questions").length,
      semanticSearch: questions.filter((q) => q.suggestedAction === "Search Hub").length,
      aiDraft: questions.filter((q) => q.suggestedAction === "AI Draft").length,
      blockedSme: questions.filter((q) => q.reviewRequired || q.risk === "high").length,
    };
  }

  function buildDifferenceReport() {
    const total = state.questions.length || 1;
    const exact = state.questions.filter((q) => q.differenceFlag === "Exact Match").length;
    const similar = state.questions.filter((q) => q.differenceFlag === "Highly Similar").length;
    const modified = state.questions.filter((q) => q.differenceFlag === "Modified / Partial Match").length;
    const newQuestions = state.questions.filter((q) => q.differenceFlag === "New Questions" || !q.historicalMatch).length;
    const removed = Math.max(0, ((state.mapping.historicalMatches || [])[0]?.totalAnswers || 0) - total + newQuestions);
    const autoFillReady = state.questions.filter((q) => q.autoFillStatus === "Filled").length;
    const needsSme = state.questions.filter((q) => q.reviewRequired).length;
    const needsNewDraft = state.questions.filter((q) => q.suggestedAction === "AI Draft").length;
    const overall = Math.round((exact * 1 + similar * 0.86 + modified * 0.58) / total * 100);
    return { overallSimilarity: overall, exact, similar, modified, newQuestions, removed, autoFillReady, needsSme, needsNewDraft };
  }

  function ensureQuestionnaireMapping() {
    if (!state.mapping.lastRunAt) {
      runHistoricalMapping({ autoFill: true, preserveExistingDraft: false });
    } else if (state.questions.some((q) => !q.libraryValidation)) {
      runHistoricalMapping({ autoFill: true, preserveExistingDraft: true });
    }
  }

  function libraryStats() {
    const total = state.kb.length || 1;
    const approved = state.kb.filter((item) => item.contentStatus === "Approved").length;
    const golden = state.kb.filter((item) => item.sourceType === "External Reliable Source").length;
    const smeReviewed = state.kb.filter((item) => item.sourceType === "Internal Review" && item.contentStatus === "Approved").length;
    const needsReview = state.kb.filter((item) => item.contentStatus === "In Review" || item.contentStatus === "Needs Review" || daysUntil(item.nextReview) <= 45).length;
    const expired = state.kb.filter((item) => item.contentStatus === "Expired" || daysUntil(item.nextReview) < 0).length;
    const avgConfidence = avg(state.kb, (item) => item.confidence || item.trust);
    const targetTopics = Math.max(10, (window.AI_KUAIDA_GOVERNANCE?.dropdowns?.themes || []).length);
    const coveredTopics = unique(state.kb.map(safeTheme)).length;
    const healthScore = Math.max(0, Math.min(100, Math.round(avgConfidence * 0.45 + (approved / total) * 35 + ((total - needsReview) / total) * 20)));
    return {
      total,
      approved,
      golden,
      smeReviewed,
      needsReview,
      expired,
      avgConfidence,
      targetTopics,
      coveredTopics,
      topicCoverage: pct(coveredTopics, targetTopics),
      healthScore,
    };
  }

  function buildQuestionnairePortfolio() {
    const total = state.questions.length || 1;
    const approved = state.questions.filter((q) => q.status === "approved").length;
    const review = state.questions.filter((q) => q.status === "review").length;
    const highRisk = state.questions.filter((q) => q.risk === "high").length;
    const avgConfidence = avg(state.questions, (q) => q.confidence);
    const completion = pct(approved, total);
    return [
      {
        id: "WQ-001",
        name: "Alpha Securities DDQ 2026",
        client: "Alpha Securities",
        business: "BBD / AOM",
        requestType: "DDQ",
        market: "Hong Kong",
        clientDomicile: "Hong Kong",
        documentType: "Word Questionnaire",
        type: "DDQ / Word",
        owner: "RFP Project PM",
        dueDate: "2026-06-28",
        status: "Stakeholders Reviewing",
        workflowTemplate: activeWorkflowTemplate().name,
        stage: currentWorkflowStageName(),
        total,
        matched: state.questions.filter((q) => q.matches?.length).length,
        review,
        highRisk,
        completion,
        confidence: avgConfidence,
        updatedAt: "2026-06-07 19:58",
        updatedBy: "RFP Project PM",
        tags: ["#Client:Alpha", "#Type:DDQ", "#Market:HK"],
      },
      {
        id: "WQ-002",
        name: "AFME Post Trade DDQ 2026 - HK Branch",
        client: "HSBC HK Branch perspective",
        business: "Securities Services",
        requestType: "AFME DDQ",
        market: "Hong Kong",
        clientDomicile: "Hong Kong",
        documentType: "Excel Template",
        type: "AFME Excel",
        owner: "Securities Services PM",
        dueDate: "2026-07-05",
        status: "Drafting",
        workflowTemplate: "Simple 3-Step Review",
        stage: "Draft Generated",
        total: Math.max(28, total),
        matched: Math.max(24, Math.min(28, total + 12)),
        review: review + 3,
        highRisk: highRisk + 2,
        completion: Math.max(62, completion),
        confidence: Math.max(82, avgConfidence),
        updatedAt: "2026-06-07 18:40",
        updatedBy: "Securities Services PM",
        tags: ["#Template:AFME2026", "#Source:HSBC", "#Market:HK"],
      },
      {
        id: "WQ-003",
        name: "Global Custody RFP Renewal",
        client: "Global Asset Manager",
        business: "BBD",
        requestType: "RFP",
        market: "APAC",
        clientDomicile: "Singapore",
        documentType: "Excel Questionnaire",
        type: "RFP / Excel",
        owner: "Client Manager",
        dueDate: "2026-07-18",
        status: "Parsing",
        workflowTemplate: "High Risk Regulatory Workflow",
        stage: "Parsed",
        total: 146,
        matched: 91,
        review: 21,
        highRisk: 8,
        completion: 34,
        confidence: 76,
        updatedAt: "2026-06-06 16:15",
        updatedBy: "Client Manager",
        tags: ["#Product:Custody", "#Region:APAC", "#Lifecycle:New"],
      },
    ];
  }

  function buildMyTasks() {
    const offsets = [-1, 1, 2, 3, 5, 8, 13, 21];
    return state.questions.slice(0, 14).map((question, index) => {
      const dueDate = isoDate(addDays(APP_TODAY, offsets[index % offsets.length]));
      const priority = question.risk === "high" ? "High" : question.risk === "medium" || question.confidence < 75 ? "Medium" : "Normal";
      const taskType =
        question.risk === "high"
          ? "Risk / Compliance Review"
          : question.status === "review"
          ? "SME Review"
          : question.status === "changes"
          ? "Revision Required"
          : "Draft Confirmation";
      return {
        id: `TASK-${String(index + 1).padStart(3, "0")}`,
        taskType,
        question,
        questionnaire: index % 2 ? "AFME Post Trade DDQ 2026" : "Alpha Securities DDQ 2026",
        priority,
        dueDate,
        status: canonicalQuestionStatus(question),
        action: question.status === "approved" ? "Ready for export" : question.status === "review" ? "Review answer" : "Open workbench",
      };
    });
  }

  function processTimelineSteps(currentStage = currentWorkflowStageName()) {
    const stages = activeWorkflowStages();
    const currentIndex = Math.max(0, stages.findIndex((stage) => stage.displayName === currentStage || stage.name === currentStage));
    return stages
      .map((stage, index) => {
        const className = index < currentIndex ? "done" : index === currentIndex ? "current" : "";
        return `
          <span class="process-step ${className}">
            <strong>${escapeHtml(stage.displayName)}</strong>
            <em>${escapeHtml(stage.type)} · ${stage.mandatory ? "Mandatory" : "Optional"}</em>
          </span>
        `;
      })
      .join("");
  }

  function processTimelineMarkup(currentStage = currentWorkflowStageName()) {
    return `<div class="process-timeline">${processTimelineSteps(currentStage)}</div>`;
  }

  function barSeriesMarkup(title, groups, total) {
    const rows = Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => {
        const width = Math.max(6, pct(value, total));
        return `
          <div class="bar-row">
            <span>${escapeHtml(label)}</span>
            <div class="bar-track"><i style="width:${width}%"></i></div>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `;
      })
      .join("");
    return `<article class="bar-card"><h3>${escapeHtml(title)}</h3>${rows}</article>`;
  }

  function renderAll() {
    ensureQuestionnaireMapping();
    renderWorkspaceDashboard();
    renderWorkflowSetup();
    renderAssignmentDashboard();
    renderMyQuestionnaires();
    renderMetrics();
    renderQuestionnaireOverview();
    renderMappingDashboard();
    renderLibrarySearchPanels();
    renderQuestions();
    renderInspector();
    renderLibrary();
    renderTopicLibrary();
    renderGoldenSourceLibrary();
    renderSmeReviewedLibrary();
    renderCompletedQuestionnaireLibrary();
    renderLibraryGovernanceExtras();
    renderHealth();
    renderApprovals();
    renderRiskCenter();
    renderRiskSignals();
    renderRules();
    renderOffice();
    renderPreview();
    renderHealthDashboard();
    renderNotifications();
    renderRoles();
    renderGovernance();
    renderDataModel();
    renderInsights();
    persist();
  }

  function renderMetrics() {
    const total = state.questions.length || 1;
    const approved = state.questions.filter((q) => q.status === "approved").length;
    const review = state.questions.filter((q) => q.status === "review").length;
    const highRisk = state.questions.filter((q) => q.risk === "high").length;
    const avgConfidence = Math.round(state.questions.reduce((sum, q) => sum + (q.confidence || 0), 0) / total);
    const progress = Math.round((approved / total) * 100);
    const autoFilled = state.questions.filter((q) => q.autoFillStatus === "Filled").length;
    const newerLibrary = state.questions.filter((q) => q.libraryValidation?.status === "Newer Approved Answer Available").length;
    const needsSearch = state.questions.filter((q) => q.suggestedAction === "Search Hub").length;
    const diff = state.mapping.differenceReport || {};

    document.getElementById("metricGrid").innerHTML = [
      metric("Historical Similarity", `${diff.overallSimilarity || 0}%`, "Overall similarity to historical questionnaire"),
      metric("Auto-filled", `${autoFilled}/${total}`, "From historical questionnaire or latest Library"),
      metric("Newer Approved Content", newerLibrary, "Can be replaced by a newer Approved Answer"),
      metric("Needs SME", review + highRisk, "High risk or requires manual confirmation"),
      metric("Needs Search", needsSearch, "Move to Knowledge Hub search or semantic retrieval"),
      metric("AI Draft Needed", diff.needsNewDraft || 0, "Use AI only where no trusted match exists"),
      metric("Average Confidence", `${avgConfidence}%`, "Based on match quality, source reliability and risk deductions"),
      metric("Highrisk", highRisk, "Compliance, security and absolute wording"),
    ].join("");

    document.getElementById("progressText").textContent = `${progress}%`;
    document.getElementById("progressBar").style.width = `${progress}%`;
    const stageBadge = document.getElementById("projectStage");
    if (stageBadge) stageBadge.textContent = currentWorkflowStageName();
    renderWorkbenchSummary({ total, approved, review, highRisk, avgConfidence, progress });
  }

  function metric(label, value, note) {
    return `<article class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><em>${escapeHtml(note)}</em></article>`;
  }

  function renderWorkbenchSummary(summary) {
    const el = document.getElementById("workbenchSummary");
    if (!el) return;
    const sections = unique(state.questions.map((q) => q.section)).length;
    const best = (state.mapping.historicalMatches || [])[0];
    el.innerHTML = [
      ["Project Name", "Alpha Securities DDQ 2026"],
      ["Client Name", state.mapping.clientName],
      ["Questionnaire Type", state.mapping.questionnaireType],
      ["Detected Template", state.mapping.detectedTemplateType],
      ["Total Sections", sections],
      ["Total Questions", summary.total],
      ["Best Historical Match", best?.name || "--"],
      ["Workflow Template", activeWorkflowTemplate().name],
      ["Current Stage", currentWorkflowStageName()],
      ["Due Date", "2026-06-28"],
      ["Owner", "RFP Project PM"],
      ["Overall Progress", `${summary.progress}%`],
      ["Average Confidence", `${summary.avgConfidence}%`],
      ["High Risk Count", summary.highRisk],
      ["Pending SME Review", summary.review],
      ["Export Status", summary.approved === summary.total ? "Ready" : "Preview"],
    ]
      .map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
      .join("");
  }

  function renderMappingDashboard() {
    const summaryEl = document.getElementById("historicalMatchSummary");
    const progressEl = document.getElementById("autofillProgress");
    const reportEl = document.getElementById("differenceReport");
    if (!summaryEl && !progressEl && !reportEl) return;
    const best = (state.mapping.historicalMatches || [])[0];
    if (summaryEl) {
      const matches = (state.mapping.historicalMatches || []).slice(0, 3);
      summaryEl.innerHTML = [
        `<article class="match-summary-card best">
          <span>Best Historical Match</span>
          <strong>${escapeHtml(best?.name || "No match yet")}</strong>
          <p>${best ? `Overall similarity ${best.similarity}% · ${best.sameClient ? "Same Client" : "Similar Client"} · Submitted ${best.submittedDate}` : "Upload or run matching to find similar completed questionnaires."}</p>
          <div class="tag-row">
            <span class="tag">Reusable ${escapeHtml(best?.reusableAnswers || 0)} / ${escapeHtml(best?.totalAnswers || 0)}</span>
            <span class="tag">Ready for Matching</span>
          </div>
        </article>`,
        ...matches.map(
          (item) => `
            <article class="match-summary-card">
              <span>${escapeHtml(item.client)} · ${escapeHtml(item.type)}</span>
              <strong>${escapeHtml(item.name)}</strong>
              <p>Similarity ${item.similarity}% · Submitted ${escapeHtml(item.submittedDate)} · Reusable ${item.reusableAnswers}/${item.totalAnswers}</p>
              <button data-action="compare-historical" data-history="${escapeHtml(item.id)}">Compare</button>
            </article>
          `
        ),
      ].join("");
    }

    if (progressEl) {
      const progress = state.mapping.autoFillProgress || {};
      const rows = [
        ["Auto-filled from Historical", progress.historical || 0],
        ["Replaced by Newer Approved Content Answer", progress.replacedByLibrary || 0],
        ["Draft from Similar Answer", progress.draftSimilar || 0],
        ["Needs Semantic Search", progress.semanticSearch || 0],
        ["Needs AI Draft", progress.aiDraft || 0],
        ["Blocked / Needs SME", progress.blockedSme || 0],
      ];
      progressEl.innerHTML = rows.map(([label, value]) => `<article class="autofill-tile"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`).join("");
    }

    if (reportEl) {
      const report = state.mapping.differenceReport || {};
      const newQuestions = state.questions.filter((q) => q.differenceFlag === "New Questions" || !q.historicalMatch).slice(0, 3);
      const modified = state.questions.filter((q) => q.differenceFlag === "Modified / Partial Match").slice(0, 3);
      reportEl.innerHTML = `
        <div class="difference-kpis">
          ${[
            ["Overall Similarity", `${report.overallSimilarity || 0}%`],
            ["Exact Match Questions", report.exact || 0],
            ["Highly Similar Questions", report.similar || 0],
            ["Modified Questions", report.modified || 0],
            ["New Questions", report.newQuestions || 0],
            ["Removed Questions", report.removed || 0],
            ["Auto-fill Ready", report.autoFillReady || 0],
            ["Needs SME Review", report.needsSme || 0],
            ["Needs New Draft", report.needsNewDraft || 0],
          ]
            .map(([label, value]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`)
            .join("")}
        </div>
        <div class="difference-lists">
          <article>
            <strong>New Questions</strong>
            ${(newQuestions.length ? newQuestions : state.questions.slice(0, 2))
              .map((q) => `<p>${escapeHtml(q.id)} · ${escapeHtml(q.section)} · ${escapeHtml(q.text)} <span>${escapeHtml(q.suggestedAction || "Search Hub")}</span></p>`)
              .join("")}
          </article>
          <article>
            <strong>Modified Questions</strong>
            ${(modified.length ? modified : state.questions.slice(0, 2))
              .map((q) => `<p>${escapeHtml(q.id)} · ${escapeHtml(q.historicalMatch?.questionText || "Historical question differs")} -> ${escapeHtml(q.suggestedAction || "SME Review")}</p>`)
              .join("")}
          </article>
        </div>
      `;
      portfolioEl.innerHTML = `
        <div class="table-wrap flat-table-wrap">
          <table class="portfolio-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Project Name</th>
                <th>Business</th>
                <th>Request Type</th>
                <th>Market</th>
                <th>Client Domicile</th>
                <th>Project Owner</th>
                <th>Status</th>
                <th>External Deadline</th>
                <th>Last Updated By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${portfolio
                .map(
                  (item) => `
                    <tr>
                      <td>${escapeHtml(item.client)}</td>
                      <td class="question-cell"><strong>${escapeHtml(item.name)}</strong><span>${item.tags.map((tag) => escapeHtml(tag)).join(" · ")}</span></td>
                      <td>${escapeHtml(item.business || "Business")}</td>
                      <td>${escapeHtml(item.requestType || item.type)}</td>
                      <td>${escapeHtml(item.market || "Global")}</td>
                      <td>${escapeHtml(item.clientDomicile || "Not captured")}</td>
                      <td>${escapeHtml(item.owner)}</td>
                      <td><span class="status-pill review">${escapeHtml(item.status)}</span></td>
                      <td>${escapeHtml(item.dueDate)}</td>
                      <td>${escapeHtml(item.updatedBy || "System")}</td>
                      <td><button data-open-workbench="${escapeHtml(item.id)}">Open Recommendation</button></td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  function recommendationScore(similarity, item = {}, question = null) {
    const approvedBoost = item.contentStatus === "Approved" || item.reviewStatus === "Approved" ? 12 : 0;
    const sourceBoost = item.sourceType === "External Reliable Source" || item.sourceType === "Golden Source" ? 7 : item.sourceType === "Internal Review" || item.sourceType === "Approved Answers" ? 10 : 5;
    const recencyBoost = daysUntil(item.lastReview || item.sourceDate || item.submittedDate) > -180 ? 8 : 2;
    const sameClientBoost = item.sameClient || item.client === state.mapping.clientName ? 8 : 0;
    const riskPenalty = question?.risk === "high" && item.contentStatus !== "Approved" && item.reviewStatus !== "Approved" ? -10 : 0;
    return Math.max(0, Math.min(99, Math.round(similarity * 0.68 + approvedBoost + sourceBoost + recencyBoost + sameClientBoost + riskPenalty)));
  }

  function searchLibrary(query, question = null) {
    const searchText = (query || question?.text || "").trim();
    if (!searchText) return [];
    const kbResults = state.kb.map((item) => {
      const corpus = `${item.title} ${item.question || ""} ${item.answer || ""} ${safeTheme(item)} ${item.source || ""} ${(item.tags || []).join(" ")}`;
      const similarity = textSimilarity(searchText, corpus);
      const reviewStatus = item.contentStatus || "Needs Review";
      const result = {
        id: `kb-${item.id}`,
        kbId: item.id,
        title: item.title,
        matchedQuestion: item.question || item.title,
        answerPreview: item.answer,
        similarity,
        sourceType: item.sourceType === "External Reliable Source" ? "Golden Source" : "Approved Answers",
        sourceName: item.source,
        reviewStatus,
        lastReviewed: item.lastReview || item.updated || "--",
        nextReview: item.nextReview || "--",
        governanceStatus: reviewStatus,
        sourceDate: item.updated || item.lastReview || "--",
        owner: item.owner || item.sme,
        tags: item.tags || [],
        usageCount: item.usageCount || Math.max(1, Math.round((item.trust || 70) / 12)),
        raw: item,
      };
      result.recommendation = recommendationScore(similarity, item, question);
      result.suggestedUse = suggestedUseFromResult(result, question);
      return result;
    });
    const historicalResults = historicalQuestionnaireLibrary().flatMap((history) =>
      history.questions.map((item) => {
        const similarity = textSimilarity(searchText, `${item.text} ${item.answer} ${item.section} ${(item.tags || []).join(" ")}`);
        const result = {
          id: `hist-${history.id}-${item.id}`,
          historyId: history.id,
          title: `${history.name} · ${item.id}`,
          matchedQuestion: item.text,
          answerPreview: item.answer,
          similarity,
          sourceType: "Historical",
          sourceName: history.name,
          reviewStatus: item.status || "Submitted",
          lastReviewed: item.submittedDate || history.submittedDate,
          nextReview: "--",
          governanceStatus: item.status || "Submitted",
          sourceDate: history.submittedDate,
          owner: item.owner || "Historical Owner",
          tags: item.tags || [],
          usageCount: history.reuseSuccess || 1,
          sameClient: history.client === state.mapping.clientName,
          raw: item,
        };
        result.recommendation = recommendationScore(similarity, result, question);
        result.suggestedUse = suggestedUseFromResult(result, question);
        return result;
      })
    );
    return [...kbResults, ...historicalResults]
      .filter((result) => result.similarity >= 35)
      .sort((a, b) => b.recommendation - a.recommendation || b.similarity - a.similarity)
      .slice(0, 10);
  }

  function matchQualityLabel(score) {
    if (score >= 90) return ["Highly Similar", "low"];
    if (score >= 75) return ["Good Match", "medium"];
    if (score >= 60) return ["Possible Match", "high"];
    return ["Low Match", "draft"];
  }

  function searchResultCard(result) {
    const [label, className] = matchQualityLabel(result.similarity);
    return `
      <article class="search-result-card">
        <div class="search-result-head">
          <div>
            <strong>${escapeHtml(result.title)}</strong>
            <span>${escapeHtml(result.sourceType)} · ${escapeHtml(result.sourceName)}</span>
          </div>
          <div class="search-score-box">
            <span class="risk-pill ${className}">${result.similarity}% ${escapeHtml(label)}</span>
            <span class="tag">Recommended ${result.recommendation}%</span>
          </div>
        </div>
        <p><b>Matched Question:</b> ${escapeHtml(result.matchedQuestion)}</p>
        <p><b>Answer Preview:</b> ${escapeHtml((result.answerPreview || "").slice(0, 260))}${(result.answerPreview || "").length > 260 ? "..." : ""}</p>
        <div class="mini-meta">
          <span class="tag">Governance ${escapeHtml(result.governanceStatus || result.reviewStatus)}</span>
          <span class="tag">Last ${escapeHtml(result.lastReviewed)}</span>
          <span class="tag">Next ${escapeHtml(result.nextReview || "--")}</span>
          <span class="tag">Source ${escapeHtml(result.sourceDate)}</span>
          <span class="tag">Owner ${escapeHtml(result.owner)}</span>
          <span class="tag">Usage ${escapeHtml(result.usageCount)}</span>
          <span class="tag">Risk ${escapeHtml(result.suggestedUse === "Direct Use" ? "No blocking issue" : "Review required")}</span>
          <span class="tag">${escapeHtml(result.suggestedUse)}</span>
        </div>
        <div class="tag-row">${(result.tags || []).slice(0, 7).map((tag) => `<span class="tag">#${escapeHtml(tag).replace(/^#/, "")}</span>`).join("")}</div>
        <div class="search-actions">
          <button data-search-action="view" data-result-id="${escapeHtml(result.id)}">View</button>
          <button data-search-action="compare" data-result-id="${escapeHtml(result.id)}">Compare</button>
          <button data-search-action="insert" data-result-id="${escapeHtml(result.id)}">Insert Answer</button>
          <button data-search-action="insert-source" data-result-id="${escapeHtml(result.id)}">Insert with Source</button>
          <button data-search-action="replace" data-result-id="${escapeHtml(result.id)}">Replace Current Draft</button>
          <button data-search-action="save" data-result-id="${escapeHtml(result.id)}">Save as Candidate</button>
          <button data-search-action="sme" data-result-id="${escapeHtml(result.id)}">Send to SME Review</button>
          <button data-search-action="open-source" data-result-id="${escapeHtml(result.id)}">Open Source</button>
          <button data-search-action="not-relevant" data-result-id="${escapeHtml(result.id)}">Mark Not Relevant</button>
        </div>
      </article>
    `;
  }

  function renderLibrarySearchPanels() {
    const globalInput = document.getElementById("globalLibrarySearchInput");
    const globalResults = document.getElementById("globalLibrarySearchResults");
    const contextInput = document.getElementById("contextLibrarySearchInput");
    const contextResults = document.getElementById("contextLibrarySearchResults");
    const selected = getSelectedQuestion();
    if (globalInput && !globalInput.value && state.librarySearch.globalQuery) globalInput.value = state.librarySearch.globalQuery;
    if (contextInput && !contextInput.value) contextInput.value = state.librarySearch.contextQuery || selected?.text || "";
    if (globalResults) {
      const results = searchLibrary(state.librarySearch.globalQuery || "", null);
      globalResults.innerHTML = results.length ? results.map(searchResultCard).join("") : `<div class="empty-state">Enter keywords to search approved thematic content, sources, product-owner answers and historical questionnaires.</div>`;
    }
    if (contextResults) {
      const results = searchLibrary(state.librarySearch.contextQuery || selected?.text || "", selected);
      contextResults.innerHTML = results.length ? results.map(searchResultCard).join("") : `<div class="empty-state">Select a question to find a better answer in one click.</div>`;
    }
  }

  function findSearchResultById(resultId) {
    const question = getSelectedQuestion();
    const candidates = [
      ...searchLibrary(state.librarySearch.contextQuery || question?.text || "", question),
      ...searchLibrary(state.librarySearch.globalQuery || "", null),
      ...searchLibrary(question?.text || "", question),
    ];
    return candidates.find((result) => result.id === resultId);
  }

  function applySearchResult(resultId, action) {
    const question = getSelectedQuestion();
    const result = findSearchResultById(resultId);
    if (!question || !result) return;
    const answer = action === "insert-source" ? `${result.answerPreview}\n\nSource basis: ${result.sourceType} · ${result.sourceName}.` : result.answerPreview;
    if (action === "insert" || action === "insert-source" || action === "replace") {
      question.draft = answer;
      question.bestAnswerSource = result.sourceType;
      question.sourceType = result.sourceType;
      question.suggestedAction = result.suggestedUse === "Direct Use" ? "Review / Finalize" : "SME Review";
      question.reviewRequired = result.suggestedUse !== "Direct Use" || question.risk === "high";
      question.autoFillStatus = result.suggestedUse === "Direct Use" ? "Filled" : "Draft Only";
      question.questionLibraryLinks = [
        ...(question.questionLibraryLinks || []),
        {
          knowledgeItemId: result.kbId || result.historyId || result.id,
          title: result.title,
          similarity: result.similarity,
          recommendation: result.recommendation,
          sourceType: result.sourceType,
          sourceReference: result.sourceName,
          actionTaken: action,
          reviewRequirement: question.reviewRequired ? "SME Review" : "No Review",
          linkedAt: new Date().toISOString(),
        },
      ];
      if (question.reviewRequired && question.status !== "approved") {
        question.status = "review";
        question.reviewStatus = "SME Review Required";
      }
    }
    if (action === "save") {
      state.librarySearch.savedCandidates.unshift({ questionId: question.id, resultId: result.id, title: result.title, savedAt: new Date().toISOString() });
    }
    if (action === "sme") {
      question.status = "review";
      question.reviewStatus = "SME Review Required";
      addReviewComment("Knowledge Hub Candidate");
    }
    addAudit(`Knowledge Hub Search ${action}: ${result.title} (${result.similarity}% / ${result.recommendation}%)`, question.id);
    toast(`Action completed: ${action}`);
    renderAll();
  }

  function replaceWithValidatedLibraryAnswer() {
    const question = getSelectedQuestion();
    const kb = state.kb.find((item) => item.id === question?.libraryValidation?.libraryItemId);
    if (!question || !kb) {
      toast("No replaceable Knowledge Hub answer is available for the current question");
      return;
    }
    question.draft = `${kb.answer}\n\nSource basis: Latest Approved Knowledge Hub Answer · ${kb.source}.`;
    question.bestAnswerSource = "Latest Approved Knowledge Hub Answer";
    question.sourceType = kb.sourceType || "Library";
    question.autoFillStatus = question.risk === "high" ? "Draft Only" : "Filled";
    question.reviewRequired = question.risk === "high";
    question.suggestedAction = question.reviewRequired ? "SME Review" : "Review / Finalize";
    question.questionLibraryLinks = [
      ...(question.questionLibraryLinks || []),
      {
        knowledgeItemId: kb.id,
        title: kb.title,
        similarity: question.historicalMatch?.similarity || 0,
        sourceType: kb.sourceType,
        sourceReference: kb.source,
        actionTaken: "Replace with Approved Answer",
        reviewRequirement: question.reviewRequired ? "SME Review" : "No Review",
        linkedAt: new Date().toISOString(),
      },
    ];
    addAudit(`Replace with Approved Answer: ${kb.id}`, question.id);
    toast("Replaced with the latest Knowledge Hub answer");
    renderAll();
  }

  function keepHistoricalAnswer() {
    const question = getSelectedQuestion();
    if (!question?.historicalMatch?.answer) {
      toast("No historical answer is available to retain for the current question");
      return;
    }
    question.draft = `${question.historicalMatch.answer}\n\nSource basis: Historical Questionnaire · ${question.historicalMatch.sourceName}.`;
    question.bestAnswerSource = "Same Client + Recent Historical Submitted Answer";
    question.autoFillStatus = question.risk === "high" ? "Draft Only" : "Filled";
    question.suggestedAction = question.risk === "high" ? "SME Review" : "Keep Historical Answer";
    question.reviewRequired = question.risk === "high" || question.libraryValidation?.status === "Conflict Detected";
    addAudit(`Keep Historical Answer: ${question.historicalMatch.sourceName}`, question.id);
    toast("Historical answer retained");
    renderAll();
  }

  function compareCurrentAnswer() {
    const question = getSelectedQuestion();
    state.librarySearch.contextQuery = question?.text || "";
    addAudit("Compare Current vs Library Candidate", question?.id || "SEARCH");
      toast("Comparison view generated. Please review the contextual Knowledge Hub results.");
    renderAll();
  }

  function runContextSearchForQuestion(questionId = state.selectedId) {
    const question = state.questions.find((item) => item.id === questionId) || getSelectedQuestion();
    if (!question) return;
    state.selectedId = question.id;
    state.librarySearch.contextQuestionId = question.id;
    state.librarySearch.contextQuery = question.text;
    addAudit(`Contextual Knowledge Hub Search: ${question.id}`, question.id);
    toast("Knowledge Hub searched using the current question");
    renderAll();
  }

  function renderWorkspaceDashboard() {
    const kpiEl = document.getElementById("workspaceKpis");
    if (!kpiEl) return;
    const portfolio = buildQuestionnairePortfolio();
    const tasks = buildMyTasks();
    const active = portfolio.filter((item) => item.status !== "Submitted" && item.status !== "Archived").length;
    const pendingSme = state.questions.filter((question) => question.status === "review").length;
    const highRisk = state.questions.filter((question) => question.risk === "high").length;
    const overdue = tasks.filter((task) => daysUntil(task.dueDate) < 0 && task.status !== "Final Approved").length;
    const avgCompletion = avg(portfolio, (item) => item.completion);
    const avgConfidence = avg(portfolio, (item) => item.confidence);
    const upcoming = tasks
      .filter((task) => daysUntil(task.dueDate) >= 0)
      .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))[0];
    const slaRisk = tasks.filter((task) => daysUntil(task.dueDate) <= 2 && task.status !== "Final Approved").length;

    kpiEl.innerHTML = [
      metric("Active Projects", active, "Active questionnaire projects in the recommendation pipeline"),
      metric("Pending Stakeholder Review", pendingSme, "Questions awaiting SME, coverage or sales review"),
      metric("High-risk Items", highRisk, "Mandatory review questions requiring controlled handling"),
      metric("Overdue Tasks", overdue, "Past the internal deadline"),
      metric("Average Completion", `${avgCompletion}%`, "Average completion rate across the project portfolio"),
      metric("Average Recommendation Confidence", `${avgConfidence}%`, "Average confidence of recommended answers"),
      metric("External Deadline", upcoming ? upcoming.dueDate.slice(5) : "--", "Nearest client-facing deadline"),
      metric("SLA Risk", slaRisk, "Tasks due within two days or overdue"),
    ].join("");

    const portfolioEl = document.getElementById("questionnairePortfolio");
    if (portfolioEl) {
      portfolioEl.innerHTML = `
        <div class="table-wrap flat-table-wrap">
          <table class="portfolio-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Project Name</th>
                <th>Business</th>
                <th>Request Type</th>
                <th>Market</th>
                <th>Client Domicile</th>
                <th>Project Owner</th>
                <th>Status</th>
                <th>External Deadline</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${portfolio
                .map(
                  (item) => `
                    <tr>
                      <td class="question-cell"><strong>${escapeHtml(item.name)}</strong><span>${item.tags.map((tag) => escapeHtml(tag)).join(" · ")}</span></td>
                      <td>${escapeHtml(item.client)}</td>
                      <td>${escapeHtml(item.type)}</td>
                      <td>${escapeHtml(item.workflowTemplate)}</td>
                      <td>${escapeHtml(item.total)}</td>
                      <td>${escapeHtml(item.matched)}</td>
                      <td>${escapeHtml(item.review)}</td>
                      <td><span class="risk-pill ${item.highRisk ? "high" : "low"}">${escapeHtml(item.highRisk)}</span></td>
                      <td>${confidenceMarkup(item.completion)}</td>
                      <td>${escapeHtml(item.owner)}</td>
                      <td>${escapeHtml(item.dueDate)}</td>
                      <td>${escapeHtml(item.stage)}</td>
                      <td><span class="status-pill review">${escapeHtml(item.status)}</span></td>
                      <td>${escapeHtml(item.updatedAt)}</td>
                      <td><button data-open-workbench="${escapeHtml(item.id)}">Open Workbench</button></td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    const workbenchTimeline = document.getElementById("workbenchStatusBar");
    if (workbenchTimeline) workbenchTimeline.innerHTML = processTimelineSteps(currentWorkflowStageName());

    const slaEl = document.getElementById("workspaceSlaPanel");
    if (slaEl) {
      slaEl.innerHTML = `
        <article class="sla-card ${slaRisk ? "warning" : ""}">
          <strong>SLA Breach Risk</strong>
          <span>${slaRisk} tasks within 2 days / overdue</span>
          <p>High-risk, low-confidence and unhandled stakeholder review items automatically enter the priority queue and trigger reminder drafts.</p>
        </article>
        <article class="sla-card">
          <strong>Next Gate</strong>
          <span>Stakeholder Review -> Finalisation</span>
          <p>Before export, the system checks draft or expired content, confidence below 75%, missing owner and missing review records.</p>
        </article>
      `;
    }
  }

  function renderWorkflowSetup() {
    const cfg = workflowConfig();
    const modeCards = document.getElementById("workflowModeCards");
    const select = document.getElementById("workflowTemplateSelect");
    const stagesEl = document.getElementById("workflowBuilderStages");
    const libraryEl = document.getElementById("stageLibraryList");
    const tableEl = document.getElementById("workflowTemplateTable");
    if (!modeCards && !select && !stagesEl && !libraryEl && !tableEl) return;

    const modeBadge = document.getElementById("workflowModeBadge");
    if (modeBadge) modeBadge.textContent = state.workflow.mode === "custom" ? "Custom Workflow" : "Standard Workflow";

    if (modeCards) {
      modeCards.innerHTML = [
        ["standard", "Use Standard Workflow", "Use the default four-step workflow for formal RFPs/DDQs."],
        ["custom", "Build Custom Workflow", "Freely add, remove, reorder and rename stages, and set their applicability."],
      ]
        .map(
          ([mode, title, desc]) => `
            <button class="mode-card ${state.workflow.mode === mode ? "active" : ""}" data-workflow-mode="${mode}">
              <strong>${escapeHtml(title)}</strong>
              <span>${escapeHtml(desc)}</span>
            </button>
          `
        )
        .join("");
    }

    if (select) {
      select.innerHTML = cfg.templates.map((template) => `<option value="${escapeHtml(template.id)}" ${template.id === state.workflow.templateId ? "selected" : ""}>${escapeHtml(template.name)}</option>`).join("");
    }

    if (stagesEl) {
      const stages = activeWorkflowStages();
      stagesEl.innerHTML =
        stages
          .map(
            (stage, index) => `
              <article class="workflow-stage-card">
                <div class="workflow-stage-head">
                  <span>${String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>${escapeHtml(stage.displayName)}</strong>
                    <em>${escapeHtml(stage.type)} · ${escapeHtml(stage.role)}</em>
                  </div>
                </div>
                <dl>
                  <div><dt>Owner Type</dt><dd>${escapeHtml(stage.ownerType)}</dd></div>
                  <div><dt>Default Owner</dt><dd>${escapeHtml(stage.defaultOwner)}</dd></div>
                  <div><dt>Applies To</dt><dd>${escapeHtml(stage.appliesTo)}</dd></div>
                  <div><dt>Mandatory?</dt><dd>${stage.mandatory ? "Yes" : "No"}</dd></div>
                  <div><dt>Allow Edit?</dt><dd>${stage.allowEditAnswer ? "Yes" : "No"}</dd></div>
                  <div><dt>Re-assign?</dt><dd>${stage.allowReassign ? "Yes" : "No"}</dd></div>
                  <div><dt>Due Date Rule</dt><dd>${escapeHtml(stage.dueDateRule)}</dd></div>
                  <div><dt>Blocking Rule</dt><dd>${escapeHtml(stage.blockingRule)}</dd></div>
                </dl>
                <div class="tag-row">
                  <span class="tag">${stage.signoffRequired ? "Signoff Required" : "No formal signoff"}</span>
                  <span class="tag">${stage.requiresAcceptance ? "Requires Acceptance" : "Auto Accept"}</span>
                  <span class="tag">${stage.allowCommentOnly ? "Comment Only" : "Can edit answer"}</span>
                </div>
                <div class="stage-actions">
                  <button data-stage-action="up" data-stage-index="${index}">Move Up</button>
                  <button data-stage-action="down" data-stage-index="${index}">Move Down</button>
                  <button data-stage-action="rename" data-stage-index="${index}">Rename</button>
                  <button data-stage-action="duplicate" data-stage-index="${index}">Duplicate</button>
                  <button data-stage-action="remove" data-stage-index="${index}">Remove</button>
                </div>
              </article>
            `
          )
          .join("") || `<div class="empty-state">Please select or add a workflow stage</div>`;
    }

    if (libraryEl) {
      libraryEl.innerHTML = cfg.stageLibrary
        .map(
          (stage) => `
            <article class="stage-library-card">
              <div>
                <strong>${escapeHtml(stage.name)}</strong>
                <span>${escapeHtml(stage.type)} · ${escapeHtml(stage.role)}</span>
                <p>${escapeHtml(stage.appliesTo)}</p>
              </div>
              <button data-add-stage="${escapeHtml(stage.id)}">Add Stage</button>
            </article>
          `
        )
        .join("");
    }

    if (tableEl) {
      tableEl.innerHTML = `
        <div class="table-wrap flat-table-wrap">
          <table class="workflow-template-table">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Description</th>
                <th>Number of Stages</th>
                <th>Default Roles</th>
                <th>Applies To</th>
                <th>Mandatory Stages</th>
                <th>Last Used</th>
                <th>Created By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${cfg.templates
                .map((template) => {
                  const stages = template.stages.map((id) => stageByLibraryId(id)).filter(Boolean);
                  return `
                    <tr>
                      <td class="question-cell"><strong>${escapeHtml(template.name)}</strong></td>
                      <td>${escapeHtml(template.description)}</td>
                      <td>${stages.length}</td>
                      <td>${escapeHtml(unique(stages.map((stage) => stage.role)).slice(0, 4).join(" / "))}</td>
                      <td>${escapeHtml(template.appliesTo)}</td>
                      <td>${stages.filter((stage) => stage.mandatory).length}</td>
                      <td>${escapeHtml(template.lastUsed)}</td>
                      <td>${escapeHtml(template.createdBy)}</td>
                      <td><span class="status-pill approved">${escapeHtml(template.status)}</span></td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  function questionsForStage(stage) {
    const applies = `${stage.appliesTo || ""}`.toLowerCase();
    if (applies.includes("high risk")) return state.questions.filter((question) => question.risk === "high");
    if (applies.includes("low confidence")) return state.questions.filter((question) => (question.confidence || 0) < 75);
    if (applies.includes("regulatory")) return state.questions.filter((question) => /regulatory|compliance|kyc|aml|sanction/i.test(`${question.section} ${question.text}`));
    if (applies.includes("legal") || applies.includes("commitment")) return state.questions.filter((question) => /guarantee|contract|legal|liability|commercial/i.test(`${question.text} ${question.tags.join(" ")}`));
    if (applies.includes("data protection") || applies.includes("systems")) return state.questions.filter((question) => /security|privacy|data|system|encryption/i.test(`${question.section} ${question.text}`));
    if (applies.includes("selected section")) return state.questions.filter((question) => ["Information Security", "Compliance", "Regulatory Reporting"].includes(question.section) || question.risk !== "low");
    return state.questions;
  }

  function stageProgressRows() {
    const stages = activeWorkflowStages();
    const approved = state.questions.filter((question) => question.status === "approved").length;
    return stages.map((stage, index) => {
      const scoped = questionsForStage(stage);
      const total = scoped.length || state.questions.length || 1;
      const factor =
        stage.type === "Draft"
          ? 0.88
          : stage.displayName.includes("SME")
          ? 0.48
          : stage.type === "Review"
          ? Math.max(0.18, 0.42 - index * 0.04)
          : stage.type === "Approval" || stage.type === "Signoff"
          ? 0.18
          : stage.type === "Formatting"
          ? 0.12
          : 0.08;
      const completed = Math.min(total, Math.max(0, Math.round(total * factor) + (stage.type === "Draft" ? 0 : Math.floor(approved / 2))));
      const pending = Math.max(0, total - completed);
      const overdue = pending && stage.mandatory ? Math.min(pending, index % 3) : 0;
      const status = overdue ? "At Risk" : pending === 0 ? "Complete" : index > 2 && completed === 0 ? "Waiting" : "In Review";
      return {
        stage,
        total,
        completed,
        pending,
        overdue,
        status,
      };
    });
  }

  function sectionAssignmentRows() {
    const sections = Object.entries(
      state.questions.reduce((acc, question) => {
        acc[question.section] = acc[question.section] || [];
        acc[question.section].push(question);
        return acc;
      }, {})
    );
    const stages = activeWorkflowStages();
    return sections.map(([section, questions], index) => {
      const applicable = stages.filter((stage) => questions.some((question) => questionsForStage(stage).includes(question)));
      const active = applicable.find((stage) => stage.type === "Review") || applicable[0] || stages[0];
      const pending = questions.filter((question) => question.status !== "approved").length;
      const reassigned = state.workflow.reassignments.filter((item) => item.item.includes(section) || item.scope.includes("Section")).length;
      const blocked = questions.filter((question) => question.risk === "high" && question.status !== "approved").length;
      const dueDate = isoDate(addDays(APP_TODAY, 9 + index));
      return {
        section,
        owner: questions[0]?.owner || active?.defaultOwner || "Unassigned",
        workflowApplied: applicable.map((stage) => stage.displayName).slice(0, 3).join(" + ") || activeWorkflowTemplate().name,
        total: questions.length,
        activeStage: active?.displayName || "Waiting",
        pending,
        reassigned,
        blocked,
        dueDate,
        status: blocked ? "At Risk" : pending > questions.length / 2 ? "In Review" : "On Track",
      };
    });
  }

  function reviewerWorkloadRows() {
    const people = new Map();
    const touch = (person, role, assigned = 0, overdue = 0) => {
      const current = people.get(person) || { person, role, assigned: 0, accepted: 0, inProgress: 0, approved: 0, reassignedOut: 0, pendingAcceptance: 0, overdue: 0 };
      current.assigned += assigned;
      current.accepted += Math.max(0, assigned - 1);
      current.inProgress += Math.max(0, Math.round(assigned * 0.55));
      current.approved += Math.max(0, Math.round(assigned * 0.3));
      current.overdue += overdue;
      people.set(person, current);
    };
    state.questions.forEach((question) => touch(question.owner || "Unassigned", "Question Owner", 1, question.risk === "high" ? 1 : 0));
    activeWorkflowStages().forEach((stage) => touch(stage.defaultOwner, stage.role, Math.max(1, Math.round(questionsForStage(stage).length / 4)), stage.mandatory && stage.type === "Review" ? 1 : 0));
    state.workflow.reassignments.forEach((item) => {
      touch(item.reassignedTo, "Re-assigned Reviewer", 1, item.acceptanceStatus === "Pending Acceptance" ? 1 : 0);
      const original = people.get(item.originalOwner) || { person: item.originalOwner, role: "Original Owner", assigned: 0, accepted: 0, inProgress: 0, approved: 0, reassignedOut: 0, pendingAcceptance: 0, overdue: 0 };
      original.reassignedOut += 1;
      people.set(item.originalOwner, original);
      const target = people.get(item.reassignedTo);
      if (target && item.acceptanceStatus === "Pending Acceptance") target.pendingAcceptance += 1;
    });
    return [...people.values()].slice(0, 9).map((row) => ({
      ...row,
      workload: row.assigned + row.pendingAcceptance + row.overdue > 10 ? "High" : row.assigned > 4 ? "Medium" : "Low",
    }));
  }

  function exportReadinessChecks() {
    const progress = stageProgressRows();
    const mandatoryIncomplete = progress.filter((row) => row.stage.mandatory && row.pending > 0);
    const highRiskOpen = state.questions.filter((question) => question.risk === "high" && question.status !== "approved").length;
    const pendingAcceptance = state.workflow.reassignments.filter((item) => item.acceptanceStatus === "Pending Acceptance").length;
    const blocked = progress.reduce((sum, row) => sum + row.overdue, 0);
    const missingSource = state.questions.filter((question) => !(question.matches || []).length).length;
    const signoffStage = activeWorkflowStages().find((stage) => stage.signoffRequired);
    const signoffComplete = !signoffStage || state.questions.some((question) => question.signoffAt);
    return [
      ["All mandatory stages completed", !mandatoryIncomplete.length, `${mandatoryIncomplete.length} mandatory stages still pending`],
      ["High risk questions completed required reviews", highRiskOpen === 0, `${highRiskOpen} high risk questions open`],
      ["Re-assigned tasks accepted and completed", pendingAcceptance === 0, `${pendingAcceptance} pending acceptance`],
      ["Blocked / overdue tasks resolved", blocked === 0, `${blocked} overdue stage items`],
      ["All answers have approved or accepted sources", missingSource === 0, `${missingSource} questions missing source`],
      ["Required signoff completed", signoffComplete, signoffComplete ? "Signoff not required or already captured" : "Formal signoff still required"],
      ["No Draft / Expired / Missing Source content in client version", state.questions.every((question) => question.status !== "draft"), `${state.questions.filter((question) => question.status === "draft").length} draft answers remain`],
    ].map(([name, passed, note]) => ({ name, passed, note }));
  }

  function renderAssignmentDashboard() {
    const kpis = document.getElementById("assignmentKpis");
    if (!kpis) return;
    const progress = stageProgressRows();
    const sections = sectionAssignmentRows();
    const reviewerRows = reviewerWorkloadRows();
    const checks = exportReadinessChecks();
    const totalQuestions = state.questions.length;
    const activeTasks = progress.reduce((sum, row) => sum + row.pending, 0);
    const completedTasks = progress.reduce((sum, row) => sum + row.completed, 0);
    const pendingReview = progress.filter((row) => row.stage.type === "Review").reduce((sum, row) => sum + row.pending, 0);
    const overdueTasks = progress.reduce((sum, row) => sum + row.overdue, 0);
    const readiness = pct(checks.filter((check) => check.passed).length, checks.length);
    const stageKpis = progress.slice(0, 4).map((row) => metric(`${row.stage.displayName} Pending`, row.pending, `${row.stage.type} · ${row.status}`));

    kpis.innerHTML = [
      metric("Total Questions", totalQuestions, "Number of questions in the current questionnaire"),
      metric("Total Sections", sections.length, "Automatically detected topics/sections"),
      metric("Active Tasks", activeTasks, "Pending items across all stages"),
      metric("Completed Tasks", completedTasks, "Completed items across stages"),
      metric("Pending Review", pendingReview, "Pending review items in Review-type stages"),
      metric("Re-assigned Tasks", state.workflow.reassignments.length, "Re-assigned tasks"),
      metric("Pending Acceptance", state.workflow.reassignments.filter((item) => item.acceptanceStatus === "Pending Acceptance").length, "Awaiting acceptance by the new owner"),
      metric("Export Readiness", `${readiness}%`, "Dynamically calculated against mandatory stages"),
      ...stageKpis,
    ].join("");

    const tabs = document.getElementById("assignmentTabs");
    if (tabs) {
      const dynamicTabs = ["Overview", "Questions", "Assignments", ...activeWorkflowStages().filter((stage) => ["Review", "Approval", "Signoff"].includes(stage.type)).map((stage) => stage.displayName), "Export", "Activity Log"];
      tabs.innerHTML = dynamicTabs.map((tab, index) => `<button class="${index === 0 ? "active" : ""}">${escapeHtml(tab)}</button>`).join("");
    }

    const stageTable = document.getElementById("stageProgressTable");
    if (stageTable) {
      stageTable.innerHTML = tableMarkup(
        ["Stage", "Owner Type", "Applies To", "Total Items", "Completed", "Pending", "Overdue", "Status"],
        progress.map((row) => [row.stage.displayName, row.stage.ownerType, row.stage.appliesTo, row.total, row.completed, row.pending, row.overdue, row.status])
      );
    }

    const sectionTable = document.getElementById("sectionAssignmentTable");
    if (sectionTable) {
      sectionTable.innerHTML = tableMarkup(
        ["Section", "Owner", "Workflow Applied", "Total Qs", "Active Stage", "Pending", "Re-assigned", "Blocked", "Due Date", "Status"],
        sections.map((row) => [row.section, row.owner, row.workflowApplied, row.total, row.activeStage, row.pending, row.reassigned, row.blocked, row.dueDate, row.status])
      );
    }

    const workload = document.getElementById("reviewerWorkloadTable");
    if (workload) {
      workload.innerHTML = tableMarkup(
        ["Person", "Role", "Assigned", "Accepted", "In Progress", "Approved", "Re-assigned Out", "Pending Acceptance", "Overdue", "Workload"],
        reviewerRows.map((row) => [row.person, row.role, row.assigned, row.accepted, row.inProgress, row.approved, row.reassignedOut, row.pendingAcceptance, row.overdue, row.workload])
      );
    }

    const reassignment = document.getElementById("reassignmentTracker");
    if (reassignment) {
      reassignment.innerHTML = tableMarkup(
        ["Item", "Original Owner", "Re-assigned To", "Scope", "Reason", "Acceptance Status", "Due Date", "PM Action"],
        state.workflow.reassignments.map((item) => [item.item, item.originalOwner, item.reassignedTo, item.scope, item.reason, item.acceptanceStatus, item.dueDate, item.pmAction])
      );
    }

    const readinessPanel = document.getElementById("exportReadinessPanel");
    const readinessBadge = document.getElementById("exportReadinessBadge");
    if (readinessBadge) readinessBadge.textContent = readiness === 100 ? "Ready" : "Blocked";
    if (readinessPanel) {
      readinessPanel.innerHTML = checks
        .map(
          (check) => `
            <article class="readiness-item ${check.passed ? "passed" : "blocked"}">
              <strong>${escapeHtml(check.name)}</strong>
              <span>${escapeHtml(check.note)}</span>
              <em>${check.passed ? "Passed" : "Blocking"}</em>
            </article>
          `
        )
        .join("");
    }

    const rulesPanel = document.getElementById("reassignmentRulesPanel");
    if (rulesPanel) {
      const rules = [
        "A re-assignment reason is mandatory",
        "Project Owner is notified by default",
        "Original Owner becomes Watcher by default",
        "Not formally transferred until accepted by the new Owner",
        "More than one re-assignment automatically marks the item At Risk",
        "More than two re-assignments require PM intervention",
        "High-risk question re-assignment requires PM approval",
        "Due Date is not extended automatically",
        "Declined items return to the PM Queue",
      ];
      rulesPanel.innerHTML = rules.map((rule) => `<span>${escapeHtml(rule)}</span>`).join("");
    }
  }

  function tableMarkup(headers, rows) {
    return `
      <div class="table-wrap flat-table-wrap">
        <table class="dynamic-table">
          <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    ${row
                      .map((cell, index) => {
                        const text = escapeHtml(cell);
                        if (index === 0) return `<td class="question-cell"><strong>${text}</strong></td>`;
                        if (["At Risk", "Blocked", "Blocking", "High"].includes(String(cell))) return `<td><span class="risk-pill high">${text}</span></td>`;
                        if (["Complete", "Ready", "Passed", "On Track", "Accepted", "Active"].includes(String(cell))) return `<td><span class="status-pill approved">${text}</span></td>`;
                        if (["In Review", "Waiting", "Pending Acceptance", "Medium"].includes(String(cell))) return `<td><span class="status-pill review">${text}</span></td>`;
                        return `<td>${text}</td>`;
                      })
                      .join("")}
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderMyQuestionnaires() {
    const list = document.getElementById("myTaskList");
    const myList = document.getElementById("myQuestionnaireList");
    const tasks = buildMyTasks();
    if (myList) {
      myList.innerHTML = buildQuestionnairePortfolio()
        .map((item, index) => {
          const pending = tasks.filter((task) => task.questionnaire.includes(item.name.split(" ")[0]) || index === 0).slice(0, index === 0 ? 4 : 2).length;
          const role = index === 0 ? "Owner" : index === 1 ? "SME" : "Approver";
          return `
            <article class="portfolio-card">
              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(item.client)} · ${escapeHtml(item.type)}</span>
              </div>
              <div class="portfolio-meta">
                <span class="tag">My Role: ${escapeHtml(role)}</span>
                <span class="tag">Pending Items: ${pending}</span>
                <span class="tag">Due ${escapeHtml(item.dueDate)}</span>
                <span class="status-pill review">${escapeHtml(item.status)}</span>
              </div>
              <button data-subview="workbench">${index === 1 ? "Review" : "Open"}</button>
            </article>
          `;
        })
        .join("");
    }

    if (list) {
      list.innerHTML =
        tasks
          .map((task) => {
            const risk = riskMeta[task.question.risk] || riskMeta.low;
            const overdueClass = daysUntil(task.dueDate) < 0 ? "overdue" : "";
            return `
              <article class="task-card ${overdueClass}">
                <div>
                  <strong>${escapeHtml(task.taskType)} · ${escapeHtml(task.question.id)}</strong>
                  <p>${escapeHtml(task.question.text)}</p>
                  <div class="tag-row">
                    <span class="tag">${escapeHtml(task.questionnaire)}</span>
                    <span class="tag">${escapeHtml(task.question.owner)}</span>
                    ${task.question.tags.slice(0, 3).map((tag) => `<span class="tag">#${escapeHtml(tag).replace(/^#/, "")}</span>`).join("")}
                  </div>
                </div>
                <div class="task-side">
                  <span class="risk-pill ${risk.className}">${escapeHtml(task.priority)}</span>
                  <strong>${escapeHtml(task.dueDate)}</strong>
                  <span>${escapeHtml(task.status)}</span>
                  <button data-subview="workbench">${task.priority === "High" ? "Review" : "Comment"}</button>
                </div>
              </article>
            `;
          })
          .join("") || `<div class="empty-state">No personal tasks yet</div>`;
    }
  }

  function renderQuestions() {
    const query = (document.getElementById("questionSearch")?.value || "").trim().toLowerCase();
    const rows = state.questions
      .filter((question) => {
        const haystack = `${question.id} ${question.text} ${question.section} ${question.owner} ${question.tags.join(" ")}`.toLowerCase();
        return (!query || haystack.includes(query)) && questionMatchesView(question);
      })
      .map((question) => {
        const status = statusMeta[question.status] || statusMeta.draft;
        const risk = riskMeta[question.risk] || riskMeta.low;
        const selected = question.id === state.selectedId ? "selected" : "";
        const best = (question.matches || [])[0];
        const answer = (question.draft || best?.answer || "").replace(/\s+/g, " ").trim();
        const lastReview = question.signoffAt
          ? new Date(question.signoffAt).toLocaleDateString("en-GB")
          : question.reviewComments?.[0]?.at
          ? new Date(question.reviewComments[0].at).toLocaleDateString("en-GB")
          : best?.lastReview || "--";
        return `
          <tr class="${selected}" data-id="${escapeHtml(question.id)}">
            <td>${escapeHtml(question.id)}</td>
            <td class="question-cell">
              <strong>${escapeHtml(question.text)}</strong>
              <span>${escapeHtml(question.section)} · ${escapeHtml(question.tags.join(", "))}</span>
            </td>
            <td>${escapeHtml(question.section || detectSection(question.text))}</td>
            <td>${best ? escapeHtml(best.title || best.source) : "--"}</td>
            <td>${escapeHtml(question.sourceType || best?.sourceType || "Pending Match")}</td>
            <td class="answer-summary">${escapeHtml(answer.slice(0, 120))}${answer.length > 120 ? "..." : ""}</td>
            <td class="answer-summary">${question.historicalMatch ? escapeHtml(question.historicalMatch.questionText).slice(0, 96) : "--"}</td>
            <td>${question.historicalMatch ? confidenceMarkup(question.historicalMatch.similarity) : "--"}</td>
            <td>${escapeHtml(question.historicalMatch?.submittedDate || "--")}</td>
            <td><span class="status-pill ${question.libraryValidation?.status === "Newer Approved Answer Available" ? "review" : question.libraryValidation?.status === "Approved Answer Recommended" ? "approved" : "draft"}">${escapeHtml(question.libraryValidation?.status || "No Knowledge Hub Match")}</span></td>
            <td>${escapeHtml(question.bestAnswerSource || "--")}</td>
            <td>${escapeHtml(question.suggestedAction || "--")}</td>
            <td>${escapeHtml(question.differenceFlag || "--")}</td>
            <td>${question.reviewRequired ? `<span class="risk-pill medium">Yes</span>` : `<span class="risk-pill low">No</span>`}</td>
            <td>${confidenceMarkup(question.confidence || 0)}</td>
            <td><span class="risk-pill ${risk.className}">${risk.label}</span></td>
            <td>${escapeHtml(question.owner)}</td>
            <td><span class="status-pill ${status.className}">${status.label}</span></td>
            <td class="hashtag-cell">${question.tags.map((tag) => `<span class="tag">#${escapeHtml(tag).replace(/^#/, "")}</span>`).join("")}</td>
            <td>${escapeHtml(lastReview)} · ${reviewSummary(question)}</td>
            <td><button data-action="context-search-row" data-id="${escapeHtml(question.id)}">Search</button></td>
          </tr>
        `;
      })
      .join("");

    document.getElementById("questionRows").innerHTML = rows || `<tr><td colspan="21"><div class="empty-state">No matching questions</div></td></tr>`;
  }

  function renderQuestions() {
    const query = (document.getElementById("questionSearch")?.value || "").trim().toLowerCase();
    const rows = state.questions
      .filter((question) => {
        const haystack = `${question.id} ${question.text} ${question.section} ${question.owner} ${question.tags.join(" ")}`.toLowerCase();
        return (!query || haystack.includes(query)) && questionMatchesView(question);
      })
      .map((question) => {
        const status = statusMeta[question.status] || statusMeta.draft;
        const risk = riskMeta[question.risk] || riskMeta.low;
        const selected = question.id === state.selectedId ? "selected" : "";
        const best = (question.matches || [])[0];
        const answer = (question.draft || best?.answer || "No current draft yet").replace(/\s+/g, " ").trim();
        const similarity = question.historicalMatch?.similarity || Math.round((best?.score || 0) * 100) || question.confidence || 0;
        const currentStage = question.status === "approved" ? "Final Ready" : question.reviewRequired || question.status === "review" ? "SME Review" : currentWorkflowStageName();
        return `
          <tr class="${selected}" data-id="${escapeHtml(question.id)}">
            <td>${escapeHtml(question.id)}</td>
            <td>${escapeHtml(question.section || detectSection(question.text))}</td>
            <td class="question-cell">
              <strong>${escapeHtml(question.text)}</strong>
              <span>${escapeHtml(answer.slice(0, 120))}${answer.length > 120 ? "..." : ""}</span>
            </td>
            <td><span class="status-pill ${status.className}">${status.label}</span></td>
            <td>${escapeHtml(question.bestAnswerSource || best?.title || best?.source || "No strong source")}</td>
            <td>${confidenceMarkup(similarity)}</td>
            <td><span class="risk-pill ${risk.className}">${risk.label}</span></td>
            <td>${escapeHtml(question.owner)}</td>
            <td>${escapeHtml(currentStage)}</td>
            <td>${reviewSummary(question)}</td>
            <td><button data-action="context-search-row" data-id="${escapeHtml(question.id)}">Open Detail</button></td>
          </tr>
        `;
      })
      .join("");
    const tbody = document.getElementById("questionRows");
    if (tbody) tbody.innerHTML = rows || `<tr><td colspan="11"><div class="empty-state">No questions match this saved view.</div></td></tr>`;
  }

  function reviewSummary(question) {
    const comments = question.reviewComments || [];
    if (question.signoffAt) return `<span class="status-pill approved">Signoff</span>`;
    if (comments.length) return `<span class="tag">${comments.length} records</span>`;
    if (question.status === "review") return `<span class="status-pill review">Awaiting review</span>`;
    return `<span class="tag">No items yet</span>`;
  }

  function confidenceMarkup(value) {
    return `
      <div class="confidence">
        <strong>${value}%</strong>
        <div class="confidence-track"><span class="${confidenceClass(value)}" style="width:${value}%"></span></div>
      </div>
    `;
  }

  function renderInspector() {
    const question = getSelectedQuestion();
    const inspector = document.getElementById("inspector");
    if (!question) {
      inspector.innerHTML = `<div class="empty-state">No question selected</div>`;
      return;
    }

    const status = statusMeta[question.status] || statusMeta.draft;
    const risk = riskMeta[question.risk] || riskMeta.low;
    const rules = qualityRules.filter((rule) => (question.rules || []).includes(rule.id));
    const sources = (question.matches || []).map(sourceCard).join("");
    const comments =
      (question.reviewComments || [])
        .map(
          (comment) => `
            <article class="comment-item">
              <strong>${escapeHtml(comment.by)} · ${escapeHtml(comment.action)}</strong>
              <span>${escapeHtml(new Date(comment.at).toLocaleString("en-GB"))}</span>
              <p>${escapeHtml(comment.text)}</p>
            </article>
          `
        )
        .join("") || `<div class="empty-state">No review records yet</div>`;

    inspector.innerHTML = `
      <div class="panel-head compact">
        <div>
          <p class="eyebrow">Answer Recommendation Panel</p>
          <h2>${escapeHtml(question.id)}</h2>
        </div>
        <span class="status-pill ${status.className}">${status.label}</span>
      </div>
      <div class="inspector-body">
        <p class="question-title">${escapeHtml(question.text)}</p>
        <div class="tag-row">
          <span class="risk-pill ${risk.className}">Risk ${risk.label}</span>
          <span class="tag">Confidence ${question.confidence || 0}%</span>
          <span class="tag">${escapeHtml(question.owner)}</span>
          <span class="tag">Auto-fill ${escapeHtml(question.autoFillStatus || "Not Filled")}</span>
          <span class="tag">${escapeHtml(question.bestAnswerSource || "No source")}</span>
          ${question.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>

        <section class="mapping-insight">
          <p class="eyebrow">Historical Mapping / Knowledge Validation</p>
          <div class="mapping-insight-grid">
            <article>
              <strong>${escapeHtml(question.historicalMatch?.matchType || "No Historical Match")}</strong>
              <span>${escapeHtml(question.historicalMatch?.sourceName || "Historical Questionnaire Repository")}</span>
              <p>${question.historicalMatch ? `Similarity ${question.historicalMatch.similarity}% · Submitted ${question.historicalMatch.submittedDate}` : "No strong historical answer found. Search Hub or create AI Draft after validation."}</p>
            </article>
            <article>
              <strong>${escapeHtml(question.libraryValidation?.status || "No Knowledge Hub Match")}</strong>
              <span>${escapeHtml(question.libraryValidation?.libraryTitle || "Knowledge Validation")}</span>
              <p>${escapeHtml(question.libraryValidation?.message || "Run Knowledge Validation to check latest Approved Answer.")}</p>
            </article>
          </div>
          <div class="button-row">
            <button data-action="replace-library"><svg class="icon"><use href="#icon-check"></use></svg>Replace with Approved Answer</button>
            <button data-action="keep-historical"><svg class="icon"><use href="#icon-file"></use></svg>Keep Historical Answer</button>
            <button data-action="compare-current"><svg class="icon"><use href="#icon-search"></use></svg>Compare</button>
            <button data-action="context-search"><svg class="icon"><use href="#icon-search"></use></svg>Search Hub</button>
          </div>
        </section>

        <div class="segmented" role="group" aria-label="Approval status">
          ${Object.entries(statusMeta)
            .map(([key, meta]) => `<button class="${question.status === key ? "active" : ""}" data-action="status" data-status="${key}">${meta.label}</button>`)
            .join("")}
        </div>

        <label>
          <p class="eyebrow">AI Draft</p>
          <textarea id="draftEditor">${escapeHtml(question.draft || "")}</textarea>
        </label>

        <label>
          <p class="eyebrow">SME Comment</p>
          <textarea id="commentEditor" class="comment-editor" placeholder="Record review comments, return reasons or sign-off notes"></textarea>
        </label>

        <div class="button-row dynamic-action-row">${stageActionButtonsMarkup()}</div>

        <section>
          <p class="eyebrow">Review History</p>
          <div class="comment-list">${comments}</div>
        </section>

        <section>
          <p class="eyebrow">Matched Sources</p>
          ${sources || `<div class="empty-state">No trusted sources yet</div>`}
        </section>

        <section>
          <p class="eyebrow">Golden Source Evidence</p>
          ${
            (question.matches || [])
              .filter((item) => item.sourceType === "External Reliable Source" || item.sourceUrl)
              .slice(0, 2)
              .map(
                (item) => `
                  <div class="rule-item">
                    <strong>${escapeHtml(item.source || item.title)}</strong>
                    <p>${item.sourceUrl ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.sourceUrl)}</a>` : escapeHtml(item.answer).slice(0, 180)}</p>
                  </div>
                `
              )
              .join("") || `<div class="empty-state">No Golden Source evidence yet</div>`
          }
        </section>

        <section>
          <p class="eyebrow">Historical Similar Questions</p>
          <div class="rule-item">
            <strong>AFME 2026 / Alpha DDQ historical similar questions</strong>
            <p>Similar historical questionnaires are identified by topic, tag and matched source; the production version will show original questions, final answers, submission dates and reuse risks.</p>
          </div>
        </section>

        <section>
          <p class="eyebrow">Writeback Gate</p>
          <div class="rule-item">
            <strong>${question.status === "approved" && question.signoffAt ? "Writeback to final template allowed" : "Writeback to final client version not yet allowed"}</strong>
            <p>${question.status === "approved" && question.signoffAt ? "Sign-off is complete; proceed to the Export Centre for preview and writeback." : "SME Review, risk checks and project-level sign-off must be completed before writeback to the final template."}</p>
          </div>
        </section>

        <section>
          <p class="eyebrow">Audit Trail</p>
          <div class="comment-list">
            ${
              state.audit
                .filter((item) => item.questionId === question.id)
                .slice(0, 4)
                .map((item) => `<article class="comment-item"><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(new Date(item.at).toLocaleString("en-GB"))}</span></article>`)
                .join("") || `<div class="empty-state">No audit records yet</div>`
            }
          </div>
        </section>

        <section>
          <p class="eyebrow">Quality Rules</p>
          ${
            rules.length
              ? rules
                  .map((rule) => `<div class="rule-item"><strong>${escapeHtml(rule.id)} · ${escapeHtml(rule.name)}</strong><p>${escapeHtml(rule.action)}</p></div>`)
                  .join("")
              : `<div class="rule-item"><strong>No high-risk rules triggered</strong><p>The current response still requires owner confirmation under the business workflow.</p></div>`
          }
        </section>
      </div>
    `;

    document.getElementById("draftEditor").addEventListener("input", (event) => {
      question.draft = event.target.value;
      const rules = triggeredRules(`${question.text} ${question.draft}`);
      question.rules = rules;
      question.risk = levelFromRules(rules);
      question.updatedAt = new Date().toISOString();
      persist();
      renderQuestions();
      renderMetrics();
      renderRiskCenter();
      renderPreview();
    });
  }

  function sourceCard(item) {
    const pct = Math.round((item.score || 0) * 100);
    return `
      <article class="source-card">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.answer)}</p>
        <div class="source-row">
              <span>${escapeHtml(item.theme || item.source)} · ${escapeHtml(item.owner)}</span>
              <span>${pct}% match · Trust ${item.trust}</span>
        </div>
        <button data-action="use-source" data-kb="${escapeHtml(item.id)}">Apply</button>
      </article>
    `;
  }

  function stageActionButtonsMarkup() {
    const stage = activeWorkflowStages().find((item) => item.displayName === currentWorkflowStageName()) || activeWorkflowStages()[0];
    const actions = workflowConfig().stageTypes[stage?.type] || ["Add Comment"];
    const actionMap = {
      "Generate Draft": ["generate-one", "primary", "icon-ai"],
      "Edit Answer": ["workflow-toast", "", "icon-file"],
      "Attach Source": ["workflow-toast", "", "icon-file"],
      "Mark as Draft Done": ["send-review", "", "icon-check"],
      "Submit to Next Stage": ["send-review", "", "icon-check"],
      "Start Review": ["workflow-toast", "primary", "icon-check"],
      "Add Comment": ["add-comment", "", "icon-file"],
      "Request Clarification": ["workflow-toast", "", "icon-risk"],
      "Approve Review": ["approve", "primary", "icon-check"],
      "Reject / Return": ["changes", "", "icon-risk"],
      "Re-assign Reviewer": ["reassign-selected", "", "icon-file"],
      "Mark as Blocked": ["block", "", "icon-risk"],
      Approve: ["approve", "primary", "icon-check"],
      Reject: ["changes", "", "icon-risk"],
      "Request Change": ["changes", "", "icon-risk"],
      Escalate: ["workflow-toast", "", "icon-risk"],
      "Sign Off": ["signoff", "primary", "icon-check"],
      "Apply House Style": ["workflow-toast", "", "icon-file"],
      "Check Consistency": ["workflow-toast", "", "icon-check"],
      "Run Final QA": ["workflow-toast", "", "icon-risk"],
      "Mark Final Ready": ["approve", "primary", "icon-check"],
      "Run Export Check": ["workflow-toast", "primary", "icon-risk"],
      "Preview Export": ["workflow-toast", "", "icon-export"],
      "Export Word": ["export-word", "", "icon-export"],
      "Export Excel": ["export-excel", "", "icon-export"],
      "Generate Internal Audit Version": ["workflow-toast", "", "icon-export"],
    };
    return actions
      .map((label, index) => {
        const [action, className, icon] = actionMap[label] || ["workflow-toast", "", "icon-check"];
        return `<button class="${className}" data-action="${escapeHtml(action)}" data-workflow-label="${escapeHtml(label)}"><svg class="icon"><use href="#${escapeHtml(icon)}"></use></svg>${escapeHtml(label)}</button>`;
      })
      .join("");
  }

  function renderLibrary() {
    const query = (document.getElementById("librarySearch")?.value || "").trim().toLowerCase();
    const stats = libraryStats();
    const kpis = document.getElementById("libraryKpis");
    if (kpis) {
      kpis.innerHTML = [
        metric("Total Items", stats.total, "All searchable knowledge assets"),
        metric("Approved Items", stats.approved, "Eligible for project-level sign-off"),
        metric("Golden Source", stats.golden, "External reliable/official sources"),
        metric("Approved Answers", stats.smeReviewed, "Internally approved reusable answers"),
        metric("Items Requiring Review", stats.needsReview, "In Review or due within 45 days"),
        metric("Expired Content", stats.expired, "Blocked from direct client-version writeback"),
        metric("Average Confidence", `${stats.avgConfidence}%`, "Source quality plus review status"),
        metric("Health Score", `${stats.healthScore}%`, `Topic coverage ${stats.coveredTopics}/${stats.targetTopics}`),
      ].join("");
    }

    const chartEl = document.getElementById("libraryChartPanel");
    if (chartEl) {
      chartEl.innerHTML = [
        barSeriesMarkup("Content Source Classification", groupCount(state.kb, (item) => item.sourceType), stats.total),
        barSeriesMarkup("Lifecycle Status", groupCount(state.kb, (item) => item.contentStatus), stats.total),
        barSeriesMarkup("Top 8 Topic Coverage", Object.fromEntries(Object.entries(groupCount(state.kb, safeTheme)).sort((a, b) => b[1] - a[1]).slice(0, 8)), stats.total),
        `<article class="health-score-card">
          <strong>${stats.healthScore}%</strong>
          <span>Knowledge Health Score</span>
          <p>Model: average confidence 45% + Approved ratio 35% + review timeliness 20%.</p>
          <div class="theme-meter"><span style="width:${stats.healthScore}%"></span></div>
        </article>`,
      ].join("");
    }

    const priorityItems = state.kb
      .filter((item) => {
        const haystack = `${item.title} ${safeTheme(item)} ${item.section || ""} ${item.source} ${item.owner} ${item.tags.join(" ")} ${item.answer}`.toLowerCase();
        return !query || haystack.includes(query);
      })
      .sort((a, b) => {
        const scoreA = (a.contentStatus === "Approved" ? 10 : 0) + Math.max(0, 60 - daysUntil(a.nextReview));
        const scoreB = (b.contentStatus === "Approved" ? 10 : 0) + Math.max(0, 60 - daysUntil(b.nextReview));
        return scoreB - scoreA;
      })
      .slice(0, 10)
      .map(
        (item) => `
          <article class="library-item">
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.answer)}</p>
              <div class="mini-meta">
                <span class="tag">${escapeHtml(safeTheme(item))}</span>
                <span class="tag">${escapeHtml(item.sourceType)}</span>
                <span class="tag">${escapeHtml(item.contentStatus)}</span>
                <span class="tag">Owner ${escapeHtml(item.owner)}</span>
                <span class="tag">SME ${escapeHtml(item.sme)}</span>
                <span class="tag">Confidence ${item.confidence || item.trust}%</span>
                <span class="tag">Next ${escapeHtml(item.nextReview)}</span>
              </div>
            </div>
            <button data-action="insert-library" data-kb="${escapeHtml(item.id)}">Insert</button>
          </article>
        `
      )
      .join("");
    const listEl = document.getElementById("libraryList");
    if (listEl) listEl.innerHTML = priorityItems || `<div class="empty-state">No matching knowledge items</div>`;

    const topicCoverage = document.getElementById("libraryTopicCoverage");
    if (topicCoverage) {
      const byTheme = Object.entries(groupCount(state.kb, safeTheme)).sort((a, b) => b[1] - a[1]);
      topicCoverage.innerHTML = byTheme
        .map(([theme, count]) => {
          const width = pct(count, stats.total);
          const approvedTheme = state.kb.filter((item) => safeTheme(item) === theme && item.contentStatus === "Approved").length;
          return `
            <article class="theme-row">
              <div>
                <strong>${escapeHtml(theme)}</strong>
                <span>${approvedTheme} approved · ${count} total</span>
              </div>
              <div class="theme-meter"><span style="width:${Math.max(6, width)}%"></span></div>
              <em>${width}%</em>
            </article>
          `;
        })
        .join("");
    }

    const rulesEl = document.getElementById("libraryGovernanceRules");
    if (rulesEl) {
      const cfg = window.AI_KUAIDA_GOVERNANCE;
      rulesEl.innerHTML = cfg
        ? [
            governanceBlock("Content Source Classification", cfg.sourceTypes, (item) => `${item.name}: ${item.usePolicy} Review cycle: ${item.reviewCycleDays} days.`),
            governanceBlock("Review and Reminder Rules", cfg.reviewRules, (item) => `${item.trigger} -> ${item.action}`),
          ].join("")
        : `<div class="empty-state">No governance rules yet</div>`;
    }

    const calendarEl = document.getElementById("reviewCalendar");
    if (calendarEl) {
      const dueItems = state.kb
        .slice()
        .sort((a, b) => daysUntil(a.nextReview) - daysUntil(b.nextReview))
        .slice(0, 6);
      calendarEl.innerHTML = `
        <div class="review-calendar-head">
          <strong>Review Calendar</strong>
          <span>Sorted by Next Review Date</span>
        </div>
        ${dueItems
          .map(
            (item) => `
              <article class="review-calendar-row">
                <div>
                  <strong>${escapeHtml(item.nextReview)}</strong>
                  <span>${escapeHtml(item.title)}</span>
                </div>
                <span class="tag">${escapeHtml(item.sme || item.owner)}</span>
              </article>
            `
          )
          .join("")}
      `;
    }
  }

  function renderHealth() {
    if (!document.getElementById("contentHealth")) return;
    const stats = libraryStats();
    const expiring = state.kb.filter((item) => daysUntil(item.nextReview) <= 45).length;
    const avgTrust = Math.round(state.kb.reduce((sum, item) => sum + (item.confidence || item.trust || 0), 0) / state.kb.length);
    const owners = unique(state.kb.map((item) => item.owner)).length;
    const tagged = Math.round((state.kb.filter((item) => item.tags.length >= 3).length / state.kb.length) * 100);
    document.getElementById("contentHealth").innerHTML = [
      healthTile("Available Items", `${stats.approved}/${stats.total}`, "Approved knowledge assets"),
      healthTile("Average Confidence", `${avgTrust}%`, "Source quality and approval status"),
      healthTile("Owner Coverage", owners, "Number of Content Owners"),
      healthTile("Tag Completeness", `${tagged}%`, "At least three tags"),
      healthTile("Items Awaiting Review", expiring, "Due within 45 days"),
    ].join("");
  }

  function renderTopicLibrary() {
    const list = document.getElementById("topicLibraryList");
    const matrix = document.getElementById("topicCoverageMatrix");
    if (!list && !matrix) return;
    const total = state.kb.length || 1;
    const topics = Object.entries(
      state.kb.reduce((acc, item) => {
        const key = safeTheme(item);
        acc[key] = acc[key] || [];
        acc[key].push(item);
        return acc;
      }, {})
    ).sort((a, b) => b[1].length - a[1].length);

    if (list) {
      list.innerHTML = topics
        .map(([topic, items]) => {
          const approved = items.filter((item) => item.contentStatus === "Approved").length;
          const average = avg(items, (item) => item.confidence || item.trust);
          const owners = unique(items.map((item) => item.owner)).slice(0, 3);
          const sample = items[0];
          return `
            <article class="topic-card">
              <div class="topic-card-head">
                <div>
                  <strong>${escapeHtml(topic)}</strong>
                  <span>${approved} approved · ${items.length} total · Avg confidence ${average}%</span>
                </div>
                <span class="stage-pill">${pct(items.length, total)}%</span>
              </div>
              <p><b>Standard Question:</b>${escapeHtml(sample.question || sample.title)}</p>
              <p><b>Standard Answer:</b>${escapeHtml(sample.answer || "").slice(0, 260)}${(sample.answer || "").length > 260 ? "..." : ""}</p>
              <div class="mini-meta">
                <span class="tag">Owner ${escapeHtml(owners.join(" / ") || "Unassigned")}</span>
                <span class="tag">SME ${escapeHtml(sample.sme || sample.owner)}</span>
                <span class="tag">Version ${escapeHtml(sample.version || "v1.0")}</span>
                <span class="tag">Usage ${items.length + approved}</span>
                <span class="tag">Historical ${escapeHtml((sample.lastUsedIn || "AFME 2026, Alpha DDQ").toString())}</span>
              </div>
              <div class="tag-row">${unique(items.flatMap((item) => item.tags || [])).slice(0, 8).map((tag) => `<span class="tag">#${escapeHtml(tag).replace(/^#/, "")}</span>`).join("")}</div>
            </article>
          `;
        })
        .join("");
    }

    if (matrix) {
      matrix.innerHTML = topics
        .map(([topic, items]) => {
          const width = pct(items.length, total);
          const approved = items.filter((item) => item.contentStatus === "Approved").length;
          return `
            <article class="theme-row">
              <div>
                <strong>${escapeHtml(topic)}</strong>
                <span>${approved} approved · ${items.length} total</span>
              </div>
              <div class="theme-meter"><span style="width:${width}%"></span></div>
              <em>${width}%</em>
            </article>
          `;
        })
        .join("");
    }
  }

  function renderGoldenSourceLibrary() {
    const list = document.getElementById("goldenSourceList");
    if (!list) return;
    const sources = state.kb.filter((item) => item.sourceType === "External Reliable Source");
    list.innerHTML =
      sources
        .map(
          (item) => `
            <article class="source-library-card">
              <div class="source-library-head">
                <strong>${escapeHtml(item.title)}</strong>
                <span class="status-pill review">${escapeHtml(item.contentStatus)}</span>
              </div>
              <p>${escapeHtml(item.source)}</p>
              ${
                item.sourceUrl
                  ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.sourceUrl)}</a>`
                  : `<span class="muted-line">External source file / public website reference</span>`
              }
              <dl>
                <div><dt>Source Owner</dt><dd>${escapeHtml(item.owner || "Public Source Owner")}</dd></div>
                <div><dt>Published / Captured</dt><dd>${escapeHtml(item.publishedDate || item.lastReview)} / ${escapeHtml(item.lastReview)}</dd></div>
                <div><dt>Validity</dt><dd>${escapeHtml(daysUntil(item.nextReview) < 0 ? "Expired" : "Active")}</dd></div>
                <div><dt>Related Topic</dt><dd>${escapeHtml(safeTheme(item))}</dd></div>
                <div><dt>Extracted KB</dt><dd>${escapeHtml(item.id)}</dd></div>
                <div><dt>Review Need</dt><dd>${item.contentStatus === "Approved" ? "Project signoff" : "SME review required"}</dd></div>
              </dl>
              <div class="tag-row">${(item.tags || []).slice(0, 6).map((tag) => `<span class="tag">#${escapeHtml(tag).replace(/^#/, "")}</span>`).join("")}</div>
            </article>
          `
        )
        .join("") || `<div class="empty-state">No Golden Source items yet</div>`;
  }

  function renderSmeReviewedLibrary() {
    const list = document.getElementById("smeReviewedList");
    if (!list) return;
    const reviewed = state.kb.filter((item) => item.sourceType === "Internal Review");
    list.innerHTML =
      reviewed
        .map((item) => {
          const history = item.reviewHistory?.[0];
          return `
            <article class="source-library-card">
              <div class="source-library-head">
                <strong>${escapeHtml(item.title)}</strong>
                <span class="status-pill ${item.contentStatus === "Approved" ? "approved" : "review"}">${escapeHtml(item.contentStatus)}</span>
              </div>
              <p>${escapeHtml(item.answer)}</p>
              <dl>
                <div><dt>Owner</dt><dd>${escapeHtml(item.owner)}</dd></div>
                <div><dt>SME Reviewer</dt><dd>${escapeHtml(item.sme)}</dd></div>
                <div><dt>Review Date</dt><dd>${escapeHtml(item.lastReview)}</dd></div>
                <div><dt>Next Review</dt><dd>${escapeHtml(item.nextReview)}</dd></div>
                <div><dt>Approval Status</dt><dd>${escapeHtml(item.contentStatus)}</dd></div>
                <div><dt>Version</dt><dd>${escapeHtml(item.version || "v1.0")}</dd></div>
              </dl>
              <div class="audit-line">
                ${history ? `${escapeHtml(history.by)} · ${escapeHtml(history.action)} · ${escapeHtml(new Date(history.at).toLocaleDateString("en-GB"))}` : "Audit trail retained"}
              </div>
              <div class="tag-row">${(item.tags || []).slice(0, 6).map((tag) => `<span class="tag">#${escapeHtml(tag).replace(/^#/, "")}</span>`).join("")}</div>
            </article>
          `;
        })
        .join("") || `<div class="empty-state">No approved answer items yet</div>`;
  }

  function completedQuestionnaires() {
    const portfolio = buildQuestionnairePortfolio();
    return [
      {
        name: "AFME Post Trade DDQ 2026 Template",
        client: "HSBC HK Branch pilot",
        type: "AFME Excel",
        total: 28,
        finalAnswers: 28,
        kbVersion: "KB-2026.06-HK",
        approvals: "SME + Business + Compliance",
        signoff: "Final Signoff",
        submitted: "2026-06-07",
        reuse: "Reusable HSBC Securities Services / AFME topic answers and evidence tags",
      },
      {
        name: "Alpha Securities DDQ 2026",
        client: "Alpha Securities",
        type: "Word DDQ",
        total: portfolio[0].total,
        finalAnswers: state.questions.filter((q) => q.status === "approved").length,
        kbVersion: "KB-2026.06-Core",
        approvals: "SME in progress",
        signoff: `${portfolio[0].completion}% complete`,
        submitted: "Target 2026-06-28",
        reuse: "Highly similar to historical custody, fund accounting and InfoSec questions",
      },
      {
        name: "Global Custody RFP 2025 Renewal",
        client: "Global Asset Manager",
        type: "Excel RFP",
        total: 132,
        finalAnswers: 132,
        kbVersion: "KB-2025.12-Core",
        approvals: "Business + Compliance + Legal",
        signoff: "Submitted",
        submitted: "2025-12-18",
        reuse: "Can be used to compare custody, asset segregation and sub-custodian network questions",
      },
    ];
  }

  function renderCompletedQuestionnaireLibrary() {
    const list = document.getElementById("completedQuestionnaireList");
    if (!list) return;
    list.innerHTML = completedQuestionnaires()
      .map(
        (item) => `
          <article class="completed-card">
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.client)} · ${escapeHtml(item.type)} · ${escapeHtml(item.submitted)}</span>
            </div>
            <div class="completed-stats">
              <span><b>${escapeHtml(item.finalAnswers)}</b> final answers</span>
              <span><b>${escapeHtml(item.total)}</b> total questions</span>
              <span><b>${escapeHtml(item.kbVersion)}</b> knowledge version</span>
            </div>
            <p>${escapeHtml(item.reuse)}</p>
            <div class="tag-row">
              <span class="tag">${escapeHtml(item.approvals)}</span>
              <span class="tag">${escapeHtml(item.signoff)}</span>
              <span class="tag">Historical comparison enabled</span>
            </div>
          </article>
        `
      )
      .join("");
  }

  function healthTile(label, value, note) {
    return `<article class="health-tile"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span><span>${escapeHtml(note)}</span></article>`;
  }

  function groupCount(items, getter) {
    return items.reduce((acc, item) => {
      const key = getter(item) || "Unclassified";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function renderHealthDashboard() {
    const dashboard = document.getElementById("healthDashboard");
    const coverage = document.getElementById("themeCoverage");
    if (!dashboard || !coverage) return;

    const total = state.kb.length || 1;
    const approved = state.kb.filter((item) => item.contentStatus === "Approved").length;
    const inReview = state.kb.filter((item) => item.contentStatus === "In Review").length;
    const due = state.kb.filter((item) => daysUntil(item.nextReview) <= 45).length;
    const overdue = state.kb.filter((item) => daysUntil(item.nextReview) < 0).length;
    const internal = state.kb.filter((item) => item.sourceType === "Internal Review").length;
    const external = state.kb.filter((item) => item.sourceType === "External Reliable Source").length;
    const avgConfidence = Math.round(state.kb.reduce((sum, item) => sum + (item.confidence || item.trust || 0), 0) / total);
    const healthScore = Math.max(0, Math.min(100, Math.round(avgConfidence * 0.45 + (approved / total) * 35 + ((total - due) / total) * 20)));
    const signoffs = state.questions.filter((question) => question.signoffAt).length;
    const reviewQueue = state.questions.filter((question) => question.status === "review").length;

    const badge = document.getElementById("healthScoreBadge");
    if (badge) badge.textContent = `${healthScore}%`;

    dashboard.innerHTML = [
      dashboardTile("Health Score", `${healthScore}%`, "Confidence, approval rate and review timeliness"),
      dashboardTile("Approved Content", `${approved}/${total}`, `${inReview} items still in review`),
      dashboardTile("Review Due", due, `${overdue} items expired`),
      dashboardTile("Source Mix", `${internal}/${external}`, "Internal Review / External Reliable Source"),
      dashboardTile("SME Queue", reviewQueue, "Current pending review questions"),
      dashboardTile("Signoff", signoffs, "Signed-off answers"),
    ].join("");

    const byTheme = Object.entries(groupCount(state.kb, (item) => item.theme || item.section)).sort((a, b) => b[1] - a[1]);
    coverage.innerHTML = byTheme
      .map(([theme, count]) => {
        const pct = Math.round((count / total) * 100);
        const approvedTheme = state.kb.filter((item) => (item.theme || item.section) === theme && item.contentStatus === "Approved").length;
        return `
          <article class="theme-row">
            <div>
              <strong>${escapeHtml(theme)}</strong>
              <span>${approvedTheme} approved · ${count} total</span>
            </div>
            <div class="theme-meter"><span style="width:${pct}%"></span></div>
            <em>${pct}%</em>
          </article>
        `;
      })
      .join("");
  }

  function dashboardTile(label, value, note) {
    return `<article class="dashboard-tile"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><em>${escapeHtml(note)}</em></article>`;
  }

  function buildNotifications() {
    const reviewDue = state.kb
      .filter((item) => daysUntil(item.nextReview) <= 45)
      .map((item) => ({
        type: daysUntil(item.nextReview) < 0 ? "overdue" : "review",
        owner: item.sme || item.owner,
        title: `${item.title} requires review`,
        detail: `Next review: ${item.nextReview} · ${item.theme || item.section}`,
        target: item.id,
      }));

    const smeQueue = state.questions
      .filter((question) => question.status === "review")
      .map((question) => ({
        type: question.risk === "high" ? "high" : "review",
        owner: question.owner,
        title: `${question.id} awaiting SME review`,
        detail: `${question.section} · Confidence ${question.confidence || 0}%`,
        target: question.id,
      }));

    const risky = state.questions
      .filter((question) => question.risk === "high" && question.status !== "approved")
      .map((question) => ({
        type: "high",
        owner: question.owner,
        title: `${question.id} high-risk item pending`,
        detail: `${question.rules?.join(", ") || "Risk rule"} · ${question.section}`,
        target: question.id,
      }));

    return [...reviewDue, ...smeQueue, ...risky].slice(0, 80);
  }

  function renderNotifications() {
    const list = document.getElementById("notificationList");
    if (!list) return;
    const notifications = buildNotifications();
    list.innerHTML =
      notifications
        .map(
          (item) => `
            <article class="notification-item ${escapeHtml(item.type)}">
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.detail)}</span>
              </div>
              <div class="notification-meta">
                <span class="tag">${escapeHtml(item.owner)}</span>
                <button data-action="copy-reminder" data-target="${escapeHtml(item.target)}">Copy Reminder</button>
              </div>
            </article>
          `
        )
        .join("") || `<div class="empty-state">No reminders currently</div>`;
  }

  function renderRoles() {
    const matrix = document.getElementById("roleMatrix");
    if (!matrix) return;
    matrix.innerHTML = roleModel
      .map(
        (role) => `
          <article class="role-card">
            <h3>${escapeHtml(role.role)}</h3>
            <p>${escapeHtml(role.scope)}</p>
            <div class="tag-row">
              <span class="tag">${escapeHtml(role.defaultView)}</span>
              ${role.permissions.map((permission) => `<span class="tag">${escapeHtml(permission)}</span>`).join("")}
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderGovernance() {
    const cfg = window.AI_KUAIDA_GOVERNANCE;
    if (!cfg) return;

    const flow = document.getElementById("governanceFlow");
    if (flow) {
      flow.innerHTML = cfg.flowSteps
        .map(
          (step) => `
            <article class="flow-step">
              <span>${escapeHtml(step.id)}</span>
              <strong>${escapeHtml(step.title)}</strong>
              <p>${escapeHtml(step.detail)}</p>
              <em>${escapeHtml(step.output)}</em>
            </article>
          `
        )
        .join("");
    }

    const plan = document.getElementById("governancePlan");
    if (plan) {
      plan.innerHTML = [
        governanceBlock("Content Source Classification", cfg.sourceTypes, (item) => `${item.name}: ${item.usePolicy} Review cycle: ${item.reviewCycleDays} days. ${item.riskRule}`),
        governanceBlock("Lifecycle", cfg.lifecycle, (item) => `${item[0]}: ${item[1]}`),
        governanceBlock("Review and Reminder Rules", cfg.reviewRules, (item) => `${item.trigger} -> ${item.action} (${item.channel})`),
        governanceBlock("Health Scoring Model", cfg.healthModel, (item) => `${item.factor} · Weight ${item.weight} · ${item.formula}`),
      ].join("");
    }

    const hashtags = document.getElementById("hashtagTaxonomy");
    if (hashtags) {
      hashtags.innerHTML = cfg.hashtagTaxonomy
        .map(
          (item) => `
            <article class="governance-card">
              <strong>${escapeHtml(item.level)}</strong>
              <p>${escapeHtml(item.use)}</p>
              <div class="tag-row">${item.examples.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
            </article>
          `
        )
        .join("");
    }

    const fields = document.getElementById("afmeFields");
    if (fields) {
      fields.innerHTML = cfg.afmeWritebackFields
        .map(
          ([field, type, use]) => `
            <article class="field-row">
              <strong>${escapeHtml(field)}</strong>
              <span>${escapeHtml(type)}</span>
              <p>${escapeHtml(use)}</p>
            </article>
          `
        )
        .join("");
    }

    const dictionaries = document.getElementById("dropdownDictionaries");
    if (dictionaries) {
      dictionaries.innerHTML = Object.entries(cfg.dropdowns)
        .map(
          ([name, values]) => `
            <article class="dictionary-card">
              <strong>${escapeHtml(name)}</strong>
              <div class="tag-row">${values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")}</div>
            </article>
          `
        )
        .join("");
    }
  }

  function governanceBlock(title, items, formatter) {
    return `
      <article class="governance-card">
        <strong>${escapeHtml(title)}</strong>
        ${items.map((item) => `<p>${escapeHtml(formatter(item))}</p>`).join("")}
      </article>
    `;
  }

  function renderDataModel() {
    const model = window.AI_KUAIDA_MODEL;
    if (!model) return;
    const entityEl = document.getElementById("entityModel");
    if (entityEl) {
      entityEl.innerHTML = model.entities
        .map(
          (entity) => `
            <article class="entity-card">
              <h3>${escapeHtml(entity.name)}</h3>
              <p>${escapeHtml(entity.purpose)}</p>
              <div class="field-chip-row">${entity.fields.map((field) => `<span>${escapeHtml(field)}</span>`).join("")}</div>
            </article>
          `
        )
        .join("");
    }

    const relationshipEl = document.getElementById("relationshipModel");
    if (relationshipEl) {
      const relationships = `
        <article class="governance-card">
          <strong>Core Relationships</strong>
          ${model.relationships.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
        </article>
      `;
      const statuses = Object.entries(model.statuses)
        .map(
          ([name, values]) => `
            <article class="governance-card">
              <strong>${escapeHtml(name)} status</strong>
              <div class="tag-row">${values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")}</div>
            </article>
          `
        )
        .join("");
      relationshipEl.innerHTML = relationships + statuses;
    }

    const statusEl = document.getElementById("statusConfigurationList");
    if (statusEl) {
      statusEl.innerHTML = Object.entries(model.statuses)
        .map(
          ([name, values]) => `
            <article class="governance-card">
              <strong>${escapeHtml(name)} Status</strong>
              <p>Used to control ${escapeHtml(name)} object lifecycle, operating permissions, reminders and export gates within the platform.</p>
              <div class="tag-row">${values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")}</div>
            </article>
          `
        )
        .join("");
    }
  }

  function modelNavigation() {
    return (window.AI_KUAIDA_MODEL && window.AI_KUAIDA_MODEL.navigation) || [
      { id: "workspace", label: "Recommendation Engines", defaultView: "workbench", views: [{ id: "workbench", label: "Recommendation Workbench" }] },
    ];
  }

  function activeModuleForView(viewId) {
    return modelNavigation().find((module) => module.views.some((view) => view.id === viewId)) || modelNavigation()[0];
  }

  function setActiveView(viewId) {
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    const target = document.getElementById(viewId);
    if (target) target.classList.add("active");

    const module = activeModuleForView(viewId);
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.module === module.id);
    });
    renderModuleSubnav(module.id, viewId);
  }

  function renderModuleSubnav(moduleId = "workspace", activeViewId) {
    const subnav = document.getElementById("moduleSubnav");
    if (!subnav) return;
    const module = modelNavigation().find((item) => item.id === moduleId) || modelNavigation()[0];
    const active = activeViewId || module.defaultView;
    subnav.innerHTML = `
      <div>
        <p class="eyebrow">Current Module</p>
        <strong>${escapeHtml(module.label)}</strong>
      </div>
      <div class="module-tabs">
        ${module.views
          .filter((view) => !view.hidden)
          .map((view) => `<button class="${view.id === active ? "active" : ""}" data-subview="${escapeHtml(view.id)}">${escapeHtml(view.label)}</button>`)
          .join("")}
      </div>
    `;
  }

  function reminderText(item) {
    return `Reminder: ${item.title}\nOwner: ${item.owner}\nDetail: ${item.detail}\nTarget: ${item.target}\nGenerated by AI Kuaida on 2026-06-07`;
  }

  function exportReminderEmails() {
    const notifications = buildNotifications();
    const body =
      notifications.map((item, index) => `#${index + 1}\n${reminderText(item)}`).join("\n\n---\n\n") ||
      "No active reminders.";
    downloadBlob(body, "AI_Kuaida_Automated_Reminder_Email_Draft.txt", "text/plain;charset=utf-8");
    addAudit("Generate reminder email draft", "ALL");
    toast("Reminder email draft generated");
  }

  function exportClientEmail() {
    const ready = state.questions.filter((question) => question.status === "approved");
    const body = [
      "Subject: RFP/DDQ response package - Alpha Securities DDQ 2026",
      "",
      "Dear Client,",
      "",
      "Please find below the approved response summary for your RFP/DDQ. The full Word and Excel response files can be attached from AI Kuaida exports.",
      "",
      ...(ready.length
        ? ready.map((question) => `${question.id} - ${question.section}\nQ: ${question.text}\nA: ${question.draft || ""}\nSignoff: ${question.signoffBy || question.owner || "SME"} ${question.signoffAt ? new Date(question.signoffAt).toLocaleString("en-GB") : ""}`)
        : ["No approved answers are ready for client distribution."]),
      "",
      "Regards,",
      "HSBC Securities Services team",
    ].join("\n\n");
    downloadBlob(body, "AI_Kuaida_Client_Email_Draft.txt", "text/plain;charset=utf-8");
    addAudit("Generate client email draft", "ALL");
    toast("Client email draft generated");
  }

  function renderApprovals() {
    const columns = [
      ["draft", "Draft"],
      ["review", "Pending Review"],
      ["changes", "Changes Required"],
      ["approved", "Approved"],
    ];
    document.getElementById("approvalBoard").innerHTML = columns
      .map(([status, label]) => {
        const cards = state.questions
          .filter((question) => question.status === status)
          .map(
            (question) => `
              <article class="approval-card">
                <h3>${escapeHtml(question.id)} · ${escapeHtml(question.section)}</h3>
                <p>${escapeHtml(question.text)}</p>
                <div class="tag-row">
                  <span class="tag">${escapeHtml(question.owner)}</span>
                  <span class="risk-pill ${(riskMeta[question.risk] || riskMeta.low).className}">${(riskMeta[question.risk] || riskMeta.low).label}</span>
                </div>
              </article>
            `
          )
          .join("");
        return `<div class="approval-column"><h3>${label}</h3>${cards || `<div class="empty-state">None</div>`}</div>`;
      })
      .join("");
  }

  function renderRiskCenter() {
    const risky = state.questions.filter((question) => question.risk !== "low");
    document.getElementById("riskList").innerHTML =
      risky
        .map((question) => {
          const meta = riskMeta[question.risk] || riskMeta.medium;
          const rules = qualityRules.filter((rule) => (question.rules || []).includes(rule.id));
          return `
            <article class="risk-item ${meta.className}">
              <h3>${escapeHtml(question.id)} · ${escapeHtml(question.section)}</h3>
              <p>${escapeHtml(question.text)}</p>
              <div class="tag-row">
                <span class="risk-pill ${meta.className}">${meta.label}</span>
                <span class="tag">${escapeHtml(question.owner)}</span>
                ${rules.map((rule) => `<span class="tag">${escapeHtml(rule.id)}</span>`).join("")}
              </div>
            </article>
          `;
        })
        .join("") || `<div class="empty-state">There are currently no medium- or high-risk questions</div>`;
  }

  function renderRiskSignals() {
    const el = document.getElementById("riskSignalList");
    if (!el) return;
    const signals = [
      {
        title: "High Risk Questions",
        count: state.questions.filter((question) => question.risk === "high").length,
        note: "Triggers rules for regulation, client data or absolute wording",
      },
      {
        title: "Low Confidence Answers",
        count: state.questions.filter((question) => (question.confidence || 0) < 75).length,
        note: "Confidence below 75%; manual confirmation is required",
      },
      {
        title: "Expired Source Used",
        count: state.questions.filter((question) => (question.matches || []).some((item) => daysUntil(item.nextReview) < 0)).length,
        note: "Direct writeback to the final client template is blocked",
      },
      {
        title: "Draft Content Used",
        count: state.questions.filter((question) => question.status === "draft").length,
        note: "Draft content cannot be exported",
      },
      {
        title: "Missing Source",
        count: state.questions.filter((question) => !(question.matches || []).length).length,
        note: "Content missing a source cannot be exported",
      },
      {
        title: "SLA Breach Risk",
        count: buildMyTasks().filter((task) => daysUntil(task.dueDate) <= 2 && task.status !== "Final Approved").length,
        note: "Tasks due within two days or already overdue",
      },
    ];
    el.innerHTML = signals
      .map(
        (signal) => `
          <article class="rule-item">
            <strong>${escapeHtml(signal.title)}</strong>
            <p>${escapeHtml(signal.note)}</p>
            <span class="risk-pill ${signal.count ? "high" : "low"}">${escapeHtml(signal.count)}</span>
          </article>
        `
      )
      .join("");
  }

  function renderRules() {
    const el = document.getElementById("ruleList");
    if (!el) return;
    el.innerHTML = [
      {
        id: "GATE01",
        name: "Confidence Score < 75%",
        severity: "medium",
        action: "Manual confirmation is required; it must not automatically enter the final submission version.",
        keywords: ["confidence", "manual confirmation"],
      },
      {
        id: "GATE02",
        name: "High Risk",
        severity: "high",
        action: "SME Review is required and triggers Compliance, Legal or InfoSec by topic.",
        keywords: ["high risk", "SME review"],
      },
      {
        id: "GATE03",
        name: "Draft / Expired / Missing Source",
        severity: "high",
        action: "Draft, Expired or Missing Source content cannot be exported.",
        keywords: ["draft", "expired", "missing source"],
      },
      {
        id: "GATE04",
        name: "Audit Trail Required",
        severity: "medium",
        action: "All final answers must retain review, sign-off, source and writeback records.",
        keywords: ["audit trail", "signoff"],
      },
      ...qualityRules,
    ]
      .map(
        (rule) => `
          <article class="rule-item">
            <strong>${escapeHtml(rule.id)} · ${escapeHtml(rule.name)}</strong>
            <p>${escapeHtml(rule.action)}</p>
            <div class="tag-row">
              <span class="risk-pill ${rule.severity === "high" ? "high" : "medium"}">${rule.severity === "high" ? "High" : "Medium"}</span>
              ${rule.keywords.slice(0, 4).map((keyword) => `<span class="tag">${escapeHtml(keyword)}</span>`).join("")}
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderOffice() {
    const approved = state.questions.filter((q) => q.status === "approved").length;
    const now = "2026-06-07 19:58";
    const rows = [
      ["Word", "Client Response Pack", "Answer body / Comment history", approved >= 2 ? "Ready" : "Preview", "RFP PM", now, "v0.9", "Preview / Export"],
      ["Excel", "Answer Matrix", "Answer / Owner / Confidence / Status", "Ready", "RFP PM", now, "v0.9", "Download"],
      ["AFME", "AFME 2026 Template", "Answer Column / Internal Audit Columns", "Ready", "Securities Services PM", now, "v1.0", "Writeback"],
      ["Word", "Internal Audit Version", "Sources / Risk Tags / Signoff Trail", state.audit.length ? "Ready" : "Preview", "System", now, "v0.8", "Export"],
      ["Excel", "Writeback Log", "File / Cell / Status / Error / Retry", "Ready", "System", now, "v1.0", "View Log"],
    ];
    document.getElementById("officeMatrix").innerHTML = `
      <div class="table-wrap flat-table-wrap">
        <table class="export-table">
          <thead>
            <tr>
              <th>File Type</th>
              <th>Template Name</th>
              <th>Writeback Target</th>
              <th>Status</th>
              <th>Last Exported By</th>
              <th>Last Exported Time</th>
              <th>Version</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                ([fileType, template, target, status, by, time, version, action]) => `
                  <tr>
                    <td>${escapeHtml(fileType)}</td>
                    <td class="question-cell"><strong>${escapeHtml(template)}</strong></td>
                    <td>${escapeHtml(target)}</td>
                    <td><span class="status-pill ${status === "Ready" ? "approved" : "review"}">${escapeHtml(status)}</span></td>
                    <td>${escapeHtml(by)}</td>
                    <td>${escapeHtml(time)}</td>
                    <td>${escapeHtml(version)}</td>
                    <td><button>${escapeHtml(action)}</button></td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPreview() {
    const questions = state.questions.filter((question) => question.status === "approved" || question.status === "review");
    document.getElementById("submissionPreview").innerHTML =
      questions
        .map(
          (question) => `
            <article class="preview-answer">
              <h3>${escapeHtml(question.id)} · ${escapeHtml(question.section)}</h3>
              <p><strong>Q:</strong> ${escapeHtml(question.text)}</p>
              <p><strong>A:</strong> ${escapeHtml(question.draft || "")}</p>
            </article>
          `
        )
        .join("") || `<div class="empty-state">No submittable content yet</div>`;
  }

  function renderInsights() {
    const pack = window.HSBC_AFME_PACK || {};
    const stats = pack.afmeStats || [];
    const recommendations = pack.recommendations || [];
    const sourcePack = pack.sourcePack || {};
    const total = stats.reduce((sum, item) => sum + Number(item.count || 0), 0);

    const statsMarkup = [
      `<article class="stat-summary">
        <strong>${total}</strong>
        <span>AFME 2026 answerable question rows</span>
        <p>${escapeHtml(sourcePack.disclaimer || "")}</p>
      </article>`,
      ...stats.map(
        (item) => `
          <article class="stat-row">
            <div>
              <strong>${escapeHtml(item.section)}</strong>
              <span>${escapeHtml(item.note)}</span>
            </div>
            <div class="stat-number">
              <strong>${escapeHtml(item.count)}</strong>
              <span>${escapeHtml(item.share)}</span>
            </div>
          </article>
        `
      ),
      `<article class="source-box">
        <strong>Sources</strong>
        ${(sourcePack.sources || [])
          .map((source) => `<p><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a> · ${escapeHtml(source.note)}</p>`)
          .join("")}
      </article>`,
    ].join("");

    const recommendationsMarkup =
      recommendations
        .map(
          (item) => `
            <article class="rule-item">
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.detail)}</p>
            </article>
          `
        )
        .join("") || `<div class="empty-state">No recommendations yet</div>`;

    const statsEl = document.getElementById("afmeStats");
    const recEl = document.getElementById("recommendationList");
    if (statsEl) statsEl.innerHTML = statsMarkup;
    if (recEl) recEl.innerHTML = recommendationsMarkup;
  }

  function setStatus(status) {
    const question = getSelectedQuestion();
    if (!question) return;
    question.status = status;
    question.reviewStatus = statusMeta[status]?.label || status;
    if (status !== "approved") {
      question.signoffBy = "";
      question.signoffAt = "";
    }
    question.updatedAt = new Date().toISOString();
    addAudit(`Status changed to ${statusMeta[status].label}`, question.id);
    toast(`Updated ${question.id}`);
    renderAll();
  }

  function addReviewComment(action = "Comment") {
    const question = getSelectedQuestion();
    const editor = document.getElementById("commentEditor");
    if (!question || !editor) return;
    const text = editor.value.trim() || (action === "Signoff" ? "Approved for client response subject to final project packaging." : "Reviewed by SME.");
    question.reviewComments = question.reviewComments || [];
    question.reviewComments.unshift({
      by: question.owner || "SME",
      action,
      text,
      at: new Date().toISOString(),
    });
    question.updatedAt = new Date().toISOString();
    addAudit(`${action}: ${text.slice(0, 36)}`, question.id);
  }

  function signoffQuestion() {
    const question = getSelectedQuestion();
    if (!question) return;
    addReviewComment("Signoff");
    question.status = "approved";
    question.reviewStatus = "Approved / Signed off";
    question.signoffBy = question.owner || "SME";
    question.signoffAt = new Date().toISOString();
    question.updatedAt = new Date().toISOString();
    toast(`${question.id} has completed sign-off`);
    renderAll();
  }

  function generateForQuestion(question) {
    const analyzed = analyzeQuestion(question.text);
    question.draft = analyzed.draft;
    question.confidence = analyzed.confidence;
    question.risk = analyzed.risk;
    question.rules = analyzed.rules;
    question.matches = analyzed.matches;
    question.sourceType = analyzed.matches?.[0]?.sourceType || "Pending Match";
    question.reviewStatus = question.status === "approved" ? "Pending Re-review" : statusMeta[question.status]?.label || "Draft";
    question.status = question.status === "approved" ? "review" : question.status;
    question.updatedAt = new Date().toISOString();
    addAudit("Regenerate AI draft", question.id);
  }

  function generateAllDrafts() {
    state.questions.forEach((question) => generateForQuestion(question));
    toast("All drafts generated");
    renderAll();
  }

  function useSource(kbId) {
    const question = getSelectedQuestion();
    const kb = state.kb.find((item) => item.id === kbId);
    if (!question || !kb) return;
    question.draft = `${kb.answer}\n\nSource basis: ${kb.source}.`;
    const rules = triggeredRules(`${question.text} ${question.draft}`);
    question.rules = rules;
    question.risk = levelFromRules(rules);
    question.confidence = Math.max(question.confidence || 0, Math.min(96, kb.trust - (question.risk === "high" ? 14 : 3)));
    question.matches = getMatches(question.text);
    question.sourceType = kb.sourceType || inferSourceType(kb);
    question.reviewStatus = question.status === "approved" ? "Approved" : "Pending SME Review";
    question.updatedAt = new Date().toISOString();
    addAudit(`Applied knowledge item ${kb.id}`, question.id);
    toast(`Applied ${kb.id}`);
    renderAll();
  }

  function handleImport(file) {
    if (!file) return;
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (["doc", "docx", "xls", "xlsx", "pdf"].includes(ext)) {
      const templates = ((window.HSBC_AFME_PACK && window.HSBC_AFME_PACK.questions) || defaultQuestions).slice(0, 10);
      appendImportedQuestions(
        templates.map((item) => item.text),
        file.name
      );
      toast(`Parsed ${file.name}`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const imported = extractQuestions(text);
      if (!imported.length) {
        toast("No questions identified");
        return;
      }
      appendImportedQuestions(imported, file.name);
    };
    reader.readAsText(file, "utf-8");
  }

  function appendImportedQuestions(imported, fileName) {
    const nextNumber = state.questions.length + 1;
    imported.forEach((questionText, index) => {
      const id = `Q${String(nextNumber + index).padStart(3, "0")}`;
      const analyzed = analyzeQuestion(questionText);
      state.questions.push(
        normalizeQuestion({
          id,
          text: questionText,
          section: detectSection(questionText),
          owner: detectOwner(questionText),
          status: "draft",
          tags: detectTags(questionText),
          importedFrom: fileName,
          sourceType: analyzed.matches?.[0]?.sourceType || "Pending Match",
          ...analyzed,
          updatedAt: new Date().toISOString(),
        })
      );
      addAudit(`Imported question from ${fileName}`, id);
    });
    state.selectedId = state.questions[state.questions.length - imported.length].id;
    state.mapping.questionnaireName = fileName.replace(/\.[^.]+$/, "");
    state.mapping.detectedTemplateType = /\.(xlsx?|csv)$/i.test(fileName) ? "Excel / AFME-like Template" : /\.(docx?|pdf)$/i.test(fileName) ? "Word / PDF DDQ Template" : "Custom DDQ / RFP Template";
    runHistoricalMapping({ autoFill: true, preserveExistingDraft: false });
    toast(`Imported ${imported.length} questions and completed Historical Match plus Knowledge Validation`);
    renderAll();
  }

  function extractQuestions(text) {
    return unique(
      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const csvFirst = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)[0];
          return csvFirst.replace(/^["'\s]*(?:\d+[\).ใ€-]\s*)?/, "").replace(/["']$/g, "").trim();
        })
        .filter((line) => line.length > 18)
        .filter((line) => /[??]|describe|explain|provide|how|what|whether|please|describe/i.test(line))
    ).slice(0, 80);
  }

  function detectTags(text) {
    const lower = text.toLowerCase();
    const tags = [];
    for (const kb of state.kb) {
      for (const tag of kb.tags) {
        if (lower.includes(tag.toLowerCase())) tags.push(tag);
      }
    }
    return unique(tags).slice(0, 4).length ? unique(tags).slice(0, 4) : ["RFP", "DDQ"];
  }

  function detectSection(text) {
    const lower = text.toLowerCase();
    if (/security|privacy|data|information|privacy/.test(lower)) return "Information Security";
    if (/nav|valuation|fund accounting/.test(lower)) return "Fund Accounting";
    if (/kyc|aml|sanction|compliance|regulatory/.test(lower)) return "Compliance";
    if (/custody|asset|sub-custodian|network/.test(lower)) return "Custody";
    if (/sla|incident|service/.test(lower)) return "Client Service";
    if (/business continuity|disaster|resilience|bcp/.test(lower)) return "Operational Resilience";
    return "General DDQ";
  }

  function detectOwner(text) {
    const section = detectSection(text);
    const map = {
      "Information Security": "InfoSec",
      "Fund Accounting": "Fund Accounting SME",
      Compliance: "Compliance",
      Custody: "Custody SME",
      "Client Service": "Client Service",
      "Operational Resilience": "Operations Resilience",
      "General DDQ": "Product SME",
    };
    return map[section] || "Product SME";
  }

  function exportWord() {
    const rows = state.questions
      .map(
        (question) => `
          <h2>${escapeHtml(question.id)} - ${escapeHtml(question.section)}</h2>
          <p><strong>Question:</strong> ${escapeHtml(question.text)}</p>
          <p><strong>Answer:</strong></p>
          <p>${escapeHtml(question.draft || "").replace(/\n/g, "<br>")}</p>
          <p><strong>Status:</strong> ${escapeHtml(statusMeta[question.status]?.label || question.status)}
          | <strong>Confidence:</strong> ${question.confidence || 0}%
          | <strong>Risk:</strong> ${escapeHtml(riskMeta[question.risk]?.label || question.risk)}</p>
        `
      )
      .join("<hr>");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>AI Kuaida Client Submission Version</title></head><body>${rows}</body></html>`;
    downloadBlob(html, "AI_Kuaida_RFP_DDQ_Client_Submission_Version.doc", "application/msword;charset=utf-8");
    addAudit("Export Word", "ALL");
    toast("Word-compatible file exported");
  }

  function reviewHistorySummary(question) {
    return (question.reviewComments || [])
      .map((comment) => `${comment.by} ${comment.action} ${new Date(comment.at).toLocaleString("en-GB")}: ${comment.text}`)
      .join(" | ");
  }

  function exportExcel() {
    const header = [
      "question_number",
      "question_section",
      "question",
      "Answer",
      "Owner",
      "confidence",
      "Review Status",
      "Review Record",
      "Source Type",
      "Sources",
      "Risk",
      "Signoff By",
      "Signoff At",
    ];
    const rows = state.questions.map((question) => [
      question.id,
      question.section,
      question.text,
      question.draft || "",
      question.owner,
      `${question.confidence || 0}%`,
      question.reviewStatus || statusMeta[question.status]?.label || question.status,
      reviewHistorySummary(question),
      question.sourceType || "Pending Match",
      (question.matches || []).map((item) => item.source || item.title).join("; "),
      riskMeta[question.risk]?.label || question.risk,
      question.signoffBy || "",
      question.signoffAt ? new Date(question.signoffAt).toLocaleString("en-GB") : "",
    ]);
    const tableRows = [header, ...rows]
      .map((row, index) => `<tr>${row.map((cell) => `<${index ? "td" : "th"}>${escapeHtml(cell)}</${index ? "td" : "th"}>`).join("")}</tr>`)
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,"Microsoft YaHei",sans-serif}table{border-collapse:collapse}th,td{border:1px solid #9aa8b5;padding:6px;vertical-align:top}th{background:#d9eaf7}</style></head><body><table>${tableRows}</table></body></html>`;
    downloadBlob(html, "AI_Kuaida_AFME_Answer_Matrix.xls", "application/vnd.ms-excel;charset=utf-8");
    addAudit("Export AFME Excel Matrix", "ALL");
    toast("AFME Excel matrix exported");
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function toast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => el.classList.remove("show"), 1800);
  }

  function moveWorkflowStage(index, delta) {
    ensureCustomWorkflow();
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= state.workflow.customStages.length) return;
    const stages = state.workflow.customStages;
    [stages[index], stages[nextIndex]] = [stages[nextIndex], stages[index]];
    addAudit("Adjust workflow stage order", "WORKFLOW");
    renderAll();
  }

  function duplicateWorkflowStage(index) {
    ensureCustomWorkflow();
    const ref = state.workflow.customStages[index];
    if (!ref) return;
    const copyRef = createStageRef(libraryIdFromStageRef(ref));
    state.workflow.customStages.splice(index + 1, 0, copyRef);
    const currentName = state.workflow.stageOverrides[ref] || stageByLibraryId(libraryIdFromStageRef(ref))?.name || "Stage";
    state.workflow.stageOverrides[copyRef] = `${currentName} Copy`;
    addAudit("Duplicate workflow stage", "WORKFLOW");
    toast("Stage duplicated");
    renderAll();
  }

  function removeWorkflowStage(index) {
    ensureCustomWorkflow();
    const [removed] = state.workflow.customStages.splice(index, 1);
    if (removed) delete state.workflow.stageOverrides[removed];
    addAudit("Remove workflow stage", "WORKFLOW");
    toast("Stage removed");
    renderAll();
  }

  function renameWorkflowStage(index) {
    ensureCustomWorkflow();
    const ref = state.workflow.customStages[index];
    const stage = activeWorkflowStages()[index];
    if (!ref || !stage) return;
    const nextName = window.prompt("Rename workflow stage", stage.displayName);
    if (!nextName) return;
    state.workflow.stageOverrides[ref] = nextName.trim();
    addAudit(`Renamed workflow stage: ${nextName.trim()}`, "WORKFLOW");
    renderAll();
  }

  function addWorkflowStage(libraryId) {
    ensureCustomWorkflow();
    state.workflow.customStages.push(createStageRef(libraryId));
    addAudit(`Added workflow stage: ${libraryId}`, "WORKFLOW");
    toast("Stage added");
    renderAll();
  }

  function simulateReassignment() {
    const question = getSelectedQuestion();
    state.workflow.reassignments.unshift({
      item: `${question?.id || "QNEW"} ${question?.section || "Selected Question"}`,
      originalOwner: question?.owner || "SME A",
      reassignedTo: "Specialist Reviewer",
      scope: "Single Question",
      reason: "Need specialist input",
      acceptanceStatus: "Pending Acceptance",
      dueDate: isoDate(addDays(APP_TODAY, 3)),
      pmAction: "Follow up",
      count: 1,
    });
    addAudit("Simulate Re-assign Reviewer", question?.id || "WORKFLOW");
    toast("Added to re-assignment tracker");
    renderAll();
  }

  function ensureLibraryGovernanceLayout() {
    const library = document.getElementById("library");
    const stack = library?.querySelector(".library-dashboard-stack");
    const hero = library?.querySelector(".library-search-hero");
    if (!library || !stack || !hero || document.getElementById("contentGovernance")) return;

    hero.classList.add("search-first");
    const heroTitle = hero.querySelector("h2");
    if (heroTitle) heroTitle.textContent = "Find the best approved, content-first answer";
    if (!hero.querySelector(".hero-support")) {
      heroTitle?.insertAdjacentHTML(
        "afterend",
        `<p class="hero-support">Use curated thematic content first, then validate product-owner material and historical examples as supporting sources. Every answer should show ownership, approval status, version and source citation.</p>`
      );
    }
    const globalInput = document.getElementById("globalLibrarySearchInput");
    if (globalInput) globalInput.placeholder = "Paste a client question, or search by theme, product, market, source, owner or hashtag...";
    const globalResults = document.getElementById("globalLibrarySearchResults");
    if (globalResults && !document.getElementById("libraryScopeTabs")) {
      globalResults.insertAdjacentHTML("beforebegin", `<div id="libraryScopeTabs" class="library-scope-tabs"></div>`);
    }

    const governance = document.createElement("section");
    governance.id = "contentGovernance";
    governance.className = "view";
    const governanceStack = document.createElement("div");
    governanceStack.className = "library-dashboard-stack";
    governance.appendChild(governanceStack);

    [...stack.children].forEach((child) => {
      if (child !== hero) governanceStack.appendChild(child);
    });

    governanceStack.insertAdjacentHTML(
      "afterbegin",
      `
        <section class="panel action-center-panel">
          <div class="panel-head compact">
            <div>
              <p class="eyebrow">Knowledge Governance Action Centre</p>
              <h2>What needs action?</h2>
            </div>
            <span class="stage-pill">Search first, reuse safely, govern continuously</span>
          </div>
          <div id="governanceActionCards" class="action-card-grid"></div>
        </section>
        <section class="panel">
          <div class="panel-head compact">
            <div>
              <p class="eyebrow">Governance Kanban</p>
              <h2>Open -> Assigned -> In Review -> Resolved -> Archived</h2>
            </div>
          </div>
          <div id="governanceKanban" class="governance-kanban"></div>
        </section>
      `
    );

    governanceStack.insertAdjacentHTML(
      "beforeend",
      `
        <div class="library-dashboard-grid">
          <section class="panel">
            <div class="panel-head compact">
              <div>
                <p class="eyebrow">Candidate Queue</p>
                <h2>Reusable answers submitted from Recommendation Engines</h2>
              </div>
            </div>
            <div id="candidateQueue" class="export-list"></div>
          </section>
          <section class="panel">
            <div class="panel-head compact">
              <div>
                <p class="eyebrow">Duplicate & Conflict Review</p>
                <h2>Resolve duplicate answers and outdated versions</h2>
              </div>
            </div>
            <div id="duplicateConflictPanel" class="export-list"></div>
          </section>
        </div>
        <div class="library-dashboard-grid">
          <section class="panel">
            <div class="panel-head compact">
              <div>
                <p class="eyebrow">Content Lifecycle</p>
                <h2>Candidate -> Review -> Approved -> Used -> Review Again</h2>
              </div>
            </div>
            <div id="contentLifecyclePanel" class="lifecycle-strip"></div>
          </section>
          <section class="panel">
            <div class="panel-head compact">
              <div>
                <p class="eyebrow">Governance Actions</p>
                <h2>Batch operations</h2>
              </div>
            </div>
            <div id="governanceActions" class="governance-action-grid"></div>
          </section>
        </div>
        <section class="panel">
          <div class="panel-head compact">
            <div>
              <p class="eyebrow">Content Detail</p>
              <h2>Answer, sources, ownership, usage, review and audit trail</h2>
            </div>
          </div>
          <div id="contentDetailPanel" class="content-detail-grid"></div>
        </section>
      `
    );

    const layout = document.createElement("div");
    layout.className = "library-search-layout";
    const status = document.createElement("aside");
    status.className = "panel library-status-panel";
    status.innerHTML = `
      <div class="panel-head compact">
        <div>
          <p class="eyebrow">Knowledge Hub Status Summary</p>
          <h2>Content readiness</h2>
        </div>
      </div>
      <div id="libraryStatusSummary" class="status-summary-grid"></div>
      <div id="libraryQuickLinks" class="quick-link-list"></div>
    `;
    layout.appendChild(hero);
    layout.appendChild(status);
    library.innerHTML = "";
    library.appendChild(layout);
    library.insertAdjacentElement("afterend", governance);

    const sourceHeader = document.querySelector("#goldenSource .panel-head h2");
    const sourceEyebrow = document.querySelector("#goldenSource .panel-head .eyebrow");
    const approvedHeader = document.querySelector("#smeReviewed .panel-head h2");
    const approvedEyebrow = document.querySelector("#smeReviewed .panel-head .eyebrow");
    const historicalHeader = document.querySelector("#completedLibrary .panel-head h2");
    const historicalEyebrow = document.querySelector("#completedLibrary .panel-head .eyebrow");
    if (sourceEyebrow) sourceEyebrow.textContent = "Sources";
    if (sourceHeader) sourceHeader.textContent = "Evidence layer for approved answers";
    if (approvedEyebrow) approvedEyebrow.textContent = "Approved Answers";
    if (approvedHeader) approvedHeader.textContent = "Reusable standard answers";
    if (historicalEyebrow) historicalEyebrow.textContent = "Historical Questionnaires";
    if (historicalHeader) historicalHeader.textContent = "Historical reuse, mapping and auto-fill library";

    const approvedList = document.getElementById("smeReviewedList");
    if (approvedList && !document.getElementById("approvedThemeView")) {
      approvedList.insertAdjacentHTML(
        "beforebegin",
        `
          <div class="library-dashboard-grid inline-library-views">
            <section class="panel soft-panel">
              <div class="panel-head compact"><div><p class="eyebrow">By Theme / Topic</p><h2>Coverage and review load</h2></div></div>
              <div id="approvedThemeView" class="export-list"></div>
            </section>
            <section class="panel soft-panel">
              <div class="panel-head compact"><div><p class="eyebrow">By SME Owner</p><h2>Ownership and workload</h2></div></div>
              <div id="approvedOwnerView" class="export-list"></div>
            </section>
          </div>
        `
      );
    }

    const sourceList = document.getElementById("goldenSourceList");
    if (sourceList && !document.getElementById("sourceThemeView")) {
      sourceList.insertAdjacentHTML(
        "beforebegin",
        `
          <div class="library-dashboard-grid inline-library-views">
            <section class="panel soft-panel">
              <div class="panel-head compact"><div><p class="eyebrow">Sources by Theme</p><h2>Evidence coverage and freshness</h2></div></div>
              <div id="sourceThemeView" class="export-list"></div>
            </section>
            <section class="panel soft-panel">
              <div class="panel-head compact"><div><p class="eyebrow">Source Detail</p><h2>Clickable evidence and linked answers</h2></div></div>
              <div id="sourceDetailPanel" class="source-detail-panel"></div>
            </section>
          </div>
        `
      );
    }
  }

  function governanceReason(item) {
    if (!item.owner) return "Missing Owner";
    if (!item.source) return "Missing Source";
    if (daysUntil(item.nextReview) < 0) return "Expired";
    if (daysUntil(item.nextReview) <= 45 && (item.usageCount || item.trust || 0) >= 80) return "High Usage but Expiring Soon";
    if ((item.confidence || item.trust || 0) < 75) return "Low Confidence";
    if (item.contentStatus === "In Review" || item.contentStatus === "Needs Review") return "SME Feedback Required";
    return "Scheduled Review";
  }

  function governancePriority(item) {
    const reason = governanceReason(item);
    if (["Expired", "Missing Source", "High Usage but Expiring Soon"].includes(reason)) return "High";
    if (["Missing Owner", "Low Confidence", "SME Feedback Required"].includes(reason)) return "Medium";
    return "Low";
  }

  function governanceIssueItems() {
    const candidates = libraryCandidateRows();
    const sourceRefresh = state.kb.filter((item) => sourceValidity(item) !== "Active").length;
    const missingOwner = state.kb.filter((item) => !item.owner || /unassigned|missing/i.test(item.owner)).length;
    const conflicts = Object.entries(groupCount(state.kb, safeTheme)).filter(([, count]) => count > 1).length;
    const highUsageExpiring = state.kb.filter((item) => daysUntil(item.nextReview) <= 45 && (item.usageCount || item.trust || 0) >= 80).length;
    return [
      ["Needs Review", state.kb.filter((item) => item.contentStatus === "Needs Review" || item.contentStatus === "In Review" || daysUntil(item.nextReview) <= 45).length, "Review / Assign Owner", "needs-review"],
      ["High Usage Expiring Soon", highUsageExpiring, "Refresh or re-approve", "high-usage"],
      ["Missing Owner", missingOwner, "Assign Owner", "missing-owner"],
      ["Conflicting Answers", conflicts, "Compare / Merge", "conflicts"],
      ["Candidates Waiting Approval", candidates.length, "Open Candidate Queue", "candidates"],
      ["Sources Need Refresh", sourceRefresh, "Refresh Source", "sources-refresh"],
    ];
  }

  function governanceKanbanRows(priorityItems) {
    const cards = priorityItems.slice(0, 15).map((item, index) => ({
      title: item.title,
      issue: governanceReason(item),
      owner: item.owner || "Unassigned",
      dueDate: item.nextReview || "--",
      priority: governancePriority(item),
      topic: safeTheme(item),
      usage: item.usageCount || Math.max(1, Math.round((item.trust || 70) / 10)),
      status: index % 5 === 0 ? "Archived" : index % 5 === 1 ? "Resolved" : index % 5 === 2 ? "In Review" : index % 5 === 3 ? "Assigned" : "Open",
    }));
    return ["Open", "Assigned", "In Review", "Resolved", "Archived"].map((status) => ({
      status,
      cards: cards.filter((card) => card.status === status),
    }));
  }

  function sourceValidity(item) {
    if (daysUntil(item.nextReview) < 0) return "Expired";
    if (daysUntil(item.nextReview) <= 45) return "Possibly Outdated";
    return "Active";
  }

  function libraryCandidateRows() {
    return state.questions
      .filter((question) => question.status === "approved" || question.differenceFlag === "New Questions" || question.reviewComments?.length)
      .slice(0, 8)
      .map((question, index) => [
        `CAN-${String(index + 1).padStart(3, "0")}`,
        state.mapping.questionnaireName || "Current Questionnaire",
        question.text,
        `${question.section}: ${question.text.replace(/[?..?!].*$/, "")}`,
        (question.draft || question.historicalMatch?.answer || "").slice(0, 120) || "Pending proposed answer",
        question.section,
        question.tags.map((tag) => `#${String(tag).replace(/^#/, "")}`).join(" "),
        question.bestAnswerSource || question.sourceType || "Recommendation Engine Final Answer",
        question.owner,
        question.owner || "SME Owner",
        question.risk === "high" ? "High" : question.confidence > 85 ? "High" : "Medium",
        question.status === "approved" ? "Candidate" : "In Review",
        "Review / Approve / Merge",
      ]);
  }

  function renderLibraryGovernanceExtras() {
    const stats = libraryStats();
    const statusSummary = document.getElementById("libraryStatusSummary");
    if (statusSummary) {
      statusSummary.innerHTML = [
        ["Approved Answers", stats.approved, "Reusable now"],
        ["Needs Review", stats.needsReview, "Owner action"],
        ["Expired / Blocked", stats.expired, "Do not use"],
        ["Knowledge Health", `${stats.healthScore}%`, "Governance score"],
      ]
        .map(([label, value, note]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span><em>${escapeHtml(note)}</em></article>`)
        .join("");
    }

    const scopeTabs = document.getElementById("libraryScopeTabs");
    if (scopeTabs) {
      scopeTabs.innerHTML = ["All", "Approved Answers", "Sources", "Historical Questionnaires", "Needs Review"]
        .map((label, index) => `<button class="${index === 0 ? "active" : ""}">${escapeHtml(label)}</button>`)
        .join("");
    }

    const quickLinks = document.getElementById("libraryQuickLinks");
    if (quickLinks) {
      quickLinks.innerHTML = [
        ["Recently Reused Answers", `${state.audit.filter((item) => /Knowledge Hub Search|use/i.test(item.action)).length} links`],
        ["Frequently Asked Topics", `${stats.coveredTopics} topics`],
        ["My Saved Answers", `${state.librarySearch.savedCandidates.length} candidates`],
        ["Needs Review", `${stats.needsReview} items`],
        ["Expiring Soon", `${state.kb.filter((item) => daysUntil(item.nextReview) <= 45).length} items`],
      ]
        .map(([label, note]) => `<article><strong>${escapeHtml(label)}</strong><span>${escapeHtml(note)}</span></article>`)
        .join("");
    }

    const priorityItems = state.kb
      .slice()
      .sort((a, b) => {
        const weight = { High: 3, Medium: 2, Low: 1 };
        return weight[governancePriority(b)] - weight[governancePriority(a)] || daysUntil(a.nextReview) - daysUntil(b.nextReview);
      })
      .slice(0, 12);

    const actionCards = document.getElementById("governanceActionCards");
    if (actionCards) {
      actionCards.innerHTML = governanceIssueItems()
        .map(
          ([label, value, action, filter]) => `
            <button class="action-card" data-governance-filter="${escapeHtml(filter)}">
              <strong>${escapeHtml(value)}</strong>
              <span>${escapeHtml(label)}</span>
              <em>${escapeHtml(action)}</em>
            </button>
          `
        )
        .join("");
    }

    const kanban = document.getElementById("governanceKanban");
    if (kanban) {
      kanban.innerHTML = governanceKanbanRows(priorityItems)
        .map(
          (column) => `
            <section class="kanban-column">
              <h3>${escapeHtml(column.status)}</h3>
              ${
                column.cards
                  .map(
                    (card) => `
                      <article class="kanban-card ${card.priority.toLowerCase()}">
                        <strong>${escapeHtml(card.title)}</strong>
                        <span>${escapeHtml(card.issue)}</span>
                        <div class="mini-meta">
                          <span class="tag">${escapeHtml(card.owner)}</span>
                          <span class="tag">${escapeHtml(card.dueDate)}</span>
                          <span class="risk-pill ${card.priority === "High" ? "high" : card.priority === "Medium" ? "medium" : "low"}">${escapeHtml(card.priority)}</span>
                          <span class="tag">${escapeHtml(card.topic)}</span>
                          <span class="tag">Usage ${escapeHtml(card.usage)}</span>
                        </div>
                      </article>
                    `
                  )
                  .join("") || `<div class="empty-state">No items</div>`
              }
            </section>
          `
        )
        .join("");
    }

    const priority = document.getElementById("libraryList");
    if (priority) {
      priority.innerHTML = tableMarkup(
        ["Item", "Type", "Topic", "Issue", "Priority", "Owner", "Due Date", "Usage Count", "Risk", "Status", "Action"],
        priorityItems.map((item) => [
          item.title,
          item.sourceUrl ? "Source / Golden Source" : "Approved Answer",
          safeTheme(item),
          governanceReason(item),
          governancePriority(item),
          item.owner || "Missing",
          item.nextReview || "--",
          item.usageCount || Math.max(1, Math.round((item.trust || 70) / 10)),
          (item.tags || []).some((tag) => /risk|regulatory|compliance|security/i.test(tag)) ? "High" : "Medium",
          item.contentStatus === "Approved" ? "Open" : "In Review",
          "Review / Assign Owner / Refresh Source / Archive / Merge",
        ])
      );
    }

    const rules = document.getElementById("libraryGovernanceRules");
    if (rules) {
      rules.innerHTML = tableMarkup(
        ["Rule Name", "Trigger", "Action", "Owner", "Status", "Controls"],
        [
          ["Annual Review Required", "Approved Answer older than 12 months", "Mark Needs Review", "Content Owner", "Active", "Edit threshold / Notify"],
          ["Expired Source Block", "Source expired", "Block final export", "System", "Active", "Enable / Disable"],
          ["High Risk SME Review", "High Risk question uses answer", "Require SME Review", "SME", "Active", "Set owner / Escalate"],
          ["Missing Source Rule", "Answer has no source", "Block client submission", "System", "Active", "Notify owner"],
          ["Low Confidence Rule", "Similarity < 75%", "Require manual review", "Drafter", "Active", "Edit threshold"],
        ]
      );
    }

    const calendar = document.getElementById("reviewCalendar");
    if (calendar) {
      calendar.innerHTML = tableMarkup(
        ["Item", "Owner", "Reviewer", "Review Type", "Due Date", "Days Remaining", "Status", "Action"],
        state.kb
          .slice()
          .sort((a, b) => daysUntil(a.nextReview) - daysUntil(b.nextReview))
          .slice(0, 8)
          .map((item) => [
            item.title,
            item.owner,
            item.sme || item.owner,
            item.sourceUrl ? "Source Refresh" : item.contentStatus === "Approved" ? "Scheduled Review" : "SME Re-approval",
            item.nextReview,
            daysUntil(item.nextReview),
            sourceValidity(item) === "Expired" ? "Overdue" : sourceValidity(item),
            "Review / Extend / Notify",
          ])
      );
    }

    const candidateQueue = document.getElementById("candidateQueue");
    if (candidateQueue) {
      candidateQueue.innerHTML = tableMarkup(
        ["Candidate ID", "Source Questionnaire", "Original Client Question", "Proposed Standard Question", "Proposed Answer", "Suggested Topic", "Suggested Hashtags", "Source / Evidence", "Submitted By", "Suggested SME Owner", "Reuse Potential", "Status", "Action"],
        libraryCandidateRows()
      );
    }

    const duplicatePanel = document.getElementById("duplicateConflictPanel");
    if (duplicatePanel) {
      const groups = Object.entries(groupCount(state.kb, safeTheme))
        .filter(([, count]) => count > 1)
        .slice(0, 6)
        .map(([topic, count], index) => [`DUP-${String(index + 1).padStart(3, "0")}`, topic, count, `${82 + index}%`, index % 2 ? "Outdated Version" : "Duplicate / Different Answer", `${topic} master approved answer`, "Merge / Keep Separate / Send Review"]);
      duplicatePanel.innerHTML = tableMarkup(["Duplicate Group", "Topic", "Similar Items", "Similarity", "Conflict Type", "Suggested Master", "Action"], groups);
    }

    const lifecycle = document.getElementById("contentLifecyclePanel");
    if (lifecycle) {
      const counts = {
        Draft: state.kb.filter((item) => item.contentStatus === "Draft").length,
        Candidate: libraryCandidateRows().length,
        "In Review": state.kb.filter((item) => item.contentStatus === "In Review" || item.contentStatus === "Needs Review").length,
        Approved: stats.approved,
        Used: state.audit.filter((item) => /Knowledge Hub Search|use/i.test(item.action)).length,
        "Review Again": stats.needsReview,
        Expired: stats.expired,
      };
      lifecycle.innerHTML = Object.entries(counts)
        .map(([label, value]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`)
        .join("");
    }

    const actions = document.getElementById("governanceActions");
    if (actions) {
      actions.innerHTML = ["Send Review Reminder", "Reassign Owner", "Mark as Needs Review", "Archive Expired Items", "Refresh Sources", "Export Governance Report"]
        .map((label) => `<button>${escapeHtml(label)}</button>`)
        .join("");
    }

    const detail = document.getElementById("contentDetailPanel");
    const item = state.kb.find((entry) => entry.contentStatus === "Approved") || state.kb[0];
    if (detail && item) {
      detail.innerHTML = [
        ["Content Summary", `${item.title} | ${safeTheme(item)} | ${item.contentStatus} | Owner ${item.owner}`],
        ["Answer / Source Body", item.answer || item.source || ""],
        ["Governance Metadata", `Version ${item.version || "v1.0"} | Last ${item.lastReview || item.updated || "--"} | Next ${item.nextReview || "--"} | ${sourceValidity(item)}`],
        ["Linked Sources", item.sourceUrl || item.source || "Internal approved answer"],
        ["Usage History", `${item.usageCount || Math.max(1, Math.round((item.trust || 70) / 10))} uses | ${item.lastUsedIn || "AFME / DDQ workbench"}`],
        ["Review History", item.reviewHistory?.[0] ? `${item.reviewHistory[0].by} ${item.reviewHistory[0].action}` : "SME review retained in audit trail"],
        ["Related Items", (item.tags || []).map((tag) => `#${tag}`).join(" ")],
        ["Actions", "Edit / Review / Approve / Archive / Merge"],
      ]
        .map(([label, value]) => `<article><strong>${escapeHtml(label)}</strong><p>${escapeHtml(value)}</p></article>`)
        .join("");
    }

    renderLibraryTables();
  }

  function renderLibraryTables() {
    const sourceList = document.getElementById("goldenSourceList");
    if (sourceList) {
      const sources = state.kb.filter((item) => item.sourceUrl || ["External Reliable Source", "Golden Source", "Source Evidence"].includes(item.sourceType));
      sourceList.className = "export-list";
      sourceList.innerHTML = tableMarkup(
        ["Source Title", "Source Type", "Related Topic", "Extracted Answers", "Validity", "Last Checked", "Owner", "Review Need", "Action"],
        sources.map((item) => [
          item.title,
          item.sourceUrl ? "Official Website / Public Source" : "External Reliable Source",
          safeTheme(item),
          Math.max(1, Math.round((item.trust || 70) / 12)),
          sourceValidity(item),
          item.lastReview || item.updated || "--",
          item.owner || "Source Owner",
          item.contentStatus === "Approved" && sourceValidity(item) === "Active" ? "No immediate review" : "Review Required",
          "Open / Refresh / Extract / Archive",
        ])
      );
    }

    const approvedList = document.getElementById("smeReviewedList");
    if (approvedList) {
      const answers = state.kb.filter((item) => item.contentStatus === "Approved" || item.contentStatus === "Needs Review" || item.contentStatus === "Expired");
      approvedList.className = "export-list";
      approvedList.innerHTML = tableMarkup(
        ["Standard Question", "Approved Answer Preview", "Topic", "Source Linked", "Review Status", "SME Owner", "Last Reviewed", "Next Review", "Usage Count", "Risk Level", "Hashtags", "Action"],
        answers.map((item) => [
          item.question || item.title,
          (item.answer || "").slice(0, 150),
          safeTheme(item),
          item.source || item.sourceUrl ? "Linked" : "Missing Source",
          item.contentStatus,
          item.sme || item.owner,
          item.lastReview || item.updated || "--",
          item.nextReview || "--",
          item.usageCount || Math.max(1, Math.round((item.trust || 70) / 10)),
          (item.tags || []).some((tag) => /risk|security|regulatory|compliance/i.test(tag)) ? "High" : "Medium",
          (item.tags || []).slice(0, 4).join(", "),
          "View / Compare / Insert / Send Review",
        ])
      );
    }

    const historicalList = document.getElementById("completedQuestionnaireList");
    if (historicalList) {
      historicalList.className = "completed-list";
      historicalList.innerHTML = tableMarkup(
        ["Questionnaire Name", "Client", "Type", "Product / Service", "Region", "Submitted Date", "Total Questions", "Reusable Answers", "Linked Knowledge Items", "Reuse Count", "Status", "Action"],
        completedQuestionnaires().map((item, index) => [
          item.name,
          item.client,
          item.type,
          index === 1 ? "Securities Services / Custody" : "Fund Services / Global Custody",
          index === 0 ? "HK" : index === 1 ? "Global" : "APAC",
          item.submitted,
          item.total,
          item.finalAnswers,
          Math.max(8, Math.round(item.finalAnswers * 0.35)),
          index + 3,
          item.signoff === "Submitted" ? "Submitted" : "Needs Review",
          "Compare / Reuse / Open",
        ])
      );
    }
  }

  function sourceTableMarkup(sources) {
    return `
      <div class="table-wrap flat-table-wrap">
        <table class="dynamic-table source-table">
          <thead>
            <tr>
              <th>Source Title</th>
              <th>Source Type</th>
              <th>Topic</th>
              <th>URL / File</th>
              <th>Validity</th>
              <th>Last Checked</th>
              <th>Linked Answers</th>
              <th>Owner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${sources
              .map(
                (item) => `
                  <tr>
                    <td class="question-cell"><strong>${escapeHtml(item.title)}</strong></td>
                    <td>${escapeHtml(item.sourceUrl ? "Official Website / Public Source" : "Evidence Reference")}</td>
                    <td>${escapeHtml(safeTheme(item))}</td>
                    <td>${
                      item.sourceUrl
                        ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">Open Link</a>`
                        : `<span class="tag">${escapeHtml(item.source || "File reference")}</span>`
                    }</td>
                    <td><span class="status-pill ${sourceValidity(item) === "Active" ? "approved" : sourceValidity(item) === "Expired" ? "changes" : "review"}">${escapeHtml(sourceValidity(item))}</span></td>
                    <td>${escapeHtml(item.updated || item.lastReview || "--")}</td>
                    <td>${Math.max(1, Math.round((item.trust || 70) / 12))}</td>
                    <td>${escapeHtml(item.owner || "Source Owner")}</td>
                    <td><button data-governance-action="open-source" data-kb="${escapeHtml(item.id)}">Open / Refresh / Extract</button></td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderLibraryTables() {
    const sources = state.kb.filter((item) => item.source || item.sourceUrl);
    const answers = state.kb.filter((item) => item.contentStatus === "Approved" || item.contentStatus === "Needs Review" || item.contentStatus === "Expired" || item.contentStatus === "In Review");

    const sourceThemeView = document.getElementById("sourceThemeView");
    if (sourceThemeView) {
      const byTheme = Object.entries(
        sources.reduce((acc, item) => {
          const key = safeTheme(item);
          acc[key] = acc[key] || [];
          acc[key].push(item);
          return acc;
        }, {})
      );
      sourceThemeView.innerHTML = tableMarkup(
        ["Theme", "Sources", "Active", "Possibly Outdated", "Expired", "Linked Answers", "Owner", "Action"],
        byTheme.map(([theme, items]) => [
          theme,
          items.length,
          items.filter((item) => sourceValidity(item) === "Active").length,
          items.filter((item) => sourceValidity(item) === "Possibly Outdated").length,
          items.filter((item) => sourceValidity(item) === "Expired").length,
          items.reduce((sum, item) => sum + Math.max(1, Math.round((item.trust || 70) / 12)), 0),
          unique(items.map((item) => item.owner || "Source Owner")).slice(0, 2).join(" / "),
          "Open",
        ])
      );
    }

    const sourceDetail = document.getElementById("sourceDetailPanel");
    const detailItem = sources[0];
    if (sourceDetail && detailItem) {
      sourceDetail.innerHTML = `
        <article class="source-detail-card">
          <strong>${escapeHtml(detailItem.title)}</strong>
          <p>${escapeHtml(detailItem.source || "Official source")}</p>
          ${detailItem.sourceUrl ? `<a href="${escapeHtml(detailItem.sourceUrl)}" target="_blank" rel="noreferrer">Open source link</a>` : `<span class="tag">File reference</span>`}
          <dl>
            <div><dt>Source Type</dt><dd>${escapeHtml(detailItem.sourceUrl ? "Official Website" : "Evidence Reference")}</dd></div>
            <div><dt>Published / Captured</dt><dd>${escapeHtml(detailItem.publishedDate || detailItem.lastReview || "--")} / ${escapeHtml(detailItem.lastReview || "--")}</dd></div>
            <div><dt>Last Checked</dt><dd>${escapeHtml(detailItem.updated || detailItem.lastReview || "--")}</dd></div>
            <div><dt>Validity</dt><dd>${escapeHtml(sourceValidity(detailItem))}</dd></div>
            <div><dt>Related Topics</dt><dd>${escapeHtml(safeTheme(detailItem))}</dd></div>
            <div><dt>Extracted Knowledge Items</dt><dd>${escapeHtml(detailItem.id)}</dd></div>
            <div><dt>Linked Approved Answers</dt><dd>${Math.max(1, Math.round((detailItem.trust || 70) / 12))}</dd></div>
            <div><dt>Recommendation Questions</dt><dd>${state.questions.filter((question) => (question.matches || []).some((match) => match.id === detailItem.id)).length}</dd></div>
          </dl>
          <div class="button-row"><button data-governance-action="refresh-source">Refresh / Recheck</button><button data-governance-action="source-audit">View Audit Trail</button></div>
        </article>
      `;
    }

    const sourceList = document.getElementById("goldenSourceList");
    if (sourceList) {
      sourceList.className = "export-list";
      sourceList.innerHTML = sourceTableMarkup(sources);
    }

    const approvedThemeView = document.getElementById("approvedThemeView");
    if (approvedThemeView) {
      const byTheme = Object.entries(
        answers.reduce((acc, item) => {
          const key = safeTheme(item);
          acc[key] = acc[key] || [];
          acc[key].push(item);
          return acc;
        }, {})
      );
      approvedThemeView.innerHTML = tableMarkup(
        ["Theme / Topic", "Approved Answers", "Needs Review", "Expired", "SME Owner", "Coverage Score", "Action"],
        byTheme.map(([theme, items]) => [
          theme,
          items.filter((item) => item.contentStatus === "Approved").length,
          items.filter((item) => item.contentStatus === "Needs Review" || item.contentStatus === "In Review" || daysUntil(item.nextReview) <= 45).length,
          items.filter((item) => sourceValidity(item) === "Expired").length,
          unique(items.map((item) => item.sme || item.owner)).slice(0, 2).join(" / "),
          `${pct(items.filter((item) => item.contentStatus === "Approved").length, items.length || 1)}%`,
          "Open",
        ])
      );
    }

    const approvedOwnerView = document.getElementById("approvedOwnerView");
    if (approvedOwnerView) {
      const byOwner = Object.entries(
        answers.reduce((acc, item) => {
          const key = item.sme || item.owner || "Unassigned";
          acc[key] = acc[key] || [];
          acc[key].push(item);
          return acc;
        }, {})
      );
      approvedOwnerView.innerHTML = tableMarkup(
        ["SME Owner", "Topics Owned", "Approved Answers", "Needs Review", "Expired", "Next Review Due", "Workload", "Action"],
        byOwner.map(([owner, items]) => {
          const needsReview = items.filter((item) => item.contentStatus === "Needs Review" || item.contentStatus === "In Review" || daysUntil(item.nextReview) <= 45).length;
          return [
            owner,
            unique(items.map(safeTheme)).slice(0, 3).join(" / "),
            items.filter((item) => item.contentStatus === "Approved").length,
            needsReview,
            items.filter((item) => sourceValidity(item) === "Expired").length,
            items.slice().sort((a, b) => daysUntil(a.nextReview) - daysUntil(b.nextReview))[0]?.nextReview || "--",
            needsReview > 6 ? "High" : needsReview > 2 ? "Medium" : "Low",
            "Open",
          ];
        })
      );
    }

    const approvedList = document.getElementById("smeReviewedList");
    if (approvedList) {
      approvedList.className = "export-list";
      approvedList.innerHTML = tableMarkup(
        ["Knowledge Item ID", "Standard Question", "Approved Answer Preview", "Theme / Topic", "Sub-topic", "SME Owner", "Review Status", "Last Reviewed", "Next Review", "Source Status", "Risk Level", "Product / Service", "Region", "Usage Count", "Version", "Hashtags", "Action"],
        answers.map((item) => [
          item.id,
          item.question || item.title,
          (item.answer || "").slice(0, 150),
          safeTheme(item),
          item.section || safeTheme(item),
          item.sme || item.owner,
          item.contentStatus,
          item.lastReview || item.updated || "--",
          item.nextReview || "--",
          item.source || item.sourceUrl ? sourceValidity(item) : "Missing",
          (item.tags || []).some((tag) => /risk|security|regulatory|compliance/i.test(tag)) ? "High" : "Medium",
          /fund|accounting|nav/i.test(`${safeTheme(item)} ${(item.tags || []).join(" ")}`) ? "Fund Services" : "Securities Services",
          (item.tags || []).some((tag) => /hong|hk|singapore|uk|eu/i.test(tag)) ? "HK / Regional" : "Global",
          item.usageCount || Math.max(1, Math.round((item.trust || 70) / 10)),
          item.version || "v1.0",
          (item.tags || []).slice(0, 6).map((tag) => `#${String(tag).replace(/^#/, "")}`).join(" "),
          "View / Compare / Insert / Send Review",
        ])
      );
    }

    const historicalList = document.getElementById("completedQuestionnaireList");
    if (historicalList) {
      historicalList.className = "completed-list";
      historicalList.innerHTML = tableMarkup(
        ["Questionnaire Name", "Client", "Type", "Product / Service", "Region", "Submitted Date", "Total Questions", "Reusable Answers", "Linked Knowledge Items", "Reuse Count", "Status", "Action"],
        completedQuestionnaires().map((item, index) => [
          item.name,
          item.client,
          item.type,
          index === 1 ? "Securities Services / Custody" : "Fund Services / Global Custody",
          index === 0 ? "HK" : index === 1 ? "Global" : "APAC",
          item.submitted,
          item.total,
          item.finalAnswers,
          Math.max(8, Math.round(item.finalAnswers * 0.35)),
          index + 3,
          item.signoff === "Submitted" ? "Submitted" : "Needs Review",
          "Compare / Reuse / Open",
        ])
      );
    }
  }

  function ensureUploadView() {
    if (document.getElementById("uploadQuestionnaire")) return;
    const workspace = document.getElementById("workspaceDashboard");
    if (!workspace) return;
    const section = document.createElement("section");
    section.id = "uploadQuestionnaire";
    section.className = "view";
    section.innerHTML = `
      <section class="panel intake-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Create / Upload Questionnaire</p>
            <h2>Questionnaire Intake</h2>
          </div>
          <span class="stage-pill">Parse -> Historical Match -> Knowledge Validation -> Workbench</span>
        </div>
        <div class="intake-layout">
          <label class="intake-dropzone">
            <svg class="icon"><use href="#icon-file"></use></svg>
            <strong>Upload Word / Excel / PDF / AFME template</strong>
            <span>System parses sections, questions, IDs, answer columns and comments, then opens the Recommendation Workbench.</span>
            <input id="uploadQuestionnaireInput" type="file" accept=".txt,.csv,.md,.doc,.docx,.xls,.xlsx,.pdf" />
          </label>
          <div class="intake-steps">
            ${[
              ["1", "Parse Preview", "Detect client, template type, sections and questions."],
              ["2", "Historical Match", "Find similar completed questionnaires before AI drafting."],
              ["3", "Knowledge Validation", "Check newer approved answers and governance status."],
              ["4", "Create Workbench", "Set workflow, assignments, reviews and export readiness."],
            ]
              .map(([no, title, note]) => `<article><strong>${no}</strong><div><b>${escapeHtml(title)}</b><span>${escapeHtml(note)}</span></div></article>`)
              .join("")}
          </div>
        </div>
      </section>
    `;
    workspace.insertAdjacentElement("afterend", section);
  }

  function ensureQuestionnaireWorkbenchLayout() {
    const workbench = document.getElementById("workbench");
    if (!workbench || workbench.dataset.tabsReady === "true") return;

    const tabs = ["Overview", "Questions", "Knowledge Match", "Workflow", "Assignments", "Reviews", "Risk", "Export", "Activity Log"];
    const tabId = (label) => label.toLowerCase().replace(/\s+/g, "-");
    const shell = document.createElement("div");
    shell.className = "questionnaire-workbench-shell";
    shell.innerHTML = `
      <div class="questionnaire-breadcrumb">
        <button data-return-workspace>Recommendation Engines</button>
        <span>/</span>
        <strong>Alpha Securities DDQ 2026</strong>
      </div>
      <div id="questionnaireTabs" class="questionnaire-tabs" role="tablist">
        ${tabs.map((label, index) => `<button class="${index === 0 ? "active" : ""}" data-qtab="${tabId(label)}" role="tab">${escapeHtml(label)}</button>`).join("")}
      </div>
      <div class="questionnaire-tab-body">
        ${tabs.map((label, index) => `<div id="qtab-${tabId(label)}" class="qtab-panel ${index === 0 ? "active" : ""}" data-qtab-panel="${tabId(label)}"></div>`).join("")}
      </div>
    `;
    workbench.appendChild(shell);
    const panel = (id) => shell.querySelector(`#qtab-${id}`);

    const overview = panel("overview");
    const questions = panel("questions");
    const libraryMatch = panel("library-match");
    const workflow = panel("workflow");
    const assignments = panel("assignments");
    const reviews = panel("reviews");
    const risk = panel("risk");
    const exportPanel = panel("export");
    const activity = panel("activity-log");

    const metricGrid = document.getElementById("metricGrid");
    const projectPanel = workbench.querySelector(".project-panel");
    const tablePanel = workbench.querySelector(".table-panel");
    const inspector = document.getElementById("inspector");
    const matchingDashboard = workbench.querySelector(".matching-dashboard");
    const oldWorkspaceGrid = workbench.querySelector(".workspace-grid");

    if (metricGrid) overview.appendChild(metricGrid);
    const overviewGrid = document.createElement("div");
    overviewGrid.className = "workbench-overview-grid";
    if (projectPanel) overviewGrid.appendChild(projectPanel);
    overviewGrid.insertAdjacentHTML(
      "beforeend",
      `<section class="panel action-panel">
        <div class="panel-head compact">
          <div>
            <p class="eyebrow">Action Panel</p>
            <h2>Next best actions</h2>
          </div>
        </div>
        <div id="workbenchActionPanel" class="next-action-list"></div>
      </section>`
    );
    overview.appendChild(overviewGrid);
    overview.insertAdjacentHTML(
      "beforeend",
      `<section class="panel">
        <div class="panel-head compact">
          <div>
            <p class="eyebrow">Section Summary</p>
            <h2>Overview -> Section -> Questions -> Detail</h2>
          </div>
          <button data-qtab-jump="questions">Open Questions</button>
        </div>
        <div id="overviewSectionSummary" class="section-summary-grid"></div>
      </section>`
    );

    questions.insertAdjacentHTML(
      "beforeend",
      `<section class="panel question-control-panel">
        <div class="panel-head compact">
          <div>
            <p class="eyebrow">Saved Views</p>
            <h2>Default: Needs My Action</h2>
          </div>
          <span id="questionViewLabel" class="stage-pill">Needs My Action</span>
        </div>
        <div id="questionSavedViews" class="saved-view-bar"></div>
        <div id="questionBatchActions" class="batch-action-bar"></div>
      </section>`
    );
    const questionLayout = document.createElement("div");
    questionLayout.className = "workbench-question-layout";
    if (tablePanel) {
      const head = tablePanel.querySelector(".panel-head h2");
      if (head) head.textContent = "Filtered Question List";
      const header = tablePanel.querySelector("thead tr");
      if (header) {
        header.innerHTML = `
          <th>Question ID</th>
          <th>Section</th>
          <th>Question Preview</th>
          <th>Answer Status</th>
          <th>Best Source</th>
          <th>Similarity</th>
          <th>Risk</th>
          <th>Current Owner</th>
          <th>Current Stage</th>
          <th>Review Status</th>
          <th>Action</th>
        `;
      }
      questionLayout.appendChild(tablePanel);
    }
    if (inspector) questionLayout.appendChild(inspector);
    questions.appendChild(questionLayout);
    if (oldWorkspaceGrid && !oldWorkspaceGrid.children.length) oldWorkspaceGrid.remove();

    if (matchingDashboard) libraryMatch.appendChild(matchingDashboard);
    moveViewChildren("workflowSetup", workflow);
    moveViewChildren("assignments", assignments);
    moveViewChildren("approvals", reviews);
    moveViewChildren("risk", risk);
    moveViewChildren("office", exportPanel);

    activity.innerHTML = `
      <section class="panel">
        <div class="panel-head compact">
          <div>
            <p class="eyebrow">Activity Log</p>
            <h2>Questionnaire audit trail</h2>
          </div>
        </div>
        <div id="activityLogList" class="activity-log-list"></div>
      </section>
    `;

    workbench.dataset.tabsReady = "true";
  }

  function moveViewChildren(sourceId, targetPanel) {
    const source = document.getElementById(sourceId);
    if (!source || !targetPanel) return;
    while (source.firstElementChild) targetPanel.appendChild(source.firstElementChild);
    source.remove();
  }

  function activateWorkbenchTab(tabId = "overview") {
    document.querySelectorAll("[data-qtab]").forEach((button) => button.classList.toggle("active", button.dataset.qtab === tabId));
    document.querySelectorAll("[data-qtab-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.qtabPanel === tabId));
  }

  function openQuestionnaireWorkbench(questionnaireId = "WQ-001", tabId = "overview") {
    state.activeQuestionnaireId = questionnaireId;
    setActiveView("workbench");
    activateWorkbenchTab(tabId);
  }

  function questionViewDefinitions() {
    return [
      ["needs-action", "Needs My Action"],
      ["high-risk", "High Risk"],
      ["needs-sme", "Needs SME Review"],
      ["no-library", "No Knowledge Hub Match"],
      ["new", "New Questions"],
      ["modified", "Modified Questions"],
      ["low-confidence", "Low Confidence"],
      ["blocked", "Blocked"],
      ["ready-export", "Ready for Export"],
      ["all", "All Questions"],
    ];
  }

  function questionMatchesView(question) {
    const view = state.questionView || "needs-action";
    if (view === "all") return true;
    if (view === "needs-action") return question.status !== "approved" || question.reviewRequired || question.suggestedAction === "Search Hub";
    if (view === "high-risk") return question.risk === "high";
    if (view === "needs-sme") return question.reviewRequired || question.status === "review";
    if (view === "no-library") return !question.libraryValidation || question.libraryValidation.status === "No Knowledge Hub Match";
    if (view === "new") return question.differenceFlag === "New Questions" || !question.historicalMatch;
    if (view === "modified") return /Modified|Partial/i.test(question.differenceFlag || "");
    if (view === "low-confidence") return (question.confidence || 0) < 75;
    if (view === "blocked") return question.status === "changes" || question.reviewStatus === "Blocked";
    if (view === "ready-export") return question.status === "approved";
    return true;
  }

  function questionnaireSectionRows() {
    return sectionAssignmentRows().map((row) => {
      const questions = state.questions.filter((question) => question.section === row.section);
      return {
        ...row,
        autoFilled: questions.filter((question) => question.autoFillStatus === "Filled").length,
        libraryValidated: questions.filter((question) => question.libraryValidation?.status && question.libraryValidation.status !== "No Knowledge Hub Match").length,
        smeReview: questions.filter((question) => question.reviewRequired || question.status === "review").length,
        highRisk: questions.filter((question) => question.risk === "high").length,
        progress: pct(questions.filter((question) => question.status === "approved").length, questions.length || 1),
      };
    });
  }

  function renderQuestionnaireOverview() {
    const actionPanel = document.getElementById("workbenchActionPanel");
    const overviewSections = document.getElementById("overviewSectionSummary");
    const savedViews = document.getElementById("questionSavedViews");
    const batchActions = document.getElementById("questionBatchActions");
    const activityLog = document.getElementById("activityLogList");
    const rows = questionnaireSectionRows();
    const total = state.questions.length || 1;
    const needsSme = state.questions.filter((question) => question.reviewRequired || question.status === "review").length;
    const newerLibrary = state.questions.filter((question) => question.libraryValidation?.status === "Newer Approved Answer Available").length;
    const highRisk = state.questions.filter((question) => question.risk === "high").length;
    const blocked = state.questions.filter((question) => question.status === "changes" || question.reviewStatus === "Blocked").length;
    const ready = state.questions.filter((question) => question.status === "approved").length;

    if (actionPanel) {
      actionPanel.innerHTML = [
        [`${needsSme} questions need SME Review`, "Send Pending to SME", "reviews"],
        [`${newerLibrary} answers have newer Library version`, "Run Knowledge Validation", "library-match"],
        [`${highRisk} high-risk questions require approval`, "Review High Risk", "risk"],
        [`${blocked} blocked items prevent export`, "Check Export Readiness", "export"],
        [`${state.workflow.reassignments.filter((item) => item.acceptanceStatus === "Pending Acceptance").length} reassignments pending acceptance`, "Open Assignments", "assignments"],
      ]
        .map(([title, label, tab]) => `<article><strong>${escapeHtml(title)}</strong><button data-qtab-jump="${escapeHtml(tab)}">${escapeHtml(label)}</button></article>`)
        .join("") +
        `<article class="candidate-submit-action">
          <strong>${libraryCandidateRows().length} reusable answers can be submitted to Candidate Queue</strong>
          <button data-submit-candidates>Submit to Candidate Queue</button>
        </article>`;
    }

    if (overviewSections) {
      overviewSections.innerHTML = rows
        .map(
          (row) => `
            <article class="${row.status === "At Risk" ? "at-risk" : ""}">
              <div>
                <strong>${escapeHtml(row.section)}</strong>
                <span>${escapeHtml(row.owner)} / ${escapeHtml(row.activeStage)}</span>
              </div>
              <div class="mini-meta">
                <span class="tag">${row.total} Qs</span>
                <span class="tag">${row.autoFilled} auto-filled</span>
                <span class="tag">${row.libraryValidated} validated</span>
                <span class="tag">${row.smeReview} SME</span>
                <span class="risk-pill ${row.highRisk ? "high" : "low"}">${row.highRisk} high risk</span>
              </div>
              ${confidenceMarkup(row.progress)}
            </article>
          `
        )
        .join("");
    }

    const sectionPanel = document.getElementById("qtab-risk");
    if (sectionPanel && !document.getElementById("exportBlockingIssues")) {
      sectionPanel.insertAdjacentHTML(
        "afterbegin",
        `<section class="panel">
          <div class="panel-head compact"><div><p class="eyebrow">Export Blocking Risk</p><h2>Draft / Expired / Missing Source / High Risk</h2></div></div>
          <div id="exportBlockingIssues" class="export-list"></div>
        </section>`
      );
    }
    const blocking = document.getElementById("exportBlockingIssues");
    if (blocking) {
      blocking.innerHTML = tableMarkup(
        ["Check", "Blocking Count", "Required Action"],
        [
          ["High Risk without final approval", highRisk, "Complete SME / Compliance Review"],
          ["Draft answers", state.questions.filter((q) => q.status === "draft").length, "Finalize or send to SME"],
          ["Missing source", state.questions.filter((q) => !(q.matches || []).length).length, "Attach Knowledge Hub or historical source"],
          ["Pending reassignment acceptance", state.workflow.reassignments.filter((item) => item.acceptanceStatus === "Pending Acceptance").length, "Follow up reviewer"],
          ["Blocked items", blocked, "Resolve comments before export"],
        ]
      );
    }

    if (savedViews) {
      savedViews.innerHTML = questionViewDefinitions()
        .map(([id, label]) => `<button class="${state.questionView === id ? "active" : ""}" data-question-view="${id}">${escapeHtml(label)}</button>`)
        .join("");
    }
    const viewLabel = document.getElementById("questionViewLabel");
    if (viewLabel) viewLabel.textContent = questionViewDefinitions().find(([id]) => id === state.questionView)?.[1] || "Needs My Action";
    if (batchActions) {
      batchActions.innerHTML = ["Batch Assign", "Batch Submit to SME", "Batch Approve Low Risk", "Batch Replace with Approved Answer", "Batch Mark Final Ready", "Batch Export Selected", "Batch Add Hashtags"]
        .map((label) => `<button data-batch-action="${escapeHtml(label)}">${escapeHtml(label)}</button>`)
        .join("");
    }
    if (activityLog) {
      activityLog.innerHTML =
        state.audit
          .slice(0, 40)
          .map((item) => `<article class="audit-line"><strong>${escapeHtml(item.questionId || "ALL")}</strong><span>${escapeHtml(item.action)}</span><em>${escapeHtml(new Date(item.at).toLocaleString("en-GB"))}</em></article>`)
          .join("") || `<div class="empty-state">No activity yet.</div>`;
    }
  }

  function bindEvents() {
    ensureLibraryGovernanceLayout();
    ensureUploadView();
    ensureQuestionnaireWorkbenchLayout();
    document.querySelectorAll(".nav-item").forEach((button) => {
      button.addEventListener("click", () => {
        const module = modelNavigation().find((item) => item.id === button.dataset.module);
        if (module) setActiveView(module.defaultView);
      });
    });

    const moduleSubnav = document.getElementById("moduleSubnav");
    if (moduleSubnav) {
      moduleSubnav.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-subview]");
        if (button) setActiveView(button.dataset.subview);
      });
    }

    const myTaskList = document.getElementById("myTaskList");
    if (myTaskList) {
      myTaskList.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-subview]");
        if (button && button.dataset.subview === "workbench") openQuestionnaireWorkbench("WQ-001", "questions");
        else if (button) setActiveView(button.dataset.subview);
      });
    }

    const myQuestionnaireList = document.getElementById("myQuestionnaireList");
    if (myQuestionnaireList) {
      myQuestionnaireList.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-subview]");
        if (button && button.dataset.subview === "workbench") openQuestionnaireWorkbench("WQ-001", "overview");
        else if (button) setActiveView(button.dataset.subview);
      });
    }

    const questionnairePortfolio = document.getElementById("questionnairePortfolio");
    if (questionnairePortfolio) {
      questionnairePortfolio.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-open-workbench]");
        if (button) openQuestionnaireWorkbench(button.dataset.openWorkbench, "overview");
      });
    }

    const workbench = document.getElementById("workbench");
    if (workbench) {
      workbench.addEventListener("click", (event) => {
        const tab = event.target.closest("button[data-qtab]");
        if (tab) activateWorkbenchTab(tab.dataset.qtab);
        const jump = event.target.closest("button[data-qtab-jump]");
        if (jump) activateWorkbenchTab(jump.dataset.qtabJump);
        const back = event.target.closest("button[data-return-workspace]");
        if (back) setActiveView("workspaceDashboard");
        const view = event.target.closest("button[data-question-view]");
        if (view) {
          state.questionView = view.dataset.questionView;
          renderAll();
          activateWorkbenchTab("questions");
        }
        const batch = event.target.closest("button[data-batch-action]");
        if (batch) {
          addAudit(`Batch action: ${batch.dataset.batchAction}`, "QUESTIONNAIRE");
          toast(batch.dataset.batchAction);
          renderAll();
          activateWorkbenchTab("questions");
        }
        const submitCandidates = event.target.closest("button[data-submit-candidates]");
        if (submitCandidates) {
          state.questions
            .filter((question) => question.status === "approved" || question.differenceFlag === "New Questions" || question.reviewComments?.length)
            .slice(0, 8)
            .forEach((question) => addAudit(`Submit reusable answer to Candidate Queue: ${question.id}`, question.id));
          toast("Reusable answers submitted to Candidate Queue");
          renderAll();
          activateWorkbenchTab("activity-log");
        }
      });
    }

    const contentGovernance = document.getElementById("contentGovernance");
    if (contentGovernance) {
      contentGovernance.addEventListener("click", (event) => {
        const actionCard = event.target.closest("[data-governance-filter]");
        if (actionCard) {
          addAudit(`Governance drill-down: ${actionCard.dataset.governanceFilter}`, "LIBRARY");
          toast(`Filtered governance queue: ${actionCard.dataset.governanceFilter}`);
          return;
        }
        const governanceAction = event.target.closest("[data-governance-action]");
        if (governanceAction) {
          addAudit(`Governance action: ${governanceAction.dataset.governanceAction}`, "LIBRARY");
          toast(governanceAction.dataset.governanceAction);
        }
      });
    }

    document.getElementById("questionRows").addEventListener("click", (event) => {
      const actionButton = event.target.closest("button[data-action='context-search-row']");
      if (actionButton) {
        runContextSearchForQuestion(actionButton.dataset.id);
        return;
      }
      const row = event.target.closest("tr[data-id]");
      if (!row) return;
      state.selectedId = row.dataset.id;
      renderAll();
    });

    document.getElementById("inspector").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      if (action === "status") setStatus(button.dataset.status);
      if (action === "generate-one") {
        const question = getSelectedQuestion();
        generateForQuestion(question);
        toast(`Regenerated ${question.id}`);
        renderAll();
      }
      if (action === "send-review") setStatus("review");
      if (action === "approve") setStatus("approved");
      if (action === "changes") setStatus("changes");
      if (action === "block") {
        const question = getSelectedQuestion();
        if (question) {
          question.status = "changes";
          question.reviewStatus = "Blocked";
          addAudit("Marked as Blocked", question.id);
          toast(`${question.id} marked as Blocked`);
          renderAll();
        }
      }
      if (action === "add-comment") {
        addReviewComment("Comment");
        toast("Review comment recorded");
        renderAll();
      }
      if (action === "workflow-toast") {
        toast(button.dataset.workflowLabel || "Workflow action recorded");
        addAudit(button.dataset.workflowLabel || "Workflow action", getSelectedQuestion()?.id || "WORKFLOW");
      }
      if (action === "reassign-selected") simulateReassignment();
      if (action === "replace-library") replaceWithValidatedLibraryAnswer();
      if (action === "keep-historical") keepHistoricalAnswer();
      if (action === "compare-current") compareCurrentAnswer();
      if (action === "context-search") runContextSearchForQuestion();
      if (action === "export-word") exportWord();
      if (action === "export-excel") exportExcel();
      if (action === "signoff") signoffQuestion();
      if (action === "use-source") useSource(button.dataset.kb);
    });

    document.getElementById("libraryList").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-kb]");
      if (button) useSource(button.dataset.kb);
    });

    const notificationList = document.getElementById("notificationList");
    if (notificationList) {
      notificationList.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action='copy-reminder']");
        if (!button) return;
        const item = buildNotifications().find((notification) => notification.target === button.dataset.target);
        if (!item) return;
        const text = reminderText(item);
        try {
          await navigator.clipboard.writeText(text);
          toast("Reminder copy copied");
        } catch (error) {
          downloadBlob(text, `AI_Kuaida_${item.target}_Reminder.txt`, "text/plain;charset=utf-8");
          toast("Reminder copy exported");
        }
      });
    }

    const workflowModeCards = document.getElementById("workflowModeCards");
    if (workflowModeCards) {
      workflowModeCards.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-workflow-mode]");
        if (!button) return;
        state.workflow.mode = button.dataset.workflowMode;
        if (state.workflow.mode === "standard") {
          state.workflow.templateId = "standard-four-step";
          state.workflow.customStages = [];
          state.workflow.stageOverrides = {};
        } else {
          ensureCustomWorkflow();
        }
        addAudit(`Switched Workflow Mode: ${state.workflow.mode}`, "WORKFLOW");
        renderAll();
      });
    }

    const workflowTemplateSelect = document.getElementById("workflowTemplateSelect");
    if (workflowTemplateSelect) {
      workflowTemplateSelect.addEventListener("change", (event) => {
        state.workflow.templateId = event.target.value;
        state.workflow.customStages = [];
        state.workflow.stageOverrides = {};
        state.workflow.mode = workflowTemplateById(event.target.value).mode === "standard" ? "standard" : "custom";
        addAudit(`Applied Workflow Template: ${workflowTemplateById(event.target.value).name}`, "WORKFLOW");
        toast("Workflow template applied");
        renderAll();
      });
    }

    const workflowBuilderStages = document.getElementById("workflowBuilderStages");
    if (workflowBuilderStages) {
      workflowBuilderStages.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-stage-action]");
        if (!button) return;
        const index = Number(button.dataset.stageIndex);
        const action = button.dataset.stageAction;
        if (action === "up") moveWorkflowStage(index, -1);
        if (action === "down") moveWorkflowStage(index, 1);
        if (action === "rename") renameWorkflowStage(index);
        if (action === "duplicate") duplicateWorkflowStage(index);
        if (action === "remove") removeWorkflowStage(index);
      });
    }

    const stageLibraryList = document.getElementById("stageLibraryList");
    if (stageLibraryList) {
      stageLibraryList.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-add-stage]");
        if (button) addWorkflowStage(button.dataset.addStage);
      });
    }

    const saveWorkflowTemplateBtn = document.getElementById("saveWorkflowTemplateBtn");
    if (saveWorkflowTemplateBtn) {
      saveWorkflowTemplateBtn.addEventListener("click", () => {
        ensureCustomWorkflow();
        addAudit("Save as Template", "WORKFLOW");
        toast("Saved as a custom template example");
        renderAll();
      });
    }

    const simulateReassignBtn = document.getElementById("simulateReassignBtn");
    if (simulateReassignBtn) simulateReassignBtn.addEventListener("click", simulateReassignment);

    const globalSearchBtn = document.getElementById("globalLibrarySearchBtn");
    const globalSearchInput = document.getElementById("globalLibrarySearchInput");
    if (globalSearchBtn && globalSearchInput) {
      globalSearchBtn.addEventListener("click", () => {
        state.librarySearch.globalQuery = globalSearchInput.value.trim();
        addAudit(`Global Knowledge Hub Search: ${state.librarySearch.globalQuery}`, "SEARCH");
        renderAll();
      });
      globalSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") globalSearchBtn.click();
      });
    }

    const contextSearchBtn = document.getElementById("contextLibrarySearchBtn");
    const contextSearchInput = document.getElementById("contextLibrarySearchInput");
    if (contextSearchBtn && contextSearchInput) {
      contextSearchBtn.addEventListener("click", () => {
        state.librarySearch.contextQuery = contextSearchInput.value.trim() || getSelectedQuestion()?.text || "";
        state.librarySearch.contextQuestionId = getSelectedQuestion()?.id || "";
        addAudit(`Contextual Knowledge Hub Search: ${state.librarySearch.contextQuery.slice(0, 60)}`, state.librarySearch.contextQuestionId || "SEARCH");
        renderAll();
      });
      contextSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") contextSearchBtn.click();
      });
    }

    [document.getElementById("globalLibrarySearchResults"), document.getElementById("contextLibrarySearchResults")].forEach((container) => {
      if (!container) return;
      container.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-search-action]");
        if (!button) return;
        const action = button.dataset.searchAction;
        if (["insert", "insert-source", "replace", "save", "sme"].includes(action)) applySearchResult(button.dataset.resultId, action);
        if (action === "compare" || action === "view" || action === "open-source" || action === "not-relevant") {
          const result = findSearchResultById(button.dataset.resultId);
          if (result) {
            addAudit(`Knowledge Hub Search ${action}: ${result.title}`, getSelectedQuestion()?.id || "SEARCH");
            toast(action === "compare" ? "Comparison opened: current answer vs Library Candidate" : action === "open-source" ? "Open source action recorded" : action === "not-relevant" ? "Marked as not relevant" : "Full answer summary viewed");
          }
        }
      });
    });

    document.getElementById("generateAllBtn").addEventListener("click", generateAllDrafts);
    const workbenchGenerateBtn = document.getElementById("workbenchGenerateBtn");
    if (workbenchGenerateBtn) workbenchGenerateBtn.addEventListener("click", generateAllDrafts);
    const workbenchReviewBtn = document.getElementById("workbenchReviewBtn");
    if (workbenchReviewBtn) workbenchReviewBtn.addEventListener("click", () => {
      state.questions.forEach((question) => {
        if (question.status === "draft" && question.draft) {
          question.status = "review";
          question.reviewStatus = "Pending SME Review";
          addAudit("Workbench bulk submitted for review", question.id);
        }
      });
      toast("Current questionnaire draft submitted for review");
      renderAll();
    });
    const workbenchQualityBtn = document.getElementById("workbenchQualityBtn");
    if (workbenchQualityBtn) workbenchQualityBtn.addEventListener("click", () => {
      state.questions.forEach((question) => {
        const rules = triggeredRules(`${question.text} ${question.draft || ""}`);
        question.rules = rules;
        question.risk = levelFromRules(rules);
      });
      addAudit("Run quality check", "ALL");
      toast("Quality check completed");
      renderAll();
    });
    const workbenchSearchLibraryBtn = document.getElementById("workbenchSearchLibraryBtn");
    if (workbenchSearchLibraryBtn) workbenchSearchLibraryBtn.addEventListener("click", () => runContextSearchForQuestion());
    const workbenchFindBetterBtn = document.getElementById("workbenchFindBetterBtn");
    if (workbenchFindBetterBtn) {
      workbenchFindBetterBtn.addEventListener("click", () => {
        const question = getSelectedQuestion();
        state.librarySearch.contextQuery = `${question?.text || ""} ${question?.tags?.join(" ") || ""}`.trim();
        addAudit("Find Better Answer", question?.id || "SEARCH");
        toast("Better Knowledge Hub answer found");
        renderAll();
      });
    }
    const askLibraryBtn = document.getElementById("askLibraryBtn");
    if (askLibraryBtn) askLibraryBtn.addEventListener("click", () => runContextSearchForQuestion());
    const autofillRecommendedBtn = document.getElementById("autofillRecommendedBtn");
    if (autofillRecommendedBtn) {
      autofillRecommendedBtn.addEventListener("click", () => {
        runHistoricalMapping({ autoFill: true, preserveExistingDraft: false });
        toast("Recommended answers auto-filled and Knowledge Validation completed");
        renderAll();
      });
    }
    const reviewComparisonBtn = document.getElementById("reviewComparisonBtn");
    if (reviewComparisonBtn) {
      reviewComparisonBtn.addEventListener("click", () => {
        addAudit("Review Questionnaire Comparison", "ALL");
        toast("Questionnaire Difference Report generated");
        renderAll();
      });
    }
    document.getElementById("exportWordBtn").addEventListener("click", exportWord);
    document.getElementById("exportExcelBtn").addEventListener("click", exportExcel);
    const sendClientBtn = document.getElementById("sendClientBtn");
    if (sendClientBtn) sendClientBtn.addEventListener("click", exportClientEmail);
    const sendReminderBtn = document.getElementById("sendReminderBtn");
    if (sendReminderBtn) sendReminderBtn.addEventListener("click", exportReminderEmails);
    document.getElementById("fileInput").addEventListener("change", (event) => handleImport(event.target.files[0]));
    const uploadQuestionnaireInput = document.getElementById("uploadQuestionnaireInput");
    if (uploadQuestionnaireInput) {
      uploadQuestionnaireInput.addEventListener("change", (event) => {
        handleImport(event.target.files[0]);
        openQuestionnaireWorkbench("WQ-001", "library-match");
      });
    }
    document.querySelectorAll(".workbench-actions input[type='file']").forEach((input) => {
      input.addEventListener("change", (event) => handleImport(event.target.files[0]));
    });
    document.getElementById("questionSearch").addEventListener("input", renderQuestions);
    document.getElementById("librarySearch").addEventListener("input", renderLibrary);
    document.getElementById("bulkReviewBtn").addEventListener("click", () => {
      state.questions.forEach((question) => {
        if (question.status === "draft" && question.draft) {
          question.status = "review";
          question.reviewStatus = "Pending SME Review";
          addAudit("Bulk submitted for review", question.id);
        }
      });
      toast("Drafts bulk submitted for review");
      renderAll();
    });
  }

  bindEvents();
  setActiveView("workspaceDashboard");
  renderAll();
})();




