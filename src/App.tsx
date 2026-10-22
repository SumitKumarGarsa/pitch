import React, { useEffect, useRef, useState, ReactNode, CSSProperties } from "react";

/* ------------------------------------------------------------------
   Oxford Overseas Sikar – single-file React + TypeScript website.
   No dependencies beyond React 18. Drop into src/ and render <App />.
   Add real photos by filling the IMAGES object below.
------------------------------------------------------------------- */

const IMAGES = { hero: "", centre: "", classroom: "" }; // e.g. "/photos/centre.jpg"

type Country = { name: string; sky: [string, string]; blurb: string; score: string; intake: string; fields: string; band: string };
const COUNTRIES: Country[] = [
  { name: "Canada", sky: ["#7fb7ff", "#e6f1ff"], blurb: "Colleges and universities with post-study work options.", score: "IELTS 6.0–6.5 or PTE 50–58", intake: "Sep, Jan, May", fields: "Business, IT, health, hospitality", band: "IELTS 6.5" },
  { name: "UK", sky: ["#8aa4d8", "#e9eefb"], blurb: "One-year master’s degrees and strong research universities.", score: "IELTS 6.0–6.5 or PTE 50–60", intake: "Sep, Jan", fields: "Management, finance, data, engineering", band: "IELTS 6.0" },
  { name: "Australia", sky: ["#ffb36b", "#fff0dc"], blurb: "Large university system with work rights during study.", score: "IELTS 6.0–6.5 or PTE 50–58", intake: "Feb, Jul, Nov", fields: "Nursing, IT, engineering, trades", band: "PTE 58" },
  { name: "USA", sky: ["#9ab8ff", "#eaf0ff"], blurb: "Wide course choice and STEM-focused programs.", score: "IELTS 6.5+, GRE/GMAT for some courses", intake: "Aug, Jan", fields: "Computer science, MBA, engineering", band: "IELTS 6.5" },
  { name: "Germany", sky: ["#8fd0c0", "#e7f7f2"], blurb: "Low or no tuition at many public universities.", score: "IELTS 6.0–6.5, German for some programs", intake: "Oct, Apr", fields: "Engineering, sciences, automotive", band: "IELTS 6.0" },
  { name: "New Zealand", sky: ["#86c9e8", "#e5f6fd"], blurb: "Quality education in a calm, safe setting.", score: "IELTS 6.0 or PTE 50", intake: "Feb, Jul", fields: "Agriculture, IT, tourism, nursing", band: "PTE 50" },
];

const SERVICES = [
  ["🎧", "IELTS coaching", "Academic and General Training with feedback on every essay."],
  ["💻", "PTE coaching", "Computer-lab practice, template drills and scored mocks."],
  ["🏦", "Education loan", "Lender selection, documents and follow-up until sanction.", true],
  ["🎓", "Admissions", "Shortlist, SOP review and applications for your intake."],
  ["🛂", "Visa guidance", "Checklist, financial proof and interview preparation."],
  ["🗣️", "Spoken English", "Confidence classes for students who hesitate to speak."],
  ["💱", "Forex and travel", "Tuition payment, blocked accounts, pre-departure briefing."],
  ["🧭", "Career counselling", "An honest talk about courses, budgets and work rights."],
] as const;

const STEPS = [
  ["Counselling", "We understand your marks, budget and goals."],
  ["Test prep", "IELTS or PTE training until you hit your band."],
  ["Apply", "Shortlist, documents, SOP and applications."],
  ["Fund", "Education loan and financial proof sorted."],
  ["Visa and fly", "File, interview prep and pre-departure briefing."],
];

const FAQ = [
  ["Which is better, IELTS or PTE?", "Both are widely accepted. IELTS has a human speaking test; PTE is fully computer-scored with faster results. A short diagnostic tells us which suits you."],
  ["How long does preparation take?", "It depends on your starting level. Many students prepare in one to three months with regular practice."],
  ["Can you help with an education loan?", "Yes. We explain the options, prepare the documents and follow up with the lender."],
  ["Do you guarantee a visa or score?", "No honest consultant can. We guarantee preparation, clear guidance and a well-built file."],
  ["Can I start without a test score?", "Yes. Start with counselling, then we plan the test and application timeline around your intake."],
];

