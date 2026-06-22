import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultFontSize, minFontSize, maxFontSize, fontSizeStep } from '../theme';

const STORAGE_KEY = '@font_size';

type FontSizeContextType = {
  fontSize: number;
  increase: () => void;
  decrease: () => void;
};

const FontSizeContext = createContext<FontSizeContextType>({
  fontSize: defaultFontSize,
  increase: () => {},
  decrease: () => {},
});

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(defaultFontSize);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value !== null) setFontSize(Number(value));
    });
  }, []);

  function update(next: number) {
    const clamped = Math.min(maxFontSize, Math.max(minFontSize, next));
    setFontSize(clamped);
    AsyncStorage.setItem(STORAGE_KEY, String(clamped));
  }

  return (
    <FontSizeContext.Provider
      value={{
        fontSize,
        increase: () => update(fontSize + fontSizeStep),
        decrease: () => update(fontSize - fontSizeStep),
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}
