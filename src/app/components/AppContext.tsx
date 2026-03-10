import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface HandData {
  handLength: number;
  handWidth: number;
  thumbLength: number;
  indexLength: number;
  middleLength: number;
  thumbSpan: number;
  handSize: string;
}

export interface PhoneModel {
  id: string;
  name: string;
  brand: string;
  image: string;
  width: number;
  height: number;
  thickness: number;
  weight: number;
  screenSize: number;
  price: number;
  gripScore: number;
  reachScore: number;
  comfortScore: number;
  overallScore: number;
  material: string;
  features: string[];
  backMaterial?: string;
  cameraPosition?: string;
  cameraShape?: string;
  cameraBumpHeight?: number;
  battery?: number;
  storage?: number[];
  formFactor?: 'bar' | 'flip' | 'fold';
  cornerRadius?: number;
}

export interface CustomParams {
  maxWeight: number;
  maxWidth: number;
  maxPrice: number;
  preferredMaterial: string;
  usageScenario: string[];
  importantFeatures: string[];
  gripStyle: string;
}

// P5-P95 ranges for Chinese adult hand measurements (mm)
export const HAND_RANGES = {
  handLength: { p5: 163, p95: 198, default: 180, label: '手长', desc: '手腕横纹到中指指尖' },
  handWidth: { p5: 74, p95: 92, default: 83, label: '手掌宽', desc: '四指并拢时掌面最宽处' },
  thumbLength: { p5: 55, p95: 72, default: 63, label: '拇指长', desc: '拇指根部到指尖' },
  indexLength: { p5: 62, p95: 80, default: 71, label: '食指长', desc: '食指根部到指尖' },
  middleLength: { p5: 68, p95: 88, default: 78, label: '中指长', desc: '中指根部到指尖' },
  thumbSpan: { p5: 78, p95: 112, default: 95, label: '虎口跨度', desc: '拇指尖到食指尖最大张开距离' },
} as const;

export type HandMeasureKey = keyof typeof HAND_RANGES;

// Compute percentile given P5/P95 bounds (assuming normal distribution)
export function computePercentile(value: number, p5: number, p95: number): number {
  const mean = (p5 + p95) / 2;
  const std = (p95 - p5) / (2 * 1.645);
  const z = (value - mean) / std;
  // Approximate CDF using logistic function
  const cdf = 1 / (1 + Math.exp(-1.7 * z));
  return Math.max(0.5, Math.min(99.5, cdf * 100));
}

// Normal PDF for bell curve chart
export function normalPDF(x: number, mean: number, std: number): number {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
}

interface AppContextType {
  handData: HandData;
  setHandData: (data: HandData) => void;
  selectedPhones: PhoneModel[];
  setSelectedPhones: (phones: PhoneModel[]) => void;
  customParams: CustomParams;
  setCustomParams: (params: CustomParams) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isHandDataComplete: boolean;
  measurementId: string | null;
  setMeasurementId: (id: string | null) => void;
}

const defaultHandData: HandData = {
  handLength: HAND_RANGES.handLength.default,
  handWidth: HAND_RANGES.handWidth.default,
  thumbLength: HAND_RANGES.thumbLength.default,
  indexLength: HAND_RANGES.indexLength.default,
  middleLength: HAND_RANGES.middleLength.default,
  thumbSpan: HAND_RANGES.thumbSpan.default,
  handSize: 'medium',
};

const defaultCustomParams: CustomParams = {
  maxWeight: 250,
  maxWidth: 80,
  maxPrice: 10000,
  preferredMaterial: '',
  usageScenario: [],
  importantFeatures: [],
  gripStyle: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [handData, setHandData] = useState<HandData>(defaultHandData);
  const [selectedPhones, setSelectedPhones] = useState<PhoneModel[]>([]);
  const [customParams, setCustomParams] = useState<CustomParams>(defaultCustomParams);
  const [currentStep, setCurrentStep] = useState(0);
  const [measurementId, setMeasurementId] = useState<string | null>(null);

  const isHandDataComplete = handData.handLength > 0 && handData.handWidth > 0;

  return (
    <AppContext.Provider
      value={{
        handData, setHandData,
        selectedPhones, setSelectedPhones,
        customParams, setCustomParams,
        currentStep, setCurrentStep,
        isHandDataComplete,
        measurementId, setMeasurementId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
