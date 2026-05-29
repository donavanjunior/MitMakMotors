export interface ContactDetails {
  name: string;
  phone: string;
  location: string;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  mileage: number;
  transmission: "Automatic" | "Manual";
  fuel: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  condition: number; // multiplier value e.g. 1.05
  service: number; // multiplier value e.g. 1.0
  accident: number; // multiplier value e.g. 0
  settlement: string; // empty or settlement amount string
  notes: string;
}

export interface PhotoUpload {
  id: string; // e.g. 'front', 'rear'
  label: string; // e.g. 'Front View'
  base64: string; // encoded image string
  fileName: string;
}

export interface EstimateResult {
  retailValue: number;
  dealerMin: number;
  dealerMax: number;
  marketDemand: "Low" | "Medium" | "High" | "Very High";
  aiRemarks: string;
  isAIReal: boolean;
  disclaimer?: string;
}
