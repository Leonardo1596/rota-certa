"use client";

import React, { useState } from "react";
import { Entry, UserInfo } from "@/lib/types";
import {
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
  addDays,
  getDay,
} from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

export default function LancamentosPage() {
  const userInfo = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

  const getDayOfWeek = (dateString: string): string => {
    const date = parseISO(dateString);
    const dayIndex = getDay(date);
    const days = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    return days[dayIndex];
  };

  const formatWeekLabel = (startDate: Date, endDate: Date): string => {
    return `${format(startDate, "dd MMM")} - ${format(endDate, "dd MMM")}`;
  };

  const [selectedWeek, setSelectedWeek] = useState({
    startDate: startOfCurrentWeek,
    endDate: endOfCurrentWeek,
    label: formatWeekLabel(startOfCurrentWeek, endOfCurrentWeek),
  });

  const handlePreviousWeek = () => {
    const previousWeekStart = startOfWeek(addDays(selectedWeek.startDate, -7), {
      weekStartsOn: 1,
    });
    const previousWeekEnd = endOfWeek(addDays(selectedWeek.endDate, -7), {
      weekStartsOn: 1,
    });
    setSelectedWeek({
      startDate: previousWeekStart,
      endDate: previousWeekEnd,
      label: formatWeekLabel(previousWeekStart, previousWeekEnd),
    });
  };

  const handleNextWeek = () => {
    const nextWeekStart = startOfWeek(addDays(selectedWeek.startDate, 7), {
      weekStartsOn: 1,
    });
    const nextWeekEnd = endOfWeek(addDays(selectedWeek.endDate, 7), {
      weekStartsOn: 1,
    });
    setSelectedWeek({
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      label: formatWeekLabel(nextWeekStart, nextWeekEnd),
    });
  };

  const handleEdit = (entry: Entry) => {
    console.log("Editar:", entry);
  };

  const handleDelete = (entryId: string) => {
    if (window.confirm("Tem certeza que deseja remover esta entrada?")) {
      console.log("Remover:", entryId);
    }
  };

  const filterEntriesByDate = (
    entries: Entry[],
    startDate: Date,
    endDate: Date
  ): Entry[] => {
    return entries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });
  };

  const filteredEntries = userInfo
    ? filterEntriesByDate(userInfo.entries, selectedWeek.startDate, selectedWeek.endDate)
    : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Lançamentos
        </h1>
        <button className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm sm:text-base">
          Adicionar Entrada
        </button>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
          Minhas Entradas
        </h2>
        <div className="flex justify-center items-center gap-3 flex-wrap mb-6">
          <button onClick={handlePreviousWeek} className="p-2 border rounded">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <p className="text-sm sm:text-base text-gray-700 font-semibold">
            {selectedWeek.label}
          </p>
          <button onClick={handleNextWeek} className="p-2 border rounded">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* TABELA DESKTOP */}
        <div className="overflow-x-auto hidden md:block rounded-md border">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Distância</TableHead>
                <TableHead className="text-right">Ganho Bruto</TableHead>
                <TableHead>Ganho Líquido</TableHead>
                <TableHead>Gasto</TableHead>
                <TableHead>Alimentação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>{getDayOfWeek(entry.date)}</TableCell>
                  <TableCell>{format(parseISO(entry.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{entry.kmTraveled.toFixed(1)} km</TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">
                    R$ {entry.grossGain.toFixed(2).replace(".", ",")}
                  </TableCell>
                  <TableCell
                    className={
                      entry.liquidGain > 0
                        ? "text-green-600 font-semibold"
                        : entry.liquidGain < 0
                        ? "text-red-600 font-semibold"
                        : "text-muted-foreground"
                    }
                  >
                    R$ {entry.liquidGain.toFixed(2).replace(".", ",")}
                  </TableCell>
                  <TableCell className="text-red-600 font-semibold">
                    R$ {entry.spent.toFixed(2).replace(".", ",")}
                  </TableCell>
                  <TableCell className="text-red-600 font-semibold">
                    R$ {entry.foodExpense.toFixed(2).replace(".", ",")}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEntries.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma entrada encontrada para esta semana.
            </p>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="flex flex-col gap-4 md:hidden">
          {filteredEntries.map((entry) => (
            <div
              key={entry._id}
              className="border border-gray-200 rounded-lg p-5 shadow-sm bg-background"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-lg">{getDayOfWeek(entry.date)}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(entry.date), "dd/MM/yyyy")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between items-center col-span-2">
                  <div>
                    <span className="font-medium">Distância:</span> {entry.kmTraveled.toFixed(1)} km
                  </div>
                  <div className="text-green-600 font-semibold">
                    <span className="font-medium">Ganho Bruto: </span>
                    R$ {entry.grossGain.toFixed(2).replace(".", ",")}
                  </div>
                </div>

                <div>
                  <span className="font-medium">Ganho Líquido: </span>
                  <span
                    className={`whitespace-nowrap ${
                      entry.liquidGain > 0
                        ? "text-green-600 font-semibold"
                        : entry.liquidGain < 0
                        ? "text-red-600 font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    R$ {entry.liquidGain.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <div className="text-right text-red-600 font-semibold">
                  <span className="font-medium">Gasto: </span>
                  R$ {entry.spent.toFixed(2).replace(".", ",")}
                </div>

                <div className="flex justify-between items-center col-span-2">
                  <div>
                    <span className="font-medium">Alimentação: </span>
                    <span className="text-red-600 font-semibold">
                      R$ {entry.foodExpense.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
