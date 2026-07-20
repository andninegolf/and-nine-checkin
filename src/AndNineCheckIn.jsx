import { useState } from "react";

/**
 * & Nine — Event Check-In
 * ------------------------------------------------------------------
 * Self-contained check-in form for iPad use at & Nine events.
 * Drop into your existing stack — call `onSubmit(payload)` to send
 * the payload to Airtable / EmailJS, or wire it up inline below.
 *
 * Fields captured:
 *  - Participant name
 *  - Email address
 *  - Dominant hand (right / left)
 *  - Golf experience level
 *  - Liability waiver acknowledgement
 *  - Optional: signing on behalf of a minor (guardian + minor name)
 *  - Opt-in to updates from & Nine and partners
 */

const COLORS = {
  navy: "#1A2535",
  brass: "#B08D5B",
  clay: "#C4724A",
  rope: "#E8E2D6",
  eggshell: "#F5F0E8",
};

const WAIVER_TEXT_ADULT = `WAIVER AND RELEASE OF LIABILITY

ASSUMPTION OF RISK

I understand that participating in this & Nine golf simulator experience
involves inherent risks, including but not limited to:

  - Being struck by a golf ball or club, including from my own swing or
    another participant's.
  - A golf ball ricocheting or rebounding off the impact screen, inflatable
    enclosure, or side barriers — including on a mis-hit or thin shot —
    and traveling back toward the hitting area at speed.
  - Muscle strain, joint injury, or other physical exertion injury from
    swinging a golf club.
  - Trips, slips, or falls related to equipment, cables, mats, or uneven
    setup surfaces.
  - Property damage to personal items (phones, glasses, jewelry) from a
    misdirected ball or club.

I understand that & Nine offers standard golf balls by default, and that
foam training balls are available on request as a lower-impact alternative
that reduces (but does not eliminate) the risk of ricochet-related injury.
I have been informed of this option and have made my choice below.

I voluntarily assume all of the risks described above, whether or not
specifically listed, and understand that no amount of care or caution by
& Nine eliminates the possibility of injury.

RELEASE OF LIABILITY

In consideration of being permitted to participate, I release and hold
harmless & Nine, its owners, staff, contractors, and the event host from
any and all claims, liabilities, or damages arising from my participation
due to ORDINARY NEGLIGENCE. This release does not cover gross negligence
or willful misconduct.

I confirm that I am physically able to participate and will follow all
instructions given by & Nine staff regarding equipment and safe play.`;

const WAIVER_TEXT_MINOR = `WAIVER AND RELEASE OF LIABILITY — SIGNED BY PARENT / GUARDIAN

ASSUMPTION OF RISK

I understand that the minor's participation in this & Nine golf simulator
experience involves inherent risks, including but not limited to:

  - Being struck by a golf ball or club, including from the minor's own
    swing or another participant's.
  - A golf ball ricocheting or rebounding off the impact screen, inflatable
    enclosure, or side barriers — including on a mis-hit or thin shot —
    and traveling back toward the hitting area at speed.
  - Muscle strain, joint injury, or other physical exertion injury from
    swinging a golf club.
  - Trips, slips, or falls related to equipment, cables, mats, or uneven
    setup surfaces.
  - Property damage to personal items (phones, glasses, jewelry) from a
    misdirected ball or club.

I understand that & Nine offers standard golf balls by default, and that
foam training balls are available on request as a lower-impact alternative
that reduces (but does not eliminate) the risk of ricochet-related injury.
I have been informed of this option and have made my choice on behalf of
the minor below.

I voluntarily assume all of the risks described above on behalf of the
minor named in this form, whether or not specifically listed, and
understand that no amount of care or caution by & Nine eliminates the
possibility of injury.

RELEASE OF LIABILITY

On my own behalf, I release and hold harmless & Nine, its owners, staff,
contractors, and the event host from any claim I personally may have for
injury to the parent-child relationship arising from the minor's
participation, due to ORDINARY NEGLIGENCE. This release does not cover
gross negligence or willful misconduct.

Under Washington law, a parent or guardian cannot waive a minor's own
right to bring a claim for their own injuries. Signing this form does not
give up the minor's individual right to do so — it documents that I was
informed of the risks described above and agreed to them on the minor's
behalf for purposes of participation today.

I confirm the minor is physically able to participate and will follow all
instructions given by & Nine staff regarding equipment and safe play.`;

const SAFETY_RULES = [
  "Check that your swing area and the space behind you are clear before taking a swing.",
  "Stay clear of others' swing paths and simulator bays at all times.",
  "Keep clubs, bags, and personal items out of walkways and adjoining bays.",
  "Only swing within the designated hitting area — no swinging elsewhere on site.",
  "Follow & Nine staff instructions on equipment use, bay assignment, and play order.",
];

