export type MaintenanceCost = {
  price: number;
  lifespanKm: number;
};

export type Settings = {
  oleo: MaintenanceCost;
  relacao: MaintenanceCost;
  pneuDianteiro: MaintenanceCost;
  pneuTraseiro: MaintenanceCost;
  gasolinaPricePerLiter: number;
  kmPerLiter: number;
};

export type Entry = {
  _id: string;
  date: string; // ISO string
  initialKm: number;
  finalKm: number;
  kmTraveled: number;
  foodExpense: number;
  grossGain: number; // Earnings
  liquidGain: number;
  spent: number;
};
