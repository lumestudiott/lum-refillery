'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { AlertCircle, MessageCircle, Trash2 } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';
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

type Ticket = Doc<'supportTickets'>;

const FILTERS = ['all', 'open', 'resolved'] as const;

export default function Support() {
  const tickets = useQuery(api.support.listAll, {});
  const setStatus = useMutation(api.support.setStatus);
  const del = useMutation(api.support.remove);
  const toast = useToast();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = (tickets ?? []).filter(
    (t) => filter === 'all' || t.status === filter
  );

  async function toggleStatus(t: Ticket) {
    try {
      await setStatus({
        id: t._id,
        status: t.status === 'open' ? 'resolved' : 'open',
      });
      toast(t.status === 'open' ? 'Marked resolved' : 'Reopened');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  }

  async function confirmDelete(t: Ticket) {
    if (!confirm(`Delete this ${t.type} from ${t.name}? This cannot be undone.`)) return;
    try {
      await del({ id: t._id });
      toast('Ticket deleted');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  return (
    <div>
      <SectionHeader
        title="Support"
        subtitle="Complaints and contact queries submitted from the site."
        actions={
          <div className="flex gap-1 rounded-xl bg-black/[0.04] p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3.5 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <Card className="p-1.5">
        {tickets === undefined ? (
          <Loading />
        ) : visible.length === 0 ? (
          <EmptyState message="No tickets here - inbox zero." />
        ) : (
          <Table
            head={
              <>
                <Th>From</Th>
                <Th>Subject</Th>
                <Th>Type</Th>
                <Th>Received</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {visible.map((t) => (
              <React.Fragment key={t._id}>
                <tr
                  className="cursor-pointer hover:bg-black/[0.015]"
                  onClick={() => setExpanded(expanded === t._id ? null : t._id)}
                >
                  <Td>
                    <div className="font-semibold text-text-primary">{t.name}</div>
                    <div className="text-[12px] text-text-secondary">{t.email}</div>
                  </Td>
                  <Td>
                    <span className="line-clamp-1">{t.subject}</span>
                    {t.orderRef && (
                      <span className="block font-mono text-[11px] text-text-secondary">
                        Order: {t.orderRef}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 text-[12px] capitalize text-text-secondary">
                      {t.type === 'complaint' ? (
                        <AlertCircle className="h-3.5 w-3.5 text-copper-600" />
                      ) : (
                        <MessageCircle className="h-3.5 w-3.5 text-lume-accent" />
                      )}
                      {t.type}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-[12px] text-text-secondary">
                      {fmtDate(t.createdAt)}
                    </span>
                  </Td>
                  <Td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(t);
                      }}
                      title="Toggle status"
                    >
                      <StatusBadge status={t.status === 'open' ? 'active' : 'paused'} />
                    </button>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(t);
                        }}
                        className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
                {expanded === t._id && (
                  <tr>
                    <td colSpan={6} className="bg-black/[0.02] px-6 py-4">
                      <p className="max-w-3xl whitespace-pre-wrap text-[13px] leading-relaxed text-text-primary">
                        {t.message}
                      </p>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
