interface FormatOptions {
  showEquivalent?: boolean;
  decimals?: number;
}

// Default exchange rate: 1 EUR = 655 CFA
const DEFAULT_EXCHANGE_RATE = 655;

export const useFormatAmount = () => {
  // Get currency from localStorage or default to EUR
  const currency = typeof window !== 'undefined' 
    ? (localStorage.getItem('currency') as 'EUR' | 'CFA' || 'EUR')
    : 'EUR';

  const exchangeRate = DEFAULT_EXCHANGE_RATE;

  const convertCurrency = (amount: number, from: 'EUR' | 'CFA', to: 'EUR' | 'CFA'): number => {
    if (from === to) return amount;
    if (from === 'EUR' && to === 'CFA') return amount * exchangeRate;
    if (from === 'CFA' && to === 'EUR') return amount / exchangeRate;
    return amount;
  };

  const formatAmount = (amount: number): string => {
    const symbol = currency === 'EUR' ? '€' : 'F';
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${formatted} ${symbol}`;
  };

  const formatAmountWithConversion = (amount: number, sourceCurrency: 'EUR' | 'CFA' = 'EUR', options: FormatOptions = {}) => {
    const { showEquivalent = false, decimals = 2 } = options;

    // Convert amount to selected currency
    const convertedAmount = sourceCurrency !== currency 
      ? convertCurrency(amount, sourceCurrency, currency)
      : amount;

    const formatted = formatAmount(convertedAmount);

    if (!showEquivalent) {
      return formatted;
    }

    // Calculate equivalent in other currency
    const equivalentCurrency = currency === 'EUR' ? 'CFA' : 'EUR';
    const equivalentAmount = convertCurrency(convertedAmount, currency, equivalentCurrency);
    const equivalentSymbol = equivalentCurrency === 'EUR' ? '€' : 'F';

    return `${formatted} (≈ ${equivalentAmount.toFixed(decimals)} ${equivalentSymbol})`;
  };

  const formatAmountInCurrency = (amount: number, targetCurrency: 'EUR' | 'CFA', sourceCurrency: 'EUR' | 'CFA' = 'EUR', options: FormatOptions = {}) => {
    const { showEquivalent = false, decimals = 2 } = options;

    // Convert amount to target currency
    const convertedAmount = sourceCurrency !== targetCurrency
      ? convertCurrency(amount, sourceCurrency, targetCurrency)
      : amount;

    const symbol = targetCurrency === 'EUR' ? '€' : 'F';
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(convertedAmount);

    const result = `${formatted} ${symbol}`;

    if (!showEquivalent) {
      return result;
    }

    // Calculate equivalent in other currency
    const equivalentCurrency = targetCurrency === 'EUR' ? 'CFA' : 'EUR';
    const equivalentAmount = convertCurrency(convertedAmount, targetCurrency, equivalentCurrency);
    const equivalentSymbol = equivalentCurrency === 'EUR' ? '€' : 'F';

    return `${result} (≈ ${equivalentAmount.toFixed(decimals)} ${equivalentSymbol})`;
  };

  const getExchangeRateInfo = () => {
    return {
      rate: exchangeRate,
      display: `1 EUR = ${exchangeRate.toFixed(3)} CFA`,
      inverse: `1 CFA = ${(1 / exchangeRate).toFixed(6)} EUR`,
    };
  };

  return {
    formatAmountWithConversion,
    formatAmountInCurrency,
    getExchangeRateInfo,
    currentCurrency: currency,
    exchangeRate,
  };
};
