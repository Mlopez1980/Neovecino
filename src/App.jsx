import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const BRAND = { black: "#020202", steel: "#636e7a", red: "#ff0000", white: "#ffffff" };
const seedBuildings = [
  { id: "canarias", name: "Torre Canarias", address: "Portal de las Canarias", units: 32 },
  { id: "lomas", name: "Torre Lomas", address: "Lomas del Guijarro", units: 24 },
  { id: "centro", name: "Torre Centro", address: "Centro de Tegucigalpa", units: 18 },
];
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (v) => {
  if (!v) return "";
  const [y, m, d] = String(v).split("-").map(Number);
  if (!y || !m || !d) return v;
  return new Intl.DateTimeFormat("es-HN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(y, m - 1, d)).replace(".", "");
};
const usd = (n) => new Intl.NumberFormat("es-HN", { style: "currency", currency: "USD" }).format(Number(n || 0));
const lps = (n) => `L.${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const timeNow = () => new Date().toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" });

const seedApartments = [
  { id: 1, number: "101", level: "Nivel 1", owner: "Marco López", balance: 125, status: "Ocupado" },
  { id: 2, number: "102", level: "Nivel 1", owner: "Ana Martínez", balance: 0, status: "Ocupado" },
  { id: 3, number: "201", level: "Nivel 2", owner: "Carlos Rivera", balance: 250, status: "Ocupado" },
  { id: 4, number: "202", level: "Nivel 2", owner: "Lucía Gómez", balance: 0, status: "Vacío" },
];
const seedPayments = [
  { id: "pay-1", apt: "101", concept: "Cuota mantenimiento abril", amount: 125, status: "Pendiente", date: "2026-04-01" },
  { id: "pay-2", apt: "102", concept: "Cuota mantenimiento abril", amount: 125, status: "Pagado", date: "2026-04-03" },
  { id: "pay-3", apt: "201", concept: "Cuota mantenimiento marzo", amount: 125, status: "Vencido", date: "2026-03-01" },
];
const seedVisits = [
  { id: "VST-482913", visitor: "Juan Pérez", apt: "101", type: "Familiar", date: "2026-04-29", time: "2:00 p.m. - 6:00 p.m.", status: "Pendiente", identity: "0801-1990-00000", plate: "HAA 1234", notes: "Visita familiar autorizada.", entryTime: "", exitTime: "", platePhoto: "" },
  { id: "VST-923184", visitor: "Técnico de internet", apt: "201", type: "Proveedor", date: "2026-04-29", time: "10:00 a.m. - 12:00 m.", status: "Ingresó", identity: "", plate: "PBB 4567", notes: "Revisión de router.", entryTime: "10:17 a.m.", exitTime: "", platePhoto: "" },
];
const seedReservations = [
  { id: "res-1", apt: "101", area: "Área social techada", date: "2026-04-30", start: "18:00", hours: 4, time: "6:00 p.m. - 10:00 p.m.", cleaning: 1000, deposit: 1000, status: "Pendiente" },
  { id: "res-2", apt: "102", area: "Área de asados", date: "2026-05-02", start: "16:00", hours: 4, time: "4:00 p.m. - 8:00 p.m.", cleaning: 1000, deposit: 1000, status: "Aprobada" },
];
const seedTickets = [
  { id: "tic-1", apt: "101", title: "Lámpara del pasillo parpadea", status: "Abierto", date: "2026-04-29" },
  { id: "tic-2", apt: "201", title: "Ruido en bomba de agua", status: "En proceso", date: "2026-04-28" },
];
const seedDocs = [
  { id: "doc-1", title: "Reglamento de convivencia", fileName: "reglamento-convivencia.pdf", type: "PDF", date: "2026-04-01", size: "1.2 MB", dataUrl: "" },
  { id: "doc-2", title: "Reglamento de área social", fileName: "reglamento-area-social.pdf", type: "PDF", date: "2026-04-01", size: "850 KB", dataUrl: "" },
];
const seedResidents = [
  { id: "usr-1", apt: "101", name: "Marco López", dni: "0801-1980-00000", email: "marco@email.com", phone: "9999-0000", type: "Propietario", status: "Activo", notes: "Residente principal" },
  { id: "usr-2", apt: "102", name: "Ana Martínez", dni: "0801-1985-00000", email: "ana@email.com", phone: "9999-1111", type: "Propietario", status: "Activo", notes: "" },
  { id: "usr-3", apt: "201", name: "Carlos Rivera", dni: "0801-1978-00000", email: "carlos@email.com", phone: "9999-2222", type: "Inquilino", status: "Activo", notes: "Contrato vigente" },
];

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-soft ${className}`}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", className = "" }) {
  const styles = {
    primary: {
      background: `linear-gradient(135deg, ${BRAND.red}, #b91c1c)`,
      color: BRAND.white,
      border: "1px solid transparent",
    },
    secondary: {
      background: BRAND.steel,
      color: BRAND.white,
      border: "1px solid transparent",
    },
    danger: {
      background: BRAND.black,
      color: BRAND.white,
      border: "1px solid transparent",
    },
    outline: {
      background: BRAND.white,
      color: BRAND.black,
      border: `1px solid ${BRAND.steel}`,
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={styles[variant] || styles.primary}
      className={`rounded-2xl px-4 py-2.5 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children, tone = "default" }) {
  const cls =
    tone === "good"
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : tone === "bad"
      ? "bg-rose-100 text-rose-700 ring-rose-200"
      : tone === "warn"
      ? "bg-amber-100 text-amber-700 ring-amber-200"
      : tone === "blue"
      ? "bg-sky-100 text-sky-700 ring-sky-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${cls}`}>
      {children}
    </span>
  );
}

function Title({ icon, title, sub }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl text-white shadow-md"
        style={{ background: `linear-gradient(135deg, ${BRAND.red}, #991b1b)` }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
        <p className="text-sm font-medium text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="text-sm font-black text-slate-700">
      {label}
      {children}
    </label>
  );
}

const Text = (p) => (
  <input
    {...p}
    className={`mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 ${p.className || ""}`}
  />
);

const DateField = (p) => (
  <input
    type="date"
    {...p}
    className={`mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 ${p.className || ""}`}
  />
);

function Powered() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <b style={{ color: BRAND.steel }}>H</b>
        <b className="mx-1" style={{ color: BRAND.red }}>⌂</b>
        <b style={{ color: BRAND.steel }}>C</b>
      </div>
      <div>
        <div className="font-black leading-4 text-slate-950">NeoVecino</div>
        <div className="text-xs font-bold text-slate-500">
          Powered by <span style={{ color: BRAND.red }}>Honduras Constructores</span>
        </div>
      </div>
    </div>
  );
}

function BuildingBar({ role, buildings, selectedBuilding, setSelectedBuilding, building }) {
  const canSwitchBuilding = role === "admin";

  return (
    <Card className="mb-5 overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            {canSwitchBuilding ? "Edificio activo" : "Mi edificio"}
          </div>
          <div className="text-2xl font-black text-slate-950">{building?.name}</div>
          <div className="mt-1 text-sm font-medium text-slate-500">
            {building?.address} · {building?.units} unidades
          </div>
        </div>

        {canSwitchBuilding ? (
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-black text-slate-800 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        ) : (
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">
            Acceso limitado a este edificio
          </div>
        )}
      </div>
    </Card>
  );
}

