"use client";

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Entry, UserInfo } from '@/lib/types';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, addDays, getDay } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


export default function LancamentosPage() {
  const userInfo = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;

  const [fetchedData, setFetchedData] = useState<UserInfo | null>(null); // State to hold fetched data for temporary display

  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

  // Function to get the day of the week name
  const getDayOfWeek = (dateString: string): string => {
    const date = parseISO(dateString);
    const dayIndex = getDay(date);
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[dayIndex];
  };

  // Function to format the week label
  const formatWeekLabel = (startDate: Date, endDate: Date): string => {
    return `${format(startDate, 'dd MMM')} - ${format(endDate, 'dd MMM')}`;
  };

  const [selectedWeek, setSelectedWeek] = useState({
    startDate: startOfCurrentWeek,
    endDate: endOfCurrentWeek,
    label: `${format(startOfCurrentWeek, 'dd MMM')} - ${format(endOfCurrentWeek, 'dd MMM')}`
  });


  const handleSelectWeek = (week: { startDate: Date; endDate: Date }, formattedLabel: string) => {
    setSelectedWeek({ ...week, label: formattedLabel });
  };

  const handlePreviousWeek = () => {
    const previousWeekStart = startOfWeek(addDays(selectedWeek.startDate, -7), { weekStartsOn: 1 });
    const previousWeekEnd = endOfWeek(addDays(selectedWeek.endDate, -7), { weekStartsOn: 1 });
    handleSelectWeek({ startDate: previousWeekStart, endDate: previousWeekEnd });
    const formattedLabel = formatWeekLabel(previousWeekStart, previousWeekEnd);
    setSelectedWeek({ startDate: previousWeekStart, endDate: previousWeekEnd, label: formattedLabel });
  };

  const handleNextWeek = () => {
    const nextWeekStart = startOfWeek(addDays(selectedWeek.startDate, 7), { weekStartsOn: 1 });
    const nextWeekEnd = endOfWeek(addDays(selectedWeek.endDate, 7), { weekStartsOn: 1 });
    const formattedLabel = formatWeekLabel(nextWeekStart, nextWeekEnd);
    setSelectedWeek({ startDate: nextWeekStart, endDate: nextWeekEnd, label: formattedLabel });
  };

  const filterEntriesByDate = (entries: Entry[], startDate: Date, endDate: Date): Entry[] => {
    return entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });
  }

  const filteredEntries = userInfo ? filterEntriesByDate(userInfo.entries, selectedWeek.startDate, selectedWeek.endDate) : [];

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Lançamentos</h1>
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Adicionar Entrada
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Minhas Entradas</h2>
        <div className="week-selector flex items-center space-x-4 mb-4">
          <button onClick={handlePreviousWeek} className="p-2 border rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <p className="text-gray-700"><span className="font-semibold">{selectedWeek.label}</span></p>
          <button onClick={handleNextWeek} className="p-2 border rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Temporary display of fetched data */}
        {fetchedData && (
          <div className="mb-4 p-4 border rounded-md bg-gray-100">
            <h3 className="text-lg font-semibold mb-2">Fetched Data:</h3>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(fetchedData, null, 2)}</pre>
          </div>
        )}
        <div className="border rounded-md overflow-hidden" >
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Distância</TableHead>
                <TableHead className="text-right">Ganho Bruto</TableHead>
                <TableHead>Ganho Líquido</TableHead>
                <TableHead>Gasto</TableHead>
                <TableHead>Gasto com Alimentação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map(entry => (
                <TableRow key={entry._id}> {/* Assuming entries have a unique 'id' */}
                  <TableCell>{getDayOfWeek(entry.date)}</TableCell>
                  <TableCell>{format(parseISO(entry.date), 'dd/MM/yyyy')}</TableCell> {/* Assuming entry.date is an ISO string */}
                  <TableCell>{entry.kmTraveled.toFixed(1)} km</TableCell>
                  <TableCell className="text-right">R$ {entry.grossGain.toFixed(2)}</TableCell>
                  <TableCell>R$ {entry.liquidGain.toFixed(2)}</TableCell> {/* Calculate Ganho Líquido */}
                  <TableCell>R$ {entry.spent.toFixed(2)}</TableCell>
                  <TableCell>R$ {entry.foodExpense.toFixed(2)}</TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
          {
            filteredEntries.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma entrada encontrada para esta semana.</p>
            )
          }
        </div>

      </div>
    </div>
  );
}

