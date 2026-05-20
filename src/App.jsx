import { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, enableIndexedDbPersistence } from "firebase/firestore";

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

// 🌟 DEFAULT DATA 🌟
const DEFAULT_PAGE_CONTENTS = {
  home: {
    heroTitle: "Welcome to Faithway Baptist Church",
    heroTitleBold: "Navarro",
    heroDesc: "A community rooted in faith, love, and service to God and one another.",
    statsMembers: "200+",
    statsYears: "3+",
    statsServices: "2",
    statsMinistries: "6",
    missionTitle: "Proclaiming the Gospel, Building Disciples",
    missionText: "We are committed to sharing the transforming power of the Gospel of Jesus Christ to every person in our community and beyond - one life at a time.",
    missionPoints: [
      "Rooted in Scripture and the Word of God",
      "Building a community of genuine disciples",
      "Serving Navarro with love and compassion",
      "Welcoming all people from every walk of life"
    ],
    scheduleTitle: "Join Us for Worship",
    scheduleSub: "Our doors are always open. Come and worship with us.",
    scheduleItems: [
      { icon: "⛪", day: "Sunday", name: "Morning Worship", time: "9:00 AM & 12:00 PM", loc: "FBC Navarro Main Sanctuary" },
      { icon: "🔥", day: "Sunday", name: "Youth Service", time: "1:00 PM", loc: "FBC Navarro 2nd Floor" },
      { icon: "📖", day: "Wednesday", name: "Prayer Meeting", time: "7:30 PM", loc: "FBC Navarro / Online" }
    ],
    contactTitle: "We'd Love to Hear From You",
    contactSub: "Have questions? Want to visit? Reach out to us anytime.",
    contactInfoTitle: "Contact Information",
    contactInfoSub: "We're here to help. Reach out through any of the channels below.",
    contactAddress: "Navarro, General Trias, Cavite, Philippines",
    contactServices: "9:00 AM & 12:00 PM",
    contactPhone: "+63 (963) 776-4918",
    contactEmail: "faithwaybaptistnavarro@gmail.com",
    contactFacebook: "FBC Navarro Community Group",
    missionaries: []
  },
  about: {
    heroTitle: "About Faithway Baptist Church Navarro",
    heroSub: "A church built on the Word of God, committed to community, worship, and making disciples for Jesus Christ.",
    storyBadge: "Who We Are",
    storyTitle: "Our Story",
    storyParagraph1: "Faithway Baptist Church Navarro began as a small group of believers in the Navarro community of General Trias, Cavite, united by a shared desire to worship God faithfully and serve their neighbors with love.",
    storyParagraph2: "Over the years, the church has grown into a vibrant congregation deeply rooted in Scripture and passionately committed to the Great Commission. Today, we continue to be a spiritual home for families, youth, and individuals seeking to know and follow Jesus Christ.",
    storyImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80",
    storyPoints: [
      "Southern Baptist denomination",
      "Located in Navarro, General Trias, Cavite",
      "Committed to Scripture and the Great Commission",
      "A family-like community where all are welcome"
    ],
    beliefsTitle: "What We Believe",
    beliefsSub: "Our faith is grounded in the eternal truths of God's Word.",
    beliefsItems: [
      { title: "The Bible", text: "We believe the Holy Bible is the inspired, inerrant, and authoritative Word of God - the supreme standard for all faith and conduct." },
      { title: "The Trinity", text: "We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit, co-equal and co-eternal." },
      { title: "Salvation", text: "We believe salvation is by grace alone, through faith alone, in Christ alone - not by works, but as a gift from God." },
      { title: "The Church", text: "We believe the local church is a body of baptized believers who gather regularly for worship, instruction, fellowship, and service." },
      { title: "Baptism", text: "We practice believer's baptism by immersion as a public declaration of faith and identification with Christ's death and resurrection." },
      { title: "The Lord's Supper", text: "We observe the Lord's Supper as a memorial of Christ's sacrifice, proclaiming His death until He comes." }
    ],
    staffTitle: "Our Staff",
    staffItems: [
      { emoji: "👨‍💼", name: "Pastor Jayson Jay Magbojos", role: "Senior Pastor" },
      { emoji: "🤵", name: "Lorence Almadrigo", role: "Young Professional President" },
      { emoji: "🎤", name: "John Paul Llona", role: "Song Leader" },
      { emoji: "🍳", name: "Mr. & Mrs. Llona", role: "Kitchen Ministry Heads" }
    ],
    infoTitle: "General Information",
    infoItems: [
      { key: "Denomination", val: "Southern Baptist" },
      { key: "Location", val: "Navarro, General Trias, Cavite" },
      { key: "Address", val: "Navarro, General Trias, Cavite 4107" },
      { key: "Sunday Worship", val: "9:00 AM & 12:00 PM" },
      { key: "Youth Service", val: "Sunday 1:00 PM" },
      { key: "Wednesday Bible Study", val: "7:30 PM" },
      { key: "Contact", val: "faithwaybaptistnavarro@gmail.com" },
      { key: "Phone", val: "+63 (963) 776-4918" }
    ]
  },
  activities: {
    heroTitle: "Our Church Activities",
    heroSub: "See the latest updates, highlights, and testimonies from our recent Sunday School, Services, and events.",
    birthdaysTitle: "Happy Birthday! 🎂🎉",
    birthdaysSub: "Join us in celebrating our brothers and sisters who have birthdays this month."
  },
  shop: {
    heroTitle: "Our Products",
    heroSub: "Browse our merchandise. All proceeds support our church ministries and outreach activities."
  }
};

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
  text: "We are committed to sharing the transforming power of the Gospel of Jesus Christ to every person in our community and beyond - one life at a time.",
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
  { id: "1", name: "Faithway Signature Shirt", price: 350, description: "Official FBC Navarro logo shirt in premium cotton.", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80", available: true, sizes: "S, M, L, XL", stock: 15 },
  { id: "2", name: "FBC Youth Theme Tee", price: 300, description: "Inspiring youth ministry t-shirt for all ages.", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80", available: true, sizes: "S, M, L", stock: 20 },
  { id: "3", name: "Sunday School Kids Cap", price: 200, description: "Comfortable kids cap with Bible verse embroidery.", image: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&q=80", available: false, sizes: "One Size", stock: 0 }
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

const DEFAULT_MINISTRIES = [
  { id: "1", icon: "👶", title: "Children's Ministry", desc: "Nurturing faith in children ages 0-12 through age-appropriate Bible teaching and worship.", freq: "Every Sunday" },
  { id: "2", icon: "🔥", title: "Youth Ministry", desc: "Discipling teenagers through teaching, fellowship, camps, and service opportunities.", freq: "Sunday & Friday" },
  { id: "3", icon: "👨‍👩‍👧‍👦", title: "Men's Fellowship", desc: "Encouraging men to grow in Christlikeness through accountability groups and service.", freq: "Monthly" },
  { id: "4", icon: "👩", title: "Women's Ministry", desc: "Building up women in faith through Bible studies, prayer, mentorship, and fellowship.", freq: "Weekly" },
  { id: "5", icon: "🎤", title: "Worship Ministry", desc: "Leading the congregation in heartfelt, Scripture-centered worship through music and song.", freq: "Every Sunday" },
  { id: "6", icon: "🤝", title: "Outreach Ministry", desc: "Extending the love of Christ through community service, evangelism, and missions support.", freq: "Monthly" },
];

const MINISTRIES = DEFAULT_MINISTRIES;


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
const handleLocalImageUpload = (e, callback, showToast) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith("image/")) {
    showToast("Please upload an image file.", "error");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      
      const MAX_SIZE = 800;
      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      // Determine if image format supports transparency (PNG, GIF, WEBP)
      const isTransparent = file.type === "image/png" || file.type === "image/gif" || file.type === "image/webp";
      
      if (isTransparent) {
        ctx.clearRect(0, 0, width, height);
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Keep transparent image as native mime type to preserve transparency
      const base64 = isTransparent ? canvas.toDataURL(file.type) : canvas.toDataURL("image/jpeg", 0.75);
      callback(base64);
    };
    img.src = event.target.result;
  };
  reader.onerror = () => {
    showToast("Failed to read image file.", "error");
  };
  reader.readAsDataURL(file);
};

const obfuscate = (str) => {
  if (!str) return "";
  const key = 42;
  let result = "";
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key);
  }
  return btoa(unescape(encodeURIComponent(result)));
};

const deobfuscate = (str) => {
  if (!str) return "";
  try {
    const decoded = decodeURIComponent(escape(atob(str)));
    const key = 42;
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key);
    }
    return result;
  } catch (e) {
    return "";
  }
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

