'use client';

import type { Transaction } from 'src/features/finance/domain';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useFinance } from 'src/features/finance/state';
import { interpretTransactionText } from 'src/features/finance/ai';
import { transactionTypeSchema } from 'src/features/finance/domain';

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
  const [draft, setDraft] = useState<Transaction | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    const userMsgId = crypto.randomUUID();

    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const intent = await interpretTransactionText(userText);

      if (intent.type === 'unknown') {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: 'Maaf, SakuFlow belum mengerti maksudnya. Bisa lebih spesifik? (Contoh: "Makan 50k")',
          },
        ]);
      } else {
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          type: intent.type,
          category: 'other',
          amount: intent.amount,
          occurredOn: new Date().toISOString().substring(0, 10),
          note: intent.note || userText,
          source: 'natural-language',
          createdAt: new Date().toISOString(),
        };

        transaction.category = intent.category;

        setDraft(transaction);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: 'Saya menemukan detail berikut. Silakan cek dan konfirmasi sebelum disimpan:',
          },
        ]);
      }
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

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const handleConfirmDraft = () => {
    if (!draft) return;
    dispatch({ type: 'add-transaction', transaction: draft });

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: `Dicatat! ${draft.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} sebesar ${formatRp(draft.amount)} telah disimpan.`,
      },
    ]);
    setDraft(null);
  };

  const handleCancelDraft = () => {
    setDraft(null);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: 'Pencatatan dibatalkan.',
      },
    ]);
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: 500, borderRadius: 2 }}>
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

      {draft ? (
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            bgcolor: 'background.neutral',
          }}
        >
          <Typography variant="subtitle2">Konfirmasi Draft</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Select
              size="small"
              value={draft.type}
              onChange={(e) =>
                setDraft({ ...draft, type: transactionTypeSchema.parse(e.target.value) })
              }
              sx={{ flex: 1 }}
            >
              <MenuItem value="expense">Pengeluaran</MenuItem>
              <MenuItem value="income">Pemasukan</MenuItem>
            </Select>
            <TextField
              size="small"
              type="number"
              value={draft.amount || ''}
              onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
              sx={{ flex: 2 }}
            />
          </Box>
          <TextField
            size="small"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            placeholder="Catatan..."
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button variant="outlined" color="inherit" fullWidth onClick={handleCancelDraft}>
              Batal
            </Button>
            <Button variant="contained" color="primary" fullWidth onClick={handleConfirmDraft}>
              Simpan
            </Button>
          </Box>
        </Box>
      ) : (
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
      )}
    </Card>
  );
}
