import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { translations, convertToWords } from './translations'
import './App.css'

// Language switcher component
const LanguageSwitcher = ({ currentLang, onLanguageChange }) => (
  <div className="language-switcher">
    <button 
      className={`lang-btn ${currentLang === 'en' ? 'active' : ''}`}
      onClick={() => onLanguageChange('en')}
    >
      EN
    </button>
    <button 
      className={`lang-btn ${currentLang === 'az' ? 'active' : ''}`}
      onClick={() => onLanguageChange('az')}
    >
      AZ
    </button>
    <button 
      className={`lang-btn ${currentLang === 'ru' ? 'active' : ''}`}
      onClick={() => onLanguageChange('ru')}
    >
      RU
    </button>
  </div>
);

// Separate component for History Item with improved design
const HistoryItem = ({ item, onRemove, onCopy, t }) => (
  <div className="history-item hover-effect">
    <div className="history-content animate-text">
      <div className="amount-display">
        <span className="total-amount">{item.total} {item.currency}</span>
        <div className="calculation-details">
          {t.baseAmount}: {item.baseAmount} + {t.vatAmount}({item.rate}%): {item.vatAmount}
        </div>
      </div>
    </div>
    <div className="history-actions">
      <button 
        className="action-button copy-btn btn-hover-effect"
        onClick={() => onCopy(`${item.baseAmount} + ${item.vatAmount} = ${item.total} ${item.currency} (${item.rate}%)`)}
        title={t.copyToClipboard}
      >
        <i className="bi bi-clipboard"></i>
      </button>
      <button 
        className="action-button delete-btn btn-hover-effect"
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
  const [language, setLanguage] = useState('az');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState(18);
  const [calculationType, setCalculationType] = useState('excluded');
  const [showInWords, setShowInWords] = useState(true);
  const [calculationResult, setCalculationResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [currency, setCurrency] = useState('AZN');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    base: false,
    vat: false,
    total: false
  });
  const [copiedHistoryId, setCopiedHistoryId] = useState(null);
  const [copiedBreakdownId, setCopiedBreakdownId] = useState(null);

  // Add ref for input focus
  const amountInputRef = useRef(null);

  // Get translations for current language
  const t = translations[language];

  // Apply theme effect
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  // Focus amount input on mount
  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

  // Enhanced calculation function
  const calculateVAT = useCallback(() => {
    if (!amount || isNaN(amount) || !vatRate || isNaN(vatRate)) {
      return;
    }

    setIsCalculating(true);
    
    setTimeout(() => {
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
        currency: currency,
        timestamp: new Date().toISOString()
      };

      setCalculationResult(result);
      setHistory(prev => [result, ...prev]);
      setIsCalculating(false);
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 1000);
    }, 300);
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

  const handleCopy = useCallback((text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 1000);
    });
  }, []);

  const handleHistoryItemCopy = useCallback((item) => {
    const text = `${t.baseAmount}: ${item.baseAmount} ${item.currency}
${t.vatAmount}: ${item.vatAmount} ${item.currency} (${item.rate}%)
${t.totalAmount}: ${item.total} ${item.currency}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedHistoryId(item.id);
      setTimeout(() => {
        setCopiedHistoryId(null);
      }, 1000);
    });
  }, [t]);

  const handleBreakdownCopy = useCallback((item, type) => {
    let text;
    switch(type) {
      case 'base':
        text = `ƏDVSİZ MƏBLƏĞ: ${item.baseAmount} ${item.currency}`;
        break;
      case 'vat':
        text = `ƏDV (${item.rate}%): ${item.vatAmount} ${item.currency}`;
        break;
      case 'total':
        text = `ƏDVLİ MƏBLƏĞ: ${item.total} ${item.currency}`;
        break;
      default:
        text = '';
    }
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBreakdownId(`${item.id}-${type}`);
      setTimeout(() => {
        setCopiedBreakdownId(null);
      }, 1000);
    });
  }, []);

  // Memoized currency options
  const currencyOptions = useMemo(() => 
    CURRENCIES.map(cur => (
      <option key={cur.code} value={cur.code}>
        {cur.code} {cur.symbol}
      </option>
    )), 
  []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 0 && value.length <= 15)) {
      setAmount(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && amount && !isNaN(amount)) {
      calculateVAT();
    }
  };

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleVatRateChange = (e) => {
    const value = e.target.value.replace('%', '');
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
      setVatRate(value);
    }
  };

  return (
    <div className={`app-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <SpeedInsights />
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">{t.title}</h1>
          </div>
          <div className="header-controls">
            <LanguageSwitcher 
              currentLang={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      <main className="main-container">
        <div className="calculator-section">
          {/* Amount Input Section */}
          <div className="input-group modern-input">
            <input
              type="number"
              className="amount-input"
              value={amount}
              onChange={handleAmountChange}
              onKeyPress={handleKeyPress}
              placeholder={t.enterAmount}
              min="0"
              step="0.01"
              ref={amountInputRef}
            />
            <select 
              className="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencyOptions}
            </select>
          </div>

          {/* Show in Words Option */}
          <label className="show-words-option">
            <input
              type="checkbox"
              checked={showInWords}
              onChange={(e) => setShowInWords(e.target.checked)}
            />
            <span>{t.showInWords}</span>
          </label>

          {/* VAT Rate Selection */}
          <div className="vat-rate-section">
            <button
              className={`rate-button ${vatRate === '10' ? 'active' : ''}`}
              onClick={() => setVatRate('10')}
            >
              10%
            </button>
            <button
              className={`rate-button ${vatRate === '18' ? 'active' : ''}`}
              onClick={() => setVatRate('18')}
            >
              18%
            </button>
            <button
              className={`rate-button ${vatRate === '20' ? 'active' : ''}`}
              onClick={() => setVatRate('20')}
            >
              20%
            </button>
            <button
              className={`rate-button ${![10, 18, 20].includes(vatRate) ? 'active' : ''}`}
              onClick={() => setVatRate('')}
            >
              {t.custom}
            </button>
            {![10, 18, 20].includes(vatRate) && (
              <input
                type="text"
                className="custom-rate"
                value={vatRate ? `${vatRate}%` : ''}
                onChange={handleVatRateChange}
                placeholder="%"
                onFocus={(e) => {
                  const value = e.target.value.replace('%', '');
                  e.target.value = value;
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    e.target.value = `${e.target.value}%`;
                  }
                }}
              />
            )}
          </div>

          {/* VAT Type Selection */}
          <div className="vat-type-buttons">
            <button
              className={`vat-type-button ${calculationType === 'excluded' ? 'active' : ''}`}
              onClick={() => setCalculationType('excluded')}
            >
              {t.vatExcluded}
            </button>
            <button
              className={`vat-type-button ${calculationType === 'included' ? 'active' : ''}`}
              onClick={() => setCalculationType('included')}
            >
              {t.vatIncluded}
            </button>
          </div>

          <div className="button-group">
            <button 
              className={`calculate-button ${isCalculating ? 'loading' : ''}`}
              onClick={calculateVAT}
              disabled={isCalculating || !amount || isNaN(amount)}
            >
              {t.calculate}
            </button>
            <button 
              className="reset-button"
              onClick={reset}
              disabled={isCalculating || (!amount && !calculationResult)}
            >
              {t.reset}
            </button>
          </div>

          {/* Results Section */}
          {calculationResult && (
            <div className={`result-card ${showSuccess ? 'calculation-success' : ''}`}>
              <div className="result-grid">
                <div>
                  <div 
                    className={`result-item ${copiedStates.base ? 'copied' : ''}`}
                    onClick={() => handleCopy(`${calculationResult.baseAmount} ${currency}`, 'base')}
                  >
                    <div className="result-label">{t.baseAmount}</div>
                    <div className="result-value">{calculationResult.baseAmount} {currency}</div>
                  </div>
                  {showInWords && (
                    <div className="result-item words">
                      {convertToWords(parseFloat(calculationResult.baseAmount), language, currency)}
                    </div>
                  )}
                </div>

                <div>
                  <div 
                    className={`result-item ${copiedStates.vat ? 'copied' : ''}`}
                    onClick={() => handleCopy(`${calculationResult.vatAmount} ${currency}`, 'vat')}
                  >
                    <div className="result-label">{t.vatAmount}</div>
                    <div className="result-value">{calculationResult.vatAmount} {currency}</div>
                  </div>
                  {showInWords && (
                    <div className="result-item words">
                      {convertToWords(parseFloat(calculationResult.vatAmount), language, currency)}
                    </div>
                  )}
                </div>

                <div>
                  <div 
                    className={`result-item total ${copiedStates.total ? 'copied' : ''}`}
                    onClick={() => handleCopy(`${calculationResult.total} ${currency}`, 'total')}
                  >
                    <div className="result-label">{t.totalAmount}</div>
                    <div className="result-value">{calculationResult.total} {currency}</div>
                  </div>
                  {showInWords && (
                    <div className="result-item words">
                      {convertToWords(parseFloat(calculationResult.total), language, currency)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="history-section">
            <div className="history-header">
              <h2 className="section-title">HESABLAM TARİXÇƏSİ</h2>
              <button 
                className="clear-history-button"
                onClick={clearHistory}
              >
                TARİXÇƏNİ TƏMİZLƏ
              </button>
            </div>
            <div className="history-list">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className={`history-item ${copiedHistoryId === item.id ? 'copied' : ''}`}
                  onClick={() => handleHistoryItemCopy(item)}
                >
                  <div className="history-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">ƏDVSİZ MƏBLƏĞ</span>
                      <span className="breakdown-value">{item.baseAmount} {item.currency}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">ƏDV ({item.rate}%)</span>
                      <span className="breakdown-value">{item.vatAmount} {item.currency}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">ƏDVLİ MƏBLƏĞ</span>
                      <span className="breakdown-value">{item.total} {item.currency}</span>
                    </div>
                  </div>
                  <button
                    className="delete-history-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistoryItem(item.id);
                    }}
                    title={t.delete}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
