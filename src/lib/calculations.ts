import { type Entry, type Settings } from '@/lib/types';

export function calculateEntryCosts(entry: Entry, settings: Settings) {
  const {
    oleo,
    relacao,
    pneuDianteiro,
    pneuTraseiro,
    gasolinaPricePerLiter,
    kmPerLiter,
  } = settings;

  const costPerKmOleo = (oleo.price > 0 && oleo.lifespanKm > 0) ? oleo.price / oleo.lifespanKm : 0;
  const costPerKmRelacao = (relacao.price > 0 && relacao.lifespanKm > 0) ? relacao.price / relacao.lifespanKm : 0;
  const costPerKmPneuDianteiro = (pneuDianteiro.price > 0 && pneuDianteiro.lifespanKm > 0) ? pneuDianteiro.price / pneuDianteiro.lifespanKm : 0;
  const costPerKmPneuTraseiro = (pneuTraseiro.price > 0 && pneuTraseiro.lifespanKm > 0) ? pneuTraseiro.price / pneuTraseiro.lifespanKm : 0;
  const costPerKmGasolina = (gasolinaPricePerLiter > 0 && kmPerLiter > 0) ? gasolinaPricePerLiter / kmPerLiter : 0;

  const totalMaintenanceCostPerKm =
    costPerKmOleo +
    costPerKmRelacao +
    costPerKmPneuDianteiro +
    costPerKmPneuTraseiro +
    costPerKmGasolina;
  
  const distance = entry.kmFinal - entry.kmInicial;
  const maintenanceCost = distance * totalMaintenanceCostPerKm;
  const directExpenses = entry.gastoAlimentacao + entry.outrosGastos;
  const totalExpense = directExpenses + maintenanceCost;
  const netProfit = entry.ganho - totalExpense;
  const expensePercentage = entry.ganho > 0 ? (totalExpense / entry.ganho) * 100 : 0;

  return {
    distance,
    maintenanceCost,
    totalExpense,
    netProfit,
    expensePercentage,
  };
}

export function calculateDashboardMetrics(entries: Entry[], settings: Settings) {
  return entries.reduce(
    (acc, entry) => {
      const { distance, totalExpense, netProfit } = calculateEntryCosts(entry, settings);
      acc.totalRevenue += entry.ganho;
      acc.totalDistance += distance;
      acc.totalExpenses += totalExpense;
      acc.totalNetProfit += netProfit;
      return acc;
    },
    {
      totalRevenue: 0,
      totalExpenses: 0,
      totalNetProfit: 0,
      totalDistance: 0,
    }
  );
}
