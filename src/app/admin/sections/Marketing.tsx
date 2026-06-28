'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Mail, Gift, Share2, Trash2, Download } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import {
  Btn,
  Card,
  EmptyState,
  Loading,
  SectionHeader,
  StatusBadge,
  Table,
  Td,
  Th,
  cents,
  fmtDate,
  useToast,
} from '../lib';

const GIFT_STATUSES = ['pending', 'paid', 'delivered', 'cancelled', 'refunded'];

export default function Marketing() {
  const [tab, setTab] = useState<'newsletter' | 'referrals' | 'gifts'>(
    'newsletter'
  );
  return (
    <div>
      <SectionHeader
        title="Marketing"
        subtitle="Newsletter list, referral program, and gift subscriptions."
      />
      <div className="mb-5 inline-flex rounded-xl border border-black/[0.08] bg-white p-1">
        <TabBtn active={tab === 'newsletter'} onClick={() => setTab('newsletter')}>
          <Mail className="h-4 w-4" /> Newsletter
        </TabBtn>
        <TabBtn active={tab === 'referrals'} onClick={() => setTab('referrals')}>
          <Share2 className="h-4 w-4" /> Referrals
        </TabBtn>
        <TabBtn active={tab === 'gifts'} onClick={() => setTab('gifts')}>
          <Gift className="h-4 w-4" /> Gifts
        </TabBtn>
      </div>
      {tab === 'newsletter' && <Newsletter />}
      {tab === 'referrals' && <Referrals />}
      {tab === 'gifts' && <Gifts />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? 'bg-lume-accent/10 text-lume-accent'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Newsletter ─── */

function Newsletter() {
  const subs = useQuery(api.admin.listNewsletter);
  const remove = useMutation(api.admin.removeNewsletterSubscriber);
  const toast = useToast();

  async function del(id: Id<'newsletterSubscribers'>, email: string) {
    if (!confirm(`Remove ${email} from the newsletter?`)) return;
    try {
      await remove({ id });
      toast('Subscriber removed');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  function exportCsv() {
    if (!subs) return;
    const rows = [
      ['email', 'status', 'subscribedAt'],
      ...subs.map((s) => [
        s.email,
        s.status,
        new Date(s.subscribedAt).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-text-secondary">
          {subs?.length ?? 0} subscriber{subs?.length === 1 ? '' : 's'}
        </span>
        <Btn onClick={exportCsv} disabled={!subs || subs.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Btn>
      </div>
      <Card className="p-1.5">
        {subs === undefined ? (
          <Loading />
        ) : subs.length === 0 ? (
          <EmptyState message="No subscribers yet." />
        ) : (
          <Table
            head={
              <>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Subscribed</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {subs.map((s) => (
              <tr key={s._id} className="hover:bg-black/[0.015]">
                <Td className="font-medium">{s.email}</Td>
                <Td>
                  <StatusBadge status={s.status} />
                </Td>
                <Td className="text-text-secondary">{fmtDate(s.subscribedAt)}</Td>
                <Td className="text-right">
                  <button
                    onClick={() => del(s._id, s.email)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-600"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

/* ─── Referrals ─── */

function Referrals() {
  const referrals = useQuery(api.admin.listReferrals);
  return (
    <Card className="p-1.5">
      {referrals === undefined ? (
        <Loading />
      ) : referrals.length === 0 ? (
        <EmptyState message="No referrals yet." />
      ) : (
        <Table
          head={
            <>
              <Th>Referrer</Th>
              <Th>Referee</Th>
              <Th className="text-right">Bonus</Th>
              <Th>Created</Th>
              <Th>Status</Th>
            </>
          }
        >
          {referrals.map((r) => (
            <tr key={r._id} className="hover:bg-black/[0.015]">
              <Td className="text-[12px] text-text-secondary">
                {r.referrerEmail || '—'}
              </Td>
              <Td>{r.refereeEmail}</Td>
              <Td className="text-right tabular-nums">{cents(r.bonusCents)}</Td>
              <Td className="text-text-secondary">{fmtDate(r.createdAt)}</Td>
              <Td>
                <StatusBadge status={r.status} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
}

/* ─── Gifts ─── */

function Gifts() {
  const gifts = useQuery(api.giftSubscriptions.getAllGiftSubscriptions);
  const setStatus = useMutation(api.admin.setGiftStatus);
  const del = useMutation(api.giftSubscriptions.deleteGiftSubscription);
  const toast = useToast();

  async function change(id: Id<'giftSubscriptions'>, status: string) {
    try {
      await setStatus({ id, status });
      toast('Gift updated');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  async function remove(id: Id<'giftSubscriptions'>, name: string) {
    if (!confirm(`Delete gift to ${name}? This cannot be undone.`)) return;
    try {
      await del({ id });
      toast('Gift deleted');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  return (
    <Card className="p-1.5">
      {gifts === undefined ? (
        <Loading />
      ) : gifts.length === 0 ? (
        <EmptyState message="No gift subscriptions yet." />
      ) : (
        <Table
          head={
            <>
              <Th>From → To</Th>
              <Th>Tier</Th>
              <Th className="text-right">Amount</Th>
              <Th>Created</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </>
          }
        >
          {gifts.map((g) => (
            <tr key={g._id} className="hover:bg-black/[0.015]">
              <Td>
                <div className="font-semibold text-text-primary">
                  {g.recipientName}
                </div>
                <div className="text-[12px] text-text-secondary">
                  from {g.giverName} · {g.giverEmail}
                </div>
              </Td>
              <Td className="capitalize">{g.tier}</Td>
              <Td className="text-right tabular-nums">
                ${g.amount.toFixed(2)}
              </Td>
              <Td className="text-text-secondary">{fmtDate(g.createdAt)}</Td>
              <Td>
                <select
                  value={g.status}
                  onChange={(e) => change(g._id, e.target.value)}
                  className="rounded-lg border border-black/[0.1] bg-white px-2.5 py-1.5 text-[12px] font-semibold capitalize outline-none focus:border-lume-accent"
                >
                  {GIFT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                  {!GIFT_STATUSES.includes(g.status) && (
                    <option value={g.status}>{g.status}</option>
                  )}
                </select>
              </Td>
              <Td className="text-right">
                <button
                  onClick={() => remove(g._id, g.recipientName)}
                  className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
}
