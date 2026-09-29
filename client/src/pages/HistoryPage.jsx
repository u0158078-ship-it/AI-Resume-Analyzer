import { ArrowRight, ChevronRight, FileText, History, LoaderCircle } from 'lucide-react'

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(date))
}

function HistoryPage({ analyses, loading, onOpen, onAnalyze }) {
  return (
    <section className="page-content history-page">
      <div className="page-heading history-heading"><div><div className="eyebrow"><span className="eyebrow-line" />YOUR WORKSPACE</div><h1>Every step, <em>on record.</em></h1><p className="page-intro">Pick up where you left off, or compare how your resume fits a new role.</p></div><button className="primary-button" onClick={onAnalyze}>New analysis<ArrowRight size={17} /></button></div>
      <div className="history-toolbar"><div><History size={17} /><strong>Previous analyses</strong><span>{analyses.length} {analyses.length === 1 ? 'review' : 'reviews'}</span></div><span>Most recent first</span></div>
      {loading && analyses.length === 0 ? <div className="history-loading"><LoaderCircle size={18} className="spin" />Loading your history</div> : analyses.length === 0 ? (
        <div className="history-empty"><div className="empty-icon"><History size={23} /></div><h2>Your next chapter starts here.</h2><p>Your completed resume reviews will be saved here for easy reference.</p><button className="secondary-button" onClick={onAnalyze}>Start an analysis<ArrowRight size={16} /></button></div>
      ) : (
        <div className="history-list">{analyses.map((item, index) => <button className="history-row" key={item._id} onClick={() => onOpen(item._id)}>
          <span className="history-index">{String(index + 1).padStart(2, '0')}</span><span className="history-file-icon"><FileText size={19} /></span><span className="history-main"><strong>{item.filename}</strong><span>{item.targetJobRole}</span></span><span className="history-score"><strong>{item.score}</strong><span>FIT SCORE</span></span><span className="history-date">{formatDate(item.createdAt)}</span><span className="history-open"><ChevronRight size={18} /></span>
        </button>)}</div>
      )}
      <footer className="page-footer"><span>Your analyses are stored securely in your workspace.</span><span>Clear feedback, whenever you need it <ArrowRight size={13} /></span></footer>
    </section>
  )
}

export default HistoryPage