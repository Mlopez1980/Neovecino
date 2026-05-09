import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const BRAND = { black: "#020202", steel: "#636e7a", red: "#ff0000", white: "#ffffff" };
const APP_VERSION = "VISITAS_SUPABASE_FINAL_SIN_DEMO";
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
const fmtDateTime = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return new Intl.DateTimeFormat("es-HN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d).replace(".", "");
};

const seedApartments = [
  { id: 1, number: "101", level: "Nivel 1", owner: "Marco López", resident: "Marco López", balance: 125, status: "Ocupado" },
  { id: 2, number: "102", level: "Nivel 1", owner: "Ana Martínez", resident: "Ana Martínez", balance: 0, status: "Ocupado" },
  { id: 3, number: "201", level: "Nivel 2", owner: "Carlos Rivera", resident: "Carlos Rivera", balance: 250, status: "Ocupado" },
  { id: 4, number: "202", level: "Nivel 2", owner: "Lucía Gómez", resident: "", balance: 0, status: "Vacío" },
];
const seedPayments = [
  { id: "pay-1", apt: "101", concept: "Cuota mantenimiento abril", amount: 125, status: "Pendiente", date: "2026-04-01" },
  { id: "pay-2", apt: "102", concept: "Cuota mantenimiento abril", amount: 125, status: "Pagado", date: "2026-04-03" },
  { id: "pay-3", apt: "201", concept: "Cuota mantenimiento marzo", amount: 125, status: "Vencido", date: "2026-03-01" },
];
const seedVisits = [];
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
const seedAnnouncements = [
  { id: "ann-1", target: "Todos", apt: "", title: "Mantenimiento preventivo", message: "El sábado se realizará revisión preventiva en áreas comunes.", priority: "Normal", status: "Enviado", createdAt: "2026-05-01T09:00:00" },
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de espera agotado al iniciar sesión. Refresca la página e intenta de nuevo.")), 10000)
        ),
      ]);

      if (error) throw error;

      await onLogin(data.user || data.session?.user);
    } catch (error) {
      console.error("Error iniciando sesión:", error);
      setErrorMsg(error.message || "No se pudo iniciar sesión. Revisa el correo y la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen px-4 py-10 text-white"
      style={{
        background:
          `radial-gradient(circle at top left, rgba(255,0,0,.35), transparent 28%), linear-gradient(135deg, ${BRAND.black}, ${BRAND.steel})`,
      }}
    >
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
            Acceso privado para residentes, administración y guardia
          </div>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">NeoVecino</h1>
          <p className="mt-5 max-w-2xl text-lg font-medium text-slate-200">
            Plataforma para gestión de edificios residenciales con control de visitas, reservas, tickets, documentos y anuncios.
          </p>
          <div className="mt-8 max-w-xl rounded-[28px] border border-white/10 bg-white/10 p-5 text-sm text-slate-200 backdrop-blur">
            <b className="text-white">Inicio de sesión real:</b> cada usuario entra con su correo y contraseña, y la app abre automáticamente su perfil según el rol asignado en Supabase.
          </div>
        </div>

        <form onSubmit={submit} className="rounded-[34px] border border-white/10 bg-white/95 p-6 text-slate-950 shadow-2xl">
          <Powered />
          <div className="mt-6">
            <h2 className="text-3xl font-black tracking-tight">Iniciar sesión</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Ingresa con el usuario creado en Supabase Auth.
            </p>
          </div>

          <label className="mt-6 block text-sm font-black text-slate-700">
            Correo electrónico
            <input
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </label>

          <label className="mt-4 block text-sm font-black text-slate-700">
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Tu contraseña"
            />
          </label>

          {errorMsg && (
            <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl px-4 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${BRAND.red}, #b91c1c)` }}
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>

          <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-500">
            Si el usuario existe en Authentication pero no tiene perfil en app_users, la app no permitirá el acceso.
          </div>
        </form>
      </div>
    </div>
  );
}

function AuthLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 text-white"
      style={{ background: `linear-gradient(135deg, ${BRAND.black}, ${BRAND.steel})` }}
    >
      <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white" style={{ backgroundColor: BRAND.red }}>
          🏢
        </div>
        <h2 className="text-2xl font-black">Cargando NeoVecino...</h2>
        <p className="mt-2 text-sm font-medium text-slate-200">Verificando sesión y perfil de usuario.</p>
      </div>
    </div>
  );
}


