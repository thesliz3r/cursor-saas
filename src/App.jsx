import { useState, useEffect, useCallback, useMemo } from 'react'
import './App.css'

// Separate component for History Item
const HistoryItem = ({ item, onRemove, onCopy }) => (
  <div className="history-item">
    <div className="history-content">
      <div className="fw-bold text-primary">{item.total} {item.currency}</div>
      <small className="text-muted">
        Base: {item.baseAmount} + VAT({item.rate}%): {item.vatAmount}
      </small>
    </div>
    <div className="history-actions">
      <button 
        className="btn btn-outline-primary btn-sm"
        onClick={() => onCopy(`${item.baseAmount} + ${item.vatAmount} = ${item.total} ${item.currency} (${item.rate}%)`)}
        title="Copy to clipboard"
      >
        <i className="bi bi-clipboard"></i>
      </button>
      <button 
        className="btn btn-outline-danger btn-sm"
        onClick={() => onRemove(item.id)}
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  </div>
);

// Constants
const CURRENCIES = [
  { code: 'AZN', symbol: '₼' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'RUB', symbol: '₽' }
];

const DEFAULT_VAT_RATES = [10, 18, 20];

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState(18);
  const [calculationType, setCalculationType] = useState('excluded');
  const [showInWords, setShowInWords] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [currency, setCurrency] = useState('AZN');

  // Apply theme effect
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  // Memoized calculation function
  const calculateVAT = useCallback(() => {
    if (!amount || isNaN(amount)) return;

    const numAmount = parseFloat(amount);
    const rate = parseFloat(vatRate);
    let baseAmount, vatAmount, totalAmount;

    if (calculationType === 'included') {
      baseAmount = numAmount / (1 + rate / 100);
      vatAmount = numAmount - baseAmount;
      totalAmount = numAmount;
    } else {
      baseAmount = numAmount;
      vatAmount = numAmount * (rate / 100);
      totalAmount = numAmount + vatAmount;
    }

    const result = {
      id: Date.now(),
      amount: numAmount,
      rate: rate,
      type: calculationType,
      baseAmount: baseAmount.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: totalAmount.toFixed(2),
      currency: currency
    };

    setCalculationResult(result);
    setHistory(prev => [result, ...prev]);
  }, [amount, vatRate, calculationType, currency]);

  // Memoized handlers
  const reset = useCallback(() => {
    setAmount('');
    setVatRate(18);
    setCalculationResult(null);
  }, []);

  const removeHistoryItem = useCallback((id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

  // Memoized currency options
  const currencyOptions = useMemo(() => 
    CURRENCIES.map(cur => (
      <option key={cur.code} value={cur.code}>
        {cur.code} {cur.symbol}
      </option>
    )), 
  []);

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-gradient-dark text-light' : 'bg-gradient-light text-dark'}`}>
      {/* Header */}
      <header className="navbar">
        <div className="container">
          <a className="navbar-brand" href="#">
            <i className="bi bi-calculator-fill"></i>
            VAT Calculator
          </a>
          <button 
            className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
            onClick={() => setIsDarkMode(prev => !prev)}
            aria-label="Toggle theme"
          >
            <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container my-4">
        <div className="calculator-card">
          <h4 className="text-center">Calculate VAT</h4>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <select 
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencyOptions}
            </select>
          </div>
          <div className="vat-rate-buttons">
            {DEFAULT_VAT_RATES.map((rate) => (
              <button
                key={rate}
                className={`btn ${vatRate === rate ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setVatRate(rate)}
              >
                {rate}%
              </button>
            ))}
            <input
              type="number"
              className="form-control"
              placeholder="Custom rate %"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
            />
          </div>
          <div className="options">
            <label>
              <input
                type="checkbox"
                checked={calculationType === 'included'}
                onChange={(e) => setCalculationType(e.target.checked ? 'included' : 'excluded')}
              />
              VAT Included in Amount
            </label>
            <label>
              <input
                type="checkbox"
                checked={showInWords}
                onChange={(e) => setShowInWords(e.target.checked)}
              />
              Show Amount in Words
            </label>
          </div>
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
            <button className="btn btn-primary" onClick={calculateVAT}>Calculate</button>
          </div>
          {calculationResult && (
            <div className="result">
              <div>Base Amount: {calculationResult.baseAmount} {currency}</div>
              <div>VAT ({calculationResult.rate}%): {calculationResult.vatAmount} {currency}</div>
              <div>Total Amount: {calculationResult.total} {currency}</div>
            </div>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="history-section">
            <h5>Calculation History</h5>
            {history.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onRemove={removeHistoryItem}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
