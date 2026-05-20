import { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";

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
    text-decoration: none;
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

  /* ── ADMIN LOGIN ── */
  .login-overlay {
    min-height: calc(100vh - 72px);
    display: flex; align-items: center; justify-content: center;
    background: var(--gray-50); padding: 3rem 1.25rem;
  }
  .login-card {
    background: white; border-radius: var(--radius-lg);
    padding: 3rem 2.5rem; width: 100%; max-width: 440px;
    box-shadow: var(--shadow-lg); border: 1px solid var(--gray-200);
    text-align: center;
  }
  .login-icon {
    width: 64px; height: 64px; background: rgba(27,58,107,0.08);
    border-radius: var(--radius); display: flex; align-items: center;
    justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem;
  }
  .login-card h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--gray-800); }
  .login-card p { font-size: 0.88rem; color: var(--gray-500); margin-bottom: 2rem; }

  /* ── BIRTHDAY CELEBRANTS ── */
  .celebrants-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem;
  }
  .celebrant-card {
    background: white; border-radius: var(--radius); padding: 2rem 1.5rem;
    box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200);
    text-align: center; position: relative; transition: var(--transition);
    border-bottom: 4px solid var(--accent);
  }
  .celebrant-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .celebrant-avatar {
    width: 90px; height: 90px; border-radius: 50%; margin: 0 auto 1.25rem;
    background-size: cover; background-position: center;
    border: 3px solid var(--gray-100);
  }
  .celebrant-card h3 { font-size: 1.1rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.25rem; }
  .celebrant-date { font-size: 0.8rem; font-weight: 700; color: var(--accent); margin-bottom: 0.75rem; text-transform: uppercase; }
  .celebrant-msg { font-size: 0.85rem; color: var(--gray-500); font-style: italic; line-height: 1.5; }

  /* ── SHOP ── */
  .products-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem;
  }
  .product-card {
    background: white; border-radius: var(--radius); overflow: hidden;
    box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200);
    display: flex; flex-direction: column; transition: var(--transition);
  }
  .product-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
  .product-image {
    height: 240px; background-size: cover; background-position: center;
    position: relative; background-color: var(--gray-100);
  }
  .product-badge {
    position: absolute; top: 1rem; right: 1rem;
    padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.7rem; font-weight: 700;
  }
  .product-badge.in { background: #D1FAE5; color: #065F46; }
  .product-badge.out { background: #FEE2E2; color: #991B1B; }
  .product-info { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
  .product-info h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--gray-800); }
  .product-desc { font-size: 0.85rem; color: var(--gray-500); line-height: 1.6; margin-bottom: 1.25rem; flex: 1; }
  .product-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
  .product-price { font-size: 1.2rem; font-weight: 800; color: var(--primary); }

  /* ── ACTIVITIES / FEED ── */
  .feed-filters {
    display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2.5rem; justify-content: center;
  }
  .filter-btn {
    padding: 0.5rem 1.25rem; border-radius: 50px; border: 1px solid var(--gray-300);
    background: white; color: var(--gray-600); font-weight: 600; font-size: 0.82rem;
    cursor: pointer; transition: var(--transition);
  }
  .filter-btn:hover { background: var(--gray-100); border-color: var(--gray-400); }
  .filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
  .feed-container { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
  .feed-post {
    background: white; border-radius: var(--radius-lg); border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm); padding: 2rem; transition: var(--transition);
  }
  .feed-post:hover { box-shadow: var(--shadow); }
  .feed-post-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
  .feed-post-avatar {
    width: 46px; height: 46px; background: rgba(27,58,107,0.08); border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
  }
  .feed-post-title { font-size: 1.15rem; font-weight: 800; color: var(--gray-800); }
  .feed-post-meta { font-size: 0.78rem; color: var(--gray-400); display: block; margin-top: 0.15rem; }
  .feed-post-tag {
    margin-left: auto; background: rgba(27,58,107,0.08); color: var(--primary);
    padding: 0.25rem 0.8rem; border-radius: 50px; font-size: 0.7rem; font-weight: 700;
  }
  .feed-post-body p { font-size: 0.92rem; color: var(--gray-700); line-height: 1.75; margin-bottom: 1.25rem; white-space: pre-line; }
  .feed-post-img {
    border-radius: var(--radius); width: 100%; height: 380px;
    background-size: cover; background-position: center; box-shadow: var(--shadow-sm);
  }

  /* ── ADMIN DASHBOARD ── */
  .admin-topbar {
    background: var(--gray-50); border-bottom: 1px solid var(--gray-200);
    padding: 0.9rem 2rem; display: flex; align-items: center; justify-content: space-between;
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
    transition: var(--transition);
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
    flex-wrap: wrap; gap: 1rem;
  }
  .admin-header h2 { font-size: 1.5rem; font-weight: 800; }
  .admin-actions { display: flex; gap: 0.5rem; }

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
  .savings-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gray-800); }
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

  /* ── ADMIN MOBILE COMPONENT ── */
  .admin-mobile-header {
    display: none; background: white; border-bottom: 1px solid var(--gray-200);
    padding: 0.75rem 1.25rem; align-items: center; justify-content: space-between;
    position: sticky; top: 72px; z-index: 99;
  }
  .admin-mobile-title { font-size: 0.95rem; font-weight: 800; color: var(--gray-800); }
  .admin-menu-btn {
    background: var(--gray-100); border: none; border-radius: 8px;
    width: 38px; height: 38px; display: flex; align-items: center;
    justify-content: center; cursor: pointer; font-size: 1.2rem;
  }

  /* ── SITE CONTENT MANAGEMENT ── */
  .content-edit-section {
    background: var(--gray-50); border: 1px solid var(--gray-200);
    border-radius: var(--radius); padding: 1.5rem; margin-bottom: 2rem;
  }
  .content-edit-section h3 { font-size: 1.1rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
  
  .slide-edit-box {
    background: white; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
    padding: 1.25rem; margin-bottom: 1rem; position: relative;
  }
  .slide-edit-box h4 { font-size: 0.9rem; font-weight: 700; margin-bottom: 1rem; color: var(--gray-700); }
  
  /* ── SVG CHARTS ── */
  .charts-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
  .chart-card {
    background: white; border: 1px solid var(--gray-200); border-radius: var(--radius);
    padding: 1.75rem; box-shadow: var(--shadow-sm);
  }
  .chart-card h3 { font-size: 1.05rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--gray-800); }
  .chart-container-inner { height: 220px; display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 1.5px solid var(--gray-300); padding-bottom: 0.5rem; }
  .chart-bar-group { display: flex; flex-direction: column; align-items: center; flex: 1; margin: 0 0.5rem; }
  .chart-bar-cols { display: flex; gap: 0.25rem; height: 160px; align-items: flex-end; }
  .chart-bar { width: 14px; border-radius: 4px 4px 0 0; transition: height 0.3s ease; position: relative; }
  .chart-bar.income { background: linear-gradient(to top, #10B981, #34D399); }
  .chart-bar.expense { background: linear-gradient(to top, #EF4444, #F87171); }
  .chart-bar-label { font-size: 0.68rem; font-weight: 700; color: var(--gray-500); margin-top: 0.5rem; text-align: center; }
  
  .donut-wrap { display: flex; align-items: center; gap: 2rem; }
  .donut-legend { display: flex; flex-direction: column; gap: 0.5rem; }
  .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; font-weight: 600; color: var(--gray-600); }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; }

  /* Tooltip styling for SVG chart */
  .chart-tooltip {
    position: absolute; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%);
    background: var(--dark); color: white; padding: 0.25rem 0.5rem; border-radius: 4px;
    font-size: 0.65rem; white-space: nowrap; visibility: hidden; opacity: 0; transition: var(--transition);
  }
  .chart-bar:hover .chart-tooltip { visibility: visible; opacity: 1; }

  /* ── ADMIN DASHBOARD HOME ── */
  .admin-dash-hero {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    border-radius: var(--radius); padding: 2rem; color: white; margin-bottom: 2rem;
  }
  .admin-dash-hero h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 0.25rem; }
  .admin-dash-hero p { font-size: 0.9rem; color: rgba(255,255,255,0.75); }
  
  .admin-widgets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
  .widget-card {
    background: white; border: 1px solid var(--gray-200); border-radius: var(--radius);
    padding: 1.5rem; display: flex; align-items: center; gap: 1rem;
    box-shadow: var(--shadow-sm);
  }
  .widget-icon {
    width: 50px; height: 50px; border-radius: 12px; background: rgba(27,58,107,0.08);
    display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--primary);
  }
  .widget-info h4 { font-size: 0.72rem; font-weight: 700; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.08em; }
  .widget-info p { font-size: 1.4rem; font-weight: 800; color: var(--gray-800); }

  .dash-layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .quick-links-card {
    background: white; border: 1px solid var(--gray-200); border-radius: var(--radius);
    padding: 1.5rem; box-shadow: var(--shadow-sm);
  }
  .quick-links-card h3 { font-size: 1.05rem; font-weight: 800; margin-bottom: 1rem; border-bottom: 1px solid var(--gray-100); padding-bottom: 0.75rem; }
  .quick-btn-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .quick-btn {
    padding: 0.85rem 1rem; background: var(--gray-50); border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm); cursor: pointer; text-align: left; font-weight: 700;
    font-size: 0.85rem; color: var(--gray-700); transition: var(--transition);
    display: flex; align-items: center; gap: 0.5rem;
  }
  .quick-btn:hover { background: var(--primary); color: white; border-color: var(--primary); transform: translateY(-2px); }

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
    .charts-grid { grid-template-columns: 1fr; }
    .dash-layout-grid { grid-template-columns: 1fr; }
    .admin-widgets { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .nav { padding: 0 1.25rem; }
    .nav-center { display: none; }
    .section { padding: 3.5rem 1.25rem; }
    .stats-bar { padding: 2rem 1.25rem; }
    .stats-inner { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .hero-content { padding: 3rem 1.25rem; }
    .hero-arrows { right: 1.25rem; }
    
    /* Responsive Admin Panel */
    .admin-mobile-header { display: flex; }
    .admin-layout { grid-template-columns: 1fr; }
    .admin-sidebar {
      position: fixed; top: 118px; left: -260px; bottom: 0; width: 250px;
      z-index: 100; box-shadow: var(--shadow-lg); background: white;
    }
    .admin-sidebar.open { left: 0; }
    .admin-content { padding: 1.25rem; }
    
    .savings-summary { grid-template-columns: 1fr; }
    .footer-inner { grid-template-columns: 1fr; gap: 2rem; }
    .contact-split { grid-template-columns: 1fr; }
    .admin-widgets { grid-template-columns: 1fr; }
  }

  /* ── TOAST NOTIFICATION ── */
  .toast-notification {
    position: fixed; top: 24px; right: 24px; z-index: 2000;
    padding: 0.9rem 1.4rem; border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg); font-size: 0.88rem; font-weight: 700;
    display: flex; align-items: center; gap: 0.6rem;
    animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .toast-notification.success { background: #E6F4EA; color: #137333; border-left: 4px solid var(--success); }
  .toast-notification.error { background: #FCE8E6; color: #C5221F; border-left: 4px solid var(--danger); }
  .toast-notification.info { background: #E8F0FE; color: #1A73E8; border-left: 4px solid var(--primary-light); }
  
  @keyframes slideInRight {
    from { transform: translateX(130%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* ── GLASSMORPHIC LOGIN CARD ── */
  .login-card {
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 20px 50px rgba(15, 23, 41, 0.08), 0 1px 3px rgba(0,0,0,0.02);
  }

  /* ── CURATED IMAGE CURATOR ── */
  .curator-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
    max-height: 280px; overflow-y: auto; padding: 0.25rem;
  }
  .curator-item {
    cursor: pointer; border-radius: 8px; overflow: hidden;
    aspect-ratio: 4/3; border: 2px solid transparent; transition: var(--transition);
    position: relative; background: var(--gray-100);
  }
  .curator-item:hover { border-color: var(--primary); transform: translateY(-2px); }
  .curator-img { width: 100%; height: 100%; background-size: cover; background-position: center; }
  .curator-label {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: rgba(15, 23, 41, 0.75); color: white;
    font-size: 0.65rem; font-weight: 600; padding: 0.25rem; text-align: center;
  }

  /* ── ADVANCED FILTERS BAR ── */
  .filters-bar {
    display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;
    background: var(--gray-50); padding: 1rem; border-radius: var(--radius-sm);
    border: 1px solid var(--gray-200); align-items: center;
  }
  .filter-search { flex: 1; min-width: 200px; }
  .filter-select { min-width: 140px; }
`;

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const DEFAULT_SLIDES = [
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
  }
];

const DEFAULT_MISSION = {
  image: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=900&q=80",
  title: "Proclaiming the Gospel, Building Disciples",
  text: "We are committed to sharing the transforming power of the Gospel of Jesus Christ to every person in our community and beyond — one life at a time.",
  points: [
    "Rooted in Scripture and the Word of God",
    "Building a community of genuine disciples",
    "Serving Navarro with love and compassion",
    "Welcoming all people from every walk of life"
  ]
};

const DEFAULT_STATS = {
  members: "200+",
  years: "3+",
  services: "2",
  ministries: "6"
};

const DEFAULT_PRODUCTS = [
  { id: "1", name: "Faithway Signature Shirt", price: 350, description: "Official FBC Navarro logo shirt in premium cotton.", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80", available: true },
  { id: "2", name: "FBC Youth Theme Tee", price: 300, description: "Inspiring youth ministry t-shirt for all ages.", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80", available: true },
  { id: "3", name: "Sunday School Kids Cap", price: 200, description: "Comfortable kids cap with Bible verse embroidery.", image: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&q=80", available: false }
];

const DEFAULT_BIRTHDAYS = [
  { id: "1", name: "Pastor Jayson Jay Magbojos", date: "May 18", photo: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&q=80", message: "Wishing you a blessed birthday, Pastor!" },
  { id: "2", name: "Lorence Almadrigo", date: "May 25", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", message: "Have a wonderful year ahead in the Lord's service!" }
];

const DEFAULT_ACTIVITIES = [
  { id: "1", title: "Sunday Morning Worship", description: "A blessed Sunday morning gathering! Pastor Jayson preached on 'Growing in Grace'. Brother JP led a powerful song service.", date: "2026-05-17", time: "09:00 AM", location: "Main Sanctuary", ministry: "Worship Ministry", image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80" },
  { id: "2", title: "Daily Bread Outreach", description: "Our monthly feeding program in Navarro. We fed 80 children and shared a short Bible story about the Good Samaritan.", date: "2026-05-10", time: "02:00 PM", location: "Barangay Plaza", ministry: "Outreach Ministry", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80" },
  { id: "3", title: "Youth Service & Fellowship", description: "Over 40 youth gathered for a night of praise, small groups, and games. Focus was on peer pressure and biblical principles.", date: "2026-05-03", time: "01:00 PM", location: "2nd Floor Hall", ministry: "Youth Ministry", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80" }
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

const getMonthYear = (dateStr) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = dateStr.split(" ");
      if (parts.length >= 3) return parts[0].slice(0, 3) + " " + parts[2];
      return "Other";
    }
    return d.toLocaleString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "Other";
  }
};

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

// ─── IMAGE CURATOR LIBRARY ───
const CURATED_IMAGES = {
  slides: [
    { label: "Main Worship", url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=85" },
    { label: "Bible Study", url: "https://images.unsplash.com/photo-1504052434569-70ad58565b90?w=1200&q=85" },
    { label: "Fellowship Group", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=85" },
    { label: "Cross & Sunrise", url: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=1200&q=85" },
    { label: "Sunday Communion", url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=1200&q=85" },
    { label: "Worship Sanctuary", url: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=1200&q=85" }
  ],
  activities: [
    { label: "Sunday School", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80" },
    { label: "Daily Outreach", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80" },
    { label: "Youth Gathering", url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80" },
    { label: "Worship Music", url: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=800&q=80" },
    { label: "Worship Praise", url: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80" },
    { label: "Children Ministry", url: "https://images.unsplash.com/photo-1472162072142-d540e139ef43?w=800&q=80" }
  ],
  products: [
    { label: "White Tee Mockup", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80" },
    { label: "Black Tee Mockup", url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&q=80" },
    { label: "Embroidered Hat", url: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&q=80" },
    { label: "Canvas Tote Bag", url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80" },
    { label: "Ceramic Mug", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80" },
    { label: "Journal Notebook", url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&q=80" }
  ],
  celebrants: [
    { label: "Male Portrait", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
    { label: "Female Portrait", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
    { label: "Elderly Male", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" },
    { label: "Elderly Female", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80" },
    { label: "Child Boy", url: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&q=80" },
    { label: "Child Girl", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80" }
  ]
};

function ImageCuratorModal({ type, onSelect, onClose }) {
  const images = CURATED_IMAGES[type] || [];
  return (
    <Modal title="Curated Image Library" onClose={onClose}>
      <div className="curator-grid">
        {images.map((img, i) => (
          <div key={i} className="curator-item" onClick={() => { onSelect(img.url); onClose(); }}>
            <div className="curator-img" style={{ backgroundImage: `url(${img.url})` }} />
            <div className="curator-label">{img.label}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage, isLogged, onLogout }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "activities", label: "Activities" },
    { id: "shop", label: "Shop" },
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
        {isLogged && page === "admin" ? (
          <button className="nav-cta" style={{ background: "var(--danger)" }} onClick={onLogout}>Logout</button>
        ) : (
          <button className="nav-cta" onClick={() => setPage("home")}>Join Us</button>
        )}
      </div>
    </nav>
  );
}

// ─── HERO SLIDESHOW ───────────────────────────────────────────────────────────
function Hero({ slides }) {
  const [current, setCurrent] = useState(0);
  const items = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % items.length), 5500);
    return () => clearInterval(t);
  }, [items.length]);

  const prev = () => setCurrent(c => (c - 1 + items.length) % items.length);
  const next = () => setCurrent(c => (c + 1) % items.length);
  const s = items[current] || items[0];

  return (
    <div className="hero">
      {items.map((sl, i) => (
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
          <button className="btn-hero-primary" onClick={() => {
            const el = document.getElementById("schedule");
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}>Plan Your Visit →</button>
          <a href="https://www.facebook.com/groups/FBCNavarro" target="_blank" rel="noopener noreferrer" className="btn-hero-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Group Fellowship</a>
        </div>
      </div>
      <div className="hero-arrows">
        <button className="hero-arrow" onClick={prev}>‹</button>
        <button className="hero-arrow" onClick={next}>›</button>
      </div>
      <div className="hero-nav">
        {items.map((_, i) => (
          <button key={i} className={`hero-dot${i === current ? " active" : ""}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ announcements, events, slides, mission, stats, birthdays, setPage }) {
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
  const m = mission || DEFAULT_MISSION;
  const st = stats || DEFAULT_STATS;

  return (
    <div className="page">
      <Hero slides={slides} />

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[
            { n: st.members, l: "Church Members" },
            { n: st.years, l: "Years of Ministry" },
            { n: st.services, l: "Sunday Services" },
            { n: st.ministries, l: "Active Ministries" },
          ].map(s => (
            <div key={s.l} className="stat-item">
              <span className="stat-number">{s.n}</span>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Birthday Celebrants Section */}
      {birthdays && birthdays.length > 0 && (
        <div className="section section-alt">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-badge">Celebrations</div>
              <div className="section-title">Happy Birthday! 🎉</div>
              <p className="section-sub">Join us in celebrating our brothers and sisters who have birthdays this month.</p>
            </div>
            <div className="celebrants-grid">
              {birthdays.map(b => (
                <div key={b.id} className="celebrant-card">
                  <div className="celebrant-avatar" style={{ backgroundImage: `url(${b.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'})` }} />
                  <h3>{b.name}</h3>
                  <div className="celebrant-date">🎂 {b.date}</div>
                  {b.message && <p className="celebrant-msg">"{b.message}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mission Section */}
      <div className="section">
        <div className="section-inner">
          <div className="mission-split">
            <div className="mission-img-wrap">
              <div className="mission-img-bg" style={{ backgroundImage: `url(${m.image})` }} />
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
              <h2>{m.title}</h2>
              <p>{m.text}</p>
              <div className="mission-points">
                {m.points.map(pt => (
                  <div key={pt} className="mission-point">
                    <div className="mission-check">✓</div>
                    {pt}
                  </div>
                ))}
              </div>
              <button className="btn btn-accent" onClick={() => setPage("about")}>Learn More About Us →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Ministries */}
      <div className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Our Ministries</div>
            <div className="section-title">Serving Every Season of Life</div>
            <p className="section-sub">From children to seniors, we have a ministry for every member of your family.</p>
          </div>
          <div className="cards-grid">
            {MINISTRIES.map(min => (
              <div key={min.title} className="card">
                <div className="card-icon">{min.icon}</div>
                <div className="card-category">Ministry</div>
                <h3>{min.title}</h3>
                <p>{min.desc}</p>
                <div className="card-meta">🕐 {min.freq}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="section">
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
        <div className="section section-alt">
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
      <div className="section" id="schedule">
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
      <div className="section section-alt">
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
              <li onClick={() => setPage("home")}>Home</li>
              <li onClick={() => setPage("about")}>About Us</li>
              <li onClick={() => setPage("activities")}>Activities</li>
              <li onClick={() => setPage("shop")}>Shop</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Ministries</h4>
            <ul className="footer-links">
              {MINISTRIES.map(min => (
                <li key={min.title}>{min.title}</li>
              ))}
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
function AboutPage({ setPage }) {
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
              <li onClick={() => setPage("home")}>Home</li>
              <li onClick={() => setPage("about")}>About Us</li>
              <li onClick={() => setPage("activities")}>Activities</li>
              <li onClick={() => setPage("shop")}>Shop</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Ministries</h4>
            <ul className="footer-links">
              {MINISTRIES.map(min => (
                <li key={min.title}>{min.title}</li>
              ))}
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

// ─── ACTIVITIES PAGE ───────────────────────────────────────────────────────────
function ActivitiesPage({ activities, setPage }) {
  const [filter, setFilter] = useState("all");
  const actList = activities && activities.length > 0 ? activities : DEFAULT_ACTIVITIES;
  const filtered = filter === "all" ? actList : actList.filter(a => a.ministry === filter);

  return (
    <div className="page">
      <div className="about-hero">
        <div className="section-badge">Activity Feed</div>
        <h1>Our Church Activities</h1>
        <p style={{ marginTop: "1.1rem" }}>See the latest updates, highlights, and testimonies from our recent Sunday School, Services, and events.</p>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="feed-filters">
            {["all", "Sunday School", "Sunday Service", "Youth Ministry", "Children's Ministry", "Outreach Ministry", "Worship Ministry"].map(cat => (
              <button key={cat} className={`filter-btn${filter === cat ? " active" : ""}`} onClick={() => setFilter(cat)}>
                {cat === "all" ? "All Activities" : cat}
              </button>
            ))}
          </div>

          <div className="feed-container">
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--gray-400)", background: "var(--gray-50)", borderRadius: "var(--radius)" }}>
                No recent activities posted for this category.
              </div>
            ) : (
              filtered.map(act => (
                <div key={act.id} className="feed-post">
                  <div className="feed-post-header">
                    <div className="feed-post-avatar">⛪</div>
                    <div>
                      <h3 className="feed-post-title">{act.title}</h3>
                      <span className="feed-post-meta">📅 {act.date} · 📍 {act.location || "FBC Navarro"} {act.time && `· 🕐 ${act.time}`}</span>
                    </div>
                    {act.ministry && <span className="feed-post-tag">{act.ministry}</span>}
                  </div>
                  <div className="feed-post-body">
                    <p>{act.description}</p>
                    {act.image && (
                      <div className="feed-post-img" style={{ backgroundImage: `url(${act.image})` }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
              <li onClick={() => setPage("home")}>Home</li>
              <li onClick={() => setPage("about")}>About Us</li>
              <li onClick={() => setPage("activities")}>Activities</li>
              <li onClick={() => setPage("shop")}>Shop</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Ministries</h4>
            <ul className="footer-links">
              {MINISTRIES.map(min => (
                <li key={min.title}>{min.title}</li>
              ))}
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

// ─── SHOP PAGE ────────────────────────────────────────────────────────────────
function ShopPage({ products, setPage }) {
  const list = products && products.length > 0 ? products : DEFAULT_PRODUCTS;

  return (
    <div className="page">
      <div className="about-hero">
        <div className="section-badge">Church Store</div>
        <h1>FBC Navarro Store</h1>
        <p style={{ marginTop: "1.1rem" }}>Browse our merchandise. All proceeds support our church ministries and outreach activities.</p>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="products-grid">
            {list.map(p => (
              <div key={p.id} className="product-card">
                <div className="product-image" style={{ backgroundImage: `url(${p.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80'})` }}>
                  {p.available ? (
                    <span className="product-badge in">Available</span>
                  ) : (
                    <span className="product-badge out">Out of stock</span>
                  )}
                </div>
                <div className="product-info">
                  <h3>{p.name}</h3>
                  <p className="product-desc">{p.description}</p>
                  <div className="product-footer">
                    <span className="product-price">{fmtCurrency(p.price)}</span>
                    <a href="https://m.me/FBCNavarro" target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm">Order via Messenger</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              <li onClick={() => setPage("home")}>Home</li>
              <li onClick={() => setPage("about")}>About Us</li>
              <li onClick={() => setPage("activities")}>Activities</li>
              <li onClick={() => setPage("shop")}>Shop</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Ministries</h4>
            <ul className="footer-links">
              {MINISTRIES.map(min => (
                <li key={min.title}>{min.title}</li>
              ))}
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

// ─── ADMIN LOGIN PAGE ──────────────────────────────────────────────────────────
function AdminLoginPage({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === "admin" && pass === "fbcnavarro2024") {
      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="page" style={{ background: "var(--gray-50)" }}>
      <div className="login-overlay">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-icon">🔒</div>
          <h2>Admin Login</h2>
          <p>Sign in to manage the church website and database.</p>
          {error && <div className="tag expense" style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: "8px", fontWeight: "600" }}>{error}</div>}
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Username</label>
            <input className="form-input" value={user} onChange={e => setUser(e.target.value)} placeholder="Enter username" required />
          </div>
          <div className="form-group" style={{ textAlign: "left", position: "relative" }}>
            <label className="form-label">Password</label>
            <input className="form-input" type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter password" required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", bottom: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: "var(--gray-400)" }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          <button type="submit" className="btn btn-full btn-accent" style={{ marginTop: "1rem" }}>Login</button>
        </form>
      </div>
    </div>
  );
}

// ─── ADMIN PANELS ─────────────────────────────────────────────────────────────

// ─── DASHBOARD PANEL ───
function DashboardPanel({ 
  records, setRecords,
  events, setEvents,
  announcements, setAnnouncements,
  birthdays, setBirthdays,
  products, setProducts,
  activities, setActivities,
  slides, setSlides,
  mission, setMission,
  stats, setStats,
  setTab, 
  showToast 
}) {
  const total = records.reduce((s, r) => r.type === "income" ? s + Number(r.amount) : s - Number(r.amount), 0);
  
  // Calculate next event countdown
  const nextEvent = events
    .filter(e => e.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const getDaysCountdown = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days;
  };

  const exportBackup = () => {
    try {
      const data = {
        records,
        events,
        announcements,
        birthdays,
        products,
        activities,
        slides,
        mission,
        stats
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `fbc_navarro_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Database exported successfully!");
    } catch (e) {
      showToast("Error exporting database.", "error");
    }
  };

  const importBackup = (e) => {
    const fileReader = new FileReader();
    if (!e.target.files || e.target.files.length === 0) return;
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = event => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.records) setRecords(parsed.records);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.birthdays) setBirthdays(parsed.birthdays);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.activities) setActivities(parsed.activities);
        if (parsed.slides) setSlides(parsed.slides);
        if (parsed.mission) setMission(parsed.mission);
        if (parsed.stats) setStats(parsed.stats);
        
        showToast("Database restored successfully!");
      } catch (err) {
        showToast("Invalid backup file format.", "error");
      }
    };
  };

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset ALL data to system defaults? This will erase current settings.")) {
      setRecords([]);
      setEvents([]);
      setAnnouncements([]);
      setBirthdays(DEFAULT_BIRTHDAYS);
      setProducts(DEFAULT_PRODUCTS);
      setActivities(DEFAULT_ACTIVITIES);
      setSlides(DEFAULT_SLIDES);
      setMission(DEFAULT_MISSION);
      setStats(DEFAULT_STATS);
      showToast("All data reset to defaults.", "info");
    }
  };

  return (
    <div>
      <div className="admin-dash-hero">
        <h2>Welcome Back, Administrator!</h2>
        <p>Manage church schedules, announcements, activity feed, and track financial savings all in one dashboard.</p>
      </div>

      <div className="admin-widgets">
        <div className="widget-card">
          <div className="widget-icon">₱</div>
          <div className="widget-info">
            <h4>Total Savings</h4>
            <p>{fmtCurrency(total)}</p>
          </div>
        </div>
        <div className="widget-card">
          <div className="widget-icon">📅</div>
          <div className="widget-info">
            <h4>Next Event</h4>
            <p>{nextEvent ? `${getDaysCountdown(nextEvent.date)} Days` : "None Scheduled"}</p>
          </div>
        </div>
        <div className="widget-card">
          <div className="widget-icon">🎂</div>
          <div className="widget-info">
            <h4>Celebrants</h4>
            <p>{birthdays.length}</p>
          </div>
        </div>
        <div className="widget-card">
          <div className="widget-icon">👕</div>
          <div className="widget-info">
            <h4>Shop Products</h4>
            <p>{products.length}</p>
          </div>
        </div>
      </div>

      <div className="dash-layout-grid">
        <div className="quick-links-card">
          <h3>Quick Management Shortcuts</h3>
          <div className="quick-btn-grid">
            <button className="quick-btn" onClick={() => setTab("savings")}>₱ Finance Transactions</button>
            <button className="quick-btn" onClick={() => setTab("content")}>📝 Modify Slider & Mission</button>
            <button className="quick-btn" onClick={() => setTab("activities")}>⛪ Add Past Activity</button>
            <button className="quick-btn" onClick={() => setTab("products")}>👕 Manage Shop Items</button>
            <button className="quick-btn" onClick={() => setTab("birthdays")}>🎂 Add Celebrants</button>
            <button className="quick-btn" onClick={() => setTab("announcements")}>📢 Write Announcement</button>
          </div>
        </div>
        <div className="quick-links-card">
          <h3>Database Backup & Utilities</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "var(--gray-600)" }}>
              <div>🔧 Username: <strong>admin</strong> | 🔑 Pass: <strong>fbcnavarro2024</strong></div>
              <div>📂 Database Storage: <strong>Browser LocalStorage</strong></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button className="btn btn-outline btn-sm" onClick={exportBackup} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>📤 Export Backup</button>
              <label className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", cursor: "pointer", margin: 0, fontWeight: "inherit" }}>
                📥 Import Backup
                <input type="file" accept=".json" onChange={importBackup} style={{ display: "none" }} />
              </label>
            </div>
            <button className="btn btn-danger btn-sm" onClick={resetToDefaults} style={{ width: "100%" }}>⚠️ Reset All to System Defaults</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SAVINGS & FINANCE PANEL ───
function SavingsPanel({ records, setRecords, showToast }) {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ type: "income", amount: "", description: "", category: "", date: "" });
  
  // Advanced UI Filters State
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const categories = ["Tithes & Offerings", "Building Fund", "Missions", "Utilities", "Salaries", "Events", "Outreach", "Other"];

  // Filter records dynamically
  const filteredRecords = records.filter(r => {
    if (filterSearch && !r.description.toLowerCase().includes(filterSearch.toLowerCase()) && !(r.category || "").toLowerCase().includes(filterSearch.toLowerCase())) {
      return false;
    }
    if (filterCategory && r.category !== filterCategory) {
      return false;
    }
    if (filterStartDate && r.date < filterStartDate) {
      return false;
    }
    if (filterEndDate && r.date > filterEndDate) {
      return false;
    }
    return true;
  });

  const total = filteredRecords.reduce((s, r) => r.type === "income" ? s + Number(r.amount) : s - Number(r.amount), 0);
  const totalIn = filteredRecords.filter(r => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
  const totalOut = filteredRecords.filter(r => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
  
  const save = () => {
    if (!form.amount || !form.description) return;
    const recordData = {
      type: form.type,
      amount: Number(form.amount),
      description: form.description,
      category: form.category || "Other",
      date: form.date || today()
    };

    if (editId) {
      setRecords(records.map(r => r.id === editId ? { ...r, ...recordData } : r));
      showToast("Financial record updated successfully!");
    } else {
      setRecords([{ id: newId(), ...recordData, createdAt: today() }, ...records]);
      showToast("Financial record added successfully!");
    }
    closeModal();
  };

  const edit = (r) => {
    setEditId(r.id);
    setForm({
      type: r.type,
      amount: r.amount,
      description: r.description,
      category: r.category || "",
      date: r.date
    });
    setModal(true);
  };

  const remove = (id) => {
    if (window.confirm("Are you sure you want to delete this financial record?")) {
      setRecords(records.filter(x => x.id !== id));
      showToast("Financial record deleted successfully!", "info");
    }
  };

  const closeModal = () => {
    setModal(false);
    setEditId(null);
    setForm({ type: "income", amount: "", description: "", category: "", date: "" });
  };

  // Excel generation using filtered data
  const handleExportExcel = () => {
    const wsData = filteredRecords.map(r => ({
      Date: r.date,
      Type: r.type.toUpperCase(),
      Description: r.description,
      Category: r.category || "N/A",
      "Amount (PHP)": Number(r.amount)
    }));
    
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    
    const summaryData = [
      { Metric: "Filtered Income", Value: totalIn },
      { Metric: "Filtered Expenses", Value: totalOut },
      { Metric: "Filtered Savings Balance", Value: total }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary Statistics");
    
    XLSX.writeFile(wb, `fbc_finance_report_filtered_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast("Excel report exported successfully!");
  };

  // Group transactions for Monthly Bar Chart
  const getChartData = () => {
    const months = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = getMonthYear(d.toISOString().slice(0, 10));
      months[key] = { income: 0, expense: 0 };
    }
    
    filteredRecords.forEach(r => {
      const key = getMonthYear(r.date);
      if (months[key]) {
        if (r.type === "income") {
          months[key].income += Number(r.amount);
        } else {
          months[key].expense += Number(r.amount);
        }
      }
    });

    return Object.entries(months).map(([name, val]) => ({
      name,
      income: val.income,
      expense: val.expense
    }));
  };

  // Group transactions for Expense Pie/Donut Chart
  const getExpenseCategories = () => {
    const cats = {};
    const expenseRecords = filteredRecords.filter(r => r.type === "expense");
    const totalExp = expenseRecords.reduce((s, r) => s + Number(r.amount), 0);
    if (totalExp === 0) return [];
    
    expenseRecords.forEach(r => {
      const c = r.category || "Other";
      cats[c] = (cats[c] || 0) + Number(r.amount);
    });
    
    return Object.entries(cats).map(([name, amount], index) => ({
      name,
      amount,
      percent: (amount / totalExp) * 100,
      color: ["#1B3A6B", "#2D5AA0", "#F59E0B", "#FCD34D", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"][index % 8]
    }));
  };

  const chartData = getChartData();
  const maxVal = Math.max(...chartData.flatMap(d => [d.income, d.expense]), 1000);
  const catData = getExpenseCategories();
  
  // Donut chart stroke dash calculation
  const donutRadius = 50;
  const donutCirc = 2 * Math.PI * donutRadius;
  let accumulatedPercent = 0;

  return (
    <div>
      <div className="admin-header">
        <h2>Church Savings & Finance</h2>
        <div className="admin-actions">
          <button className="btn btn-outline" onClick={handleExportExcel}>📊 Export to Excel</button>
          <button className="btn" onClick={() => setModal(true)}>+ Add Record</button>
        </div>
      </div>

      {/* Advanced UI Filters */}
      <div className="filter-bar" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1rem', 
        background: 'var(--white)', 
        padding: '1.25rem', 
        borderRadius: 'var(--radius)', 
        border: '1px solid var(--gray-200)', 
        marginBottom: '1.5rem', 
        boxShadow: 'var(--shadow-sm)' 
      }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Search Description/Category</label>
          <input className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }} value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Type to search..." />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Category</label>
          <select className="form-select" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Start Date</label>
          <input className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }} type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>End Date</label>
          <input className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }} type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-outline" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', height: '38px', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => {
            setFilterSearch("");
            setFilterCategory("");
            setFilterStartDate("");
            setFilterEndDate("");
          }}>Reset Filters</button>
        </div>
      </div>

      <div className="savings-summary">
        <div className="savings-stat"><div className="savings-stat-label">Savings Balance</div><div className={`savings-stat-value ${total >= 0 ? "positive" : "negative"}`}>{fmtCurrency(total)}</div></div>
        <div className="savings-stat"><div className="savings-stat-label">Total Income</div><div className="savings-stat-value positive">{fmtCurrency(totalIn)}</div></div>
        <div className="savings-stat"><div className="savings-stat-label">Total Expenses</div><div className="savings-stat-value negative">{fmtCurrency(totalOut)}</div></div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Income vs Expense (Last 6 Months)</h3>
          <div className="chart-container-inner">
            {chartData.map(d => {
              const incHeight = (d.income / maxVal) * 150;
              const expHeight = (d.expense / maxVal) * 150;
              return (
                <div key={d.name} className="chart-bar-group">
                  <div className="chart-bar-cols">
                    <div className="chart-bar income" style={{ height: `${incHeight}px` }}>
                      <div className="chart-tooltip">Income: {fmtCurrency(d.income)}</div>
                    </div>
                    <div className="chart-bar expense" style={{ height: `${expHeight}px` }}>
                      <div className="chart-tooltip">Expense: {fmtCurrency(d.expense)}</div>
                    </div>
                  </div>
                  <div className="chart-bar-label">{d.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <h3>Expense Category Breakdown</h3>
          {catData.length === 0 ? (
            <p style={{ color: "var(--gray-400)", fontStyle: "italic", textAlign: "center", paddingTop: "3rem" }}>No expenses logged yet.</p>
          ) : (
            <div className="donut-wrap">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={donutRadius} fill="none" stroke="var(--gray-100)" strokeWidth="18" />
                {catData.map((item, idx) => {
                  const dashOffset = donutCirc - (accumulatedPercent * donutCirc) / 100;
                  const dashArray = `${(item.percent * donutCirc) / 100} ${donutCirc}`;
                  accumulatedPercent += item.percent;
                  return (
                    <circle 
                      key={idx} 
                      cx="60" 
                      cy="60" 
                      r={donutRadius} 
                      fill="none" 
                      stroke={item.color} 
                      strokeWidth="18" 
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 60 60)" 
                    />
                  );
                })}
              </svg>
              <div className="donut-legend">
                {catData.map((c, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: c.color }} />
                    <span>{c.name} ({c.percent.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <table className="data-table">
        <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Action</th></tr></thead>
        <tbody>
          {filteredRecords.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem", fontStyle: "italic" }}>No records match the current filters.</td></tr>
          ) : filteredRecords.map(r => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td><span className={`tag ${r.type}`}>{r.type}</span></td>
              <td>{r.description}</td>
              <td>{r.category}</td>
              <td style={{ fontWeight: 700, color: r.type === "income" ? "var(--success)" : "var(--danger)" }}>
                {r.type === "income" ? "+" : "-"}{fmtCurrency(r.amount)}
              </td>
              <td>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => edit(r)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modal && (
        <Modal title={editId ? "Edit Financial Record" : "Add Financial Record"} onClose={closeModal}
          footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn" onClick={save}>{editId ? "Save Changes" : "Add Record"}</button></>}>
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

// ─── SITE CONTENT PANEL ───
function SiteContentPanel({ slides, setSlides, mission, setMission, stats, setStats }) {
  const [slideList, setSlideList] = useState(slides && slides.length > 0 ? slides : DEFAULT_SLIDES);
  const [missObj, setMissObj] = useState(mission || DEFAULT_MISSION);
  const [stObj, setStObj] = useState(stats || DEFAULT_STATS);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSlides(slideList);
    setMission(missObj);
    setStats(stObj);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSlideChange = (idx, field, value) => {
    const updated = [...slideList];
    updated[idx] = { ...updated[idx], [field]: value };
    setSlideList(updated);
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Modify Site Content</h2>
        <button className="btn" onClick={handleSave}>Save Changes</button>
      </div>

      {saveSuccess && <div className="alert-success">✓ Content changes saved successfully and are now live!</div>}

      {/* Stats Section */}
      <div className="content-edit-section">
        <h3>Church Statistics Counters</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Members Counter</label>
            <input className="form-input" value={stObj.members} onChange={e => setStObj({ ...stObj, members: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Years Ministry</label>
            <input className="form-input" value={stObj.years} onChange={e => setStObj({ ...stObj, years: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Sunday Services</label>
            <input className="form-input" value={stObj.services} onChange={e => setStObj({ ...stObj, services: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Active Ministries</label>
            <input className="form-input" value={stObj.ministries} onChange={e => setStObj({ ...stObj, ministries: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Slide Edit */}
      <div className="content-edit-section">
        <h3>Hero Slide Banners</h3>
        {slideList.map((s, idx) => (
          <div key={idx} className="slide-edit-box">
            <h4>Slide #{idx + 1} Settings</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Slide Image URL</label>
                <input className="form-input" value={s.bg} onChange={e => handleSlideChange(idx, "bg", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Heading Title</label>
                <input className="form-input" value={s.title} onChange={e => handleSlideChange(idx, "title", e.target.value)} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Title Bold Highlight</label>
                <input className="form-input" value={s.titleBold} onChange={e => handleSlideChange(idx, "titleBold", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Slide Subtext Description</label>
                <input className="form-input" value={s.desc} onChange={e => handleSlideChange(idx, "desc", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mission Edit */}
      <div className="content-edit-section">
        <h3>Our Mission Section</h3>
        <div className="form-group">
          <label className="form-label">Mission Image URL</label>
          <input className="form-input" value={missObj.image} onChange={e => setMissObj({ ...missObj, image: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Mission Section Title</label>
          <input className="form-input" value={missObj.title} onChange={e => setMissObj({ ...missObj, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Description Text</label>
          <textarea className="form-textarea" rows={4} value={missObj.text} onChange={e => setMissObj({ ...missObj, text: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// ─── BIRTHDAY CELEBRANTS PANEL ───
function BirthdayCelebrantsPanel({ birthdays, setBirthdays, showToast }) {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showCurator, setShowCurator] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", photo: "", message: "" });

  const save = () => {
    if (!form.name || !form.date) return;
    if (editId) {
      setBirthdays(birthdays.map(b => b.id === editId ? { ...b, ...form } : b));
      showToast("Celebrant updated successfully!");
    } else {
      setBirthdays([{ id: newId(), ...form }, ...birthdays]);
      showToast("Celebrant added successfully!");
    }
    closeModal();
  };

  const edit = (b) => {
    setEditId(b.id);
    setForm({ name: b.name, date: b.date, photo: b.photo || "", message: b.message || "" });
    setModal(true);
  };

  const remove = (id) => {
    if (window.confirm("Are you sure you want to delete this celebrant?")) {
      setBirthdays(birthdays.filter(x => x.id !== id));
      showToast("Celebrant deleted successfully!", "info");
    }
  };

  const closeModal = () => {
    setModal(false);
    setEditId(null);
    setForm({ name: "", date: "", photo: "", message: "" });
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Birthday Celebrants</h2>
        <button className="btn" onClick={() => setModal(true)}>+ Add Celebrant</button>
      </div>

      <table className="data-table">
        <thead><tr><th>Photo</th><th>Name</th><th>Birthday</th><th>Message</th><th>Action</th></tr></thead>
        <tbody>
          {birthdays.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem" }}>No celebrants added yet.</td></tr>
          ) : birthdays.map(b => (
            <tr key={b.id}>
              <td>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundImage: `url(${b.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              </td>
              <td style={{ fontWeight: "700" }}>{b.name}</td>
              <td>{b.date}</td>
              <td style={{ fontStyle: "italic", color: "var(--gray-500)" }}>{b.message || "N/A"}</td>
              <td>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => edit(b)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(b.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <Modal title={editId ? "Edit Celebrant" : "Add Celebrant"} onClose={closeModal}
          footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn" onClick={save}>{editId ? "Save Changes" : "Save Celebrant"}</button></>}>
          <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Celebrant's name" /></div>
          <div className="form-group"><label className="form-label">Birthday (e.g., May 25) *</label><input className="form-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="Month and day" /></div>
          <div className="form-group">
            <label className="form-label">Photo URL</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input className="form-input" value={form.photo} onChange={e => setForm(p => ({ ...p, photo: e.target.value }))} placeholder="Image link" style={{ flex: 1 }} />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCurator(true)}>🖼️ Browse</button>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Personal Message / Verse</label><input className="form-input" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Birthday greetings" /></div>
        </Modal>
      )}

      {showCurator && (
        <ImageCuratorModal 
          type="celebrants" 
          onSelect={url => setForm(p => ({ ...p, photo: url }))} 
          onClose={() => setShowCurator(false)} 
        />
      )}
    </div>
  );
}

// ─── PRODUCTS PANEL ───
function ProductsPanel({ products, setProducts, showToast }) {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showCurator, setShowCurator] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "", image: "", available: true });

  const save = () => {
    if (!form.name || !form.price) return;
    if (editId) {
      setProducts(products.map(p => p.id === editId ? { ...p, ...form, price: Number(form.price) } : p));
      showToast("Product updated successfully!");
    } else {
      setProducts([{ id: newId(), ...form, price: Number(form.price) }, ...products]);
      showToast("Product added successfully!");
    }
    closeModal();
  };

  const edit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, price: p.price, description: p.description || "", image: p.image || "", available: p.available });
    setModal(true);
  };

  const remove = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(x => x.id !== id));
      showToast("Product deleted successfully!", "info");
    }
  };

  const closeModal = () => {
    setModal(false);
    setEditId(null);
    setForm({ name: "", price: "", description: "", image: "", available: true });
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Church Shop Products</h2>
        <button className="btn" onClick={() => setModal(true)}>+ Add Product</button>
      </div>

      <table className="data-table">
        <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Availability</th><th>Description</th><th>Action</th></tr></thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem" }}>No products added.</td></tr>
          ) : products.map(p => (
            <tr key={p.id}>
              <td>
                <div style={{ width: "42px", height: "42px", borderRadius: "8px", backgroundImage: `url(${p.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100&q=80'})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              </td>
              <td style={{ fontWeight: "700" }}>{p.name}</td>
              <td style={{ fontWeight: "700", color: "var(--primary)" }}>{fmtCurrency(p.price)}</td>
              <td>
                <span className={`tag ${p.available ? "income" : "expense"}`}>
                  {p.available ? "In Stock" : "Out of Stock"}
                </span>
              </td>
              <td style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{p.description}</td>
              <td>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => edit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <Modal title={editId ? "Edit Product" : "Add Product"} onClose={closeModal}
          footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn" onClick={save}>{editId ? "Save Changes" : "Save Product"}</button></>}>
          <div className="form-group"><label className="form-label">Product Name *</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="T-shirt, cap, mug, etc." /></div>
          <div className="form-group"><label className="form-label">Price (₱) *</label><input className="form-input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" /></div>
          <div className="form-group">
            <label className="form-label">Product Image URL</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input className="form-input" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Public web link to image" style={{ flex: 1 }} />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCurator(true)}>🖼️ Browse</button>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Short Description</label><textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the material, sizes, etc." /></div>
          <div className="form-group">
            <label className="form-label">Stock Status</label>
            <select className="form-select" value={form.available ? "true" : "false"} onChange={e => setForm(p => ({ ...p, available: e.target.value === "true" }))}>
              <option value="true">In Stock / Available</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>
        </Modal>
      )}

      {showCurator && (
        <ImageCuratorModal 
          type="products" 
          onSelect={url => setForm(p => ({ ...p, image: url }))} 
          onClose={() => setShowCurator(false)} 
        />
      )}
    </div>
  );
}

// ─── ACTIVITIES PANEL ───
function ActivitiesPanel({ activities, setActivities, showToast }) {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showCurator, setShowCurator] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", ministry: "", date: "", time: "", location: "", image: "" });
  
  const save = () => {
    if (!form.title || !form.date) return;
    if (editId) {
      setActivities(activities.map(a => a.id === editId ? { ...a, ...form } : a));
      showToast("Activity updated successfully!");
    } else {
      setActivities([{ id: newId(), ...form, createdAt: today() }, ...activities]);
      showToast("Activity posted successfully!");
    }
    closeModal();
  };

  const edit = (a) => {
    setEditId(a.id);
    setForm({ 
      title: a.title, 
      description: a.description || "", 
      ministry: a.ministry || "", 
      date: a.date, 
      time: a.time || "", 
      location: a.location || "", 
      image: a.image || "" 
    });
    setModal(true);
  };

  const remove = (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      setActivities(activities.filter(x => x.id !== id));
      showToast("Activity deleted successfully!", "info");
    }
  };

  const closeModal = () => {
    setModal(false);
    setEditId(null);
    setForm({ title: "", description: "", ministry: "", date: "", time: "", location: "", image: "" });
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Past Church Activities</h2>
        <button className="btn" onClick={() => setModal(true)}>+ Add Past Activity</button>
      </div>

      <table className="data-table">
        <thead><tr><th>Image</th><th>Title</th><th>Ministry</th><th>Date/Time</th><th>Location</th><th>Action</th></tr></thead>
        <tbody>
          {activities.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem" }}>No activities posted yet.</td></tr>
          ) : activities.map(a => (
            <tr key={a.id}>
              <td>
                <div style={{ width: "42px", height: "42px", borderRadius: "8px", backgroundImage: `url(${a.image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=100&q=80'})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              </td>
              <td><div style={{ fontWeight: 600 }}>{a.title}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>{a.description.slice(0, 50)}...</div></td>
              <td><span className="tag activity">{a.ministry || "General"}</span></td>
              <td>{a.date} {a.time && `· ${a.time}`}</td>
              <td>{a.location}</td>
              <td>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => edit(a)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(a.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <Modal title={editId ? "Edit Past Activity" : "Add Past Activity"} onClose={closeModal}
          footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn" onClick={save}>{editId ? "Save Changes" : "Post Activity"}</button></>}>
          <div className="form-group"><label className="form-label">Activity Title *</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Sunday School Outreach, Youth Camp, etc." /></div>
          <div className="form-group"><label className="form-label">Detailed Description / Testimony *</label><textarea className="form-textarea" rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Tell us about the highlights and what happened." /></div>
          <div className="form-group">
            <label className="form-label">Ministry / Category</label>
            <select className="form-select" value={form.ministry} onChange={e => setForm(p => ({ ...p, ministry: e.target.value }))}>
              <option value="">General</option>
              <option>Sunday School</option>
              <option>Sunday Service</option>
              <option>Youth Ministry</option>
              <option>Children's Ministry</option>
              <option>Outreach Ministry</option>
              <option>Worship Ministry</option>
              <option>Women's Ministry</option>
              <option>Men's Fellowship</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. FBC Sanctuary" /></div>
          
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Activity Cover Image URL
              <button type="button" className="btn btn-outline btn-sm" style={{ padding: '0.1rem 0.5rem', fontSize: '0.75rem', height: 'auto', minHeight: 'unset' }} onClick={() => setShowCurator(true)}>
                Browse Curated Images
              </button>
            </label>
            <input className="form-input" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Public web link to a photo" />
          </div>
        </Modal>
      )}

      {showCurator && (
        <ImageCuratorModal 
          type="activities" 
          onSelect={url => setForm(p => ({ ...p, image: url }))} 
          onClose={() => setShowCurator(false)} 
        />
      )}
    </div>
  );
}

// ─── EVENTS PANEL ───
function EventsPanel({ events, setEvents, showToast }) {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", location: "" });
  
  const save = () => {
    if (!form.title || !form.date) return;
    if (editId) {
      setEvents(events.map(e => e.id === editId ? { ...e, ...form } : e));
      showToast("Event updated successfully!");
    } else {
      setEvents([{ id: newId(), ...form, createdAt: today() }, ...events]);
      showToast("Event created successfully!");
    }
    closeModal();
  };

  const edit = (e) => {
    setEditId(e.id);
    setForm({ title: e.title, description: e.description || "", date: e.date, time: e.time || "", location: e.location || "" });
    setModal(true);
  };

  const remove = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(x => x.id !== id));
      showToast("Event deleted successfully!", "info");
    }
  };

  const closeModal = () => {
    setModal(false);
    setEditId(null);
    setForm({ title: "", description: "", date: "", time: "", location: "" });
  };

  return (
    <div>
      <div className="admin-header"><h2>Upcoming Events</h2><button className="btn" onClick={() => setModal(true)}>+ Add Event</button></div>
      <table className="data-table">
        <thead><tr><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Action</th></tr></thead>
        <tbody>
          {events.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem" }}>No events scheduled yet.</td></tr>
            : events.map(e => (
              <tr key={e.id}>
                <td><div style={{ fontWeight: 600 }}>{e.title}</div>{e.description && <div style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>{e.description}</div>}</td>
                <td>{e.date}</td><td>{e.time}</td><td>{e.location}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => edit(e)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(e.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {modal && (
        <Modal title={editId ? "Edit Event" : "Add Event"} onClose={closeModal}
          footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn" onClick={save}>{editId ? "Save Changes" : "Add Event"}</button></>}>
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

// ─── ANNOUNCEMENTS PANEL ───
function AnnouncementsPanel({ announcements, setAnnouncements, showToast }) {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", body: "" });
  
  const save = () => {
    if (!form.title || !form.body) return;
    if (editId) {
      setAnnouncements(announcements.map(a => a.id === editId ? { ...a, ...form } : a));
      showToast("Announcement updated successfully!");
    } else {
      setAnnouncements([{ id: newId(), ...form, date: today() }, ...announcements]);
      showToast("Announcement posted successfully!");
    }
    closeModal();
  };

  const edit = (a) => {
    setEditId(a.id);
    setForm({ title: a.title, body: a.body });
    setModal(true);
  };

  const remove = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements(announcements.filter(x => x.id !== id));
      showToast("Announcement deleted successfully!", "info");
    }
  };

  const closeModal = () => {
    setModal(false);
    setEditId(null);
    setForm({ title: "", body: "" });
  };

  return (
    <div>
      <div className="admin-header"><h2>Announcements</h2><button className="btn" onClick={() => setModal(true)}>+ Add Announcement</button></div>
      <table className="data-table">
        <thead><tr><th>Title</th><th>Message</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          {announcements.length === 0 ? <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem" }}>No announcements yet.</td></tr>
            : announcements.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.title}</td>
                <td style={{ maxWidth: "300px" }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.body}</div></td>
                <td>{a.date}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => edit(a)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(a.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {modal && (
        <Modal title={editId ? "Edit Announcement" : "Add Announcement"} onClose={closeModal}
          footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn" onClick={save}>{editId ? "Save Changes" : "Post Announcement"}</button></>}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title" /></div>
          <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" rows={5} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Type your announcement here..." /></div>
        </Modal>
      )}
    </div>
  );
}

// ─── NOTES PANEL ───
function NotesPanel({ showToast }) {
  const [notes, setNotes] = useLocalStorage("fbc_notes", []);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", body: "" });
  
  const save = () => {
    if (!form.title || !form.body) return;
    if (editId) {
      setNotes(notes.map(n => n.id === editId ? { ...n, ...form } : n));
      showToast("Note updated successfully!");
    } else {
      setNotes([{ id: newId(), ...form, createdAt: today() }, ...notes]);
      showToast("Note saved successfully!");
    }
    closeModal();
  };

  const edit = (n) => {
    setEditId(n.id);
    setForm({ title: n.title, body: n.body });
    setModal(true);
  };

  const remove = (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes(notes.filter(x => x.id !== id));
      showToast("Note deleted successfully!", "info");
    }
  };

  const closeModal = () => {
    setModal(false);
    setEditId(null);
    setForm({ title: "", body: "" });
  };

  return (
    <div>
      <div className="admin-header"><h2>Notepad</h2><button className="btn" onClick={() => setModal(true)}>+ Add Note</button></div>
      {notes.length === 0 ? <p style={{ color: "var(--gray-400)", fontStyle: "italic" }}>No notes logged yet.</p> : (
        <div className="notes-grid">
          {notes.map(n => (
            <div key={n.id} className="note-card">
              <h4>{n.title}</h4><p>{n.body}</p>
              <div className="note-meta">Added {n.createdAt}</div>
              <div className="note-actions">
                <button className="btn btn-outline btn-sm" onClick={() => edit(n)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(n.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title={editId ? "Edit Note" : "Add Note"} onClose={closeModal}
          footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn" onClick={save}>{editId ? "Save Changes" : "Save Note"}</button></>}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Note title" /></div>
          <div className="form-group"><label className="form-label">Content</label><textarea className="form-textarea" rows={5} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Write your note here..." /></div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN MAIN CONTAINER PAGE ───
function AdminPage({ 
  announcements, setAnnouncements, 
  events, setEvents, 
  slides, setSlides, 
  mission, setMission, 
  stats, setStats,
  birthdays, setBirthdays,
  products, setProducts,
  activities, setActivities,
  records, setRecords,
  showToast
}) {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "content", label: "Site Content", icon: "📝" },
    { id: "savings", label: "Savings & Finance", icon: "₱" },
    { id: "activities", label: "Activities", icon: "⛪" },
    { id: "products", label: "Shop Products", icon: "👕" },
    { id: "birthdays", label: "Birthday Celebrants", icon: "🎂" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "events", label: "Events", icon: "📅" },
    { id: "notes", label: "Notepad", icon: "📋" },
  ];

  const activeLabel = navItems.find(i => i.id === tab)?.label || "";

  return (
    <div className="page" style={{ background: "var(--gray-50)" }}>
      {/* Mobile Sticky Sidebar Header */}
      <div className="admin-mobile-header">
        <span className="admin-mobile-title">{activeLabel}</span>
        <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="admin-badge">Admin Panel</div>
          <div className="admin-topbar-text">Faithway Baptist Church Navarro — Management Console</div>
        </div>
      </div>
      <div className="admin-layout">
        <div className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="admin-sidebar-title">Church Management</div>
          {navItems.map(item => (
            <div key={item.id} className={`admin-nav-item${tab === item.id ? " active" : ""}`} onClick={() => {
              setTab(item.id);
              setSidebarOpen(false);
            }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="admin-content">
          {tab === "dashboard" && (
            <DashboardPanel 
              records={records} setRecords={setRecords}
              events={events} setEvents={setEvents}
              announcements={announcements} setAnnouncements={setAnnouncements}
              birthdays={birthdays} setBirthdays={setBirthdays}
              products={products} setProducts={setProducts}
              activities={activities} setActivities={setActivities}
              slides={slides} setSlides={setSlides}
              mission={mission} setMission={setMission}
              stats={stats} setStats={setStats}
              setTab={setTab} 
              showToast={showToast}
            />
          )}
          {tab === "content" && (
            <SiteContentPanel 
              slides={slides} setSlides={setSlides} 
              mission={mission} setMission={setMission} 
              stats={stats} setStats={setStats} 
              showToast={showToast}
            />
          )}
          {tab === "savings" && (
            <SavingsPanel records={records} setRecords={setRecords} showToast={showToast} />
          )}
          {tab === "activities" && (
            <ActivitiesPanel activities={activities} setActivities={setActivities} showToast={showToast} />
          )}
          {tab === "products" && (
            <ProductsPanel products={products} setProducts={setProducts} showToast={showToast} />
          )}
          {tab === "birthdays" && (
            <BirthdayCelebrantsPanel birthdays={birthdays} setBirthdays={setBirthdays} showToast={showToast} />
          )}
          {tab === "announcements" && (
            <AnnouncementsPanel announcements={announcements} setAnnouncements={setAnnouncements} showToast={showToast} />
          )}
          {tab === "events" && (
            <EventsPanel events={events} setEvents={setEvents} showToast={showToast} />
          )}
          {tab === "notes" && (
            <NotesPanel showToast={showToast} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APP MAIN ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  
  // Toast Alert State
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Admin Login State
  const [isLogged, setIsLogged] = useState(() => {
    return sessionStorage.getItem("fbc_admin_logged") === "true";
  });

  // Local Storage Data states
  const [announcements, setAnnouncements] = useLocalStorage("fbc_announcements", []);
  const [events, setEvents] = useLocalStorage("fbc_events", []);
  const [records, setRecords] = useLocalStorage("fbc_savings", []);
  const [activities, setActivities] = useLocalStorage("fbc_activities", DEFAULT_ACTIVITIES);
  
  // New Local Storage customizable content states
  const [slides, setSlides] = useLocalStorage("fbc_slides", DEFAULT_SLIDES);
  const [mission, setMission] = useLocalStorage("fbc_mission", DEFAULT_MISSION);
  const [stats, setStats] = useLocalStorage("fbc_church_stats", DEFAULT_STATS);
  const [birthdays, setBirthdays] = useLocalStorage("fbc_birthdays", DEFAULT_BIRTHDAYS);
  const [products, setProducts] = useLocalStorage("fbc_products", DEFAULT_PRODUCTS);

  const handleLogin = () => {
    setIsLogged(true);
    sessionStorage.setItem("fbc_admin_logged", "true");
  };

  const handleLogout = () => {
    setIsLogged(false);
    sessionStorage.removeItem("fbc_admin_logged");
    setPage("home");
  };

  return (
    <>
      <style>{globalStyles}</style>
      <Nav page={page} setPage={setPage} isLogged={isLogged} onLogout={handleLogout} />
      
      {page === "home" && (
        <HomePage 
          announcements={announcements} 
          events={events} 
          slides={slides} 
          mission={mission} 
          stats={stats} 
          birthdays={birthdays}
          setPage={setPage}
        />
      )}
      
      {page === "about" && (
        <AboutPage setPage={setPage} />
      )}
      
      {page === "activities" && (
        <ActivitiesPage activities={activities} setPage={setPage} />
      )}
      
      {page === "shop" && (
        <ShopPage products={products} setPage={setPage} />
      )}
      
      {page === "admin" && (
        isLogged ? (
          <AdminPage 
            announcements={announcements} 
            setAnnouncements={setAnnouncements} 
            events={events} 
            setEvents={setEvents} 
            slides={slides}
            setSlides={setSlides}
            mission={mission}
            setMission={setMission}
            stats={stats}
            setStats={setStats}
            birthdays={birthdays}
            setBirthdays={setBirthdays}
            products={products}
            setProducts={setProducts}
            activities={activities}
            setActivities={setActivities}
            records={records}
            setRecords={setRecords}
            showToast={showToast}
          />
        ) : (
          <AdminLoginPage onLogin={handleLogin} />
        )
      )}
      
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"} {toast.message}
        </div>
      )}
    </>
  );
}
