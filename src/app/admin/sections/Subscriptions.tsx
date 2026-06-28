'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Search } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  EmptyState,
  Loading,
  SectionHeader,
  StatusBadge,
  Table,
  Td,
  Th,
  fmtDate,
  useToast,
} from '../lib';

const STATUSES = ['active', 'paused', 'past_due', 'cancelled', 'incomplete'];

export default function Subscriptions() {
  const subs = useQuery(api.admin.listSubscriptions);
  const setStatus = useMutation(api.admin.setSubscriptionStatus);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    return (subs ?? []).filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (s.userEmail ?? '').toLowerCase().includes(q) ||
          (s.tier ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [subs, search, statusFilter]);

  async function change(id: typeof filtered[number]['_id'], status: string) {
    try {
      await setStatus({ subscriptionId: id, status });
      toast('Subscription updated');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  return (
    <div>
      <SectionHeader
        title="Subscriptions"
        subtitle="Every recurring plan. Change a status inline to pause, resume, or cancel."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or tier…"
            className="w-full rounded-lg border border-black/[0.1] bg-white py-2 pl-9 pr-3 text-[14px] outline-none focus:border-lume-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-black/[0.1] bg-white px-3 py-2 text-[14px] outline-none focus:border-lume-accent"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-[13px] text-text-secondary">
          {filtered.length} subscription{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      <Card className="p-1.5">
        {subs === undefined ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState message="No subscriptions match." />
        ) : (
          <Table
            head={
              <>
                <Th>Customer</Th>
                <Th>Tier</Th>
                <Th>Cadence</Th>
                <Th>Next delivery</Th>
                <Th>Created</Th>
                <Th>Status</Th>
              </>
            }
          >
            {filtered.map((s) => (
              <tr key={s._id} className="hover:bg-black/[0.015]">
                <Td>
                  <div className="font-semibold text-text-primary">
                    {s.userName || '—'}
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    {s.userEmail || '—'}
                  </div>
                </Td>
                <Td className="capitalize">{s.tier}</Td>
                <Td className="capitalize text-text-secondary">
                  {s.cadence ?? s.frequency ?? 'monthly'}
                </Td>
                <Td className="text-text-secondary">{fmtDate(s.nextDelivery)}</Td>
                <Td className="text-text-secondary">{fmtDate(s.createdAt)}</Td>
                <Td>
                  <select
                    value={s.status}
                    onChange={(e) => change(s._id, e.target.value)}
                    className="rounded-lg border border-black/[0.1] bg-white px-2.5 py-1.5 text-[12px] font-semibold capitalize outline-none focus:border-lume-accent"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
