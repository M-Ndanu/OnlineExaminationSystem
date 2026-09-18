import './App.css'

type Exam = {
  title: string
  code: string
  date: string
  time: string
  duration: string
  status: 'Ready' | 'Upcoming'
  accent: string
}

const exams: Exam[] = [
  { title: 'Software Engineering', code: 'SFE4015B', date: 'Today, 14:00', time: '14:00 - 16:00', duration: '120 min', status: 'Ready', accent: 'coral' },
  { title: 'Database Systems', code: 'SCS4020', date: 'Tomorrow, 09:00', time: '09:00 - 11:00', duration: '120 min', status: 'Upcoming', accent: 'blue' },
  { title: 'Interaction Design', code: 'SCS4050', date: '24 Oct, 10:30', time: '10:30 - 12:00', duration: '90 min', status: 'Upcoming', accent: 'yellow' },
]

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">O</span><span>Orbit</span></div>
        <div className="workspace-label">STUDENT PORTAL</div>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#dashboard"><span className="nav-icon">▦</span>Overview</a>
          <a className="nav-item" href="#exams"><span className="nav-icon">□</span>My examinations</a>
          <a className="nav-item" href="#results"><span className="nav-icon">◒</span>Results</a>
          <a className="nav-item" href="#calendar"><span className="nav-icon">□</span>Calendar</a>
        </nav>
        <div className="sidebar-bottom">
          <a className="nav-item" href="#help"><span className="nav-icon">?</span>Help centre</a>
          <div className="sidebar-user"><div className="avatar small">AN</div><div><strong>Alex Njoroge</strong><span>Student</span></div><button aria-label="Account menu">···</button></div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>Overview</strong></div>
          <div className="top-actions"><button className="icon-button" aria-label="Search">⌕</button><button className="icon-button notification" aria-label="Notifications">♢<i /></button><div className="avatar">AN</div></div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div><p className="eyebrow">MONDAY, 21 OCTOBER 2024</p><h1>Good morning, Alex<span>.</span></h1><p className="subheading">Keep your momentum going. You have one examination ready to start.</p></div>
            <button className="outline-button">View calendar <span>→</span></button>
          </section>

          <section className="stats-grid" aria-label="Your examination summary">
            <article className="stat-card"><div className="stat-icon coral-bg">◷</div><div><span>Next examination</span><strong>Today, 14:00</strong><small>Software Engineering</small></div></article>
            <article className="stat-card"><div className="stat-icon blue-bg">↗</div><div><span>Average score</span><strong>84<span className="unit">%</span></strong><small>Across 4 examinations</small></div></article>
            <article className="stat-card"><div className="stat-icon yellow-bg">✓</div><div><span>Examinations done</span><strong>04</strong><small>1 awaiting result</small></div></article>
          </section>

          <section className="content-grid">
            <div className="exams-section" id="exams">
              <div className="section-heading"><div><h2>Examinations</h2><p>Your scheduled and available examinations</p></div><button className="text-button">View all <span>→</span></button></div>
              <div className="exam-list">{exams.map((exam) => <ExamCard key={exam.code} exam={exam} />)}</div>
            </div>
            <aside className="progress-panel" id="results"><div className="section-heading"><div><h2>Your progress</h2><p>This semester</p></div><button className="more-button" aria-label="More progress options">···</button></div><div className="progress-ring"><div><strong>84</strong><span>/ 100</span></div></div><p className="progress-note"><b>Above average</b><br />You are 12% ahead of the class average.</p><div className="progress-bars"><div><span>Completed</span><b>4 / 6</b><div className="bar"><i /></div></div><div><span>Average score</span><b>84%</b><div className="bar muted"><i /></div></div></div></aside>
          </section>

          <section className="activity-section" id="calendar"><div className="section-heading"><div><h2>Recent activity</h2><p>Your latest examination updates</p></div><button className="text-button">View history <span>→</span></button></div><div className="activity-row"><div className="activity-dot coral-bg">✓</div><div><strong>Web Application Development</strong><p>Examination submitted · 18 Oct 2024</p></div><span className="activity-score">92<span>/100</span></span><span className="result-label">Excellent</span></div><div className="activity-row"><div className="activity-dot blue-bg">↗</div><div><strong>Computer Networks</strong><p>Result published · 12 Oct 2024</p></div><span className="activity-score">76<span>/100</span></span><span className="result-label">Passed</span></div></section>
        </div>
      </main>
    </div>
  )
}

function ExamCard({ exam }: { exam: Exam }) {
  return <article className="exam-card"><div className={`exam-accent ${exam.accent}`} /><div className="exam-card-content"><div className="exam-title-row"><div><span className="course-code">{exam.code}</span><h3>{exam.title}</h3></div><span className={`status ${exam.status.toLowerCase()}`}>{exam.status}</span></div><div className="exam-meta"><span>▣ {exam.date}</span><span>◷ {exam.duration}</span><span>◎ 50 marks</span></div><div className="exam-card-footer"><span>{exam.time}</span>{exam.status === 'Ready' ? <button className="primary-button">Start examination <span>→</span></button> : <button className="quiet-button">View details</button>}</div></div></article>
}

export default App
