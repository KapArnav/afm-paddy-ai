"use client";

interface RiskMeterProps {
  level: string; // "Low" | "Medium" | "High"
}

export default function RiskMeter({ level }: RiskMeterProps) {
  const normalized = level?.toLowerCase() ?? "low";

  let percentage = 33;
  let color = "#22c55e";
  let glowColor = "rgba(34, 197, 94, 0.4)";
  let label = "Low Risk";

  if (normalized === "medium") {
    percentage = 60;
    color = "#f59e0b";
    glowColor = "rgba(245, 158, 11, 0.4)";
    label = "Medium Risk";
  } else if (normalized === "high") {
    percentage = 90;
    color = "#ef4444";
    glowColor = "rgba(239, 68, 68, 0.4)";
    label = "High Risk";
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={styles.header}>
        <span style={styles.label}>Overall Risk Level</span>
        <span style={{ ...styles.badge, backgroundColor: color, boxShadow: `0 2px 12px ${glowColor}` }}>
          {label}
        </span>
      </div>
      <div style={styles.trackOuter}>
        <div style={styles.trackBg}>
          <div
            style={{
              ...styles.fill,
              width: `${percentage}%`,
              background: `linear-gradient(90deg, #22c55e 0%, #f59e0b 50%, #ef4444 100%)`,
              boxShadow: `0 0 16px ${glowColor}`,
            }}
          />
          <div
            style={{
              ...styles.indicator,
              left: `${percentage}%`,
              backgroundColor: color,
              boxShadow: `0 0 12px ${glowColor}`,
            }}
          />
        </div>
        <div style={styles.labels}>
          <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 600 }}>Low</span>
          <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 600 }}>Medium</span>
          <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>High</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  badge: {
    padding: "4px 16px",
    borderRadius: 20,
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
  },
  trackOuter: {
    width: "100%",
  },
  trackBg: {
    position: "relative",
    width: "100%",
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 999,
    overflow: "visible",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 1s ease-out",
  },
  indicator: {
    position: "absolute",
    top: -5,
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "3px solid #0f172a",
    transform: "translateX(-50%)",
    transition: "left 1s ease-out",
  },
  labels: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
  },
};
