"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Entry } from '@/lib/types';
import { suggestImprovements } from '@/ai/flows/suggest-improvements';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, ServerCrash } from 'lucide-react';

export function SuggestionTool() {
  const [entries] = useLocalStorage<Entry[]>('entries', []);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      // Use last 20 entries for suggestions
      const recentEntries = entries.slice(-20);
      const input = {
        entries: recentEntries.map(e => ({
          ...e,
          date: new Date(e.date).toLocaleDateString('pt-BR'),
        })),
      };
      const result = await suggestImprovements(input);
      setSuggestions(result.suggestions);
    } catch (e) {
      console.error(e);
      setError('Não foi possível gerar sugestões. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Otimize Seus Ganhos</CardTitle>
        <CardDescription>Receba sugestões da nossa IA para maximizar seus lucros em cada corrida.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={handleSuggest} disabled={isLoading || entries.length < 3}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Gerar Sugestões
            </>
          )}
        </Button>
        {entries.length < 3 && !isLoading && (
            <p className="text-sm text-muted-foreground">Adicione pelo menos 3 lançamentos para receber sugestões.</p>
        )}
        {error && (
          <Alert variant="destructive">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Sugestões para você:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
