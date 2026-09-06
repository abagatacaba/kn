import { useEffect, useState } from "react";
import KNSelect from "../../components/KNSelect";
import { catalogApi, catalogError } from "./catalogApi";

export const SpecVariantFields = ({ initial, onChange, onInherit }) => {
  const [families, setFamilies] = useState([]); const [family, setFamily] = useState(null);
  const [tid, setTid] = useState(initial?.templateId || ""); const [choices, setChoices] = useState({}); const [error, setError] = useState("");
  useEffect(() => { catalogApi.list().then(setFamilies).catch(e => setError(catalogError(e))); }, []);
  const resolve = (tpl, options) => {
    const attrs = Object.fromEntries((tpl.axes || []).flatMap(a => { const o = a.options.find(o => o.code === options[a.key]); return o ? [[a.key, o.label]] : []; }));
    const existing = (tpl.variants || []).find(v => (tpl.axes || []).length && tpl.axes.every(a => (v.variant_options || {})[a.key] === options[a.key]));
    const target = initial?.productId ? tpl.variants.find(v => v.id === initial.productId) : existing;
    const invalid = (tpl.axes || []).some(a => !options[a.key]) ? "Pilih seluruh atribut varian." : target && (target.spec_id || target.lifecycle === "produksi" || !target.lifecycle) ? "Kombinasi ini sudah memiliki SKU yang dirilis/terhubung R&D. Pilih kombinasi baru." : "";
    const color = tpl.axes?.find(a => a.key === "color")?.options.find(o => o.code === options.color);
    const width = tpl.axes?.find(a => a.key === "lebar")?.options.find(o => o.code === options.lebar);
    onChange({ template_id: tpl.id, target_product_id: target?.id || "", variant_attrs: attrs, variant_options: options, invalid, color_target: color ? { code: color.value || color.code } : null });
    if (width) onInherit({ lebar: String(Number(width.value) * 100) });
  };
  useEffect(() => {
    let live = true;
    if (!tid) { setFamily(null); onChange({ template_id: "", target_product_id: "", variant_attrs: {}, variant_options: {} }); return; }
    catalogApi.detail(tid).then(tpl => {
      if (!live) return; setFamily(tpl); setError("");
      const target = tpl.variants.find(v => v.id === initial?.productId);
      const opts = target?.variant_options || {};
      setChoices(opts);
      onInherit({ stage: tpl.stage, fabric_type: tpl.fabric_type, gramasi: target?.gramasi ?? tpl.gramasi ?? "", lebar: String(Number(target?.lebar ?? tpl.lebar ?? 0) * 100), base_unit: tpl.base_unit, category: tpl.category, title: target?.name || tpl.name, sku_hint: target?.sku || "", line_code: tpl.line_code || "" });
      resolve(tpl, opts);
    }).catch(e => { if (live) setError(catalogError(e)); });
    return () => { live = false; };
  }, [tid]); // eslint-disable-line
  return <section data-testid="spec-variant-link" className="space-y-3 rounded-md border border-blue-100 bg-blue-50/40 p-3">
    <label className="block text-xs font-semibold">Induk produk<KNSelect data-testid="spec-family-select" className="field mt-1" value={tid} onValueChange={setTid} disabled={!!initial?.productId} options={[{ value: "", label: "Induk baru saat persetujuan" }, ...families.map(t => ({ value: t.id, label: t.name }))]} /></label>
    {error && <p data-testid="spec-family-error" role="alert" className="text-sm text-red-700">{error}</p>}
    {family && <div className="grid gap-2 sm:grid-cols-2">{(family.axes || []).map(a => <label key={a.key} className="text-xs font-semibold">{a.label}<KNSelect data-testid={`spec-axis-${a.key}`} className="field mt-1" value={choices[a.key] || ""} disabled={!!initial?.productId} options={a.options.map(o => ({ value: o.code, label: o.label }))} onValueChange={v => { const next = { ...choices, [a.key]: v }; setChoices(next); resolve(family, next); }} /></label>)}</div>}
  </section>;
};