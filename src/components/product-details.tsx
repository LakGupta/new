import { PRODUCT_PRICE } from "@/lib/product";

export default function ProductDetails() {
  const rows = [
    { label: "Price", value: PRODUCT_PRICE },
    { label: "Shipping", value: "PAN India · complimentary" },
    { label: "Face-to-face", value: "Available in Bangalore" },
    { label: "COD", value: "Not available" },
  ];

  return (
    <div className="rounded-[10px] border border-line bg-background p-5 sm:p-6">
      <p className="label-mono">The details</p>
      <dl className="mt-3 divide-y divide-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-3"
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-mono text-sm font-semibold tabular-nums text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        We don&apos;t offer COD. Once the box is opened, returns leave us
        with a big loss, so all orders are prepaid.
      </p>
    </div>
  );
}
