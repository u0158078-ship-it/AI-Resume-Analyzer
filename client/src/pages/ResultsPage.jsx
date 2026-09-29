import { ArrowLeft, ArrowRight, Check, Clock3, FileText, Sparkles } from 'lucide-react'

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(date))
}

function scoreLabel(score) {
  if (score >= 80) return 'Strong alignment with the role'
  if (score >= 60) return 'A promising foundation to build on'
  if (score >= 40) return 'Some relevant experience to develop'
  return 'An opportunity to tailor your story'
}

function ResultsPage({ analysis, onBack }) {
  if (!analysis) {
    return <section className="page-content empty-state"><div className="empty-icon"><FileText size={24} /></div><h1>No results yet</h1><p>Upload a resume to see your role-specific review.</p><button className="primary-button" onClick={onBack}>Analyze a resume<ArrowRight size={17} /></button></section>
  }

  const details = analysis.analysis
  return (
    <section className="page-content results-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} />New analysis</button>
      <div className="results-heading">
        <div><div className="eyebrow"><span className="eyebrow-line" />YOUR ROLE REVIEW</div><h1>Your fit, <em>in focus.</em></h1><p className="page-intro">{analysis.filename} <span className="meta-divider">/</span> {analysis.targetJobRole}</p></div>
        <div className="results-date"><Clock3 size={15} />{formatDate(analysis.createdAt)}</div>
      </div>

      <div className="results-grid">
        <section className="score-card">
          <div className="score-top"><span>OVERALL MATCH</span><span className="score-chip"><Sparkles size={13} /> ROLE FIT</span></div>
          <div className="score-display"><strong>{details.overallScore}</strong><span>/ 100</span></div>
          <div className="score-track"><span style={{ width: `${details.overallScore}%` }} /></div>
          <p>{scoreLabel(details.overallScore)}</p>
        </section>
        <section className="summary-card"><div className="card-overline">THE SHORT VERSION</div><h2>A considered overview</h2><p>{details.summary}</p></section>
        <ListCard title="Strengths" eyebrow="WHAT'S WORKING" items={details.strengths} tone="green" />
        <ListCard title="Areas to strengthen" eyebrow="ROOM TO GROW" items={details.weaknesses} tone="coral" />
        <SkillCard title="Matching skills" eyebrow="ALREADY IN YOUR TOOLKIT" items={details.matchingSkills} tone="green" />
        <SkillCard title="Skills to build" eyebrow="GAPS FOR THIS ROLE" items={details.missingSkills} tone="gold" />
        <section className="recommendations-card"><div className="card-overline">YOUR NEXT MOVES</div><h2>Recommendations</h2><ol>{details.recommendations.map((item, index) => <li key={`${index}-${item}`}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>)}</ol></section>
        <section className="keyword-card"><div className="card-overline">HELP YOUR EXPERIENCE GET FOUND</div><h2>ATS keywords</h2><div className="keyword-list">{details.atsKeywords.map((item) => <span key={item}>{item}</span>)}</div></section>
        <section className="analysis-card"><div className="card-overline">CAREER STORY</div><h2>Experience</h2><p>{details.experienceAnalysis}</p></section>
        <section className="analysis-card"><div className="card-overline">FOUNDATION</div><h2>Education</h2><p>{details.educationAnalysis}</p></section>
      </div>
      <footer className="page-footer"><span>Feedback is based only on the resume you shared.</span><button className="text-button" onClick={onBack}>Review another resume<ArrowRight size={14} /></button></footer>
    </section>
  )
}

function ListCard({ title, eyebrow, items, tone }) {
  return <section className={`list-card ${tone}`}><div className="card-overline">{eyebrow}</div><h2>{title}</h2>{items.length ? <ul>{items.map((item) => <li key={item}><span className="list-marker"><Check size={12} /></span>{item}</li>)}</ul> : <p className="muted-note">No items were identified.</p>}</section>
}

function SkillCard({ title, eyebrow, items, tone }) {
  return <section className="skill-card"><div className="card-overline">{eyebrow}</div><h2>{title}</h2><div className="skill-list">{items.length ? items.map((item) => <span className={`skill-pill ${tone}`} key={item}>{item}</span>) : <p className="muted-note">No items were identified.</p>}</div></section>
}

export default ResultsPage