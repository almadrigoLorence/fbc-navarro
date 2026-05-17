import { useState, useEffect, useRef, useCallback } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,300;8..60,400;8..60,500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Source Serif 4', Georgia, serif;
    background: #ffffff;
    color: #1a1a1a;
    min-height: 100vh;
  }

  :root {
    --border: 1px solid #1a1a1a;
    --radius: 0px;
    --white: #ffffff;
    --black: #1a1a1a;
    --gray-light: #f8f8f8;
    --gray-mid: #e0e0e0;
  }

  h1, h2, h3, h4 {
    font-family: 'Playfair Display', Georgia, serif;
  }

  /* Nav */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    background: #fff;
    border-bottom: var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem;
    height: 64px;
  }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .nav-links { display: flex; gap: 0; }
  .nav-link {
    padding: 0 1.25rem;
    height: 64px;
    display: flex; align-items: center;
    border-left: var(--border);
    cursor: pointer;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: #fff;
    transition: background 0.15s;
    user-select: none;
  }
  .nav-link:hover { background: #f8f8f8; }
  .nav-link.active { background: #1a1a1a; color: #fff; }

  /* Main container */
  .page { padding-top: 64px; min-height: 100vh; }

  /* ── SLIDESHOW / HERO ── */
  .hero {
    position: relative;
    height: calc(100vh - 64px);
    overflow: hidden;
    border-bottom: var(--border);
  }
  .slide {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    transition: opacity 0.8s ease;
    opacity: 0;
  }
  .slide.active { opacity: 1; }
  .slide-bg {
    position: absolute; inset: 0;
    background-size: cover;
    background-position: center;
    filter: brightness(0.35);
  }
  .slide-content {
    position: relative; z-index: 2;
    text-align: center; color: #fff;
    padding: 2rem;
    border: 1px solid rgba(255,255,255,0.3);
    max-width: 600px;
  }
  .slide-content h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    line-height: 1.15;
    margin-bottom: 1rem;
  }
  .slide-content p {
    font-size: 1rem;
    line-height: 1.7;
    opacity: 0.85;
  }
  .slide-dots {
    position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
    display: flex; gap: 0.5rem; z-index: 3;
  }
  .slide-dot {
    width: 8px; height: 8px;
    border: 1px solid #fff;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
  }
  .slide-dot.active { background: #fff; }
  .slide-arrows {
    position: absolute; bottom: 1.5rem; right: 1.5rem; z-index: 3;
    display: flex; gap: 0.5rem;
  }
  .slide-arrow {
    width: 36px; height: 36px;
    border: 1px solid rgba(255,255,255,0.5);
    background: transparent; color: #fff;
    cursor: pointer; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }
  .slide-arrow:hover { background: rgba(255,255,255,0.15); }

  /* ── SCROLL PARALLAX SECTION ── */
  .scroll-section {
    height: 400vh;
    position: relative;
  }
  .scroll-sticky {
    position: sticky;
    top: 64px;
    height: calc(100vh - 64px);
    overflow: hidden;
    border-bottom: var(--border);
  }
  .scroll-panel {
    position: absolute; inset: 0;
    display: flex; align-items: center;
    transition: opacity 0.4s ease, transform 0.4s ease;
    opacity: 0;
    pointer-events: none;
  }
  .scroll-panel.visible {
    opacity: 1;
    pointer-events: auto;
  }
  .scroll-panel-img {
    width: 55%;
    height: 100%;
    object-fit: cover;
    background-size: cover;
    background-position: center;
    filter: brightness(0.5);
  }
  .scroll-panel-text {
    width: 45%;
    padding: 4rem 3rem;
    border-left: var(--border);
    height: 100%;
    display: flex; flex-direction: column; justify-content: center;
    gap: 1rem;
  }
  .scroll-panel-text h2 { font-size: 2rem; line-height: 1.2; }
  .scroll-panel-text p { font-size: 0.95rem; line-height: 1.8; }
  .scroll-label {
    font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: #888; margin-bottom: 0.5rem;
  }

  /* ── SECTIONS ── */
  .section {
    border-bottom: var(--border);
  }
  .section-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 4rem 2rem;
  }
  .section-title {
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 0.75rem;
  }
  .section-heading {
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    margin-bottom: 2rem;
    border-bottom: var(--border);
    padding-bottom: 1rem;
  }

  /* ── ANNOUNCEMENTS GRID ── */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0;
    border: var(--border);
  }
  .card {
    padding: 1.5rem;
    border-right: var(--border);
    border-bottom: var(--border);
  }
  .card:nth-child(3n) { border-right: none; }
  .card-tag {
    font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: #888; margin-bottom: 0.5rem;
  }
  .card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
  .card p { font-size: 0.85rem; line-height: 1.6; color: #444; }
  .card-date { font-size: 0.75rem; color: #999; margin-top: 0.75rem; }

  /* ── CONTACT SECTION ── */
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: var(--border);
  }
  .contact-info { padding: 2rem; border-right: var(--border); }
  .contact-form { padding: 2rem; }
  .contact-item { margin-bottom: 1.25rem; }
  .contact-label {
    font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: #888; margin-bottom: 0.25rem;
  }
  .contact-value { font-size: 0.95rem; }
  .form-group { margin-bottom: 1rem; }
  .form-label {
    display: block; font-size: 0.75rem; letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 0.35rem; color: #555;
  }
  .form-input, .form-textarea {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: var(--border);
    background: #fff;
    font-family: 'Source Serif 4', serif;
    font-size: 0.9rem;
    outline: none;
    resize: vertical;
  }
  .form-input:focus, .form-textarea:focus { background: #f8f8f8; }
  .btn {
    padding: 0.65rem 1.5rem;
    border: var(--border);
    background: #1a1a1a; color: #fff;
    cursor: pointer;
    font-family: 'Source Serif 4', serif;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: background 0.15s, color 0.15s;
  }
  .btn:hover { background: #333; }
  .btn-outline {
    background: #fff; color: #1a1a1a;
  }
  .btn-outline:hover { background: #f0f0f0; }
  .btn-danger {
    background: #fff; color: #c0392b; border-color: #c0392b;
  }
  .btn-danger:hover { background: #c0392b; color: #fff; }

  /* ── ABOUT PAGE ── */
  .about-hero {
    border-bottom: var(--border);
    padding: 5rem 2rem;
    text-align: center;
    background: #f8f8f8;
  }
  .about-hero h1 { font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem; }
  .about-hero p { max-width: 600px; margin: 0 auto; line-height: 1.8; color: #444; }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: var(--border);
  }
  .about-cell {
    padding: 2.5rem;
    border-right: var(--border);
    border-bottom: var(--border);
  }
  .about-cell:nth-child(2n) { border-right: none; }
  .about-cell h3 { font-size: 1.3rem; margin-bottom: 0.75rem; }
  .about-cell p { font-size: 0.9rem; line-height: 1.8; color: #444; }
  .staff-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    border: var(--border);
    gap: 0;
  }
  .staff-card {
    padding: 1.5rem;
    border-right: var(--border);
    border-bottom: var(--border);
    text-align: center;
  }
  .staff-avatar {
    width: 72px; height: 72px;
    border: var(--border);
    border-radius: 50%;
    margin: 0 auto 1rem;
    background: #f0f0f0;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
  }
  .staff-name { font-family: 'Playfair Display', serif; font-size: 1rem; margin-bottom: 0.25rem; }
  .staff-role { font-size: 0.75rem; color: #888; letter-spacing: 0.1em; text-transform: uppercase; }

  /* ── ADMIN PAGE ── */
  .admin-layout {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: calc(100vh - 64px);
  }
  .admin-sidebar {
    border-right: var(--border);
    padding: 1.5rem 0;
    position: sticky;
    top: 64px;
    height: calc(100vh - 64px);
    overflow-y: auto;
  }
  .admin-sidebar-title {
    font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: #888; padding: 0 1.25rem; margin-bottom: 0.75rem;
  }
  .admin-nav-item {
    padding: 0.65rem 1.25rem;
    cursor: pointer;
    font-size: 0.85rem;
    border-bottom: var(--border);
    transition: background 0.1s;
    display: flex; align-items: center; gap: 0.6rem;
  }
  .admin-nav-item:hover { background: #f8f8f8; }
  .admin-nav-item.active { background: #1a1a1a; color: #fff; }
  .admin-content { padding: 2rem; overflow-y: auto; }
  .admin-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: var(--border);
  }
  .admin-header h2 { font-size: 1.5rem; }

  /* Tables */
  .data-table { width: 100%; border-collapse: collapse; border: var(--border); }
  .data-table th, .data-table td {
    padding: 0.65rem 1rem;
    border: var(--border);
    text-align: left;
    font-size: 0.85rem;
  }
  .data-table th {
    background: #f8f8f8;
    font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase;
    font-family: 'Source Serif 4', serif; font-weight: 500;
  }
  .data-table tr:hover td { background: #fafafa; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .modal {
    background: #fff; border: var(--border);
    width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
  }
  .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-header h3 { font-size: 1.1rem; }
  .modal-close {
    background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #888;
  }
  .modal-body { padding: 1.5rem; }
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: var(--border);
    display: flex; gap: 0.75rem; justify-content: flex-end;
  }

  /* Savings */
  .savings-summary {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border: var(--border); margin-bottom: 1.5rem;
  }
  .savings-stat {
    padding: 1.25rem 1.5rem;
    border-right: var(--border);
  }
  .savings-stat:last-child { border-right: none; }
  .savings-stat-label {
    font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: #888;
    margin-bottom: 0.35rem;
  }
  .savings-stat-value { font-family: 'Playfair Display', serif; font-size: 1.8rem; }
  .savings-stat-value.positive { color: #27ae60; }
  .savings-stat-value.negative { color: #c0392b; }

  /* Tags */
  .tag {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border: var(--border);
    font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase;
    background: #f8f8f8;
  }
  .tag.income { border-color: #27ae60; color: #27ae60; background: #f0fff4; }
  .tag.expense { border-color: #c0392b; color: #c0392b; background: #fff5f5; }
  .tag.event { border-color: #2980b9; color: #2980b9; background: #f0f8ff; }
  .tag.activity { border-color: #8e44ad; color: #8e44ad; background: #fdf0ff; }
  .tag.announcement { border-color: #d35400; color: #d35400; background: #fff8f0; }

  /* Notes */
  .notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
  .note-card {
    border: var(--border);
    padding: 1.25rem;
  }
  .note-card h4 { font-size: 1rem; margin-bottom: 0.5rem; }
  .note-card p { font-size: 0.85rem; line-height: 1.6; color: #444; }
  .note-meta { font-size: 0.72rem; color: #aaa; margin-top: 0.75rem; }
  .note-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }

  /* Responsive */
  @media (max-width: 768px) {
    .contact-grid, .about-grid { grid-template-columns: 1fr; }
    .about-cell { border-right: none; }
    .admin-layout { grid-template-columns: 1fr; }
    .admin-sidebar { position: static; height: auto; }
    .savings-summary { grid-template-columns: 1fr; }
    .savings-stat { border-right: none; border-bottom: var(--border); }
    .scroll-panel-img { display: none; }
    .scroll-panel-text { width: 100%; border-left: none; }
  }
`;

// ─── DATA ────────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    bg: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1400&q=80",
    title: "Welcome to Faithway Baptist Church Navarro",
    desc: "A community rooted in faith, love, and service to God and one another."
  },
  {
    bg: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1400&q=80",
    title: "Sunday Worship Service",
    desc: "Join us every Sunday at 9:00 AM and 11:00 AM for worship and the Word."
  },
  {
    bg: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1400&q=80",
    title: "Growing Together in Christ",
    desc: "Bible studies, fellowship groups, and community events for all ages."
  },
  {
    bg: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1400&q=80",
    title: "Serving Our Community",
    desc: "Outreach programs and missions that extend the love of Christ to Navarro and beyond."
  }
];

const SCROLL_PANELS = [
  {
    bg: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=900&q=80",
    label: "Our Mission",
    title: "Proclaiming the Gospel",
    body: "We are committed to sharing the transforming power of the Gospel of Jesus Christ to every person in our community and beyond."
  },
  {
    bg: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80",
    label: "Our Vision",
    title: "Building Disciples",
    body: "Our vision is to make fully devoted followers of Christ who are rooted in Scripture and responsive to the Holy Spirit."
  },
  {
    bg: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=900&q=80",
    label: "Our Values",
    title: "Love. Truth. Service.",
    body: "Everything we do is built on genuine love for God and people, uncompromising truth from His Word, and selfless service to our neighbors."
  },
  {
    bg: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=900&q=80",
    label: "Our Community",
    title: "One Family in Christ",
    body: "From Sunday worship to weekly gatherings, we cultivate a family-like community where every person is known, loved, and valued."
  }
];

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
const useLocalStorage = (key, initial) => {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch { return initial; }
  });
  const save = useCallback((v) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, save];
};

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const today = () => new Date().toLocaleDateString('en-PH', { year:'numeric',month:'long',day:'numeric' });
const fmtCurrency = (n) => "₱" + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "admin", label: "Admin" }
  ];
  return (
    <nav className="nav">
      <div className="nav-logo">Faithway Baptist Church Navarro</div>
      <div className="nav-links">
        {links.map(l => (
          <div
            key={l.id}
            className={`nav-link${page === l.id ? " active" : ""}`}
            onClick={() => setPage(l.id)}
          >{l.label}</div>
        ))}
      </div>
    </nav>
  );
}

// ─── SLIDESHOW ───────────────────────────────────────────────────────────────
function Slideshow() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent(c => (c + 1) % SLIDES.length);

  return (
    <div className="hero">
      {SLIDES.map((s, i) => (
        <div key={i} className={`slide${current === i ? " active" : ""}`}>
          <div className="slide-bg" style={{ backgroundImage: `url(${s.bg})` }} />
          <div className="slide-content">
            <h1>{s.title}</h1>
            <p>{s.desc}</p>
          </div>
        </div>
      ))}
      <div className="slide-dots">
        {SLIDES.map((_, i) => (
          <div key={i} className={`slide-dot${current === i ? " active" : ""}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
      <div className="slide-arrows">
        <button className="slide-arrow" onClick={prev}>‹</button>
        <button className="slide-arrow" onClick={next}>›</button>
      </div>
    </div>
  );
}

// ─── SCROLL PARALLAX ─────────────────────────────────────────────────────────
function ScrollParallax() {
  const ref = useRef(null);
  const [panel, setPanel] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const total = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      const idx = Math.min(SCROLL_PANELS.length - 1, Math.floor(progress * SCROLL_PANELS.length));
      setPanel(idx);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="scroll-section" ref={ref}>
      <div className="scroll-sticky">
        {SCROLL_PANELS.map((p, i) => (
          <div key={i} className={`scroll-panel${panel === i ? " visible" : ""}`}>
            <div
              className="scroll-panel-img"
              style={{ backgroundImage: `url(${p.bg})` }}
            />
            <div className="scroll-panel-text">
              <div className="scroll-label">{p.label}</div>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
function HomePage({ announcements, events }) {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleContact = () => {
    if (!contactForm.name || !contactForm.message) return;
    setSent(true);
    setContactForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const upcomingEvents = events
    .filter(e => e.date >= new Date().toISOString().slice(0, 10))
    .slice(0, 6);

  const latestAnnouncements = announcements.slice(0, 6);

  return (
    <div className="page">
      <Slideshow />
      <ScrollParallax />

      {/* Announcements */}
      <div className="section">
        <div className="section-inner">
          <div className="section-title">Latest Updates</div>
          <div className="section-heading">Announcements</div>
          {latestAnnouncements.length === 0 ? (
            <p style={{ color: "#888", fontStyle: "italic" }}>No announcements yet.</p>
          ) : (
            <div className="cards-grid">
              {latestAnnouncements.map(a => (
                <div key={a.id} className="card">
                  <div className="card-tag">
                    <span className="tag announcement">Announcement</span>
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                  <div className="card-date">{a.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="section">
        <div className="section-inner">
          <div className="section-title">Schedule</div>
          <div className="section-heading">Upcoming Events</div>
          {upcomingEvents.length === 0 ? (
            <p style={{ color: "#888", fontStyle: "italic" }}>No upcoming events.</p>
          ) : (
            <div className="cards-grid">
              {upcomingEvents.map(e => (
                <div key={e.id} className="card">
                  <div className="card-tag">
                    <span className="tag event">Event</span>
                  </div>
                  <h3>{e.title}</h3>
                  <p>{e.description}</p>
                  <div className="card-date">📅 {e.date} {e.time && `· ${e.time}`}</div>
                  {e.location && <div className="card-date">📍 {e.location}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Schedule */}
      <div className="section">
        <div className="section-inner">
          <div className="section-title">Regular Services</div>
          <div className="section-heading">Weekly Schedule</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th><th>Service</th><th>Time</th><th>Location</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Sunday","Morning Worship","9:00 AM & 11:00 AM","Main Sanctuary"],
                ["Sunday","Youth Service","1:00 PM","Youth Hall"],
                ["Wednesday","Bible Study","6:30 PM","Fellowship Room"],
                ["Friday","Prayer Meeting","6:00 PM","Main Sanctuary"],
              ].map(([day,svc,time,loc]) => (
                <tr key={day+svc}>
                  <td>{day}</td><td>{svc}</td><td>{time}</td><td>{loc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact */}
      <div className="section">
        <div className="section-inner">
          <div className="section-title">Get in Touch</div>
          <div className="section-heading">Contact Us</div>
          <div className="contact-grid">
            <div className="contact-info">
              {[
                ["Address","Navarro, General Trias, Cavite, Philippines"],
                ["Sunday Services","9:00 AM · 11:00 AM"],
                ["Phone","+63 (046) 000-0000"],
                ["Email","faithwaybaptistnavarro@gmail.com"],
                ["Facebook","fb.com/FaithwayBaptistNavarro"],
              ].map(([label, val]) => (
                <div key={label} className="contact-item">
                  <div className="contact-label">{label}</div>
                  <div className="contact-value">{val}</div>
                </div>
              ))}
            </div>
            <div className="contact-form">
              <div className="section-title" style={{ marginBottom: "1.25rem" }}>Send us a message</div>
              {sent && (
                <div style={{ padding: "0.75rem 1rem", border: "1px solid #27ae60", marginBottom: "1rem", fontSize: "0.85rem", color: "#27ae60" }}>
                  Message sent! We'll get back to you soon.
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" value={contactForm.name} onChange={e => setContactForm(p => ({...p, name: e.target.value}))} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={contactForm.email} onChange={e => setContactForm(p => ({...p, email: e.target.value}))} placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" rows={4} value={contactForm.message} onChange={e => setContactForm(p => ({...p, message: e.target.value}))} placeholder="How can we help you?" />
              </div>
              <button className="btn" onClick={handleContact}>Send Message</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "var(--border)", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#888" }}>
        <div>© {new Date().getFullYear()} Faithway Baptist Church Navarro. All rights reserved.</div>
        <div>Navarro, General Trias, Cavite, Philippines</div>
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div className="page">
      <div className="about-hero">
        <div className="section-title" style={{ marginBottom: "0.75rem" }}>Established in Faith</div>
        <h1>About Faithway Baptist Church Navarro</h1>
        <p style={{ marginTop: "1rem" }}>A church built on the Word of God, committed to community, worship, and making disciples for Jesus Christ.</p>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="section-title">Who We Are</div>
          <div className="section-heading">Our Story</div>
          <p style={{ lineHeight: "1.9", maxWidth: "760px", fontSize: "0.95rem", color: "#333" }}>
            Faithway Baptist Church Navarro began as a small group of believers in the Navarro community of General Trias, Cavite, united by a shared desire to worship God faithfully and serve their neighbors with love. Over the years, the church has grown into a vibrant congregation deeply rooted in Scripture and passionately committed to the Great Commission. Today, we continue to be a spiritual home for families, youth, and individuals seeking to know and follow Jesus Christ.
          </p>
        </div>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="section-title">Core Beliefs</div>
          <div className="section-heading">What We Believe</div>
          <div className="about-grid">
            {[
              ["The Bible","We believe the Holy Bible is the inspired, inerrant, and authoritative Word of God — the supreme standard for all faith and conduct."],
              ["The Trinity","We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit, co-equal and co-eternal."],
              ["Salvation","We believe salvation is by grace alone, through faith alone, in Christ alone — not by works, but as a gift from God."],
              ["The Church","We believe the local church is a body of baptized believers who gather regularly for worship, instruction, fellowship, and service."],
              ["Baptism","We practice believer's baptism by immersion as a public declaration of faith and identification with Christ's death and resurrection."],
              ["The Lord's Supper","We observe the Lord's Supper as a memorial of Christ's sacrifice, proclaiming His death until He comes."],
            ].map(([title, text]) => (
              <div key={title} className="about-cell">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="section-title">Our Ministries</div>
          <div className="section-heading">Church Ministries</div>
          <div className="cards-grid">
            {[
              ["Children's Ministry","Nurturing the faith of children ages 0–12 through age-appropriate Bible teaching, worship, and activities.","Every Sunday"],
              ["Youth Ministry","Discipling teenagers through relevant teaching, fellowship, camps, and service opportunities.","Sunday & Friday"],
              ["Men's Fellowship","Encouraging men to grow in Christlikeness through accountability groups, retreats, and community service.","Monthly"],
              ["Women's Ministry","Building up women in faith through Bible studies, prayer, mentorship, and fellowship.","Weekly"],
              ["Worship Ministry","Leading the congregation in heartfelt, Scripture-centered worship through music and song.","Every Sunday"],
              ["Outreach Ministry","Extending the love of Christ through community service, evangelism, and missions support.","Monthly"],
            ].map(([title, desc, freq]) => (
              <div key={title} className="card">
                <div className="card-tag"><span className="tag activity">Ministry</span></div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="card-date">🕐 {freq}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="section-title">Church Leadership</div>
          <div className="section-heading">Our Pastoral Staff</div>
          <div className="staff-grid">
            {[
              ["Pastor","Senior Pastor","✝️"],
              ["Assoc. Pastor","Associate Pastor","📖"],
              ["Youth Pastor","Youth & Young Adults","🎯"],
              ["Worship Leader","Worship Ministry","🎵"],
              ["Deacon Board","Church Deacons","🙏"],
            ].map(([name, role, emoji]) => (
              <div key={name} className="staff-card">
                <div className="staff-avatar">{emoji}</div>
                <div className="staff-name">{name}</div>
                <div className="staff-role">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="section-title">Church Information</div>
          <div className="section-heading">General Information</div>
          <table className="data-table" style={{ maxWidth: "600px" }}>
            <tbody>
              {[
                ["Denomination","Southern Baptist"],
                ["Founded","Navarro, General Trias, Cavite"],
                ["Address","Navarro, General Trias, Cavite 4107"],
                ["Sunday Worship","9:00 AM · 11:00 AM"],
                ["Wednesday Bible Study","6:30 PM"],
                ["Contact","faithwaybaptistnavarro@gmail.com"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ fontWeight: 500, width: "180px", background: "#f8f8f8" }}>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ borderTop: "var(--border)", padding: "1.5rem 2rem", fontSize: "0.8rem", color: "#888", textAlign: "center" }}>
        © {new Date().getFullYear()} Faithway Baptist Church Navarro
      </div>
    </div>
  );
}

// ─── ADMIN: SAVINGS ──────────────────────────────────────────────────────────
function SavingsPanel() {
  const [records, setRecords] = useLocalStorage("fbc_savings", []);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: "income", amount: "", description: "", category: "", date: "" });

  const total = records.reduce((s, r) => r.type === "income" ? s + Number(r.amount) : s - Number(r.amount), 0);
  const totalIn = records.filter(r => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
  const totalOut = records.filter(r => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);

  const add = () => {
    if (!form.amount || !form.description) return;
    setRecords([{ id: newId(), ...form, date: form.date || today(), createdAt: today() }, ...records]);
    setModal(false);
    setForm({ type: "income", amount: "", description: "", category: "", date: "" });
  };

  const del = (id) => setRecords(records.filter(r => r.id !== id));

  return (
    <div>
      <div className="admin-header">
        <h2>Church Savings & Finance</h2>
        <button className="btn" onClick={() => setModal(true)}>+ Add Record</button>
      </div>
      <div className="savings-summary">
        <div className="savings-stat">
          <div className="savings-stat-label">Current Balance</div>
          <div className={`savings-stat-value ${total >= 0 ? "positive" : "negative"}`}>{fmtCurrency(total)}</div>
        </div>
        <div className="savings-stat">
          <div className="savings-stat-label">Total Income</div>
          <div className="savings-stat-value positive">{fmtCurrency(totalIn)}</div>
        </div>
        <div className="savings-stat">
          <div className="savings-stat-label">Total Expenses</div>
          <div className="savings-stat-value negative">{fmtCurrency(totalOut)}</div>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>No records yet.</td></tr>
          ) : records.map(r => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td><span className={`tag ${r.type}`}>{r.type}</span></td>
              <td>{r.description}</td>
              <td>{r.category}</td>
              <td style={{ fontWeight: 500, color: r.type === "income" ? "#27ae60" : "#c0392b" }}>
                {r.type === "income" ? "+" : "-"}{fmtCurrency(r.amount)}
              </td>
              <td>
                <button className="btn btn-danger" style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }} onClick={() => del(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <Modal title="Add Financial Record" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Add Record</button></>}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-input" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₱)</label>
            <input className="form-input" type="number" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Description of transaction" />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
              <option value="">Select category</option>
              <option>Tithes & Offerings</option><option>Building Fund</option>
              <option>Missions</option><option>Utilities</option>
              <option>Salaries</option><option>Events</option>
              <option>Outreach</option><option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN: NOTES ────────────────────────────────────────────────────────────
function NotesPanel() {
  const [notes, setNotes] = useLocalStorage("fbc_notes", []);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  const add = () => {
    if (!form.title || !form.body) return;
    setNotes([{ id: newId(), ...form, createdAt: today() }, ...notes]);
    setModal(false);
    setForm({ title: "", body: "" });
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Notes</h2>
        <button className="btn" onClick={() => setModal(true)}>+ Add Note</button>
      </div>
      {notes.length === 0 ? (
        <p style={{ color: "#aaa", fontStyle: "italic" }}>No notes yet. Add your first note.</p>
      ) : (
        <div className="notes-grid">
          {notes.map(n => (
            <div key={n.id} className="note-card">
              <h4>{n.title}</h4>
              <p>{n.body}</p>
              <div className="note-meta">Added {n.createdAt}</div>
              <div className="note-actions">
                <button className="btn btn-danger" style={{ padding: "0.25rem 0.6rem", fontSize: "0.7rem" }} onClick={() => setNotes(notes.filter(x => x.id !== n.id))}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title="Add Note" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Save Note</button></>}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Note title" />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea className="form-textarea" rows={5} value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} placeholder="Write your note here..." />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN: ACTIVITIES ───────────────────────────────────────────────────────
function ActivitiesPanel() {
  const [activities, setActivities] = useLocalStorage("fbc_activities", []);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", ministry: "", date: "", time: "", location: "" });

  const add = () => {
    if (!form.title) return;
    setActivities([{ id: newId(), ...form, createdAt: today() }, ...activities]);
    setModal(false);
    setForm({ title: "", description: "", ministry: "", date: "", time: "", location: "" });
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Activities</h2>
        <button className="btn" onClick={() => setModal(true)}>+ Add Activity</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Ministry</th><th>Date</th><th>Time</th><th>Location</th><th>Action</th></tr>
        </thead>
        <tbody>
          {activities.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>No activities yet.</td></tr>
          ) : activities.map(a => (
            <tr key={a.id}>
              <td>
                <div style={{ fontWeight: 500 }}>{a.title}</div>
                {a.description && <div style={{ fontSize: "0.78rem", color: "#888" }}>{a.description}</div>}
              </td>
              <td><span className="tag activity">{a.ministry || "General"}</span></td>
              <td>{a.date}</td><td>{a.time}</td><td>{a.location}</td>
              <td><button className="btn btn-danger" style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }} onClick={() => setActivities(activities.filter(x => x.id !== a.id))}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {modal && (
        <Modal title="Add Activity" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Add Activity</button></>}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Activity title" /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Brief description" /></div>
          <div className="form-group"><label className="form-label">Ministry</label>
            <select className="form-input" value={form.ministry} onChange={e => setForm(p => ({...p, ministry: e.target.value}))}>
              <option value="">Select ministry</option>
              <option>Children's Ministry</option><option>Youth Ministry</option><option>Men's Fellowship</option>
              <option>Women's Ministry</option><option>Worship Ministry</option><option>Outreach Ministry</option><option>General</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={form.time} onChange={e => setForm(p => ({...p, time: e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="Venue / location" /></div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN: EVENTS ───────────────────────────────────────────────────────────
function EventsPanel({ events, setEvents }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", location: "" });

  const add = () => {
    if (!form.title || !form.date) return;
    setEvents([{ id: newId(), ...form, createdAt: today() }, ...events]);
    setModal(false);
    setForm({ title: "", description: "", date: "", time: "", location: "" });
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Events</h2>
        <button className="btn" onClick={() => setModal(true)}>+ Add Event</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Action</th></tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>No events yet.</td></tr>
          ) : events.map(e => (
            <tr key={e.id}>
              <td>
                <div style={{ fontWeight: 500 }}>{e.title}</div>
                {e.description && <div style={{ fontSize: "0.78rem", color: "#888" }}>{e.description}</div>}
              </td>
              <td>{e.date}</td><td>{e.time}</td><td>{e.location}</td>
              <td><button className="btn btn-danger" style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }} onClick={() => setEvents(events.filter(x => x.id !== e.id))}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {modal && (
        <Modal title="Add Event" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Add Event</button></>}>
          <div className="form-group"><label className="form-label">Event Title *</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Event title" /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Event details" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={form.time} onChange={e => setForm(p => ({...p, time: e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="Venue" /></div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN: ANNOUNCEMENTS ────────────────────────────────────────────────────
function AnnouncementsPanel({ announcements, setAnnouncements }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  const add = () => {
    if (!form.title || !form.body) return;
    setAnnouncements([{ id: newId(), ...form, date: today() }, ...announcements]);
    setModal(false);
    setForm({ title: "", body: "" });
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Announcements</h2>
        <button className="btn" onClick={() => setModal(true)}>+ Add Announcement</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Message</th><th>Date</th><th>Action</th></tr>
        </thead>
        <tbody>
          {announcements.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>No announcements yet.</td></tr>
          ) : announcements.map(a => (
            <tr key={a.id}>
              <td style={{ fontWeight: 500 }}>{a.title}</td>
              <td style={{ maxWidth: "300px" }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.body}</div></td>
              <td>{a.date}</td>
              <td><button className="btn btn-danger" style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }} onClick={() => setAnnouncements(announcements.filter(x => x.id !== a.id))}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {modal && (
        <Modal title="Add Announcement" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Post Announcement</button></>}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Announcement title" /></div>
          <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" rows={5} value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} placeholder="Type your announcement here..." /></div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN PAGE ──────────────────────────────────────────────────────────────
function AdminPage({ announcements, setAnnouncements, events, setEvents }) {
  const [tab, setTab] = useState("savings");

  const navItems = [
    { id: "savings", label: "Savings & Finance", icon: "₱" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "events", label: "Events", icon: "📅" },
    { id: "activities", label: "Activities", icon: "⛪" },
    { id: "notes", label: "Notes", icon: "📝" },
  ];

  return (
    <div className="page">
      <div style={{ borderBottom: "var(--border)", padding: "1rem 2rem", background: "#f8f8f8", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888" }}>Admin Panel</div>
        <div style={{ width: "1px", height: "14px", background: "#ccc" }} />
        <div style={{ fontSize: "0.85rem", color: "#444" }}>Faithway Baptist Church Navarro — Church Management</div>
      </div>
      <div className="admin-layout">
        <div className="admin-sidebar">
          <div className="admin-sidebar-title">Management</div>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`admin-nav-item${tab === item.id ? " active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="admin-content">
          {tab === "savings" && <SavingsPanel />}
          {tab === "announcements" && <AnnouncementsPanel announcements={announcements} setAnnouncements={setAnnouncements} />}
          {tab === "events" && <EventsPanel events={events} setEvents={setEvents} />}
          {tab === "activities" && <ActivitiesPanel />}
          {tab === "notes" && <NotesPanel />}
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [announcements, setAnnouncements] = useLocalStorage("fbc_announcements", []);
  const [events, setEvents] = useLocalStorage("fbc_events", []);

  return (
    <>
      <style>{globalStyles}</style>
      <Nav page={page} setPage={setPage} />
      {page === "home" && <HomePage announcements={announcements} events={events} />}
      {page === "about" && <AboutPage />}
      {page === "admin" && (
        <AdminPage
          announcements={announcements} setAnnouncements={setAnnouncements}
          events={events} setEvents={setEvents}
        />
      )}
    </>
  );
}
