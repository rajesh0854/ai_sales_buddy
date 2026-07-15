"use client";
import { Users, Package, Languages } from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { SearchableSelect, Select } from "@/components/ui";
import { TabSwitcher } from "./TabSwitcher";

/**
 * Sticky "pick once" bar: customer/product/language selection lives here,
 * shared by every panel via WorkspaceContext — switching tabs never resets it.
 */
export function CustomerProductPicker() {
  const { customerId, setCustomerId, productId, setProductId, language, setLanguage, customers, products, languages } = useWorkspace();

  return (
    <div className="bg-white/85 backdrop-blur border-b border-slate-100">
      <div className="px-4 py-2.5 flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 min-w-[200px] flex-1">
          <Users className="h-4 w-4 text-slate-400 shrink-0" />
          <SearchableSelect
            value={customerId}
            onChange={setCustomerId}
            placeholder="Select customer…"
            options={customers.map((c) => ({ value: c.customer_id, label: `${c.full_name} · ${c.segment}` }))}
            className="py-1.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 min-w-[180px] flex-1">
          <Package className="h-4 w-4 text-slate-400 shrink-0" />
          <SearchableSelect
            value={productId}
            onChange={setProductId}
            placeholder="Select product…"
            options={products.map((p) => ({ value: p.product_id, label: p.name }))}
            className="py-1.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 min-w-[130px]">
          <Languages className="h-4 w-4 text-slate-400 shrink-0" />
          <Select value={language} onChange={setLanguage} options={languages} className="py-1.5 text-sm" />
        </div>
        <div className="ml-auto">
          <TabSwitcher />
        </div>
      </div>
    </div>
  );
}
