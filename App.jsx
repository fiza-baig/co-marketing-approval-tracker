import React, { useState, useMemo } from "react";
import { Plane, Plus, Trash2, Radar, AlertTriangle, Clock, CheckCircle2, Loader2 } from "lucide-react";

const TEAMS = ["Legal", "Partner", "Creative", "Finance", "Sales"];
const STATUS = {
  cleared: { label: "Cleared", color: "#4FA98A", bg: "rgba(79,169,138,0.12)" },
  waiting: { label: "Waiting", color: "#E8963A", bg: "rgba(232,150,58,0.12)" },
  blocked: { label: "Blocked", color: "#E2574C", bg: "rgba(226,87,76,0.14)" },
};

const seed = [
  { id: 1, item: "Co-branded CRM email copy", team: "Legal", status: "blocked", days: 6, note: "Awaiting redline on partner logo usage terms" },
  { id: 2, item: "Influencer content brief", team: "Partner", status: "waiting", days: 3, note: "Sent Tuesday, no response yet" },
  { id: 3, item: "Paid social creative set", team: "Creative", status: "cleared", days: 0, note: "Approved Friday" },
  { id: 4, item: "Campaign budget sign-off", team: "Finance", status: "blocked", days: 4, note: "Waiting on updated spend forecast" },
  { id: 5, item: "Partner co-marketing addendum", team: "Legal", status: "waiting", days: 2, note: "In review, standard turnaround" },
];