function Login({ onLogin }) {
  const roles = [
    ["resident", "Residente", "👤", "Consultar pagos, visitas, reservas y documentos."],
    ["admin", "Administración", "🏢", "Gestionar edificios, residentes, reservas y pagos."],
    ["guard", "Guardia", "🛡️", "Validar QR, registrar entradas y tomar fotos de placas."],
  ];

  return (
    <div
      className="min-h-screen px-4 py-10 text-white"
      style={{
        background:
          `radial-gradient(circle at top left, rgba(255,0,0,.35), transparent 28%), linear-gradient(135deg, ${BRAND.black}, ${BRAND.steel})`,
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
              Administración inteligente de condominios
            </div>
            <h1 className="text-5xl font-black tracking-tight md:text-7xl">NeoVecino</h1>
            <p className="mt-5 max-w-2xl text-lg font-medium text-slate-200">
              Plataforma para residentes, administración y control de acceso en edificios residenciales.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <Powered />
            <div className="mt-5 rounded-3xl bg-black/25 p-4 text-sm text-slate-200">
              Demo operativo con módulos de visitas QR, reservas, tickets, documentos y residentes.
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {roles.map(([key, label, icon, desc]) => (
            <button
              key={key}
              onClick={() => onLogin(key)}
              className="group rounded-[32px] border border-white/10 bg-white/10 p-6 text-left shadow-2xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
            >
              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl text-3xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND.red}, #991b1b)` }}
              >
                {icon}
              </div>
              <h2 className="text-2xl font-black">Entrar como {label}</h2>
              <p className="mt-3 min-h-[48px] text-sm font-medium text-slate-200">{desc}</p>
              <div className="mt-6 rounded-2xl bg-black/35 px-4 py-3 text-sm font-black text-white transition group-hover:bg-black/50">
                Demo sin contraseña →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Shell({ role, setRole, active, setActive, children }) {
  const menus = {
    resident: [["home", "Inicio", "⌂"], ["payments", "Estado", "💳"], ["visits", "Visitas", "▦"], ["reservations", "Reservas", "📅"], ["tickets", "Tickets", "🔧"], ["docs", "Docs", "📄"]],
    admin: [["home", "Dashboard", "⌂"], ["apartments", "Apartamentos", "🏠"], ["residents", "Residentes", "👥"], ["payments", "Pagos", "💳"], ["visits", "Visitas", "▦"], ["reservations", "Reservas", "📅"], ["tickets", "Tickets", "🔧"], ["docs", "Docs", "📄"]],
    guard: [["home", "Guardia", "🛡️"], ["visits", "Visitas", "📋"]],
  };

  const label = role === "admin" ? "Administración" : role === "guard" ? "Guardia" : "Residente";

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${BRAND.red}, #991b1b)` }}
            >
              🏢
            </div>
            <div>
              <b className="text-lg font-black text-slate-950">NeoVecino</b>
              <div className="text-xs font-bold text-slate-500">Modo {label}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block"><Powered /></div>
            <Btn variant="secondary" onClick={() => setRole(null)}>↩ Salir</Btn>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[250px_1fr]">
        <aside className="hidden rounded-[28px] border border-slate-200 bg-white/95 p-3 shadow-soft lg:block">
          {menus[role].map(([key, text, icon]) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              style={active === key ? { backgroundColor: BRAND.black, color: BRAND.white } : { color: BRAND.steel }}
              className="mb-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition hover:bg-slate-100"
            >
              <span className="text-lg">{icon}</span>{text}
            </button>
          ))}
        </aside>

        <section>{children}</section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 overflow-x-auto border-t border-slate-200 bg-white/95 p-2 backdrop-blur lg:hidden">
        <div className="flex min-w-max gap-1">
          {menus[role].map(([key, text, icon]) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              style={active === key ? { backgroundColor: BRAND.black, color: BRAND.white } : { color: BRAND.steel }}
              className="min-w-[76px] rounded-2xl px-2 py-2 text-[10px] font-black"
            >
              <div className="text-lg">{icon}</div>{text}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function HomePage({ role, apt, apartments, visits, tickets, reservations }) {
  if (role === "admin") return <div className="space-y-4 pb-24 lg:pb-0"><Title icon="⌂" title="Dashboard" sub="Resumen administrativo" /><div className="grid gap-4 md:grid-cols-4"><Card><p className="text-sm text-slate-500">Apartamentos</p><h3 className="text-3xl font-black">{apartments.length}</h3></Card><Card><p className="text-sm text-slate-500">Mora total</p><h3 className="text-3xl font-black">{usd(apartments.reduce((s, a) => s + a.balance, 0))}</h3></Card><Card><p className="text-sm text-slate-500">Visitas</p><h3 className="text-3xl font-black">{visits.length}</h3></Card><Card><p className="text-sm text-slate-500">Tickets</p><h3 className="text-3xl font-black">{tickets.length}</h3></Card></div></div>;
  if (role === "guard") return <GuardPanel visits={visits} setVisits={() => {}} readOnly />;
  return <div className="space-y-4 pb-24 lg:pb-0"><Title icon="⌂" title="Inicio" sub="Resumen rápido de tu apartamento" /><div className="grid gap-4 md:grid-cols-3"><Card><p className="text-sm text-slate-500">Apartamento</p><h3 className="text-3xl font-black">{apt.number}</h3><p className="text-sm text-slate-500">{apt.level} · {apt.owner}</p></Card><Card><p className="text-sm text-slate-500">Saldo pendiente</p><h3 className="text-3xl font-black">{usd(apt.balance)}</h3></Card><Card><p className="text-sm text-slate-500">Visitas registradas</p><h3 className="text-3xl font-black">{visits.filter(v => v.apt === apt.number).length}</h3></Card></div><div className="grid gap-4 md:grid-cols-2"><Card><h3 className="mb-3 font-bold">Tickets recientes</h3>{tickets.filter(t => t.apt === apt.number).map(t => <div key={t.id} className="mb-2 rounded-2xl bg-slate-50 p-3"><b>{t.title}</b><div className="text-sm text-slate-500">{fmtDate(t.date)} · {t.status}</div></div>)}</Card><Card><h3 className="mb-3 font-bold">Reservas</h3>{reservations.filter(r => r.apt === apt.number).map(r => <div key={r.id} className="mb-2 rounded-2xl bg-slate-50 p-3"><b>{r.area}</b><div className="text-sm text-slate-500">{fmtDate(r.date)} · {r.time}</div></div>)}</Card></div></div>;
}

function Payments({ role, payments, apartments }) {
  const rows = role === "resident" ? payments.filter(p => p.apt === "101") : payments;
  return <div className="space-y-4 pb-24 lg:pb-0"><Title icon="💳" title={role === "resident" ? "Mi estado de cuenta" : "Pagos y saldos"} sub="Cuotas y pagos" /><Card><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-slate-500"><tr><th className="py-2">Apto</th><th>Concepto</th><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead><tbody>{rows.map(p => <tr key={p.id} className="border-t"><td className="py-3 font-bold">{p.apt}</td><td>{p.concept}</td><td>{fmtDate(p.date)}</td><td>{usd(p.amount)}</td><td><Badge tone={p.status === "Pagado" ? "good" : p.status === "Vencido" ? "bad" : "warn"}>{p.status}</Badge></td></tr>)}</tbody></table></div></Card></div>;
}

function QR({ value }) {
  const seed = Array.from(value).reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = [];
  for (let y = 0; y < 19; y++) for (let x = 0; x < 19; x++) if ((x * 17 + y * 31 + seed) % 5 === 0 || (x < 5 && y < 5) || (x > 13 && y < 5) || (x < 5 && y > 13)) cells.push(<rect key={`${x}-${y}`} x={x * 10} y={y * 10} width="9" height="9" rx="2" fill="currentColor" />);
  return <svg width="190" height="190" viewBox="0 0 190 190" className="text-slate-900"><rect width="190" height="190" rx="16" fill="white" />{cells}</svg>;
}
const emptyVisit = () => ({ visitor: "", type: "Familiar", date: todayISO(), time: "2:00 p.m. - 6:00 p.m.", apt: "101", identity: "", plate: "", notes: "", platePhoto: "" });
function Visits({ role, visits, setVisits }) {
  const [form, setForm] = useState(emptyVisit());
  const [selected, setSelected] = useState(visits[0]?.id || "");
  const list = role === "resident" ? visits.filter(v => v.apt === "101") : visits;
  const selectedVisit = visits.find(v => v.id === selected) || list[0];
  const update = (id, patch) => setVisits(visits.map(v => v.id === id ? { ...v, ...patch } : v));
  function create() { if (!form.visitor.trim()) return; const id = `VST-${Math.floor(100000 + Math.random() * 900000)}`; const next = { ...form, id, status: "Pendiente", entryTime: "", exitTime: "" }; setVisits([next, ...visits]); setSelected(id); setForm(emptyVisit()); }
  if (role === "guard") return <GuardPanel visits={visits} setVisits={setVisits} />;
  return <div className="space-y-4 pb-24 lg:pb-0"><Title icon="▦" title={role === "resident" ? "Mis visitas QR" : "Control de visitas"} sub="Autorización y registro de entradas" />{role === "resident" && <div className="grid gap-4 lg:grid-cols-[1fr_320px]"><Card><h3 className="mb-3 font-bold">Crear autorización</h3><div className="grid gap-3 md:grid-cols-2"><Field label="Visitante"><Text value={form.visitor} onChange={e => setForm({ ...form, visitor: e.target.value })} /></Field><Field label="Tipo"><select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Familiar</option><option>Proveedor</option><option>Delivery</option><option>Huésped</option></select></Field><Field label="Identidad"><Text value={form.identity} onChange={e => setForm({ ...form, identity: e.target.value })} /></Field><Field label="Fecha"><DateField value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field><Field label="Horario"><Text value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></Field><Field label="Placa"><Text value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })} /></Field><Field label="Observaciones"><Text value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field></div><Btn onClick={create} className="mt-4">▦ Generar QR</Btn></Card>{selectedVisit && <Card><h3 className="mb-3 font-bold">QR generado</h3><div className="rounded-3xl bg-slate-50 p-4 text-center"><QR value={selectedVisit.id} /><div className="mt-3 font-mono font-black">{selectedVisit.id}</div><p className="text-sm text-slate-500">{selectedVisit.visitor}</p></div></Card>}</div>}<Card><h3 className="mb-3 font-bold">Historial de visitas</h3><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{list.map(v => <VisitCard key={v.id} v={v} role={role} update={update} />)}</div></Card></div>;
}
function VisitCard({ v, role, update }) {
  return <div className="rounded-2xl border bg-slate-50 p-4"><div className="flex justify-between gap-3"><div><b>{v.visitor}</b><div className="text-sm text-slate-500">Apto {v.apt} · {v.type}</div></div><Badge tone={v.status === "Ingresó" ? "blue" : v.status === "Salió" ? "default" : "warn"}>{v.status}</Badge></div><div className="mt-2 text-sm text-slate-600">{fmtDate(v.date)} · {v.time}</div>{v.plate && <div className="mt-1 text-sm"><b>Placa:</b> {v.plate}</div>}{v.notes && <div className="mt-1 text-sm"><b>Obs.:</b> {v.notes}</div>}<div className="mt-2 rounded-xl bg-white px-3 py-2 font-mono text-sm">{v.id}</div>{role !== "resident" && <div className="mt-3 flex flex-wrap gap-2"><Btn className="px-3 py-1.5" onClick={() => update(v.id, { status: "Ingresó", entryTime: timeNow() })}>Entrada</Btn><Btn variant="secondary" className="px-3 py-1.5" onClick={() => update(v.id, { status: "Salió", exitTime: timeNow() })}>Salida</Btn></div>}</div>;
}
function GuardPanel({ visits, setVisits }) {
  const [code, setCode] = useState("VST-482913");
  const visit = visits.find(v => v.id.toLowerCase() === code.toLowerCase());
  const update = (patch) => visit && setVisits(visits.map(v => v.id === visit.id ? { ...v, ...patch } : v));
  function photo(file) { if (!file) return; const reader = new FileReader(); reader.onload = () => update({ platePhoto: String(reader.result || "") }); reader.readAsDataURL(file); }
  return <div className="space-y-4 pb-24 lg:pb-0"><Title icon="🛡️" title="Modo Guardia" sub="Validación de QR y control de acceso" /><div className="grid gap-4 lg:grid-cols-[1fr_420px]"><Card><h3 className="mb-3 font-bold">Buscar código</h3><div className="flex gap-3"><input className="flex-1 rounded-xl border px-3 py-2 font-mono" value={code} onChange={e => setCode(e.target.value)} /><Btn>Validar</Btn></div><div className="mt-5 rounded-3xl border-2 border-dashed bg-slate-50 p-8 text-center"><div className="text-6xl">▦</div><b>Aquí irá el escáner de cámara</b></div></Card><Card>{!visit ? <div className="rounded-2xl bg-rose-50 p-4 text-rose-700">Código no encontrado.</div> : <div className="space-y-3"><div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">Visita autorizada.</div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-2xl font-black">{visit.visitor}</div><div className="text-slate-500">Apartamento {visit.apt}</div>{visit.notes && <div className="mt-3 rounded-xl border-l-4 bg-white px-3 py-2" style={{ borderColor: BRAND.red }}><b>Observación:</b><br />{visit.notes}</div>}<label className="mt-3 block text-xs font-bold">Placa observada<input className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" value={visit.plate || ""} onChange={e => update({ plate: e.target.value.toUpperCase() })} /></label><label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white" style={{ backgroundColor: BRAND.red }}>📷 Tomar foto de placa<input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => photo(e.target.files?.[0])} /></label>{visit.platePhoto && <img src={visit.platePhoto} alt="Placa" className="mt-3 h-32 w-full rounded-xl object-cover" />}</div><div className="grid grid-cols-2 gap-2"><Btn onClick={() => update({ status: "Ingresó", entryTime: timeNow() })}>Entrada</Btn><Btn variant="secondary" onClick={() => update({ status: "Salió", exitTime: timeNow() })}>Salida</Btn></div></div>}</Card></div></div>;
}

function AvailabilityCalendar({ reservations, area, selectedDate, onSelectDate }) {
  const base = selectedDate || todayISO();
  const [y, m] = base.split("-").map(Number);
  const [view, setView] = useState(`${y}-${String(m).padStart(2, "0")}-01`);
  const [vy, vm] = view.split("-").map(Number);
  const first = new Date(vy, vm - 1, 1).getDay();
  const days = new Date(vy, vm, 0).getDate();
  const name = new Intl.DateTimeFormat("es-HN", { month: "long", year: "numeric" }).format(new Date(vy, vm - 1, 1));
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => `${vy}-${String(vm).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`)];
  function status(date) { const rs = reservations.filter(r => r.area === area && r.date === date); if (rs.some(r => r.status === "Aprobada")) return "ocupado"; if (rs.some(r => r.status === "Pendiente")) return "pendiente"; return "disponible"; }
  function move(delta) { const n = new Date(vy, vm - 1 + delta, 1); setView(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`); }
  return <div className="rounded-2xl border bg-slate-50 p-3"><div className="mb-3 flex items-center justify-between"><button className="rounded-xl bg-white px-3 py-2 font-bold" onClick={() => move(-1)}>‹</button><b className="capitalize">{name}</b><button className="rounded-xl bg-white px-3 py-2 font-bold" onClick={() => move(1)}>›</button></div><div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500">{["D","L","M","M","J","V","S"].map((d, i) => <div key={i}>{d}</div>)}</div><div className="grid grid-cols-7 gap-1">{cells.map((date, i) => { if (!date) return <div key={i} className="h-11" />; const s = status(date); const sel = date === selectedDate; const busy = s === "ocupado"; const bg = sel ? BRAND.black : busy ? "#fee2e2" : s === "pendiente" ? "#fef3c7" : "#dcfce7"; const color = sel ? BRAND.white : busy ? "#991b1b" : s === "pendiente" ? "#92400e" : "#166534"; return <button key={date} onClick={() => !busy && onSelectDate(date)} className="h-11 rounded-xl text-sm font-black" style={{ backgroundColor: bg, color }}>{Number(date.slice(-2))}</button>; })}</div><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-green-100 px-2 py-1 text-green-700">Disponible</span><span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Pendiente</span><span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">Ocupado</span></div></div>;
}
function clock(v) {
  if (!v) return "";
  const [h, m] = v.split(":").map(Number);
  return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "p.m." : "a.m."}`;
}

function addHours(v, hrs) {
  const [h, m] = v.split(":").map(Number);
  const d = new Date(2026, 0, 1, h, m || 0);
  d.setHours(d.getHours() + Number(hrs));
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function isSunday(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 0;
}

function dayIndex(date) {
  if (!date) return 1;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

function toMinutes(v) {
  if (!v) return 0;
  const [h, m] = v.split(":").map(Number);
  return h * 60 + (m || 0);
}

const AREA_SCHEDULES = {
  "Área social techada": {
    0: { open: "09:00", close: "18:00" },
    1: { open: "08:00", close: "22:00" },
    2: { open: "08:00", close: "22:00" },
    3: { open: "08:00", close: "22:00" },
    4: { open: "08:00", close: "22:00" },
    5: { open: "08:00", close: "23:00" },
    6: { open: "09:00", close: "23:00" },
  },
  "Área de asados": {
    0: { open: "09:00", close: "18:00" },
    1: { open: "08:00", close: "22:00" },
    2: { open: "08:00", close: "22:00" },
    3: { open: "08:00", close: "22:00" },
    4: { open: "08:00", close: "22:00" },
    5: { open: "08:00", close: "23:00" },
    6: { open: "09:00", close: "23:00" },
  },
  Coworking: {
    0: null,
    1: { open: "08:00", close: "18:00" },
    2: { open: "08:00", close: "18:00" },
    3: { open: "08:00", close: "18:00" },
    4: { open: "08:00", close: "18:00" },
    5: { open: "08:00", close: "18:00" },
    6: { open: "09:00", close: "13:00" },
  },
};

function getAreaSchedule(area, date) {
  const scheduleByDay = AREA_SCHEDULES[area] || AREA_SCHEDULES["Área social techada"];
  return scheduleByDay[dayIndex(date)] || null;
}

function getBaseMaxHours(area) {
  return area === "Coworking" ? 2 : 6;
}

function getMaxReservableHours(area, date, start) {
  const schedule = getAreaSchedule(area, date);
  if (!schedule) return 0;

  const startMin = toMinutes(start);
  const openMin = toMinutes(schedule.open);
  const closeMin = toMinutes(schedule.close);

  if (startMin < openMin || startMin >= closeMin) return 0;

  const availableBySchedule = Math.floor((closeMin - startMin) / 60);
  return Math.max(0, Math.min(getBaseMaxHours(area), availableBySchedule));
}

function getScheduleText(area, date) {
  const schedule = getAreaSchedule(area, date);
  if (!schedule) return "Cerrado";
  return `${clock(schedule.open)} - ${clock(schedule.close)}`;
}

function Reservations({ role, reservations, setReservations }) {
  const [form, setForm] = useState({ area: "Área social techada", date: todayISO(), start: "18:00", hours: 4 });
  const [notice, setNotice] = useState("");

  const maxHours = getMaxReservableHours(form.area, form.date, form.start);
  const scheduleText = getScheduleText(form.area, form.date);
  const cleaning = form.area === "Coworking" ? 0 : isSunday(form.date) ? 1600 : 1000;
  const deposit = form.area === "Coworking" ? 0 : 1000;
  const safeHours = maxHours > 0 ? Math.min(Number(form.hours || 1), maxHours) : Number(form.hours || 1);
  const range = `${clock(form.start)} - ${clock(addHours(form.start, safeHours))}`;
  const rows = role === "resident" ? reservations.filter(r => r.apt === "101") : reservations;
  const duplicate = reservations.some(r => r.apt === "101" && r.area === form.area && r.date === form.date && r.start === form.start && Number(r.hours) === Number(safeHours) && r.status !== "Rechazada");

  useEffect(() => {
    if (maxHours > 0 && Number(form.hours) > maxHours) {
      setForm(prev => ({ ...prev, hours: maxHours }));
    }
  }, [maxHours, form.hours]);

  function updateArea(area) {
    const preferredHours = area === "Coworking" ? 2 : 4;
    const nextMax = getMaxReservableHours(area, form.date, form.start);
    setForm({ ...form, area, hours: nextMax > 0 ? Math.min(preferredHours, nextMax) : preferredHours });
    setNotice("");
  }

  function updateDate(date) {
    const nextMax = getMaxReservableHours(form.area, date, form.start);
    setForm({ ...form, date, hours: nextMax > 0 ? Math.min(Number(form.hours || 1), nextMax) : form.hours });
    setNotice("");
  }

  function updateStart(start) {
    const nextMax = getMaxReservableHours(form.area, form.date, start);
    setForm({ ...form, start, hours: nextMax > 0 ? Math.min(Number(form.hours || 1), nextMax) : form.hours });
    setNotice("");
  }

  function add() {
    if (maxHours <= 0) {
      setNotice(`Ese horario no está disponible. Horario permitido para ${form.area}: ${scheduleText}.`);
      return;
    }

    if (Number(form.hours) > maxHours) {
      setNotice(`Para esa hora solo puedes reservar un máximo de ${maxHours} hora(s).`);
      return;
    }

    if (duplicate) {
      setNotice("Ya existe una solicitud igual para esa área, fecha y horario.");
      return;
    }

    const r = {
      id: `res-${Date.now()}`,
      apt: "101",
      area: form.area,
      date: form.date,
      start: form.start,
      hours: Number(safeHours),
      time: range,
      cleaning,
      deposit,
      status: "Pendiente",
    };

    setReservations([r, ...reservations]);
    setNotice("Solicitud enviada.");
  }

  function approve(id, status) {
    setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <Title icon="📅" title="Reservas" sub="Calendario y solicitudes de áreas" />

      {role === "resident" && (
        <Card>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <AvailabilityCalendar reservations={reservations} area={form.area} selectedDate={form.date} onSelectDate={updateDate} />

            <div className="space-y-3">
              <Field label="Área">
                <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.area} onChange={e => updateArea(e.target.value)}>
                  <option>Área social techada</option>
                  <option>Área de asados</option>
                  <option>Coworking</option>
                </select>
              </Field>

              <Field label="Fecha">
                <DateField value={form.date} onChange={e => updateDate(e.target.value)} />
              </Field>

              <Field label={`Hora de inicio · horario permitido: ${scheduleText}`}>
                <input type="time" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.start} onChange={e => updateStart(e.target.value)} />
              </Field>

              <Field label={maxHours > 0 ? `Duración máxima según horario: ${maxHours} hora(s)` : "Duración no disponible"}>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
                  value={maxHours > 0 ? safeHours : ""}
                  disabled={maxHours <= 0}
                  onChange={e => setForm({ ...form, hours: Number(e.target.value) })}
                >
                  {maxHours <= 0 ? (
                    <option value="">Horario no disponible</option>
                  ) : (
                    Array.from({ length: maxHours }, (_, i) => i + 1).map(h => (
                      <option key={h} value={h}>{h} {h === 1 ? "hora" : "horas"}</option>
                    ))
                  )}
                </select>
              </Field>

              <div className={maxHours > 0 ? "rounded-2xl bg-amber-50 p-3 text-sm" : "rounded-2xl bg-rose-50 p-3 text-sm text-rose-700"}>
                <b>Horario permitido del área:</b> {scheduleText}<br />
                <b>Horario solicitado:</b> {maxHours > 0 ? range : "No disponible"}<br />
                <b>Limpieza:</b> {lps(cleaning)}<br />
                <b>Depósito:</b> {lps(deposit)}<br />
                <b>Total:</b> {lps(cleaning + deposit)}<br />
                {form.area === "Coworking" && <span>Coworking no tiene cuota de limpieza ni depósito.</span>}
              </div>

              {notice && <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">{notice}</div>}

              <Btn onClick={add} variant={maxHours <= 0 ? "secondary" : "primary"}>
                {maxHours <= 0 ? "Horario no disponible" : duplicate ? "Solicitud ya registrada" : "+ Solicitar reserva"}
              </Btn>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="mb-3 font-bold">Reservas registradas</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(r => (
            <div key={r.id} className="rounded-2xl border bg-slate-50 p-4">
              <div className="flex justify-between">
                <b>{r.area}</b>
                <Badge tone={r.status === "Aprobada" ? "good" : r.status === "Rechazada" ? "bad" : "warn"}>{r.status}</Badge>
              </div>
              <div className="mt-2 text-sm text-slate-500">Apto {r.apt} · {fmtDate(r.date)}</div>
              <div className="mt-1 text-sm">{r.time}</div>
              <div className="mt-3 rounded-xl bg-white p-3 text-xs"><b>Total:</b> {lps((r.cleaning || 0) + (r.deposit || 0))}</div>
              {role === "admin" && r.status === "Pendiente" && (
                <div className="mt-3 flex gap-2">
                  <Btn className="px-3 py-1.5" onClick={() => approve(r.id, "Aprobada")}>Aprobar</Btn>
                  <Btn variant="danger" className="px-3 py-1.5" onClick={() => approve(r.id, "Rechazada")}>Rechazar</Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Tickets({ role, tickets, setTickets }) {
  const [text, setText] = useState("");
  const rows = role === "resident" ? tickets.filter(t => t.apt === "101") : tickets;
  function add() { if (!text.trim()) return; setTickets([{ id: `tic-${Date.now()}`, apt: "101", title: text, status: "Abierto", date: todayISO() }, ...tickets]); setText(""); }
  return <div className="space-y-4 pb-24 lg:pb-0"><Title icon="🔧" title="Mantenimiento" sub="Tickets y seguimiento" />{role === "resident" && <Card><div className="flex gap-3"><input className="flex-1 rounded-xl border px-3 py-2" value={text} onChange={e => setText(e.target.value)} placeholder="Describe el problema" /><Btn onClick={add}>Crear</Btn></div></Card>}<Card><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map(t => <div key={t.id} className="rounded-2xl border bg-slate-50 p-4"><b>{t.title}</b><div className="text-sm text-slate-500">Apto {t.apt} · {fmtDate(t.date)}</div><div className="mt-2"><Badge tone="blue">{t.status}</Badge></div></div>)}</div></Card></div>;
}

function Docs({ role, docs, setDocs }) {
  const [form, setForm] = useState({ title: "", fileName: "", type: "", size: "", dataUrl: "" });
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState("");
  const [fileKey, setFileKey] = useState(0);
  function pick(file) { if (!file) return; const parts = file.name.split("."); const type = parts.length > 1 ? String(parts.pop()).toUpperCase() : "FILE"; const kb = Math.max(1, Math.round(file.size / 1024)); const reader = new FileReader(); reader.onload = () => { setForm({ title: form.title || file.name.replace(/\.[^/.]+$/, ""), fileName: file.name, type, size: kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`, dataUrl: String(reader.result || "") }); setMsg("Archivo seleccionado. Presiona Subir."); }; reader.readAsDataURL(file); }
  function save() { if (!form.fileName) { setMsg("Primero selecciona un archivo."); return; } const doc = { id: `doc-${Date.now()}`, ...form, date: todayISO() }; setDocs([doc, ...docs]); setOpen(doc.id); setForm({ title: "", fileName: "", type: "", size: "", dataUrl: "" }); setFileKey(k => k + 1); setMsg("Documento compartido con residentes."); }
  function remove(id) { setDocs(docs.filter(d => d.id !== id)); if (open === id) setOpen(null); }
  function Preview({ d }) { if (!d.dataUrl) return <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">Documento de ejemplo sin archivo real.</div>; if (["PNG", "JPG", "JPEG", "WEBP", "GIF"].includes(d.type)) return <img src={d.dataUrl} alt={d.title} className="mt-3 max-h-[520px] w-full rounded-xl object-contain bg-slate-50" />; if (d.type === "PDF") return <div className="mt-3 rounded-xl bg-slate-50 p-3"><a href={d.dataUrl} target="_blank" rel="noreferrer" className="mb-2 inline-block rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: BRAND.steel }}>Abrir PDF</a><iframe title={d.title} src={d.dataUrl} className="h-[520px] w-full rounded-xl border bg-white" /></div>; return <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">Usa Descargar para abrir este archivo.</div>; }
  return <div className="space-y-4 pb-24 lg:pb-0"><Title icon="📄" title="Documentos" sub="Archivos del condominio" />{role === "admin" && <Card><h3 className="mb-3 font-bold">Subir documento</h3><div className="grid gap-3 md:grid-cols-2"><Field label="Nombre"><Text value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field><Field label="Archivo"><input key={fileKey} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" className="mt-1 w-full rounded-xl border px-3 py-2" onChange={e => pick(e.target.files?.[0])} /></Field></div>{form.fileName && <div className="mt-3 text-sm">Seleccionado: <b>{form.fileName}</b> · {form.size}</div>}{msg && <div className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">{msg}</div>}<Btn onClick={save} className="mt-4">Subir y compartir</Btn></Card>}<Card><h3 className="mb-3 font-bold">Documentos disponibles</h3>{role !== "admin" && msg && <div className="mb-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">{msg}</div>}{docs.map(d => <div key={d.id} className="border-b py-3 last:border-0"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><b>{d.title}</b><div className="text-sm text-slate-500">{d.type} · {fmtDate(d.date)} · {d.size}</div><div className="text-xs text-slate-400">{d.fileName}</div></div><div className="flex gap-2"><Btn variant="secondary" className="px-3" onClick={() => d.dataUrl ? setOpen(open === d.id ? null : d.id) : setMsg("Documento de ejemplo sin archivo real.")}>{open === d.id ? "Ocultar" : "Ver"}</Btn>{d.dataUrl && <a href={d.dataUrl} download={d.fileName} className="rounded-xl px-3 py-2 text-sm font-bold text-white" style={{ backgroundColor: BRAND.steel }}>Descargar</a>}{role === "admin" && <Btn variant="danger" className="px-3" onClick={() => remove(d.id)}>Eliminar</Btn>}</div></div>{open === d.id && <Preview d={d} />}</div>)}</Card></div>;
}


function ApartmentsAdmin({ apartments, setApartments, selectedBuilding }) {
  // Usamos "Vacío" como estado base porque es el valor que ya existía en los datos originales.
  // Esto evita errores si Supabase tiene una restricción/check que no acepta "Disponible".
  const empty = { number: "", level: "Nivel 1", owner: "", balance: 0, status: "Vacío" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setForm(empty);
    setEditingId(null);
    setQ("");
    setMsg("");
  }, [selectedBuilding]);

  const filtered = apartments
    .filter(a => `${a.number} ${a.level} ${a.owner} ${a.status}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => String(a.number).localeCompare(String(b.number), "es", { numeric: true }));

  const totalBalance = apartments.reduce((s, a) => s + Number(a.balance || 0), 0);
  const occupied = apartments.filter(a => a.status === "Ocupado").length;
  const available = apartments.filter(a => ["Disponible", "Vacío"].includes(a.status)).length;

  function clearForm() {
    setForm(empty);
    setEditingId(null);
    setMsg("");
  }

  function dbApartmentToApp(row) {
    return {
      id: row.id,
      buildingId: row.building_id,
      number: row.number,
      level: row.level,
      owner: row.owner,
      balance: Number(row.balance || 0),
      status: row.status,
    };
  }

  function showSupabaseError(action, error) {
    const detail = [error?.message, error?.details, error?.hint]
      .filter(Boolean)
      .join(" | ");

    console.error(`Error Supabase al ${action} apartamento:`, error);
    alert(`No se pudo ${action} el apartamento en Supabase.\n\nDetalle técnico: ${detail || "Error desconocido"}`);
  }

  async function save() {
    if (!form.number.trim()) {
      setMsg("Ingresa el número o nombre del apartamento.");
      return;
    }

    const payload = {
      building_id: selectedBuilding,
      number: form.number.trim(),
      level: form.level.trim() || "Nivel 1",
      owner: form.owner.trim(),
      balance: Number(form.balance || 0),
      status: form.status,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("apartments")
        .update(payload)
        .eq("id", editingId)
        .select("id, building_id, number, level, owner, balance, status")
        .single();

      if (error) {
        showSupabaseError("actualizar", error);
        return;
      }

      const updatedApartment = data ? dbApartmentToApp(data) : {
        id: editingId,
        buildingId: selectedBuilding,
        number: payload.number,
        level: payload.level,
        owner: payload.owner,
        balance: payload.balance,
        status: payload.status,
      };

      setApartments(apartments.map((a) => a.id === editingId ? updatedApartment : a));
      setMsg("Apartamento actualizado.");
      setEditingId(null);
    } else {
      // Importante: NO enviamos id manual. Supabase debe generarlo.
      // Esto evita errores cuando id es bigint identity, uuid o serial.
      const { data, error } = await supabase
        .from("apartments")
        .insert([payload])
        .select("id, building_id, number, level, owner, balance, status")
        .single();

      if (error) {
        showSupabaseError("guardar", error);
        return;
      }

      const newApartment = data ? dbApartmentToApp(data) : {
        id: `local-${Date.now()}`,
        buildingId: selectedBuilding,
        number: payload.number,
        level: payload.level,
        owner: payload.owner,
        balance: payload.balance,
        status: payload.status,
      };

      setApartments([newApartment, ...apartments]);
      setMsg("Apartamento agregado.");
    }

    setForm(empty);
  }

  function edit(a) {
    setForm({
      number: a.number || "",
      level: a.level || "Nivel 1",
      owner: a.owner || "",
      balance: Number(a.balance || 0),
      status: a.status || "Vacío",
    });
    setEditingId(a.id);
    setMsg("");
  }

  async function remove(id) {
    const apt = apartments.find(a => a.id === id);
    const ok = window.confirm(`¿Eliminar el apartamento ${apt?.number || "seleccionado"}? Esta acción no elimina residentes ya creados.`);
    if (!ok) return;

    const { error } = await supabase
      .from("apartments")
      .delete()
      .eq("id", id);

    if (error) {
      showSupabaseError("eliminar", error);
      return;
    }

    setApartments(apartments.filter((a) => a.id !== id));

    if (editingId === id) {
      clearForm();
    }

    setMsg("Apartamento eliminado.");
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <Title icon="🏠" title="Apartamentos" sub="Administración de unidades por edificio" />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-slate-500">Total unidades</p><h3 className="text-3xl font-black">{apartments.length}</h3></Card>
        <Card><p className="text-sm text-slate-500">Ocupados</p><h3 className="text-3xl font-black">{occupied}</h3></Card>
        <Card><p className="text-sm text-slate-500">Disponibles / vacíos</p><h3 className="text-3xl font-black">{available}</h3></Card>
        <Card><p className="text-sm text-slate-500">Mora del edificio</p><h3 className="text-3xl font-black">{usd(totalBalance)}</h3></Card>
      </div>

      <Card>
        <h3 className="mb-3 font-bold">{editingId ? "Editar apartamento" : "Ingresar apartamento"}</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Número / nombre">
            <Text value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="Ej. 101, A-01, PH-1" />
          </Field>
          <Field label="Nivel">
            <Text value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="Ej. Nivel 1" />
          </Field>
          <Field label="Propietario / referencia">
            <Text value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} placeholder="Nombre del propietario" />
          </Field>
          <Field label="Saldo">
            <Text type="number" min="0" step="0.01" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
          </Field>
          <Field label="Estado">
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>Vacío</option>
              <option>Ocupado</option>
              <option>Reservado</option>
              <option>En mantenimiento</option>
            </select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={save}>{editingId ? "Guardar cambios" : "+ Agregar apartamento"}</Btn>
          {editingId && <Btn variant="outline" onClick={clearForm}>Cancelar edición</Btn>}
        </div>
        {msg && <div className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">{msg}</div>}
      </Card>

      <Card>
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="font-bold">Apartamentos registrados</h3>
          <input className="rounded-xl border px-3 py-2 text-sm" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por número, nivel, propietario o estado" />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No hay apartamentos para mostrar.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(a => (
              <div key={a.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <b className="text-xl">Apto {a.number}</b>
                    <div className="text-sm text-slate-500">{a.level || "Sin nivel"}</div>
                  </div>
                  <Badge tone={a.status === "Ocupado" ? "good" : a.status === "Reservado" ? "warn" : a.status === "En mantenimiento" ? "bad" : "default"}>{a.status || "Vacío"}</Badge>
                </div>
                <div className="mt-3 text-sm">
                  <div><b>Propietario:</b> {a.owner || "-"}</div>
                  <div><b>Saldo:</b> {usd(a.balance || 0)}</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Btn variant="secondary" className="px-3 py-1.5" onClick={() => edit(a)}>Editar</Btn>
                  <Btn variant="danger" className="px-3 py-1.5" onClick={() => remove(a.id)}>Eliminar</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ResidentsAdmin({ residents, setResidents, apartments, selectedBuilding }) {
  const empty = { apt: apartments[0]?.number || "101", name: "", dni: "", email: "", phone: "", type: "Propietario", status: "Activo", notes: "" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState("");
  const filtered = residents.filter(r => `${r.apt} ${r.name} ${r.dni} ${r.email}`.toLowerCase().includes(q.toLowerCase()));

  async function save() {
    if (!form.name.trim() || !form.apt.trim()) return;

    const payload = {
      building_id: selectedBuilding,
      apt: form.apt,
      name: form.name,
      dni: form.dni,
      email: form.email,
      phone: form.phone,
      type: form.type,
      status: form.status,
      notes: form.notes,
    };

    if (editingId) {
      const { error } = await supabase
        .from("residents")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        alert("No se pudo actualizar el residente en Supabase.");
        console.error(error);
        return;
      }

      setResidents(
        residents.map((r) =>
          r.id === editingId
            ? { ...r, ...form, buildingId: selectedBuilding }
            : r
        )
      );

      setEditingId(null);
    } else {
      const newResident = {
        id: `usr-${Date.now()}`,
        buildingId: selectedBuilding,
        ...form,
      };

      const { error } = await supabase
        .from("residents")
        .insert([
          {
            id: newResident.id,
            ...payload,
          },
        ]);

      if (error) {
        alert("No se pudo guardar el residente en Supabase.");
        console.error(error);
        return;
      }

      setResidents([newResident, ...residents]);
    }

    setForm(empty);
  }

  function edit(r) {
    setForm({ apt: r.apt, name: r.name, dni: r.dni, email: r.email, phone: r.phone, type: r.type, status: r.status, notes: r.notes });
    setEditingId(r.id);
  }

  async function remove(id) {
    const { error } = await supabase
      .from("residents")
      .delete()
      .eq("id", id);

    if (error) {
      alert("No se pudo eliminar el residente en Supabase.");
      console.error(error);
      return;
    }

    setResidents(residents.filter((r) => r.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setForm(empty);
    }
  }

  return <div className="space-y-4 pb-24 lg:pb-0"><Title icon="👥" title="Residentes" sub="Registro de propietarios, inquilinos y contactos por apartamento" /><Card><h3 className="mb-3 font-bold">{editingId ? "Editar residente" : "Ingresar nuevo residente"}</h3><div className="grid gap-3 md:grid-cols-3"><Field label="Apartamento"><select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.apt} onChange={e => setForm({ ...form, apt: e.target.value })}>{apartments.map(a => <option key={a.id} value={a.number}>{a.number} · {a.level}</option>)}</select></Field><Field label="Nombre completo"><Text value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field><Field label="DNI / Identidad"><Text value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} /></Field><Field label="Correo"><Text type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field><Field label="Teléfono"><Text value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field><Field label="Tipo"><select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Propietario</option><option>Inquilino</option><option>Apoderado</option><option>Contacto autorizado</option></select></Field><Field label="Estado"><select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>Activo</option><option>Inactivo</option><option>Pendiente</option></select></Field><Field label="Notas"><Text value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field></div><div className="mt-4 flex flex-wrap gap-2"><Btn onClick={save}>{editingId ? "Guardar cambios" : "+ Agregar residente"}</Btn>{editingId && <Btn variant="outline" onClick={() => { setEditingId(null); setForm(empty); }}>Cancelar edición</Btn>}</div></Card><Card><div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><h3 className="font-bold">Residentes registrados</h3><input className="rounded-xl border px-3 py-2 text-sm" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, apto, DNI o correo" /></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map(r => <div key={r.id} className="rounded-2xl border bg-slate-50 p-4"><div className="flex justify-between gap-3"><div><b>{r.name}</b><div className="text-sm text-slate-500">Apto {r.apt} · {r.type}</div></div><Badge tone={r.status === "Activo" ? "good" : r.status === "Pendiente" ? "warn" : "default"}>{r.status}</Badge></div><div className="mt-3 text-sm"><div><b>DNI:</b> {r.dni || "-"}</div><div><b>Correo:</b> {r.email || "-"}</div><div><b>Teléfono:</b> {r.phone || "-"}</div>{r.notes && <div><b>Notas:</b> {r.notes}</div>}</div><div className="mt-3 flex gap-2"><Btn variant="secondary" className="px-3 py-1.5" onClick={() => edit(r)}>Editar</Btn><Btn variant="danger" className="px-3 py-1.5" onClick={() => remove(r.id)}>Eliminar</Btn></div></div>)}</div></Card></div>;
}

export default function NeoVecinoMVP() {
  const [role, setRole] = useState(null);
  const [active, setActive] = useState("home");
  const [buildings, setBuildings] = useState(seedBuildings);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("canarias");

  const [apartments, setApartments] = useState(() => [
    ...seedApartments.map(a => ({ ...a, buildingId: "canarias" })),
    { id: 101, buildingId: "lomas", number: "101", level: "Nivel 1", owner: "Sofía Andino", balance: 0, status: "Ocupado" },
    { id: 102, buildingId: "lomas", number: "102", level: "Nivel 1", owner: "Mario Castillo", balance: 75, status: "Ocupado" },
    { id: 201, buildingId: "lomas", number: "201", level: "Nivel 2", owner: "Diana Flores", balance: 0, status: "Vacío" },
    { id: 301, buildingId: "centro", number: "301", level: "Nivel 3", owner: "Roberto Díaz", balance: 160, status: "Ocupado" },
    { id: 302, buildingId: "centro", number: "302", level: "Nivel 3", owner: "Karla Mejía", balance: 0, status: "Ocupado" },
  ]);

  const [payments] = useState(() => [
    ...seedPayments.map(p => ({ ...p, buildingId: "canarias" })),
    { id: "pay-l-1", buildingId: "lomas", apt: "101", concept: "Cuota mantenimiento abril", amount: 110, status: "Pagado", date: "2026-04-04" },
    { id: "pay-l-2", buildingId: "lomas", apt: "102", concept: "Cuota mantenimiento abril", amount: 110, status: "Pendiente", date: "2026-04-01" },
    { id: "pay-c-1", buildingId: "centro", apt: "301", concept: "Cuota mantenimiento abril", amount: 95, status: "Vencido", date: "2026-04-01" },
  ]);

  const [visits, setAllVisits] = useState(() => [
    ...seedVisits.map(v => ({ ...v, buildingId: "canarias" })),
    { id: "VST-111222", buildingId: "lomas", visitor: "Entrega farmacia", apt: "101", type: "Delivery", date: "2026-05-01", time: "3:00 p.m. - 4:00 p.m.", status: "Pendiente", identity: "", plate: "", notes: "Entrega autorizada.", entryTime: "", exitTime: "", platePhoto: "" },
    { id: "VST-333444", buildingId: "centro", visitor: "Técnico elevador", apt: "301", type: "Proveedor", date: "2026-05-01", time: "9:00 a.m. - 11:00 a.m.", status: "Pendiente", identity: "", plate: "", notes: "Mantenimiento preventivo.", entryTime: "", exitTime: "", platePhoto: "" },
  ]);

  const [reservations, setAllReservations] = useState(() => [
    ...seedReservations.map(r => ({ ...r, buildingId: "canarias" })),
    { id: "res-l-1", buildingId: "lomas", apt: "101", area: "Coworking", date: "2026-05-03", start: "09:00", hours: 2, time: "9:00 a.m. - 11:00 a.m.", cleaning: 0, deposit: 0, status: "Aprobada" },
    { id: "res-c-1", buildingId: "centro", apt: "301", area: "Área social techada", date: "2026-05-04", start: "17:00", hours: 4, time: "5:00 p.m. - 9:00 p.m.", cleaning: 1600, deposit: 1000, status: "Pendiente" },
  ]);

  const [tickets, setAllTickets] = useState(() => [
    ...seedTickets.map(t => ({ ...t, buildingId: "canarias" })),
    { id: "tic-l-1", buildingId: "lomas", apt: "102", title: "Portón vehicular lento", status: "Abierto", date: "2026-05-01" },
    { id: "tic-c-1", buildingId: "centro", apt: "301", title: "Fuga en cuarto de aseo", status: "En proceso", date: "2026-04-30" },
  ]);

  const [docs, setAllDocs] = useState(() => [
    ...seedDocs.map(d => ({ ...d, buildingId: "canarias" })),
    { id: "doc-l-1", buildingId: "lomas", title: "Reglamento Torre Lomas", fileName: "reglamento-lomas.pdf", type: "PDF", date: "2026-04-15", size: "900 KB", dataUrl: "" },
    { id: "doc-c-1", buildingId: "centro", title: "Manual de convivencia Torre Centro", fileName: "manual-centro.pdf", type: "PDF", date: "2026-04-18", size: "700 KB", dataUrl: "" },
  ]);

  const [residents, setAllResidents] = useState(() => [
    ...seedResidents.map(r => ({ ...r, buildingId: "canarias" })),
    { id: "usr-l-1", buildingId: "lomas", apt: "101", name: "Sofía Andino", dni: "0801-1991-00000", email: "sofia@email.com", phone: "9999-3333", type: "Propietario", status: "Activo", notes: "" },
    { id: "usr-l-2", buildingId: "lomas", apt: "102", name: "Mario Castillo", dni: "0801-1982-00000", email: "mario@email.com", phone: "9999-4444", type: "Inquilino", status: "Activo", notes: "" },
    { id: "usr-c-1", buildingId: "centro", apt: "301", name: "Roberto Díaz", dni: "0801-1975-00000", email: "roberto@email.com", phone: "9999-5555", type: "Propietario", status: "Activo", notes: "" },
  ]);

  useEffect(() => {
    async function loadCoreData() {
      setLoadingData(true);
      setDataError("");

      try {
        const [buildingsResult, apartmentsResult, residentsResult] = await Promise.all([
          supabase.from("buildings").select("*").order("name"),
          supabase.from("apartments").select("*").order("number"),
          supabase.from("residents").select("*").order("name"),
        ]);

        if (buildingsResult.error) throw buildingsResult.error;
        if (apartmentsResult.error) throw apartmentsResult.error;
        if (residentsResult.error) throw residentsResult.error;

        const dbBuildings = (buildingsResult.data || []).map((b) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          units: b.units,
        }));

        const dbApartments = (apartmentsResult.data || []).map((a) => ({
          id: a.id,
          buildingId: a.building_id,
          number: a.number,
          level: a.level,
          owner: a.owner,
          balance: Number(a.balance || 0),
          status: a.status,
        }));

        const dbResidents = (residentsResult.data || []).map((r) => ({
          id: r.id,
          buildingId: r.building_id,
          apt: r.apt,
          name: r.name,
          dni: r.dni,
          email: r.email,
          phone: r.phone,
          type: r.type,
          status: r.status,
          notes: r.notes,
        }));

        if (dbBuildings.length) setBuildings(dbBuildings);
        if (dbApartments.length) setApartments(dbApartments);
        if (dbResidents.length) setAllResidents(dbResidents);
      } catch (error) {
        console.error("Error cargando datos desde Supabase:", error);
        setDataError("No se pudieron cargar los datos desde Supabase. La app está usando datos demo.");
      } finally {
        setLoadingData(false);
      }
    }

    loadCoreData();
  }, []);

  const building = buildings.find(b => b.id === selectedBuilding) || buildings[0];
  const belongs = item => (item.buildingId || "canarias") === selectedBuilding;

  const scopedApartments = apartments.filter(belongs);
  const scopedPayments = payments.filter(belongs);
  const scopedVisits = visits.filter(belongs);
  const scopedReservations = reservations.filter(belongs);
  const scopedTickets = tickets.filter(belongs);
  const scopedDocs = docs.filter(belongs);
  const scopedResidents = residents.filter(belongs);
  const apt = scopedApartments.find(a => a.number === "101") || scopedApartments[0] || seedApartments[0];

  const scopedSetter = setter => nextList => {
    setter(prev => [
      ...prev.filter(item => (item.buildingId || "canarias") !== selectedBuilding),
      ...nextList.map(item => ({ ...item, buildingId: selectedBuilding })),
    ]);
  };

  if (!role) {
    return <Login onLogin={(r) => { if (r === "resident" || r === "guard") setSelectedBuilding("canarias"); setRole(r); setActive("home"); }} />;
  }

  const pages = {
    home: <HomePage role={role} apt={apt} apartments={scopedApartments} visits={scopedVisits} tickets={scopedTickets} reservations={scopedReservations} />,
    apartments: <ApartmentsAdmin apartments={scopedApartments} setApartments={scopedSetter(setApartments)} selectedBuilding={selectedBuilding} />,
    residents: <ResidentsAdmin residents={scopedResidents} setResidents={scopedSetter(setAllResidents)} apartments={scopedApartments} selectedBuilding={selectedBuilding} />,
    payments: <Payments role={role} payments={scopedPayments} apartments={scopedApartments} />,
    visits: <Visits role={role} visits={scopedVisits} setVisits={scopedSetter(setAllVisits)} />,
    reservations: <Reservations role={role} reservations={scopedReservations} setReservations={scopedSetter(setAllReservations)} />,
    tickets: <Tickets role={role} tickets={scopedTickets} setTickets={scopedSetter(setAllTickets)} />,
    docs: <Docs role={role} docs={scopedDocs} setDocs={scopedSetter(setAllDocs)} />,
  };

  return (
    <Shell role={role} setRole={setRole} active={active} setActive={setActive}>
      {loadingData && (
        <div className="mb-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">
          Cargando datos desde Supabase...
        </div>
      )}

      {dataError && (
        <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
          {dataError}
        </div>
      )}

      <BuildingBar role={role} buildings={buildings} selectedBuilding={selectedBuilding} setSelectedBuilding={setSelectedBuilding} building={building} />
      {pages[active] || pages.home}
    </Shell>
  );
}
