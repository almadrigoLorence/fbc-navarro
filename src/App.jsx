import { useState, useEffect, useRef, useCallback } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Playfair+Display:wght@600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #1B3A6B;
    --primary-light: #2D5AA0;
    --accent: #F59E0B;
    --accent-light: #FCD34D;
    --white: #ffffff;
    --gray-50: #F8FAFC;
    --gray-100: #F1F5F9;
    --gray-200: #E2E8F0;
    --gray-300: #CBD5E1;
    --gray-400: #94A3B8;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1E293B;
    --dark: #0F1729;
    --success: #10B981;
    --danger: #EF4444;
    --radius-sm: 8px;
    --radius: 16px;
    --radius-lg: 24px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05);
    --shadow: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 32px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05);
    --transition: all 0.22s ease;
  }

  html { scroll-behavior: smooth; }
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--white);
    color: var(--gray-800);
    min-height: 100vh;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  h1,h2,h3,h4,h5 { font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.2; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--gray-100); }
  ::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 3px; }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--gray-200);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem; height: 72px;
    transition: var(--transition);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 0.75rem; cursor: pointer; text-decoration: none;
  }
  .nav-logo-icon {
    width: 42px; height: 42px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; flex-shrink: 0;
  }
  .nav-logo-text { font-size: 0.9rem; font-weight: 800; color: var(--gray-800); line-height: 1.15; }
  .nav-logo-sub { font-size: 0.68rem; font-weight: 400; color: var(--gray-400); display: block; }
  .nav-center { display: flex; align-items: center; gap: 0.25rem; }
  .nav-link {
    padding: 0.5rem 1.1rem; border-radius: 50px;
    cursor: pointer; font-size: 0.88rem; font-weight: 600;
    color: var(--gray-600); transition: var(--transition); user-select: none;
  }
  .nav-link:hover { background: var(--gray-100); color: var(--primary); }
  .nav-link.active { color: var(--primary); background: rgba(27,58,107,0.08); }
  .nav-right { display: flex; align-items: center; gap: 0.75rem; }
  .nav-cta {
    padding: 0.6rem 1.5rem;
    background: var(--primary); color: white;
    border-radius: 50px; border: none; cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.85rem; font-weight: 700;
    transition: var(--transition);
  }
  .nav-cta:hover { background: var(--primary-light); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(27,58,107,0.35); }

  /* ── PAGE ── */
  .page { padding-top: 72px; min-height: 100vh; }

  /* ── HERO ── */
  .hero {
    min-height: calc(100vh - 72px);
    position: relative; overflow: hidden;
    display: flex; align-items: center;
  }
  .hero-slide {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    transition: opacity 1s ease;
    opacity: 0;
  }
  .hero-slide.active { opacity: 1; }
  .hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(120deg,
      rgba(11,23,45,0.92) 0%,
      rgba(27,58,107,0.75) 55%,
      rgba(27,58,107,0.25) 100%
    );
  }
  .hero-content {
    position: relative; z-index: 2;
    max-width: 1200px; margin: 0 auto;
    padding: 4rem 2.5rem; width: 100%;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(245,158,11,0.18);
    border: 1px solid rgba(245,158,11,0.45);
    color: #FCD34D;
    padding: 0.4rem 1.1rem; border-radius: 50px;
    font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 1.75rem;
    animation: fadeSlideUp 0.6s ease both;
  }
  .hero-title {
    font-size: clamp(2.6rem, 6vw, 4.8rem);
    font-weight: 800; color: white;
    line-height: 1.08; margin-bottom: 1.5rem;
    max-width: 680px;
    animation: fadeSlideUp 0.6s 0.1s ease both;
  }
  .hero-title span { color: var(--accent); }
  .hero-desc {
    font-size: 1.1rem; color: rgba(255,255,255,0.78);
    max-width: 500px; line-height: 1.75; margin-bottom: 2.5rem;
    animation: fadeSlideUp 0.6s 0.2s ease both;
  }
  .hero-actions {
    display: flex; gap: 1rem; flex-wrap: wrap;
    animation: fadeSlideUp 0.6s 0.3s ease both;
  }
  .btn-hero-primary {
    padding: 0.9rem 2.1rem;
    background: var(--accent); color: var(--dark);
    border-radius: 50px; font-weight: 800;
    font-size: 0.95rem; border: none; cursor: pointer;
    transition: var(--transition);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .btn-hero-primary:hover { background: var(--accent-light); transform: translateY(-2px); box-shadow: 0 8px 22px rgba(245,158,11,0.42); }
  .btn-hero-outline {
    padding: 0.9rem 2.1rem;
    background: transparent; color: white;
    border-radius: 50px; font-weight: 600;
    font-size: 0.95rem; border: 2px solid rgba(255,255,255,0.4);
    cursor: pointer; transition: var(--transition);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .btn-hero-outline:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.75); }
  .hero-nav {
    position: absolute; bottom: 2rem; left: 0; right: 0; z-index: 3;
    display: flex; justify-content: center; gap: 0.5rem;
  }
  .hero-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(255,255,255,0.35);
    cursor: pointer; transition: var(--transition); border: none;
  }
  .hero-dot.active { background: var(--accent); width: 26px; border-radius: 4px; }
  .hero-arrows {
    position: absolute; bottom: 1.75rem; right: 2.5rem; z-index: 3;
    display: flex; gap: 0.5rem;
  }
  .hero-arrow {
    width: 44px; height: 44px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.08); backdrop-filter: blur(4px);
    color: white; font-size: 1.15rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: var(--transition);
  }
  .hero-arrow:hover { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.65); }

  /* ── STATS BAR ── */
  .stats-bar { background: var(--primary); padding: 2.5rem 2.5rem; }
  .stats-inner {
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
  }
  .stat-item { text-align: center; padding: 0.75rem 1rem; }
  .stat-number {
    font-size: 2.4rem; font-weight: 800;
    color: var(--accent); display: block;
    line-height: 1; margin-bottom: 0.4rem;
  }
  .stat-label {
    font-size: 0.78rem; font-weight: 600;
    color: rgba(255,255,255,0.65);
    text-transform: uppercase; letter-spacing: 0.1em;
  }

  /* ── SECTION ── */
  .section { padding: 5.5rem 2.5rem; }
  .section-alt { background: var(--gray-50); }
  .section-dark { background: var(--dark); }
  .section-primary { background: var(--primary); }
  .section-inner { max-width: 1200px; margin: 0 auto; }
  .section-header { text-align: center; margin-bottom: 3.5rem; }
  .section-badge {
    display: inline-block;
    background: rgba(27,58,107,0.09);
    color: var(--primary);
    padding: 0.35rem 1.1rem; border-radius: 50px;
    font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 1rem;
  }
  .section-dark .section-badge { background: rgba(245,158,11,0.15); color: var(--accent); }
  .section-primary .section-badge { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); }
  .section-title {
    font-size: clamp(1.9rem, 3.5vw, 2.9rem);
    font-weight: 800; color: var(--gray-800);
    margin-bottom: 1rem; line-height: 1.15;
  }
  .section-dark .section-title, .section-primary .section-title { color: white; }
  .section-sub {
    font-size: 1rem; color: var(--gray-600);
    max-width: 560px; margin: 0 auto; line-height: 1.75;
  }
  .section-dark .section-sub { color: rgba(255,255,255,0.62); }
  .section-primary .section-sub { color: rgba(255,255,255,0.72); }

  /* ── CARDS ── */
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
  .card {
    background: white; border-radius: var(--radius);
    padding: 2rem; box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200); transition: var(--transition);
    position: relative; overflow: hidden;
  }
  .card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
  .card-icon {
    width: 54px; height: 54px;
    background: rgba(27,58,107,0.08); border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem; margin-bottom: 1.25rem;
  }
  .card-category {
    font-size: 0.72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--primary); margin-bottom: 0.5rem;
  }
  .card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--gray-800); }
  .card p { font-size: 0.88rem; line-height: 1.75; color: var(--gray-600); }
  .card-meta {
    margin-top: 1.25rem; padding-top: 1rem;
    border-top: 1px solid var(--gray-100);
    font-size: 0.8rem; color: var(--gray-400);
    display: flex; align-items: center; gap: 0.5rem;
  }

  /* Announcement card */
  .ann-card {
    background: white; border-radius: var(--radius);
    padding: 1.75rem; box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    border-left: 4px solid var(--accent);
    transition: var(--transition);
  }
  .ann-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .ann-tag {
    display: inline-block;
    background: rgba(245,158,11,0.1); color: #B45309;
    padding: 0.25rem 0.8rem; border-radius: 50px;
    font-size: 0.68rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 0.85rem;
  }
  .ann-card h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--gray-800); }
  .ann-card p { font-size: 0.87rem; line-height: 1.65; color: var(--gray-600); }

  /* ── MISSION SPLIT ── */
  .mission-split {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 5rem; align-items: center;
  }
  .mission-img-wrap {
    position: relative; border-radius: var(--radius-lg);
    overflow: hidden; aspect-ratio: 4/3;
    box-shadow: var(--shadow-lg);
  }
  .mission-img-bg { width: 100%; height: 100%; background-size: cover; background-position: center; }
  .mission-float {
    position: absolute; bottom: 1.75rem; left: 1.75rem;
    background: white; border-radius: var(--radius);
    padding: 1.1rem 1.4rem;
    box-shadow: var(--shadow-lg);
    display: flex; align-items: center; gap: 0.85rem;
  }
  .mission-float-icon {
    width: 46px; height: 46px; background: var(--primary);
    border-radius: 12px; display: flex; align-items: center;
    justify-content: center; font-size: 1.3rem; color: white; flex-shrink: 0;
  }
  .mission-float strong { display: block; font-size: 0.9rem; font-weight: 800; color: var(--gray-800); }
  .mission-float span { font-size: 0.75rem; color: var(--gray-400); }
  .mission-text .section-badge { text-align: left; display: block; width: fit-content; }
  .mission-text h2 { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800; margin-bottom: 1.25rem; color: var(--gray-800); }
  .mission-text p { color: var(--gray-600); line-height: 1.8; margin-bottom: 1.5rem; font-size: 0.97rem; }
  .mission-points { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 2.25rem; }
  .mission-point {
    display: flex; align-items: center; gap: 0.85rem;
    font-size: 0.92rem; font-weight: 600; color: var(--gray-700);
  }
  .mission-check {
    width: 24px; height: 24px;
    background: rgba(16,185,129,0.12); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--success); font-size: 0.75rem; font-weight: 800;
    flex-shrink: 0;
  }

  /* ── SCHEDULE ── */
  .schedule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 1.25rem; }
  .schedule-card {
    background: white; border-radius: var(--radius);
    padding: 1.75rem; box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    display: flex; gap: 1.25rem; align-items: flex-start;
    transition: var(--transition);
  }
  .schedule-card:hover { box-shadow: var(--shadow); transform: translateY(-3px); }
  .schedule-icon {
    width: 50px; height: 50px; background: var(--primary);
    border-radius: 14px; display: flex; align-items: center;
    justify-content: center; color: white; font-size: 1.3rem; flex-shrink: 0;
  }
  .schedule-info { flex: 1; }
  .schedule-day { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 0.3rem; }
  .schedule-name { font-size: 1rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.25rem; }
  .schedule-time { font-size: 0.85rem; color: var(--gray-600); font-weight: 500; }
  .schedule-loc { font-size: 0.78rem; color: var(--gray-400); margin-top: 0.25rem; }

  /* ── CONTACT ── */
  .contact-split { display: grid; grid-template-columns: 1fr 1.3fr; gap: 3rem; align-items: start; }
  .contact-info-card {
    background: linear-gradient(145deg, var(--primary) 0%, var(--primary-light) 100%);
    border-radius: var(--radius-lg); padding: 2.75rem; color: white;
  }
  .contact-info-card h3 { font-size: 1.6rem; font-weight: 800; color: white; margin-bottom: 0.5rem; }
  .contact-info-card > p { color: rgba(255,255,255,0.7); margin-bottom: 2.5rem; font-size: 0.92rem; line-height: 1.65; }
  .contact-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
  .contact-item-icon {
    width: 42px; height: 42px; background: rgba(255,255,255,0.12);
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
  }
  .contact-label { font-size: 0.68rem; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 0.2rem; }
  .contact-value { font-size: 0.9rem; color: white; font-weight: 500; word-break: break-all; }
  .contact-form-card {
    background: white; border-radius: var(--radius-lg);
    padding: 2.75rem; box-shadow: var(--shadow-lg);
    border: 1px solid var(--gray-200);
  }
  .contact-form-card h3 { font-size: 1.4rem; font-weight: 800; margin-bottom: 0.4rem; }
  .contact-form-card .form-sub { font-size: 0.88rem; color: var(--gray-400); margin-bottom: 2rem; }
  .form-group { margin-bottom: 1.25rem; }
  .form-label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--gray-700); margin-bottom: 0.5rem; }
  .form-input, .form-textarea, .form-select {
    width: 100%; padding: 0.8rem 1rem;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-sm);
    background: var(--gray-50);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem; color: var(--gray-800);
    outline: none; transition: var(--transition);
    resize: vertical;
  }
  .form-input:focus, .form-textarea:focus, .form-select:focus {
    border-color: var(--primary); background: white;
    box-shadow: 0 0 0 3px rgba(27,58,107,0.09);
  }

  /* ── BUTTONS ── */
  .btn {
    padding: 0.75rem 1.75rem;
    background: var(--primary); color: white;
    border-radius: 50px; border: none; cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    transition: var(--transition);
    display: inline-flex; align-items: center; gap: 0.5rem;
  }
  .btn:hover { background: var(--primary-light); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(27,58,107,0.3); }
  .btn-accent { background: var(--accent); color: var(--dark); }
  .btn-accent:hover { background: var(--accent-light); box-shadow: 0 4px 14px rgba(245,158,11,0.35); }
  .btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
  .btn-outline:hover { background: var(--primary); color: white; transform: translateY(-1px); }
  .btn-danger { background: var(--danger); color: white; }
  .btn-danger:hover { background: #DC2626; }
  .btn-sm { padding: 0.4rem 1rem; font-size: 0.78rem; border-radius: 8px; }
  .btn-full { width: 100%; justify-content: center; }

  /* ── FOOTER ── */
  .footer { background: var(--dark); padding: 5rem 2.5rem 2.5rem; }
  .footer-inner {
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 3.5rem; margin-bottom: 3.5rem;
  }
  .footer-logo-wrap { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.25rem; }
  .footer-logo-icon {
    width: 40px; height: 40px; background: var(--accent);
    border-radius: 10px; display: flex; align-items: center;
    justify-content: center; font-size: 1.2rem;
  }
  .footer-logo-name { font-size: 0.9rem; font-weight: 800; color: white; line-height: 1.2; }
  .footer-logo-sub { font-size: 0.7rem; color: rgba(255,255,255,0.45); }
  .footer-brand p { font-size: 0.85rem; line-height: 1.75; color: rgba(255,255,255,0.5); max-width: 270px; }
  .footer-col h4 { font-size: 0.82rem; font-weight: 800; color: white; margin-bottom: 1.25rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.7rem; }
  .footer-links li { font-size: 0.85rem; color: rgba(255,255,255,0.5); cursor: pointer; transition: var(--transition); }
  .footer-links li:hover { color: var(--accent); }
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.07);
    padding-top: 2rem; max-width: 1200px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.8rem; color: rgba(255,255,255,0.35);
  }
  .footer-bottom span { color: var(--accent); }

  /* ── ABOUT ── */
  .about-hero {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    padding: 7rem 2.5rem 6rem; text-align: center; color: white;
    position: relative; overflow: hidden;
  }
  .about-hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.05) 0%, transparent 60%);
  }
  .about-hero .section-badge { background: rgba(245,158,11,0.2); color: #FCD34D; }
  .about-hero h1 {
    font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 800;
    color: white; max-width: 680px; margin: 0 auto 1.25rem; line-height: 1.15;
  }
  .about-hero p { color: rgba(255,255,255,0.78); max-width: 520px; margin: 0 auto; font-size: 1.05rem; line-height: 1.75; }

  .beliefs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
  .belief-card {
    background: white; border-radius: var(--radius);
    padding: 2rem; box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    border-top: 3px solid var(--primary);
    transition: var(--transition);
  }
  .belief-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .belief-card h3 { font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem; }
  .belief-card p { font-size: 0.88rem; line-height: 1.72; color: var(--gray-600); }

  .staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 1.5rem; }
  .staff-card {
    background: white; border-radius: var(--radius);
    padding: 2.25rem 1.5rem; text-align: center;
    box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200);
    transition: var(--transition);
  }
  .staff-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .staff-avatar {
    width: 84px; height: 84px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    border-radius: 50%; margin: 0 auto 1.1rem;
    display: flex; align-items: center; justify-content: center; font-size: 2rem;
  }
  .staff-name { font-size: 0.95rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.35rem; }
  .staff-role { font-size: 0.75rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }

  .info-table { background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200); }
  .info-row { display: grid; grid-template-columns: 190px 1fr; border-bottom: 1px solid var(--gray-100); }
  .info-row:last-child { border-bottom: none; }
  .info-key { padding: 1rem 1.5rem; background: var(--gray-50); font-weight: 700; font-size: 0.83rem; color: var(--gray-600); border-right: 1px solid var(--gray-100); }
  .info-val { padding: 1rem 1.5rem; font-size: 0.9rem; color: var(--gray-800); }

  /* ── ADMIN ── */
  .admin-topbar {
    background: var(--gray-50); border-bottom: 1px solid var(--gray-200);
    padding: 0.9rem 2rem; display: flex; align-items: center; gap: 0.75rem;
  }
  .admin-badge {
    background: var(--primary); color: white;
    padding: 0.22rem 0.7rem; border-radius: 50px;
    font-size: 0.68rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .admin-topbar-text { font-size: 0.85rem; color: var(--gray-600); }
  .admin-layout { display: grid; grid-template-columns: 250px 1fr; min-height: calc(100vh - 72px); }
  .admin-sidebar {
    background: var(--gray-50); border-right: 1px solid var(--gray-200);
    padding: 1.75rem 0.75rem;
    position: sticky; top: 72px;
    height: calc(100vh - 72px); overflow-y: auto;
  }
  .admin-sidebar-title { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: var(--gray-400); padding: 0 0.75rem; margin-bottom: 0.65rem; }
  .admin-nav-item {
    padding: 0.75rem 1rem; cursor: pointer;
    font-size: 0.87rem; font-weight: 600;
    color: var(--gray-600); transition: var(--transition);
    display: flex; align-items: center; gap: 0.65rem;
    border-radius: var(--radius-sm); margin-bottom: 0.22rem;
  }
  .admin-nav-item:hover { background: var(--gray-200); color: var(--gray-800); }
  .admin-nav-item.active { background: var(--primary); color: white; }
  .admin-content { padding: 2.25rem; overflow-y: auto; background: white; }
  .admin-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.75rem; padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--gray-200);
  }
  .admin-header h2 { font-size: 1.5rem; font-weight: 800; }

  .data-table { width: 100%; border-collapse: collapse; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--gray-200); }
  .data-table th, .data-table td { padding: 0.9rem 1.1rem; text-align: left; font-size: 0.85rem; border-bottom: 1px solid var(--gray-100); }
  .data-table th { background: var(--gray-50); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray-500); }
  .data-table tr:hover td { background: var(--gray-50); }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,41,0.65); backdrop-filter: blur(5px);
    z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal {
    background: white; border-radius: var(--radius-lg);
    width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }
  .modal-header {
    padding: 1.5rem 1.75rem; border-bottom: 1px solid var(--gray-200);
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-header h3 { font-size: 1.15rem; font-weight: 800; }
  .modal-close {
    background: var(--gray-100); border: none; cursor: pointer;
    font-size: 1rem; color: var(--gray-600);
    width: 34px; height: 34px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    transition: var(--transition);
  }
  .modal-close:hover { background: var(--gray-200); }
  .modal-body { padding: 1.75rem; }
  .modal-footer { padding: 1.25rem 1.75rem; border-top: 1px solid var(--gray-200); display: flex; gap: 0.75rem; justify-content: flex-end; }

  .savings-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.75rem; }
  .savings-stat { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 1.5rem; }
  .savings-stat-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray-400); margin-bottom: 0.5rem; }
  .savings-stat-value { font-size: 2rem; font-weight: 800; color: var(--gray-800); }
  .savings-stat-value.positive { color: var(--success); }
  .savings-stat-value.negative { color: var(--danger); }

  .tag { display: inline-flex; align-items: center; padding: 0.22rem 0.7rem; border-radius: 50px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .tag.income { background: #D1FAE5; color: #065F46; }
  .tag.expense { background: #FEE2E2; color: #991B1B; }
  .tag.event { background: #DBEAFE; color: #1E40AF; }
  .tag.activity { background: #EDE9FE; color: #5B21B6; }
  .tag.announcement { background: #FEF3C7; color: #92400E; }

  .notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.1rem; }
  .note-card { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 1.5rem; transition: var(--transition); }
  .note-card:hover { box-shadow: var(--shadow); background: white; }
  .note-card h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; }
  .note-card p { font-size: 0.85rem; line-height: 1.6; color: var(--gray-600); }
  .note-meta { font-size: 0.75rem; color: var(--gray-400); margin-top: 0.75rem; }
  .note-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }

  .alert-success {
    padding: 0.9rem 1.25rem; background: #D1FAE5;
    border: 1px solid #A7F3D0; border-radius: var(--radius-sm);
    color: #065F46; font-size: 0.88rem; margin-bottom: 1rem;
    display: flex; align-items: center; gap: 0.5rem; font-weight: 600;
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(22px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .footer-inner { grid-template-columns: 1fr 1fr; }
    .mission-split { grid-template-columns: 1fr; gap: 2.5rem; }
    .stats-inner { grid-template-columns: repeat(2, 1fr); }
    .contact-split { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .nav { padding: 0 1.25rem; }
    .nav-center { display: none; }
    .section { padding: 3.5rem 1.25rem; }
    .stats-bar { padding: 2rem 1.25rem; }
    .stats-inner { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .hero-content { padding: 3rem 1.25rem; }
    .hero-arrows { right: 1.25rem; }
    .admin-layout { grid-template-columns: 1fr; }
    .admin-sidebar { position: static; height: auto; }
    .savings-summary { grid-template-columns: 1fr; }
    .footer-inner { grid-template-columns: 1fr; gap: 2rem; }
    .mission-split { grid-template-columns: 1fr; }
    .contact-split { grid-template-columns: 1fr; }
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    bg: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&q=85",
    title: "Welcome to Faithway Baptist Church",
    titleBold: "Navarro",
    desc: "A community rooted in faith, love, and service to God and one another."
  },
  {
    bg: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600&q=85",
    title: "Join Us Every",
    titleBold: "Sunday Service",
    desc: "Worship with us at 9:00 AM and 12:00 PM for a life-changing encounter with God."
  },
  {
    bg: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&q=85",
    title: "Growing Together",
    titleBold: "in Christ",
    desc: "Bible studies, fellowship groups, and community events for all ages and seasons of life."
  },
  {
    bg: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1600&q=85",
    title: "Serving Our",
    titleBold: "Community",
    desc: "Outreach programs and missions extending the love of Christ to Navarro and beyond."
  }
];

const MINISTRIES = [
  { icon: "👶", title: "Children's Ministry", desc: "Nurturing faith in children ages 0–12 through age-appropriate Bible teaching and worship.", freq: "Every Sunday" },
  { icon: "🎯", title: "Youth Ministry", desc: "Discipling teenagers through teaching, fellowship, camps, and service opportunities.", freq: "Sunday & Friday" },
  { icon: "👨‍👩‍👧‍👦", title: "Men's Fellowship", desc: "Encouraging men to grow in Christlikeness through accountability groups and service.", freq: "Monthly" },
  { icon: "🌸", title: "Women's Ministry", desc: "Building up women in faith through Bible studies, prayer, mentorship, and fellowship.", freq: "Weekly" },
  { icon: "🎵", title: "Worship Ministry", desc: "Leading the congregation in heartfelt, Scripture-centered worship through music and song.", freq: "Every Sunday" },
  { icon: "🌍", title: "Outreach Ministry", desc: "Extending the love of Christ through community service, evangelism, and missions support.", freq: "Monthly" },
];

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const useLocalStorage = (key, initial) => {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  const save = useCallback((v) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, save];
};
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const today = () => new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
const fmtCurrency = (n) => "₱" + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

// ─── MODAL ────────────────────────────────────────────────────────────────────
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

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "admin", label: "Admin" }
  ];
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage("home")}>
        <div className="nav-logo-icon">✝️</div>
        <div>
          <div className="nav-logo-text">Faithway Baptist Church</div>
          <span className="nav-logo-sub">Navarro, General Trias, Cavite</span>
        </div>
      </div>
      <div className="nav-center">
        {links.map(l => (
          <div key={l.id} className={`nav-link${page === l.id ? " active" : ""}`} onClick={() => setPage(l.id)}>
            {l.label}
          </div>
        ))}
      </div>
      <div className="nav-right">
        <button className="nav-cta" onClick={() => setPage("home")}>Join Us</button>
      </div>
    </nav>
  );
}

