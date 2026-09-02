'use client';

import type { FinanceIntent } from 'src/features/finance/ai';
import type { Transaction } from 'src/features/finance/domain';
import type { PurchaseSimulationResult } from 'src/features/finance/engine/simulate-purchase';

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
import { projectBudget, simulatePurchase } from 'src/features/finance/engine';
import {
  buildGoal,
  buildObligation,
  toLocalYyyyMmDd,
  transactionSchema,
  transactionTypeSchema,
  obligationCategoryToTransactionCategory,
} from 'src/features/finance/domain';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface IntentSimulation {
  amount: number;
  note: string;
  today: string;
  result: PurchaseSimulationResult;
}

function simulationMaterial(result: PurchaseSimulationResult) {
  return [
    result.verdict,
    result.after.safePool,
    result.after.safeToSpendPerDay,
    result.after.liquidBalance,
  ].join(':');
}

export function AiChatInterface() {
  const { dispatch, state } = useFinance();
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
  const [draftError, setDraftError] = useState('');
  const [intentDraft, setIntentDraft] = useState<FinanceIntent | null>(null);
  const [intentSimulation, setIntentSimulation] = useState<IntentSimulation | null>(null);

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
      } else if (intent.type === 'expense' || intent.type === 'income') {
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          type: intent.type,
          category: 'other',
          amount: intent.amount,
          occurredOn: toLocalYyyyMmDd(new Date()),
          note: intent.note || userText,
          source: 'natural-language',
          createdAt: new Date().toISOString(),
        };

        transaction.category = intent.category;

        setDraft(transaction);
        setDraftError('');
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: 'Saya menemukan detail berikut. Silakan cek dan konfirmasi sebelum disimpan:',
          },
        ]);
      } else {
        setIntentDraft(intent);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: 'Saya menemukan tindakan berikut. Periksa lalu konfirmasi sebelum diterapkan:',
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
    const parsed = transactionSchema.safeParse(draft);
    if (!parsed.success) {
      setDraftError('Periksa nominal, tanggal, dan catatan sebelum menyimpan.');
      return;
    }
    dispatch({ type: 'add-transaction', transaction: parsed.data });

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: `Dicatat! ${draft.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} sebesar ${formatRp(draft.amount)} telah disimpan.`,
      },
    ]);
    setDraft(null);
    setDraftError('');
  };

  const handleCancelDraft = () => {
    setDraft(null);
    setDraftError('');
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: 'Pencatatan dibatalkan.',
      },
    ]);
  };

  const handleRecordSimulation = () => {
    if (!intentSimulation) return;
    const now = new Date();
    const today = toLocalYyyyMmDd(now);
    const latestResult = simulatePurchase({
      snapshot: state.snapshot,
      today,
      amount: intentSimulation.amount,
    });
    if (simulationMaterial(latestResult) !== simulationMaterial(intentSimulation.result)) {
      setIntentSimulation({ ...intentSimulation, today, result: latestResult });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: 'Data keuangan berubah sejak simulasi. Hasil diperbarui; periksa dan konfirmasi lagi sebelum mencatat.',
        },
      ]);
      return;
    }
    dispatch({
      type: 'add-transaction',
      transaction: {
        id: crypto.randomUUID(),
        type: 'expense',
        category: 'other',
        amount: intentSimulation.amount,
        occurredOn: today,
        note: intentSimulation.note,
        source: 'manual',
        createdAt: now.toISOString(),
      },
    });
    setIntentSimulation(null);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: 'ai', text: 'Pengeluaran dicatat setelah simulasi.' },
    ]);
  };

  const handleConfirmIntent = () => {
    if (!intentDraft) return;
    const now = new Date();
    switch (intentDraft.type) {
      case 'add_obligation':
        dispatch({
          type: 'add-obligation',
          obligation: buildObligation(
            {
              name: intentDraft.name,
              amount: String(intentDraft.amount),
              dueOn: intentDraft.dueOn,
              category: intentDraft.category,
            },
            now,
            () => crypto.randomUUID()
          ),
        });
        break;
      case 'create_goal':
        dispatch({
          type: 'add-goal',
          goal: buildGoal(
            {
              name: intentDraft.name,
              targetAmount: String(intentDraft.targetAmount),
              targetDate: intentDraft.targetDate ?? '',
              category: intentDraft.category,
            },
            now,
            () => crypto.randomUUID()
          ),
        });
        break;
      case 'simulate_purchase':
        setIntentSimulation({
          amount: intentDraft.amount,
          note: intentDraft.note,
          today: toLocalYyyyMmDd(now),
          result: simulatePurchase({
            snapshot: state.snapshot,
            today: toLocalYyyyMmDd(now),
            amount: intentDraft.amount,
          }),
        });
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), sender: 'ai', text: 'Simulasi selesai. Data belum diubah.' },
        ]);
        break;
      case 'mark_obligation_paid': {
        const obligation = state.snapshot.obligations.find(
          (item) =>
            item.name.toLowerCase() === intentDraft.obligationName.toLowerCase() &&
            item.amount === intentDraft.amount
        );
        if (obligation && obligation.status === 'unpaid') {
          dispatch({
            type: 'mark-obligation-paid',
            obligationId: obligation.id,
            transaction: {
              id: crypto.randomUUID(),
              type: 'expense',
              category: obligationCategoryToTransactionCategory(obligation.category),
              amount: obligation.amount,
              occurredOn: toLocalYyyyMmDd(now),
              note: `Bayar ${obligation.name}`,
              source: 'manual',
              createdAt: now.toISOString(),
            },
          });
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              sender: 'ai',
              text: `Tanggungan “${intentDraft.obligationName}” sebesar ${formatRp(intentDraft.amount)} tidak ditemukan atau sudah lunas. Periksa nama dan nominalnya.`,
            },
          ]);
          setIntentDraft(null);
          return;
        }
        break;
      }
      case 'ask_summary': {
        const projection = projectBudget(state.snapshot, toLocalYyyyMmDd(now));
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: `Ringkasan: saldo cair ${formatRp(projection.liquidBalance)}, dana aman ${formatRp(projection.safePool)}, dan jatah harian ${formatRp(projection.safeToSpendPerDay)}. Kondisi: ${projection.health}.`,
          },
        ]);
        setIntentDraft(null);
        return;
      }
      default:
        break;
    }
    setIntentDraft(null);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: 'ai', text: 'Tindakan dikonfirmasi.' },
    ]);
  };

  const intentSummary = (() => {
    if (!intentDraft) return '';
    switch (intentDraft.type) {
      case 'add_obligation':
        return `Tambah tanggungan ${intentDraft.name} sebesar ${formatRp(intentDraft.amount)}.`;
      case 'create_goal':
        return `Tambah tujuan ${intentDraft.name} sebesar ${formatRp(intentDraft.targetAmount)}.`;
      case 'simulate_purchase':
        return `Simulasikan pembelian ${intentDraft.note} sebesar ${formatRp(intentDraft.amount)}.`;
      case 'mark_obligation_paid':
        return `Tandai ${intentDraft.obligationName} sebesar ${formatRp(intentDraft.amount)} sebagai lunas.`;
      case 'ask_summary':
        return `Ringkas kondisi keuangan: ${intentDraft.question}`;
      default:
        return '';
    }
  })();

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
          {draftError && <Typography color="error">{draftError}</Typography>}
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
              label="Nominal"
              value={Number.isFinite(draft.amount) ? draft.amount : ''}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  amount: (e.currentTarget as HTMLInputElement).valueAsNumber,
                })
              }
              sx={{ flex: 2 }}
            />
          </Box>
          <TextField
            size="small"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            placeholder="Catatan..."
          />
          <TextField
            size="small"
            type="date"
            label="Tanggal"
            value={draft.occurredOn}
            onChange={(e) => setDraft({ ...draft, occurredOn: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
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
      ) : intentDraft ? (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}>
          <Typography variant="subtitle2">Pratinjau tindakan</Typography>
          <Typography variant="body2" sx={{ my: 1 }}>
            {intentSummary}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={() => setIntentDraft(null)}
            >
              Batal
            </Button>
            <Button variant="contained" fullWidth onClick={handleConfirmIntent}>
              Konfirmasi tindakan
            </Button>
          </Box>
        </Box>
      ) : intentSimulation ? (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}>
          <Typography variant="subtitle2">Hasil simulasi</Typography>
          <Typography variant="body2" sx={{ my: 1 }}>
            {intentSimulation.result.verdict === 'safe'
              ? 'Pembelian ini masih aman.'
              : intentSimulation.result.verdict === 'tight'
                ? 'Pembelian ini bisa dilakukan, tetapi ruang harian menjadi ketat.'
                : 'Pembelian ini belum aman untuk kondisi saat ini.'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Sisa jatah harian setelah simulasi:{' '}
            {formatRp(intentSimulation.result.after.safeToSpendPerDay)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={() => setIntentSimulation(null)}
            >
              Tutup
            </Button>
            <Button variant="contained" fullWidth onClick={handleRecordSimulation}>
              Catat sebagai pengeluaran
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
