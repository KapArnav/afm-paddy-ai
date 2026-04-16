"use client";

import { useState, useCallback } from "react";
import FarmForm from "./components/FarmForm";
import type { FormData } from "./components/FarmForm";
import ImageUpload from "./components/ImageUpload";
import ResultDisplay from "./components/ResultDisplay";
import LoadingState from "./components/LoadingState";

// ── Types ───────────────────────────────────────────────────────────
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
  timeline: {
    day: number;
    action: string;
    reason: string;
    priority: "High" | "Medium" | "Low";
    category?: string;
  }[];
  market_strategy: {
    action: string;
    reason: string;
  };
  ai_reasoning?: string[];
}

interface ApiResponse {
  success?: boolean;
  plan?: FarmPlan;
  error?: string;
  detail?: string;
  raw_text?: string;
}

// ── Default form state ──────────────────────────────────────────────
const DEFAULT_FORM: FormData = {
  rainForecast: "Moderate",
  temperature: 32,
  humidity: 80,
  growthStage: "Tillering",
  leafColor: "Normal Green",
  pestPresence: false,
  priceTrend: "Stable",
  demand: "Medium",
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeOptimize, setActiveOptimize] = useState("balanced");

  const handleImageChange = useCallback(
    (base64: string | null, mimeType: string | null) => {
      setImageBase64(base64);
      setImageMimeType(mimeType);
    },
    []
  );

  async function handleGenerate(optimizeFor: string = "balanced") {
    setLoading(true);
    setResult(null);
    setError(null);
    setActiveOptimize(optimizeFor);

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          image: imageBase64,
          imageMimeType,
          optimizeFor,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? `Request failed with status ${res.status}`);
        setResult(data);
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const plan = result?.plan;

  return (
    <div style={styles.page}>
      {/* ── Header ──────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <span style={styles.logo}>🌾</span>
            <div>
              <h1 style={styles.title}>AFM Paddy AI</h1>
              <p style={styles.subtitle}>
                Autonomous Farm Manager for Malaysian Farmers
              </p>
            </div>
          </div>
          <div style={styles.headerBadge}>
            <span style={styles.badgeText}>🤖 Powered by Gemini AI</span>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          {/* ── Left Column: Inputs ─────────────────────── */}
          <div style={styles.leftCol}>
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>📋 Farm Data Input</h2>
                <p style={styles.cardSub}>
                  Fill in your current conditions — AI will analyze everything
                </p>
              </div>
              <FarmForm formData={formData} onChange={setFormData} />
            </section>

            <section style={styles.card}>
              <ImageUpload onImageChange={handleImageChange} />
            </section>

            {/* ── Action Buttons ────────────────────────── */}
            <div style={styles.actionButtons}>
              <button
                onClick={() => handleGenerate("balanced")}
                disabled={loading}
                style={{
                  ...styles.primaryBtn,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading && activeOptimize === "balanced"
                  ? "⏳ Generating..."
                  : "🚀 Generate Farm Plan"}
              </button>

              <div style={styles.secondaryRow}>
                <button
                  onClick={() => handleGenerate("profit")}
                  disabled={loading}
                  style={{
                    ...styles.secondaryBtn,
                    ...styles.profitBtn,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading && activeOptimize === "profit"
                    ? "⏳..."
                    : "💰 Optimize for Profit"}
                </button>
                <button
                  onClick={() => handleGenerate("yield")}
                  disabled={loading}
                  style={{
                    ...styles.secondaryBtn,
                    ...styles.yieldBtn,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading && activeOptimize === "yield"
                    ? "⏳..."
                    : "🌾 Optimize for Yield"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Column: Results ───────────────────── */}
          <div style={styles.rightCol}>
            {loading && <LoadingState />}

            {error && !loading && (
              <section style={styles.errorCard}>
                <h3 style={{ margin: "0 0 8px 0", color: "#fca5a5" }}>
                  ❌ Error
                </h3>
                <p style={{ margin: 0, color: "#fecaca" }}>{error}</p>
                {result?.detail && (
                  <pre style={styles.errorPre}>{result.detail}</pre>
                )}
                {result?.raw_text && (
                  <pre style={styles.errorPre}>{result.raw_text}</pre>
                )}
              </section>
            )}

            {plan && !loading && <ResultDisplay plan={plan} hasImage={!!imageBase64} />}

            {!plan && !loading && !error && (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🌾</span>
                <h3 style={styles.emptyTitle}>Ready to Analyze</h3>
                <p style={styles.emptyText}>
                  Fill in your farm data on the left and click
                  &quot;Generate Farm Plan&quot; to get AI-powered recommendations.
                </p>
                <div style={styles.featureGrid}>
                  {[
                    { icon: "🧠", label: "AI Reasoning" },
                    { icon: "📊", label: "Risk Analysis" },
                    { icon: "📅", label: "30-Day Plan" },
                    { icon: "💰", label: "Market Strategy" },
                  ].map((f) => (
                    <div key={f.label} style={styles.featureItem}>
                      <span style={{ fontSize: 24 }}>{f.icon}</span>
                      <span style={styles.featureLabel}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer style={styles.footer}>
        <p>
          AFM Paddy AI — Autonomous Farm Manager • Built with Next.js &amp;
          Gemini Flash
        </p>
      </footer>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0a0f1a",
    color: "#e2e8f0",
    fontFamily:
      "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  header: {
    background:
      "linear-gradient(135deg, #064e3b 0%, #0f766e 40%, #065f46 100%)",
    padding: "24px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    position: "sticky" as const,
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(12px)",
  },
  headerInner: {
    maxWidth: 1400,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: 12,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  logo: { fontSize: 42 },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    color: "#ffffff",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "#a7f3d0",
    fontWeight: 400,
  },
  headerBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: "6px 16px",
    border: "1px solid rgba(255,255,255,0.15)",
  },
  badgeText: {
    fontSize: 12,
    color: "#a7f3d0",
    fontWeight: 600,
  },
  main: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "32px 24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
    gap: 28,
    alignItems: "start",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 20,
  },
  rightCol: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 24,
  },
  card: {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  cardHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #1e293b",
  },
  cardTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  cardSub: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#64748b",
  },
  actionButtons: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  primaryBtn: {
    width: "100%",
    padding: "16px 24px",
    background: "linear-gradient(135deg, #059669, #0d9488)",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "0.3px",
    boxShadow: "0 4px 14px rgba(5, 150, 105, 0.4)",
    transition: "all 0.2s ease",
  },
  secondaryRow: {
    display: "flex",
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    color: "#ffffff",
    transition: "all 0.2s ease",
  },
  profitBtn: {
    background: "linear-gradient(135deg, #b45309, #d97706)",
    boxShadow: "0 4px 14px rgba(217, 119, 6, 0.3)",
  },
  yieldBtn: {
    background: "linear-gradient(135deg, #047857, #10b981)",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
  },
  errorCard: {
    backgroundColor: "rgba(127, 29, 29, 0.3)",
    border: "1px solid #991b1b",
    borderRadius: 16,
    padding: 24,
  },
  errorPre: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    fontSize: 12,
    overflow: "auto",
    color: "#fca5a5",
    maxHeight: 200,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 32px",
    backgroundColor: "#111827",
    borderRadius: 16,
    border: "1px solid #1e293b",
    textAlign: "center" as const,
    minHeight: 500,
  },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  emptyText: {
    margin: "10px 0 32px",
    fontSize: 14,
    color: "#64748b",
    maxWidth: 400,
    lineHeight: 1.7,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    width: "100%",
    maxWidth: 320,
  },
  featureItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 8,
    padding: "16px 12px",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    border: "1px solid #1e293b",
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#94a3b8",
  },
  footer: {
    textAlign: "center" as const,
    padding: "24px",
    fontSize: 13,
    color: "#475569",
    borderTop: "1px solid #1e293b",
  },
};