const EXPERIENCE_LEVELS = [
  { value: "new", label: "New to golf", hint: "Never played, or just starting out" },
  { value: "some", label: "Some experience", hint: "Played a handful of times" },
  { value: "regular", label: "Regular golfer", hint: "Play a few times a season" },
  { value: "competitive", label: "Competitive / advanced", hint: "Low handicap or tournament play" },
];

function initialState() {
  return {
    name: "",
    email: "",
    hand: "",
    experience: "",
    waiverAgreed: false,
    safetyRulesAgreed: false,
    isMinor: false,
    minorName: "",
    signature: "",
    optIn: false,
  };
}

export default function AndNineCheckIn({ onSubmit } = {}) {
  const [form, setForm] = useState(initialState());
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Enter a name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.hand) e.hand = "Choose a hand.";
    if (!form.experience) e.experience = "Choose an experience level.";
    if (!form.waiverAgreed) e.waiver = "Agreement to the waiver is required to check in.";
    if (!form.safetyRulesAgreed) e.safetyRules = "Agreement to the safety rules is required to check in.";
    if (!form.signature.trim()) e.signature = "Type your full name as your signature.";
    if (form.isMinor && !form.minorName.trim()) e.minorName = "Enter the minor's name.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      dominantHand: form.hand,
      experienceLevel: form.experience,
      waiverAgreed: true,
      safetyRulesAgreed: true,
      signature: form.signature.trim(),
      signedOnBehalfOfMinor: form.isMinor,
      minorName: form.isMinor ? form.minorName.trim() : null,
      guardianName: form.isMinor ? form.name.trim() : null,
      optInUpdates: form.optIn,
      submittedAt: new Date().toISOString(),
    };

    setSubmitError("");

    const submitFn =
      typeof onSubmit === "function"
        ? onSubmit
        : async (data) => {
            const response = await fetch("/.netlify/functions/checkin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (!response.ok) {
              const text = await response.text();
              throw new Error(text || "Check-in could not be saved.");
            }
          };

    try {
      await submitFn(payload);
      setSubmitted(true);
    } catch (err) {
      console.error("& Nine check-in failed:", err);
      setSubmitError(
        "Something went wrong saving your check-in. Please try again, or let a staff member know."
      );
    }
  }

  function resetForm() {
    setForm(initialState());
    setErrors({});
    setSubmitted(false);
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        .an-radio-card:focus-within, .an-check-row:focus-within {
          outline: 2px solid ${COLORS.clay};
          outline-offset: 2px;
        }
        .an-btn:focus-visible, .an-radio-card input:focus-visible {
          outline: 2px solid ${COLORS.clay};
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .an-stamp { animation: none !important; }
        }
        @keyframes an-stamp-in {
          0% { opacity: 0; transform: scale(2.2) rotate(-8deg); }
          60% { opacity: 1; transform: scale(0.94) rotate(-8deg); }
          100% { opacity: 1; transform: scale(1) rotate(-8deg); }
        }
      `}</style>

      <div style={styles.card}>
        <header style={styles.header}>
          <div style={styles.eyebrow}>& Nine — Event Check-In</div>
          <h1 style={styles.title}>Welcome to the tee.</h1>
          <p style={styles.subtitle}>
            A few quick details before we get you swinging.
          </p>
        </header>

        {submitted ? (
          <ConfirmationView name={form.name} onReset={resetForm} />
        ) : (
          <form onSubmit={handleSubmit} noValidate style={styles.form}>
            {/* Name + Email */}
            <div style={styles.grid2}>
              <Field label={form.isMinor ? "Your full name (parent / guardian)" : "Full name"} error={errors.name}>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jordan Casey"
                  autoComplete="name"
                />
              </Field>
              <Field label="Email address" error={errors.email}>
                <input
                  style={styles.input}
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="jordan@email.com"
                  autoComplete="email"
                />
              </Field>
            </div>

            {/* Minor toggle — placed high in the form so it's established before anything else */}
            <label className="an-check-row" style={styles.checkRow}>
              <input
                type="checkbox"
                checked={form.isMinor}
                onChange={(e) => update("isMinor", e.target.checked)}
                style={styles.checkbox}
              />
              <span>I'm signing in — and agreeing to this waiver — on behalf of a minor.</span>
            </label>

            {form.isMinor && (
              <Field label="Name of the minor you're signing for" error={errors.minorName}>
                <input
                  style={styles.minorNameInput}
                  value={form.minorName}
                  onChange={(e) => update("minorName", e.target.value)}
                  placeholder="Minor's full name"
                  autoFocus
                />
              </Field>
            )}

            {/* Dominant hand */}
            <Field label="Dominant hand" error={errors.hand}>
              <div style={styles.radioRow}>
                {["Right", "Left"].map((opt) => (
                  <label
                    key={opt}
                    className="an-radio-card"
                    style={{
                      ...styles.radioCard,
                      ...(form.hand === opt ? styles.radioCardActive : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="hand"
                      value={opt}
                      checked={form.hand === opt}
                      onChange={() => update("hand", opt)}
                      style={styles.hiddenRadio}
                    />
                    {opt}-handed
                  </label>
                ))}
              </div>
            </Field>

            {/* Golf experience */}
            <Field label="Golf experience" error={errors.experience}>
              <div style={styles.experienceGrid}>
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <label
                    key={lvl.value}
                    className="an-radio-card"
                    style={{
                      ...styles.expCard,
                      ...(form.experience === lvl.value ? styles.radioCardActive : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="experience"
                      value={lvl.value}
                      checked={form.experience === lvl.value}
                      onChange={() => update("experience", lvl.value)}
                      style={styles.hiddenRadio}
                    />
                    <span style={styles.expLabel}>{lvl.label}</span>
                    <span style={styles.expHint}>{lvl.hint}</span>
                  </label>
                ))}
              </div>
            </Field>

            {/* Event safety rules — separate, explicit acknowledgment of specific hazards */}
            <div style={styles.safetyBlock}>
              <span style={styles.waiverLabel}>Event safety rules</span>
              <ul style={styles.safetyList}>
                {SAFETY_RULES.map((rule, i) => (
                  <li key={i} style={styles.safetyItem}>{rule}</li>
                ))}
              </ul>
              <label className="an-check-row" style={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={form.safetyRulesAgreed}
                  onChange={(e) => update("safetyRulesAgreed", e.target.checked)}
                  style={styles.checkbox}
                />
                <span>
                  {form.isMinor
                    ? "I have reviewed these safety rules with the minor named above and both of us agree to follow them."
                    : "I have read and agree to follow these safety rules."}
                </span>
              </label>
              {errors.safetyRules && <div style={styles.errorText}>{errors.safetyRules}</div>}
            </div>

            {/* Liability waiver — always shown in full; conspicuousness matters under WA law */}
            <div style={styles.waiverBlock}>
              <div style={styles.waiverHeaderRow}>
                <span style={styles.waiverLabel}>
                  {form.isMinor ? "Waiver and release — parent / guardian" : "Waiver and release of liability"}
                </span>
              </div>

              <div style={styles.waiverText}>
                {(form.isMinor ? WAIVER_TEXT_MINOR : WAIVER_TEXT_ADULT)
                  .split("\n\n")
                  .map((p, i) => (
                    <p key={i} style={{ margin: "0 0 10px", fontWeight: i === 0 ? 700 : 400 }}>
                      {p}
                    </p>
                  ))}
              </div>

              <label className="an-check-row" style={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={form.waiverAgreed}
                  onChange={(e) => update("waiverAgreed", e.target.checked)}
                  style={styles.checkbox}
                />
                <span>
                  {form.isMinor
                    ? "I am the parent or legal guardian of the minor named above. I have read the waiver above and agree to its terms as described."
                    : "I have read and agree to the waiver and release of liability above."}
                </span>
              </label>
              {errors.waiver && <div style={styles.errorText}>{errors.waiver}</div>}

              <Field label="Type your full legal name as your signature" error={errors.signature}>
                <input
                  style={{ ...styles.input, marginTop: 8, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19 }}
                  value={form.signature}
                  onChange={(e) => update("signature", e.target.value)}
                  placeholder="Signed by typing your name"
                />
              </Field>
            </div>

            {/* Opt-in */}
            <label className="an-check-row" style={styles.checkRow}>
              <input
                type="checkbox"
                checked={form.optIn}
                onChange={(e) => update("optIn", e.target.checked)}
                style={styles.checkbox}
              />
              <span>Keep me posted on future & Nine events and offers from our partners.</span>
            </label>

            {submitError && <div style={styles.submitErrorText}>{submitError}</div>}

            <button type="submit" className="an-btn" style={styles.submitBtn}>
              Check in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <div style={styles.errorText}>{error}</div>}
    </div>
  );
}

function ConfirmationView({ name, onReset }) {
  const firstName = (name || "").trim().split(" ")[0] || "there";
  return (
    <div style={styles.confirmWrap}>
      <div className="an-stamp" style={{ ...styles.stamp, animation: "an-stamp-in 0.5s ease-out" }}>
        <div style={styles.stampInner}>
          <span style={styles.stampTop}>CHECKED IN</span>
          <span style={styles.stampMid}>& NINE</span>
          <span style={styles.stampBottom}>ON THE TEE</span>
        </div>
      </div>
      <h2 style={styles.confirmTitle}>You're all set, {firstName}.</h2>
      <p style={styles.confirmSubtitle}>
        Grab a spot near the mat — a member of our team will get you started shortly.
      </p>
      <button type="button" className="an-btn" style={styles.resetBtn} onClick={onReset}>
        Check in another guest
      </button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: COLORS.navy,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 640,
    background: COLORS.eggshell,
    borderRadius: 4,
    padding: "40px 36px 36px",
    boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)",
    border: `1px solid ${COLORS.rope}`,
  },
  header: {
    marginBottom: 28,
    textAlign: "center",
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: COLORS.clay,
    fontWeight: 700,
    marginBottom: 10,
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 600,
    fontSize: 40,
    color: COLORS.navy,
    margin: "0 0 8px",
    lineHeight: 1.1,
  },
  subtitle: {
    color: "#5b5347",
    fontSize: 15,
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.navy,
    letterSpacing: "0.02em",
  },
  input: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    padding: "12px 14px",
    borderRadius: 3,
    border: `1.5px solid ${COLORS.rope}`,
    background: "#fff",
    color: COLORS.navy,
    outlineColor: COLORS.clay,
  },
  minorNameInput: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    fontWeight: 600,
    padding: "14px 16px",
    borderRadius: 3,
    border: `2px solid ${COLORS.clay}`,
    background: "#FBEFE9",
    color: COLORS.navy,
    outlineColor: COLORS.clay,
  },
  radioRow: {
    display: "flex",
    gap: 12,
  },
  radioCard: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 14px",
    borderRadius: 3,
    border: `1.5px solid ${COLORS.rope}`,
    background: "#fff",
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    userSelect: "none",
    transition: "border-color 0.15s, background 0.15s",
  },
  radioCardActive: {
    borderColor: COLORS.clay,
    background: "#FBEFE9",
  },
  hiddenRadio: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  experienceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  expCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    padding: "12px 14px",
    borderRadius: 3,
    border: `1.5px solid ${COLORS.rope}`,
    background: "#fff",
    cursor: "pointer",
    userSelect: "none",
    transition: "border-color 0.15s, background 0.15s",
  },
  expLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.navy,
  },
  expHint: {
    fontSize: 12,
    color: "#7a7266",
  },
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 14,
    color: COLORS.navy,
    cursor: "pointer",
    lineHeight: 1.4,
  },
  checkbox: {
    marginTop: 3,
    width: 17,
    height: 17,
    accentColor: COLORS.clay,
    flexShrink: 0,
  },
  waiverBlock: {
    border: `1.5px solid ${COLORS.rope}`,
    borderRadius: 4,
    padding: "16px 18px",
    background: "#FCFAF6",
  },
  safetyBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    border: `1.5px solid ${COLORS.rope}`,
    borderRadius: 4,
    padding: "16px 18px",
    background: "#fff",
  },
  safetyList: {
    margin: 0,
    padding: "0 0 0 20px",
    fontSize: 13.5,
    color: "#4a4438",
    lineHeight: 1.6,
  },
  safetyItem: {
    marginBottom: 4,
  },
  waiverHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  waiverLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.navy,
    letterSpacing: "0.02em",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: COLORS.clay,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  waiverText: {
    fontSize: 13,
    color: "#4a4438",
    background: "#fff",
    border: `1px solid ${COLORS.rope}`,
    borderRadius: 3,
    padding: "12px 14px",
    marginBottom: 12,
    maxHeight: 180,
    overflowY: "auto",
  },
  errorText: {
    color: "#A6402C",
    fontSize: 12.5,
    marginTop: 4,
  },
  submitErrorText: {
    color: "#A6402C",
    fontSize: 13.5,
    fontWeight: 600,
    padding: "10px 14px",
    background: "#FBEAE6",
    border: "1px solid #E0A692",
    borderRadius: 3,
  },
  submitBtn: {
    marginTop: 4,
    padding: "15px 20px",
    borderRadius: 3,
    border: "none",
    background: COLORS.clay,
    color: COLORS.eggshell,
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "0.03em",
    cursor: "pointer",
  },
  confirmWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "24px 0 8px",
  },
  stamp: {
    width: 150,
    height: 150,
    borderRadius: "50%",
    border: `4px solid ${COLORS.clay}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(-8deg)",
    marginBottom: 24,
  },
  stampInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  stampTop: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: COLORS.clay,
  },
  stampMid: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontSize: 26,
    fontWeight: 600,
    color: COLORS.navy,
  },
  stampBottom: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: COLORS.clay,
  },
  confirmTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 600,
    fontSize: 30,
    color: COLORS.navy,
    margin: "0 0 8px",
  },
  confirmSubtitle: {
    color: "#5b5347",
    fontSize: 14.5,
    margin: "0 0 22px",
    maxWidth: 380,
  },
  resetBtn: {
    padding: "12px 22px",
    borderRadius: 3,
    border: `1.5px solid ${COLORS.navy}`,
    background: "transparent",
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
};
