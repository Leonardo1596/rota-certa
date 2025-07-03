"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Entry, type Settings } from '@/lib/types';
import { formatCurrency, formatDate, getDayOfWeek, cn } from '@/lib/utils';
import { calculateEntryCosts } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, MoreHorizontal, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';

const entrySchema = z.object({
  date: z.date({ required_error: 'A data é obrigatória.' }),
  kmInicial: z.coerce.number().min(0, 'Km inicial deve ser positivo.'),
  kmFinal: z.coerce.number().min(0, 'Km final deve ser positivo.'),
  gastoAlimentacao: z.coerce.number().min(0, 'Gasto com alimentação deve ser positivo.'),
  outrosGastos: z.coerce.number().min(0, 'Outros gastos devem ser positivos.'),
  ganho: z.coerce.number().min(0, 'Ganho deve ser positivo.'),
}).refine(data => data.kmFinal >= data.kmInicial, {
  message: 'Km final deve ser maior ou igual ao Km inicial.',
  path: ['kmFinal'],
});

export default function LancamentosPage() {
  const [entries, setEntries] = useLocalStorage<Entry[]>('entries', []);
  const [settings] = useLocalStorage<Settings>('settings', {
    oleo: { price: 0, lifespanKm: 0 },
    relacao: { price: 0, lifespanKm: 0 },
    pneuDianteiro: { price: 0, lifespanKm: 0 },
    pneuTraseiro: { price: 0, lifespanKm: 0 },
    gasolinaPricePerLiter: 0,
    kmPerLiter: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof entrySchema>>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      date: new Date(),
      kmInicial: 0,
      kmFinal: 0,
      gastoAlimentacao: 0,
      outrosGastos: 0,
      ganho: 0,
    },
  });

  const handleOpenDialog = (entry: Entry | null = null) => {
    setEditingEntry(entry);
    if (entry) {
      form.reset({
        ...entry,
        date: new Date(entry.date),
      });
    } else {
      form.reset({
        date: new Date(),
        kmInicial: entries[entries.length-1]?.kmFinal || 0,
        kmFinal: 0,
        gastoAlimentacao: 0,
        outrosGastos: 0,
        ganho: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    toast({
      title: 'Sucesso!',
      description: 'Lançamento removido.',
    });
  };

  function onSubmit(values: z.infer<typeof entrySchema>) {
    const entryData = {
      ...values,
      date: values.date.toISOString(),
    };

    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...entryData } : e));
      toast({ title: 'Sucesso!', description: 'Lançamento atualizado.' });
    } else {
      setEntries(prev => [...prev, { id: new Date().toISOString(), ...entryData }]);
      toast({ title: 'Sucesso!', description: 'Novo lançamento adicionado.' });
    }

    setIsDialogOpen(false);
    setEditingEntry(null);
    form.reset();
  }

  const sortedEntries = entries.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Lançamentos</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Lançamento
        </Button>
      </div>

      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dia</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Distância</TableHead>
              <TableHead>Valor Bruto</TableHead>
              <TableHead>Gastos</TableHead>
              <TableHead>Valor Líquido</TableHead>
              <TableHead>Gasto %</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.map(entry => {
              const { distance, totalExpense, netProfit, expensePercentage } = calculateEntryCosts(entry, settings);
              return (
                <TableRow key={entry.id}>
                  <TableCell>{getDayOfWeek(entry.date)}</TableCell>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{distance.toFixed(2)} km</TableCell>
                  <TableCell>{formatCurrency(entry.ganho)}</TableCell>
                  <TableCell>{formatCurrency(totalExpense)}</TableCell>
                  <TableCell className={cn(netProfit >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {formatCurrency(netProfit)}
                  </TableCell>
                  <TableCell>{expensePercentage.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(entry)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso excluirá permanentemente o lançamento.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {sortedEntries.map(entry => {
          const { distance, totalExpense, netProfit, expensePercentage } = calculateEntryCosts(entry, settings);
          return (
            <Card key={entry.id}>
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{formatDate(entry.date)}</p>
                    <p className="text-sm text-muted-foreground">{getDayOfWeek(entry.date)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleOpenDialog(entry)}>Editar</DropdownMenuItem>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Excluir</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                  <span>Distância:</span><span className="text-right">{distance.toFixed(2)} km</span>
                  <span>Ganho Bruto:</span><span className="text-right">{formatCurrency(entry.ganho)}</span>
                  <span>Gastos:</span><span className="text-right">{formatCurrency(totalExpense)}</span>
                  <span>Gasto %:</span><span className="text-right">{expensePercentage.toFixed(2)}%</span>
                  <span>Lucro Líquido:</span>
                  <span className={cn('text-right font-bold', netProfit >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Editar Lançamento' : 'Adicionar Lançamento'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? formatDate(field.value.toISOString()) : <span>Escolha uma data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="kmInicial" render={({ field }) => (
                  <FormItem><FormLabel>Km Inicial</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="kmFinal" render={({ field }) => (
                  <FormItem><FormLabel>Km Final</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="gastoAlimentacao" render={({ field }) => (
                  <FormItem><FormLabel>Gasto Alimentação</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="outrosGastos" render={({ field }) => (
                  <FormItem><FormLabel>Outros Gastos</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="ganho" render={({ field }) => (
                <FormItem><FormLabel>Ganho (Bruto)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
