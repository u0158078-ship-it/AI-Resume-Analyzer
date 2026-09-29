import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  FileText,
  History,
  LayoutDashboard,
  LoaderCircle,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import HistoryPage from './pages/HistoryPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import { analyzeResume, getAnalyses, getAnalysis } from './services/api.js'
import '../workspace.css'

function App() {
  const [page, setPage] = useState('analyze')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [file, setFile] = useState(null)
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef(null)

  function navigate(nextPage) {
    setError('')
    setHistoryLoading(nextPage === 'history')
    setPage(nextPage)
  }

  function chooseFile(candidate) {
    if (!candidate) return

    if (candidate.type !== 'application/pdf' && !candidate.name.toLowerCase().endsWith('.pdf')) {
      setFile(null)
      setError('Only PDF files are supported. Please choose a PDF resume.')
      return
    }
    if (candidate.size > 8 * 1024 * 1024) {
      setFile(null)
      setError('The resume must be 8 MB or smaller.')
      return
    }

    setError('')
    setFile(candidate)
  }

  async function handleAnalyze(event) {
    event.preventDefault()
    if (!file) {
      setError('Choose a PDF resume before starting the analysis.')
      return
    }
    if (role.trim().length < 2) {
      setError('Enter a target job role.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await analyzeResume(file, role.trim())
      setAnalysis(result)
      setHistory((current) => [
        {
          _id: result.id,
          filename: result.filename,
          targetJobRole: result.targetJobRole,
          score: result.analysis.overallScore,
          createdAt: result.createdAt,
        },
        ...current.filter((item) => item._id !== result.id),
      ])
      navigate('results')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function openSavedAnalysis(id) {
    try {
      setAnalysis(await getAnalysis(id))
      navigate('results')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    if (page !== 'history') return undefined

    let active = true
    getAnalyses()
      .then((analyses) => {
        if (active) setHistory(analyses)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setHistoryLoading(false)
      })

    return () => {
      active = false
    }
  }, [page])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#analyze" onClick={() => navigate('analyze')}>
          <span className="brand-mark"><Sparkles size={19} strokeWidth={2.3} /></span>
          <span>clearpath<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={page === 'analyze' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('analyze')}>
            <LayoutDashboard size={17} /><span>Analyze</span>
          </button>
          <button className={page === 'history' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('history')}>
            <History size={17} /><span>History</span>
            {history.length > 0 && <span className="nav-count">{history.length}</span>}
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-note"><span className="privacy-dot" />Resume text is not stored</div>
          <span className="sidebar-caption">Resume intelligence, made clear.</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><Sparkles size={17} /></span>clearpath<span className="brand-period">.</span></div>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{pageTitle(page)}</strong></div>
          <div className="topbar-status"><span className="status-dot" />AI-powered review</div>
        </header>

        {error && <div className="global-error" role="alert"><CircleAlert size={17} /><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button></div>}

        {page === 'analyze' && (
          <section className="page-content analyze-page">
            <div className="page-heading">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" />AI RESUME ANALYZER</div>
                <h1>Make your next move<br /><em>with confidence.</em></h1>
                <p className="page-intro">A thoughtful, role-specific review of your resume. Clear feedback, practical next steps.</p>
              </div>
              <div className="heading-stamp"><Sparkles size={18} /><span>YOUR NEXT<br />CHAPTER, CLEARER</span></div>
            </div>

            <div className="analyzer-layout">
              <form className="analyzer-form" onSubmit={handleAnalyze}>
                <div className="form-topline"><span>01</span><span>START YOUR REVIEW</span><div /></div>
                <div className="form-section">
                  <label className="field-label" htmlFor="resume-upload">Your resume <span>PDF only · up to 8 MB</span></label>
                  <div
                    className={`upload-zone ${file ? 'has-file' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInput.current?.click()}
                    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInput.current?.click() }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]) }}
                  >
                    <input ref={fileInput} id="resume-upload" type="file" accept="application/pdf,.pdf" onChange={(event) => chooseFile(event.target.files[0])} hidden />
                    {file ? (
                      <>
                        <div className="upload-icon file-icon"><FileText size={21} /></div>
                        <div className="upload-copy"><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to review</span></div>
                        <button type="button" className="remove-file" aria-label="Remove selected file" onClick={(event) => { event.stopPropagation(); setFile(null); if (fileInput.current) fileInput.current.value = '' }}><X size={17} /></button>
                      </>
                    ) : (
                      <>
                        <div className="upload-icon"><Upload size={20} /></div>
                        <div className="upload-copy"><strong>Drop your resume here</strong><span>or <span className="browse-link">browse files</span></span></div>
                        <span className="upload-format">PDF</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-section role-section">
                  <label className="field-label" htmlFor="target-role">Target job title <span>Be as specific as you like</span></label>
                  <div className="role-input-wrap"><ArrowDownRight size={17} /><input id="target-role" value={role} maxLength={100} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Senior Product Designer" /></div>
                </div>

                <div className="form-submit-row">
                  <span className="form-assurance"><Check size={14} />Only results are saved</span>
                  <button className="primary-button" type="submit" disabled={loading}>
                    {loading ? <><LoaderCircle size={17} className="spin" />Reviewing</> : <>Analyze resume<ArrowRight size={17} /></>}</button>
                </div>
              </form>

              <aside className="what-you-get">
                <div className="mini-label">A BETTER READ ON YOUR FIT</div>
                <h2>Good feedback<br />changes everything.</h2>
                <p>Get a clear picture of how your experience lines up with the role, and what to do next.</p>
                <div className="deliverables">
                  <div><span className="deliverable-number">01</span><span>Role fit score</span><Check size={15} /></div>
                  <div><span className="deliverable-number">02</span><span>Skills &amp; ATS keywords</span><Check size={15} /></div>
                  <div><span className="deliverable-number">03</span><span>Strengths &amp; gaps</span><Check size={15} /></div>
                  <div><span className="deliverable-number">04</span><span>Actionable next steps</span><Check size={15} /></div>
                </div>
                <div className="side-note"><span className="note-mark">“</span><span>Grounded in your resume.<br />Never guesswork.</span></div>
              </aside>
            </div>
            <footer className="page-footer"><span>Resume text is sent to Anthropic for review, not saved.</span><span>Clearpath is a decision aid <ArrowRight size={13} /></span></footer>
          </section>
        )}

        {page === 'results' && <ResultsPage analysis={analysis} onBack={() => navigate('analyze')} />}

        {page === 'history' && (
          <HistoryPage analyses={history} loading={historyLoading} onOpen={openSavedAnalysis} onAnalyze={() => navigate('analyze')} />
        )}
      </main>
    </div>
  )
}

function pageTitle(page) {
  if (page === 'history') return 'History'
  if (page === 'results') return 'Your results'
  return 'Analyze resume'
}

export default App
