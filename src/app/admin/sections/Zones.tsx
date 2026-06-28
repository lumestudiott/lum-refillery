'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Plus, Pencil } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';
import {
  Btn,
  Card,
  EmptyState,
  Loading,
  Modal,
  SectionHeader,
  SelectField,
  StatusBadge,
  Table,
  Td,
  TextField,
  Th,
  cents,
  useAction,
  useToast,
} from '../lib';

type Zone = Doc<'deliveryZones'>;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type FormState = {
  zipPrefix: string;
  name: string;
  cutoffDayOfWeek: number;
  cutoffHour: number;
  deliveryDayOfWeek: number;
  carrier: string;
  feeDollars: string;
  active: boolean;
};

function emptyForm(): FormState {
  return {
    zipPrefix: '',
    name: '',
    cutoffDayOfWeek: 2,
    cutoffHour: 23,
    deliveryDayOfWeek: 6,
    carrier: '',
    feeDollars: '',
    active: true,
  };
}

export default function Zones() {
  const zones = useQuery(api.admin.listDeliveryZones);
  const upsert = useMutation(api.deliveryZones.upsertZone);
  const setActive = useMutation(api.admin.setDeliveryZoneActive);
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const toggle = useAction(
    (z: Zone) => setActive({ zoneId: z._id, active: !z.active }),
    'Zone updated'
  );

  function openCreate() {
    setForm(emptyForm());
    setEditing(null);
    setOpen(true);
  }
  function openEdit(z: Zone) {
    setForm({
      zipPrefix: z.zipPrefix,
      name: z.name,
      cutoffDayOfWeek: z.cutoffDayOfWeek,
      cutoffHour: z.cutoffHour,
      deliveryDayOfWeek: z.deliveryDayOfWeek,
      carrier: z.carrier ?? '',
      feeDollars: (z.shippingFeeCents / 100).toFixed(2),
      active: z.active,
    });
    setEditing(z);
    setOpen(true);
  }

  async function save() {
    if (!form.zipPrefix.trim() || !form.name.trim()) {
      toast('Zip prefix and name are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await upsert({
        zipPrefix: form.zipPrefix.trim(),
        name: form.name.trim(),
        cutoffDayOfWeek: form.cutoffDayOfWeek,
        cutoffHour: form.cutoffHour,
        deliveryDayOfWeek: form.deliveryDayOfWeek,
        carrier: form.carrier.trim() || undefined,
        shippingFeeCents: Math.round(parseFloat(form.feeDollars || '0') * 100),
        active: form.active,
      });
      toast(editing ? 'Zone updated' : 'Zone created');
      setOpen(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionHeader
        title="Delivery zones"
        subtitle="Coverage by zip prefix — cutoff windows, delivery days, and fees."
        actions={
          <Btn variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New zone
          </Btn>
        }
      />

      <Card className="p-1.5">
        {zones === undefined ? (
          <Loading />
        ) : zones.length === 0 ? (
          <EmptyState message="No delivery zones yet." />
        ) : (
          <Table
            head={
              <>
                <Th>Zone</Th>
                <Th>Zip prefix</Th>
                <Th>Cutoff</Th>
                <Th>Delivery</Th>
                <Th className="text-right">Fee</Th>
                <Th>Carrier</Th>
                <Th>Status</Th>
                <Th className="text-right">Edit</Th>
              </>
            }
          >
            {zones.map((z) => (
              <tr key={z._id} className="hover:bg-black/[0.015]">
                <Td className="font-semibold">{z.name}</Td>
                <Td className="font-mono text-[12px]">{z.zipPrefix}</Td>
                <Td className="text-text-secondary">
                  {DAYS[z.cutoffDayOfWeek]} {z.cutoffHour}:00
                </Td>
                <Td className="text-text-secondary">
                  {DAYS[z.deliveryDayOfWeek]}
                </Td>
                <Td className="text-right tabular-nums">
                  {cents(z.shippingFeeCents)}
                </Td>
                <Td className="text-text-secondary">{z.carrier || '—'}</Td>
                <Td>
                  <button onClick={() => toggle(z)} title="Toggle active">
                    <StatusBadge status={z.active ? 'active' : 'draft'} />
                  </button>
                </Td>
                <Td className="text-right">
                  <button
                    onClick={() => openEdit(z)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'New delivery zone'}
        footer={
          <>
            <Btn onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save zone'}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Zip prefix"
            value={form.zipPrefix}
            disabled={!!editing}
            onChange={(e) => setForm({ ...form, zipPrefix: e.target.value })}
            placeholder="e.g. 100"
          />
          <TextField
            label="Zone name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Port of Spain"
          />
          <SelectField
            label="Cutoff day"
            value={String(form.cutoffDayOfWeek)}
            onChange={(e) =>
              setForm({ ...form, cutoffDayOfWeek: Number(e.target.value) })
            }
          >
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Cutoff hour (0–23)"
            type="number"
            min="0"
            max="23"
            value={String(form.cutoffHour)}
            onChange={(e) =>
              setForm({ ...form, cutoffHour: Number(e.target.value) })
            }
          />
          <SelectField
            label="Delivery day"
            value={String(form.deliveryDayOfWeek)}
            onChange={(e) =>
              setForm({ ...form, deliveryDayOfWeek: Number(e.target.value) })
            }
          >
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Shipping fee (USD)"
            type="number"
            step="0.01"
            min="0"
            value={form.feeDollars}
            onChange={(e) => setForm({ ...form, feeDollars: e.target.value })}
            placeholder="0.00"
          />
          <div className="sm:col-span-2">
            <TextField
              label="Carrier (optional)"
              value={form.carrier}
              onChange={(e) => setForm({ ...form, carrier: e.target.value })}
              placeholder="e.g. TTPost"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] sm:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-lume-accent"
            />
            Active
          </label>
        </div>
      </Modal>
    </div>
  );
}
