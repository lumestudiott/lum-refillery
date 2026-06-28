'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Search, ShieldCheck, Shield, DollarSign, Eye } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Doc, Id } from '../../../../convex/_generated/dataModel';
import {
  Btn,
  Card,
  EmptyState,
  Loading,
  Modal,
  SectionHeader,
  StatusBadge,
  Table,
  Td,
  TextField,
  Th,
  cents,
  fmtDate,
  useToast,
} from '../lib';

type User = Doc<'users'>;

export default function UsersSection() {
  const users = useQuery(api.admin.listUsers);
  const setAdmin = useMutation(api.admin.setUserAdmin);
  const adjust = useMutation(api.credits.adminAdjust);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [creditFor, setCreditFor] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [detailId, setDetailId] = useState<Id<'users'> | null>(null);

  const filtered = useMemo(() => {
    return (users ?? []).filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        (u.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  async function toggleAdmin(u: User) {
    const next = !u.isAdmin;
    if (
      !confirm(
        next
          ? `Grant admin access to ${u.email}?`
          : `Revoke admin access from ${u.email}?`
      )
    )
      return;
    try {
      await setAdmin({ userId: u._id, isAdmin: next });
      toast(next ? 'Admin granted' : 'Admin revoked');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  async function submitCredit() {
    if (!creditFor) return;
    const dollars = parseFloat(amount);
    if (!Number.isFinite(dollars) || dollars === 0) {
      toast('Enter a non-zero amount (negative to deduct)', 'error');
      return;
    }
    try {
      await adjust({
        userId: creditFor._id,
        amountCents: Math.round(dollars * 100),
        note: note.trim() || undefined,
      });
      toast(`Adjusted credit for ${creditFor.email}`);
      setCreditFor(null);
      setAmount('');
      setNote('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  return (
    <div>
      <SectionHeader
        title="Users"
        subtitle="Customer accounts — adjust store credit, grant admin, inspect activity."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name…"
            className="w-full rounded-lg border border-black/[0.1] bg-white py-2 pl-9 pr-3 text-[14px] outline-none focus:border-lume-accent"
          />
        </div>
        <span className="text-[13px] text-text-secondary">
          {filtered.length} user{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      <Card className="p-1.5">
        {users === undefined ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState message="No users match." />
        ) : (
          <Table
            head={
              <>
                <Th>User</Th>
                <Th>Subscription</Th>
                <Th className="text-right">Credit</Th>
                <Th>Joined</Th>
                <Th>Role</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {filtered.map((u) => (
              <tr key={u._id} className="hover:bg-black/[0.015]">
                <Td>
                  <div className="font-semibold text-text-primary">
                    {u.name || '—'}
                  </div>
                  <div className="text-[12px] text-text-secondary">{u.email}</div>
                </Td>
                <Td>
                  {u.subscriptionTier ? (
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{u.subscriptionTier}</span>
                      <StatusBadge status={u.subscriptionStatus} />
                    </div>
                  ) : (
                    <span className="text-text-secondary">None</span>
                  )}
                </Td>
                <Td className="text-right tabular-nums">
                  {cents(u.creditsCents)}
                </Td>
                <Td className="text-text-secondary">{fmtDate(u.createdAt)}</Td>
                <Td>
                  {u.isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-lume-accent">
                      <ShieldCheck className="h-3.5 w-3.5" /> Admin
                    </span>
                  ) : (
                    <span className="text-text-secondary">Customer</span>
                  )}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setDetailId(u._id)}
                      className="rounded-lg p-2 text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
                      title="View detail"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCreditFor(u);
                        setAmount('');
                        setNote('');
                      }}
                      className="rounded-lg p-2 text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
                      title="Adjust credit"
                    >
                      <DollarSign className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleAdmin(u)}
                      className="rounded-lg p-2 text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
                      title={u.isAdmin ? 'Revoke admin' : 'Grant admin'}
                    >
                      {u.isAdmin ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Credit modal */}
      <Modal
        open={!!creditFor}
        onClose={() => setCreditFor(null)}
        title={`Adjust credit — ${creditFor?.email ?? ''}`}
        footer={
          <>
            <Btn onClick={() => setCreditFor(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={submitCredit}>
              Apply adjustment
            </Btn>
          </>
        }
      >
        <p className="mb-4 text-[13px] text-text-secondary">
          Current balance:{' '}
          <span className="font-semibold text-text-primary">
            {cents(creditFor?.creditsCents)}
          </span>
          . Enter a positive amount to add credit, or negative to deduct.
        </p>
        <div className="space-y-4">
          <TextField
            label="Amount (USD)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 10 or -5"
          />
          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for adjustment"
          />
        </div>
      </Modal>

      {/* Detail modal */}
      <UserDetailModal userId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}

function UserDetailModal({
  userId,
  onClose,
}: {
  userId: Id<'users'> | null;
  onClose: () => void;
}) {
  const detail = useQuery(
    api.admin.getUserDetail,
    userId ? { userId } : 'skip'
  );

  return (
    <Modal
      open={!!userId}
      onClose={onClose}
      title={detail?.user.email ?? 'User detail'}
      wide
      footer={<Btn onClick={onClose}>Close</Btn>}
    >
      {!detail ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Mini label="Credit" value={cents(detail.user.creditsCents)} />
            <Mini label="Subscriptions" value={detail.subscriptions.length} />
            <Mini label="Boxes" value={detail.boxes.length} />
            <Mini label="Addresses" value={detail.addresses.length} />
          </div>

          <DetailBlock title="Subscriptions">
            {detail.subscriptions.length === 0 ? (
              <Muted>None</Muted>
            ) : (
              detail.subscriptions.map((s) => (
                <Row key={s._id}>
                  <span className="capitalize">{s.tier}</span>
                  <StatusBadge status={s.status} />
                </Row>
              ))
            )}
          </DetailBlock>

          <DetailBlock title="Recent boxes">
            {detail.boxes.length === 0 ? (
              <Muted>None</Muted>
            ) : (
              detail.boxes.map((b) => (
                <Row key={b._id}>
                  <span>
                    {b.weekKey} · {cents(b.totalCents)}
                  </span>
                  <StatusBadge status={b.status} />
                </Row>
              ))
            )}
          </DetailBlock>

          <DetailBlock title="Credit history">
            {detail.credits.length === 0 ? (
              <Muted>None</Muted>
            ) : (
              detail.credits.map((c) => (
                <Row key={c._id}>
                  <span className="text-text-secondary">
                    {c.reason}
                    {c.note ? ` — ${c.note}` : ''}
                  </span>
                  <span
                    className={`font-semibold tabular-nums ${
                      c.amountCents >= 0 ? 'text-lume-accent' : 'text-red-600'
                    }`}
                  >
                    {c.amountCents >= 0 ? '+' : ''}
                    {cents(c.amountCents)}
                  </span>
                </Row>
              ))
            )}
          </DetailBlock>
        </div>
      )}
    </Modal>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-black/[0.03] p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
        {label}
      </div>
      <div className="mt-1 font-display text-[20px] tracking-tight text-text-primary">
        {value}
      </div>
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
        {title}
      </h3>
      <div className="divide-y divide-black/[0.05] rounded-xl border border-black/[0.06]">
        {children}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px]">
      {children}
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-3 text-[13px] text-text-secondary">{children}</div>;
}
