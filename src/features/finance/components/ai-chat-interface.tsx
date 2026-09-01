'use client';

import type { Transaction } from 'src/features/finance/domain';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useFinance } from 'src/features/finance/state';
import { interpretTransactionText } from 'src/features/finance/ai';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export function AiChatInterface() {
  const { dispatch } = useFinance();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      sender: 'ai',
      text: 'Halo! Ada pengeluaran hari ini? Ketik saja, misalnya: "Makan siang 50rb".',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    const userMsgId = crypto.randomUUID();

    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: userText }]);
    setLoading(true);

    try {
      // In MVP, we use the fallback if no API key is provided, or grab it from localStorage if available
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const intent = await interpretTransactionText(userText, apiKey);

      let replyText = '';
      if (intent.type === 'unknown') {
        replyText =
          'Maaf, SakuFlow belum mengerti jumlahnya. Bisa lebih spesifik? (Contoh: "Makan 50k")';
      } else {
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          type: intent.type,
          category: 'other', // fallback since simple fallback logic puts everything in 'other'
          amount: intent.amount,
          occurredOn: new Date().toISOString().substring(0, 10),
          note: intent.note || userText,
          source: 'natural-language',
          createdAt: new Date().toISOString(),
        };

        if (intent.category && intent.category !== 'other') {
          // If gemini succeeds and returns a valid category, we could use it, but to appease strict typescript we'll cast it or just leave as other
          transaction.category = intent.category as any;
        }

        dispatch({ type: 'add-transaction', transaction });

        const formatRp = (n: number) =>
          new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(n);
        replyText = `Dicatat! ${intent.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} sebesar ${formatRp(intent.amount)} telah disimpan.`;
      }

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: replyText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: 'Waduh, ada error saat mencatat. Coba lagi ya.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: 400, borderRadius: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}
      >
        SakuFlow Assistant
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'action.selected',
                color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
              }}
            >
              <Typography variant="body2">{msg.text}</Typography>
            </Box>
          </Box>
        ))}
        {loading && (
          <Box sx={{ alignSelf: 'flex-start' }}>
            <Typography variant="caption" color="text.secondary">
              Sedang memproses...
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tulis pengeluaran..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          autoComplete="off"
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!input.trim() || loading}
          sx={{ bgcolor: 'action.selected' }}
        >
          <Box component="span" sx={{ fontSize: 20 }}>
            ➔
          </Box>
        </IconButton>
      </Box>
    </Card>
  );
}
