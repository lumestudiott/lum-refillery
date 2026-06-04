'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Plus, MapPin, Star, Trash2 } from 'lucide-react';
import AddressForm from './AddressForm';

export default function AddressManager() {
  const { isAuthenticated } = useConvexAuth();
  const addresses = useQuery(api.addresses.listMine, isAuthenticated ? undefined : "skip");
  const setPrimary = useMutation(api.addresses.setPrimary);
  const removeAddress = useMutation(api.addresses.remove);

  const [isAdding, setIsAdding] = useState(false);

  if (!isAuthenticated || addresses === undefined) {
    return <div className="animate-pulse h-32 bg-lume-house/5 rounded-2xl" />;
  }

  return (
    <div className="rounded-[32px] border border-white/60 bg-white/50 p-8 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
          Delivery Addresses
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-lume-accent hover:text-lume-accent/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        )}
      </div>

      {isAdding ? (
        <div className="bg-white rounded-2xl p-6 border border-lume-house/10 shadow-sm">
          <h3 className="text-lg font-display mb-4">Add a new address</h3>
          <AddressForm
            onSuccess={() => setIsAdding(false)}
            onCancel={() => setIsAdding(false)}
            requirePrimary={addresses.length === 0}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-lume-house/20">
              <MapPin className="h-8 w-8 mx-auto text-lume-house/30 mb-2" />
              <p className="text-sm text-text-secondary">No addresses saved yet.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address._id}
                className={`relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 rounded-2xl border transition-colors ${
                  address.isPrimary
                    ? 'border-lume-accent/30 bg-lume-accent/5'
                    : 'border-lume-house/10 bg-white hover:border-lume-house/30'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-text-primary">
                      {address.label || 'Address'}
                    </span>
                    {address.isPrimary && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-lume-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-lume-accent">
                        <Star className="h-3 w-3" fill="currentColor" />
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                    <br />
                    {address.city}, {address.state} {address.zip && address.zip}
                    <br />
                    Trinidad and Tobago
                  </p>
                  {address.deliveryInstructions && (
                    <p className="mt-2 text-xs text-text-secondary/80 italic">
                      Note: {address.deliveryInstructions}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  {!address.isPrimary && (
                    <button
                      onClick={() => setPrimary({ addressId: address._id })}
                      className="text-[11px] font-medium uppercase tracking-[0.08em] text-lume-house/60 hover:text-lume-house transition-colors"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => removeAddress({ addressId: address._id })}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
