import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CaretDown,
  ChartBar,
  CheckCircle,
  DownloadSimple,
  DotsThreeVertical,
  Eye,
  FileArrowUp,
  MagnifyingGlass,
  Plus,
  Trash,
  X,
} from '@phosphor-icons/react';

const INITIAL_ROWS = [
  {
    id: 1,
    name: 'LK_PersonalLoan_Jun',
    model: 'Loan Model',
    status: 'Completed',
    customers: '38,240',
    date: '20/06/2026',
    owner: 'Marketing Growth',
  },
  {
    id: 2,
    name: 'LK_Saving_Q2',
    model: 'Savings Model',
    status: 'Running',
    customers: '—',
    date: '22/06/2026',
    owner: 'Deposit Campaign',
  },
  {
    id: 3,
    name: 'LK_CreditCard_VIP',
    model: 'Credit Card Model',
    status: 'Completed',
    customers: '12,830',
    date: '18/06/2026',
    owner: 'Card Acquisition',
  },
  {
    id: 4,
    name: 'LK_PersonalLoan_May',
    model: 'Loan Model',
    status: 'Completed',
    customers: '41,120',
    date: '02/06/2026',
    owner: 'Retail Lending',
  },
  {
    id: 5,
    name: 'LK_Mortgage_New',
    model: 'Mortgage Model',
    status: 'Draft',
    customers: '—',
    date: '21/06/2026',
    owner: 'Mortgage Team',
  },
  {
    id: 6,
    name: 'LK_Mortgage_Retry',
    model: 'Mortgage Model',
    status: 'Failed',
    customers: '—',
    date: '17/06/2026',
    owner: 'Mortgage Team',
  },
];

const STATUS_OPTIONS = ['All', 'Completed', 'Running', 'Draft', 'Failed'];
const MODEL_OPTIONS = ['All', 'Loan Model', 'Savings Model', 'Credit Card Model', 'Mortgage Model'];
const SCENARIOS = ['Personal Loan', 'Saving Account', 'Credit Card', 'Mortgage'];
const DATA_SOURCES = ['Choose File', 'Segment', 'Entire Base'];

