import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'EUR' | 'CFA';

// Taux de change par défaut : 1 EUR = 655.957 CFA (taux officiel BEAC)
const DEFAULT_EXCHANGE_RATE = 655.957;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  symbol: string;
  formatAmount: (amount: number) => string;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  resetExchangeRate: () => void;
  convertCurrency: (amount: number, from: Currency, to: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    return (saved as Currency) || 'EUR';
  });

  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    const saved = localStorage.getItem('exchangeRate');
    return saved ? parseFloat(saved) : DEFAULT_EXCHANGE_RATE;
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('exchangeRate', exchangeRate.toString());
  }, [exchangeRate]);

  const symbol = currency === 'EUR' ? '€' : 'F';

  const formatAmount = (amount: number): string => {
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${formatted} ${symbol}`;
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const setExchangeRate = (rate: number) => {
    if (rate > 0) {
      setExchangeRateState(rate);
    }
  };

  const resetExchangeRate = () => {
    setExchangeRateState(DEFAULT_EXCHANGE_RATE);
  };

  const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
    if (from === to) return amount;
    
    if (from === 'EUR' && to === 'CFA') {
      return amount * exchangeRate;
    } else if (from === 'CFA' && to === 'EUR') {
      return amount / exchangeRate;
    }
    
    return amount;
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        symbol, 
        formatAmount,
        exchangeRate,
        setExchangeRate,
        resetExchangeRate,
        convertCurrency
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
