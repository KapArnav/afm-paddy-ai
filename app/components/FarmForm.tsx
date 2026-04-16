"use client";

export interface FormData {
  // Weather
  rainForecast: string;
  temperature: number;
  humidity: number;
  // Crop Health
  growthStage: string;
  leafColor: string;
  pestPresence: boolean;
  // Market
  priceTrend: string;
  demand: string;
}

interface FarmFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

export default function FarmForm({ formData, onChange }: FarmFormProps) {
  const update = (partial: Partial<FormData>) => {
    onChange({ ...formData, ...partial });
  };

  return (
    <div style={styles.form}>
      {/* ── WEATHER SECTION ──────────────────────────────── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionIcon}>🌦️</span>
          <div>
            <h3 style={styles.sectionTitle}>Weather Conditions</h3>
            <p style={styles.sectionSub}>Current and forecasted weather data</p>
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Rain Forecast</label>
          <select
            style={styles.select}
            value={formData.rainForecast}
            onChange={(e) => update({ rainForecast: e.target.value })}
          >
            <option value="Low">🌤️ Low — Clear skies expected</option>
            <option value="Moderate">🌥️ Moderate — Some showers</option>
            <option value="Heavy">🌧️ Heavy — Significant rainfall</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Temperature: <strong style={{ color: "#5eead4" }}>{formData.temperature}°C</strong>
          </label>
          <input
            type="range"
            min={20}
            max={40}
            step={1}
            value={formData.temperature}
            onChange={(e) => update({ temperature: Number(e.target.value) })}
            style={styles.slider}
          />
          <div style={styles.rangeLabels}>
            <span>20°C</span>
            <span>30°C</span>
            <span>40°C</span>
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Humidity: <strong style={{ color: "#5eead4" }}>{formData.humidity}%</strong>
          </label>
          <input
            type="range"
            min={30}
            max={100}
            step={5}
            value={formData.humidity}
            onChange={(e) => update({ humidity: Number(e.target.value) })}
            style={styles.slider}
          />
          <div style={styles.rangeLabels}>
            <span>30%</span>
            <span>65%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* ── CROP HEALTH SECTION ──────────────────────────── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionIcon}>🌱</span>
          <div>
            <h3 style={styles.sectionTitle}>Crop Health</h3>
            <p style={styles.sectionSub}>Current state of your paddy crop</p>
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Growth Stage</label>
          <select
            style={styles.select}
            value={formData.growthStage}
            onChange={(e) => update({ growthStage: e.target.value })}
          >
            <option value="Seedling">🌱 Seedling (0–20 days)</option>
            <option value="Tillering">🌿 Tillering (21–50 days)</option>
            <option value="Panicle Initiation">🌾 Panicle Initiation (51–70 days)</option>
            <option value="Maturity">✅ Maturity (71–120 days)</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Leaf Color</label>
          <select
            style={styles.select}
            value={formData.leafColor}
            onChange={(e) => update({ leafColor: e.target.value })}
          >
            <option value="Dark Green">🟢 Dark Green — Healthy</option>
            <option value="Normal Green">🟡 Normal Green — Adequate</option>
            <option value="Yellowing">🔴 Yellowing — Possible deficiency</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Pest Presence</label>
          <div
            style={styles.toggleWrap}
            onClick={() => update({ pestPresence: !formData.pestPresence })}
          >
            <div
              style={{
                ...styles.toggle,
                backgroundColor: formData.pestPresence ? "#ef4444" : "#1e293b",
                borderColor: formData.pestPresence ? "#ef4444" : "#334155",
              }}
            >
              <div
                style={{
                  ...styles.toggleDot,
                  transform: formData.pestPresence ? "translateX(22px)" : "translateX(0)",
                }}
              />
            </div>
            <span style={{ color: formData.pestPresence ? "#fca5a5" : "#64748b", fontSize: 14, fontWeight: 600 }}>
              {formData.pestPresence ? "🐛 Yes — Pests detected" : "✅ No — No pests"}
            </span>
          </div>
        </div>
      </div>

      {/* ── MARKET SECTION ───────────────────────────────── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionIcon}>📈</span>
          <div>
            <h3 style={styles.sectionTitle}>Market Conditions</h3>
            <p style={styles.sectionSub}>Current paddy market situation</p>
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Price Trend</label>
          <select
            style={styles.select}
            value={formData.priceTrend}
            onChange={(e) => update({ priceTrend: e.target.value })}
          >
            <option value="Falling">📉 Falling — Prices declining</option>
            <option value="Stable">➡️ Stable — Prices steady</option>
            <option value="Rising">📈 Rising — Prices increasing</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Demand Level</label>
          <select
            style={styles.select}
            value={formData.demand}
            onChange={(e) => update({ demand: e.target.value })}
          >
            <option value="Low">🔻 Low — Weak demand</option>
            <option value="Medium">➖ Medium — Normal demand</option>
            <option value="High">🔺 High — Strong demand</option>
          </select>
        </div>
      </div>

      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, #059669 0%, #f59e0b 50%, #ef4444 100%);
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 3px solid #059669;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 3px solid #059669;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  section: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 20,
    border: "1px solid #1e293b",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #1e293b",
  },
  sectionIcon: {
    fontSize: 28,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  sectionSub: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "#64748b",
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  select: {
    width: "100%",
    padding: "12px 40px 12px 16px",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 10,
    color: "#e2e8f0",
    fontSize: 14,
    cursor: "pointer",
    outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as never,
  },
  slider: {
    width: "100%",
    cursor: "pointer",
  },
  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 6,
    fontSize: 11,
    color: "#475569",
  },
  toggleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    userSelect: "none" as const,
  },
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 999,
    border: "2px solid #334155",
    position: "relative" as const,
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    position: "absolute" as const,
    top: 2,
    left: 2,
    transition: "transform 0.2s ease",
  },
};