function SelectControl({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  function choose(option) {
    onChange(option);
    setOpen(false);
  }

  return (
    <div className="select-control" ref={ref}>
      <button
        className={`select-trigger ${open ? 'is-open' : ''}`}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{label}: {value}</span>
        <CaretDown size={16} weight="bold" />
      </button>
      {open ? (
        <div className="select-menu">
          {options.map((option) => (
            <button
              className={option === value ? 'is-selected' : ''}
              key={option}
              type="button"
              onClick={() => choose(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>;
}

function ActionMenu({ row, open, onToggle, onView, onDelete }) {
  return (
    <div className="row-actions">
      <button
        className={`icon-button ${open ? 'is-active' : ''}`}
        type="button"
        aria-label={`Open actions for ${row.name}`}
        onClick={onToggle}
      >
        <DotsThreeVertical size={22} weight="bold" />
      </button>
      {open ? (
        <div className="action-menu">
          <button type="button" onClick={onView}>
            <Eye size={16} weight="bold" />
            <span>View</span>
          </button>
          <div className="menu-divider" />
          <button className="danger" type="button" onClick={onDelete}>
            <Trash size={16} weight="bold" />
            <span>Delete</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AddModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [model, setModel] = useState('Loan Model');

  if (!open) return null;

  function submit(event) {
    event.preventDefault();
    const cleanName = name.trim() || 'LK_New_Process';
    onCreate({
      name: cleanName,
      model,
      status: 'Draft',
      customers: '—',
      date: '26/06/2026',
      owner: 'Marketing Growth',
    });
    setName('');
    setModel('Loan Model');
  }

  return (
    <div className="overlay" role="presentation">
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">New Process</p>
            <h2>Create Lookalike Process</h2>
          </div>
          <button className="ghost-icon" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} weight="bold" />
          </button>
        </div>
        <label className="field">
          <span>Process Name</span>
          <input
            autoFocus
            value={name}
            placeholder="LK_Product_Campaign"
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Project Model</span>
          <select value={model} onChange={(event) => setModel(event.target.value)}>
            {MODEL_OPTIONS.filter((option) => option !== 'All').map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit">Create Draft</button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDelete({ row, onCancel, onConfirm }) {
  if (!row) return null;
  return (
    <div className="overlay" role="presentation">
      <div className="modal confirm-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow danger-text">Delete Process</p>
            <h2>{row.name}</h2>
          </div>
          <button className="ghost-icon" type="button" aria-label="Close" onClick={onCancel}>
            <X size={18} weight="bold" />
          </button>
        </div>
        <p className="confirm-copy">This process will be removed from the process list.</p>
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>
          <button className="danger-button" type="button" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({ row, onClose }) {
  if (!row) return null;
  const customersFound = row.customers === '—' ? '38,240' : row.customers;
  const features = [
    ['Avg income 30m', 89, 'dark'],
    ['Avg CASA balance', 82, 'dark'],
    ['Internal credit score', 75, 'blue'],
    ['Txn frequency/month', 68, 'blue'],
    ['Age group 30-45', 61, 'green'],
    ['Products held', 55, 'green'],
    ['App interaction channel', 48, 'red'],
  ];
  const comparisons = [
    ['Average Age', 'Seed: 38.2 yrs', 'Lookalike: 37.8 yrs', 72, 92],
    ['Average Income', 'Seed: 28.5M', 'Lookalike: 26.9M', 58, 78],
    ['Avg CASA Balance', 'Seed: 145M', 'Lookalike: 138M', 64, 84],
    ['Avg Products Held', 'Seed: 2.8', 'Lookalike: 2.5', 70, 96],
    ['% Hanoi Region', 'Seed: 34%', 'Lookalike: 31%', 58, 78],
    ['% Main App Channel', 'Seed: 78%', 'Lookalike: 71%', 66, 86],
  ];

  return (
    <div className="detail-overlay">
      <header className="topbar">
        <nav aria-label="Breadcrumb">Lookalike&nbsp;&nbsp;/&nbsp;&nbsp;{row.name}&nbsp;&nbsp;/&nbsp;&nbsp;Process Detail</nav>
      </header>
      <section className="detail-page">
        <div className="detail-title-row">
          <div className="detail-title-left">
            <button className="ref-back" type="button" aria-label="Back to process list" onClick={onClose}>
              <ArrowLeft size={18} weight="bold" />
            </button>
            <h1>{row.name}</h1>
            <StatusBadge status={row.status === 'Running' ? 'Completed' : row.status} />
          </div>
          <span className="detail-run-time">Run at: {row.date} 09:14</span>
        </div>

        <section className="detail-config detail-card">
          <h2>Configuration Used</h2>
          <div><span>Project Model:</span><strong>{row.model}, Credit Card Model</strong></div>
          <div><span>Sample Data:</span><strong>Ready to Use Data - 5,200 customers</strong></div>
          <div><span>Potential Data:</span><strong>Segment_Retail_HN - 480,000 customers</strong></div>
          <div><span>Similarity Threshold:</span><strong>0.70&nbsp;&nbsp;•&nbsp;&nbsp;Top List: 10</strong></div>
        </section>

        <div className="detail-section-header">
          <h2>Results Overview</h2>
          <button className="outline-action" type="button"><Eye size={16} weight="bold" /> View Details</button>
        </div>

        <section className="overview-grid">
          <div className="metric-card dark-edge"><span>Sample Size</span><strong>5,200</strong><small>Ready to Use Data</small></div>
          <div className="metric-card blue-edge"><span>Lookalike Customers Found</span><strong>{customersFound}</strong><small>Met threshold &gt;= 70%</small></div>
          <div className="metric-card green-edge"><span>Avg Similarity Score</span><strong>76.4%</strong><small>Within matched group</small></div>
          <div className="metric-card red-edge"><span>Match Rate</span><strong>8.0%</strong><small>vs. Potential Population</small></div>
        </section>

        <section className="detail-two-col">
          <div className="detail-card chart-card">
            <h2>Similarity Score Distribution</h2>
            <div className="histogram">
              {[18, 24, 34, 52, 68, 88, 82, 74, 56, 38, 20].map((height, index) => (
                <div className="hist-bar" key={index} style={{ height: `${height}%` }} />
              ))}
              <div className="threshold-line"><span>Threshold 70%</span></div>
            </div>
            <div className="axis-row">{[50, 55, 60, 65, 70, 75, 80, 85, 90, 95].map((tick) => <span key={tick}>{tick}</span>)}</div>
          </div>
          <div className="detail-card feature-card">
            <h2>Top Important Features</h2>
            {features.map(([label, value, tone]) => (
              <div className="feature-row" key={label}>
                <span>{label}</span>
                <div><i className={`feature-fill ${tone}`} style={{ width: `${value}%` }} /></div>
                <strong>{value}%</strong>
              </div>
            ))}
          </div>
        </section>

        <h2 className="detail-block-title">Customer360 Comparison - Seed vs Lookalike</h2>
        <section className="comparison-grid">
          {comparisons.map(([title, seed, lookalike, seedWidth, lookalikeWidth]) => (
            <div className="comparison-card detail-card" key={title}>
              <h3>{title}</h3>
              <p><span className="dot dark" />{seed}</p>
              <p><span className="dot blue" />{lookalike}</p>
              <div className="mini-bar dark" style={{ width: `${seedWidth}%` }} />
              <div className="mini-bar blue" style={{ width: `${lookalikeWidth}%` }} />
            </div>
          ))}
        </section>

        <section className="insight-card">
          <h2>AI Insight - Automatic Summary</h2>
          <p>• Age group 30-45 makes up 62% of the Lookalike set - the largest age segment.</p>
          <p>• Average income and CASA balance are the two strongest decision drivers.</p>
          <p>• Mainly concentrated in Hanoi (34%), Ho Chi Minh City (28%), Da Nang (11%).</p>
          <p>• Recommendation: prioritize 12,830 customers with score &gt; 85% for Lead creation first.</p>
        </section>

        <h2 className="detail-block-title">Lead & Segment Status</h2>
        <section className="status-grid">
          <div className="detail-card status-card">
            <CheckCircle size={28} weight="fill" />
            <div>
              <h3>Pushed to CRM</h3>
              <p>Time: 20/06/2026 09:22 • 38,240 Leads</p>
              <button className="outline-action" type="button">View Leads in CRM</button>
            </div>
          </div>
          <div className="detail-card status-card blue">
            <CheckCircle size={28} weight="fill" />
            <div>
              <h3>Segment Created</h3>
              <p>Name: Segment_Lookalike_Loan_Jun • 38,240 customers</p>
              <button className="outline-action" type="button">View Segment</button>
            </div>
          </div>
        </section>

        <section className="detail-card conversion-card">
          <div className="conversion-head">
            <h2>Conversion Rate</h2>
            <span>Last updated: 22/06/2026 14:30</span>
            <button className="outline-action" type="button"><Eye size={16} weight="bold" /> View Details</button>
          </div>
          <div className="funnel-row dark" style={{ width: '78%' }}>Leads Created (from Lookalike): {customersFound}</div>
          <div className="funnel-row blue" style={{ width: '58%' }}>Contacted (CRM): 26,400</div>
          <div className="funnel-row purple" style={{ width: '22%' }}>Interested (CRM): 6,800</div>
          <div className="funnel-row green" style={{ width: '12%' }}>Converted (CRM): 3,120</div>
          <div className="conversion-stats">
            <div><span>Conversion Rate</span><strong>8.16%</strong></div>
            <div><span>Cost / Lead</span><strong>$3.95</strong></div>
            <div><span>Cost / Convert</span><strong>$41.06</strong></div>
            <div><span>Estimated ROI</span><strong>14.6x</strong></div>
          </div>
        </section>
      </section>
    </div>
  );
}

function OptionCard({ title, meta, selected, onClick }) {
  return (
    <button className={`option-card ${selected ? 'is-selected' : ''}`} type="button" onClick={onClick}>
      <span>{title}</span>
      <small>{meta}</small>
    </button>
  );
}

function CreateProcessPage({ onBack }) {
  const projectModelOptions = [
    { name: 'Loan Model', metric: 'KS/AUC  0.42 / 0.81' },
    { name: 'Savings Model', metric: 'KS/AUC  0.38 / 0.77' },
    { name: 'Credit Card Model', metric: 'KS/AUC  0.35 / 0.74' },
    { name: 'Mortgage Model', metric: 'KS/AUC  0.30 / 0.71' },
  ];
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const scenarioRef = useRef(null);
  const [projectName, setProjectName] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [sampleSource, setSampleSource] = useState('file');
  const [scoringSource, setScoringSource] = useState('file');
  const [scoringFileUploaded, setScoringFileUploaded] = useState(false);
  const [sampleAnalyzed, setSampleAnalyzed] = useState(false);
  const [scoringAnalyzed, setScoringAnalyzed] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState('0.1');
  const [topList, setTopList] = useState('10');
  const [generated, setGenerated] = useState(false);
  const [modelModal, setModelModal] = useState(null);
  const [featureModal, setFeatureModal] = useState(null);
  const [confirmSource, setConfirmSource] = useState(null);
  const selectedModelText = selectedModels.length === 0
    ? 'Please select'
    : selectedModels.join(', ');
  const canAnalyze = selectedModels.length > 0;
  const canAnalyzeScoring = canAnalyze && (scoringSource !== 'file' || scoringFileUploaded);
  const canGenerate = sampleAnalyzed && scoringAnalyzed;

  useEffect(() => {
    function closeScenarioDropdown(event) {
      if (!scenarioRef.current?.contains(event.target)) {
        setScenarioOpen(false);
      }
    }

    document.addEventListener('click', closeScenarioDropdown);
    return () => document.removeEventListener('click', closeScenarioDropdown);
  }, []);

  function toggleProjectModel(modelName) {
    setSelectedModels((current) => (
      current.includes(modelName)
        ? current.filter((name) => name !== modelName)
        : [...current, modelName]
    ));
    setSampleAnalyzed(false);
    setScoringAnalyzed(false);
    setGenerated(false);
  }

  function chooseSampleSource(source) {
    setSampleSource(source);
    setSampleAnalyzed(false);
    setGenerated(false);
  }

  function chooseScoringSource(source) {
    setScoringSource(source);
    setScoringFileUploaded(false);
    setScoringAnalyzed(false);
    setGenerated(false);
  }

  function confirmScoringSource() {
    if (!confirmSource) return;
    setScoringAnalyzed(true);
    setGenerated(false);
    setConfirmSource(null);
  }

  function analyzeScoringFeatures() {
    if (scoringSource === 'segment' || scoringSource === 'entireBase') {
      setConfirmSource(scoringSource);
      return;
    }
    setScoringAnalyzed(true);
  }

  function stepNumber(value, setter, step, min = 0) {
    const current = Number.parseFloat(value);
    const next = Math.max(min, (Number.isFinite(current) ? current : 0) + step);
    setter(String(Number.isInteger(step) ? Math.round(next) : Number(next.toFixed(1))));
  }

  function featureRows() {
    return [
      ['Age', 'Customer age used to measure the customer lifecycle stage'],
      ['Average_transaction_amount', 'Average Transaction Amount, used to measure spending capacity'],
      ['Income', 'Income Level, reflecting financial strength'],
      ['Assets', 'Total Assets Held, used to assess investment capacity'],
      ['liabilities', 'Liability Status, used for risk assessment'],
      ['Purchase_history', 'Historical Purchase Frequency or Amount, indicating customer loyalty and preferences'],
      ['Credit_score', 'Credit Score, reflecting credit risk'],
      ['Loyalty_score', 'Loyalty Score, used to measure the strength of customer relationships'],
    ];
  }

  function FeatureResult({ title }) {
    return (
      <section className="ref-table-card feature-result-card">
        {title ? <h3>{title}</h3> : null}
        <h4>Numeric Features</h4>
        <div className="ref-table-scroll">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Description</th>
                <th>Training Missing</th>
                <th>Scoring Missing</th>
                <th>Mean</th>
                <th>Std Dev</th>
                <th>Min</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              {featureRows().map(([field, description]) => (
                <tr key={field}>
                  <td>{field}</td>
                  <td>{description}</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h4>Categorical Features</h4>
        <div className="token-grid">
          <strong>Training Top Tokens</strong>
          <div>{['Books(212)', 'Sports(212)', 'Music(212)', 'Music(212)', 'Music(212)', 'Music(212)', 'Music(212)', 'Music(212)'].map((token, index) => <span key={`${token}-${index}`}>{token}</span>)}</div>
          <strong>Potential Top Tokens</strong>
          <div>{['Gaming(1052)', 'Books(1051)', 'Sports(212)', 'Sports(212)', 'Sports(212)', 'Sports(212)', 'Sports(212)', 'Sports(212)'].map((token, index) => <span key={`${token}-${index}`}>{token}</span>)}</div>
        </div>
      </section>
    );
  }

  return (
    <main className="process-app">
      <header className="topbar">
        <nav aria-label="Breadcrumb">Lookalike&nbsp;&nbsp;/&nbsp;&nbsp;Process List&nbsp;&nbsp;/&nbsp;&nbsp;New Process</nav>
      </header>

      <section className="ref-page">
        <div className="ref-header">
          <button className="ref-back" type="button" aria-label="Back to process list" onClick={onBack}>
            <ArrowLeft size={18} weight="bold" />
          </button>
          <h1>Lookalike Modeling</h1>
        </div>

        <section className="ref-query-card">
          <div className="ref-query-body">
            <div className="ref-stack">
              <section className="ref-section">
                <h2>Project Name</h2>
                <input
                  className="ref-text-input"
                  value={projectName}
                  placeholder="Please enter project name"
                  onChange={(event) => setProjectName(event.target.value)}
                />
              </section>

              <section className="ref-section">
                <h2>Select Lookalike Scenario</h2>
                <div className="ref-select-wrap" ref={scenarioRef}>
                  <button className="ref-select-trigger" type="button" onClick={() => setScenarioOpen((open) => !open)}>
                    <span>{selectedModelText}</span>
                    <CaretDown size={14} weight="bold" />
                  </button>
                  {scenarioOpen ? (
                    <div className="ref-select-menu">
                      {projectModelOptions.map((option) => (
                        <div className="ref-select-option model-option" key={option.name}>
                          <button type="button" onClick={() => toggleProjectModel(option.name)}>
                            <span className={`ref-checkbox ${selectedModels.includes(option.name) ? 'is-checked' : ''}`} />
                            <span>{option.name}</span>
                            <small>{option.metric}</small>
                          </button>
                          <button className="ref-info" type="button" aria-label={`Model information for ${option.name}`} onClick={() => setModelModal(option)}>
                            i
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="ref-section">
                <h2>Sample Data CSV</h2>
                <div className="ref-button-row">
                  <button className={`ref-btn ${sampleAnalyzed ? 'ref-btn-secondary' : 'ref-btn-primary'}`} type="button" disabled={!canAnalyze} onClick={() => setSampleAnalyzed(true)}>
                    Analyze Features
                  </button>
                  {sampleAnalyzed ? <button className="ref-btn ref-btn-primary" type="button" onClick={() => setFeatureModal('sample')}>View</button> : null}
                </div>
              </section>

              <section className="ref-section">
                <h2>Scoring Data</h2>
                <div className="ref-radio-panel">
                  {[
                    ['file', 'Choose File'],
                    ['segment', 'Segment'],
                    ['entireBase', 'Entire base'],
                  ].map(([value, label]) => (
                    <button className={`ref-radio ${scoringSource === value ? 'is-selected' : ''}`} key={value} type="button" onClick={() => chooseScoringSource(value)}>
                      <span className="ref-radio-dot" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                {canAnalyze && scoringSource === 'file' ? (
                  <div className="ref-button-row">
                    <button className="ref-btn ref-btn-primary" type="button" onClick={() => setScoringFileUploaded(true)}>Choose File</button>
                    {scoringFileUploaded ? <span className="ref-hint">potential_XXXXXXXXXXXXXXXX_data.CSV</span> : null}
                  </div>
                ) : null}
                <div className="ref-button-row">
                  <button className={`ref-btn ${scoringAnalyzed ? 'ref-btn-secondary' : 'ref-btn-primary'}`} type="button" disabled={!canAnalyzeScoring} onClick={analyzeScoringFeatures}>
                    Analyze Features
                  </button>
                  {scoringAnalyzed ? <button className="ref-btn ref-btn-primary" type="button" onClick={() => setFeatureModal('scoring')}>View</button> : null}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="ref-bottom-panel">
          <label className="ref-field">
            <span>Select Lookalike Scenario</span>
            <div className="ref-stepper">
              <input value={similarityThreshold} onChange={(event) => setSimilarityThreshold(event.target.value)} />
              <div>
                <button type="button" onClick={() => stepNumber(similarityThreshold, setSimilarityThreshold, 0.1)}>⌃</button>
                <button type="button" onClick={() => stepNumber(similarityThreshold, setSimilarityThreshold, -0.1)}>⌄</button>
              </div>
            </div>
          </label>
          <label className="ref-field">
            <span>Top List</span>
            <div className="ref-stepper">
              <input value={topList} onChange={(event) => setTopList(event.target.value)} />
              <div>
                <button type="button" onClick={() => stepNumber(topList, setTopList, 1, 1)}>⌃</button>
                <button type="button" onClick={() => stepNumber(topList, setTopList, -1, 1)}>⌄</button>
              </div>
            </div>
          </label>
          <div className="ref-button-row ref-bottom-actions">
            <button className="ref-btn ref-btn-primary" type="button" disabled={!canGenerate} onClick={() => setGenerated(true)}>
              <ChartBar size={16} weight="bold" />
              Generate Match Table
            </button>
            <button className="ref-btn ref-btn-secondary" type="button" disabled={!generated}>
              <DownloadSimple size={16} weight="bold" />
              Download
            </button>
            <button className="ref-btn ref-btn-secondary" type="button" disabled={!generated}>
              <FileArrowUp size={16} weight="bold" />
              Import into segment
            </button>
          </div>
        </section>

        {generated ? (
          <section className="ref-table-card">
            <h3>Total Records: 20,873,629</h3>
            <h4>Train_Data</h4>
            <div className="ref-table-scroll">
              <table className="ref-table">
                <thead>
                  <tr>
                    {['Age', 'Gender', 'City', 'transaction_frequency', 'Average_transaction_amount', 'Income', 'Assets', 'Liabilities', 'Purchase_history', 'Area', 'Channel', 'Product'].map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }, (_, index) => (
                    <tr key={index}>
                      <td>{25 + index}</td>
                      <td>{index % 2 ? 'female' : 'male'}</td>
                      <td>{['Tokyo', 'Ho Chi Minh City', 'Shanghai'][index % 3]}</td>
                      <td>{1 + (index % 4)}</td>
                      <td>{(780 + index * 49.7).toFixed(2)}</td>
                      <td>{(46000 + index * 1170).toFixed(0)}</td>
                      <td>{(166000 + index * 9320).toFixed(0)}</td>
                      <td>{(48000 + index * 2100).toFixed(0)}</td>
                      <td>{13 + index}</td>
                      <td>{['urban', 'suburban', 'rural'][index % 3]}</td>
                      <td>{['online', 'offline_store', 'app', 'website'][index % 4]}</td>
                      <td>{['wealth', 'insurance', 'mortgage', 'loan'][index % 4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination-row">
              <span>Showing 1 to 10 of 100 records</span>
              <div><button type="button">10 per page</button><button type="button">‹</button><strong>1</strong><button type="button">2</button><button type="button">3</button><button type="button">4</button><button type="button">5</button><button type="button">›</button></div>
            </div>
          </section>
        ) : null}
      </section>

      {modelModal ? (
        <div className="ref-modal-backdrop">
          <div className="ref-modal model-info-modal">
            <div className="ref-modal-head">
              <div>
                <strong>{modelModal.name} - Model Information</strong>
              </div>
              <button className="ref-modal-close" type="button" onClick={() => setModelModal(null)}>×</button>
            </div>
            <div className="ref-modal-body">
              <table className="model-info-table">
                <thead><tr><th>Item</th><th>Content</th></tr></thead>
                <tbody>
                  <tr><td>Model Description</td><td>{modelModal.name} • v2.4 • Personal Loan product<br />Updated: 05/06/2026 • Team: Risk Analytics</td></tr>
                  <tr><td>Important Feature List</td><td>Avg income 3M (30%) • Avg CASA balance (25%)<br />Credit history (20%) • Age (15%) • Txn frequency (10%)</td></tr>
                  <tr><td>Time Window</td><td>Hist: last 12 months of data<br />Performance: 01/2025-12/2025 • {modelModal.metric.replace('KS/AUC  ', 'KS ')} </td></tr>
                  <tr><td>Exclusion Recommend</td><td>Customers already owning the product • Blacklist<br />Marketing opt-out • Has another open Lead</td></tr>
                </tbody>
              </table>
            </div>
            <p className="modal-note">View-only information - cannot be edited here.</p>
          </div>
        </div>
      ) : null}
      {featureModal ? (
        <div className="ref-modal-backdrop">
          <div className="feature-modal">
            <div className="ref-modal-head">
              <div><strong>{featureModal === 'sample' ? 'Sample Data' : 'Scoring Data'} - Feature Analysis Result</strong></div>
              <button className="ref-modal-close" type="button" onClick={() => setFeatureModal(null)}>×</button>
            </div>
            <FeatureResult title="" />
          </div>
        </div>
      ) : null}
      {confirmSource ? (
        <div className="ref-modal-backdrop">
          <div className="confirm-source-modal">
            <div className="ref-modal-head">
              <div><strong>Confirm Data Scope</strong></div>
              <button className="ref-modal-close" type="button" onClick={() => setConfirmSource(null)}>×</button>
            </div>
            <div className="ref-modal-body">
              <p>This option will scan a large customer population before analysis.</p>
              <p><strong>Estimated processing time:</strong> {confirmSource === 'entireBase' ? '35-45 minutes' : '12-18 minutes'}</p>
            </div>
            <div className="ref-modal-actions">
              <button className="ref-btn ref-btn-secondary" type="button" onClick={() => setConfirmSource(null)}>Cancel</button>
              <button className="ref-btn ref-btn-primary" type="button" onClick={confirmScoringSource}>Confirm</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export function App() {
  const [screen, setScreen] = useState(() => (window.location.hash === '#/create' ? 'create' : 'list'));
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [model, setModel] = useState('All');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [drawerRow, setDrawerRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    function syncScreenFromHash() {
      setScreen(window.location.hash === '#/create' ? 'create' : 'list');
    }

    window.addEventListener('hashchange', syncScreenFromHash);
    return () => window.removeEventListener('hashchange', syncScreenFromHash);
  }, []);

  useEffect(() => {
    function closeMenu(event) {
      if (!event.target.closest('.row-actions')) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !term || row.name.toLowerCase().includes(term);
      const matchesStatus = status === 'All' || row.status === status;
      const matchesModel = model === 'All' || row.model === model;
      return matchesSearch && matchesStatus && matchesModel;
    });
  }, [model, rows, search, status]);

  function deleteSelected() {
    if (!deleteRow) return;
    setRows((current) => current.filter((row) => row.id !== deleteRow.id));
    setToast('Process deleted');
    setDeleteRow(null);
    setOpenMenuId(null);
  }

  function openCreatePage() {
    window.location.hash = '#/create';
    setScreen('create');
  }

  function openListPage() {
    window.location.hash = '';
    setScreen('list');
  }

  if (screen === 'create') {
    return <CreateProcessPage onBack={openListPage} />;
  }

  return (
    <main className="process-app">
      <header className="topbar">
        <nav aria-label="Breadcrumb">Lookalike&nbsp;&nbsp;/&nbsp;&nbsp;Process List</nav>
      </header>

      <section className="page-shell">
        <div className="page-header">
          <h1>Lookalike Process List</h1>
          <button
            className="add-button"
            type="button"
            onClick={openCreatePage}
          >
            <Plus size={20} weight="bold" />
            <span>ADD</span>
          </button>
        </div>

        <div className="filter-bar">
          <label className="search-field">
            <MagnifyingGlass size={18} weight="bold" />
            <input
              value={search}
              placeholder="Search by process name..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <SelectControl label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
          <SelectControl label="Project Model" value={model} options={MODEL_OPTIONS} onChange={setModel} />
        </div>

        <div className="table-surface">
          <table>
            <thead>
              <tr>
                <th>Process Name</th>
                <th>Project Model</th>
                <th>Status</th>
                <th>Customers Found</th>
                <th>Run Date</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="process-name">{row.name}</td>
                  <td>{row.model}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{row.customers}</td>
                  <td>{row.date}</td>
                  <td>
                    <ActionMenu
                      row={row}
                      open={openMenuId === row.id}
                      onToggle={() => setOpenMenuId((current) => (current === row.id ? null : row.id))}
                      onView={() => {
                        setDrawerRow(row);
                        setOpenMenuId(null);
                      }}
                      onDelete={() => setDeleteRow(row)}
                    />
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="empty-state" colSpan={6}>No matching processes</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmDelete row={deleteRow} onCancel={() => setDeleteRow(null)} onConfirm={deleteSelected} />
      <DetailDrawer row={drawerRow} onClose={() => setDrawerRow(null)} />
      {toast ? (
        <div className="toast" onAnimationEnd={() => setToast('')}>{toast}</div>
      ) : null}
    </main>
  );
}
