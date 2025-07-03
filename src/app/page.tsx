"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from 'recharts';
import { ArrowDown, ArrowUp, DollarSign, Route } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Entry, type Settings } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { calculateDashboardMetrics } from '@/lib/calculations';

export default function DashboardPage() {
  const [entries] = useLocalStorage<Entry[]>('entries', []);
  const [settings] = useLocalStorage<Settings>('settings', {
    oleo: { price: 0, lifespanKm: 0 },
    relacao: { price: 0, lifespanKm: 0 },
    pneuDianteiro: { price: 0, lifespanKm: 0 },
    pneuTraseiro: { price: 0, lifespanKm: 0 },
    gasolinaPricePerLiter: 0,
    kmPerLiter: 0,
  });

  const metrics = useMemo(() => calculateDashboardMetrics(entries, settings), [entries, settings]);

  const chartData = useMemo(() => {
    return entries
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        date: formatDate(entry.date),
        "Ganho Bruto": entry.ganho,
        "Lucro Líquido": calculateDashboardMetrics([entry], settings).totalNetProfit,
      }));
  }, [entries, settings]);

  const chartConfig = {
    "Ganho Bruto": {
      label: "Ganho Bruto",
      color: "hsl(var(--chart-1))",
    },
    "Lucro Líquido": {
      label: "Lucro Líquido",
      color: "hsl(var(--chart-2))",
    },
  };

  const maintenanceCostsPerKm = useMemo(() => {
    const { oleo, relacao, pneuDianteiro, pneuTraseiro, gasolinaPricePerLiter, kmPerLiter } = settings;
    return {
      oleo: oleo.lifespanKm > 0 ? oleo.price / oleo.lifespanKm : 0,
      relacao: relacao.lifespanKm > 0 ? relacao.price / relacao.lifespanKm : 0,
      pneuDianteiro: pneuDianteiro.lifespanKm > 0 ? pneuDianteiro.price / pneuDianteiro.lifespanKm : 0,
      pneuTraseiro: pneuTraseiro.lifespanKm > 0 ? pneuTraseiro.price / pneuTraseiro.lifespanKm : 0,
      gasolina: kmPerLiter > 0 ? gasolinaPricePerLiter / kmPerLiter : 0,
    };
  }, [settings]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganho Bruto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total de ganhos brutos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalNetProfit)}</div>
            <p className="text-xs text-muted-foreground">Total de lucro após despesas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Total de despesas com e sem manutenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distância Total</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDistance.toFixed(2)} km</div>
            <p className="text-xs text-muted-foreground">Total de quilômetros rodados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral de Ganhos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(Number(value))}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="Ganho Bruto" fill="var(--color-Ganho Bruto)" radius={4} />
                  <Bar dataKey="Lucro Líquido" fill="var(--color-Lucro Líquido)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Despesas de Manutenção</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Óleo:</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency((settings.oleo.price / settings.oleo.lifespanKm) * metrics.totalDistance)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Relação:</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency((settings.relacao.price / settings.relacao.lifespanKm) * metrics.totalDistance)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Pneu Dianteiro:</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency((settings.pneuDianteiro.price / settings.pneuDianteiro.lifespanKm) * metrics.totalDistance)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Pneu Traseiro:</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency((settings.pneuTraseiro.price / settings.pneuTraseiro.lifespanKm) * metrics.totalDistance)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Gasolina:</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency((settings.gasolinaPricePerLiter / settings.kmPerLiter) * metrics.totalDistance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}