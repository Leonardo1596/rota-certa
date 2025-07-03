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
  id: string;
  date: string; // ISO string
  kmInicial: number;
  kmFinal: number;
  gastoAlimentacao: number;
  outrosGastos: number;
  ganho: number; // Earnings
};
