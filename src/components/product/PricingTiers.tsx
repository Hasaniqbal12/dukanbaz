"use client";

interface Tier { range: string; price: number }

interface Props {
  price: number;
  comparePrice?: number;
  moq: number;
  tiers?: Tier[];
  currency?: string; // e.g. Rs
}

export default function PricingTiers({ price, comparePrice, moq, tiers, currency = "Rs" }: Props) {
  const derived: Tier[] = tiers && tiers.length > 0 ? tiers : [
    { range: `${moq}-${moq * 4 - 1}`, price: price },
    { range: `${moq * 4}-${moq * 10 - 1}`, price: Number((price * 0.95).toFixed(2)) },
    { range: `${moq * 10}+`, price: Number((price * 0.9).toFixed(2)) },
  ];

  return (
    <div className="grid grid-cols-3 border border-gray-200 rounded-lg overflow-hidden">
      {derived.map((t, i) => (
        <div key={i} className="p-4 bg-white">
          <div className="text-gray-500 text-xs">{t.range} {t.range.includes('+') ? 'units' : ''}</div>
          <div className="text-lg font-semibold text-gray-900">
            {currency} {Math.max(0, t.price).toLocaleString()}
          </div>
          {comparePrice && comparePrice > t.price && (
            <div className="text-xs text-gray-500 line-through">
              {currency} {comparePrice.toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