export default function App() {
  const [items, setItems] = useState(seed);
  const [form, setForm] = useState({ item: "", team: "Legal", status: "waiting", days: 1, note: "" });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const counts = useMemo(() => {
    const c = { cleared: 0, waiting: 0, blocked: 0 };
    items.forEach((i) => c[i.status]++);
    return c;
  }, [items]);

  const readiness = items.length ? Math.round((counts.cleared / items.length) * 100) : 0;

  function addItem() {
    if (!form.item.trim()) return;
    setItems([...items, { ...form, id: Date.now(), days: Number(form.days) }]);
    setForm({ item: "", team: "Legal", status: "waiting", days: 1, note: "" });
  }

  function removeItem(id) {
    setItems(items.filter((i) => i.id !== id));
    setAnalysis(null);
  }

  async function analyzeBlockers() {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const payload = items.map(({ item, team, status, days, note }) => ({ item, team, status, days, note }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a marketing operations PM co-pilot. Given this list of campaign approval items (JSON below), identify what is actually blocking the campaign launch, rank the top blockers by urgency, and suggest one concrete next action per blocker. Ignore items already "cleared". Respond ONLY with valid JSON, no preamble, no markdown fences, in this exact shape:
{"summary": "one sentence on overall launch risk", "blockers": [{"item": "string", "team": "string", "urgency": "high|medium|low", "action": "one concrete next step, under 20 words"}]}

Items: ${JSON.stringify(payload)}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = data.content?.find((b) => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAnalysis(parsed);
    } catch (e) {
      setError("Couldn't reach the triage model. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#12141C",
      color: "#EDEEF2",
      minHeight: "100vh",
      padding: "40px 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .display { font-family: 'Space Grotesk', sans-serif; }
        input, select { font-family: inherit; }
        button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid #5B8DEF; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <Radar size={22} color="#5B8DEF" />
          <span className="mono" style={{ fontSize: 12, letterSpacing: 2, color: "#8B90A0", textTransform: "uppercase" }}>
            Launch Clearance Board
          </span>
        </div>
        <h1 className="display" style={{ fontSize: 32, fontWeight: 700, margin: "4px 0 6px" }}>
          Co-Marketing Approval Tracker
        </h1>
        <p style={{ color: "#8B90A0", fontSize: 15, margin: "0 0 28px", maxWidth: 560 }}>
          Track every approval standing between this campaign and launch. Add items below, then let Claude triage what's actually blocking clearance.
        </p>

        {/* Readiness meter */}
        <div style={{ background: "#1B1E29", borderRadius: 12, padding: "20px 24px", marginBottom: 28, border: "1px solid #262A38" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "#8B90A0", fontWeight: 500 }}>Launch readiness</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 500, color: readiness === 100 ? "#4FA98A" : "#EDEEF2" }}>{readiness}%</span>
          </div>
          <div style={{ display: "flex", gap: 4, height: 10, borderRadius: 6, overflow: "hidden" }}>
            {items.map((i) => (
              <div key={i.id} title={i.item} style={{ flex: 1, background: STATUS[i.status].color, minWidth: 6, borderRadius: 3 }} />
            ))}
            {items.length === 0 && <div style={{ flex: 1, background: "#262A38", borderRadius: 3 }} />}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
            {Object.entries(STATUS).map(([key, s]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#8B90A0" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                {s.label} · {counts[key]}
              </div>
            ))}
          </div>
        </div>

        {/* Add item form */}
        <div style={{ background: "#1B1E29", borderRadius: 12, padding: 20, marginBottom: 24, border: "1px solid #262A38" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.7fr auto", gap: 10, marginBottom: 10 }}>
            <input
              placeholder="Approval item (e.g. Influencer contract)"
              value={form.item}
              onChange={(e) => setForm({ ...form, item: e.target.value })}
              style={inputStyle}
            />
            <select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} style={inputStyle}>
              {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
              {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
            </select>
            <input
              type="number" min="0" placeholder="Days"
              value={form.days}
              onChange={(e) => setForm({ ...form, days: e.target.value })}
              style={inputStyle}
            />
            <button onClick={addItem} style={addBtnStyle} aria-label="Add approval item">
              <Plus size={18} />
            </button>
          </div>
          <input
            placeholder="Note (optional context)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>

        {/* Items list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {items.map((i) => (
            <div key={i.id} style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "#1B1E29", border: "1px solid #262A38", borderRadius: 10, padding: "14px 16px",
            }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                background: STATUS[i.status].bg, color: STATUS[i.status].color, textTransform: "uppercase", letterSpacing: 0.5,
                whiteSpace: "nowrap",
              }}>
                {STATUS[i.status].label}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{i.item}</div>
                <div style={{ fontSize: 13, color: "#8B90A0", marginTop: 2 }}>{i.team} {i.note ? `· ${i.note}` : ""}</div>
              </div>
              {i.status !== "cleared" && (
                <div className="mono" style={{ fontSize: 13, color: i.days >= 5 ? "#E2574C" : "#8B90A0", whiteSpace: "nowrap" }}>
                  {i.days}d waiting
                </div>
              )}
              <button onClick={() => removeItem(i.id)} style={iconBtnStyle} aria-label={`Remove ${i.item}`}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ textAlign: "center", color: "#8B90A0", padding: "32px 0", fontSize: 14 }}>
              No approval items yet. Add one above to start tracking.
            </div>
          )}
        </div>

        {/* Analyze button */}
        <button onClick={analyzeBlockers} disabled={loading || items.length === 0} style={analyzeBtnStyle}>
          {loading ? <Loader2 size={17} className="spin" style={{ animation: "spin 1s linear infinite" }} /> : <Plane size={17} />}
          {loading ? "Analyzing clearance..." : "Analyze blockers"}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {error && (
          <div style={{ marginTop: 14, color: "#E2574C", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <div style={{ marginTop: 24, background: "#1B1E29", border: "1px solid #262A38", borderRadius: 12, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Radar size={16} color="#5B8DEF" />
              <span className="mono" style={{ fontSize: 12, letterSpacing: 1.5, color: "#8B90A0", textTransform: "uppercase" }}>
                Triage
              </span>
            </div>
            <p style={{ fontSize: 15, marginBottom: 18, color: "#EDEEF2" }}>{analysis.summary}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {analysis.blockers?.map((b, idx) => (
                <div key={idx} style={{
                  display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)", border: "1px solid #262A38",
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, height: "fit-content",
                    textTransform: "uppercase", letterSpacing: 0.5,
                    background: b.urgency === "high" ? "rgba(226,87,76,0.16)" : b.urgency === "medium" ? "rgba(232,150,58,0.16)" : "rgba(79,169,138,0.16)",
                    color: b.urgency === "high" ? "#E2574C" : b.urgency === "medium" ? "#E8963A" : "#4FA98A",
                  }}>
                    {b.urgency}
                  </span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{b.item} <span style={{ color: "#8B90A0", fontWeight: 400 }}>· {b.team}</span></div>
                    <div style={{ fontSize: 13, color: "#8B90A0", marginTop: 3 }}>{b.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ marginTop: 32, fontSize: 12, color: "#565B6B", textAlign: "center" }}>
          Built as a portfolio demo — Claude-assisted triage for co-marketing approval bottlenecks.
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "#12141C", border: "1px solid #262A38", borderRadius: 8, color: "#EDEEF2",
  padding: "10px 12px", fontSize: 14, width: "100%",
};

const addBtnStyle = {
  background: "#5B8DEF", border: "none", borderRadius: 8, color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: "0 14px",
};

const iconBtnStyle = {
  background: "transparent", border: "none", color: "#565B6B", cursor: "pointer", padding: 4, display: "flex",
};

const analyzeBtnStyle = {
  display: "flex", alignItems: "center", gap: 8, background: "#5B8DEF", color: "#fff", border: "none",
  borderRadius: 10, padding: "13px 22px", fontSize: 15, fontWeight: 500, cursor: "pointer",
};
