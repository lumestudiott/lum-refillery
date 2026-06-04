'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const TT_REGIONS = [
  'Port of Spain',
  'San Fernando',
  'Arima',
  'Chaguanas',
  'Point Fortin',
  'Couva-Tabaquite-Talparo',
  'Diego Martin',
  'Penal-Debe',
  'Princes Town',
  'Rio Claro-Mayaro',
  'San Juan-Laventille',
  'Sangre Grande',
  'Siparia',
  'Tunapuna-Piarco',
  'Tobago',
];

interface AddressFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  requirePrimary?: boolean;
}

export default function AddressForm({ onSuccess, onCancel, requirePrimary = false }: AddressFormProps) {
  const addAddress = useMutation(api.addresses.add);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: TT_REGIONS[0],
    zip: '',
    deliveryInstructions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addAddress({
        ...formData,
        country: 'TT',
        setPrimary: requirePrimary ? true : undefined,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-1">
          Address Label
        </label>
        <select
          name="label"
          value={formData.label}
          onChange={handleChange}
          className="w-full rounded-md border border-lume-house/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-lume-house"
        >
          <option value="Home">Home</option>
          <option value="Work">Work</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-1">
          Street Address (Line 1) *
        </label>
        <input
          required
          type="text"
          name="line1"
          value={formData.line1}
          onChange={handleChange}
          placeholder="123 Main St"
          className="w-full rounded-md border border-lume-house/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-lume-house"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-1">
          Apartment, suite, etc. (Optional)
        </label>
        <input
          type="text"
          name="line2"
          value={formData.line2}
          onChange={handleChange}
          placeholder="Apt 4B"
          className="w-full rounded-md border border-lume-house/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-lume-house"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-1">
            Town / City *
          </label>
          <input
            required
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Port of Spain"
            className="w-full rounded-md border border-lume-house/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-lume-house"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-1">
            Region / Corporation *
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full rounded-md border border-lume-house/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-lume-house"
          >
            {TT_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-1">
          Postal Code (Optional)
        </label>
        <input
          type="text"
          name="zip"
          value={formData.zip}
          onChange={handleChange}
          placeholder="000000"
          className="w-full rounded-md border border-lume-house/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-lume-house"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-1">
          Delivery Instructions (Optional)
        </label>
        <textarea
          name="deliveryInstructions"
          value={formData.deliveryInstructions}
          onChange={handleChange}
          placeholder="Gate code, directions, etc."
          rows={2}
          className="w-full rounded-md border border-lume-house/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-lume-house"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-lume-house/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-lume-house/5"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-lume-house px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-lume-house/90 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}
