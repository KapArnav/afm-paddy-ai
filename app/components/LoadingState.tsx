"use client";

export default function LoadingState() {
  return (
    <div style={styles.container}>
      <div style={styles.spinnerWrap}>
        <div style={styles.spinner} />
        <span style={styles.emoji}>🌾</span>
      </div>
      <h3 style={styles.title}>Generating Your Farm Plan...</h3>
      <p style={styles.subtitle}>
        AI is analyzing weather, crop health, and market data
      </p>
      <div style={styles.steps}>
        {[
          "📡 Processing sensor data",
          "🌦️ Analyzing weather patterns",
          "🔬 Evaluating crop health",
          "📊 Checking market trends",
          "🧠 Building recommendations",
        ].map((step, i) => (
          <div
            key={i}
            style={{
              ...styles.step,
              animationDelay: `${i * 0.6}s`,
            }}
          >
            {step}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    backgroundColor: "#111827",
    borderRadius: 16,
    border: "1px solid #1e293b",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  spinnerWrap: {
    position: "relative",
    width: 80,
    height: 80,
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    position: "absolute",
    inset: 0,
    border: "4px solid #1e293b",
    borderTopColor: "#059669",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  emoji: {
    fontSize: 32,
    animation: "pulse 2s ease-in-out infinite",
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  subtitle: {
    margin: "8px 0 24px",
    fontSize: 14,
    color: "#64748b",
  },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    maxWidth: 320,
  },
  step: {
    fontSize: 13,
    color: "#94a3b8",
    padding: "8px 16px",
    backgroundColor: "#0f172a",
    borderRadius: 8,
    textAlign: "center",
    animation: "fadeInUp 0.5s ease forwards, pulse 3s ease-in-out infinite",
    opacity: 0,
  },
};
