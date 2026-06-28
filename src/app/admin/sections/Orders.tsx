'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Search, Truck, Package } from 'lucide-react';
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

const BOX_STATUSES = [
  'draft',
  'locked',
  'packed',
  'shipped',
  'delivered',
  'skipped',
  'refunded',
];
const SHOP_STATUSES = ['paid', 'fulfilled', 'cancelled'];

export default function Orders() {
  const [tab, setTab] = useState<'boxes' | 'shop'>('boxes');
  return (
    <div>
      <SectionHeader
        title="Orders"
        subtitle="Recurring delivery boxes and one-off shop purchases."
      />
      <div className="mb-5 inline-flex rounded-xl border border-black/[0.08] bg-white p-1">
        <TabBtn active={tab === 'boxes'} onClick={() => setTab('boxes')}>
          <Truck className="h-4 w-4" /> Delivery boxes
        </TabBtn>
        <TabBtn active={tab === 'shop'} onClick={() => setTab('shop')}>
          <Package className="h-4 w-4" /> Shop orders
        </TabBtn>
      </div>
      {tab === 'boxes' ? <BoxesTab /> : <ShopTab />}
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

/* ─── Boxes ─── */

function BoxesTab() {
  const [statusFilter, setStatusFilter] = useState('');
  const boxes = useQuery(api.admin.listBoxes, statusFilter ? { status: statusFilter } : {});
  const setStatus = useMutation(api.admin.setBoxStatus);
  const ship = useMutation(api.shipping.shipBox);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [shipFor, setShipFor] = useState<Doc<'boxes'> | null>(null);
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const filtered = useMemo(() => {
    return (boxes ?? []).filter((b) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        ((b as { userEmail?: string | null }).userEmail ?? '')
          .toLowerCase()
          .includes(q) || b.weekKey.toLowerCase().includes(q)
      );
    });
  }, [boxes, search]);

  async function change(id: Id<'boxes'>, status: string) {
    try {
      await setStatus({ boxId: id, status });
      toast('Box updated');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  async function submitShip() {
    if (!shipFor) return;
    try {
      await ship({
        boxId: shipFor._id,
        carrier: carrier.trim() || undefined,
        trackingNumber: tracking.trim() || undefined,
        trackingUrl: trackingUrl.trim() || undefined,
      });
      toast('Box marked shipped');
      setShipFor(null);
      setCarrier('');
      setTracking('');
      setTrackingUrl('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or week…"
            className="w-full rounded-lg border border-black/[0.1] bg-white py-2 pl-9 pr-3 text-[14px] outline-none focus:border-lume-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-black/[0.1] bg-white px-3 py-2 text-[14px] outline-none focus:border-lume-accent"
        >
          <option value="">All statuses</option>
          {BOX_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Card className="p-1.5">
        {boxes === undefined ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState message="No boxes match." />
        ) : (
          <Table
            head={
              <>
                <Th>Customer</Th>
                <Th>Week</Th>
                <Th>Delivery</Th>
                <Th className="text-right">Total</Th>
                <Th>Tracking</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {filtered.map((b) => (
              <tr key={b._id} className="hover:bg-black/[0.015]">
                <Td>
                  <div className="text-[12px] text-text-secondary">
                    {(b as { userEmail?: string | null }).userEmail || '—'}
                  </div>
                </Td>
                <Td className="font-mono text-[12px]">{b.weekKey}</Td>
                <Td className="text-text-secondary">{fmtDate(b.deliveryDate)}</Td>
                <Td className="text-right tabular-nums">{cents(b.totalCents)}</Td>
                <Td className="text-[12px] text-text-secondary">
                  {b.trackingNumber || '—'}
                </Td>
                <Td>
                  <select
                    value={b.status}
                    onChange={(e) => change(b._id, e.target.value)}
                    className="rounded-lg border border-black/[0.1] bg-white px-2.5 py-1.5 text-[12px] font-semibold capitalize outline-none focus:border-lume-accent"
                  >
                    {BOX_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td className="text-right">
                  <Btn onClick={() => setShipFor(b)}>
                    <Truck className="h-3.5 w-3.5" /> Ship
                  </Btn>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={!!shipFor}
        onClose={() => setShipFor(null)}
        title="Mark box shipped"
        footer={
          <>
            <Btn onClick={() => setShipFor(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={submitShip}>
              Confirm shipment
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          <TextField
            label="Carrier"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="e.g. TTPost, DHL"
          />
          <TextField
            label="Tracking number"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <TextField
            label="Tracking URL"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
      </Modal>
    </div>
  );
}

/* ─── Shop orders ─── */

function ShopTab() {
  const orders = useQuery(api.admin.listShopOrders);
  const setStatus = useMutation(api.admin.setShopOrderStatus);
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [itemsFor, setItemsFor] = useState<Id<'shopOrders'> | null>(null);

  const filtered = useMemo(() => {
    return (orders ?? []).filter((o) => {
      if (!search) return true;
      return (o.userEmail ?? '').toLowerCase().includes(search.toLowerCase());
    });
  }, [orders, search]);

  async function change(id: Id<'shopOrders'>, status: string) {
    try {
      await setStatus({ orderId: id, status });
      toast('Order updated');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email…"
            className="w-full rounded-lg border border-black/[0.1] bg-white py-2 pl-9 pr-3 text-[14px] outline-none focus:border-lume-accent"
          />
        </div>
      </div>

      <Card className="p-1.5">
        {orders === undefined ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState message="No shop orders match." />
        ) : (
          <Table
            head={
              <>
                <Th>Customer</Th>
                <Th>Placed</Th>
                <Th className="text-right">Total</Th>
                <Th>Status</Th>
                <Th className="text-right">Items</Th>
              </>
            }
          >
            {filtered.map((o) => (
              <tr key={o._id} className="hover:bg-black/[0.015]">
                <Td className="text-[12px] text-text-secondary">
                  {o.userEmail || '—'}
                </Td>
                <Td className="text-text-secondary">{fmtDate(o.createdAt)}</Td>
                <Td className="text-right tabular-nums">{cents(o.totalCents)}</Td>
                <Td>
                  <select
                    value={o.status}
                    onChange={(e) => change(o._id, e.target.value)}
                    className="rounded-lg border border-black/[0.1] bg-white px-2.5 py-1.5 text-[12px] font-semibold capitalize outline-none focus:border-lume-accent"
                  >
                    {SHOP_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td className="text-right">
                  <Btn onClick={() => setItemsFor(o._id)}>View</Btn>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <OrderItemsModal orderId={itemsFor} onClose={() => setItemsFor(null)} />
    </div>
  );
}

function OrderItemsModal({
  orderId,
  onClose,
}: {
  orderId: Id<'shopOrders'> | null;
  onClose: () => void;
}) {
  const items = useQuery(
    api.admin.getShopOrderItems,
    orderId ? { orderId } : 'skip'
  );
  return (
    <Modal
      open={!!orderId}
      onClose={onClose}
      title="Order items"
      footer={<Btn onClick={onClose}>Close</Btn>}
    >
      {items === undefined ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState message="No items recorded." />
      ) : (
        <div className="divide-y divide-black/[0.05]">
          {items.map((it) => (
            <div
              key={it._id}
              className="flex items-center justify-between py-2.5 text-[13px]"
            >
              <span>
                <span className="font-mono text-[12px] text-text-secondary">
                  {it.sku}
                </span>{' '}
                × {it.quantity}
              </span>
              <span className="tabular-nums">{cents(it.priceCents)}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
