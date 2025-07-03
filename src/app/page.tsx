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
import { SuggestionTool } from '@/components/suggestion-tool';

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
        <SuggestionTool />
      </div>
    </div>
  );
}