function Nav({ page, setPage, isLogged, onLogout, brandSettings }) {
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
        <div className="nav-logo-icon" style={brandSettings?.logoType === "image" ? { background: "transparent", border: "none", boxShadow: "none", width: "48px", height: "48px" } : {}}>
          {brandSettings?.logoType === "image" && brandSettings?.logoImage ? (
            <img src={brandSettings.logoImage} alt="Logo" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
          ) : (
            brandSettings?.logoEmoji || "✝️"
          )}
        </div>
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
function HomePage({ announcements, events, slides, mission, stats, birthdays, ministries, setPage, brandSettings, pageContents, inquiries, setInquiries, showToast }) {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleContact = () => {
    if (!contactForm.name || !contactForm.message) return;
    
    // Save to inquiries state
    const targetEmail = brandSettings?.inquiryEmail || "lorence.almadrigo@gmail.com";
    const newInq = {
      id: newId(),
      name: contactForm.name,
      email: contactForm.email || "N/A",
      message: contactForm.message,
      date: today(),
      status: "unread"
    };
    setInquiries([newInq, ...inquiries]);
    
    // Open system mail client with pre-filled content
    const subject = encodeURIComponent("Inquiry from Faithway Church Website");
    const body = encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\nMessage: ${contactForm.message}`);
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    
    showToast(`Inquiry sent to ${targetEmail} and logged!`);
    setContactForm({ name: "", email: "", message: "" });
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const upcomingEvents = events.filter(e => e.date >= new Date().toISOString().slice(0, 10)).slice(0, 6);
  const latestAnnouncements = announcements.slice(0, 6);
  const m = mission || DEFAULT_MISSION;
  const st = stats || DEFAULT_STATS;
  const home = pageContents?.home || {};

  return (
    <div className="page">
      <Hero slides={slides} />

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[
            { n: home.statsMembers || st.members, l: "Church Members" },
            { n: home.statsYears || st.years, l: "Years of Ministry" },
            { n: home.statsServices || st.services, l: "Sunday Services" },
            { n: home.statsMinistries || st.ministries, l: "Active Ministries" },
          ].map(s => (
            <div key={s.l} className="stat-item">
              <span className="stat-number">{s.n}</span>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="section">
        <div className="section-inner">
          <div className="mission-split">
            <div className="mission-img-wrap" style={{ minHeight: "360px", overflow: "hidden", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15462.433890250005!2d120.87114620000002!3d14.334771149999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33962d3a3d5386c9%3A0xc3b8602b9e672f2e!2sNavarro%2C%20General%20Trias%2C%20Cavite!5e0!3m2!1sen!2sph!4v1716200000000!5m2!1sen!2sph" 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: "360px", display: "block" }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Faithway Baptist Church Navarro Location"
              />
            </div>
            <div className="mission-text">
              <div className="section-badge">Our Mission</div>
              <h2>{home.missionTitle || m.title}</h2>
              <p>{home.missionText || m.text}</p>
              <div className="mission-points">
                {(home.missionPoints || m.points).map(pt => (
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

      {/* Missionaries Section */}
      {(home.missionaries || []).length > 0 && (
        <div className="section section-alt">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-badge">Missions</div>
              <div className="section-title">Supported Missionaries</div>
              <p className="section-sub">Partnering with faithful servants spreading the Gospel across fields and nations.</p>
            </div>
            <div className="celebrants-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
              {(home.missionaries || []).map((m, idx) => (
                <div key={idx} className="celebrant-card" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }}>
                  <div className="celebrant-avatar" style={{ backgroundImage: `url(${m.photo || 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&q=80'})`, borderRadius: "12px" }} />
                  <h3>{m.name}</h3>
                  <div className="celebrant-date" style={{ color: "var(--primary)", fontWeight: "600" }}>{m.field}</div>
                  {m.description && <p className="celebrant-msg" style={{ fontSize: "0.82rem", marginTop: "0.5rem" }}>"{m.description}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ministries */}
      <div className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Our Ministries</div>
            <div className="section-title">Serving Every Season of Life</div>
            <p className="section-sub">From children to seniors, we have a ministry for every member of your family.</p>
          </div>
          <div className="cards-grid">
            {(ministries || MINISTRIES).map(min => (
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
            <div className="section-title">{home.scheduleTitle || "Weekly Schedule"}</div>
            <p className="section-sub">{home.scheduleSub || "Our doors are always open. Come and worship with us."}</p>
          </div>
          <div className="schedule-grid">
            {(home.scheduleItems || [
              { icon: "☀️", day: "Sunday", name: "Morning Worship", time: "9:00 AM & 12:00 PM", loc: "FBC Navarro Main Sanctuary" },
              { icon: "🙏", day: "Sunday", name: "Youth Service", time: "1:00 PM", loc: "FBC Navarro 2nd Floor" },
              { icon: "📖", day: "Wednesday", name: "Prayer Meeting", time: "7:30 PM", loc: "FBC Navarro / Online" },
            ]).map(s => (
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
            <div className="section-title">{home.contactTitle || "We'd Love to Hear From You"}</div>
            <p className="section-sub">{home.contactSub || "Have questions? Want to visit? Reach out to us anytime."}</p>
          </div>
          <div className="contact-split">
            <div className="contact-info-card">
              <h3>{home.contactInfoTitle || "Contact Information"}</h3>
              <p>{home.contactInfoSub || "We're here to help. Reach out through any of the channels below."}</p>
              {[
                { icon: "📍", label: "Address", value: home.contactAddress || "Navarro, General Trias, Cavite, Philippines" },
                { icon: "🕐", label: "Sunday Services", value: home.contactServices || "9:00 AM & 12:00 PM" },
                { icon: "📞", label: "Phone", value: home.contactPhone || "+63 (963) 776-4918" },
                { icon: "✉️", label: "Email", value: home.contactEmail || "faithwaybaptistnavarro@gmail.com" },
                { icon: "👥", label: "Facebook", value: home.contactFacebook || "FBC Navarro Community Group" },
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
              {sent && <div className="alert-success">✓ Message logged and sent! We will get back to you soon.</div>}
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
              <div className="footer-logo-icon" style={brandSettings?.logoType === "image" ? { background: "transparent", border: "none", boxShadow: "none", width: "48px", height: "48px" } : {}}>
                {brandSettings?.logoType === "image" && brandSettings?.logoImage ? (
                  <img src={brandSettings.logoImage} alt="Logo" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
                ) : (
                  brandSettings?.logoEmoji || "✝️"
                )}
              </div>
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
              {(ministries || MINISTRIES).map(min => (
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
function AboutPage({ setPage, brandSettings, pageContents, ministries }) {
  const about = pageContents?.about || {};
  return (
    <div className="page">
      <div className="about-hero">
        <div className="section-badge">Established in Faith</div>
        <h1>{about.heroTitle || "About Faithway Baptist Church Navarro"}</h1>
        <p style={{ marginTop: "1.1rem" }}>{about.heroSub || "A church built on the Word of God, committed to community, worship, and making disciples for Jesus Christ."}</p>
      </div>

      <div className="section section-alt">
        <div className="section-inner">
          <div className="mission-split">
            <div className="mission-img-wrap">
              <div className="mission-img-bg" style={{ backgroundImage: `url(${about.storyImage || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80'})` }} />
            </div>
            <div className="mission-text">
              <div className="section-badge">{about.storyBadge || "Who We Are"}</div>
              <h2>{about.storyTitle || "Our Story"}</h2>
              <p>{about.storyParagraph1 || "Faithway Baptist Church Navarro began as a small group of believers in the Navarro community of General Trias, Cavite, united by a shared desire to worship God faithfully and serve their neighbors with love."}</p>
              <p>{about.storyParagraph2 || "Over the years, the church has grown into a vibrant congregation deeply rooted in Scripture and passionately committed to the Great Commission. Today, we continue to be a spiritual home for families, youth, and individuals seeking to know and follow Jesus Christ."}</p>
              <div className="mission-points">
                {(about.storyPoints || [
                  "Southern Baptist denomination",
                  "Located in Navarro, General Trias, Cavite",
                  "Committed to Scripture and the Great Commission",
                  "A family-like community where all are welcome"
                ]).map(pt => (
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
            <div className="section-badge">Our Doctrine</div>
            <div className="section-title">{about.beliefsTitle || "What We Believe"}</div>
            <p className="section-sub">{about.beliefsSub || "Our faith is grounded in the eternal truths of God's Word."}</p>
          </div>
          <div className="beliefs-grid">
            {(about.beliefsItems || [
              { title: "The Bible", text: "We believe the Holy Bible is the inspired, inerrant, and authoritative Word of God — the supreme standard for all faith and conduct." },
              { title: "The Trinity", text: "We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit, co-equal and co-eternal." },
              { title: "Salvation", text: "We believe salvation is by grace alone, through faith alone, in Christ alone — not by works, but as a gift from God." },
              { title: "The Church", text: "We believe the local church is a body of baptized believers who gather regularly for worship, instruction, fellowship, and service." },
              { title: "Baptism", text: "We practice believer's baptism by immersion as a public declaration of faith and identification with Christ's death and resurrection." },
              { title: "The Lord's Supper", text: "We observe the Lord's Supper as a memorial of Christ's sacrifice, proclaiming His death until He comes." }
            ]).map(b => (
              <div key={b.title} className="belief-card">
                <h3>{b.title}</h3>
                <p>{b.text}</p>
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
            {(ministries || MINISTRIES).map(m => (
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

      {/* Church Leadership Section */}
      {(about.staffItems !== undefined ? about.staffItems : [
        { emoji: "✝️", name: "Pastor Jayson Jay Magbojos", role: "Senior Pastor" },
        { emoji: "📖", name: "Lorence Almadrigo", role: "Young Professional President" },
        { emoji: "🎵", name: "John Paul Llona", role: "Song Leader" },
        { emoji: "🙏", name: "Mr. & Mrs. Llona", role: "Kitchen Ministry Heads" }
      ]).length > 0 && (
        <div className="section">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-badge">Church Leadership</div>
              <div className="section-title">{about.staffTitle || "Our Staff"}</div>
            </div>
            <div className="staff-grid">
              {(about.staffItems !== undefined ? about.staffItems : [
                { emoji: "✝️", name: "Pastor Jayson Jay Magbojos", role: "Senior Pastor" },
                { emoji: "📖", name: "Lorence Almadrigo", role: "Young Professional President" },
                { emoji: "🎵", name: "John Paul Llona", role: "Song Leader" },
                { emoji: "🙏", name: "Mr. & Mrs. Llona", role: "Kitchen Ministry Heads" }
              ]).map(s => (
                <div key={s.name} className="staff-card">
                  <div className="staff-avatar">{s.emoji || "👤"}</div>
                  <div className="staff-name">{s.name}</div>
                  <div className="staff-role">{s.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Church Information</div>
            <div className="section-title">{about.infoTitle || "General Information"}</div>
          </div>
          <div className="info-table" style={{ maxWidth: "620px", margin: "0 auto" }}>
            {(about.infoItems || [
              { key: "Denomination", val: "Southern Baptist" },
              { key: "Location", val: "Navarro, General Trias, Cavite" },
              { key: "Address", val: "Navarro, General Trias, Cavite 4107" },
              { key: "Sunday Worship", val: "9:00 AM & 12:00 PM" },
              { key: "Youth Service", val: "Sunday 1:00 PM" },
              { key: "Wednesday Bible Study", val: "7:30 PM" },
              { key: "Contact", val: "faithwaybaptistnavarro@gmail.com" },
              { key: "Phone", val: "+63 (963) 776-4918" }
            ]).map(item => (
              <div key={item.key} className="info-row">
                <div className="info-key">{item.key}</div>
                <div className="info-val">{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <div className="footer-logo-icon" style={brandSettings?.logoType === "image" ? { background: "transparent", border: "none", boxShadow: "none", width: "48px", height: "48px" } : {}}>
                {brandSettings?.logoType === "image" && brandSettings?.logoImage ? (
                  <img src={brandSettings.logoImage} alt="Logo" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
                ) : (
                  brandSettings?.logoEmoji || "✝️"
                )}
              </div>
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
              {(ministries || MINISTRIES).map(min => (
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

// ─── ACTIVITY SLIDESHOW ───────────────────────────────────────────────────────
function ActivitySlideshow({ images }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;

  const next = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  };
  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  return (
    <div className="activity-slideshow" style={{ position: "relative", width: "100%", height: "380px", borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      {images.map((img, i) => (
        <div
          key={i}
          className="activity-slide"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.6s ease-in-out",
            zIndex: i === current ? 1 : 0
          }}
        />
      ))}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(15,23,41,0.65)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              transition: "background 0.2s"
            }}
          >
            ‹
          </button>
          <button
            onClick={next}
            style={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(15,23,41,0.65)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              transition: "background 0.2s"
            }}
          >
            ›
          </button>
          <div style={{ position: "absolute", bottom: "1rem", left: "0", right: "0", display: "flex", justifyContent: "center", gap: "0.5rem", zIndex: 10 }}>
            {images.map((_, i) => (
              <span
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                style={{
                  width: i === current ? "20px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i === current ? "var(--accent)" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  transition: "var(--transition)"
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ACTIVITIES PAGE ───────────────────────────────────────────────────────────
function ActivitiesPage({ activities, setPage, brandSettings, pageContents, birthdays, ministries }) {
  const [filter, setFilter] = useState("all");
  const actList = activities && activities.length > 0 ? activities : DEFAULT_ACTIVITIES;
  const filtered = filter === "all" ? actList : actList.filter(a => a.ministry === filter);
  const birthdaysList = birthdays || [];
  const acts = pageContents?.activities || {};

  return (
    <div className="page">
      <div className="about-hero">
        <div className="section-badge">Activity Feed</div>
        <h1>{acts.heroTitle || "Our Church Activities"}</h1>
        <p style={{ marginTop: "1.1rem" }}>{acts.heroSub || "See the latest updates, highlights, and testimonies from our recent Sunday School, Services, and events."}</p>
      </div>

      {/* Birthday Celebrants Section */}
      {birthdaysList.length > 0 && (
        <div className="section section-alt" style={{ paddingBottom: "2rem" }}>
          <div className="section-inner">
            <div className="section-header" style={{ marginBottom: "2rem" }}>
              <div className="section-badge">Celebrations</div>
              <div className="section-title">{acts.birthdaysTitle || "Happy Birthday! 🎉"}</div>
              <p className="section-sub">{acts.birthdaysSub || "Join us in celebrating our brothers and sisters who have birthdays this month."}</p>
            </div>
            <div className="celebrants-grid">
              {birthdaysList.map(b => (
                <div key={b.id} className="celebrant-card" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }}>
                  <div className="celebrant-avatar" style={{ backgroundImage: `url(${b.photo || 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&q=80'})` }} />
                  <h3>{b.name}</h3>
                  <div className="celebrant-date">{b.date}</div>
                  {b.message && <p className="celebrant-msg">"{b.message}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                    {act.images && act.images.length > 0 ? (
                      <ActivitySlideshow images={act.images} />
                    ) : act.image ? (
                      <ActivitySlideshow images={[act.image]} />
                    ) : null}
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
              <div className="footer-logo-icon" style={brandSettings?.logoType === "image" ? { background: "transparent", border: "none", boxShadow: "none", width: "48px", height: "48px" } : {}}>
                {brandSettings?.logoType === "image" && brandSettings?.logoImage ? (
                  <img src={brandSettings.logoImage} alt="Logo" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
                ) : (
                  brandSettings?.logoEmoji || "✝️"
                )}
              </div>
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
              {(ministries || MINISTRIES).map(min => (
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
// ════════════════════ SHOP PAGE ════════════════════════════════════════════
function ShopPage({ products, setPage, brandSettings, pageContents, cart, setCart, orders, setOrders, showToast, ministries }) {
  const list = products && products.length > 0 ? products : DEFAULT_PRODUCTS;
  const shop = pageContents?.shop || {};
  const [showCart, setShowCart] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", delivery: "Pick Up", notes: "" });
  const [formError, setFormError] = useState("");

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, image: product.image }];
    });
    showToast(`${product.name} added to cart!`);
  };

  const changeQty = (id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0);
      return updated;
    });
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const handleCheckout = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError("Please fill in Name, Email, and Phone before submitting."); return;
    }
    if (cart.length === 0) { setFormError("Your cart is empty!"); return; }
    setFormError("");

    const orderId = "ORD-" + Date.now();
    const orderDate = new Date().toISOString();
    const newOrder = {
      id: orderId, customerName: form.name.trim(), email: form.email.trim(),
      phone: form.phone.trim(), deliveryOption: form.delivery, notes: form.notes.trim(),
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: cartTotal, date: orderDate, status: "Pending"
    };
    setOrders(prev => {
      const existing = Array.isArray(prev) ? prev : [];
      return [newOrder, ...existing];
    });

    const itemLines = cart.map(i => `  - ${i.name} x${i.qty} @ PHP ${i.price.toFixed(2)} = PHP ${(i.price * i.qty).toFixed(2)}`).join("%0A");
    const subject = encodeURIComponent(`New Order ${orderId} from ${form.name}`);
    const body = encodeURIComponent(
      `Hello FBC Navarro Store,\n\nI'd like to place the following order:\n\nOrder ID: ${orderId}\nDate: ${new Date().toLocaleString()}\n\nItems:\n`
    ) + itemLines + encodeURIComponent(`\n\nOrder Total: PHP ${cartTotal.toFixed(2)}\n\nDelivery Option: ${form.delivery}\nNotes: ${form.notes || "None"}\n\n--- Customer Info ---\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nThank you!`);
    const mailto = `mailto:${brandSettings?.inquiryEmail || ""}?subject=${subject}&body=${body}`;
    window.location.href = mailto;

    setCart([]);
    setCheckoutDone(true);
    showToast("Order submitted! Your email app has been opened with your invoice.", "success");
  };

  return (
    <div className="page">
      <div className="about-hero">
        <div className="section-badge">Church Store</div>
        <h1>{shop.heroTitle || "FBC Navarro Store"}</h1>
        <p style={{ marginTop: "1.1rem" }}>{shop.heroSub || "Browse our merchandise. All proceeds support our church ministries and outreach activities."}</p>
      </div>

      <div className="section">
        <div className="section-inner">
          <div className="products-grid">
            {list.map(p => {
              const cartItem = cart.find(i => i.id === p.id);
              return (
                <div key={p.id} className="product-card">
                  <div className="product-image" style={{ backgroundImage: `url(${p.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80'})` }}>
                    {p.available ? <span className="product-badge in">Available</span> : <span className="product-badge out">Out of stock</span>}
                  </div>
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-footer">
                      <span className="product-price">{fmtCurrency(p.price)}</span>
                      {p.available ? (
                        cartItem ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <button onClick={() => changeQty(p.id, -1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--primary)", background: "transparent", color: "var(--primary)", fontSize: "1.2rem", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <span style={{ fontWeight: "700", minWidth: "24px", textAlign: "center" }}>{cartItem.qty}</span>
                            <button onClick={() => changeQty(p.id, 1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "var(--primary)", color: "white", fontSize: "1.2rem", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                          </div>
                        ) : (
                          <button className="btn btn-accent btn-sm" onClick={() => addToCart(p)}>🛒 Add to Cart</button>
                        )
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button onClick={() => { setShowCart(true); setCheckoutDone(false); }} style={{
          position: "fixed", bottom: "2rem", right: "2rem", zIndex: 999,
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          color: "white", border: "none", borderRadius: "3rem",
          padding: "0.85rem 1.5rem", fontSize: "1rem", fontWeight: "700",
          cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: "0.6rem",
          transition: "transform 0.2s"
        }}>
          🛒 Cart <span style={{ background: "white", color: "var(--primary)", borderRadius: "999px", minWidth: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "800", padding: "0 6px" }}>{cartCount}</span>
        </button>
      )}

      {/* Cart / Checkout Modal */}
      {showCart && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={e => { if (e.target === e.currentTarget) setShowCart(false); }}>
          <div style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", maxWidth: "580px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem" }}>🛒 Your Cart</h2>
              <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--gray-500)" }}>✕</button>
            </div>

            {checkoutDone ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✅</div>
                <h3 style={{ color: "var(--primary)" }}>Order Submitted!</h3>
                <p style={{ color: "var(--gray-600)", marginTop: "0.5rem" }}>Your order has been logged and your email app was opened with the invoice. We'll get back to you soon!</p>
                <button className="btn" style={{ marginTop: "1.5rem" }} onClick={() => setShowCart(false)}>Close</button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                {cart.length === 0 ? (
                  <p style={{ color: "var(--gray-500)", textAlign: "center", padding: "2rem 0" }}>Your cart is empty.</p>
                ) : (
                  <div style={{ marginBottom: "1.5rem" }}>
                    {cart.map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                        {item.image && <img src={item.image} alt={item.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "0.5rem" }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600" }}>{item.name}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>{fmtCurrency(item.price)} each</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <button onClick={() => changeQty(item.id, -1)} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid var(--gray-300)", background: "transparent", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}>−</button>
                          <span style={{ fontWeight: "700", minWidth: "20px", textAlign: "center" }}>{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "none", background: "var(--primary)", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}>+</button>
                        </div>
                        <div style={{ fontWeight: "700", minWidth: "80px", textAlign: "right" }}>{fmtCurrency(item.price * item.qty)}</div>
                        <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer", fontSize: "1rem" }}>🗑️</button>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "1.1rem", padding: "1rem 0 0", borderTop: "2px solid var(--gray-200)", marginTop: "0.5rem" }}>
                      <span>Total</span><span style={{ color: "var(--primary)" }}>{fmtCurrency(cartTotal)}</span>
                    </div>
                  </div>
                )}

                {/* Customer Details Form */}
                <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem", color: "var(--gray-700)" }}>📋 Your Details</h3>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <input className="form-input" placeholder="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  <input className="form-input" type="email" placeholder="Email Address *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  <input className="form-input" placeholder="Phone Number *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  <select className="form-input" value={form.delivery} onChange={e => setForm(f => ({ ...f, delivery: e.target.value }))}>
                    <option>Pick Up</option>
                    <option>Delivery</option>
                  </select>
                  <textarea className="form-input" placeholder="Additional notes (optional)" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: "vertical" }} />
                </div>

                {formError && <p style={{ color: "var(--error, #e53e3e)", fontSize: "0.85rem", marginTop: "0.75rem" }}>{formError}</p>}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCart(false)}>Cancel</button>
                  <button className="btn" style={{ flex: 2, background: "linear-gradient(135deg, var(--primary), var(--accent))" }} onClick={handleCheckout} disabled={cart.length === 0}>
                    ✉️ Submit & Send Invoice
                  </button>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--gray-400)", textAlign: "center", marginTop: "0.75rem" }}>Your email app will open with a pre-filled invoice to send to the church.</p>
              </>
            )}
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <div className="footer-logo-icon" style={brandSettings?.logoType === "image" ? { background: "transparent", border: "none", boxShadow: "none", width: "48px", height: "48px" } : {}}>
                {brandSettings?.logoType === "image" && brandSettings?.logoImage ? (
                  <img src={brandSettings.logoImage} alt="Logo" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
                ) : (brandSettings?.logoEmoji || "⛪")}
              </div>
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
              {(ministries || MINISTRIES).map(min => (<li key={min.title}>{min.title}</li>))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul className="footer-links">
              <li>🕊️ Sunday 9:00 AM</li>
              <li>🕊️ Sunday 12:00 PM</li>
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

// ════════════════════ ORDERS PANEL (ADMIN) ══════════════════════════════════
function OrdersPanel({ orders, setOrders, showToast, inquiryEmail }) {
  const [filter, setFilter] = useState("All");
  const statuses = ["All", "Pending", "Processing", "Shipped", "Cancelled"];
  const statusColors = { Pending: "#f6ad55", Processing: "#63b3ed", Shipped: "#68d391", Cancelled: "#fc8181" };

  const list = Array.isArray(orders) ? orders : [];
  const filtered = filter === "All" ? list : list.filter(o => o.status === filter);

  const updateStatus = (orderId, newStatus) => {
    setOrders(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    });
    showToast(`Order status updated to ${newStatus}`, "success");
  };

  const emailCustomer = (order) => {
    const subject = encodeURIComponent(`Update on your Order ${order.id} — ${order.status}`);
    const body = encodeURIComponent(
      `Dear ${order.customerName},\n\nThank you for your order at FBC Navarro Store!\n\nOrder ID: ${order.id}\nStatus: ${order.status}\n\nItems:\n${(order.items || []).map(i => `  - ${i.name} x${i.qty} @ PHP ${Number(i.price).toFixed(2)}`).join("\n")}\n\nTotal: PHP ${Number(order.total).toFixed(2)}\nDelivery: ${order.deliveryOption}\n\n${order.status === "Shipped" ? "Your order is on its way!" : order.status === "Processing" ? "We are currently processing your order." : order.status === "Cancelled" ? "Unfortunately your order has been cancelled. Please contact us for assistance." : "We have received your order and will be processing it soon."}\n\nGod bless,\nFBC Navarro Store`
    );
    window.open(`mailto:${order.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.25rem" }}>🛒 Store Orders</h2>
        <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>Manage customer orders, update fulfillment status, and communicate via email.</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "0.4rem 1rem", borderRadius: "999px", border: "2px solid",
            borderColor: filter === s ? "var(--primary)" : "var(--gray-200)",
            background: filter === s ? "var(--primary)" : "white",
            color: filter === s ? "white" : "var(--gray-600)",
            fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s"
          }}>{s} {s === "All" ? `(${list.length})` : `(${list.filter(o => o.status === s).length})`}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--gray-400)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p style={{ fontSize: "1.1rem" }}>No {filter === "All" ? "" : filter.toLowerCase() + " "}orders yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map(order => (
            <div key={order.id} className="card" style={{ padding: "1.5rem", borderLeft: `4px solid ${statusColors[order.status] || "#cbd5e0"}` }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "700", fontSize: "1rem" }}>{order.id}</span>
                    <span style={{ padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: "700", background: statusColors[order.status] || "#e2e8f0", color: "#1a202c" }}>{order.status}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>{new Date(order.date).toLocaleString()}</div>
                </div>
                <div style={{ fontWeight: "800", fontSize: "1.2rem", color: "var(--primary)" }}>PHP {Number(order.total).toFixed(2)}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Customer</div>
                  <div style={{ fontWeight: "600" }}>{order.customerName}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>{order.email}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>{order.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Delivery</div>
                  <div style={{ fontWeight: "600" }}>{order.deliveryOption}</div>
                  {order.notes && <div style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>Note: {order.notes}</div>}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Items</div>
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>{item.name} × {item.qty} — PHP {Number(item.price * item.qty).toFixed(2)}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--gray-500)" }}>Update Status:</span>
                {["Pending", "Processing", "Shipped", "Cancelled"].map(s => (
                  <button key={s} onClick={() => updateStatus(order.id, s)} style={{
                    padding: "0.3rem 0.8rem", borderRadius: "999px", border: "1.5px solid",
                    borderColor: order.status === s ? "var(--primary)" : "var(--gray-200)",
                    background: order.status === s ? "var(--primary)" : "transparent",
                    color: order.status === s ? "white" : "var(--gray-600)",
                    fontWeight: "600", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s"
                  }}>{s}</button>
                ))}
                <button onClick={() => emailCustomer(order)} style={{
                  marginLeft: "auto", padding: "0.4rem 1rem", borderRadius: "999px",
                  border: "none", background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  color: "white", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "0.4rem"
                }}>✉️ Email Customer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN LOGIN PAGE ──────────────────────────────────────────────────────────
function AdminLoginPage({ onLogin, adminCredentials, setAdminCredentials, showToast }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Forgot mode recovery states
  const [forgotMode, setForgotMode] = useState(false);
  const [securityAnswerInput, setSecurityAnswerInput] = useState("");
  const [isAnswerVerified, setIsAnswerVerified] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctUser = deobfuscate(adminCredentials?.username) || "admin";
    const correctPass = deobfuscate(adminCredentials?.password) || "fbcnavarro2024";

    if (user.trim() === correctUser && pass.trim() === correctPass) {
      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  };

  const handleVerifyAnswer = (e) => {
    e.preventDefault();
    const correctAnswer = deobfuscate(adminCredentials?.securityAnswer) || "Navarro";
    if (securityAnswerInput.trim().toLowerCase() === correctAnswer.toLowerCase()) {
      setIsAnswerVerified(true);
      setRecoveryError("");
    } else {
      setRecoveryError("Incorrect answer to the security question. Please try again.");
    }
  };

  const handleResetCredentials = (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setRecoveryError("Both username and password are required.");
      return;
    }
    
    // Save to Firestore and localStorage
    setAdminCredentials({
      ...adminCredentials,
      username: obfuscate(newUsername.trim()),
      password: obfuscate(newPassword.trim())
    });

    if (showToast) showToast("Credentials successfully updated! Logging you in...", "success");
    
    // Clean up
    setForgotMode(false);
    setIsAnswerVerified(false);
    setSecurityAnswerInput("");
    setNewUsername("");
    setNewPassword("");
    
    onLogin();
  };

  const handleBackToLogin = () => {
    setForgotMode(false);
    setIsAnswerVerified(false);
    setSecurityAnswerInput("");
    setNewUsername("");
    setNewPassword("");
    setRecoveryError("");
    setError("");
  };

  return (
    <div className="page" style={{ background: "var(--gray-50)" }}>
      <div className="login-overlay">
        {!forgotMode ? (
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
            <div style={{ marginTop: "1.25rem", fontSize: "0.85rem" }}>
              <button type="button" onClick={() => setForgotMode(true)} style={{ background: "none", border: "none", color: "var(--primary-light)", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}>
                Forgot Username or Password?
              </button>
            </div>
          </form>
        ) : (
          <div className="login-card">
            <div className="login-icon">🔑</div>
            <h2>Credentials Recovery</h2>
            <p style={{ marginBottom: "1rem" }}>Answer the security question set by the administrator to reset your credentials.</p>
            
            {recoveryError && <div className="tag expense" style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: "8px", fontWeight: "600" }}>{recoveryError}</div>}

            {!isAnswerVerified ? (
              <form onSubmit={handleVerifyAnswer}>
                <div className="form-group" style={{ textAlign: "left" }}>
                  <label className="form-label" style={{ fontWeight: "600", color: "var(--gray-800)", display: "block", marginBottom: "0.5rem" }}>
                    Security Question:
                  </label>
                  <p style={{ padding: "0.75rem", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", color: "var(--gray-700)", border: "1px solid var(--gray-200)", marginBottom: "1rem", fontWeight: "600" }}>
                    {adminCredentials?.securityQuestion || "What is the name of the church branch location?"}
                  </p>
                  <label className="form-label">Your Answer</label>
                  <input className="form-input" value={securityAnswerInput} onChange={e => setSecurityAnswerInput(e.target.value)} placeholder="Type security answer" required />
                </div>
                <button type="submit" className="btn btn-full btn-accent" style={{ marginTop: "1rem" }}>Verify Answer</button>
              </form>
            ) : (
              <form onSubmit={handleResetCredentials}>
                <div className="tag success" style={{ width: "100%", padding: "0.75rem", marginBottom: "1.25rem", borderRadius: "8px", fontWeight: "600" }}>
                  ✓ Security Answer Verified!
                </div>
                <div className="form-group" style={{ textAlign: "left" }}>
                  <label className="form-label">New Username</label>
                  <input className="form-input" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Enter new username" required />
                </div>
                <div className="form-group" style={{ textAlign: "left", position: "relative" }}>
                  <label className="form-label">New Password</label>
                  <input className="form-input" type={showNewPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" required />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} style={{ position: "absolute", right: "12px", bottom: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: "var(--gray-400)" }}>
                    {showNewPass ? "🙈" : "👁️"}
                  </button>
                </div>
                <button type="submit" className="btn btn-full btn-success" style={{ marginTop: "1rem" }}>Reset & Log In</button>
              </form>
            )}
            
            <button type="button" className="btn btn-full btn-outline" onClick={handleBackToLogin} style={{ marginTop: "0.75rem" }}>
              Back to Login
            </button>
          </div>
        )}
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
  showToast,
  adminCredentials,
  setAdminCredentials
}) {
  const [showCredsEditor, setShowCredsEditor] = useState(false);
  const [formU, setFormU] = useState("");
  const [formP, setFormP] = useState("");
  const [formQ, setFormQ] = useState("");
  const [formA, setFormA] = useState("");
  const [showFormP, setShowFormP] = useState(false);

  const startEditCreds = () => {
    setFormU(deobfuscate(adminCredentials?.username) || "admin");
    setFormP(deobfuscate(adminCredentials?.password) || "fbcnavarro2024");
    setFormQ(adminCredentials?.securityQuestion || "What is the name of the church branch location?");
    setFormA(deobfuscate(adminCredentials?.securityAnswer) || "Navarro");
    setShowCredsEditor(true);
  };

  const handleSaveCreds = (e) => {
    e.preventDefault();
    if (!formU.trim() || !formP.trim() || !formQ.trim() || !formA.trim()) {
      showToast("All security credential fields are required.", "error");
      return;
    }
    setAdminCredentials({
      username: obfuscate(formU.trim()),
      password: obfuscate(formP.trim()),
      securityQuestion: formQ.trim(),
      securityAnswer: obfuscate(formA.trim())
    });
    showToast("Admin credentials updated and encrypted in Firestore!", "success");
    setShowCredsEditor(false);
  };

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
              <div>🔧 Username: <strong style={{ fontFamily: "monospace" }}>{deobfuscate(adminCredentials?.username) || "admin"}</strong></div>
              <div>🔑 Password: <strong style={{ fontFamily: "monospace" }}>•••••••• (Obfuscated in Cloud)</strong></div>
              <div>📂 Database Storage: <strong>Google Firebase Firestore</strong></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button className="btn btn-outline btn-sm" onClick={exportBackup} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>📤 Export Backup</button>
              <label className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", cursor: "pointer", margin: 0, fontWeight: "inherit" }}>
                📥 Import Backup
                <input type="file" accept=".json" onChange={importBackup} style={{ display: "none" }} />
              </label>
            </div>
            <button className="btn btn-outline btn-sm" onClick={startEditCreds} style={{ width: "100%" }}>✏️ Update Login & Recovery Question</button>
            <button className="btn btn-danger btn-sm" onClick={resetToDefaults} style={{ width: "100%" }}>⚠️ Reset All to System Defaults</button>
          </div>

          {showCredsEditor && (
            <div className="modal-overlay" style={{ zIndex: 1000 }}>
              <form className="modal-card" onSubmit={handleSaveCreds} style={{ maxWidth: "450px" }}>
                <div className="modal-header">
                  <h3>Update Security Credentials</h3>
                  <button type="button" className="modal-close" onClick={() => setShowCredsEditor(false)}>×</button>
                </div>
                <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>
                    Configure the administrator login credentials. Values are obfuscated before storage in the live cloud database.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input className="form-input" value={formU} onChange={e => setFormU(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ position: "relative" }}>
                    <label className="form-label">Password</label>
                    <input className="form-input" type={showFormP ? "text" : "password"} value={formP} onChange={e => setFormP(e.target.value)} required />
                    <button type="button" onClick={() => setShowFormP(!showFormP)} style={{ position: "absolute", right: "12px", bottom: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: "var(--gray-400)" }}>
                      {showFormP ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <div className="form-group" style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <label className="form-label">Self-Recovery Security Question</label>
                    <input className="form-input" value={formQ} onChange={e => setFormQ(e.target.value)} placeholder="e.g. What is the name of the church branch location?" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Security Answer</label>
                    <input className="form-input" value={formA} onChange={e => setFormA(e.target.value)} placeholder="Type the answer" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowCredsEditor(false)}>Cancel</button>
                  <button type="submit" className="btn btn-accent">Save Changes</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SAVINGS & FINANCE PANEL ───
function SavingsPanel({ records, setRecords, showToast, onLock }) {
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
          {onLock && (
            <button 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', borderColor: 'var(--red-500)', color: 'var(--red-500)' }} 
              onClick={onLock}
            >
              🔒 Lock Panel
            </button>
          )}
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
function SiteContentPanel({ slides, setSlides, mission, setMission, stats, setStats, pageContents, setPageContents, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState("sections"); // "sections" | "home_page" | "about_page" | "other_pages"
  
  const [slideList, setSlideList] = useState(slides && slides.length > 0 ? slides : DEFAULT_SLIDES);
  const [missObj, setMissObj] = useState(mission || DEFAULT_MISSION);
  const [stObj, setStObj] = useState(stats || DEFAULT_STATS);
  
  // Page Contents Local States
  const [homeForm, setHomeForm] = useState(pageContents?.home || DEFAULT_PAGE_CONTENTS.home);
  const [aboutForm, setAboutForm] = useState(pageContents?.about || DEFAULT_PAGE_CONTENTS.about);
  const [activitiesForm, setActivitiesForm] = useState(pageContents?.activities || DEFAULT_PAGE_CONTENTS.activities);
  const [shopForm, setShopForm] = useState(pageContents?.shop || DEFAULT_PAGE_CONTENTS.shop);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSlides(slideList);
    setMission(missObj);
    setStats(stObj);
    
    // Save page contents
    setPageContents({
      home: homeForm,
      about: aboutForm,
      activities: activitiesForm,
      shop: shopForm
    });
    
    setSaveSuccess(true);
    showToast("All site contents and page text customized successfully!");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSlideChange = (idx, field, value) => {
    const updated = [...slideList];
    updated[idx] = { ...updated[idx], [field]: value };
    setSlideList(updated);
  };

  const subTabs = [
    { id: "sections", label: "Hero & Key Sections" },
    { id: "home_page", label: "Home Page Text" },
    { id: "about_page", label: "About Page Text" },
    { id: "other_pages", label: "Activities & Shop" }
  ];

  return (
    <div>
      <div className="admin-header">
        <h2>Modify Site Content & Texts</h2>
        <button className="btn" onClick={handleSave}>Save Changes</button>
      </div>

      {saveSuccess && <div className="alert-success">✓ Content changes saved successfully and are now live!</div>}

      <div className="feed-filters" style={{ justifyContent: "flex-start", marginBottom: "2rem" }}>
        {subTabs.map(t => (
          <button 
            key={t.id} 
            className={`filter-btn${activeSubTab === t.id ? " active" : ""}`} 
            onClick={() => setActiveSubTab(t.id)}
            style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeSubTab === "sections" && (
        <>
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
                    <label className="form-label">Slide Image (Upload or URL)</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input className="form-input" value={s.bg} onChange={e => handleSlideChange(idx, "bg", e.target.value)} placeholder="Image web URL link..." style={{ flex: 1 }} />
                      <input 
                        type="file" 
                        id={`slide-file-${idx}`} 
                        accept="image/*" 
                        style={{ display: "none" }} 
                        onChange={e => handleLocalImageUpload(e, base64 => {
                          handleSlideChange(idx, "bg", base64);
                          showToast(`Slide #${idx + 1} image uploaded successfully!`);
                        }, showToast)}
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm" 
                        onClick={() => document.getElementById(`slide-file-${idx}`).click()}
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        📂 Upload
                      </button>
                    </div>
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
        </>
      )}

      {activeSubTab === "home_page" && (
        <>
          <div className="content-edit-section">
            <h3>Hero Title and Description</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Hero Title Prefix</label>
                <input className="form-input" value={homeForm.heroTitle} onChange={e => setHomeForm({ ...homeForm, heroTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Hero Title Bold Tagline</label>
                <input className="form-input" value={homeForm.heroTitleBold} onChange={e => setHomeForm({ ...homeForm, heroTitleBold: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hero Subtitle</label>
              <textarea className="form-textarea" rows={2} value={homeForm.heroDesc} onChange={e => setHomeForm({ ...homeForm, heroDesc: e.target.value })} />
            </div>
          </div>

          <div className="content-edit-section">
            <h3>Mission Section Overlay Texts</h3>
            <div className="form-group">
              <label className="form-label">Mission Title</label>
              <input className="form-input" value={homeForm.missionTitle} onChange={e => setHomeForm({ ...homeForm, missionTitle: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Mission Paragraph Text</label>
              <textarea className="form-textarea" rows={3} value={homeForm.missionText} onChange={e => setHomeForm({ ...homeForm, missionText: e.target.value })} />
            </div>
          </div>

          <div className="content-edit-section">
            <h3>Service Schedule Titles</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Weekly Schedule Main Title</label>
                <input className="form-input" value={homeForm.scheduleTitle} onChange={e => setHomeForm({ ...homeForm, scheduleTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Weekly Schedule Subheading</label>
                <input className="form-input" value={homeForm.scheduleSub} onChange={e => setHomeForm({ ...homeForm, scheduleSub: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="content-edit-section">
            <h3>Contact Us Info & Channels</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Contact Block Headline</label>
                <input className="form-input" value={homeForm.contactTitle} onChange={e => setHomeForm({ ...homeForm, contactTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Block Subheading</label>
                <input className="form-input" value={homeForm.contactSub} onChange={e => setHomeForm({ ...homeForm, contactSub: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Address Location</label>
                <input className="form-input" value={homeForm.contactAddress} onChange={e => setHomeForm({ ...homeForm, contactAddress: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Sunday Service Hours</label>
                <input className="form-input" value={homeForm.contactServices} onChange={e => setHomeForm({ ...homeForm, contactServices: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Phone Hotline</label>
                <input className="form-input" value={homeForm.contactPhone} onChange={e => setHomeForm({ ...homeForm, contactPhone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email Address</label>
                <input className="form-input" value={homeForm.contactEmail} onChange={e => setHomeForm({ ...homeForm, contactEmail: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Facebook Community Name</label>
                <input className="form-input" value={homeForm.contactFacebook} onChange={e => setHomeForm({ ...homeForm, contactFacebook: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="content-edit-section">
            <h3>Manage Supported Missionaries</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {(homeForm.missionaries || []).map((m, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "var(--gray-50)", borderRadius: "8px", border: "1px solid var(--gray-200)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundImage: `url(${m.photo || 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=100&q=80'})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--gray-800)" }}>{m.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "500" }}>{m.field}</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm" 
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                    onClick={() => {
                      const updated = (homeForm.missionaries || []).filter((_, i) => i !== idx);
                      setHomeForm({ ...homeForm, missionaries: updated });
                      showToast(`Removed missionary: ${m.name}`);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(homeForm.missionaries || []).length === 0 && (
                <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--gray-400)", fontSize: "0.9rem" }}>No missionaries defined. Use the form below to add one.</div>
              )}
            </div>

            {/* Add New Missionary Form */}
            <div style={{ padding: "1rem", background: "white", border: "1px dashed var(--gray-300)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--gray-700)" }}>Add New Missionary</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input" placeholder="e.g. Bro. Caleb" id="new-missionary-name" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mission Field/Region *</label>
                  <input type="text" className="form-input" placeholder="e.g. Mindanao / Japan" id="new-missionary-field" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                <label className="form-label">Description / Message</label>
                <textarea className="form-textarea" rows={2} placeholder="e.g. Planting churches in rural communities." id="new-missionary-desc" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Photo Upload</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => {
                      const fileInput = e.target;
                      handleLocalImageUpload(e, base64 => {
                        fileInput.dataset.base64 = base64;
                        const previewImg = document.getElementById("new-missionary-preview");
                        if (previewImg) {
                          previewImg.src = base64;
                          previewImg.style.display = "block";
                        }
                        showToast("Missionary photo uploaded!");
                      }, showToast);
                    }}
                    id="new-missionary-file"
                    style={{ fontSize: "0.8rem", width: "100%" }}
                  />
                </div>
                <img 
                  id="new-missionary-preview" 
                  alt="Preview" 
                  style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", display: "none", border: "1px solid var(--gray-200)" }} 
                />
              </div>

              <button 
                type="button" 
                className="btn btn-sm btn-outline" 
                onClick={() => {
                  const nameEl = document.getElementById("new-missionary-name");
                  const fieldEl = document.getElementById("new-missionary-field");
                  const descEl = document.getElementById("new-missionary-desc");
                  const fileEl = document.getElementById("new-missionary-file");
                  
                  const name = nameEl?.value.trim();
                  const field = fieldEl?.value.trim();
                  const description = descEl?.value.trim() || "";
                  const photo = fileEl?.dataset?.base64 || "";
                  
                  if (!name || !field) {
                    showToast("Please fill in Name and Mission Field.", "error");
                    return;
                  }
                  
                  const newItem = { name, field, description, photo };
                  const updated = [...(homeForm.missionaries || []), newItem];
                  setHomeForm({ ...homeForm, missionaries: updated });
                  
                  if (nameEl) nameEl.value = "";
                  if (fieldEl) fieldEl.value = "";
                  if (descEl) descEl.value = "";
                  if (fileEl) {
                    fileEl.value = "";
                    delete fileEl.dataset.base64;
                  }
                  const previewImg = document.getElementById("new-missionary-preview");
                  if (previewImg) {
                    previewImg.src = "";
                    previewImg.style.display = "none";
                  }
                  
                  showToast(`Added missionary: ${name}`);
                }}
              >
                + Add Missionary
              </button>
            </div>
          </div>
        </>
      )}

      {activeSubTab === "about_page" && (
        <>
          <div className="content-edit-section">
            <h3>About Page Hero & Story</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">About Page Hero Title</label>
                <input className="form-input" value={aboutForm.heroTitle} onChange={e => setAboutForm({ ...aboutForm, heroTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">About Page Hero Subtext</label>
                <input className="form-input" value={aboutForm.heroSub} onChange={e => setAboutForm({ ...aboutForm, heroSub: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Story Section Badge</label>
                <input className="form-input" value={aboutForm.storyBadge} onChange={e => setAboutForm({ ...aboutForm, storyBadge: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Story Section Headline</label>
                <input className="form-input" value={aboutForm.storyTitle} onChange={e => setAboutForm({ ...aboutForm, storyTitle: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Story Paragraph #1</label>
              <textarea className="form-textarea" rows={4} value={aboutForm.storyParagraph1} onChange={e => setAboutForm({ ...aboutForm, storyParagraph1: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Story Paragraph #2</label>
              <textarea className="form-textarea" rows={4} value={aboutForm.storyParagraph2} onChange={e => setAboutForm({ ...aboutForm, storyParagraph2: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Story Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => handleLocalImageUpload(e, base64 => {
                  setAboutForm({ ...aboutForm, storyImage: base64 });
                  showToast("Story image uploaded successfully!");
                }, showToast)}
                style={{ fontSize: "0.8rem", width: "100%" }}
              />
              {aboutForm.storyImage && (
                <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>Preview:</span>
                  <img src={aboutForm.storyImage} alt="Story Preview" style={{ width: "120px", height: "70px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--gray-200)" }} />
                </div>
              )}
            </div>
          </div>

          <div className="content-edit-section">
            <h3>Doctrine and Core Beliefs Headers</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Beliefs Headline</label>
                <input className="form-input" value={aboutForm.beliefsTitle} onChange={e => setAboutForm({ ...aboutForm, beliefsTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Beliefs Subtitle</label>
                <input className="form-input" value={aboutForm.beliefsSub} onChange={e => setAboutForm({ ...aboutForm, beliefsSub: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="content-edit-section">
            <h3>Other Section Headers</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Staff & Leadership Headline</label>
                <input className="form-input" value={aboutForm.staffTitle} onChange={e => setAboutForm({ ...aboutForm, staffTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">General Info Table Headline</label>
                <input className="form-input" value={aboutForm.infoTitle} onChange={e => setAboutForm({ ...aboutForm, infoTitle: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="content-edit-section">
            <h3>Manage Church Staff & Roles</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {(aboutForm.staffItems || []).map((staff, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "var(--gray-50)", borderRadius: "8px", border: "1px solid var(--gray-200)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>{staff.emoji || "👤"}</span>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--gray-800)" }}>{staff.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{staff.role}</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm" 
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                    onClick={() => {
                      const updated = (aboutForm.staffItems || []).filter((_, i) => i !== idx);
                      setAboutForm({ ...aboutForm, staffItems: updated });
                      showToast(`Removed staff member: ${staff.name}`);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(aboutForm.staffItems || []).length === 0 && (
                <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--gray-400)", fontSize: "0.9rem" }}>No staff members defined. Use the form below to add one.</div>
              )}
            </div>

            {/* Add New Staff Form */}
            <div style={{ padding: "1rem", background: "white", border: "1px dashed var(--gray-300)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--gray-700)" }}>Add New Staff Member</div>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--gray-500)", display: "block", marginBottom: "0.25rem" }}>Emoji</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="👨‍💼" 
                    id="new-staff-emoji"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--gray-500)", display: "block", marginBottom: "0.25rem" }}>Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. John Doe" 
                    id="new-staff-name"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--gray-500)", display: "block", marginBottom: "0.25rem" }}>Role/Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Youth Leader" 
                    id="new-staff-role"
                  />
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-sm btn-outline" 
                onClick={() => {
                  const emojiEl = document.getElementById("new-staff-emoji");
                  const nameEl = document.getElementById("new-staff-name");
                  const roleEl = document.getElementById("new-staff-role");
                  const emoji = emojiEl?.value.trim() || "👤";
                  const name = nameEl?.value.trim();
                  const role = roleEl?.value.trim() || "Staff";
                  
                  if (!name) {
                    showToast("Please enter a name for the staff member.", "error");
                    return;
                  }
                  
                  const newItem = { emoji, name, role };
                  const updated = [...(aboutForm.staffItems || []), newItem];
                  setAboutForm({ ...aboutForm, staffItems: updated });
                  
                  if (emojiEl) emojiEl.value = "";
                  if (nameEl) nameEl.value = "";
                  if (roleEl) roleEl.value = "";
                  
                  showToast(`Added staff member: ${name}`);
                }}
              >
                + Add Member
              </button>
            </div>
          </div>
        </>
      )}

      {activeSubTab === "other_pages" && (
        <>
          <div className="content-edit-section">
            <h3>Activities Page Header & Birthdays Headline</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Activities Hero Title</label>
                <input className="form-input" value={activitiesForm.heroTitle} onChange={e => setActivitiesForm({ ...activitiesForm, heroTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Activities Hero Subtitle</label>
                <input className="form-input" value={activitiesForm.heroSub} onChange={e => setActivitiesForm({ ...activitiesForm, heroSub: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Birthdays Component Headline</label>
                <input className="form-input" value={activitiesForm.birthdaysTitle} onChange={e => setActivitiesForm({ ...activitiesForm, birthdaysTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Birthdays Component Subtext</label>
                <input className="form-input" value={activitiesForm.birthdaysSub} onChange={e => setActivitiesForm({ ...activitiesForm, birthdaysSub: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="content-edit-section">
            <h3>Shop / Store Page Header</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Shop Page Hero Title</label>
                <input className="form-input" value={shopForm.heroTitle} onChange={e => setShopForm({ ...shopForm, heroTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Shop Page Hero Subtext</label>
                <input className="form-input" value={shopForm.heroSub} onChange={e => setShopForm({ ...shopForm, heroSub: e.target.value })} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MINISTRIES PANEL ───
function MinistriesPanel({ ministries, setMinistries, showToast }) {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ icon: "⛪", title: "", desc: "", freq: "" });

  const list = ministries || [];

  const save = () => {
    if (!form.title || !form.desc || !form.freq) {
      showToast("Please fill out all fields.", "error");
      return;
    }
    if (editId) {
      setMinistries(list.map(m => m.id === editId ? { ...m, ...form } : m));
      showToast("Ministry updated successfully!");
    } else {
      setMinistries([...list, { id: newId(), ...form }]);
      showToast("Ministry added successfully!");
    }
    closeModal();
  };

  const edit = (m) => {
    setEditId(m.id);
    setForm({ icon: m.icon || "⛪", title: m.title, desc: m.desc, freq: m.freq });
    setModal(true);
  };

  const remove = (id) => {
    if (window.confirm("Are you sure you want to delete this ministry?")) {
      setMinistries(list.filter(x => x.id !== id));
      showToast("Ministry deleted successfully!", "info");
    }
  };

  const closeModal = () => {
    setModal(false);
    setEditId(null);
    setForm({ icon: "⛪", title: "", desc: "", freq: "" });
  };

  return (
    <div>
      <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2>⛪ Manage Ministries</h2>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>Add, edit, or remove church ministries displayed on the Home and About pages.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setModal(true)}>+ Add Ministry</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {list.map(m => (
          <div key={m.id || m.title} style={{ padding: "1.25rem", background: "white", borderRadius: "12px", border: "1px solid var(--gray-200)", display: "flex", gap: "1rem", position: "relative" }}>
            <div style={{ fontSize: "2rem", width: "50px", height: "50px", borderRadius: "10px", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
              {m.icon || "⛪"}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "var(--gray-800)" }}>{m.title}</h3>
              <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "500", marginTop: "0.25rem" }}>🕐 {m.freq}</div>
              <p style={{ fontSize: "0.85rem", color: "var(--gray-600)", marginTop: "0.5rem", lineHeight: "1.4" }}>{m.desc}</p>
              
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button className="btn btn-outline btn-sm" onClick={() => edit(m)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(m.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", background: "var(--gray-50)", borderRadius: "12px", border: "1.5px dashed var(--gray-300)", color: "var(--gray-400)" }}>
            No ministries found. Click "+ Add Ministry" to create one.
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editId ? "📝 Edit Ministry" : "➕ Add Ministry"} onClose={closeModal}>
          <div className="form-group">
            <label className="form-label">Icon / Emoji *</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input className="form-input" style={{ width: "60px", textAlign: "center", fontSize: "1.2rem" }} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {["⛪", "👶", "🙌", "🔥", "👨‍💼", "👩‍💼", "📖", "🤝", "🕊️"].map(emoji => (
                  <button key={emoji} type="button" className="btn btn-outline btn-sm" style={{ padding: "0.25rem 0.5rem", fontSize: "1.1rem" }} onClick={() => setForm({ ...form, icon: emoji })}>{emoji}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ministry Title *</label>
            <input className="form-input" placeholder="e.g. Youth Ministry" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Frequency / Schedule *</label>
            <input className="form-input" placeholder="e.g. Every Friday & Sunday" value={form.freq} onChange={e => setForm({ ...form, freq: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" rows={4} placeholder="Describe the ministry's goal and activities..." value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
          </div>

          <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
            <button className="btn btn-accent" onClick={save}>{editId ? "Save Changes" : "Add Ministry"}</button>
          </div>
        </Modal>
      )}
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
            <label className="form-label">Photo Upload</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => handleLocalImageUpload(e, base64 => {
                setForm(p => ({ ...p, photo: base64 }));
                showToast("Celebrant photo uploaded successfully!");
              }, showToast)}
              style={{ fontSize: "0.8rem", width: "100%" }}
            />
            {form.photo && (
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>Preview:</span>
                <img src={form.photo} alt="Celebrant Preview" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%", border: "1px solid var(--gray-200)" }} />
              </div>
            )}
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
            <label className="form-label">Product Image (Upload or URL)</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input className="form-input" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Public web link to image" style={{ flex: 1 }} />
              <input 
                type="file" 
                id="product-file-uploader" 
                accept="image/*" 
                style={{ display: "none" }} 
                onChange={e => handleLocalImageUpload(e, base64 => {
                  setForm(p => ({ ...p, image: base64 }));
                  showToast("Product image uploaded successfully!");
                }, showToast)}
              />
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={() => document.getElementById("product-file-uploader").click()}
              >
                📂 Upload
              </button>
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
  const [form, setForm] = useState({ title: "", description: "", ministry: "", date: "", time: "", location: "", image: "", images: [] });
  
  const save = () => {
    if (!form.title || !form.date) return;
    const itemData = {
      title: form.title,
      description: form.description,
      ministry: form.ministry || "",
      date: form.date,
      time: form.time || "",
      location: form.location || "",
      image: form.image || "",
      images: form.images && form.images.length > 0 ? form.images : (form.image ? [form.image] : [])
    };
    if (editId) {
      setActivities(activities.map(a => a.id === editId ? { ...a, ...itemData } : a));
      showToast("Activity updated successfully!");
    } else {
      setActivities([{ id: newId(), ...itemData, createdAt: today() }, ...activities]);
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
      image: a.image || "",
      images: a.images || []
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
    setForm({ title: "", description: "", ministry: "", date: "", time: "", location: "", image: "", images: [] });
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

          <div className="form-group" style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "1rem" }}>
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Activity Images Slideshow (Up to 5 Slides)</span>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ padding: "0.1rem 0.5rem", fontSize: "0.7rem", height: "auto" }}
                onClick={() => {
                  if (form.image) {
                    setForm(p => ({ ...p, images: [...(p.images || []), p.image].slice(0, 5) }));
                    showToast("Cover image added to slideshow!");
                  }
                }}
              >
                Use Cover as Slide
              </button>
            </label>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", marginTop: "0.5rem" }}>
              {[0, 1, 2, 3, 4].map(idx => {
                const img = form.images?.[idx];
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      border: "1.5px dashed var(--gray-300)", 
                      borderRadius: "8px", 
                      aspectRatio: "1", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      cursor: "pointer", 
                      position: "relative",
                      overflow: "hidden",
                      background: img ? `url(${img})` : "var(--gray-50)",
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                    onClick={() => {
                      document.getElementById(`activity-file-picker-${idx}`).click();
                    }}
                  >
                    {!img && <span style={{ fontSize: "1.2rem", color: "var(--gray-400)" }}>+</span>}
                    {img && (
                      <button 
                        type="button"
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "var(--danger)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "16px",
                          height: "16px",
                          fontSize: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 5
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = [...(form.images || [])];
                          updated.splice(idx, 1);
                          setForm(p => ({ ...p, images: updated }));
                        }}
                      >
                        ✕
                      </button>
                    )}
                    <input 
                      id={`activity-file-picker-${idx}`}
                      type="file" 
                      accept="image/*" 
                      style={{ display: "none" }}
                      onChange={e => {
                        handleLocalImageUpload(e, base64 => {
                          const updated = [...(form.images || [])];
                          updated[idx] = base64;
                          setForm(p => ({ ...p, images: updated.filter(Boolean) }));
                          showToast(`Image #${idx + 1} uploaded successfully!`);
                        }, showToast);
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--gray-400)", display: "block", marginTop: "0.5rem" }}>
              Click any slot to upload a local image. Supported formats are JPG/PNG. Images will be automatically optimized.
            </span>
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

// ─── INQUIRIES & BRAND IDENTITY PANEL ───
function InquiriesPanel({ inquiries, setInquiries, brandSettings, setBrandSettings, showToast }) {
  const [inquiryEmail, setInquiryEmail] = useState(brandSettings?.inquiryEmail || "lorence.almadrigo@gmail.com");
  const [financePin, setFinancePin] = useState(brandSettings?.financePin || "1234");
  const [logoType, setLogoType] = useState(brandSettings?.logoType || "emoji");
  const [logoEmoji, setLogoEmoji] = useState(brandSettings?.logoEmoji || "✝️");
  const [logoImage, setLogoImage] = useState(brandSettings?.logoImage || "");
  const [favicon, setFavicon] = useState(brandSettings?.favicon || "");
  
  const saveSettings = () => {
    setBrandSettings({
      ...brandSettings,
      inquiryEmail,
      financePin,
      logoType,
      logoEmoji,
      logoImage,
      favicon
    });
    showToast("System & Brand settings applied successfully!");
  };

  const removeInquiry = (id) => {
    if (window.confirm("Are you sure you want to delete this message inquiry?")) {
      setInquiries(inquiries.filter(i => i.id !== id));
      showToast("Inquiry deleted successfully!", "info");
    }
  };

  const toggleResolved = (id) => {
    setInquiries(inquiries.map(i => {
      if (i.id === id) {
        const nextStatus = i.status === "resolved" ? "unread" : "resolved";
        showToast(`Inquiry marked as ${nextStatus}!`);
        return { ...i, status: nextStatus };
      }
      return i;
    }));
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Inquiries & Brand Settings</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Side: Inquiries Log */}
        <div className="content-edit-section" style={{ margin: 0 }}>
          <h3 style={{ marginBottom: "1rem" }}>✉️ Contact Inquiries Log</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginBottom: "1.5rem" }}>
            Below are the messages submitted by visitors through the public contact form.
          </p>

          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sender</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: "2.5rem", fontStyle: "italic" }}>
                    No inquiries received yet.
                  </td>
                </tr>
              ) : (
                inquiries.map(inq => (
                  <tr key={inq.id} style={{ opacity: inq.status === "resolved" ? 0.7 : 1 }}>
                    <td>{inq.date}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{inq.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{inq.email}</div>
                    </td>
                    <td style={{ maxWidth: "250px", fontSize: "0.8rem", whiteSpace: "pre-line" }}>
                      {inq.message}
                    </td>
                    <td>
                      <span className={`tag ${inq.status === "resolved" ? "income" : "announcement"}`}>
                        {inq.status || "unread"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <button className="btn btn-outline btn-sm" onClick={() => toggleResolved(inq.id)}>
                          {inq.status === "resolved" ? "Reopen" : "Resolve"}
                        </button>
                        <a 
                          href={`mailto:${inq.email}?subject=Re: Inquiry from Faithway Church Website&body=Hi ${inq.name},\n\nThank you for reaching out...`} 
                          className="btn btn-sm" 
                          style={{ background: "var(--primary-light)" }}
                        >
                          Reply
                        </a>
                        <button className="btn btn-danger btn-sm" onClick={() => removeInquiry(inq.id)}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: Brand & Security Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div className="content-edit-section" style={{ margin: 0 }}>
            <h3>⚙️ System & Email Routing</h3>
            
            <div className="form-group">
              <label className="form-label">Inquiry Target Email</label>
              <input 
                className="form-input" 
                value={inquiryEmail} 
                onChange={e => setInquiryEmail(e.target.value)} 
                placeholder="lorence.almadrigo@gmail.com" 
              />
              <span style={{ fontSize: "0.7rem", color: "var(--gray-400)", display: "block", marginTop: "0.25rem" }}>
                Public inquiries will redirect the user to email this address and log the submission here.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Savings Security PIN</label>
              <input 
                className="form-input" 
                type="text"
                maxLength={8}
                value={financePin} 
                onChange={e => setFinancePin(e.target.value)} 
                placeholder="1234" 
              />
              <span style={{ fontSize: "0.7rem", color: "var(--gray-400)", display: "block", marginTop: "0.25rem" }}>
                PIN required to unlock the private "Savings & Finance" panel.
              </span>
            </div>
            
            <button className="btn btn-full" onClick={saveSettings} style={{ marginTop: "1rem" }}>
              Save Core Settings
            </button>
          </div>

          <div className="content-edit-section" style={{ margin: 0 }}>
            <h3>🎨 Brand Identity Customizer</h3>

            <div className="form-group">
              <label className="form-label">Logo Customization Type</label>
              <select className="form-select" value={logoType} onChange={e => setLogoType(e.target.value)}>
                <option value="emoji">Emoji Icon</option>
                <option value="image">Image Upload</option>
              </select>
            </div>

            {logoType === "emoji" ? (
              <div className="form-group">
                <label className="form-label">Logo Emoji</label>
                <input className="form-input" value={logoEmoji} onChange={e => setLogoEmoji(e.target.value)} placeholder="⛪ or ✝️" />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Logo Image Upload</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => handleLocalImageUpload(e, base64 => {
                    setLogoImage(base64);
                    showToast("Logo image uploaded successfully!");
                  }, showToast)}
                  style={{ fontSize: "0.8rem", width: "100%" }}
                />
                {logoImage && (
                  <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>Preview:</span>
                    <img src={logoImage} alt="Logo Preview" style={{ width: "42px", height: "42px", objectFit: "contain", borderRadius: "50%", background: "repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 8px 8px", border: "1px solid var(--gray-200)" }} />
                  </div>
                )}
              </div>
            )}

            <div className="form-group" style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "1rem" }}>
              <label className="form-label">Browser Tab Favicon Upload</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => handleLocalImageUpload(e, base64 => {
                  setFavicon(base64);
                  showToast("Favicon uploaded successfully!");
                }, showToast)}
                style={{ fontSize: "0.8rem", width: "100%" }}
              />
              {favicon && (
                <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>Preview:</span>
                  <img src={favicon} alt="Favicon Preview" style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "4px", background: "repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 8px 8px", border: "1px solid var(--gray-200)" }} />
                </div>
              )}
            </div>

            <button className="btn btn-full btn-accent" onClick={saveSettings} style={{ marginTop: "1rem" }}>
              Apply Brand Assets
            </button>
          </div>

        </div>

      </div>
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
  ministries, setMinistries,
  activities, setActivities,
  records, setRecords,
  brandSettings, setBrandSettings,
  inquiries, setInquiries,
  pageContents, setPageContents,
  showToast,
  adminCredentials, setAdminCredentials,
  orders, setOrders,
  dbStatus
}) {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // PIN Gate modal states
  const [financeUnlocked, setFinanceUnlocked] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "content", label: "Site Content", icon: "📝" },
    { id: "savings", label: "Savings & Finance", icon: "₱" },
    { id: "inquiries", label: "Inquiries", icon: "✉️" },
    { id: "activities", label: "Activities", icon: "⛪" },
    { id: "ministries", label: "Ministries", icon: "🤝" },
    { id: "products", label: "Shop Products", icon: "👕" },
    { id: "orders", label: "Store Orders", icon: "🛒" },
    { id: "birthdays", label: "Birthday Celebrants", icon: "🎂" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "events", label: "Events", icon: "📅" },
    { id: "notes", label: "Notepad", icon: "📋" },
  ];

  const handleTabChange = (targetTab) => {
    if (targetTab === "savings" && !financeUnlocked) {
      setPinModalOpen(true);
      setEnteredPin("");
      setPinError("");
    } else {
      setTab(targetTab);
    }
  };

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
        <div style={{ display: "flex", alignItems: "center" }}>
          {dbStatus === "online" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "999px", padding: "0.3rem 0.75rem", fontSize: "0.72rem", fontWeight: 600, color: "#16a34a" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }}></span>
              Cloud Synced
            </div>
          )}
          {dbStatus === "offline" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.5)", borderRadius: "999px", padding: "0.3rem 0.75rem", fontSize: "0.72rem", fontWeight: 600, color: "#854d0e" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308", display: "inline-block", boxShadow: "0 0 6px #eab308" }}></span>
              Offline Cache Mode — Check VPN / Network
            </div>
          )}
          {dbStatus === "connecting" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "999px", padding: "0.3rem 0.75rem", fontSize: "0.72rem", fontWeight: 600, color: "#4338ca" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1", display: "inline-block", animation: "pulse 1.2s infinite" }}></span>
              Connecting to Database…
            </div>
          )}
        </div>
      </div>
      <div className="admin-layout">
        <div className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="admin-sidebar-title">Church Management</div>
          {navItems.map(item => (
            <div key={item.id} className={`admin-nav-item${tab === item.id ? " active" : ""}`} onClick={() => {
              handleTabChange(item.id);
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
              setTab={handleTabChange} 
              showToast={showToast}
              adminCredentials={adminCredentials}
              setAdminCredentials={setAdminCredentials}
            />
          )}
          {tab === "content" && (
            <SiteContentPanel 
              slides={slides} setSlides={setSlides} 
              mission={mission} setMission={setMission} 
              stats={stats} setStats={setStats} 
              pageContents={pageContents} setPageContents={setPageContents}
              showToast={showToast}
            />
          )}
          {tab === "savings" && (
            <SavingsPanel 
              records={records} 
              setRecords={setRecords} 
              showToast={showToast} 
              onLock={() => {
                setFinanceUnlocked(false);
                setTab("dashboard");
                showToast("Savings & Finance locked successfully!", "info");
              }}
            />
          )}
          {tab === "inquiries" && (
            <InquiriesPanel 
              inquiries={inquiries} 
              setInquiries={setInquiries} 
              brandSettings={brandSettings} 
              setBrandSettings={setBrandSettings} 
              showToast={showToast} 
            />
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
          {tab === "ministries" && (
            <MinistriesPanel ministries={ministries} setMinistries={setMinistries} showToast={showToast} />
          )}
          {tab === "orders" && (
            <OrdersPanel
              orders={orders}
              setOrders={setOrders}
              showToast={showToast}
              inquiryEmail={brandSettings?.inquiryEmail}
            />
          )}
        </div>
      </div>

      {pinModalOpen && (
        <Modal 
          title="🔒 Security Verification" 
          onClose={() => setPinModalOpen(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setPinModalOpen(false)}>Cancel</button>
              <button className="btn" onClick={() => {
                const currentPin = brandSettings?.financePin || "1234";
                if (enteredPin === currentPin) {
                  setFinanceUnlocked(true);
                  setPinModalOpen(false);
                  setTab("savings");
                  showToast("Savings & Finance unlocked successfully!");
                } else {
                  setPinError("Incorrect security PIN. Please try again.");
                }
              }}>Unlock</button>
            </>
          }
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🔐</div>
            <p style={{ fontSize: "0.9rem", color: "var(--gray-600)" }}>
              Access to Savings & Finance is restricted. Please enter the administrator security PIN to proceed.
            </p>
          </div>
          <div className="form-group" style={{ maxWidth: "220px", margin: "0 auto" }}>
            <input 
              className="form-input" 
              type="password" 
              maxLength={8}
              value={enteredPin} 
              onChange={e => setEnteredPin(e.target.value)} 
              placeholder="••••" 
              style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5em", padding: "0.5rem" }} 
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const currentPin = brandSettings?.financePin || "1234";
                  if (enteredPin === currentPin) {
                    setFinanceUnlocked(true);
                    setPinModalOpen(false);
                    setTab("savings");
                    showToast("Savings & Finance unlocked successfully!");
                  } else {
                    setPinError("Incorrect security PIN. Please try again.");
                  }
                }
              }}
            />
          </div>
          {pinError && (
            <div className="tag expense" style={{ width: "100%", textAlign: "center", padding: "0.6rem", marginTop: "1rem", borderRadius: "8px", fontWeight: "600", fontSize: "0.8rem" }}>
              {pinError}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0naynaT4FKNP0ftGibQHUHsKzpqmHDls",
  authDomain: "fbc-navarro.firebaseapp.com",
  projectId: "fbc-navarro",
  storageBucket: "fbc-navarro.firebasestorage.app",
  messagingSenderId: "1082550837677",
  appId: "1:1082550837677:web:559566214c96a32d990124",
  measurementId: "G-QG891C2GXB"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Enable offline caching so the site still works on restricted corporate/VPN networks
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Firestore offline persistence failed: multiple tabs open.");
  } else if (err.code === "unimplemented") {
    console.warn("Firestore offline persistence is not available in this browser.");
  }
});

// ─── APP MAIN ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [dbStatus, setDbStatus] = useState("connecting");

  // Reset scroll to top on every page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [page]);

  // Track browser online/offline events for VPN awareness
  useEffect(() => {
    const goOnline = () => setDbStatus(prev => prev === "offline" ? "connecting" : prev);
    const goOffline = () => setDbStatus("offline");
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    if (!navigator.onLine) setDbStatus("offline");
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  
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

  // States backed up by local cache, synchronized reactively with Firestore
  const [announcements, setAnnouncementsState] = useState(() => {
    try { const s = localStorage.getItem("fbc_announcements"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [events, setEventsState] = useState(() => {
    try { const s = localStorage.getItem("fbc_events"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [records, setRecordsState] = useState(() => {
    try { const s = localStorage.getItem("fbc_savings"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [activities, setActivitiesState] = useState(() => {
    try { const s = localStorage.getItem("fbc_activities"); return s ? JSON.parse(s) : DEFAULT_ACTIVITIES; } catch { return DEFAULT_ACTIVITIES; }
  });
  const [slides, setSlidesState] = useState(() => {
    try { const s = localStorage.getItem("fbc_slides"); return s ? JSON.parse(s) : DEFAULT_SLIDES; } catch { return DEFAULT_SLIDES; }
  });
  const [mission, setMissionState] = useState(() => {
    try { const s = localStorage.getItem("fbc_mission"); return s ? JSON.parse(s) : DEFAULT_MISSION; } catch { return DEFAULT_MISSION; }
  });
  const [stats, setStatsState] = useState(() => {
    try { const s = localStorage.getItem("fbc_church_stats"); return s ? JSON.parse(s) : DEFAULT_STATS; } catch { return DEFAULT_STATS; }
  });
  const [birthdays, setBirthdaysState] = useState(() => {
    try { const s = localStorage.getItem("fbc_birthdays"); return s ? JSON.parse(s) : DEFAULT_BIRTHDAYS; } catch { return DEFAULT_BIRTHDAYS; }
  });
  const [products, setProductsState] = useState(() => {
    try { const s = localStorage.getItem("fbc_products"); return s ? JSON.parse(s) : DEFAULT_PRODUCTS; } catch { return DEFAULT_PRODUCTS; }
  });
  const [ministries, setMinistriesState] = useState(() => {
    try { const s = localStorage.getItem("fbc_ministries"); return s ? JSON.parse(s) : DEFAULT_MINISTRIES; } catch { return DEFAULT_MINISTRIES; }
  });
  const [inquiries, setInquiriesState] = useState(() => {
    try { const s = localStorage.getItem("fbc_inquiries"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [pageContents, setPageContentsState] = useState(() => {
    try { const s = localStorage.getItem("fbc_page_contents"); return s ? JSON.parse(s) : DEFAULT_PAGE_CONTENTS; } catch { return DEFAULT_PAGE_CONTENTS; }
  });
  const [brandSettings, setBrandSettingsState] = useState(() => {
    try {
      const s = localStorage.getItem("fbc_brand_settings");
      return s ? JSON.parse(s) : {
        logoType: "emoji",
        logoEmoji: "✝️",
        logoImage: "",
        favicon: "",
        financePin: "1234",
        inquiryEmail: "lorence.almadrigo@gmail.com"
      };
    } catch {
      return {
        logoType: "emoji",
        logoEmoji: "✝️",
        logoImage: "",
        favicon: "",
        financePin: "1234",
        inquiryEmail: "lorence.almadrigo@gmail.com"
      };
    }
  });

  const [adminCredentials, setAdminCredentialsState] = useState(() => {
    try {
      const s = localStorage.getItem("fbc_admin_credentials");
      return s ? JSON.parse(s) : {
        username: obfuscate("admin"),
        password: obfuscate("fbcnavarro2024"),
        securityQuestion: "What is the name of the church branch location?",
        securityAnswer: obfuscate("Navarro")
      };
    } catch {
      return {
        username: obfuscate("admin"),
        password: obfuscate("fbcnavarro2024"),
        securityQuestion: "What is the name of the church branch location?",
        securityAnswer: obfuscate("Navarro")
      };
    }
  });

  const [orders, setOrdersState] = useState(() => {
    try {
      const s = localStorage.getItem("fbc_orders");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Helper to create synchronous local state updates + async Firestore writes
  const createWriter = (docName, localKey, stateSetter) => {
    return (newData) => {
      stateSetter(prev => {
        const resolved = typeof newData === "function" ? newData(prev) : newData;
        try { localStorage.setItem(localKey, JSON.stringify(resolved)); } catch (e) {}
        setDoc(doc(db, "fbc_navarro", docName), { data: resolved }).catch(err => {
          console.error(`Firestore ${docName} write error:`, err);
        });
        return resolved;
      });
    };
  };

  const setAnnouncements = createWriter("announcements", "fbc_announcements", setAnnouncementsState);
  const setEvents = createWriter("events", "fbc_events", setEventsState);
  const setRecords = createWriter("savings", "fbc_savings", setRecordsState);
  const setActivities = createWriter("activities", "fbc_activities", setActivitiesState);
  const setSlides = createWriter("slides", "fbc_slides", setSlidesState);
  const setMission = createWriter("mission", "fbc_mission", setMissionState);
  const setStats = createWriter("stats", "fbc_church_stats", setStatsState);
  const setBirthdays = createWriter("birthdays", "fbc_birthdays", setBirthdaysState);
  const setProducts = createWriter("products", "fbc_products", setProductsState);
  const setMinistries = createWriter("ministries", "fbc_ministries", setMinistriesState);
  const setInquiries = createWriter("inquiries", "fbc_inquiries", setInquiriesState);
  const setPageContents = createWriter("pageContents", "fbc_page_contents", setPageContentsState);
  const setBrandSettings = createWriter("brandSettings", "fbc_brand_settings", setBrandSettingsState);
  const setAdminCredentials = createWriter("adminCredentials", "fbc_admin_credentials", setAdminCredentialsState);
  const setOrders = createWriter("orders", "fbc_orders", setOrdersState);

  // Firestore Real-Time Subscriptions & Auto-Seeding Safeguard
  useEffect(() => {
    const syncs = [
      { docName: "announcements", stateSetter: setAnnouncementsState, localKey: "fbc_announcements", defaultValue: [] },
      { docName: "events", stateSetter: setEventsState, localKey: "fbc_events", defaultValue: [] },
      { docName: "savings", stateSetter: setRecordsState, localKey: "fbc_savings", defaultValue: [] },
      { docName: "activities", stateSetter: setActivitiesState, localKey: "fbc_activities", defaultValue: DEFAULT_ACTIVITIES },
      { docName: "slides", stateSetter: setSlidesState, localKey: "fbc_slides", defaultValue: DEFAULT_SLIDES },
      { docName: "mission", stateSetter: setMissionState, localKey: "fbc_mission", defaultValue: DEFAULT_MISSION },
      { docName: "stats", stateSetter: setStatsState, localKey: "fbc_church_stats", defaultValue: DEFAULT_STATS },
      { docName: "birthdays", stateSetter: setBirthdaysState, localKey: "fbc_birthdays", defaultValue: DEFAULT_BIRTHDAYS },
      { docName: "products", stateSetter: setProductsState, localKey: "fbc_products", defaultValue: DEFAULT_PRODUCTS },
      { docName: "ministries", stateSetter: setMinistriesState, localKey: "fbc_ministries", defaultValue: DEFAULT_MINISTRIES },
      { docName: "inquiries", stateSetter: setInquiriesState, localKey: "fbc_inquiries", defaultValue: [] },
      { docName: "pageContents", stateSetter: setPageContentsState, localKey: "fbc_page_contents", defaultValue: DEFAULT_PAGE_CONTENTS },
      { docName: "brandSettings", stateSetter: setBrandSettingsState, localKey: "fbc_brand_settings", defaultValue: {
        logoType: "emoji",
        logoEmoji: "✝️",
        logoImage: "",
        favicon: "",
        financePin: "1234",
        inquiryEmail: "lorence.almadrigo@gmail.com"
      } },
      { docName: "adminCredentials", stateSetter: setAdminCredentialsState, localKey: "fbc_admin_credentials", defaultValue: {
        username: obfuscate("admin"),
        password: obfuscate("fbcnavarro2024"),
        securityQuestion: "What is the name of the church branch location?",
        securityAnswer: obfuscate("Navarro")
      } },
      { docName: "orders", stateSetter: setOrdersState, localKey: "fbc_orders", defaultValue: [] }
    ];

    let onlineConfirmed = false;

    const unsubscribes = syncs.map(({ docName, stateSetter, localKey, defaultValue }) => {
      return onSnapshot(doc(db, "fbc_navarro", docName), { includeMetadataChanges: false }, (snapshot) => {
        // Mark as online on first successful snapshot callback
        if (!onlineConfirmed) {
          onlineConfirmed = true;
          setDbStatus("online");
        }

        if (snapshot.exists()) {
          const cloudData = snapshot.data()?.data;
          // === SAFEGUARD: Only sync from cloud if cloud data is meaningful ===
          // Prevents an empty or corrupted cloud record from wiping out good local data
          const isCloudDataMeaningful = cloudData !== undefined && cloudData !== null &&
            (Array.isArray(cloudData) ? cloudData.length > 0 : (typeof cloudData === "object" ? Object.keys(cloudData).length > 0 : true));

          if (isCloudDataMeaningful) {
            stateSetter(cloudData);
            try { localStorage.setItem(localKey, JSON.stringify(cloudData)); } catch (e) {}
          } else {
            // Cloud doc exists but data is empty — upload local data back to cloud to restore it
            const currentLocal = localStorage.getItem(localKey);
            try {
              if (currentLocal) {
                const parsed = JSON.parse(currentLocal);
                if (parsed && (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)) {
                  setDoc(doc(db, "fbc_navarro", docName), { data: parsed }).catch(err => {
                    console.error(`Error restoring ${docName} from local:`, err);
                  });
                }
              }
            } catch (e) {}
          }
        } else {
          // Document doesn't exist yet — seed it from local storage or defaults
          const currentLocal = localStorage.getItem(localKey);
          let seedData = defaultValue;
          try {
            if (currentLocal) {
              const parsed = JSON.parse(currentLocal);
              if (parsed && (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)) {
                seedData = parsed;
              }
            }
          } catch (e) {}
          setDoc(doc(db, "fbc_navarro", docName), { data: seedData }).catch(err => {
            console.error(`Error auto-seeding ${docName}:`, err);
          });
        }
      }, (error) => {
        // Connection error — mark as offline, but keep serving local cache data
        console.error(`Snapshot error for ${docName}:`, error);
        setDbStatus("offline");
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = brandSettings?.favicon || "/favicon.svg";
  }, [brandSettings?.favicon]);

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
      <Nav page={page} setPage={setPage} isLogged={isLogged} onLogout={handleLogout} brandSettings={brandSettings} />
      
      {page === "home" && (
        <HomePage 
          announcements={announcements} 
          events={events} 
          slides={slides} 
          mission={mission} 
          stats={stats} 
          birthdays={birthdays}
          ministries={ministries}
          setPage={setPage}
          brandSettings={brandSettings}
          pageContents={pageContents}
          inquiries={inquiries}
          setInquiries={setInquiries}
          showToast={showToast}
        />
      )}
      
      {page === "about" && (
        <AboutPage setPage={setPage} brandSettings={brandSettings} pageContents={pageContents} ministries={ministries} />
      )}
      
      {page === "activities" && (
        <ActivitiesPage 
          activities={activities} 
          setPage={setPage} 
          brandSettings={brandSettings} 
          pageContents={pageContents} 
          birthdays={birthdays} 
          ministries={ministries}
        />
      )}
      
      {page === "shop" && (
        <ShopPage products={products} setPage={setPage} brandSettings={brandSettings} pageContents={pageContents} cart={cart} setCart={setCart} orders={orders} setOrders={setOrders} showToast={showToast} ministries={ministries} />
      )}
      
      {page === "admin" && (
        isLogged ? (
          <AdminPage 
            dbStatus={dbStatus}
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
            ministries={ministries}
            setMinistries={setMinistries}
            activities={activities}
            setActivities={setActivities}
            records={records}
            setRecords={setRecords}
            brandSettings={brandSettings}
            setBrandSettings={setBrandSettings}
            inquiries={inquiries}
            setInquiries={setInquiries}
            pageContents={pageContents}
            setPageContents={setPageContents}
            showToast={showToast}
            adminCredentials={adminCredentials}
            setAdminCredentials={setAdminCredentials}
            orders={orders}
            setOrders={setOrders}
          />
        ) : (
          <AdminLoginPage onLogin={handleLogin} adminCredentials={adminCredentials} setAdminCredentials={setAdminCredentials} showToast={showToast} />
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



