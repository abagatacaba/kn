import { useState } from "react";
import { Save } from "lucide-react";
import { CatalogDialog } from "./CatalogDialog";
import { AxisEditor } from "./AxisEditor";
import { catalogApi, catalogError } from "./catalogApi";
import KNSelect from "../../components/KNSelect";
import DecimalInput from "../../components/DecimalInput";
import useDomainEnums from "../../hooks/useDomainEnums";

export const FamilyForm = ({ template, onClose, onSaved }) => {
  const { options, fieldRules, fieldLabels } = useDomainEnums();
  const [f, setF] = useState({ name: template?.name || "", category: template?.category || "Kain", fabric_type: template?.fabric_type || "woven", stage: template?.stage || "finished", motif: template?.motif || "Polos", base_unit: template?.base_unit || "meter", base_price: template?.base_price ?? "", gramasi: template?.gramasi ?? "", lebar: template?.lebar ?? "", yarn_count: template?.yarn_count || "", yarn_count_system: template?.yarn_count_system || "", description: template?.description || "", sku_prefix: template?.sku_prefix || "" });
  const locked = (template?.variant_count || 0) > 0;
  const [axes, setAxes] = useState((template?.axes || []).map(a => ({ ...a, options: a.options.map(o => ({ ...o, locked })) })));
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const submit = async e => {
    e.preventDefault(); setError("");
    if (!f.name.trim()) { setError("Nama induk wajib diisi."); return; }
    const missing = fieldRules(f.stage, f.fabric_type).required.filter(k => !f[k] || (["gramasi", "lebar"].includes(k) && !(Number(String(f[k]).replace(",", ".")) > 0)));
    if (missing.length) { setError(`Lengkapi ${missing.map(k => fieldLabels[k] || k).join(", ")}.`); return; }
    if (axes.some(a => !a.options.length)) { setError("Setiap atribut memerlukan minimal satu pilihan."); return; }
    setBusy(true);
    try { const body = { ...f, axes: axes.map(a => ({ ...a, options: a.options.map(({ locked, ...o }) => o) })) }; const res = await catalogApi.save(template?.id, body); onSaved(res.id); }
    catch (e) { setError(catalogError(e)); } finally { setBusy(false); }
  };
  return <CatalogDialog title={template ? "Ubah induk produk" : "Induk produk baru"} onClose={onClose} busy={busy} testId="family-form-dialog">
    <form onSubmit={submit} className="space-y-5" data-testid="family-form">
      {error && <p data-testid="family-form-error" role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {[["name", "Nama produk *"], ["category", "Kategori"], ["sku_prefix", "Prefix SKU"], ["motif", "Motif"]].map(([k, l]) => <label key={k} className="space-y-1 text-xs font-semibold">{l}<input data-testid={`family-${k}`} className="field" value={f[k]} onChange={e => set(k, e.target.value)} required={k === "name"} /></label>)}
        {[["stage", "Tahap bahan", options("stage")], ["fabric_type", "Jenis kain", options("fabric_type")], ["base_unit", "Satuan dasar", ["meter", "yard", "kg", "pcs"].map(x => ({ value: x, label: x }))]].map(([k, l, opts]) => <label key={k} className="space-y-1 text-xs font-semibold">{l}<KNSelect data-testid={`family-${k}`} className="field" value={f[k]} options={opts} disabled={locked} onValueChange={v => set(k, v)} /></label>)}
        {[["base_price", "Harga dasar / satuan"], ["gramasi", "Gramasi (gsm)"], ["lebar", "Lebar dasar (meter)"]].map(([k, l]) => <label key={k} className="space-y-1 text-xs font-semibold">{l}<DecimalInput data-testid={`family-${k}`} className="field" min={0} value={f[k]} onChange={v => set(k, v)} /></label>)}
        {f.stage === "yarn" && <><label className="text-xs font-semibold">Nomor benang<input data-testid="family-yarn-count" className="field" value={f.yarn_count} onChange={e => set("yarn_count", e.target.value)} /></label><KNSelect data-testid="family-yarn-system" className="field" value={f.yarn_count_system} options={options("yarn_count_system")} onValueChange={v => set("yarn_count_system", v)} /></>}
      </div>
      <label className="block space-y-1 text-xs font-semibold">Deskripsi<textarea data-testid="family-description" className="field min-h-20" value={f.description} onChange={e => set("description", e.target.value)} /></label>
      <AxisEditor axes={axes} onChange={setAxes} structuralLocked={locked} />
      <footer className="flex justify-end gap-2 border-t pt-4"><button type="button" data-testid="family-cancel" className="secondary-button" onClick={onClose} disabled={busy}>Batal</button><button data-testid="family-save" type="submit" className="primary-button" disabled={busy}><Save size={14} />{busy ? "Menyimpan…" : "Simpan induk"}</button></footer>
    </form>
  </CatalogDialog>;
};