function ChangePasswordModal({ open, onClose }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function save(e) {
    e.preventDefault();
    setMsg("");

    if (password.length < 6) {
      setMsg("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      setMsg("Contraseña actualizada correctamente. En tu próximo inicio de sesión usa la nueva contraseña.");
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      setMsg(error.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <form onSubmit={save} className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-slate-950">Cambiar contraseña</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Sustituye la contraseña temporal por una contraseña propia.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-600">×</button>
        </div>

        <label className="block text-sm font-black text-slate-700">
          Nueva contraseña
          <input
            type="password"
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        <label className="mt-3 block text-sm font-black text-slate-700">
          Confirmar contraseña
          <input
            type="password"
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </label>

        {msg && (
          <div className={`mt-4 rounded-2xl p-3 text-sm font-bold ${msg.includes("correctamente") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {msg}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl px-4 py-2.5 text-sm font-black text-white shadow-sm disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${BRAND.red}, #b91c1c)` }}
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700"
          >
            Cerrar
          </button>
        </div>
      </form>
    </div>
  );
}

function Shell({ role, active, setActive, children, onLogout, userProfile }) {
  const menus = {
  resident: [
    ["home", "Inicio", "⌂"],
    ["visits", "Visitas", "▦"],
    ["reservations", "Reservas", "📅"],
    ["tickets", "Tickets", "🔧"],
    ["docs", "Docs", "📄"],
  ],
  owner: [
    ["home", "Inicio", "⌂"],
    ["visits", "Visitas", "▦"],
    ["reservations", "Reservas", "📅"],
    ["tickets", "Tickets", "🔧"],
    ["docs", "Docs", "📄"],
  ],
  admin: [
    ["home", "Dashboard", "⌂"],
    ["apartments", "Apartamentos", "🏠"],
    ["residents", "Residentes", "👥"],
    ["users", "Usuarios", "🔐"],
    ["payments", "Pagos", "💳"],
    ["visits", "Visitas", "▦"],
    ["reservations", "Reservas", "📅"],
    ["tickets", "Tickets", "🔧"],
    ["docs", "Docs", "📄"],
  ],
  guard: [
    ["home", "Guardia", "🛡️"],
    ["visits", "Visitas", "📋"],
  ],
};

  const label = role === "admin" ? "Administración" : role === "guard" ? "Guardia" : role === "owner" ? "Propietario" : "Residente";
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
              <div className="text-xs font-bold text-slate-500">Modo {label}{userProfile?.fullName ? ` · ${userProfile.fullName}` : ""}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block"><Powered /></div>
            <Btn variant="outline" onClick={() => setShowPasswordModal(true)}>🔑 Contraseña</Btn>
            <Btn variant="secondary" onClick={onLogout}>↩ Cerrar sesión</Btn>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[250px_1fr]">
        <aside className="hidden rounded-[28px] border border-slate-200 bg-white/95 p-3 shadow-soft lg:block">
          {(menus[role] || menus.resident).map(([key, text, icon]) => (
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
          {(menus[role] || menus.resident).map(([key, text, icon]) => (
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
      <ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
}

function HomePage({ role, apt, apartments, visits, tickets, reservations, announcements = [] }) {
  if (role === "admin") {
    return (
      <div className="space-y-4 pb-24 lg:pb-0">
        <Title icon="⌂" title="Dashboard" sub="Resumen administrativo" />
        <div className="grid gap-4 md:grid-cols-4">
          <Card><p className="text-sm text-slate-500">Apartamentos</p><h3 className="text-3xl font-black">{apartments.length}</h3></Card>
          <Card><p className="text-sm text-slate-500">Mora total</p><h3 className="text-3xl font-black">{usd(apartments.reduce((s, a) => s + a.balance, 0))}</h3></Card>
          <Card><p className="text-sm text-slate-500">Visitas</p><h3 className="text-3xl font-black">{visits.length}</h3></Card>
          <Card><p className="text-sm text-slate-500">Tickets</p><h3 className="text-3xl font-black">{tickets.length}</h3></Card>
        </div>
      </div>
    );
  }

  if (role === "guard") return <GuardPanel visits={visits} setVisits={() => {}} readOnly />;

  const visibleAnnouncements = announcements
    .filter(a => a.status !== "Borrador")
    .filter(a => a.target !== "Apartamento específico" || String(a.apt || "") === String(apt.number || ""))
    .slice(0, 3);

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <Title icon="⌂" title="Inicio" sub="Resumen rápido de tu apartamento" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Apartamento</p>
          <h3 className="text-3xl font-black">{apt.number}</h3>
          <p className="text-sm text-slate-500">
            {apt.level ? `${apt.level} · ` : ""}Propietario: {apt.owner || "-"}<br />
            Residente: {apt.resident || apt.owner || "-"}
          </p>
        </Card>
        <Card><p className="text-sm text-slate-500">Visitas registradas</p><h3 className="text-3xl font-black">{visits.filter(v => String(v.apt) === String(apt.number)).length}</h3></Card>
      </div>

      {visibleAnnouncements.length > 0 && (
        <Card>
          <h3 className="mb-3 font-bold">Anuncios recientes</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleAnnouncements.map(a => (
              <div key={a.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <b>{a.title}</b>
                  <Badge tone={a.priority === "Urgente" ? "bad" : a.priority === "Importante" ? "warn" : "blue"}>{a.priority || "Normal"}</Badge>
                </div>
                <p className="text-sm text-slate-600">{a.message}</p>
                <div className="mt-2 text-xs font-bold text-slate-400">{fmtDateTime(a.createdAt)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-bold">Tickets recientes</h3>
          {tickets.filter(t => t.apt === apt.number).map(t => <div key={t.id} className="mb-2 rounded-2xl bg-slate-50 p-3"><b>{t.title}</b><div className="text-sm text-slate-500">{fmtDate(t.date)} · {t.status}</div></div>)}
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">Reservas</h3>
          {reservations.filter(r => r.apt === apt.number).map(r => <div key={r.id} className="mb-2 rounded-2xl bg-slate-50 p-3"><b>{r.area}</b><div className="text-sm text-slate-500">{fmtDate(r.date)} · {r.time}</div></div>)}
        </Card>
      </div>
    </div>
  );
}

function Payments({ role, payments, apartments, aptNumber = "" }) {
  const rows = ["resident", "owner"].includes(role) ? payments.filter(p => String(p.apt) === String(aptNumber)) : payments;
  return <div className="space-y-4 pb-24 lg:pb-0"><Title icon="💳" title={["resident", "owner"].includes(role) ? "Mi estado de cuenta" : "Pagos y saldos"} sub="Cuotas y pagos" /><Card><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-slate-500"><tr><th className="py-2">Apto</th><th>Concepto</th><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead><tbody>{rows.map(p => <tr key={p.id} className="border-t"><td className="py-3 font-bold">{p.apt}</td><td>{p.concept}</td><td>{fmtDate(p.date)}</td><td>{usd(p.amount)}</td><td><Badge tone={p.status === "Pagado" ? "good" : p.status === "Vencido" ? "bad" : "warn"}>{p.status}</Badge></td></tr>)}</tbody></table></div></Card></div>;
}

function QR({ value }) {
  const seed = Array.from(value).reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = [];
  for (let y = 0; y < 19; y++) for (let x = 0; x < 19; x++) if ((x * 17 + y * 31 + seed) % 5 === 0 || (x < 5 && y < 5) || (x > 13 && y < 5) || (x < 5 && y > 13)) cells.push(<rect key={`${x}-${y}`} x={x * 10} y={y * 10} width="9" height="9" rx="2" fill="currentColor" />);
  return <svg width="190" height="190" viewBox="0 0 190 190" className="text-slate-900"><rect width="190" height="190" rx="16" fill="white" />{cells}</svg>;
}
const emptyVisit = () => ({
  visitor: "",
  type: "Familiar",
  date: todayISO(),
  time: "2:00 p.m. - 6:00 p.m.",
  apt: "101",
  identity: "",
  plate: "",
  notes: "",
  platePhoto: "",
  qrType: "Un solo uso",
  maxUses: 1,
  uses: 0,
  lastUse: "",
  validFrom: todayISO(),
  validTo: todayISO(),
  peopleCount: 1,
});

function getVisitQrType(v) {
  return v?.qrType || "Un solo uso";
}

function getVisitMaxUses(v) {
  const type = getVisitQrType(v);
  if (type === "Un solo uso") return 1;
  return Math.max(2, Number(v?.maxUses || 2));
}

function getVisitUses(v) {
  return Math.max(0, Number(v?.uses || 0));
}

function getRemainingUses(v) {
  return Math.max(0, getVisitMaxUses(v) - getVisitUses(v));
}

function getVisitValidFrom(v) {
  return v?.validFrom || v?.date || todayISO();
}

function getVisitValidTo(v) {
  return v?.validTo || v?.date || todayISO();
}

function getVisitPeopleCount(v) {
  return Math.max(1, Number(v?.peopleCount || 1));
}

function isTodayWithinVisitDates(v) {
  const today = todayISO();
  const from = getVisitValidFrom(v);
  const to = getVisitValidTo(v);

  return today >= from && today <= to;
}

function canUseVisitQr(v) {
  if (!v) {
    return { ok: false, message: "Código no encontrado." };
  }

  if (!isTodayWithinVisitDates(v)) {
    return {
      ok: false,
      message: `Este código QR no está vigente hoy. Es válido del ${fmtDate(getVisitValidFrom(v))} al ${fmtDate(getVisitValidTo(v))}.`,
    };
  }

  if (v.status === "Ingresó") {
    return {
      ok: false,
      message: "Esta visita ya registró entrada. Primero debe registrarse la salida antes de volver a usar el código.",
    };
  }

  if (getRemainingUses(v) <= 0) {
    const type = getVisitQrType(v);
    return {
      ok: false,
      message:
        type === "Un solo uso"
          ? "Este código QR era de un solo uso y ya fue utilizado."
          : "Este código QR ya no tiene usos disponibles.",
    };
  }

  return { ok: true, message: "Código válido." };
}

function buildEntryPatch(v) {
  const now = timeNow();
  return {
    status: "Ingresó",
    entryTime: now,
    lastUse: now,
    uses: getVisitUses(v) + 1,
  };
}

function visitFromDb(row) {
  return {
    id: row.id,
    buildingId: row.building_id || "canarias",
    apt: row.apt || "",
    visitor: row.visitor || "",
    type: row.type || "Familiar",
    date: row.date || row.valid_from || todayISO(),
    time: row.time || "",
    status: row.status || "Pendiente",
    identity: row.identity || "",
    plate: row.plate || "",
    notes: row.notes || "",
    entryTime: row.entry_time || "",
    exitTime: row.exit_time || "",
    platePhoto: row.plate_photo || "",
    qrType: row.qr_type || "Un solo uso",
    maxUses: Number(row.max_uses || 1),
    uses: Number(row.uses || 0),
    lastUse: row.last_use || "",
    validFrom: row.valid_from || row.date || todayISO(),
    validTo: row.valid_to || row.date || todayISO(),
    peopleCount: Number(row.people_count || 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function visitLogFromDb(row) {
  return {
    id: row.id,
    visitId: row.visit_id,
    buildingId: row.building_id || "canarias",
    apt: row.apt || "",
    visitor: row.visitor || "",
    plate: row.plate || "",
    action: row.action || "entry",
    useNumber: Number(row.use_number || 0),
    eventAt: row.event_at,
    guardUserId: row.guard_user_id || "",
    guardName: row.guard_name || "",
    peopleCount: Number(row.people_count || 1),
    notes: row.notes || "",
    platePhoto: row.plate_photo || "",
    createdAt: row.created_at,
  };
}

function visitPatchToDb(patch) {
  const out = {};

  if (patch.buildingId !== undefined) out.building_id = patch.buildingId;
  if (patch.apt !== undefined) out.apt = patch.apt;
  if (patch.visitor !== undefined) out.visitor = patch.visitor;
  if (patch.type !== undefined) out.type = patch.type;
  if (patch.date !== undefined) out.date = patch.date;
  if (patch.time !== undefined) out.time = patch.time;
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.identity !== undefined) out.identity = patch.identity;
  if (patch.plate !== undefined) out.plate = patch.plate;
  if (patch.notes !== undefined) out.notes = patch.notes;
  if (patch.entryTime !== undefined) out.entry_time = patch.entryTime;
  if (patch.exitTime !== undefined) out.exit_time = patch.exitTime;
  if (patch.platePhoto !== undefined) out.plate_photo = patch.platePhoto;
  if (patch.qrType !== undefined) out.qr_type = patch.qrType;
  if (patch.maxUses !== undefined) out.max_uses = Number(patch.maxUses || 1);
  if (patch.uses !== undefined) out.uses = Number(patch.uses || 0);
  if (patch.lastUse !== undefined) out.last_use = patch.lastUse;
  if (patch.validFrom !== undefined) out.valid_from = patch.validFrom;
  if (patch.validTo !== undefined) out.valid_to = patch.validTo;
  if (patch.peopleCount !== undefined) out.people_count = Number(patch.peopleCount || 1);

  out.updated_at = new Date().toISOString();
  return out;
}

async function loadVisitLogsFromDb(buildingId = "") {
  let query = supabase
    .from("visit_logs")
    .select("*")
    .order("event_at", { ascending: false })
    .limit(100);

  if (buildingId) query = query.eq("building_id", buildingId);

  const { data, error } = await query;
  if (error) {
    console.warn("No se pudieron cargar visit_logs:", error);
    return [];
  }

  return (data || []).map(visitLogFromDb);
}

function buildVisitInsertPayload(form, aptNumber, buildingId) {
  const qrType = form.qrType || "Un solo uso";
  const maxUses = qrType === "Un solo uso" ? 1 : Math.max(2, Number(form.maxUses || 2));

  return {
    building_id: buildingId || "canarias",
    apt: aptNumber || form.apt || "",
    visitor: String(form.visitor || "").trim(),
    type: form.type || "Familiar",
    date: form.validFrom || form.date || todayISO(),
    time: form.time || "",
    status: "Pendiente",
    identity: form.identity || "",
    plate: form.plate || "",
    notes: form.notes || "",
    entry_time: "",
    exit_time: "",
    plate_photo: form.platePhoto || "",
    qr_type: qrType,
    max_uses: maxUses,
    uses: 0,
    last_use: "",
    valid_from: form.validFrom || todayISO(),
    valid_to: form.validTo || form.validFrom || todayISO(),
    people_count: Math.max(1, Number(form.peopleCount || 1)),
  };
}

function buildVisitLogPayload(visit, action, useNumber, guardProfile) {
  return {
    visit_id: visit.id,
    building_id: visit.buildingId || "canarias",
    apt: visit.apt || "",
    visitor: visit.visitor || "",
    plate: visit.plate || "",
    action,
    use_number: Number(useNumber || 0),
    guard_user_id: guardProfile?.id || null,
    guard_name: guardProfile?.fullName || guardProfile?.email || "",
    people_count: getVisitPeopleCount(visit),
    notes: visit.notes || "",
    plate_photo: visit.platePhoto || "",
  };
}

function Visits({ role, visits, setVisits, aptNumber = "", selectedBuilding = "canarias", visitLogs = [], setVisitLogs, userProfile }) {
  const [form, setForm] = useState(() => ({ ...emptyVisit(), apt: aptNumber || "" }));
  const [selected, setSelected] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const isResidentLike = ["resident", "owner"].includes(role);
  const list = isResidentLike
    ? visits.filter(v => String(v.apt) === String(aptNumber))
    : visits;
  const selectedVisit = list.find(v => String(v.id) === String(selected)) || list[0] || null;

  useEffect(() => {
    setForm(prev => ({ ...prev, apt: aptNumber || "" }));
  }, [aptNumber]);

  useEffect(() => {
    if (!selected && list[0]?.id) setSelected(list[0].id);
    if (selected && !list.some(v => String(v.id) === String(selected))) {
      setSelected(list[0]?.id || "");
    }
  }, [list, selected]);

  async function update(id, patch) {
    const { data, error } = await supabase
      .from("visits")
      .update(visitPatchToDb(patch))
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("No se pudo actualizar la visita:", error);
      setMsg(`No se pudo actualizar la visita. Detalle: ${error.message}`);
      return null;
    }

    const updated = visitFromDb(data);
    setVisits(visits.map(v => String(v.id) === String(id) ? updated : v));
    return updated;
  }

  async function create() {
    setMsg("");

    if (!form.visitor.trim()) {
      setMsg("Ingresa el nombre del visitante o grupo.");
      return;
    }

    if (!aptNumber && isResidentLike) {
      setMsg("Tu usuario no tiene apartamento asignado. Contacta a administración.");
      return;
    }

    if (form.validFrom > form.validTo) {
      setMsg("La fecha inicial no puede ser posterior a la fecha final.");
      return;
    }

    setSaving(true);

    const payload = buildVisitInsertPayload(form, aptNumber, selectedBuilding);

    const { data, error } = await supabase
      .from("visits")
      .insert([payload])
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error("Error creando visita en Supabase:", error);
      setMsg(`No se pudo guardar la visita en Supabase. Detalle: ${error.message}`);
      return;
    }

    const created = visitFromDb(data);
    setVisits([created, ...visits]);
    setSelected(created.id);
    setForm({ ...emptyVisit(), apt: aptNumber || "" });
    setMsg("Visita creada correctamente en Supabase. El guardia ya puede verla con el código QR.");
  }

  if (role === "guard") {
    return (
      <GuardPanel
        visits={visits}
        setVisits={setVisits}
        visitLogs={visitLogs}
        setVisitLogs={setVisitLogs}
        userProfile={userProfile}
        selectedBuilding={selectedBuilding}
      />
    );
  }

  const latestLogs = visitLogs
    .filter(l => !isResidentLike || String(l.apt) === String(aptNumber))
    .slice(0, 20);

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <Title
        icon="▦"
        title={isResidentLike ? "Mis visitas QR" : "Control de visitas"}
        sub="Autorización y registro de entradas"
      />

      {isResidentLike && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card>
            <h3 className="mb-3 font-bold">Crear autorización</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Visitante o grupo">
                <Text
                  value={form.visitor}
                  onChange={e => setForm({ ...form, visitor: e.target.value })}
                  placeholder="Ej. María Gómez / Familia Pérez"
                />
              </Field>

              <Field label="Tipo">
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option>Familiar</option>
                  <option>Proveedor</option>
                  <option>Delivery</option>
                  <option>Huésped</option>
                  <option>Grupo autorizado</option>
                </select>
              </Field>

              <Field label="Cantidad de personas">
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                  value={form.peopleCount}
                  onChange={e => setForm({ ...form, peopleCount: Math.max(1, Number(e.target.value || 1)) })}
                />
              </Field>

              <Field label="Identidad">
                <Text value={form.identity} onChange={e => setForm({ ...form, identity: e.target.value })} />
              </Field>

              <Field label="Válido desde">
                <DateField
                  value={form.validFrom}
                  onChange={e => setForm({
                    ...form,
                    validFrom: e.target.value,
                    date: e.target.value,
                    validTo: form.validTo < e.target.value ? e.target.value : form.validTo,
                  })}
                />
              </Field>

              <Field label="Válido hasta">
                <DateField value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} />
              </Field>

              <Field label="Horario permitido">
                <Text value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="Ej. 2:00 p.m. - 6:00 p.m." />
              </Field>

              <Field label="Placa">
                <Text value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })} />
              </Field>

              <Field label="Tipo de código QR">
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={form.qrType}
                  onChange={e => setForm({
                    ...form,
                    qrType: e.target.value,
                    maxUses: e.target.value === "Un solo uso" ? 1 : 5,
                  })}
                >
                  <option>Un solo uso</option>
                  <option>Varios usos</option>
                </select>
              </Field>

              {form.qrType === "Varios usos" && (
                <Field label="Cantidad máxima de usos">
                  <input
                    type="number"
                    min="2"
                    max="50"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                    value={form.maxUses}
                    onChange={e => setForm({ ...form, maxUses: Math.max(2, Number(e.target.value || 2)) })}
                  />
                </Field>
              )}

              <Field label="Observaciones">
                <Text value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              <b>Regla del QR:</b>{" "}
              {form.qrType === "Un solo uso"
                ? `Este código QR será de un solo uso y solo será válido del ${fmtDate(form.validFrom)} al ${fmtDate(form.validTo)}.`
                : `Este código QR podrá utilizarse hasta ${form.maxUses} veces, únicamente del ${fmtDate(form.validFrom)} al ${fmtDate(form.validTo)}.`}
              <br />
              <b>Personas autorizadas:</b> {form.peopleCount}
            </div>

            {msg && (
              <div className={`mt-4 rounded-2xl p-3 text-sm font-bold ${msg.includes("correctamente") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {msg}
              </div>
            )}

            <Btn onClick={create} className="mt-4" variant={saving ? "secondary" : "primary"}>
              {saving ? "Guardando..." : "▦ Generar QR"}
            </Btn>
          </Card>

          {selectedVisit && (
            <Card>
              <h3 className="mb-3 font-bold">QR generado</h3>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <QR value={selectedVisit.id} />
                <div className="mt-3 break-all font-mono text-xs font-black">{selectedVisit.id}</div>
                <p className="text-sm text-slate-500">{selectedVisit.visitor}</p>

                <div className="mt-3">
                  <Badge tone={getVisitQrType(selectedVisit) === "Un solo uso" ? "warn" : "blue"}>
                    {getVisitQrType(selectedVisit)}
                  </Badge>
                </div>

                <div className="mt-3 rounded-2xl bg-white p-3 text-xs font-bold text-slate-600">
                  <div>Usos disponibles: {getRemainingUses(selectedVisit)} de {getVisitMaxUses(selectedVisit)}</div>
                  <div>Válido: {fmtDate(getVisitValidFrom(selectedVisit))} al {fmtDate(getVisitValidTo(selectedVisit))}</div>
                  <div>Personas autorizadas: {getVisitPeopleCount(selectedVisit)}</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <Card>
        <h3 className="mb-3 font-bold">Historial de visitas</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map(v => (
            <VisitCard key={v.id} v={v} role={role} update={update} />
          ))}
        </div>
        {!list.length && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
            No hay visitas registradas en Supabase para este apartamento.
          </div>
        )}
      </Card>

      {latestLogs.length > 0 && (
        <Card>
          <h3 className="mb-3 font-bold">Bitácora de accesos</h3>
          <div className="grid gap-2">
            {latestLogs.map(log => (
              <div key={log.id} className="rounded-2xl bg-slate-50 p-3 text-sm">
                <b>{log.action === "entry" ? "Entrada" : "Salida"}</b> · {log.visitor} · Apto {log.apt}
                <div className="text-xs font-bold text-slate-400">{fmtDateTime(log.eventAt)} · Guardia: {log.guardName || "-"}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function VisitCard({ v, role, update }) {
  async function registerEntry() {
    const check = canUseVisitQr(v);
    if (!check.ok) {
      alert(check.message);
      return;
    }
    await update(v.id, buildEntryPatch(v));
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <div className="flex justify-between gap-3">
        <div>
          <b>{v.visitor}</b>
          <div className="text-sm text-slate-500">Apto {v.apt} · {v.type}</div>
        </div>

        <Badge tone={v.status === "Ingresó" ? "blue" : v.status === "Salió" ? "default" : "warn"}>
          {v.status}
        </Badge>
      </div>

      <div className="mt-2 text-sm text-slate-600">{fmtDate(getVisitValidFrom(v))} al {fmtDate(getVisitValidTo(v))} · {v.time}</div>
      {v.plate && <div className="mt-1 text-sm"><b>Placa:</b> {v.plate}</div>}
      {v.notes && <div className="mt-1 text-sm"><b>Obs.:</b> {v.notes}</div>}

      <div className="mt-3 rounded-xl bg-white p-3 text-xs">
        <div><b>Tipo de QR:</b> {getVisitQrType(v)}</div>
        <div><b>Usos:</b> {getVisitUses(v)} de {getVisitMaxUses(v)}</div>
        <div><b>Disponibles:</b> {getRemainingUses(v)}</div>
        <div><b>Vigencia:</b> {fmtDate(getVisitValidFrom(v))} al {fmtDate(getVisitValidTo(v))}</div>
        <div><b>Personas autorizadas:</b> {getVisitPeopleCount(v)}</div>
        {v.lastUse && <div><b>Último uso:</b> {v.lastUse}</div>}
      </div>

      <div className="mt-2 break-all rounded-xl bg-white px-3 py-2 font-mono text-xs">{v.id}</div>

      {!['resident', 'owner'].includes(role) && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn className="px-3 py-1.5" onClick={registerEntry}>Entrada</Btn>
          <Btn variant="secondary" className="px-3 py-1.5" onClick={() => update(v.id, { status: "Salió", exitTime: timeNow() })}>Salida</Btn>
        </div>
      )}
    </div>
  );
}

function GuardPanel({ visits, setVisits, visitLogs = [], setVisitLogs, userProfile, selectedBuilding = "canarias" }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const orderedVisits = [...visits].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  const visit = visits.find(v => String(v.id).toLowerCase() === String(code).trim().toLowerCase()) || null;

  useEffect(() => {
    if (!code && orderedVisits[0]?.id) setCode(orderedVisits[0].id);
  }, [orderedVisits, code]);

  async function updateVisit(patch) {
    if (!visit) return null;

    const { data, error } = await supabase
      .from("visits")
      .update(visitPatchToDb(patch))
      .eq("id", visit.id)
      .select()
      .single();

    if (error) {
      console.error("No se pudo actualizar visita:", error);
      setMessage(`No se pudo actualizar la visita. Detalle: ${error.message}`);
      return null;
    }

    const updated = visitFromDb(data);
    setVisits(visits.map(v => String(v.id) === String(visit.id) ? updated : v));
    return updated;
  }

  async function addLog(currentVisit, action, useNumber) {
    const payload = buildVisitLogPayload(currentVisit, action, useNumber, userProfile);
    const { data, error } = await supabase
      .from("visit_logs")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("No se pudo guardar visit_log:", error);
      setMessage(`El acceso se actualizó, pero no se pudo guardar la bitácora. Detalle: ${error.message}`);
      return;
    }

    if (setVisitLogs) setVisitLogs([visitLogFromDb(data), ...visitLogs]);
  }

  async function photo(file) {
    if (!file || !visit) return;

    const reader = new FileReader();
    reader.onload = async () => {
      await updateVisit({ platePhoto: String(reader.result || "") });
    };
    reader.readAsDataURL(file);
  }

  async function registerEntry() {
    if (!visit || saving) return;

    const check = canUseVisitQr(visit);
    if (!check.ok) {
      setMessage(check.message);
      return;
    }

    setSaving(true);
    const nextUses = getVisitUses(visit) + 1;
    const updated = await updateVisit(buildEntryPatch(visit));
    if (updated) {
      await addLog(updated, "entry", nextUses);
      setMessage(`Entrada registrada correctamente. Usos disponibles restantes: ${Math.max(0, getVisitMaxUses(updated) - nextUses)}.`);
    }
    setSaving(false);
  }

  async function registerExit() {
    if (!visit || saving) return;

    setSaving(true);
    const updated = await updateVisit({ status: "Salió", exitTime: timeNow() });
    if (updated) {
      await addLog(updated, "exit", getVisitUses(updated));
      setMessage("Salida registrada correctamente.");
    }
    setSaving(false);
  }

  const latestLogs = visitLogs.slice(0, 20);

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <Title icon="🛡️" title="Modo Guardia" sub="Validación de QR y control de acceso" />

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <h3 className="mb-3 font-bold">Buscar código</h3>

          <div className="flex gap-3">
            <input
              className="flex-1 rounded-xl border px-3 py-2 font-mono text-xs"
              value={code}
              onChange={e => {
                setCode(e.target.value);
                setMessage("");
              }}
              placeholder="Pega o escanea el código QR"
            />
            <Btn>Validar</Btn>
          </div>

          <div className="mt-5 rounded-3xl border-2 border-dashed bg-slate-50 p-8 text-center">
            <div className="text-6xl">▦</div>
            <b>Aquí irá el escáner de cámara</b>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
            <b className="text-sm">Últimas visitas autorizadas</b>
            <div className="mt-2 grid gap-2">
              {orderedVisits.slice(0, 8).map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setCode(v.id);
                    setMessage("");
                  }}
                  className="rounded-xl bg-white px-3 py-2 text-left text-sm hover:bg-slate-100"
                >
                  <b>{v.visitor}</b> · Apto {v.apt}
                  <div className="break-all text-xs text-slate-400">{v.id}</div>
                </button>
              ))}
              {!orderedVisits.length && (
                <div className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-500">
                  No hay visitas guardadas en Supabase para este edificio.
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          {!visit ? (
            <div className="rounded-2xl bg-rose-50 p-4 text-rose-700">
              Código no encontrado. Selecciona una visita de la lista o pega el código QR generado.
            </div>
          ) : (
            <div className="space-y-3">
              {isTodayWithinVisitDates(visit) ? (
                <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                  Visita autorizada. Código vigente para hoy.
                </div>
              ) : (
                <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">
                  Código encontrado, pero no está vigente hoy.
                </div>
              )}

              {message && (
                <div className="rounded-2xl bg-slate-100 p-3 text-sm font-bold text-slate-700">
                  {message}
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-2xl font-black">{visit.visitor}</div>
                <div className="text-slate-500">Apartamento {visit.apt}</div>

                <div className="mt-3 rounded-xl bg-white p-3 text-sm">
                  <div><b>Tipo de QR:</b> {getVisitQrType(visit)}</div>
                  <div><b>Usos realizados:</b> {getVisitUses(visit)} de {getVisitMaxUses(visit)}</div>
                  <div><b>Usos disponibles:</b> {getRemainingUses(visit)}</div>
                  <div><b>Vigencia:</b> {fmtDate(getVisitValidFrom(visit))} al {fmtDate(getVisitValidTo(visit))}</div>
                  <div><b>Personas autorizadas:</b> {getVisitPeopleCount(visit)}</div>
                  {visit.lastUse && <div><b>Último uso:</b> {visit.lastUse}</div>}
                </div>

                {visit.notes && (
                  <div className="mt-3 rounded-xl border-l-4 bg-white px-3 py-2" style={{ borderColor: BRAND.red }}>
                    <b>Observación:</b><br />{visit.notes}
                  </div>
                )}

                <label className="mt-3 block text-xs font-bold">
                  Placa observada
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={visit.plate || ""}
                    onChange={e => updateVisit({ plate: e.target.value.toUpperCase() })}
                  />
                </label>

                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white" style={{ backgroundColor: BRAND.red }}>
                  📷 Tomar foto de placa
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => photo(e.target.files?.[0])} />
                </label>

                {visit.platePhoto && <img src={visit.platePhoto} alt="Placa" className="mt-3 h-32 w-full rounded-xl object-cover" />}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Btn onClick={registerEntry} variant={saving ? "secondary" : "primary"}>{saving ? "Guardando..." : "Entrada"}</Btn>
                <Btn variant="secondary" onClick={registerExit}>{saving ? "Guardando..." : "Salida"}</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-bold">Últimos accesos registrados</h3>
        <div className="grid gap-2">
          {latestLogs.map(log => (
            <div key={log.id} className="rounded-2xl bg-slate-50 p-3 text-sm">
              <b>{log.action === "entry" ? "Entrada" : "Salida"}</b> · {log.visitor} · Apto {log.apt}
              <div className="text-xs font-bold text-slate-400">
                {fmtDateTime(log.eventAt)} · Uso #{log.useNumber || "-"} · Guardia: {log.guardName || "-"}
              </div>
            </div>
          ))}
          {!latestLogs.length && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
              Todavía no hay entradas o salidas registradas.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
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

  function status(date) {
    const rs = reservations.filter(r => r.area === area && r.date === date && !["Rechazada", "Cancelada"].includes(r.status));
    if (rs.length > 0) return "con-reservas";
    return "disponible";
  }

  function move(delta) {
    const n = new Date(vy, vm - 1 + delta, 1);
    setView(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`);
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <button className="rounded-xl bg-white px-3 py-2 font-bold" onClick={() => move(-1)}>‹</button>
        <b className="capitalize">{name}</b>
        <button className="rounded-xl bg-white px-3 py-2 font-bold" onClick={() => move(1)}>›</button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="h-11" />;
          const s = status(date);
          const sel = date === selectedDate;
          const bg = sel ? BRAND.black : s === "con-reservas" ? "#fef3c7" : "#dcfce7";
          const color = sel ? BRAND.white : s === "con-reservas" ? "#92400e" : "#166534";

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className="h-11 rounded-xl text-sm font-black"
              style={{ backgroundColor: bg, color }}
              title={s === "con-reservas" ? "Este día ya tiene reservas. Puedes seleccionar otro horario disponible." : "Disponible"}
            >
              {Number(date.slice(-2))}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">Disponible</span>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Con reservas</span>
      </div>
    </div>
  );
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

function getReservationEndTime(r) {
  if (!r?.start || !r?.hours) return "";
  return addHours(r.start, Number(r.hours || 0));
}

function reservationBlocksCalendar(r) {
  return r && !["Rechazada", "Cancelada"].includes(r.status);
}

function reservationOverlaps(r, area, date, start, hours) {
  if (!reservationBlocksCalendar(r)) return false;
  if (r.area !== area || r.date !== date) return false;
  if (!r.start || !r.hours) return false;

  const requestedStart = toMinutes(start);
  const requestedEnd = toMinutes(addHours(start, hours));
  const existingStart = toMinutes(r.start);
  const existingEnd = toMinutes(getReservationEndTime(r));

  return requestedStart < existingEnd && requestedEnd > existingStart;
}

function findOverlappingReservation(reservations, area, date, start, hours) {
  return reservations.find(r => reservationOverlaps(r, area, date, start, hours));
}

function Reservations({ role, reservations, setReservations, aptNumber = "" }) {
  const [form, setForm] = useState({ area: "Área social techada", date: todayISO(), start: "18:00", hours: 4 });
  const [notice, setNotice] = useState("");

  const maxHours = getMaxReservableHours(form.area, form.date, form.start);
  const scheduleText = getScheduleText(form.area, form.date);
  const cleaning = form.area === "Coworking" ? 0 : isSunday(form.date) ? 1600 : 1000;
  const deposit = form.area === "Coworking" ? 0 : 1000;
  const safeHours = maxHours > 0 ? Math.min(Number(form.hours || 1), maxHours) : Number(form.hours || 1);
  const range = `${clock(form.start)} - ${clock(addHours(form.start, safeHours))}`;
  const rows = ["resident", "owner"].includes(role) ? reservations.filter(r => String(r.apt) === String(aptNumber)) : reservations;

  const dayReservations = reservations
    .filter(r => r.area === form.area && r.date === form.date && reservationBlocksCalendar(r))
    .sort((a, b) => toMinutes(a.start || "00:00") - toMinutes(b.start || "00:00"));

  const conflict = maxHours > 0
    ? findOverlappingReservation(reservations, form.area, form.date, form.start, safeHours)
    : null;

  const reservationWasSent = notice === "Solicitud enviada.";
  const blockingConflict = conflict && !reservationWasSent;

  const duplicate = reservations.some(r =>
    String(r.apt) === String(aptNumber) &&
    r.area === form.area &&
    r.date === form.date &&
    r.start === form.start &&
    Number(r.hours) === Number(safeHours) &&
    reservationBlocksCalendar(r)
  );

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

    if (blockingConflict) {
      setNotice(`No se puede reservar. ${form.area} ya tiene una reserva registrada de ${clock(conflict.start)} a ${clock(getReservationEndTime(conflict))}. Por favor selecciona otro horario.`);
      return;
    }

    if (duplicate) {
      setNotice("Ya existe una solicitud igual para esa área, fecha y horario.");
      return;
    }

    const r = {
      id: `res-${Date.now()}`,
      apt: aptNumber || "",
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

      {["resident", "owner"].includes(role) && (
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

              {reservationWasSent && (
                <div className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                  Tu solicitud de reserva ha sido enviada correctamente. El horario solicitado queda registrado como pendiente mientras administración la revisa.
                </div>
              )}

              {blockingConflict && (
                <div className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
                  Este horario se cruza con una reserva existente de {clock(conflict.start)} a {clock(getReservationEndTime(conflict))}. Por favor selecciona otro horario disponible.
                </div>
              )}

              {dayReservations.length > 0 && (
                <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                  <b>Reservas existentes para {fmtDate(form.date)}:</b>
                  <div className="mt-2 space-y-2">
                    {dayReservations.map(r => (
                      <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                        <span>Apto {r.apt} · {clock(r.start)} - {clock(getReservationEndTime(r))}</span>
                        <Badge tone={r.status === "Aprobada" ? "good" : "warn"}>{r.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notice && !reservationWasSent && <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">{notice}</div>}

              <Btn onClick={add} variant={maxHours <= 0 || blockingConflict ? "secondary" : "primary"}>
                {maxHours <= 0 ? "Horario no disponible" : reservationWasSent ? "Solicitud enviada" : blockingConflict ? "Horario ocupado" : duplicate ? "Solicitud ya registrada" : "+ Solicitar reserva"}
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


function Tickets({ role, tickets, setTickets, aptNumber = "" }) {
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const baseRows = ["resident", "owner"].includes(role) ? tickets.filter(t => String(t.apt) === String(aptNumber)) : tickets;

  const rows = baseRows.filter(t => {
    const matchesText = `${t.apt} ${t.title} ${t.status}`.toLowerCase().includes(q.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || t.status === statusFilter;
    return matchesText && matchesStatus;
  });

  function add() {
    if (!text.trim()) return;

    setTickets([
      {
        id: `tic-${Date.now()}`,
        apt: aptNumber || "",
        title: text,
        status: "Abierto",
        date: todayISO(),
      },
      ...tickets,
    ]);

    setText("");
  }

  function updateStatus(id, status) {
    setTickets(
      tickets.map(t =>
        t.id === id
          ? { ...t, status, updatedAt: todayISO() }
          : t
      )
    );
  }

  function tone(status) {
    if (status === "Finalizado") return "good";
    if (status === "En proceso") return "blue";
    if (status === "Abierto") return "warn";
    return "default";
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <Title
        icon="🔧"
        title="Mantenimiento"
        sub={role === "admin" ? "Gestión de tickets y seguimiento" : "Tickets y seguimiento"}
      />

      {["resident", "owner"].includes(role) && (
        <Card>
          <h3 className="mb-3 font-bold">Crear nuevo ticket</h3>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="flex-1 rounded-xl border px-3 py-2"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe el problema"
            />
            <Btn onClick={add}>Crear ticket</Btn>
          </div>
        </Card>
      )}

      {role === "admin" && (
        <Card>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Abiertos</p>
              <h3 className="text-3xl font-black">
                {tickets.filter(t => t.status === "Abierto").length}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">En proceso</p>
              <h3 className="text-3xl font-black">
                {tickets.filter(t => t.status === "En proceso").length}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Finalizados</p>
              <h3 className="text-3xl font-black">
                {tickets.filter(t => t.status === "Finalizado").length}
              </h3>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="font-bold">
            {role === "admin" ? "Tickets registrados" : "Mis tickets"}
          </h3>

          <div className="flex flex-col gap-2 md:flex-row">
            <input
              className="rounded-xl border px-3 py-2 text-sm"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por apto, estado o descripción"
            />

            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option>Todos</option>
              <option>Abierto</option>
              <option>En proceso</option>
              <option>Finalizado</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(t => (
            <div key={t.id} className="rounded-2xl border bg-slate-50 p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <b>{t.title}</b>
                  <div className="text-sm text-slate-500">
                    Apto {t.apt} · {fmtDate(t.date)}
                  </div>
                </div>

                <Badge tone={tone(t.status)}>{t.status}</Badge>
              </div>

              {t.updatedAt && (
                <div className="mt-2 text-xs font-bold text-slate-400">
                  Última actualización: {fmtDate(t.updatedAt)}
                </div>
              )}

              {role === "admin" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {t.status === "Abierto" && (
                    <Btn
                      className="px-3 py-1.5"
                      onClick={() => updateStatus(t.id, "En proceso")}
                    >
                      Pasar a En proceso
                    </Btn>
                  )}

                  {t.status === "En proceso" && (
                    <Btn
                      className="px-3 py-1.5"
                      onClick={() => updateStatus(t.id, "Finalizado")}
                    >
                      Finalizar ticket
                    </Btn>
                  )}

                  {t.status === "Finalizado" && (
                    <Btn
                      variant="outline"
                      className="px-3 py-1.5"
                      onClick={() => updateStatus(t.id, "Abierto")}
                    >
                      Reabrir
                    </Btn>
                  )}

                  {t.status !== "Finalizado" && (
                    <select
                      className="rounded-xl border px-3 py-2 text-sm font-bold"
                      value={t.status}
                      onChange={e => updateStatus(t.id, e.target.value)}
                    >
                      <option>Abierto</option>
                      <option>En proceso</option>
                      <option>Finalizado</option>
                    </select>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!rows.length && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
            No hay tickets para mostrar.
          </div>
        )}
      </Card>
    </div>
  );
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
  // Propietario = dueño legal o contacto de referencia.
  // Residente actual = persona que vive/usa el apartamento, que puede ser inquilino.
  const empty = { number: "", level: "Nivel 1", owner: "", resident: "", balance: 0, status: "Vacío" };
  const [form, setForm] = useState(empty);
  const [bulk, setBulk] = useState({ prefix: "", from: 1, quantity: 1, level: "Nivel 1", status: "Vacío" });
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
    .filter(a => `${a.number} ${a.level} ${a.owner} ${a.resident || ""} ${a.status}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => String(a.number).localeCompare(String(b.number), "es", { numeric: true }));

  const totalBalance = apartments.reduce((s, a) => s + Number(a.balance || 0), 0);
  const occupied = apartments.filter(a => a.status === "Ocupado").length;
  const available = apartments.filter(a => ["Disponible", "Vacío"].includes(a.status)).length;
  const withResident = apartments.filter(a => String(a.resident || "").trim()).length;

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
      resident: row.resident || "",
      balance: Number(row.balance || 0),
      status: row.status,
    };
  }

  function showSupabaseError(action, error) {
    const detail = [error?.message, error?.details, error?.hint]
      .filter(Boolean)
      .join(" | ");

    console.error(`Error Supabase al ${action} apartamento:`, error);
    alert(`No se pudo ${action} el apartamento en Supabase.\n\nDetalle técnico: ${detail || "Error desconocido"}\n\nSi el error menciona la columna resident, ejecuta primero el SQL que te pasé para agregar ese campo.`);
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
      resident: form.resident.trim(),
      balance: Number(form.balance || 0),
      status: form.status,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("apartments")
        .update(payload)
        .eq("id", editingId)
        .select("*")
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
        resident: payload.resident,
        balance: payload.balance,
        status: payload.status,
      };

      setApartments(apartments.map((a) => a.id === editingId ? updatedApartment : a));
      setMsg("Apartamento actualizado.");
      setEditingId(null);
    } else {
      const { data, error } = await supabase
        .from("apartments")
        .insert([payload])
        .select("*")
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
        resident: payload.resident,
        balance: payload.balance,
        status: payload.status,
      };

      setApartments([newApartment, ...apartments]);
      setMsg("Apartamento agregado.");
    }

    setForm(empty);
  }

  function buildApartmentName(prefix, n) {
    const rawPrefix = String(prefix || "").trim();
    return `${rawPrefix}${n}`;
  }

  async function createBulk() {
    const qty = Math.max(1, Math.min(200, Number(bulk.quantity || 1)));
    const start = Number(bulk.from || 1);
    const level = String(bulk.level || "Nivel 1").trim() || "Nivel 1";
    const status = bulk.status || "Vacío";

    const payloads = Array.from({ length: qty }, (_, i) => ({
      building_id: selectedBuilding,
      number: buildApartmentName(bulk.prefix, start + i),
      level,
      owner: "",
      resident: "",
      balance: 0,
      status,
    }));

    const existingNames = new Set(apartments.map(a => String(a.number).trim().toLowerCase()));
    const cleanPayloads = payloads.filter(p => !existingNames.has(String(p.number).trim().toLowerCase()));

    if (!cleanPayloads.length) {
      setMsg("Los apartamentos de ese rango ya existen en este edificio.");
      return;
    }

    const { data, error } = await supabase
      .from("apartments")
      .insert(cleanPayloads)
      .select("*");

    if (error) {
      showSupabaseError("crear en lote", error);
      return;
    }

    const created = (data && data.length ? data.map(dbApartmentToApp) : cleanPayloads.map((p, i) => ({
      id: `local-bulk-${Date.now()}-${i}`,
      buildingId: selectedBuilding,
      number: p.number,
      level: p.level,
      owner: p.owner,
      resident: p.resident,
      balance: p.balance,
      status: p.status,
    })));

    setApartments([...created, ...apartments]);
    setMsg(`Se crearon ${created.length} apartamento(s).`);
  }

  function edit(a) {
    setForm({
      number: a.number || "",
      level: a.level || "Nivel 1",
      owner: a.owner || "",
      resident: a.resident || "",
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
        <Card><p className="text-sm text-slate-500">Con residente</p><h3 className="text-3xl font-black">{withResident}</h3></Card>
        <Card><p className="text-sm text-slate-500">Mora del edificio</p><h3 className="text-3xl font-black">{usd(totalBalance)}</h3></Card>
      </div>

      <Card>
        <h3 className="mb-3 font-bold">Crear varios apartamentos</h3>
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Prefijo opcional">
            <Text value={bulk.prefix} onChange={e => setBulk({ ...bulk, prefix: e.target.value })} placeholder="Ej. A-, PH-, Nivel1-" />
          </Field>
          <Field label="Desde">
            <Text type="number" min="1" value={bulk.from} onChange={e => setBulk({ ...bulk, from: e.target.value })} />
          </Field>
          <Field label="Cantidad">
            <Text type="number" min="1" max="200" value={bulk.quantity} onChange={e => setBulk({ ...bulk, quantity: e.target.value })} />
          </Field>
          <Field label="Nivel">
            <Text value={bulk.level} onChange={e => setBulk({ ...bulk, level: e.target.value })} placeholder="Ej. Nivel 1" />
          </Field>
          <Field label="Estado">
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={bulk.status} onChange={e => setBulk({ ...bulk, status: e.target.value })}>
              <option>Vacío</option>
              <option>Ocupado</option>
              <option>Reservado</option>
              <option>En mantenimiento</option>
            </select>
          </Field>
        </div>
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
          Ejemplo: prefijo <b>A-</b>, desde <b>1</b>, cantidad <b>5</b> crea: A-1, A-2, A-3, A-4 y A-5. Puedes dejar el prefijo vacío para crear 1, 2, 3...
        </div>
        <Btn onClick={createBulk} className="mt-4">+ Crear apartamentos en lote</Btn>
      </Card>

      <Card>
        <h3 className="mb-3 font-bold">{editingId ? "Editar apartamento" : "Ingresar apartamento individual"}</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Número / nombre del apartamento">
            <Text value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="Ej. 1A, A-01, Penthouse, Local 1" />
          </Field>
          <Field label="Nivel">
            <Text value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="Ej. Nivel 1" />
          </Field>
          <Field label="Propietario legal">
            <Text value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} placeholder="Ej. Juan Pérez" />
          </Field>
          <Field label="Residente / ocupante actual">
            <Text value={form.resident} onChange={e => setForm({ ...form, resident: e.target.value })} placeholder="Ej. María Gómez" />
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
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
          Ejemplo: <b>Juan Pérez</b> puede ser propietario legal y <b>María Gómez</b> residente actual. Si el propietario también vive en el apartamento, escribes el mismo nombre en ambos campos.
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
          <input className="rounded-xl border px-3 py-2 text-sm" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por número, nivel, propietario, residente o estado" />
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
                  <div><b>Residente:</b> {a.resident || "-"}</div>
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


function UsersAdmin({ users, setUsers, buildings, apartments, selectedBuilding, currentUserId }) {
  const empty = {
    id: "",
    email: "",
    password: "",
    fullName: "",
    role: "resident",
    buildingId: selectedBuilding || "canarias",
    apt: "",
    status: "Activo",
  };

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState("");
  const [buildingFilter, setBuildingFilter] = useState(selectedBuilding || "Todos");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const apartmentsForForm = apartments.filter(a => (a.buildingId || "canarias") === form.buildingId);

  const filtered = users.filter(u => {
    const matchesBuilding = buildingFilter === "Todos" || (u.buildingId || "canarias") === buildingFilter;
    const text = `${u.email} ${u.fullName} ${u.role} ${u.buildingId} ${u.apt} ${u.status}`.toLowerCase();
    return matchesBuilding && text.includes(q.toLowerCase());
  });

  function resetForm() {
    setForm({
      id: "",
      email: "",
      password: "",
      fullName: "",
      role: "resident",
      buildingId: selectedBuilding || "canarias",
      apt: "",
      status: "Activo",
    });
    setEditingId(null);
    setMsg("");
    setSaving(false);
  }

  function edit(u) {
    setForm({
      id: u.id,
      email: u.email || "",
      password: "",
      fullName: u.fullName || "",
      role: u.role || "resident",
      buildingId: u.buildingId || selectedBuilding || "canarias",
      apt: u.apt || "",
      status: u.status || "Activo",
    });
    setEditingId(u.id);
    setMsg("");
  }

  function validateForm() {
    if (!form.email.trim()) return "Debes ingresar el correo del usuario.";
    if (!form.fullName.trim()) return "Debes ingresar el nombre completo del usuario.";
    if (!editingId && !form.password.trim()) return "Debes ingresar una contraseña temporal.";
    if (!editingId && form.password.trim().length < 6) return "La contraseña temporal debe tener al menos 6 caracteres.";
    if (!["admin", "owner", "resident", "guard"].includes(form.role)) return "Selecciona un rol válido.";
    if (!form.buildingId) return "Selecciona el edificio.";
    if (["resident", "owner"].includes(form.role) && !form.apt.trim()) return "Para un propietario o residente debes asignar el apartamento.";
    return "";
  }

  async function save() {
    setMsg("");

    const validation = validateForm();
    if (validation) {
      setMsg(validation);
      return;
    }

    const payload = {
      email: form.email.trim().toLowerCase(),
      full_name: form.fullName.trim(),
      role: form.role,
      building_id: form.buildingId || selectedBuilding || "canarias",
      apt: ["resident", "owner"].includes(form.role) ? form.apt.trim() : "",
      status: form.status || "Activo",
    };

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("app_users")
        .update({
          email: payload.email,
          full_name: payload.full_name,
          role: payload.role,
          building_id: payload.building_id,
          apt: payload.apt,
          status: payload.status,
        })
        .eq("id", editingId);

      setSaving(false);

      if (error) {
        console.error(error);
        setMsg(`No se pudo actualizar el usuario. Detalle: ${error.message}`);
        return;
      }

      setUsers(users.map(u =>
        u.id === editingId
          ? {
              ...u,
              email: payload.email,
              fullName: payload.full_name,
              role: payload.role,
              buildingId: payload.building_id,
              apt: payload.apt,
              status: payload.status,
            }
          : u
      ));

      setMsg("Usuario actualizado correctamente.");
      resetForm();
      return;
    }

    const { data, error } = await supabase.functions.invoke("create-app-user", {
      body: {
        ...payload,
        password: form.password.trim(),
      },
    });

    setSaving(false);

    if (error) {
      console.error(error);
      setMsg(`No se pudo crear el usuario. Detalle: ${error.message || "Error al llamar la función create-app-user."}`);
      return;
    }

    if (!data?.ok) {
      console.error(data);
      setMsg(`No se pudo crear el usuario. Detalle: ${data?.error || "Respuesta inválida de la función."}${data?.detail ? ` ${data.detail}` : ""}`);
      return;
    }

    const created = data.user;

    setUsers([
      {
        id: created.id,
        email: created.email,
        fullName: created.full_name,
        role: created.role,
        buildingId: created.building_id,
        apt: created.apt || "",
        status: created.status || "Activo",
      },
      ...users,
    ]);

    setMsg("Usuario creado correctamente en Authentication y app_users. Ya puede iniciar sesión con la contraseña temporal.");
    resetForm();
  }

  async function deactivate(u) {
    const { error } = await supabase
      .from("app_users")
      .update({ status: "Inactivo" })
      .eq("id", u.id);

    if (error) {
      console.error(error);
      setMsg(`No se pudo desactivar el usuario. Detalle: ${error.message}`);
      return;
    }

    setUsers(users.map(x => x.id === u.id ? { ...x, status: "Inactivo" } : x));
    setMsg("Usuario desactivado. Su perfil queda bloqueado para entrar a la app.");
  }

  async function remove(u) {
    if (u.id === currentUserId) {
      setMsg("No puedes eliminar tu propio perfil mientras estás usando la app.");
      return;
    }

    const ok = window.confirm("Esto elimina el perfil app_users, pero no elimina el usuario de Supabase Authentication. ¿Deseas continuar?");
    if (!ok) return;

    const { error } = await supabase
      .from("app_users")
      .delete()
      .eq("id", u.id);

    if (error) {
      console.error(error);
      setMsg(`No se pudo eliminar el perfil. Detalle: ${error.message}`);
      return;
    }

    setUsers(users.filter(x => x.id !== u.id));
    setMsg("Perfil eliminado de app_users. Si querés eliminar el acceso totalmente, también elimina el usuario en Authentication.");
  }

  function roleLabel(role) {
    if (role === "admin") return "Administrador";
    if (role === "owner") return "Propietario";
    if (role === "guard") return "Guardia";
    return "Residente";
  }

  function roleTone(role) {
    if (role === "admin") return "bad";
    if (role === "owner") return "warn";
    if (role === "guard") return "blue";
    return "good";
  }

  const activeUsers = users.filter(u => u.status === "Activo").length;
  const residentUsers = users.filter(u => u.role === "resident").length;
  const ownerUsers = users.filter(u => u.role === "owner").length;
  const guardUsers = users.filter(u => u.role === "guard").length;
  const adminUsers = users.filter(u => u.role === "admin").length;

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <Title icon="🔐" title="Usuarios" sub="Creación automática de accesos por rol, edificio y apartamento" />

      <div className="grid gap-4 md:grid-cols-5">
        <Card><p className="text-sm text-slate-500">Usuarios activos</p><h3 className="text-3xl font-black">{activeUsers}</h3></Card>
        <Card><p className="text-sm text-slate-500">Administradores</p><h3 className="text-3xl font-black">{adminUsers}</h3></Card>
        <Card><p className="text-sm text-slate-500">Propietarios</p><h3 className="text-3xl font-black">{ownerUsers}</h3></Card>
        <Card><p className="text-sm text-slate-500">Residentes</p><h3 className="text-3xl font-black">{residentUsers}</h3></Card>
        <Card><p className="text-sm text-slate-500">Guardias</p><h3 className="text-3xl font-black">{guardUsers}</h3></Card>
      </div>

      <Card>
        <h3 className="mb-3 font-bold">{editingId ? "Editar perfil de usuario" : "Crear usuario"}</h3>

        <div className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
          <b>Nuevo:</b> ya no necesitas copiar el UID. Al crear el usuario aquí, la app crea automáticamente el acceso en <b>Supabase Authentication</b> y el perfil en <b>app_users</b>.
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Correo electrónico">
            <Text
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="usuario@correo.com"
            />
          </Field>

          {!editingId && (
            <Field label="Contraseña temporal">
              <Text
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </Field>
          )}

          <Field label="Nombre completo">
            <Text
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nombre del usuario"
            />
          </Field>

          <Field label="Rol">
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              value={form.role}
              onChange={e =>
                setForm({
                  ...form,
                  role: e.target.value,
                  apt: ["resident", "owner"].includes(e.target.value) ? form.apt : "",
                })
              }
            >
              <option value="admin">Administrador</option>
              <option value="owner">Propietario</option>
              <option value="resident">Residente</option>
              <option value="guard">Guardia</option>
            </select>
          </Field>

          <Field label="Edificio">
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              value={form.buildingId}
              onChange={e => setForm({ ...form, buildingId: e.target.value, apt: "" })}
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Apartamento">
            <input
              list="apartamentos-usuarios"
              disabled={!["resident", "owner"].includes(form.role)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:bg-slate-100 disabled:text-slate-400"
              value={form.apt}
              onChange={e => setForm({ ...form, apt: e.target.value })}
              placeholder={["resident", "owner"].includes(form.role) ? "Ej. 101, 1A, PH-1" : "No aplica"}
            />
            <datalist id="apartamentos-usuarios">
              {apartmentsForForm.map(a => (
                <option key={a.id} value={a.number}>{a.number} · {a.level}</option>
              ))}
            </datalist>
          </Field>

          <Field label="Estado">
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Pendiente</option>
            </select>
          </Field>
        </div>

        {msg && (
          <div className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            {msg}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={save}>{saving ? "Guardando..." : editingId ? "Guardar cambios" : "+ Crear usuario"}</Btn>
          {editingId && <Btn variant="outline" onClick={resetForm}>Cancelar edición</Btn>}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="font-bold">Usuarios registrados</h3>

          <div className="flex flex-col gap-2 md:flex-row">
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={buildingFilter}
              onChange={e => setBuildingFilter(e.target.value)}
            >
              <option value="Todos">Todos los edificios</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <input
              className="rounded-xl border px-3 py-2 text-sm"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por correo, nombre, rol o apto"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(u => {
            const b = buildings.find(x => x.id === u.buildingId);
            return (
              <div key={u.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <b>{u.fullName || u.email}</b>
                    <div className="text-sm text-slate-500">{u.email}</div>
                  </div>
                  <Badge tone={u.status === "Activo" ? "good" : u.status === "Pendiente" ? "warn" : "default"}>{u.status}</Badge>
                </div>

                <div className="mt-3 text-sm">
                  <div><b>Rol:</b> <Badge tone={roleTone(u.role)}>{roleLabel(u.role)}</Badge></div>
                  <div className="mt-2"><b>Edificio:</b> {b?.name || u.buildingId}</div>
                  {["resident", "owner"].includes(u.role) && <div><b>Apartamento:</b> {u.apt || "-"}</div>}
                  <div className="mt-2 break-all text-xs text-slate-400"><b>UID:</b> {u.id}</div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Btn variant="secondary" className="px-3 py-1.5" onClick={() => edit(u)}>Editar</Btn>
                  {u.status === "Activo" && <Btn variant="outline" className="px-3 py-1.5" onClick={() => deactivate(u)}>Desactivar</Btn>}
                  <Btn variant="danger" className="px-3 py-1.5" onClick={() => remove(u)}>Eliminar perfil</Btn>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
            No hay usuarios para mostrar.
          </div>
        )}
      </Card>
    </div>
  );
}

function ResidentsAdmin({ residents, setResidents, apartments, selectedBuilding, announcements = [], setAnnouncements }) {
  const empty = { apt: "", name: "", dni: "", email: "", phone: "", type: "Propietario", status: "Activo", notes: "" };
  const emptyAnnouncement = { target: "Todos", apt: "", title: "", message: "", priority: "Normal" };

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState("");
  const [annForm, setAnnForm] = useState(emptyAnnouncement);
  const [annQ, setAnnQ] = useState("");
  const [annMsg, setAnnMsg] = useState("");

  const filtered = residents.filter(r => `${r.apt} ${r.name} ${r.dni} ${r.email}`.toLowerCase().includes(q.toLowerCase()));
  const filteredAnnouncements = announcements
    .filter(a => `${a.title} ${a.message} ${a.target} ${a.apt} ${a.priority}`.toLowerCase().includes(annQ.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  function dbAnnouncementToApp(row) {
    return {
      id: row.id,
      buildingId: row.building_id,
      target: row.target,
      apt: row.apt || "",
      title: row.title,
      message: row.message,
      priority: row.priority || "Normal",
      status: row.status || "Enviado",
      createdAt: row.created_at,
    };
  }

  function showAnnouncementError(action, error) {
    const detail = [error?.message, error?.details, error?.hint]
      .filter(Boolean)
      .join(" | ");

    console.error(`Error Supabase al ${action} anuncio:`, error);
    alert(`No se pudo ${action} el anuncio en Supabase.\n\nDetalle técnico: ${detail || "Error desconocido"}\n\nSi el error menciona la tabla announcements o políticas RLS, ejecuta el SQL que te pasé para crear la tabla de anuncios.`);
  }

  async function sendAnnouncement() {
    if (!annForm.title.trim() || !annForm.message.trim()) {
      setAnnMsg("Ingresa título y mensaje del anuncio.");
      return;
    }

    if (annForm.target === "Apartamento específico" && !annForm.apt.trim()) {
      setAnnMsg("Selecciona o escribe el apartamento destino.");
      return;
    }

    const payload = {
      building_id: selectedBuilding,
      target: annForm.target,
      apt: annForm.target === "Apartamento específico" ? annForm.apt.trim() : "",
      title: annForm.title.trim(),
      message: annForm.message.trim(),
      priority: annForm.priority,
      status: "Enviado",
    };

    const { data, error } = await supabase
      .from("announcements")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      showAnnouncementError("enviar", error);
      return;
    }

    const created = data ? dbAnnouncementToApp(data) : {
      id: `ann-local-${Date.now()}`,
      buildingId: selectedBuilding,
      target: payload.target,
      apt: payload.apt,
      title: payload.title,
      message: payload.message,
      priority: payload.priority,
      status: payload.status,
      createdAt: new Date().toISOString(),
    };

    setAnnouncements([created, ...announcements]);
    setAnnForm(emptyAnnouncement);
    setAnnMsg("Anuncio enviado y publicado para los residentes seleccionados.");
  }

  async function removeAnnouncement(id) {
    const ok = window.confirm("¿Eliminar este anuncio?");
    if (!ok) return;

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      showAnnouncementError("eliminar", error);
      return;
    }

    setAnnouncements(announcements.filter((a) => a.id !== id));
    setAnnMsg("Anuncio eliminado.");
  }

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

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <Title icon="👥" title="Residentes" sub="Registro de propietarios, inquilinos, contactos y anuncios del edificio" />

      <Card>
        <h3 className="mb-3 font-bold">Enviar anuncio a residentes</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Destinatarios">
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={annForm.target} onChange={e => setAnnForm({ ...annForm, target: e.target.value })}>
              <option>Todos</option>
              <option>Propietarios</option>
              <option>Residentes actuales</option>
              <option>Apartamento específico</option>
            </select>
          </Field>
          {annForm.target === "Apartamento específico" && (
            <Field label="Apartamento destino">
              <Text list="announcement-apartments-list" value={annForm.apt} onChange={e => setAnnForm({ ...annForm, apt: e.target.value })} placeholder="Ej. 1A, 101, PH-1" />
              <datalist id="announcement-apartments-list">{apartments.map(a => <option key={a.id} value={a.number}>{a.number} · {a.level}</option>)}</datalist>
            </Field>
          )}
          <Field label="Prioridad">
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={annForm.priority} onChange={e => setAnnForm({ ...annForm, priority: e.target.value })}>
              <option>Normal</option>
              <option>Importante</option>
              <option>Urgente</option>
            </select>
          </Field>
          <Field label="Título">
            <Text value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} placeholder="Ej. Corte de agua programado" />
          </Field>
        </div>
        <label className="mt-3 block text-sm font-black text-slate-700">
          Mensaje del anuncio
          <textarea
            className="mt-1 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
            value={annForm.message}
            onChange={e => setAnnForm({ ...annForm, message: e.target.value })}
            placeholder="Escribe aquí el mensaje que verá el residente..."
          />
        </label>
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
          Este envío publica el anuncio dentro de la app. Luego podemos conectar correo, WhatsApp o notificaciones push.
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={sendAnnouncement}>📣 Enviar anuncio</Btn>
          <Btn variant="outline" onClick={() => { setAnnForm(emptyAnnouncement); setAnnMsg(""); }}>Limpiar</Btn>
        </div>
        {annMsg && <div className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">{annMsg}</div>}
      </Card>

      <Card>
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="font-bold">Anuncios enviados</h3>
          <input className="rounded-xl border px-3 py-2 text-sm" value={annQ} onChange={e => setAnnQ(e.target.value)} placeholder="Buscar anuncio" />
        </div>
        {filteredAnnouncements.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Aún no hay anuncios enviados para este edificio.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredAnnouncements.map(a => (
              <div key={a.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <b>{a.title}</b>
                    <div className="mt-1 text-xs font-bold text-slate-400">{fmtDateTime(a.createdAt)}</div>
                  </div>
                  <Badge tone={a.priority === "Urgente" ? "bad" : a.priority === "Importante" ? "warn" : "blue"}>{a.priority || "Normal"}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600">{a.message}</p>
                <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-500">
                  Destino: {a.target === "Apartamento específico" ? `Apartamento ${a.apt}` : a.target}
                </div>
                <div className="mt-3 flex gap-2">
                  <Btn variant="danger" className="px-3 py-1.5" onClick={() => removeAnnouncement(a.id)}>Eliminar</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-bold">{editingId ? "Editar residente" : "Ingresar nuevo residente"}</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Apartamento / unidad">
            <Text list="resident-apartments-list" value={form.apt} onChange={e => setForm({ ...form, apt: e.target.value })} placeholder="Ej. 1A, A-01, Penthouse" />
            <datalist id="resident-apartments-list">{apartments.map(a => <option key={a.id} value={a.number}>{a.number} · {a.level}</option>)}</datalist>
          </Field>
          <Field label="Nombre completo"><Text value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="DNI / Identidad"><Text value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} /></Field>
          <Field label="Correo"><Text type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Teléfono"><Text value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Tipo">
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>Propietario</option>
              <option>Inquilino</option>
              <option>Apoderado</option>
              <option>Contacto autorizado</option>
            </select>
          </Field>
          <Field label="Estado">
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Pendiente</option>
            </select>
          </Field>
          <Field label="Notas"><Text value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={save}>{editingId ? "Guardar cambios" : "+ Agregar residente"}</Btn>
          {editingId && <Btn variant="outline" onClick={() => { setEditingId(null); setForm(empty); }}>Cancelar edición</Btn>}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="font-bold">Residentes registrados</h3>
          <input className="rounded-xl border px-3 py-2 text-sm" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, apto, DNI o correo" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(r => (
            <div key={r.id} className="rounded-2xl border bg-slate-50 p-4">
              <div className="flex justify-between gap-3">
                <div><b>{r.name}</b><div className="text-sm text-slate-500">Apto {r.apt} · {r.type}</div></div>
                <Badge tone={r.status === "Activo" ? "good" : r.status === "Pendiente" ? "warn" : "default"}>{r.status}</Badge>
              </div>
              <div className="mt-3 text-sm"><div><b>DNI:</b> {r.dni || "-"}</div><div><b>Correo:</b> {r.email || "-"}</div><div><b>Teléfono:</b> {r.phone || "-"}</div>{r.notes && <div><b>Notas:</b> {r.notes}</div>}</div>
              <div className="mt-3 flex gap-2"><Btn variant="secondary" className="px-3 py-1.5" onClick={() => edit(r)}>Editar</Btn><Btn variant="danger" className="px-3 py-1.5" onClick={() => remove(r.id)}>Eliminar</Btn></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function NeoVecinoMVP() {
  const [role, setRole] = useState(null);
  const [active, setActive] = useState("home");
  const [buildings, setBuildings] = useState(seedBuildings);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("canarias");
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [apartments, setApartments] = useState(() => [
    ...seedApartments.map(a => ({ ...a, buildingId: "canarias" })),
    { id: 101, buildingId: "lomas", number: "101", level: "Nivel 1", owner: "Sofía Andino", resident: "Sofía Andino", balance: 0, status: "Ocupado" },
    { id: 102, buildingId: "lomas", number: "102", level: "Nivel 1", owner: "Mario Castillo", resident: "Mario Castillo", balance: 75, status: "Ocupado" },
    { id: 201, buildingId: "lomas", number: "201", level: "Nivel 2", owner: "Diana Flores", resident: "", balance: 0, status: "Vacío" },
    { id: 301, buildingId: "centro", number: "301", level: "Nivel 3", owner: "Roberto Díaz", resident: "Roberto Díaz", balance: 160, status: "Ocupado" },
    { id: 302, buildingId: "centro", number: "302", level: "Nivel 3", owner: "Karla Mejía", resident: "Karla Mejía", balance: 0, status: "Ocupado" },
  ]);

  const [payments] = useState(() => [
    ...seedPayments.map(p => ({ ...p, buildingId: "canarias" })),
    { id: "pay-l-1", buildingId: "lomas", apt: "101", concept: "Cuota mantenimiento abril", amount: 110, status: "Pagado", date: "2026-04-04" },
    { id: "pay-l-2", buildingId: "lomas", apt: "102", concept: "Cuota mantenimiento abril", amount: 110, status: "Pendiente", date: "2026-04-01" },
    { id: "pay-c-1", buildingId: "centro", apt: "301", concept: "Cuota mantenimiento abril", amount: 95, status: "Vencido", date: "2026-04-01" },
  ]);

  const [visits, setAllVisits] = useState([]);
  const [visitLogs, setVisitLogs] = useState([]);

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

  const [announcements, setAllAnnouncements] = useState(() => [
    ...seedAnnouncements.map(a => ({ ...a, buildingId: "canarias" })),
  ]);

  const [appUsers, setAppUsers] = useState([]);


  function withTimeout(promise, ms = 10000, label = "operación") {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Tiempo de espera agotado al cargar ${label}.`)), ms)
      ),
    ]);
  }

  function resolveBuildingId(value) {
    const raw = String(value || "").trim();
    if (!raw) return "canarias";

    const byId = buildings.find(b => String(b.id).toLowerCase() === raw.toLowerCase());
    if (byId) return byId.id;

    const byName = buildings.find(b => String(b.name).toLowerCase() === raw.toLowerCase());
    if (byName) return byName.id;

    const known = raw.toLowerCase();
    if (["torre élite", "torre elite", "elite"].includes(known)) return "canarias";
    if (["torre infinito", "infinito"].includes(known)) return "centro";
    if (["torre centurión", "torre centurion", "centurion", "centurión"].includes(known)) return "lomas";

    return raw;
  }

  function normalizeProfile(row, user) {
    return {
      id: row.id,
      email: row.email || user?.email || "",
      fullName: row.full_name || row.email || user?.email || "Usuario",
      role: row.role,
      buildingId: resolveBuildingId(row.building_id || "canarias"),
      apt: row.apt || "",
      status: row.status || "Activo",
    };
  }

  async function loadUserProfile(user) {
    if (!user) return null;

    setAuthError("");

    let profileResult;

    try {
      profileResult = await withTimeout(
        supabase
          .from("app_users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),
        10000,
        "el perfil app_users"
      );
    } catch (error) {
      console.error("La consulta del perfil app_users tardó demasiado o falló:", error);
      setUserProfile(null);
      setRole(null);
      setAuthError("La app no pudo cargar el perfil del usuario desde Supabase. Revisa la conexión, las políticas RLS de app_users o intenta cerrar sesión y volver a entrar.");
      return null;
    }

    const { data, error } = profileResult;

    if (error || !data) {
      console.error("No se pudo cargar el perfil app_users:", error);
      setUserProfile(null);
      setRole(null);
      setAuthError("Tu usuario existe en Supabase Auth, pero aún no tiene perfil en app_users. Revisa que el UID esté creado en la tabla app_users.");
      return null;
    }

    if (data.status !== "Activo") {
      setUserProfile(null);
      setRole(null);
      setAuthError("Este usuario está inactivo. Contacta a administración.");
      return null;
    }

    const nextProfile = normalizeProfile(data, user);
    setUserProfile(nextProfile);
    setRole(nextProfile.role);
    setActive("home");
    setSelectedBuilding(nextProfile.buildingId || "canarias");
    return nextProfile;
  }

  async function handleLogin(user) {
    setAuthLoading(true);
    try {
      await loadUserProfile(user);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
    setRole(null);
    setActive("home");
    setSelectedBuilding("canarias");
  }

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setAuthLoading(true);
      setAuthError("");

      let sessionResult;

      try {
        sessionResult = await withTimeout(supabase.auth.getSession(), 10000, "la sesión de Supabase");
      } catch (error) {
        console.error("La verificación de sesión tardó demasiado o falló:", error);
        setAuthError("La app no pudo verificar la sesión. Refresca la página o intenta borrar la sesión del navegador.");
        setSession(null);
        setUserProfile(null);
        setRole(null);
        setAuthLoading(false);
        return;
      }

      const { data, error } = sessionResult;

      if (!mounted) return;

      if (error) {
        console.error("Error obteniendo sesión:", error);
        setAuthError("No se pudo verificar la sesión.");
        setAuthLoading(false);
        return;
      }

      const currentSession = data.session || null;
      setSession(currentSession);

      if (currentSession?.user) {
        await loadUserProfile(currentSession.user);
      } else {
        setUserProfile(null);
        setRole(null);
      }

      if (mounted) setAuthLoading(false);
    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession || null);

      try {
        if (nextSession?.user) {
          await loadUserProfile(nextSession.user);
        } else {
          setUserProfile(null);
          setRole(null);
          setActive("home");
          setSelectedBuilding("canarias");
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    async function loadCoreData() {
      setLoadingData(true);
      setDataError("");

      try {
        const [buildingsResult, apartmentsResult, residentsResult, appUsersResult] = await Promise.all([
          supabase.from("buildings").select("*").order("name"),
          supabase.from("apartments").select("*").order("number"),
          supabase.from("residents").select("*").order("name"),
          supabase.from("app_users").select("*").order("email"),
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
          resident: a.resident || "",
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

        if (!appUsersResult.error) {
          const dbAppUsers = (appUsersResult.data || []).map((u) => ({
            id: u.id,
            email: u.email,
            fullName: u.full_name || "",
            role: u.role,
            buildingId: u.building_id || "canarias",
            apt: u.apt || "",
            status: u.status || "Activo",
            createdAt: u.created_at,
          }));

          setAppUsers(dbAppUsers);
        } else {
          console.warn("No se pudieron cargar usuarios app_users desde Supabase:", appUsersResult.error);
        }

        if (dbBuildings.length) setBuildings(dbBuildings);
        if (dbApartments.length) setApartments(dbApartments);
        if (dbResidents.length) setAllResidents(dbResidents);

        const announcementsResult = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });

        if (!announcementsResult.error) {
          const dbAnnouncements = (announcementsResult.data || []).map((a) => ({
            id: a.id,
            buildingId: a.building_id,
            target: a.target,
            apt: a.apt || "",
            title: a.title,
            message: a.message,
            priority: a.priority || "Normal",
            status: a.status || "Enviado",
            createdAt: a.created_at,
          }));

          if (dbAnnouncements.length) setAllAnnouncements(dbAnnouncements);
        } else {
          console.warn("No se pudieron cargar anuncios desde Supabase:", announcementsResult.error);
        }

        const visitsResult = await supabase
          .from("visits")
          .select("*")
          .order("created_at", { ascending: false });

        if (!visitsResult.error) {
          setAllVisits((visitsResult.data || []).map(visitFromDb));
        } else {
          console.warn("No se pudieron cargar visitas desde Supabase:", visitsResult.error);
        }

        const visitLogsResult = await supabase
          .from("visit_logs")
          .select("*")
          .order("event_at", { ascending: false })
          .limit(200);

        if (!visitLogsResult.error) {
          setVisitLogs((visitLogsResult.data || []).map(visitLogFromDb));
        } else {
          console.warn("No se pudieron cargar visit_logs desde Supabase:", visitLogsResult.error);
        }
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
  const scopedVisitLogs = visitLogs.filter(belongs);
  const scopedReservations = reservations.filter(belongs);
  const scopedTickets = tickets.filter(belongs);
  const scopedDocs = docs.filter(belongs);
  const scopedResidents = residents.filter(belongs);
  const scopedAnnouncements = announcements.filter(belongs);
  const residentAptNumber = String(userProfile?.apt || "").trim();
  const residentApartmentFromDb = scopedApartments.find(a => String(a.number).trim().toLowerCase() === residentAptNumber.toLowerCase());
  const apt = ["resident", "owner"].includes(role)
    ? (
        residentApartmentFromDb || {
          id: `profile-${residentAptNumber || userProfile?.id || "resident"}`,
          buildingId: selectedBuilding,
          number: residentAptNumber || "Sin apartamento asignado",
          level: "",
          owner: "-",
          resident: userProfile?.fullName || userProfile?.email || "Residente",
          balance: 0,
          status: "Asignado",
        }
      )
    : (scopedApartments.find(a => a.number === "101") || scopedApartments[0] || seedApartments[0]);

  const scopedSetter = setter => nextList => {
    setter(prev => [
      ...prev.filter(item => (item.buildingId || "canarias") !== selectedBuilding),
      ...nextList.map(item => ({ ...item, buildingId: selectedBuilding })),
    ]);
  };

  if (authLoading) {
    return <AuthLoading />;
  }

  if (!session || !role || !userProfile) {
    return (
      <>
        <Login onLogin={handleLogin} />
        {authError && (
          <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 shadow-2xl ring-1 ring-rose-200">
            {authError}
          </div>
        )}
      </>
    );
  }

  const pages = {
    home: <HomePage role={role} apt={apt} apartments={scopedApartments} visits={scopedVisits} tickets={scopedTickets} reservations={scopedReservations} announcements={scopedAnnouncements} />,
    apartments: <ApartmentsAdmin apartments={scopedApartments} setApartments={scopedSetter(setApartments)} selectedBuilding={selectedBuilding} />,
    residents: <ResidentsAdmin residents={scopedResidents} setResidents={scopedSetter(setAllResidents)} apartments={scopedApartments} selectedBuilding={selectedBuilding} announcements={scopedAnnouncements} setAnnouncements={scopedSetter(setAllAnnouncements)} />,
    users: <UsersAdmin users={appUsers} setUsers={setAppUsers} buildings={buildings} apartments={apartments} selectedBuilding={selectedBuilding} currentUserId={userProfile?.id} />,
    payments: <Payments role={role} payments={scopedPayments} apartments={scopedApartments} aptNumber={residentAptNumber} />,
    visits: <Visits role={role} visits={scopedVisits} setVisits={scopedSetter(setAllVisits)} aptNumber={residentAptNumber} selectedBuilding={selectedBuilding} visitLogs={scopedVisitLogs} setVisitLogs={scopedSetter(setVisitLogs)} userProfile={userProfile} />,
    reservations: <Reservations role={role} reservations={scopedReservations} setReservations={scopedSetter(setAllReservations)} aptNumber={residentAptNumber} />,
    tickets: <Tickets role={role} tickets={scopedTickets} setTickets={scopedSetter(setAllTickets)} aptNumber={residentAptNumber} />,
    docs: <Docs role={role} docs={scopedDocs} setDocs={scopedSetter(setAllDocs)} />,
  };

  return (
    <Shell role={role} active={active} setActive={setActive} onLogout={handleLogout} userProfile={userProfile}>
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