/* ---------------- hooks ---------------- */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return setSeen(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function useTween(target: number, ms = 450) {
  const [val, setVal] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current, t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      cur.current = from + (target - from) * e;
      setVal(cur.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const f = () => { const h = document.documentElement; setP(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)); };
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return p;
}

/* ---------------- small components ---------------- */
function Reveal({ children, delay = 0, dir = "up", className = "" }: { children: ReactNode; delay?: number; dir?: "up" | "left" | "right" | "zoom"; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return <div ref={ref} className={`rv ${dir} ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const v = useTween(seen ? to : 0, 1400);
  return <span ref={ref}>{Math.round(v)}{suffix}</span>;
}

const inr = (x: number) => "₹" + Math.round(x).toLocaleString("en-IN");

/* Illustrated scenes: used as images, swap for photos any time */
function Scene({ c, h = 200 }: { c: Country; h?: number }) {
  const id = c.name.replace(/\s/g, "");
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: h, display: "block" }} role="img" aria-label={`${c.name} illustration`}>
      <defs><linearGradient id={`sk${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.sky[0]} /><stop offset="1" stopColor={c.sky[1]} /></linearGradient></defs>
      <rect width="400" height="200" fill={`url(#sk${id})`} />
      <circle className="sun" cx="320" cy="55" r="24" fill="#fff6c9" opacity=".9" />
      <g className="drift"><ellipse cx="90" cy="48" rx="34" ry="10" fill="#fff" opacity=".8" /><ellipse cx="112" cy="42" rx="22" ry="9" fill="#fff" opacity=".8" /></g>
      {c.name === "Canada" && <><path d="M-10 170 L90 70 L150 130 L220 50 L300 140 L340 100 L420 170Z" fill="#5b7fb5" /><path d="M220 50 L200 78 L220 70 L238 80Z" fill="#fff" /><path d="M-10 190 L60 130 L140 175 L260 120 L420 190Z" fill="#2f5d4a" /><text x="170" y="170" fontSize="34" textAnchor="middle">🍁</text></>}
      {c.name === "UK" && <><rect x="170" y="40" width="44" height="130" fill="#b99a62" /><polygon points="170,40 192,8 214,40" fill="#8f7440" /><circle cx="192" cy="68" r="13" fill="#fffbe9" stroke="#6a5530" strokeWidth="3" /><path d="M192 68 L192 60 M192 68 L198 70" stroke="#333" strokeWidth="2" /><rect x="60" y="130" width="60" height="40" fill="#6d7a99" /><rect x="260" y="120" width="80" height="50" fill="#7d89a6" /><rect x="0" y="170" width="400" height="30" fill="#3b4a6b" /></>}
      {c.name === "Australia" && <><rect x="0" y="160" width="400" height="40" fill="#2a7fa8" /><g fill="#fff" stroke="#e5d6bd" strokeWidth="2"><path d="M110 160 Q130 70 200 100 Q170 120 110 160Z" /><path d="M170 160 Q200 50 280 90 Q240 120 170 160Z" /><path d="M240 160 Q265 90 320 115 Q290 135 240 160Z" /></g><path d="M0 164 Q100 150 200 164 T400 164" stroke="#bfe6f7" strokeWidth="3" fill="none" /></>}
      {c.name === "USA" && <><g fill="#3f5a8c"><rect x="40" y="90" width="36" height="80" /><rect x="86" y="60" width="40" height="110" /><rect x="136" y="100" width="30" height="70" /><rect x="176" y="30" width="44" height="140" /><rect x="230" y="80" width="38" height="90" /><rect x="278" y="110" width="34" height="60" /><rect x="320" y="70" width="40" height="100" /></g><g fill="#ffe9a0"><rect x="96" y="76" width="6" height="8" /><rect x="190" y="50" width="6" height="8" /><rect x="190" y="74" width="6" height="8" /><rect x="334" y="90" width="6" height="8" /></g><rect y="170" width="400" height="30" fill="#2d3f66" /></>}
      {c.name === "Germany" && <><g fill="#c9a86a"><rect x="100" y="60" width="200" height="16" /><rect x="110" y="76" width="18" height="94" /><rect x="150" y="76" width="18" height="94" /><rect x="190" y="76" width="18" height="94" /><rect x="232" y="76" width="18" height="94" /><rect x="272" y="76" width="18" height="94" /><rect x="170" y="38" width="60" height="22" /></g><path d="M0 170 L400 170 L400 200 L0 200Z" fill="#3c6b5e" /><path d="M0 150 Q60 120 120 150 T240 150 T400 140 L400 170 L0 170Z" fill="#5fa08c" opacity=".7" /></>}
      {c.name === "New Zealand" && <><path d="M-10 170 L70 80 L130 150 L200 60 L280 150 L340 100 L420 170Z" fill="#4f7fa0" /><path d="M200 60 L184 84 L200 78 L216 86Z" fill="#fff" /><rect y="150" width="400" height="50" fill="#2f8fb8" /><path d="M0 165 Q50 155 100 165 T200 165 T300 165 T400 165" stroke="#bfe6f7" strokeWidth="3" fill="none" /><text x="320" y="190" fontSize="22">🐑</text></>}
    </svg>
  );
}

function Photo({ src, alt, c, h = 320 }: { src: string; alt: string; c: Country; h?: number }) {
  return <div className="photo">{src ? <img src={src} alt={alt} loading="lazy" style={{ height: h }} /> : <Scene c={c} h={h} />}</div>;
}

/* ---------------- sections ---------------- */
function Hero() {
  const [i, setI] = useState(0);
  const [fade, setFade] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => { setFade(true); setTimeout(() => { setI(n => (n + 1) % COUNTRIES.length); setFade(false); }, 260); }, 2800);
    return () => clearInterval(t);
  }, []);
  const c = COUNTRIES[i];
  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 12 });
  };
  const pass: CSSProperties = { transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` };
  return (
    <div className="hero">
      <div className="cloud c1" /><div className="cloud c2" /><div className="cloud c3" />
      <svg className="flight" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
        <path id="arc" d="M-20 330 C260 60 640 380 1220 70" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" strokeDasharray="6 10" />
        <path d="M0 0 L-22 -8 L-14 0 L-22 8Z" fill="#f0a91c"><animateMotion dur="12s" repeatCount="indefinite" rotate="auto"><mpath href="#arc" /></animateMotion></path>
      </svg>
      <div className="wrap hero-grid">
        <div>
          <h1 className="pop">Your flight out of Sikar starts here.</h1>
          <p className="lead pop" style={{ animationDelay: ".15s" }}>IELTS and PTE coaching, country and course selection, visa filing and education loan help, all under one roof.</p>
          <div className="cta pop" style={{ animationDelay: ".3s" }}>
            <a className="btn gold pulse" href="#contact">Book free counselling</a>
            <a className="btn ghost" href="#loan">Check your EMI</a>
          </div>
          <ul className="tags pop" style={{ animationDelay: ".45s" }}>{["IELTS", "PTE", "Study visa", "Education loan", "Spoken English"].map(t => <li key={t}>{t}</li>)}</ul>
        </div>
        <div className="tiltwrap" onMouseMove={move} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
          <div className="pass float" style={pass}>
            <div className="scene"><Scene c={c} h={150} /></div>
            <div className="pbody">
              <div className="ptop"><span>BOARDING PASS</span><span>STUDENT CLASS</span></div>
              <div className="route"><b>SIKAR</b><i /><b className={`dest ${fade ? "out" : ""}`}>{c.name.toUpperCase()}</b></div>
              <div className="meta"><div>Passenger<strong>You</strong></div><div>Target<strong className={`dest ${fade ? "out" : ""}`}>{c.band}</strong></div><div>Intake<strong>{c.intake.split(",")[0]}</strong></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  const w = ["IELTS", "PTE", "Study visa", "Education loan", "Admissions", "Spoken English", "Forex", "Career counselling"];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="track">{[...w, ...w, ...w, ...w].map((t, k) => <span key={k}>{t}<em>✦</em></span>)}</div>
    </div>
  );
}

function Stats() {
  const s: [number, string, string][] = [[6, "", "study destinations"], [2, "", "test formats: IELTS, PTE"], [8, "", "services under one roof"], [5, "", "steps, counselling to visa"]];
  return (
    <section className="stats"><div className="wrap grid g4">
      {s.map(([n, sf, l], k) => <Reveal key={l} delay={k * 90} dir="zoom"><div className="stat"><strong><CountUp to={n} suffix={sf} /></strong><span>{l}</span></div></Reveal>)}
    </div></section>
  );
}

function Services() {
  return (
    <section id="services"><div className="wrap">
      <Reveal><h2>Everything between “I want to study abroad” and landing</h2><p className="lead">Pick one service or the full journey. Most students begin with a test and a counselling session.</p></Reveal>
      <div className="grid g4 mt">
        {SERVICES.map(([ic, t, d, feat], k) => (
          <Reveal key={t} delay={(k % 4) * 80}>
            <article className={`card lift ${feat ? "feat" : ""}`}><div className="ic">{ic}</div><h3>{t}</h3><p>{d}</p></article>
          </Reveal>
        ))}
      </div>
    </div></section>
  );
}

function Loan() {
  const [amt, setAmt] = useState(2500000);
  const [rate, setRate] = useState(10);
  const [yrs, setYrs] = useState(10);
  const r = rate / 1200, m = yrs * 12;
  const emi = (amt * r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1);
  const total = emi * m;
  const aEmi = useTween(emi), aInt = useTween(total - amt), aTot = useTween(total);
  const share = Math.min(100, Math.max(0, (amt / total) * 100));
  return (
    <section className="loan" id="loan"><div className="wrap two">
      <Reveal dir="left">
        <h2>Plan your education loan before you apply</h2>
        <p className="lead">Move the sliders to see a monthly EMI. Parents can sit with our counsellor and look at the numbers together.</p>
        <ul className="checks">{["Collateral and non-collateral options in plain language", "Document checklist for student and co-applicant", "Admission letter to sanction letter follow-up", "Moratorium and repayment planning"].map(x => <li key={x}>{x}</li>)}</ul>
      </Reveal>
      <Reveal dir="right">
        <div className="calc">
          <div className="row"><label htmlFor="a">Loan amount <output>{inr(amt)}</output></label><input id="a" type="range" min={500000} max={7500000} step={100000} value={amt} onChange={e => setAmt(+e.target.value)} /></div>
          <div className="row"><label htmlFor="r">Interest rate (per year) <output>{rate.toFixed(1)}%</output></label><input id="r" type="range" min={7} max={14} step={0.1} value={rate} onChange={e => setRate(+e.target.value)} /></div>
          <div className="row"><label htmlFor="y">Repayment period <output>{yrs} years</output></label><input id="y" type="range" min={3} max={15} step={1} value={yrs} onChange={e => setYrs(+e.target.value)} /></div>
          <div className="emi"><small>Estimated monthly EMI</small><strong>{inr(aEmi)}</strong>
            <div className="split" title="Principal vs interest"><i style={{ width: `${share}%` }} /></div>
            <div className="legend"><span>Principal {inr(amt)}</span><span>Interest {inr(aInt)}</span><span>Total {inr(aTot)}</span></div>
          </div>
          <p className="note">Illustrative only. Actual rate, tenure and eligibility depend on the lender.</p>
        </div>
      </Reveal>
    </div></section>
  );
}

function Process() {
  const [ref, seen] = useInView<HTMLOListElement>();
  return (
    <section id="process"><div className="wrap">
      <Reveal><h2>Five steps from first chat to departure</h2></Reveal>
      <ol ref={ref} className={`steps ${seen ? "in" : ""}`}>
        {STEPS.map(([t, d], k) => <li key={t} style={{ transitionDelay: `${k * 160}ms` }}><h3>{t}</h3><p>{d}</p></li>)}
      </ol>
    </div></section>
  );
}

function Countries() {
  const [k, setK] = useState(0);
  const c = COUNTRIES[k];
  return (
    <section id="countries" className="nopt"><div className="wrap">
      <Reveal><h2>Where students are heading</h2></Reveal>
      <div className="dgrid mt">
        {COUNTRIES.map((x, j) => (
          <Reveal key={x.name} delay={j * 70} dir="zoom">
            <button className={`dcard ${j === k ? "sel" : ""}`} onClick={() => setK(j)} aria-pressed={j === k}>
              <Scene c={x} h={120} /><span>{x.name}</span>
            </button>
          </Reveal>
        ))}
      </div>
      <div className="panel" key={c.name} aria-live="polite">
        <Photo src="" alt={c.name} c={c} h={260} />
        <div>
          <h3>{c.name}</h3><p className="lead" style={{ marginTop: ".4rem" }}>{c.blurb}</p>
          <dl><div><dt>Typical English score</dt><dd>{c.score}</dd></div><div><dt>Main intakes</dt><dd>{c.intake}</dd></div><div><dt>Popular fields</dt><dd>{c.fields}</dd></div></dl>
          <a className="btn gold" href="#contact">Ask about {c.name}</a>
        </div>
      </div>
      <p className="note">Requirements change often. We confirm current rules with you before you apply.</p>
    </div></section>
  );
}

function Centre() {
  const c = COUNTRIES[0];
  return (
    <section className="why"><div className="wrap">
      <Reveal><h2>Why families in Sikar choose Oxford Overseas</h2></Reveal>
      <div className="gal mt">
        <Reveal dir="left"><Photo src={IMAGES.centre} alt="Our Sikar centre" c={COUNTRIES[2]} h={300} /></Reveal>
        <Reveal dir="right"><Photo src={IMAGES.classroom} alt="IELTS classroom" c={c} h={300} /></Reveal>
      </div>
      <div className="grid g3 mt">
        {[["👩‍🏫", "Trainers who track you", "Small batches and weekly score reviews, visible to you and your parents."], ["🤝", "One team, one file", "Test, admission, loan and visa handled together by people who know your case."], ["📍", "Local and approachable", "Walk in, ask in Hindi or English, and bring your family."]].map(([ic, t, d], k) => (
          <Reveal key={t} delay={k * 100}><article className="card lift glass"><div className="ic">{ic}</div><h3>{t}</h3><p>{d}</p></article></Reveal>
        ))}
      </div>
    </div></section>
  );
}

function Faq() {
  return (
    <section id="faq"><div className="wrap faq">
      <Reveal><h2>Questions we hear every week</h2></Reveal>
      {FAQ.map(([q, a], k) => <Reveal key={q} delay={k * 60}><details><summary>{q}</summary><p>{a}</p></details></Reveal>)}
    </div></section>
  );
}

function Contact() {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("n") || "").trim(), phone = String(f.get("p") || "").trim();
    if (!name || !/^[0-9+ ]{10,14}$/.test(phone)) { setSent(false); setMsg("Please enter your name and a valid mobile number."); return; }
    setSent(true); setMsg(`Thank you, ${name.split(" ")[0]}. We will call you shortly.`); e.currentTarget.reset();
    // TODO: POST the form data to your backend / Google Sheet / WhatsApp API
  };
  return (
    <section id="contact" className="nopt"><div className="wrap two">
      <Reveal dir="left">
        <h2>Book your free counselling session</h2>
        <p className="lead">Tell us what you are planning. We will call you back to fix a time.</p>
        <div className="info">
          <div><span>📍</span><p><b>Visit</b>[Office address], Sikar, Rajasthan</p></div>
          <div><span>📞</span><p><b>Call</b>[Phone number]</p></div>
          <div><span>🕘</span><p><b>Hours</b>[Mon–Sat, 9:30 am – 6:30 pm]</p></div>
        </div>
      </Reveal>
      <Reveal dir="right">
        <form onSubmit={submit} noValidate>
          <label>Full name<input name="n" autoComplete="name" placeholder="Your name" /></label>
          <label>Mobile number<input name="p" inputMode="tel" autoComplete="tel" placeholder="10-digit number" /></label>
          <label>I am interested in<select name="s">{["IELTS coaching", "PTE coaching", "Study abroad admission", "Education loan", "Visa guidance", "Spoken English"].map(o => <option key={o}>{o}</option>)}</select></label>
          <label>Preferred country<select name="c">{[...COUNTRIES.map(c => c.name), "Not sure yet"].map(o => <option key={o}>{o}</option>)}</select></label>
          <button className="btn gold pulse" type="submit">Request callback</button>
          {msg && <p className={`ok ${sent ? "good" : ""}`} role="status">{msg}</p>}
        </form>
      </Reveal>
    </div></section>
  );
}

/* ---------------- app ---------------- */
export default function App() {
  const [open, setOpen] = useState(false);
  const p = useScrollProgress();
  const links: [string, string][] = [["#services", "Services"], ["#loan", "Education loan"], ["#process", "How it works"], ["#countries", "Countries"], ["#faq", "FAQ"]];
  return (
    <>
      <style>{CSS}</style>
      <div className="progress" style={{ transform: `scaleX(${p})` }} />
      <header className={p > 0.005 ? "scrolled" : ""}>
        <div className="wrap bar">
          <a className="logo" href="#top"><i>O</i><span>Oxford Overseas<small>Sikar, Rajasthan</small></span></a>
          <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? "✕" : "☰"}</button>
          <nav className={open ? "open" : ""} aria-label="Main">
            <ul>
              {links.map(([h, t]) => <li key={h}><a href={h} onClick={() => setOpen(false)}>{t}</a></li>)}
              <li><a className="btn gold" href="#contact" onClick={() => setOpen(false)}>Free counselling</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="top">
        <Hero /><Marquee /><Stats /><Services /><Loan /><Process /><Countries /><Centre /><Faq /><Contact />
      </main>
      <footer><div className="wrap"><span>© 2026 Oxford Overseas Sikar. All rights reserved.</span><span>Concept website prepared for presentation.</span></div></footer>
      <a className="wa" href="https://wa.me/910000000000" aria-label="Chat on WhatsApp">💬</a>
    </>
  );
}

/* ---------------- styles ---------------- */
const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700;800&family=Figtree:wght@400;500;600&display=swap");
:root{--bg:#f4f7fc;--surface:#fff;--ink:#0e1e36;--mute:#51607a;--navy:#0b2447;--gold:#f0a91c;--gold-ink:#2a1c00;--line:#d9e1ee;--sky:#e3ecfa;--h:"Bricolage Grotesque","Trebuchet MS",sans-serif;--b:"Figtree","Segoe UI",Arial,sans-serif}
@media (prefers-color-scheme:dark){:root{--bg:#081426;--surface:#0f2038;--ink:#e8eef9;--mute:#9fb0cc;--navy:#050d1a;--line:#223654;--sky:#13294a}}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:76px}
body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.6 var(--b);-webkit-text-size-adjust:100%;overflow-x:hidden}
h1,h2,h3{font-family:var(--h);line-height:1.1;margin:0;letter-spacing:-.02em}
h2{font-size:clamp(1.9rem,4.5vw,3rem);max-width:20ch}
p{margin:0}a{color:inherit}
:focus-visible{outline:3px solid var(--gold);outline-offset:3px;border-radius:6px}
.wrap{width:min(1160px,100% - 2.5rem);margin-inline:auto}
section{padding:clamp(3.5rem,8vw,6.5rem) 0}.nopt{padding-top:0}.mt{margin-top:2.5rem}
.lead{color:var(--mute);max-width:56ch;margin-top:1rem}
.note{font-size:.8rem;color:var(--mute);margin-top:.9rem}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.85rem 1.4rem;border-radius:999px;font:600 1rem var(--b);text-decoration:none;border:2px solid transparent;cursor:pointer;min-height:48px;transition:transform .2s,filter .2s,background .2s}
.btn:hover{transform:translateY(-2px)}
.btn.gold{background:var(--gold);color:var(--gold-ink)}.btn.gold:hover{filter:brightness(1.08)}
.btn.ghost{border-color:rgba(255,255,255,.4);color:#fff}.btn.ghost:hover{background:rgba(255,255,255,.12)}
.pulse{animation:pulse 2.6s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(240,169,28,.55)}70%{box-shadow:0 0 0 16px rgba(240,169,28,0)}100%{box-shadow:0 0 0 0 rgba(240,169,28,0)}}
/* reveal */
.rv{opacity:0;transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.rv.up{transform:translateY(34px)}.rv.left{transform:translateX(-40px)}.rv.right{transform:translateX(40px)}.rv.zoom{transform:scale(.9)}
.rv.in{opacity:1;transform:none}
.pop{opacity:0;animation:pop .9s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes pop{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
/* header */
.progress{position:fixed;top:0;left:0;right:0;height:3px;background:var(--gold);transform-origin:0 50%;z-index:60}
header{position:sticky;top:0;z-index:50;background:var(--navy);color:#fff;transition:box-shadow .3s}
header.scrolled{box-shadow:0 8px 30px -12px rgba(0,0,0,.6)}
.bar{display:flex;align-items:center;justify-content:space-between;height:68px}
.logo{font:800 1.25rem var(--h);text-decoration:none;display:flex;align-items:center;gap:.6rem}
.logo i{width:34px;height:34px;border-radius:9px;background:var(--gold);color:var(--gold-ink);display:grid;place-items:center;font-style:normal}
.logo small{display:block;font:500 .7rem var(--b);opacity:.7}
nav ul{display:flex;gap:1.6rem;list-style:none;margin:0;padding:0;align-items:center}
nav a:not(.btn){text-decoration:none;font-weight:500;font-size:.95rem;opacity:.85;background:linear-gradient(var(--gold),var(--gold)) 0 100%/0 2px no-repeat;transition:background-size .3s,opacity .2s;padding-bottom:4px}
nav a:not(.btn):hover{opacity:1;background-size:100% 2px}
.burger{display:none;background:none;border:0;color:#fff;width:48px;height:48px;font-size:1.5rem;cursor:pointer}
@media (max-width:860px){.burger{display:block}
nav{position:absolute;left:0;right:0;top:68px;background:var(--navy);padding:0 1.25rem;max-height:0;overflow:hidden;transition:max-height .4s ease}
nav.open{max-height:480px;padding-bottom:1.5rem}
nav ul{flex-direction:column;align-items:stretch;gap:0}nav li a:not(.btn){display:block;padding:.9rem 0;border-bottom:1px solid rgba(255,255,255,.1)}nav li:last-child{margin-top:1rem}}
/* hero */
.hero{position:relative;overflow:hidden;background:radial-gradient(1200px 500px at 80% 0,#17407a 0,transparent 60%),var(--navy);color:#fff;padding:clamp(3rem,7vw,5.5rem) 0 clamp(4rem,8vw,6.5rem)}
.hero-grid{position:relative;z-index:2;display:grid;grid-template-columns:1.05fr .95fr;gap:3rem;align-items:center}
.hero h1{font-size:clamp(2.4rem,6.2vw,4.4rem);font-weight:800}
.hero .lead{color:#b9c8e2;font-size:1.1rem}
.cta{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:2rem}
.tags{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:2rem;padding:0;list-style:none}
.tags li{border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:.3rem .85rem;font-size:.88rem;color:#d4def0}
.cloud{position:absolute;background:rgba(255,255,255,.07);border-radius:999px;filter:blur(2px);animation:drift linear infinite}
.c1{width:260px;height:60px;top:12%;left:-300px;animation-duration:46s}.c2{width:180px;height:44px;top:48%;left:-200px;animation-duration:34s;animation-delay:-12s}.c3{width:340px;height:70px;top:76%;left:-360px;animation-duration:58s;animation-delay:-30s}
@keyframes drift{to{transform:translateX(calc(100vw + 400px))}}
.flight{position:absolute;inset:0;width:100%;height:100%;z-index:1;opacity:.9}
.tiltwrap{perspective:900px}
.pass{background:var(--surface);color:var(--ink);border-radius:22px;overflow:hidden;box-shadow:0 40px 70px -28px rgba(0,0,0,.7);transition:transform .15s ease-out}
.float{animation:float 6s ease-in-out infinite}
@keyframes float{50%{translate:0 -10px}}
.pbody{padding:1.3rem 1.5rem 1.4rem;border-top:2px dashed var(--line)}
.ptop{display:flex;justify-content:space-between;font-size:.78rem;color:var(--mute);font-weight:600}
.route{display:flex;align-items:center;gap:.8rem;margin:1rem 0}
.route b{font:800 clamp(1.6rem,4vw,2.4rem) var(--h);line-height:1}
.route i{flex:1;border-top:2px dashed var(--line);min-width:20px}
.dest{transition:opacity .26s,transform .26s}.dest.out{opacity:0;transform:translateY(8px)}
.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem;font-size:.82rem;color:var(--mute)}.meta strong{display:block;color:var(--ink);font-size:.98rem}
.sun{animation:glow 4s ease-in-out infinite}@keyframes glow{50%{opacity:.5}}
.drift{animation:sway 9s ease-in-out infinite alternate}@keyframes sway{to{transform:translateX(60px)}}
@media (max-width:900px){.hero-grid{grid-template-columns:1fr}}
/* marquee */
.marquee{background:var(--gold);color:var(--gold-ink);overflow:hidden;white-space:nowrap;padding:.9rem 0;font:700 1.05rem var(--h)}
.track{display:inline-block;animation:slide 32s linear infinite}
.marquee:hover .track{animation-play-state:paused}
.marquee span{margin:0 1.2rem}.marquee em{margin-left:2.4rem;font-style:normal;opacity:.6}
@keyframes slide{to{transform:translateX(-50%)}}
/* stats */
.stats{padding:3rem 0 0}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:1.4rem;text-align:center}
.stat strong{display:block;font:800 clamp(2.2rem,5vw,3.2rem) var(--h);color:var(--navy)}
@media (prefers-color-scheme:dark){.stat strong{color:var(--gold)}}
.stat span{color:var(--mute);font-size:.92rem}
/* grids/cards */
.grid{display:grid;gap:1.2rem}.g4{grid-template-columns:repeat(4,1fr)}.g3{grid-template-columns:repeat(3,1fr)}
@media (max-width:980px){.g4,.g3{grid-template-columns:repeat(2,1fr)}}@media (max-width:600px){.g4,.g3{grid-template-columns:1fr}}
.card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:1.6rem;height:100%}
.lift{transition:transform .3s,box-shadow .3s}.lift:hover{transform:translateY(-8px);box-shadow:0 24px 40px -22px rgba(11,36,71,.45)}
.card h3{font-size:1.3rem;margin:.9rem 0 .5rem}.card p{color:var(--mute);font-size:.96rem}
.ic{width:48px;height:48px;border-radius:14px;background:var(--sky);display:grid;place-items:center;font-size:1.5rem;transition:transform .4s}
.card:hover .ic{transform:rotate(-10deg) scale(1.15)}
.card.feat{background:var(--navy);color:#fff;border-color:transparent}.card.feat p{color:#b9c8e2}.card.feat .ic{background:rgba(255,255,255,.12)}
/* loan */
.loan{background:var(--sky)}
.two{display:grid;grid-template-columns:1fr 1.05fr;gap:3rem;align-items:start}@media (max-width:900px){.two{grid-template-columns:1fr}}
.calc{background:var(--surface);border:1px solid var(--line);border-radius:22px;padding:1.8rem}
.row{margin-bottom:1.3rem}.row label{display:flex;justify-content:space-between;font-weight:600;font-size:.95rem;margin-bottom:.5rem}.row output{color:var(--mute);font-weight:500}
input[type=range]{width:100%;accent-color:var(--gold);height:28px}
.emi{background:var(--navy);color:#fff;border-radius:16px;padding:1.3rem 1.4rem}
.emi small{color:#b9c8e2}.emi strong{display:block;font:800 clamp(2rem,6vw,2.8rem) var(--h);margin:.1rem 0 .8rem}
.split{height:10px;border-radius:99px;background:#f0a91c55;overflow:hidden}.split i{display:block;height:100%;background:var(--gold);transition:width .5s}
.legend{display:flex;justify-content:space-between;flex-wrap:wrap;gap:.3rem 1rem;margin-top:.7rem;font-size:.82rem;color:#d4def0}
.checks{list-style:none;padding:0;margin:1.6rem 0 0;display:grid;gap:.7rem}
.checks li{display:flex;gap:.7rem}.checks li::before{content:"✓";flex:none;width:24px;height:24px;border-radius:50%;background:var(--gold);color:var(--gold-ink);display:grid;place-items:center;font-size:.8rem;font-weight:800;margin-top:2px}
/* steps */
.steps{list-style:none;padding:0;margin:2.5rem 0 0;display:grid;grid-template-columns:repeat(5,1fr);gap:1rem;counter-reset:s}
.steps li{counter-increment:s;position:relative;padding-top:3.4rem;opacity:0;transform:translateY(24px);transition:.7s}
.steps.in li{opacity:1;transform:none}
.steps li::before{content:counter(s);position:absolute;top:0;left:0;width:2.6rem;height:2.6rem;border-radius:50%;background:var(--navy);color:#fff;display:grid;place-items:center;font:700 1.1rem var(--h);z-index:1}
.steps li::after{content:"";position:absolute;top:1.3rem;left:2.6rem;right:-1rem;border-top:2px dashed var(--gold);transform-origin:0 0;transform:scaleX(0);transition:transform .8s .3s}
.steps.in li::after{transform:scaleX(1)}.steps li:last-child::after{display:none}
.steps h3{font-size:1.1rem;margin-bottom:.35rem}.steps p{color:var(--mute);font-size:.92rem}
@media (max-width:860px){.steps{grid-template-columns:1fr}.steps li{padding:0 0 1.4rem 3.6rem}.steps li::after{top:2.8rem;bottom:0;left:1.3rem;right:auto;border-top:0;border-left:2px dashed var(--gold);transform:scaleY(0)}.steps.in li::after{transform:scaleY(1)}}
/* countries */
.dgrid{display:grid;grid-template-columns:repeat(6,1fr);gap:.9rem}
@media (max-width:980px){.dgrid{grid-template-columns:repeat(3,1fr)}}@media (max-width:520px){.dgrid{grid-template-columns:repeat(2,1fr)}}
.dcard{border:2px solid var(--line);background:var(--surface);border-radius:16px;overflow:hidden;padding:0;cursor:pointer;width:100%;font:600 .95rem var(--b);color:var(--ink);transition:transform .3s,border-color .3s}
.dcard svg{transition:transform .6s}.dcard:hover svg{transform:scale(1.12)}.dcard:hover{transform:translateY(-4px)}
.dcard span{display:block;padding:.6rem}.dcard.sel{border-color:var(--gold);box-shadow:0 12px 30px -16px var(--gold)}
.dcard{position:relative}.dcard>svg{display:block}
.panel{margin-top:1.4rem;background:var(--surface);border:1px solid var(--line);border-radius:22px;padding:1.4rem;display:grid;grid-template-columns:1fr 1fr;gap:1.6rem;align-items:center;animation:pop .6s both}
.panel h3{font-size:1.8rem}.panel dl{margin:1.2rem 0;display:grid;gap:.8rem}.panel dt{font-size:.8rem;color:var(--mute);font-weight:600}.panel dd{margin:0;font-weight:600}
@media (max-width:760px){.panel{grid-template-columns:1fr}}
.photo{border-radius:16px;overflow:hidden}.photo img{width:100%;object-fit:cover;display:block}.photo svg{transition:transform 1.2s}.photo:hover svg,.photo:hover img{transform:scale(1.06)}
/* why */
.why{background:var(--navy);color:#fff}
.gal{display:grid;grid-template-columns:1.2fr 1fr;gap:1.2rem}@media (max-width:760px){.gal{grid-template-columns:1fr}}
.why .card{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}.why .card p{color:#b9c8e2}.why .ic{background:rgba(255,255,255,.12)}
/* faq */
.faq{max-width:820px}
details{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:1.1rem 1.3rem;margin-top:.8rem;transition:border-color .3s}
details[open]{border-color:var(--gold)}
summary{cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:1rem}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";font-size:1.4rem;line-height:1;color:var(--gold);transition:transform .3s}
details[open] summary::after{transform:rotate(45deg)}
details p{color:var(--mute);margin-top:.7rem;animation:pop .4s both}
/* contact */
form{background:var(--surface);border:1px solid var(--line);border-radius:22px;padding:1.8rem;display:grid;gap:1rem}
form label{font-weight:600;font-size:.92rem;display:grid;gap:.35rem}
input,select{font:inherit;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:.75rem .9rem;width:100%;min-height:48px;transition:border-color .2s,box-shadow .2s}
input:focus,select:focus{outline:0;border-color:var(--gold);box-shadow:0 0 0 4px #f0a91c33}
.ok{background:var(--sky);border-radius:12px;padding:.9rem 1rem;font-weight:600;animation:pop .4s both}.ok.good{border-left:5px solid #25a35a}
.info{display:grid;gap:1rem;margin-top:1.8rem}.info div{display:flex;gap:.8rem}.info b{display:block}.info p{color:var(--mute)}
footer{background:var(--navy);color:#b9c8e2;padding:2rem 0;font-size:.9rem}footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.8rem}
.wa{position:fixed;right:1rem;bottom:calc(1rem + env(safe-area-inset-bottom,0px));z-index:45;background:#25d366;color:#06361a;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-size:1.6rem;text-decoration:none;box-shadow:0 10px 25px -8px rgba(0,0,0,.5);animation:bob 3s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-6px)}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}.rv,.pop,.steps li{opacity:1!important;transform:none!important}html{scroll-behavior:auto}}
`;