// ─── HERO SLIDESHOW ───────────────────────────────────────────────────────────
function Hero() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);
  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent(c => (c + 1) % SLIDES.length);
  const s = SLIDES[current];

  return (
    <div className="hero">
      {SLIDES.map((sl, i) => (
        <div key={i} className={`hero-slide${i === current ? " active" : ""}`}
          style={{ backgroundImage: `url(${sl.bg})` }} />
      ))}
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-badge">✝ Faithway Baptist Church Navarro</div>
        <h1 className="hero-title">
          {s.title} <span>{s.titleBold}</span>
        </h1>
        <p className="hero-desc">{s.desc}</p>
        <div className="hero-actions">
          <button className="btn-hero-primary">Plan Your Visit →</button>
          <button className="btn-hero-outline">Watch Online</button>
        </div>
      </div>
      <div className="hero-arrows">
        <button className="hero-arrow" onClick={prev}>‹</button>
        <button className="hero-arrow" onClick={next}>›</button>
      </div>
      <div className="hero-nav">
        {SLIDES.map((_, i) => (
          <button key={i} className={`hero-dot${i === current ? " active" : ""}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ announcements, events }) {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleContact = () => {
    if (!contactForm.name || !contactForm.message) return;
    setSent(true);
    setContactForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const upcomingEvents = events.filter(e => e.date >= new Date().toISOString().slice(0, 10)).slice(0, 6);
  const latestAnnouncements = announcements.slice(0, 6);

  return (
    <div className="page">
      <Hero />

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[
            { n: "200+", l: "Church Members" },
            { n: "3+", l: "Years of Ministry" },
            { n: "2", l: "Sunday Services" },
            { n: "6", l: "Active Ministries" },
          ].map(s => (
            <div key={s.l} className="stat-item">
              <span className="stat-number">{s.n}</span>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="section section-alt">
        <div className="section-inner">
          <div className="mission-split">
            <div className="mission-img-wrap">
              <div className="mission-img-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1560439514-4e9645039924?w=900&q=80)" }} />
              <div className="mission-float">
                <div className="mission-float-icon">✝️</div>
                <div>
                  <strong>Est. in Navarro</strong>
                  <span>General Trias, Cavite</span>
                </div>
              </div>
            </div>
            <div className="mission-text">
              <div className="section-badge">Our Mission</div>
              <h2>Proclaiming the Gospel, Building Disciples</h2>
              <p>We are committed to sharing the transforming power of the Gospel of Jesus Christ to every person in our community and beyond — one life at a time.</p>
              <div className="mission-points">
                {["Rooted in Scripture and the Word of God", "Building a community of genuine disciples", "Serving Navarro with love and compassion", "Welcoming all people from every walk of life"].map(pt => (
                  <div key={pt} className="mission-point">
                    <div className="mission-check">✓</div>
                    {pt}
                  </div>
                ))}
              </div>
              <button className="btn btn-accent">Learn More About Us →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Ministries */}
      <div className="section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Our Ministries</div>
            <div className="section-title">Serving Every Season of Life</div>
            <p className="section-sub">From children to seniors, we have a ministry for every member of your family.</p>
          </div>
          <div className="cards-grid">
            {MINISTRIES.map(m => (
              <div key={m.title} className="card">
                <div className="card-icon">{m.icon}</div>
                <div className="card-category">Ministry</div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <div className="card-meta">🕐 {m.freq}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Latest Updates</div>
            <div className="section-title">Church Announcements</div>
            <p className="section-sub">Stay up to date with what's happening in our church community.</p>
          </div>
          {latestAnnouncements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray-400)", fontStyle: "italic" }}>
              No announcements yet. Check back soon!
            </div>
          ) : (
            <div className="cards-grid">
              {latestAnnouncements.map(a => (
                <div key={a.id} className="ann-card">
                  <div className="ann-tag">📢 Announcement</div>
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                  <div className="card-meta">📅 {a.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Events */}
      {upcomingEvents.length > 0 && (
        <div className="section">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-badge">Schedule</div>
              <div className="section-title">Upcoming Events</div>
              <p className="section-sub">Join us for these upcoming gatherings and activities.</p>
            </div>
            <div className="cards-grid">
              {upcomingEvents.map(e => (
                <div key={e.id} className="card">
                  <div className="card-icon">📅</div>
                  <div className="card-category">Event</div>
                  <h3>{e.title}</h3>
                  <p>{e.description}</p>
                  <div className="card-meta">📅 {e.date} {e.time && `· ${e.time}`}</div>
                  {e.location && <div className="card-meta" style={{ marginTop: "0.25rem", paddingTop: 0, border: "none" }}>📍 {e.location}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Service Schedule */}
      <div className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Weekly Schedule</div>
            <div className="section-title">Join Us for Worship</div>
            <p className="section-sub">Our doors are always open. Come and worship with us.</p>
          </div>
          <div className="schedule-grid">
            {[
              { icon: "☀️", day: "Sunday", name: "Morning Worship", time: "9:00 AM & 12:00 PM", loc: "FBC Navarro Main Sanctuary" },
              { icon: "🙏", day: "Sunday", name: "Youth Service", time: "1:00 PM", loc: "FBC Navarro 2nd Floor" },
              { icon: "📖", day: "Wednesday", name: "Prayer Meeting", time: "7:30 PM", loc: "FBC Navarro / Online" },
            ].map(s => (
              <div key={s.name} className="schedule-card">
                <div className="schedule-icon">{s.icon}</div>
                <div className="schedule-info">
                  <div className="schedule-day">{s.day}</div>
                  <div className="schedule-name">{s.name}</div>
                  <div className="schedule-time">{s.time}</div>
                  <div className="schedule-loc">{s.loc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Get in Touch</div>
            <div className="section-title">We'd Love to Hear From You</div>
            <p className="section-sub">Have questions? Want to visit? Reach out to us anytime.</p>
          </div>
          <div className="contact-split">
            <div className="contact-info-card">
              <h3>Contact Information</h3>
              <p>We're here to help. Reach out through any of the channels below.</p>
              {[
                { icon: "📍", label: "Address", value: "Navarro, General Trias, Cavite, Philippines" },
                { icon: "🕐", label: "Sunday Services", value: "9:00 AM & 12:00 PM" },
                { icon: "📞", label: "Phone", value: "+63 (963) 776-4918" },
                { icon: "✉️", label: "Email", value: "faithwaybaptistnavarro@gmail.com" },
                { icon: "👥", label: "Facebook", value: "FBC Navarro Community Group" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="contact-item">
                  <div className="contact-item-icon">{icon}</div>
                  <div>
                    <div className="contact-label">{label}</div>
                    <div className="contact-value">{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="contact-form-card">
              <h3>Send Us a Message</h3>
              <p className="form-sub">We'll get back to you as soon as we can.</p>
              {sent && <div className="alert-success">✓ Message sent! We'll get back to you soon.</div>}
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" rows={4} value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} placeholder="How can we help you?" />
              </div>
              <button className="btn btn-full btn-accent" onClick={handleContact}>Send Message →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <div className="footer-logo-icon">✝️</div>
              <div>
                <div className="footer-logo-name">Faithway Baptist Church</div>
                <div className="footer-logo-sub">Navarro, General Trias, Cavite</div>
              </div>
            </div>
            <p>A church built on the Word of God, committed to community, worship, and making disciples for Jesus Christ.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>Home</li>
              <li>About Us</li>
              <li>Ministries</li>
              <li>Events</li>
              <li>Contact</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Ministries</h4>
            <ul className="footer-links">
              <li>Children's Ministry</li>
              <li>Youth Ministry</li>
              <li>Women's Ministry</li>
              <li>Men's Fellowship</li>
              <li>Outreach Ministry</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul className="footer-links">
              <li>☀️ Sunday 9:00 AM</li>
              <li>☀️ Sunday 12:00 PM</li>
              <li>🙏 Sunday Youth 1PM</li>
              <li>📖 Wed Prayer 7:30 PM</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} <span>Faithway Baptist Church Navarro</span>. All rights reserved.</div>
          <div>Navarro, General Trias, Cavite 4107, Philippines</div>
        </div>
      </footer>
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div className="page">
      <div className="about-hero">
        <div className="section-badge">Established in Faith</div>
        <h1>About Faithway Baptist Church Navarro</h1>
        <p style={{ marginTop: "1.1rem" }}>A church built on the Word of God, committed to community, worship, and making disciples for Jesus Christ.</p>
      </div>

      <div className="section section-alt">
        <div className="section-inner">
          <div className="mission-split">
            <div className="mission-img-wrap">
              <div className="mission-img-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80)" }} />
            </div>
            <div className="mission-text">
              <div className="section-badge">Who We Are</div>
              <h2>Our Story</h2>
              <p>Faithway Baptist Church Navarro began as a small group of believers in the Navarro community of General Trias, Cavite, united by a shared desire to worship God faithfully and serve their neighbors with love.</p>
              <p>Over the years, the church has grown into a vibrant congregation deeply rooted in Scripture and passionately committed to the Great Commission. Today, we continue to be a spiritual home for families, youth, and individuals seeking to know and follow Jesus Christ.</p>
              <div className="mission-points">
                {["Southern Baptist denomination", "Located in Navarro, General Trias, Cavite", "Committed to Scripture and the Great Commission", "A family-like community where all are welcome"].map(pt => (
                  <div key={pt} className="mission-point">
                    <div className="mission-check">✓</div>
                    {pt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Core Beliefs</div>
            <div className="section-title">What We Believe</div>
            <p className="section-sub">Our faith is grounded in the eternal truths of God's Word.</p>
          </div>
          <div className="beliefs-grid">
            {[
              ["The Bible", "We believe the Holy Bible is the inspired, inerrant, and authoritative Word of God — the supreme standard for all faith and conduct."],
              ["The Trinity", "We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit, co-equal and co-eternal."],
              ["Salvation", "We believe salvation is by grace alone, through faith alone, in Christ alone — not by works, but as a gift from God."],
              ["The Church", "We believe the local church is a body of baptized believers who gather regularly for worship, instruction, fellowship, and service."],
              ["Baptism", "We practice believer's baptism by immersion as a public declaration of faith and identification with Christ's death and resurrection."],
              ["The Lord's Supper", "We observe the Lord's Supper as a memorial of Christ's sacrifice, proclaiming His death until He comes."],
            ].map(([title, text]) => (
              <div key={title} className="belief-card">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Our Ministries</div>
            <div className="section-title">Church Ministries</div>
            <p className="section-sub">Ministries designed to help every member grow in faith and serve one another.</p>
          </div>
          <div className="cards-grid">
            {MINISTRIES.map(m => (
              <div key={m.title} className="card">
                <div className="card-icon">{m.icon}</div>
                <div className="card-category">Ministry</div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <div className="card-meta">🕐 {m.freq}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Church Leadership</div>
            <div className="section-title">Our Staff</div>
          </div>
          <div className="staff-grid">
            {[
              ["✝️", "Pastor Jayson Jay Magbojos", "Senior Pastor"],
              ["📖", "Lorence Almadrigo", "Young Professional President"],
              ["🎵", "John Paul Llona", "Song Leader"],
              ["🙏", "Mr. & Mrs. Llona", "Kitchen Ministry Heads"],
            ].map(([emoji, name, role]) => (
              <div key={name} className="staff-card">
                <div className="staff-avatar">{emoji}</div>
                <div className="staff-name">{name}</div>
                <div className="staff-role">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Church Information</div>
            <div className="section-title">General Information</div>
          </div>
          <div className="info-table" style={{ maxWidth: "620px", margin: "0 auto" }}>
            {[
              ["Denomination", "Southern Baptist"],
              ["Location", "Navarro, General Trias, Cavite"],
              ["Address", "Navarro, General Trias, Cavite 4107"],
              ["Sunday Worship", "9:00 AM & 12:00 PM"],
              ["Youth Service", "Sunday 1:00 PM"],
              ["Wednesday Bible Study", "7:30 PM"],
              ["Contact", "faithwaybaptistnavarro@gmail.com"],
              ["Phone", "+63 (963) 776-4918"],
            ].map(([k, v]) => (
              <div key={k} className="info-row">
                <div className="info-key">{k}</div>
                <div className="info-val">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-bottom" style={{ borderTop: "none", paddingTop: 0 }}>
          <div>© {new Date().getFullYear()} <span>Faithway Baptist Church Navarro</span>. All rights reserved.</div>
          <div>Navarro, General Trias, Cavite, Philippines</div>
        </div>
      </footer>
    </div>
  );
}

// ─── ADMIN PANELS ─────────────────────────────────────────────────────────────
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
    setModal(false); setForm({ type: "income", amount: "", description: "", category: "", date: "" });
  };
  return (
    <div>
      <div className="admin-header">
        <h2>Church Savings & Finance</h2>
        <button className="btn" onClick={() => setModal(true)}>+ Add Record</button>
      </div>
      <div className="savings-summary">
        <div className="savings-stat"><div className="savings-stat-label">Current Balance</div><div className={`savings-stat-value ${total >= 0 ? "positive" : "negative"}`}>{fmtCurrency(total)}</div></div>
        <div className="savings-stat"><div className="savings-stat-label">Total Income</div><div className="savings-stat-value positive">{fmtCurrency(totalIn)}</div></div>
        <div className="savings-stat"><div className="savings-stat-label">Total Expenses</div><div className="savings-stat-value negative">{fmtCurrency(totalOut)}</div></div>
      </div>
      <table className="data-table">
        <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Action</th></tr></thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem", fontStyle: "italic" }}>No records yet.</td></tr>
          ) : records.map(r => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td><span className={`tag ${r.type}`}>{r.type}</span></td>
              <td>{r.description}</td>
              <td>{r.category}</td>
              <td style={{ fontWeight: 700, color: r.type === "income" ? "var(--success)" : "var(--danger)" }}>
                {r.type === "income" ? "+" : "-"}{fmtCurrency(r.amount)}
              </td>
              <td><button className="btn btn-danger btn-sm" onClick={() => setRecords(records.filter(x => x.id !== r.id))}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {modal && (
        <Modal title="Add Financial Record" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Add Record</button></>}>
          <div className="form-group"><label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="income">Income</option><option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Amount (₱)</label><input className="form-input" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
          <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description of transaction" /></div>
          <div className="form-group"><label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="">Select category</option>
              <option>Tithes & Offerings</option><option>Building Fund</option><option>Missions</option>
              <option>Utilities</option><option>Salaries</option><option>Events</option><option>Outreach</option><option>Other</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
        </Modal>
      )}
    </div>
  );
}

function NotesPanel() {
  const [notes, setNotes] = useLocalStorage("fbc_notes", []);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const add = () => {
    if (!form.title || !form.body) return;
    setNotes([{ id: newId(), ...form, createdAt: today() }, ...notes]);
    setModal(false); setForm({ title: "", body: "" });
  };
  return (
    <div>
      <div className="admin-header"><h2>Notes</h2><button className="btn" onClick={() => setModal(true)}>+ Add Note</button></div>
      {notes.length === 0 ? <p style={{ color: "var(--gray-400)", fontStyle: "italic" }}>No notes yet. Add your first note.</p> : (
        <div className="notes-grid">
          {notes.map(n => (
            <div key={n.id} className="note-card">
              <h4>{n.title}</h4><p>{n.body}</p>
              <div className="note-meta">Added {n.createdAt}</div>
              <div className="note-actions"><button className="btn btn-danger btn-sm" onClick={() => setNotes(notes.filter(x => x.id !== n.id))}>Delete</button></div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title="Add Note" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Save Note</button></>}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Note title" /></div>
          <div className="form-group"><label className="form-label">Content</label><textarea className="form-textarea" rows={5} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Write your note here..." /></div>
        </Modal>
      )}
    </div>
  );
}

function ActivitiesPanel() {
  const [activities, setActivities] = useLocalStorage("fbc_activities", []);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", ministry: "", date: "", time: "", location: "" });
  const add = () => {
    if (!form.title) return;
    setActivities([{ id: newId(), ...form, createdAt: today() }, ...activities]);
    setModal(false); setForm({ title: "", description: "", ministry: "", date: "", time: "", location: "" });
  };
  return (
    <div>
      <div className="admin-header"><h2>Activities</h2><button className="btn" onClick={() => setModal(true)}>+ Add Activity</button></div>
      <table className="data-table">
        <thead><tr><th>Title</th><th>Ministry</th><th>Date</th><th>Time</th><th>Location</th><th>Action</th></tr></thead>
        <tbody>
          {activities.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem", fontStyle: "italic" }}>No activities yet.</td></tr>
            : activities.map(a => (
              <tr key={a.id}>
                <td><div style={{ fontWeight: 600 }}>{a.title}</div>{a.description && <div style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>{a.description}</div>}</td>
                <td><span className="tag activity">{a.ministry || "General"}</span></td>
                <td>{a.date}</td><td>{a.time}</td><td>{a.location}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => setActivities(activities.filter(x => x.id !== a.id))}>Delete</button></td>
              </tr>
            ))}
        </tbody>
      </table>
      {modal && (
        <Modal title="Add Activity" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Add Activity</button></>}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Activity title" /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" /></div>
          <div className="form-group"><label className="form-label">Ministry</label>
            <select className="form-select" value={form.ministry} onChange={e => setForm(p => ({ ...p, ministry: e.target.value }))}>
              <option value="">Select ministry</option>
              <option>Children's Ministry</option><option>Youth Ministry</option><option>Men's Fellowship</option>
              <option>Women's Ministry</option><option>Worship Ministry</option><option>Outreach Ministry</option><option>General</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Venue / location" /></div>
        </Modal>
      )}
    </div>
  );
}

function EventsPanel({ events, setEvents }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", location: "" });
  const add = () => {
    if (!form.title || !form.date) return;
    setEvents([{ id: newId(), ...form, createdAt: today() }, ...events]);
    setModal(false); setForm({ title: "", description: "", date: "", time: "", location: "" });
  };
  return (
    <div>
      <div className="admin-header"><h2>Events</h2><button className="btn" onClick={() => setModal(true)}>+ Add Event</button></div>
      <table className="data-table">
        <thead><tr><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Action</th></tr></thead>
        <tbody>
          {events.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem", fontStyle: "italic" }}>No events yet.</td></tr>
            : events.map(e => (
              <tr key={e.id}>
                <td><div style={{ fontWeight: 600 }}>{e.title}</div>{e.description && <div style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>{e.description}</div>}</td>
                <td>{e.date}</td><td>{e.time}</td><td>{e.location}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => setEvents(events.filter(x => x.id !== e.id))}>Delete</button></td>
              </tr>
            ))}
        </tbody>
      </table>
      {modal && (
        <Modal title="Add Event" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Add Event</button></>}>
          <div className="form-group"><label className="form-label">Event Title *</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Event title" /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Event details" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Venue" /></div>
        </Modal>
      )}
    </div>
  );
}

function AnnouncementsPanel({ announcements, setAnnouncements }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const add = () => {
    if (!form.title || !form.body) return;
    setAnnouncements([{ id: newId(), ...form, date: today() }, ...announcements]);
    setModal(false); setForm({ title: "", body: "" });
  };
  return (
    <div>
      <div className="admin-header"><h2>Announcements</h2><button className="btn" onClick={() => setModal(true)}>+ Add Announcement</button></div>
      <table className="data-table">
        <thead><tr><th>Title</th><th>Message</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          {announcements.length === 0 ? <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem", fontStyle: "italic" }}>No announcements yet.</td></tr>
            : announcements.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.title}</td>
                <td style={{ maxWidth: "300px" }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.body}</div></td>
                <td>{a.date}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => setAnnouncements(announcements.filter(x => x.id !== a.id))}>Delete</button></td>
              </tr>
            ))}
        </tbody>
      </table>
      {modal && (
        <Modal title="Add Announcement" onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={add}>Post Announcement</button></>}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title" /></div>
          <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" rows={5} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Type your announcement here..." /></div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
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
      <div className="admin-topbar">
        <div className="admin-badge">Admin Panel</div>
        <div className="admin-topbar-text">Faithway Baptist Church Navarro — Church Management</div>
      </div>
      <div className="admin-layout">
        <div className="admin-sidebar">
          <div className="admin-sidebar-title">Management</div>
          {navItems.map(item => (
            <div key={item.id} className={`admin-nav-item${tab === item.id ? " active" : ""}`} onClick={() => setTab(item.id)}>
              <span>{item.icon}</span><span>{item.label}</span>
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
      {page === "admin" && <AdminPage announcements={announcements} setAnnouncements={setAnnouncements} events={events} setEvents={setEvents} />}
    </>
  );
}
