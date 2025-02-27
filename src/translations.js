export const translations = {
  en: {
    title: 'VAT Calculator',
    calculate: 'Calculate VAT',
    enterAmount: 'Enter amount',
    vatIncluded: 'VAT Included',
    vatExcluded: 'VAT Excluded',
    vatType: 'VAT Type',
    showInWords: 'Show in Words',
    reset: 'Reset',
    calculate: 'Calculate',
    baseAmount: 'Base Amount',
    vatAmount: 'VAT',
    totalAmount: 'Total',
    history: 'Calculation History',
    copyToClipboard: 'Copy to clipboard',
    custom: 'Custom',
    vatPercentage: 'VAT Percentage'
  },
  az: {
    title: 'ƏDV Kalkulyatoru',
    calculate: 'ƏDV Hesabla',
    enterAmount: 'Məbləği daxil edin',
    vatIncluded: 'ƏDV daxildir',
    vatExcluded: 'ƏDV xaricdir',
    vatType: 'ƏDV Növü',
    showInWords: 'Sözlərlə göstər',
    reset: 'Sıfırla',
    calculate: 'Hesabla',
    baseAmount: 'Əsas məbləğ',
    vatAmount: 'ƏDV',
    totalAmount: 'Cəmi',
    history: 'Hesablama Tarixçəsi',
    copyToClipboard: 'Kopyala',
    custom: 'Xüsusi',
    vatPercentage: 'ƏDV Faizi'
  },
  ru: {
    title: 'НДС Калькулятор',
    calculate: 'Рассчитать НДС',
    enterAmount: 'Введите сумму',
    vatIncluded: 'НДС включен',
    vatExcluded: 'НДС не включен',
    vatType: 'Тип НДС',
    showInWords: 'Показать прописью',
    reset: 'Сбросить',
    calculate: 'Рассчитать',
    baseAmount: 'Базовая сумма',
    vatAmount: 'НДС',
    totalAmount: 'Итого',
    history: 'История расчетов',
    copyToClipboard: 'Копировать',
    custom: 'Другой',
    vatPercentage: 'Процент НДС'
  }
};

// Azerbaijani number to words conversion
const azUnits = ['', 'bir', 'iki', 'üç', 'dörd', 'beş', 'altı', 'yeddi', 'səkkiz', 'doqquz'];
const azTens = ['', 'on', 'iyirmi', 'otuz', 'qırx', 'əlli', 'altmış', 'yetmiş', 'səksən', 'doxsan'];
const azScales = ['', 'min', 'milyon', 'milyard'];

export function convertToWords(amount, language, currency) {
  if (language !== 'az') return amount.toFixed(2) + ' ' + currency;

  const parts = amount.toFixed(2).split('.');
  const whole = parseInt(parts[0]);
  const decimal = parseInt(parts[1]);

  function convertWholeNumber(num) {
    if (num === 0) return 'sıfır';
    
    let words = '';
    let scaleIndex = 0;
    
    while (num > 0) {
      const segment = num % 1000;
      if (segment > 0) {
        const segmentWords = convertSegment(segment);
        words = segmentWords + (scaleIndex > 0 ? ' ' + azScales[scaleIndex] + ' ' : '') + words;
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }
    
    return words.trim();
  }

  function convertSegment(num) {
    let words = '';
    
    // Hundreds
    const hundreds = Math.floor(num / 100);
    if (hundreds > 0) {
      words += (hundreds === 1 ? 'yüz' : azUnits[hundreds] + ' yüz') + ' ';
    }
    
    // Tens and Units
    const remainder = num % 100;
    const tens = Math.floor(remainder / 10);
    const units = remainder % 10;
    
    if (tens > 0) {
      words += azTens[tens] + ' ';
    }
    if (units > 0) {
      words += azUnits[units] + ' ';
    }
    
    return words;
  }

  const wholeWords = convertWholeNumber(whole);
  const decimalWords = decimal > 0 ? convertWholeNumber(decimal) : '';

  let result = wholeWords + ' manat';
  if (decimal > 0) {
    result += ' ' + decimalWords + ' qəpik';
  }

  return result;
} 