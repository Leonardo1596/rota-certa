"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useEffect } from "react";
import { getUserInfo } from "@/services/user";

const maintenanceCostSchema = z.object({
  price: z.coerce.number().min(0, 'O preço deve ser positivo.'),
  lifespanKm: z.coerce.number().min(0, 'A vida útil em Km deve ser positiva.'),
});

const settingsSchema = z.object({
  oleo: maintenanceCostSchema,
  relacao: maintenanceCostSchema,
  pneuDianteiro: maintenanceCostSchema,
  pneuTraseiro: maintenanceCostSchema,
  gasolinaPricePerLiter: z.coerce.number().min(0, 'O preço deve ser positivo.'),
  kmPerLiter: z.coerce.number().min(0, 'O valor deve ser positivo.'),
});

const defaultSettings: Settings = {
  oleo: { price: 0, lifespanKm: 1000 },
  relacao: { price: 0, lifespanKm: 15000 },
  pneuDianteiro: { price: 0, lifespanKm: 10000 },
  pneuTraseiro: { price: 0, lifespanKm: 8000 },
  gasolinaPricePerLiter: 0,
  kmPerLiter: 0,
};

// Define the shape of the user info including the costPerKm array
export default function ConfiguracoesPage() {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', defaultSettings);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: settings,
  });

  useEffect(() => {
    const fetchAndSetUserInfo = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          console.error("User not found in local storage.");
          return;
        }

        const user = JSON.parse(userString);
        const userId = user._id;

        if (!userId) {
          console.error("User ID not found in local storage data.");
          return;
        }

        const userInfo = await getUserInfo(userId);

        if (userInfo && userInfo.costPerKm && userInfo.costPerKm[0]) {
          const maintenanceData = userInfo.costPerKm[0];
          form.reset({
            oleo: { price: maintenanceData.oleo?.value || 0, lifespanKm: maintenanceData.oleo?.km || 0 },
            relacao: { price: maintenanceData.relacao?.value || 0, lifespanKm: maintenanceData.relacao?.km || 0 },
            pneuDianteiro: { price: maintenanceData.pneuDianteiro?.value || 0, lifespanKm: maintenanceData.pneuDianteiro?.km || 0 },
            pneuTraseiro: { price: maintenanceData.pneuTraseiro?.value || 0, lifespanKm: maintenanceData.pneuTraseiro?.km || 0 },
            gasolinaPricePerLiter: maintenanceData.gasolina?.value || 0,
            kmPerLiter: maintenanceData.gasolina?.km || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching or setting user info:", error);
      }
    };
    fetchAndSetUserInfo();
  }, [form]);

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    setSettings(values);
    toast({
      title: 'Sucesso!',
      description: 'Configurações salvas.',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Configure os custos de manutenção para calcular seus ganhos líquidos com precisão.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Custos de Manutenção</CardTitle>
              <CardDescription>
                Insira o preço de cada item e sua vida útil em quilômetros.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="oleo"
                  render={() => (
                    <div className="space-y-2 p-4 border rounded-lg">
                      <h3 className="font-semibold">Óleo</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="oleo.price" render={({ field }) => (
                          <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="oleo.lifespanKm" render={({ field }) => (
                          <FormItem><FormLabel>Vida Útil (Km)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="relacao"
                  render={() => (
                    <div className="space-y-2 p-4 border rounded-lg">
                      <h3 className="font-semibold">Relação (Kit)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="relacao.price" render={({ field }) => (
                          <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="relacao.lifespanKm" render={({ field }) => (
                          <FormItem><FormLabel>Vida Útil (Km)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="pneuDianteiro"
                  render={() => (
                    <div className="space-y-2 p-4 border rounded-lg">
                      <h3 className="font-semibold">Pneu Dianteiro</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="pneuDianteiro.price" render={({ field }) => (
                          <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pneuDianteiro.lifespanKm" render={({ field }) => (
                          <FormItem><FormLabel>Vida Útil (Km)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="pneuTraseiro"
                  render={() => (
                    <div className="space-y-2 p-4 border rounded-lg">
                      <h3 className="font-semibold">Pneu Traseiro</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="pneuTraseiro.price" render={({ field }) => (
                          <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pneuTraseiro.lifespanKm" render={({ field }) => (
                          <FormItem><FormLabel>Vida Útil (Km)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>
                  )}
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">Gasolina</h3>
                <p className="text-sm text-muted-foreground">
                  Insira o preço médio do litro da gasolina e a autonomia da sua moto.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                   <FormField control={form.control} name="gasolinaPricePerLiter" render={({ field }) => (
                      <FormItem><FormLabel>Preço por Litro (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="kmPerLiter" render={({ field }) => (
                      <FormItem><FormLabel>Km por Litro (Autonomia)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>

            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
