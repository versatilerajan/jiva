import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: "⬛", title: "Kanban Boards", desc: "Visualize work with drag-and-drop columns. Move tasks from To-Do to Done effortlessly." },
  { icon: "👥", title: "Team Rooms", desc: "Create private project rooms, invite teammates via link, and collaborate in real time." },
  { icon: "📊", title: "Progress Tracking", desc: "Watch task progress bars fill up. Auto-escalate to Review when 100% complete." },
  { icon: "🔍", title: "Code Review",  desc: "Built-in review workflow. Approve or reject — tasks bounce back for fixes automatically." },
  { icon: "🔔", title: "Activity Feed", desc: "Full audit trail on every task. Know who did what and when across your project." },
  { icon: "⚡", title: "Priority Levels", desc: "Tag tasks as Low, Medium, High, or Urgent. Never lose sight of what matters most." },
];

const TICKER_ITEMS = ["Kanban", "Sprints", "Code Review", "Team Rooms", "Task Tracking", "Priority Management", "Activity Logs", "Invite Links"];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef  = useRef(null);

  useEffect(() => { if (user) navigate("/rooms"); }, [user, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-logo">◆</span>
          <span className="brand-name">Jiva</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/auth")}>Sign in</button>
          <button className="btn btn-primary" onClick={() => navigate("/auth?mode=register")}>Get started free</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg">
          <div className="hero-glow glow-1" />
          <div className="hero-glow glow-2" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content animate-fade">
          <div className="hero-badge">✦ Project management, reimagined</div>
          <h1 className="hero-title">
            Build faster.<br />
            <span className="hero-title-accent">Ship together.</span>
          </h1>
          <p className="hero-sub">
            Jiva gives your team a shared space to plan, track, and deliver software —
            with Kanban boards, code reviews, and real-time collaboration built in.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/auth?mode=register")}>
              Start your project →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate("/auth")}>
              Sign in
            </button>
          </div>
        </div>

        <div className="hero-visual animate-fade" style={{ animationDelay: "0.15s" }}>
          <div className="board-preview">
            <div className="bp-header">
              <span className="bp-dot red" /><span className="bp-dot yellow" /><span className="bp-dot green" />
              <span className="bp-title">Jiva — Sprint 4</span>
            </div>
            <div className="bp-columns">
              {[
                { label: "TO DO",        count: 3, color: "var(--text-muted)", tasks: ["Design onboarding flow", "Write API docs", "Setup CI/CD"] },
                { label: "IN PROGRESS",  count: 2, color: "var(--yellow)",     tasks: ["Auth integration", "Dashboard charts"] },
                { label: "REVIEW",       count: 1, color: "var(--purple)",     tasks: ["Login page"] },
                { label: "DONE",         count: 4, color: "var(--green)",      tasks: ["DB schema", "Firebase setup", "Routes", "Models"] },
              ].map((col) => (
                <div className="bp-col" key={col.label}>
                  <div className="bp-col-header">
                    <span style={{ color: col.color, fontSize: 10, fontWeight: 700 }}>{col.label}</span>
                    <span className="bp-count">{col.count}</span>
                  </div>
                  {col.tasks.map((t) => <div className="bp-task" key={t}>{t}</div>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span className="ticker-item" key={i}>
              <span className="ticker-dot">◆</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-label reveal">Everything you need</div>
        <h2 className="section-title reveal">Built for modern software teams</h2>
        <p className="section-sub reveal">From backlog to deployment — manage your entire workflow in one place.</p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card reveal card" key={f.title} style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how" id="how">
        <div className="section-label reveal">Simple flow</div>
        <h2 className="section-title reveal">Up and running in 3 steps</h2>
        <div className="steps">
          {[
            { n: "01", title: "Create a room",   desc: "Sign up and start a new project room. Give it a name and invite your team." },
            { n: "02", title: "Add your tasks",  desc: "Create issues and assign them to team members with priorities and due dates." },
            { n: "03", title: "Ship together",   desc: "Move tasks through the board, review completed work, and track your velocity." },
          ].map((s) => (
            <div className="step reveal" key={s.n}>
              <div className="step-number">{s.n}</div>
              <div className="step-content"><h3>{s.title}</h3><p>{s.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section reveal">
        <div className="cta-glow" />
        <h2 className="cta-title">Ready to ship faster?</h2>
        <p className="cta-sub">Free to start. No credit card required.</p>
        <button className="btn btn-primary btn-xl" onClick={() => navigate("/auth?mode=register")}>
          Create your workspace →
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="brand-logo">◆</span>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>© 2026 Jiva. Built by CodeUp Team.</span>
      </footer>
    </div>
  );
}
