"use client";

import RiskMeter from "./RiskMeter";

// ── Types ───────────────────────────────────────────────────────────
interface TimelineEntry {
  day: number;
  action: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
  category?: string;
}

interface FarmPlan {
  farm_summary: {
    overall_risk: string;
    key_issue: string;
  };
  confidence_score?: number;
  smart_insight?: {
    hidden_risk: string;
    recommendation: string;
  };
  image_analysis?: string[];
  timeline: TimelineEntry[];
  market_strategy: {
    action: string;
    reason: string;
  };
  ai_reasoning?: string[];
}

interface ResultDisplayProps {
  plan: FarmPlan;
  hasImage?: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────
function priorityColor(p: string): string {
  switch (p) {
    case "High":
      return "#ef4444";
    case "Medium":
      return "#f59e0b";
    case "Low":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}

function categoryIcon(cat?: string): string {
  switch (cat) {
    case "water":
      return "💧";
    case "fertilizer":
      return "🧪";
    case "pest":
      return "🐛";
    case "harvest":
      return "🌾";
    case "monitor":
      return "👁️";
    case "soil":
      return "🪴";
    default:
      return "📌";
  }
}

function categoryLabel(cat?: string): string {
  switch (cat) {
    case "water":
      return "Irrigation";
    case "fertilizer":
      return "Fertilizer";
    case "pest":
      return "Pest Control";
    case "harvest":
      return "Harvest";
    case "monitor":
      return "Monitoring";
    case "soil":
      return "Soil Care";
    default:
      return "Action";
  }
}

export default function ResultDisplay({ plan, hasImage }: ResultDisplayProps) {
  const confidence = plan.confidence_score ?? 85;

  return (
    <div style={styles.results}>
      {/* ── Confidence + Risk Row ───────────────────────── */}
      <div style={styles.topRow}>
        {/* Confidence Score */}
        <section style={{ ...styles.card, flex: "0 0 160px", textAlign: "center" as const }}>
          <div style={styles.confidenceRing}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={confidence >= 85 ? "#22c55e" : confidence >= 70 ? "#f59e0b" : "#ef4444"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(confidence / 100) * 264} 264`}
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dasharray 1.5s ease" }}
              />
            </svg>
            <span style={styles.confidenceValue}>{confidence}%</span>
          </div>
          <p style={styles.confidenceLabel}>AI Confidence</p>
        </section>

        {/* Risk Meter */}
        <section style={{ ...styles.card, flex: 1 }}>
          <RiskMeter level={plan.farm_summary?.overall_risk ?? "Low"} />
          <div style={styles.keyIssue}>
            <span style={styles.keyIssueLabel}>⚠️ Key Issue</span>
            <p style={styles.keyIssueText}>
              {plan.farm_summary?.key_issue ?? "No issues detected"}
            </p>
          </div>
        </section>
      </div>

      {/* ── Smart Insight ──────────────────────────────── */}
      {plan.smart_insight?.hidden_risk && (
        <section style={styles.insightCard}>
          <div style={styles.insightHeader}>
            <span style={styles.insightIcon}>⚡</span>
            <h3 style={styles.insightTitle}>Smart Insight — Hidden Risk</h3>
          </div>
          <p style={styles.insightRisk}>{plan.smart_insight.hidden_risk}</p>
          {plan.smart_insight.recommendation && (
            <div style={styles.insightAction}>
              <span style={{ fontWeight: 700, color: "#5eead4" }}>→</span>
              <span style={styles.insightActionText}>
                {plan.smart_insight.recommendation}
              </span>
            </div>
          )}
        </section>
      )}

      {/* ── Image Analysis ─────────────────────────────── */}
      {hasImage && plan.image_analysis && plan.image_analysis.length > 0 && (
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>📸 Image Analysis</h2>
          <p style={styles.sectionSub}>AI findings from your crop photo</p>
          <div style={styles.imageFindings}>
            {plan.image_analysis.map((finding, i) => (
              <div key={i} style={styles.findingItem}>
                <span style={styles.findingDot}>●</span>
                <span style={styles.findingText}>{finding}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── AI Reasoning (Bullet Points) ───────────────── */}
      {plan.ai_reasoning && plan.ai_reasoning.length > 0 && (
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>🧠 Why This Plan?</h2>
          <p style={styles.sectionSub}>AI reasoning behind each recommendation</p>
          <ul style={styles.reasoningList}>
            {plan.ai_reasoning.map((reason, i) => (
              <li key={i} style={styles.reasoningBullet}>
                {reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Timeline ───────────────────────────────────── */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>📅 30-Day Action Plan</h2>
        <p style={styles.sectionSub}>
          {plan.timeline?.length ?? 0} actions scheduled
        </p>
        <div style={styles.timeline}>
          {plan.timeline?.map((entry, i) => (
            <div key={i} style={styles.timelineItem}>
              {/* Left: icon + connector */}
              <div style={styles.timelineLeft}>
                <div
                  style={{
                    ...styles.timelineIconWrap,
                    backgroundColor: `${priorityColor(entry.priority)}18`,
                    border: `1.5px solid ${priorityColor(entry.priority)}40`,
                  }}
                >
                  <span style={styles.timelineIcon}>
                    {categoryIcon(entry.category)}
                  </span>
                </div>
                {i < (plan.timeline?.length ?? 0) - 1 && (
                  <div style={styles.timelineConnector} />
                )}
              </div>

              {/* Right: content */}
              <div style={styles.timelineContent}>
                <div style={styles.timelineHeader}>
                  <div style={styles.timelineMeta}>
                    <span style={styles.timelineDay}>Day {entry.day}</span>
                    <span style={styles.timelineCat}>
                      {categoryLabel(entry.category)}
                    </span>
                  </div>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: `${priorityColor(entry.priority)}18`,
                      color: priorityColor(entry.priority),
                      border: `1px solid ${priorityColor(entry.priority)}40`,
                    }}
                  >
                    {entry.priority}
                  </span>
                </div>
                <h4 style={styles.timelineAction}>{entry.action}</h4>
                <p style={styles.timelineReason}>{entry.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Market Strategy ─────────────────────────────── */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>💰 Market Strategy</h2>
        <div style={styles.marketBox}>
          <div style={styles.marketRow}>
            <span style={styles.marketIcon}>🎯</span>
            <div>
              <h4 style={styles.marketLabel}>Recommended Action</h4>
              <p style={styles.marketValue}>
                {plan.market_strategy?.action ?? "N/A"}
              </p>
            </div>
          </div>
          <div style={styles.marketDivider} />
          <div style={styles.marketRow}>
            <span style={styles.marketIcon}>📊</span>
            <div>
              <h4 style={styles.marketLabel}>Reasoning</h4>
              <p style={styles.marketValue}>
                {plan.market_strategy?.reason ?? "N/A"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Raw JSON Toggle ────────────────────────────── */}
      <details style={styles.card}>
        <summary style={styles.detailsSummary}>
          🔍 View Raw JSON Response
        </summary>
        <pre style={styles.rawJson}>{JSON.stringify(plan, null, 2)}</pre>
      </details>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  results: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  topRow: {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
  },
  card: {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  sectionSub: {
    margin: "4px 0 18px",
    fontSize: 13,
    color: "#64748b",
  },
  // Confidence
  confidenceRing: {
    position: "relative" as const,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceValue: {
    position: "absolute" as const,
    fontSize: 22,
    fontWeight: 800,
    color: "#f1f5f9",
  },
  confidenceLabel: {
    margin: "10px 0 0",
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  // Key Issue
  keyIssue: {
    marginTop: 18,
    padding: 14,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    border: "1px solid #1e293b",
  },
  keyIssueLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#f59e0b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  keyIssueText: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#f1f5f9",
    lineHeight: 1.6,
  },
  // Smart Insight
  insightCard: {
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 4px 24px rgba(99, 102, 241, 0.1)",
  },
  insightHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 22,
  },
  insightTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "#c4b5fd",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  insightRisk: {
    margin: 0,
    fontSize: 15,
    color: "#e2e8f0",
    lineHeight: 1.7,
  },
  insightAction: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    padding: "10px 14px",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 10,
    border: "1px solid rgba(94, 234, 212, 0.15)",
  },
  insightActionText: {
    fontSize: 13,
    color: "#5eead4",
    lineHeight: 1.6,
    fontWeight: 500,
  },
  // Image Analysis
  imageFindings: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  findingItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 14px",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    border: "1px solid #1e293b",
  },
  findingDot: {
    color: "#38bdf8",
    fontSize: 8,
    marginTop: 5,
    flexShrink: 0,
  },
  findingText: {
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
  // AI Reasoning (bullet list)
  reasoningList: {
    margin: 0,
    paddingLeft: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },
  reasoningBullet: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 1.6,
    padding: "10px 14px",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    border: "1px solid #1e293b",
    listStyle: "none",
  },
  // Timeline
  timeline: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0,
  },
  timelineItem: {
    display: "flex",
    gap: 14,
  },
  timelineLeft: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    width: 40,
    flexShrink: 0,
  },
  timelineIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  timelineIcon: {
    fontSize: 16,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: "#1e293b",
    minHeight: 12,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 18,
  },
  timelineHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 4,
  },
  timelineMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  timelineDay: {
    fontSize: 12,
    fontWeight: 700,
    color: "#5eead4",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  timelineCat: {
    fontSize: 11,
    color: "#475569",
    fontWeight: 500,
  },
  badge: {
    padding: "2px 10px",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 11,
  },
  timelineAction: {
    margin: "4px 0",
    fontSize: 14,
    fontWeight: 600,
    color: "#f1f5f9",
    lineHeight: 1.4,
  },
  timelineReason: {
    margin: 0,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  // Market
  marketBox: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 18,
    border: "1px solid #1e293b",
  },
  marketRow: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  marketIcon: {
    fontSize: 22,
    marginTop: 2,
    flexShrink: 0,
  },
  marketLabel: {
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  marketValue: {
    margin: "5px 0 0",
    fontSize: 14,
    color: "#e2e8f0",
    lineHeight: 1.6,
  },
  marketDivider: {
    height: 1,
    backgroundColor: "#1e293b",
    margin: "14px 0",
  },
  // Raw JSON
  detailsSummary: {
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    color: "#94a3b8",
  },
  rawJson: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    fontSize: 12,
    overflow: "auto",
    color: "#5eead4",
    lineHeight: 1.7,
    border: "1px solid #1e293b",
  },
};
