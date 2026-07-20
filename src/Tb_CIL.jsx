import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FileText, Bell, LogOut, Menu, Eye, X,
  Clock, CheckCircle2, XCircle,
  Shield, RefreshCw,
  BarChart3, ArrowUpRight, Inbox,
  User, Building2, Database,
  Lock, Globe, Video, Search,
  Info, Layers, KeyRound,
  CheckSquare, XSquare, AlertTriangle, MessageSquareWarning,
  Send, ShieldAlert
} from "lucide-react";

// ═══════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════
const BASE = "http://localhost:8080/api/cil-externe";
// Accès CIL externe : pas de login/JWT, authentification par header X-API-KEY.
// La clé n'est JAMAIS codée en dur ici — elle est saisie une fois par l'utilisateur
// et gardée uniquement en mémoire (état React) le temps de la session.
const authH = (apiKey) => ({
  "X-API-KEY": apiKey,
  "Content-Type": "application/json",
});

// ═══════════════════════════════════════════════════════
//  THÈME — cohérent avec le tableau de bord DG
// ═══════════════════════════════════════════════════════
const T = {
  sidebarBg: "#0F1D2E",
  sidebarBorder: "#1A2F47",
  sidebarText: "#7A9BB5",
  sidebarActive: "#1E4976",
  mainBg: "#F1F4F8",
  cardBg: "#FFFFFF",
  cardBorder: "#DDE3EC",
  cardShadow: "0 1px 4px rgba(15,29,46,0.07)",
  textPrimary: "#0F1D2E",
  textSecondary: "#3D5166",
  textMuted: "#8A9BB0",
  blue: "#1E4976",
  blueBg: "#EEF4FB",
  blueBorder: "#BFDBFE",
  green: "#15803D",
  greenBg: "#F0FDF4",
  greenBorder: "#86EFAC",
  red: "#B91C1C",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
  yellow: "#B45309",
  yellowBg: "#FFFBEB",
  yellowBorder: "#FDE68A",
  purple: "#6D28D9",
  purpleBg: "#F5F3FF",
  purpleBorder: "#C4B5FD",
  teal: "#0E7490",
  tealBg: "#ECFEFF",
  tealBorder: "#A5F3FC",
  gray: "#374151",
  grayBg: "#F8FAFC",
  grayBorder: "#E2E8F0",
  orange: "#C2410C",
  orangeBg: "#FFF7ED",
  orangeBorder: "#FED7AA",
};

// ═══════════════════════════════════════════════════════
//  COMPOSANTS ATOMIQUES
// ═══════════════════════════════════════════════════════
const Avatar = ({ initials, size = 36, bg = T.purpleBg, color = T.purple, border = T.purpleBorder }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", background: bg,
    border: `1.5px solid ${border}`, display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 700, fontSize: size * 0.34,
    color, flexShrink: 0, letterSpacing: "0.03em", fontFamily: "'DM Mono', monospace",
  }}>{initials}</div>
);

const Card = ({ children, style = {}, onClick, className = "" }) => (
  <div className={`cil-card ${className}`} onClick={onClick}
    style={{
      background: T.cardBg, border: `1px solid ${T.cardBorder}`,
      borderRadius: 12, boxShadow: T.cardShadow,
      cursor: onClick ? "pointer" : "default", ...style,
    }}>{children}</div>
);

const Badge = ({ type }) => {
  const map = {
    EN_ATTENTE: { bg: T.yellowBg, color: T.yellow, border: T.yellowBorder, label: "En attente DG" },
    APPROUVEE_DG: { bg: T.greenBg, color: T.green, border: T.greenBorder, label: "Approuvée DG" },
    REJETEE_DG: { bg: T.redBg, color: T.red, border: T.redBorder, label: "Rejetée DG" },
    EN_VERIFICATION_CIL: { bg: T.purpleBg, color: T.purple, border: T.purpleBorder, label: "À vérifier" },
    VALIDEE_CIL: { bg: T.tealBg, color: T.teal, border: T.tealBorder, label: "Conforme" },
    REJETEE_CIL: { bg: T.redBg, color: T.red, border: T.redBorder, label: "Non conforme" },
    BROUILLON: { bg: T.grayBg, color: T.gray, border: T.grayBorder, label: "Brouillon" },
    APPROUVEE: { bg: T.greenBg, color: T.green, border: T.greenBorder, label: "Approuvée" },
    REJETEE: { bg: T.redBg, color: T.red, border: T.redBorder, label: "Rejetée" },
    NORMALE: { bg: T.blueBg, color: T.blue, border: T.blueBorder, label: "Normale" },
    COLLECTE_SITE: { bg: T.tealBg, color: T.teal, border: T.tealBorder, label: "Site Internet" },
    VIDEO_SURVEILLANCE: { bg: T.purpleBg, color: T.purple, border: T.purpleBorder, label: "Vidéosurveillance" },
    AUTORISATION: { bg: T.yellowBg, color: T.yellow, border: T.yellowBorder, label: "Autorisation" },
    RECUE: { bg: T.yellowBg, color: T.yellow, border: T.yellowBorder, label: "Reçue" },
    EN_INSTRUCTION: { bg: T.blueBg, color: T.blue, border: T.blueBorder, label: "En instruction" },
    CLOTUREE: { bg: T.greenBg, color: T.green, border: T.greenBorder, label: "Clôturée" },
  };
  const s = map[type] || { bg: T.grayBg, color: T.gray, border: T.grayBorder, label: type || "—" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
      display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

const Btn = ({ children, onClick, variant = "outline", style = {}, disabled = false, type = "button" }) => {
  const base = {
    borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex",
    alignItems: "center", gap: 6, border: "none", opacity: disabled ? 0.55 : 1,
    transition: "all 0.15s", fontFamily: "inherit", ...style,
  };
  const v = {
    primary: { background: T.blue, color: "#fff" },
    success: { background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}` },
    danger: { background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}` },
    warning: { background: T.yellowBg, color: T.yellow, border: `1px solid ${T.yellowBorder}` },
    outline: { background: "transparent", color: T.textSecondary, border: `1px solid ${T.cardBorder}` },
    ghost: { background: "transparent", color: T.textMuted, border: "none" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...(v[variant] || v.outline) }}>
      {children}
    </button>
  );
};

const Spinner = ({ color = "#fff", size = 14 }) => (
  <span style={{
    width: size, height: size, border: `2px solid rgba(255,255,255,0.3)`,
    borderTopColor: color, borderRadius: "50%", display: "inline-block",
    animation: "spin 0.7s linear infinite",
  }} />
);

const PageHeader = ({ title, subtitle, children }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 3, letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ fontSize: 13, color: T.textMuted }}>{subtitle}</p>
    </div>
    {children && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>}
  </div>
);

// ═══════════════════════════════════════════════════════
//  ÉCRAN DE CONNEXION — saisie de la clé API (jamais en dur dans le code)
// ═══════════════════════════════════════════════════════
const EcranConnexion = ({ onConnect }) => {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) { setError("Merci de coller votre clé API CIL."); return; }
    setChecking(true);
    setError("");
    try {
      const r = await fetch(`${BASE}/declarations`, { headers: authH(value.trim()) });
      if (r.status === 401 || r.status === 403) {
        setError("Clé refusée. Vérifiez qu'elle est correcte et toujours active.");
        setChecking(false);
        return;
      }
      if (!r.ok) {
        setError(`Le serveur a répondu une erreur (${r.status}). Réessayez.`);
        setChecking(false);
        return;
      }
      onConnect(value.trim());
    } catch {
      setError("Connexion au serveur impossible. Vérifiez qu'il tourne sur localhost:8080.");
      setChecking(false);
    }
  };

  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(160deg, ${T.sidebarBg} 0%, #16283D 100%)`,
      fontFamily: "'Instrument Sans', 'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <form onSubmit={handleSubmit} style={{
        width: 420, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 18, padding: "36px 32px", backdropFilter: "blur(10px)",
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, background: "rgba(109,40,217,0.18)",
          border: "1px solid rgba(196,181,253,0.35)", display: "flex", alignItems: "center",
          justifyContent: "center", marginBottom: 18,
        }}>
          <Shield size={22} color="#C4B5FD" />
        </div>
        <h1 style={{ fontSize: 19, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>Accès CIL externe</h1>
        <p style={{ fontSize: 13, color: T.sidebarText, lineHeight: 1.6, marginBottom: 22 }}>
          Collez votre clé d'API CIL pour ouvrir le tableau de bord. Elle n'est jamais enregistrée :
          elle reste en mémoire le temps de cette session et disparaît si vous fermez l'onglet.
        </p>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <KeyRound size={15} color={T.sidebarText} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="password"
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="cil_live_…"
            style={{
              width: "100%", padding: "11px 12px 11px 36px", borderRadius: 10,
              border: `1px solid ${error ? "#F87171" : "rgba(255,255,255,0.15)"}`,
              background: "rgba(255,255,255,0.06)", color: "#F1F5F9", fontSize: 13,
              outline: "none", fontFamily: "'DM Mono', monospace",
            }}
          />
        </div>
        {error && (
          <div style={{ fontSize: 12, color: "#FCA5A5", marginBottom: 12, display: "flex", gap: 6, alignItems: "flex-start" }}>
            <AlertTriangle size={13} style={{ marginTop: 1, flexShrink: 0 }} /> {error}
          </div>
        )}
        <button type="submit" disabled={checking} style={{
          width: "100%", marginTop: 8, padding: "11px", borderRadius: 10, border: "none",
          background: "#1E4976", color: "#fff", fontWeight: 600, fontSize: 13, cursor: checking ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: checking ? 0.7 : 1,
        }}>
          {checking ? <><Spinner size={13} /> Vérification…</> : <>Se connecter</>}
        </button>
      </form>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  TOPBAR
// ═══════════════════════════════════════════════════════
const TopBar = ({ onToggle, onLogout }) => (
  <header style={{
    height: 56, background: T.sidebarBg, borderBottom: `1px solid ${T.sidebarBorder}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", flexShrink: 0, zIndex: 100,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={onToggle} style={{ background: "transparent", border: "none", color: T.sidebarText, cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}>
        <Menu size={18} />
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: "#3B2A6B", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={13} color="#C4B5FD" />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", letterSpacing: "0.04em" }}>
          SOFITEX — CIL (accès externe)
        </div>
      </div>
    </div>
    <button onClick={onLogout} title="Se déconnecter (oublie la clé)" style={{
      background: "transparent", border: "none", color: T.sidebarText, cursor: "pointer",
      padding: 7, borderRadius: 7, display: "flex", alignItems: "center", gap: 6, fontSize: 12,
    }}>
      <LogOut size={15} /> Déconnexion
    </button>
  </header>
);

// ═══════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════
const Sidebar = ({ active, setActive, collapsed, pendingCount, plaintesOuvertesCount }) => {
  const nav = [
    { id: "dashboard", label: "Tableau de bord", Icon: BarChart3 },
    { id: "a-verifier", label: "À vérifier", Icon: Inbox, badge: pendingCount },
    { id: "historique", label: "Historique", Icon: FileText },
    { id: "plaintes", label: "Plaintes → DPO", Icon: MessageSquareWarning, badge: plaintesOuvertesCount },
  ];
  return (
    <aside style={{
      width: collapsed ? 64 : 230, flexShrink: 0, background: T.sidebarBg,
      borderRight: `1px solid ${T.sidebarBorder}`, display: "flex", flexDirection: "column",
      transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden",
    }}>
      {!collapsed && (
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials="CIL" size={36} bg="#3B2A6B" color="#C4B5FD" border={T.sidebarBorder} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Système CIL externe
              </div>
              <div style={{ fontSize: 10, color: T.sidebarText, marginTop: 1 }}>Authentifié par clé API</div>
            </div>
          </div>
        </div>
      )}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {!collapsed && (
          <div style={{ fontSize: 9, fontWeight: 700, color: T.sidebarText, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 8px 10px" }}>
            Navigation
          </div>
        )}
        {nav.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} onClick={() => setActive(item.id)} className="nav-item"
              style={{
                display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
                padding: collapsed ? "11px 0" : "9px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 8, color: isActive ? "#FFFFFF" : T.sidebarText,
                background: isActive ? T.sidebarActive : "transparent",
                fontWeight: isActive ? 600 : 400, fontSize: 13, cursor: "pointer",
                position: "relative", marginBottom: 2, transition: "all 0.15s ease",
              }}>
              {isActive && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, background: "#93C5FD", borderRadius: "0 2px 2px 0" }} />}
              <item.Icon size={16} strokeWidth={isActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{ background: T.red, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge > 0 && (
                <span style={{ position: "absolute", top: 6, right: 8, width: 7, height: 7, background: T.red, borderRadius: "50%" }} />
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

// ═══════════════════════════════════════════════════════
//  ICÔNE PAR TYPE DE DÉCLARATION
// ═══════════════════════════════════════════════════════
const TypeIcon = ({ type, size = 16 }) => {
  const map = {
    NORMALE: <FileText size={size} color={T.blue} />,
    COLLECTE_SITE: <Globe size={size} color={T.teal} />,
    VIDEO_SURVEILLANCE: <Video size={size} color={T.purple} />,
    AUTORISATION: <Shield size={size} color={T.yellow} />,
  };
  return map[type] || <FileText size={size} color={T.gray} />;
};

// ═══════════════════════════════════════════════════════
//  DÉTAIL
// ═══════════════════════════════════════════════════════
const DetailRow = ({ label, value, full = false }) => {
  if (!value && value !== false && value !== 0) return null;
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.textMuted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500, lineHeight: 1.5 }}>
        {typeof value === "boolean" ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: value ? T.green : T.red }}>
            {value ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {value ? "Oui" : "Non"}
          </span>
        ) : value}
      </div>
    </div>
  );
};

const SectionBloc = ({ icon: Icon, color, bg, border, title, children }) => (
  <div style={{ border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
    <div style={{ background: bg, padding: "10px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
      <Icon size={14} color={color} />
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.07em", textTransform: "uppercase" }}>{title}</span>
    </div>
    <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
      {children}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════
//  MODALE : VOIR + VALIDER / REJETER LA CONFORMITÉ
// ═══════════════════════════════════════════════════════
const ModalDeclaration = ({ apiKey, declaration, onClose, onValider, onRejeter }) => {
  const [motif, setMotif] = useState("");
  const [showRejet, setShowRejet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullData, setFullData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${BASE}/declarations/${declaration.idDeclaration}`, { headers: authH(apiKey) });
        if (r.ok) setFullData(await r.json());
        else setFullData(declaration);
      } catch { setFullData(declaration); }
      finally { setLoadingDetail(false); }
    };
    load();
  }, [declaration.idDeclaration]);

  const d = fullData || declaration;
  const canAct = d.statut === "EN_VERIFICATION_CIL";

  const handleValider = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/declarations/${d.idDeclaration}/valider`, {
        method: "PUT",
        headers: authH(apiKey),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.message || e.erreur || `Erreur ${r.status}`);
      }
      const updated = await r.json();
      onValider(updated);
      onClose();
      toast.success(`Déclaration #${d.idDeclaration} validée conforme`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejeter = async () => {
    if (!motif.trim()) { toast.error("Le motif de rejet est obligatoire"); return; }
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/declarations/${d.idDeclaration}/rejeter`, {
        method: "PUT",
        headers: authH(apiKey),
        body: JSON.stringify({ motif }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.message || e.erreur || `Erreur ${r.status}`);
      }
      const updated = await r.json();
      onRejeter(updated);
      onClose();
      toast.success(`Déclaration #${d.idDeclaration} rejetée pour non-conformité`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,29,46,0.55)", zIndex: 900, backdropFilter: "blur(3px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 901, width: 720, maxHeight: "92vh", overflowY: "auto",
        background: T.cardBg, borderRadius: 16,
        boxShadow: "0 32px 80px rgba(15,29,46,0.28)", border: `1px solid ${T.cardBorder}`,
      }}>
        <div style={{
          padding: "18px 24px 14px", borderBottom: `1px solid ${T.cardBorder}`,
          position: "sticky", top: 0, background: T.cardBg, zIndex: 1,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TypeIcon type={d.typeDeclaration} size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>
              Déclaration #{d.idDeclaration}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, display: "flex", gap: 10, marginTop: 2, flexWrap: "wrap" }}>
              <span>Soumis le {d.dateSoumission}</span>
              {d.dpoNomPrenom && <span>· DPO : {d.dpoNomPrenom}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge type={d.statut} />
            {d.typeDeclaration && <Badge type={d.typeDeclaration} />}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, display: "flex", padding: 4 }}><X size={16} /></button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {loadingDetail && (
            <div style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Chargement des détails…</div>
          )}
          {!loadingDetail && (
            <>
              <SectionBloc icon={User} color={T.blue} bg={T.blueBg} border={T.blueBorder} title="Identification & Responsable">
                <DetailRow label="Responsable déclaration" value={d.responsableDeclaration} />
                <DetailRow label="Contact confidentialité" value={d.contactConfidentialite} />
                <DetailRow label="Secteur d'activité" value={d.secteur} />
                <DetailRow label="Nature de la demande" value={d.natureDemande} />
                <DetailRow label="Date mise en œuvre" value={d.dateMiseEnOeuvre} />
                <DetailRow label="Durée de conservation" value={d.dureeConservation} />
              </SectionBloc>

              <SectionBloc icon={Database} color={T.teal} bg={T.tealBg} border={T.tealBorder} title="Données traitées">
                <DetailRow label="Catégories de données" value={d.categoriesDonnees} full />
                <DetailRow label="Origine des données" value={d.origineDonnees} full />
                <DetailRow label="Lieu de stockage" value={d.lieuStockage} />
                <DetailRow label="Transfert vers l'étranger" value={d.transfertPaysEtranger} />
                {d.transfertPaysEtranger && <DetailRow label="Pays de destination" value={d.paysDestination} />}
              </SectionBloc>

              <SectionBloc icon={Lock} color={T.purple} bg={T.purpleBg} border={T.purpleBorder} title="Sécurité & Accès">
                <DetailRow label="Mesures de sécurité" value={d.mesuresSecurite} full />
                <DetailRow label="Catégories d'accès" value={d.categoriesPersonnesAcces} />
                <DetailRow label="Politique accès bâtiments" value={d.politiqueAccesBatiments} />
                <DetailRow label="Sensibilisation personnel" value={d.mesuresSensibilisation} />
                <DetailRow label="Sous-traitance" value={d.recoursSousTraitant} />
                {d.recoursSousTraitant && <DetailRow label="Contrat confidentialité ST" value={d.contratConfidentialiteSousTraitant} />}
                <DetailRow label="Communication externe" value={d.communicationAutresOrganismes} />
                {d.communicationAutresOrganismes && (
                  <>
                    <DetailRow label="Destinataire" value={d.destinataireNom} />
                    <DetailRow label="Finalité communication" value={d.finaliteCommunication} />
                  </>
                )}
              </SectionBloc>

              <SectionBloc icon={Shield} color={T.green} bg={T.greenBg} border={T.greenBorder} title="Droits des personnes">
                <DetailRow label="Moyens d'information" value={d.moyensInformationDroits} />
                <DetailRow label="Moyens d'exercice" value={d.moyensExerciceDroits} />
                <DetailRow label="Coordonnées exercice" value={d.coordonneesExerciceDroits} />
                <DetailRow label="Délai de réponse" value={d.delaiCommunicationDroits} />
                <DetailRow label="Nom responsable CIL" value={d.nomPrenomResponsable} />
                <DetailRow label="Fonction" value={d.fonctionResponsable} />
              </SectionBloc>

              {d.traitementId && (
                <SectionBloc icon={Layers} color={T.gray} bg={T.grayBg} border={T.grayBorder} title="Traitement associé">
                  <DetailRow label="ID Traitement" value={`#${d.traitementId}`} />
                  <DetailRow label="Description" value={d.traitementDescription} />
                </SectionBloc>
              )}
            </>
          )}
        </div>

        {canAct && (
          <div style={{ padding: "0 24px 24px" }}>
            {showRejet ? (
              <div style={{ background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.red, marginBottom: 10, display: "flex", gap: 6, alignItems: "center" }}>
                  <AlertTriangle size={14} /> Motif de non-conformité
                </div>
                <textarea
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  placeholder="Expliquez précisément en quoi cette déclaration n'est pas conforme…"
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.redBorder}`, fontSize: 13, color: T.textPrimary, background: "#fff", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                  <Btn onClick={() => setShowRejet(false)}>Annuler</Btn>
                  <Btn variant="danger" onClick={handleRejeter} disabled={loading || !motif.trim()}>
                    {loading ? <><Spinner color={T.red} size={12} /> Rejet…</> : <><XSquare size={13} /> Confirmer le rejet</>}
                  </Btn>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: `1px solid ${T.cardBorder}` }}>
                <div style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                  <Info size={13} /> En attente de votre vérification de conformité
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="danger" onClick={() => setShowRejet(true)}>
                    <XCircle size={13} /> Non conforme
                  </Btn>
                  <Btn variant="success" onClick={handleValider} disabled={loading}>
                    {loading ? <><Spinner color={T.green} size={12} /> Validation…</> : <><CheckSquare size={13} /> Valider conforme</>}
                  </Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {!canAct && (
          <div style={{ padding: "14px 24px 20px", borderTop: `1px solid ${T.cardBorder}`, display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={onClose}>Fermer</Btn>
          </div>
        )}
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  CARTE DÉCLARATION
// ═══════════════════════════════════════════════════════
const DeclarationCard = ({ d, onView }) => {
  const typeLabel = { NORMALE: "Déclaration normale", COLLECTE_SITE: "Site Internet", VIDEO_SURVEILLANCE: "Vidéosurveillance", AUTORISATION: "Autorisation" };
  const isPending = d.statut === "EN_VERIFICATION_CIL";

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{
          width: 4, flexShrink: 0,
          background: isPending ? T.purple : d.statut === "VALIDEE_CIL" ? T.green : T.red,
          borderRadius: "0 0 0 12px",
        }} />
        <div style={{ flex: 1, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: T.grayBg, border: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TypeIcon type={d.typeDeclaration} size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Déclaration #{d.idDeclaration}</span>
                  <Badge type={d.statut} />
                  {d.typeDeclaration && <Badge type={d.typeDeclaration} />}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted }}>
                  {typeLabel[d.typeDeclaration] || "—"} · Soumis le {d.dateSoumission || "—"}
                </div>
              </div>
            </div>
            <Btn onClick={() => onView(d)} variant="outline" style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}>
              <Eye size={13} /> Consulter
            </Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 16px", padding: "10px 0", borderTop: `1px solid ${T.grayBg}` }}>
            <div>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>DPO</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{d.dpoNomPrenom || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Responsable</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{d.responsableDeclaration || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Secteur</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{d.secteur || "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
//  CARTE HISTORIQUE (HistoriqueDeclarationResponse — champs réduits)
// ═══════════════════════════════════════════════════════
const HistoriqueCard = ({ h }) => (
  <Card style={{ padding: 0, overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{
        width: 4, flexShrink: 0,
        background: h.statut === "VALIDEE_CIL" ? T.green : h.statut === "REJETEE_CIL" ? T.red : T.gray,
      }} />
      <div style={{ flex: 1, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: T.grayBg, border: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TypeIcon type={h.typeDeclaration} size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>
              Déclaration #{h.idDeclaration} {h.intitule ? `— ${h.intitule}` : ""}
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {h.responsableDeclaration || "—"} · {h.dateDeclaration || "—"}
            </div>
          </div>
        </div>
        <Badge type={h.statut} />
      </div>
    </div>
  </Card>
);

// ═══════════════════════════════════════════════════════
//  SECTION : TABLEAU DE BORD
// ═══════════════════════════════════════════════════════
const SectionDashboard = ({ aVerifier, historique, plaintes, setSection }) => {
  const conformes = historique.filter(h => h.statut === "VALIDEE_CIL");
  const nonConformes = historique.filter(h => h.statut === "REJETEE_CIL");
  const plaintesOuvertes = plaintes.filter(p => p.statutPlainte !== "CLOTUREE");

  const allDecls = [...aVerifier, ...historique];
  const typeStats = ["NORMALE", "COLLECTE_SITE", "VIDEO_SURVEILLANCE", "AUTORISATION"].map(t => ({
    type: t,
    count: allDecls.filter(d => d.typeDeclaration === t).length,
  }));

  const stats = [
    { label: "À vérifier", value: aVerifier.length, sub: "conformité en attente", color: T.purple, bg: T.purpleBg, border: T.purpleBorder, Icon: Clock, section: "a-verifier" },
    { label: "Conformes", value: conformes.length, sub: "validées par la CIL", color: T.green, bg: T.greenBg, border: T.greenBorder, Icon: CheckCircle2, section: "historique" },
    { label: "Non conformes", value: nonConformes.length, sub: "renvoyées pour correction", color: T.red, bg: T.redBg, border: T.redBorder, Icon: XCircle, section: "historique" },
    { label: "Plaintes ouvertes", value: plaintesOuvertes.length, sub: "en attente du DPO", color: T.orange, bg: T.orangeBg, border: T.orangeBorder, Icon: ShieldAlert, section: "plaintes" },
  ];

  return (
    <div className="slide-in">
      <PageHeader
        title="Tableau de bord CIL"
        subtitle={`Accès externe — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Card key={i} onClick={() => setSection(s.section)} className="card-hover" style={{ padding: "18px 20px", position: "relative", overflow: "hidden", cursor: "pointer" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: "12px 12px 0 0" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                <s.Icon size={18} strokeWidth={1.8} />
              </div>
              <ArrowUpRight size={13} color={s.color} style={{ opacity: 0.4, marginTop: 4 }} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, fontFamily: "'DM Mono', monospace", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 5, fontWeight: 500 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Inbox size={15} color={T.purple} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>À vérifier</h3>
              {aVerifier.length > 0 && (
                <span style={{ background: T.purple, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>{aVerifier.length}</span>
              )}
            </div>
            <button onClick={() => setSection("a-verifier")} style={{ fontSize: 12, color: T.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>
          </div>
          <div>
            {aVerifier.length === 0 && (
              <div style={{ padding: "32px 24px", textAlign: "center" }}>
                <CheckCircle2 size={28} color={T.green} style={{ display: "block", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: T.textMuted }}>Aucune déclaration à vérifier</p>
              </div>
            )}
            {aVerifier.slice(0, 4).map((d, i) => (
              <div key={d.idDeclaration} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < Math.min(aVerifier.length, 4) - 1 ? `1px solid ${T.grayBg}` : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: T.purpleBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock size={14} color={T.purple} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    #{d.idDeclaration} — {d.dpoNomPrenom || "DPO"}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{d.dateSoumission} · {d.typeDeclaration || "—"}</div>
                </div>
                <Badge type={d.typeDeclaration} />
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart3 size={15} color={T.blue} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Répartition par type</h3>
            </div>
          </div>
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {typeStats.map(({ type, count }) => {
              const total = allDecls.length || 1;
              const pct = Math.round((count / total) * 100);
              const colors = { NORMALE: T.blue, COLLECTE_SITE: T.teal, VIDEO_SURVEILLANCE: T.purple, AUTORISATION: T.yellow };
              const labels = { NORMALE: "Normale", COLLECTE_SITE: "Site Internet", VIDEO_SURVEILLANCE: "Vidéosurveillance", AUTORISATION: "Autorisation" };
              const col = colors[type] || T.gray;
              return (
                <div key={type}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: T.textSecondary, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                      <TypeIcon type={type} size={13} /> {labels[type]}
                    </span>
                    <span style={{ fontWeight: 700, color: col, fontFamily: "'DM Mono', monospace" }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: T.grayBg, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 3, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
            {allDecls.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: "center" }}>Aucune déclaration</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : DÉCLARATIONS À VÉRIFIER
// ═══════════════════════════════════════════════════════
const SectionAVerifier = ({ apiKey, declarations, setDeclarations, onHistoriqueChange }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/declarations`, { headers: authH(apiKey) });
      if (!r.ok) throw new Error(`Erreur ${r.status}`);
      const data = await r.json();
      setDeclarations(data);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [apiKey, setDeclarations]);

  useEffect(() => { load(); }, [load]);

  const filtered = declarations.filter(d => {
    const matchSearch = !search.trim() ||
      String(d.idDeclaration).includes(search) ||
      (d.dpoNomPrenom || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.responsableDeclaration || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || d.typeDeclaration === filterType;
    return matchSearch && matchType;
  });

  const remove = (updated) => {
    setDeclarations(prev => prev.filter(d => d.idDeclaration !== updated.idDeclaration));
    if (onHistoriqueChange) onHistoriqueChange();
  };

  return (
    <div className="slide-in">
      {selected && (
        <ModalDeclaration
          apiKey={apiKey}
          declaration={selected}
          onClose={() => setSelected(null)}
          onValider={remove}
          onRejeter={remove}
        />
      )}
      <PageHeader
        title="Déclarations à vérifier"
        subtitle={`${declarations.length} déclaration(s) approuvée(s) par la DG, en attente de conformité`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={T.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: "7px 12px 7px 30px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, outline: "none", fontFamily: "inherit", width: 200 }}
            />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, fontFamily: "inherit", outline: "none" }}>
            <option value="all">Tous les types</option>
            <option value="NORMALE">Normale</option>
            <option value="COLLECTE_SITE">Site Internet</option>
            <option value="VIDEO_SURVEILLANCE">Vidéosurveillance</option>
            <option value="AUTORISATION">Autorisation</option>
          </select>
        </div>
        <Btn variant="outline" onClick={load}><RefreshCw size={13} /> Rafraîchir</Btn>
      </PageHeader>

      {declarations.length > 0 && (
        <div style={{ background: T.purpleBg, border: `1px solid ${T.purpleBorder}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.purple }}>
          <Info size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong>Workflow :</strong> ces déclarations ont été approuvées par la DG. En validant, elles deviennent conformes. En rejetant, un motif est requis.
          </span>
        </div>
      )}

      {loading && <Card style={{ padding: 40, textAlign: "center" }}><div style={{ color: T.textMuted, fontSize: 13 }}>Chargement…</div></Card>}
      {!loading && declarations.length === 0 && (
        <Card style={{ padding: 60, textAlign: "center" }}>
          <CheckCircle2 size={48} color={T.green} style={{ display: "block", margin: "0 auto 16px", opacity: 0.4 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>File d'attente vide</div>
          <p style={{ fontSize: 13, color: T.textMuted }}>Aucune déclaration en attente de vérification de conformité.</p>
        </Card>
      )}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(d => (
            <DeclarationCard key={d.idDeclaration} d={d} onView={setSelected} />
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && declarations.length > 0 && (
        <Card style={{ padding: 40, textAlign: "center" }}><p style={{ fontSize: 13, color: T.textMuted }}>Aucun résultat pour ce filtre.</p></Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : HISTORIQUE
// ═══════════════════════════════════════════════════════
const SectionHistorique = ({ apiKey, historique, setHistorique }) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/declarations/historique`, { headers: authH(apiKey) });
      if (!r.ok) throw new Error(`Erreur ${r.status}`);
      const data = await r.json();
      setHistorique(data);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [apiKey, setHistorique]);

  useEffect(() => { load(); }, [load]);

  const filtered = historique.filter(h => {
    const matchSearch = !search.trim() ||
      String(h.idDeclaration).includes(search) ||
      (h.responsableDeclaration || "").toLowerCase().includes(search.toLowerCase()) ||
      (h.intitule || "").toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "all" || h.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <div className="slide-in">
      <PageHeader
        title="Historique des vérifications"
        subtitle={`${historique.length} déclaration(s) traitée(s) avec cette clé API`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={T.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: "7px 12px 7px 30px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, outline: "none", fontFamily: "inherit", width: 200 }}
            />
          </div>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, fontFamily: "inherit", outline: "none" }}>
            <option value="all">Tous les statuts</option>
            <option value="VALIDEE_CIL">Conformes</option>
            <option value="REJETEE_CIL">Non conformes</option>
          </select>
        </div>
        <Btn variant="outline" onClick={load}><RefreshCw size={13} /> Rafraîchir</Btn>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Validées conformes", statut: "VALIDEE_CIL", color: T.green },
          { label: "Rejetées non conformes", statut: "REJETEE_CIL", color: T.red },
        ].map(s => (
          <Card key={s.statut}
            onClick={() => setFilterStatut(filterStatut === s.statut ? "all" : s.statut)}
            className="card-hover"
            style={{ padding: "12px 14px", cursor: "pointer", border: filterStatut === s.statut ? `2px solid ${s.color}` : `1px solid ${T.cardBorder}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>
              {historique.filter(h => h.statut === s.statut).length}
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {loading && <Card style={{ padding: 40, textAlign: "center" }}><div style={{ color: T.textMuted, fontSize: 13 }}>Chargement…</div></Card>}
      {!loading && historique.length === 0 && (
        <Card style={{ padding: 48, textAlign: "center" }}>
          <FileText size={36} color={T.textMuted} style={{ display: "block", margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontSize: 13, color: T.textMuted }}>Aucune déclaration dans l'historique.</p>
        </Card>
      )}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(h => <HistoriqueCard key={h.idHistorique || h.idDeclaration} h={h} />)}
        </div>
      )}
      {!loading && filtered.length === 0 && historique.length > 0 && (
        <Card style={{ padding: 40, textAlign: "center" }}><p style={{ fontSize: 13, color: T.textMuted }}>Aucun résultat pour ce filtre.</p></Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : PLAINTES CIL → DPO
// ═══════════════════════════════════════════════════════
const SectionPlaintes = ({ apiKey, plaintes, setPlaintes }) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ objetPlainte: "", descriptionPlainte: "", lieu: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/plaintes`, { headers: authH(apiKey) });
      if (!r.ok) throw new Error(`Erreur ${r.status}`);
      setPlaintes(await r.json());
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [apiKey, setPlaintes]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.objetPlainte.trim() || !form.descriptionPlainte.trim()) {
      toast.error("L'objet et la description sont obligatoires");
      return;
    }
    setSending(true);
    try {
      const r = await fetch(`${BASE}/plaintes`, {
        method: "POST",
        headers: authH(apiKey),
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e2 = await r.json().catch(() => ({}));
        throw new Error(e2.message || `Erreur ${r.status}`);
      }
      const created = await r.json();
      setPlaintes(prev => [created, ...prev]);
      setForm({ objetPlainte: "", descriptionPlainte: "", lieu: "" });
      setShowForm(false);
      toast.success("Plainte envoyée au DPO");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="slide-in">
      <PageHeader
        title="Plaintes vers le DPO"
        subtitle={`${plaintes.length} plainte(s) émise(s) avec cette clé API`}
      >
        <Btn variant="outline" onClick={load}><RefreshCw size={13} /> Rafraîchir</Btn>
        <Btn variant="primary" onClick={() => setShowForm(v => !v)}>
          <Send size={13} /> {showForm ? "Fermer" : "Nouvelle plainte"}
        </Btn>
      </PageHeader>

      {showForm && (
        <Card style={{ padding: 20, marginBottom: 20 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Objet *</label>
                <input
                  value={form.objetPlainte}
                  onChange={e => setForm(f => ({ ...f, objetPlainte: e.target.value }))}
                  placeholder="Ex : Non-respect des délais de conservation"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Lieu concerné</label>
                <input
                  value={form.lieu}
                  onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))}
                  placeholder="Ex : Siège Bobo-Dioulasso"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Description détaillée *</label>
              <textarea
                value={form.descriptionPlainte}
                onChange={e => setForm(f => ({ ...f, descriptionPlainte: e.target.value }))}
                rows={4}
                placeholder="Décrivez précisément le manquement constaté…"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setShowForm(false)}>Annuler</Btn>
              <Btn type="submit" variant="primary" disabled={sending}>
                {sending ? <><Spinner size={12} /> Envoi…</> : <><Send size={13} /> Envoyer au DPO</>}
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {loading && <Card style={{ padding: 40, textAlign: "center" }}><div style={{ color: T.textMuted, fontSize: 13 }}>Chargement…</div></Card>}
      {!loading && plaintes.length === 0 && (
        <Card style={{ padding: 48, textAlign: "center" }}>
          <MessageSquareWarning size={36} color={T.textMuted} style={{ display: "block", margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontSize: 13, color: T.textMuted }}>Aucune plainte émise pour le moment.</p>
        </Card>
      )}
      {!loading && plaintes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {plaintes.map(p => (
            <Card key={p.idPlainte} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <div style={{ width: 4, flexShrink: 0, background: p.statutPlainte === "CLOTUREE" ? T.green : p.statutPlainte === "EN_INSTRUCTION" ? T.blue : T.yellow }} />
                <div style={{ flex: 1, padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{p.objetPlainte}</div>
                    <Badge type={p.statutPlainte} />
                  </div>
                  <p style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5, marginBottom: 8 }}>{p.descriptionPlainte}</p>
                  <div style={{ fontSize: 11, color: T.textMuted, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>Émise le {p.datePlainte}</span>
                    {p.lieu && <span>· {p.lieu}</span>}
                    {p.dpoNomComplet && <span>· DPO : {p.dpoNomComplet}</span>}
                  </div>
                  {p.decisionCil !== undefined && p.decisionCil && (
                    <div style={{ marginTop: 10, padding: "10px 12px", background: T.grayBg, borderRadius: 8, fontSize: 12, color: T.textSecondary }}>
                      <strong style={{ color: T.textPrimary }}>Réponse : </strong>{p.decisionCil}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  APP PRINCIPALE
// ═══════════════════════════════════════════════════════
export default function Tb_CIL() {
  const [apiKey, setApiKey] = useState(null);
  const [section, setSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const [aVerifier, setAVerifier] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [plaintes, setPlaintes] = useState([]);
  const [histLoadTrigger, setHistLoadTrigger] = useState(0);

  // Chargement initial une fois connecté
  useEffect(() => {
    if (!apiKey) return;
    const load = async () => {
      try {
        const r = await fetch(`${BASE}/declarations`, { headers: authH(apiKey) });
        if (r.ok) setAVerifier(await r.json());
      } catch { }
      try {
        const r2 = await fetch(`${BASE}/declarations/historique`, { headers: authH(apiKey) });
        if (r2.ok) setHistorique(await r2.json());
      } catch { }
      try {
        const r3 = await fetch(`${BASE}/plaintes`, { headers: authH(apiKey) });
        if (r3.ok) setPlaintes(await r3.json());
      } catch { }
    };
    load();
  }, [apiKey]);

  const handleHistoriqueChange = () => setHistLoadTrigger(t => t + 1);

  const handleLogout = () => {
    setApiKey(null);
    setSection("dashboard");
    setAVerifier([]);
    setHistorique([]);
    setPlaintes([]);
  };

  if (!apiKey) {
    return <EcranConnexion onConnect={setApiKey} />;
  }

  const plaintesOuvertesCount = plaintes.filter(p => p.statutPlainte !== "CLOTUREE").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Instrument Sans', 'DM Sans', system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDE3EC; border-radius: 4px; }
        .slide-in { animation: slideIn 0.22s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .cil-card { transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s; }
        .card-hover:hover { box-shadow: 0 6px 20px rgba(15,29,46,0.1) !important; transform: translateY(-1px); }
        .nav-item:hover { background: rgba(255,255,255,0.05) !important; color: #E2E8F0 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <TopBar onToggle={() => setCollapsed(c => !c)} onLogout={handleLogout} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          active={section} setActive={setSection}
          collapsed={collapsed}
          pendingCount={aVerifier.length}
          plaintesOuvertesCount={plaintesOuvertesCount}
        />
        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px", background: T.mainBg }}>
          {section === "dashboard" && (
            <SectionDashboard
              aVerifier={aVerifier}
              historique={historique}
              plaintes={plaintes}
              setSection={setSection}
            />
          )}
          {section === "a-verifier" && (
            <SectionAVerifier
              apiKey={apiKey}
              declarations={aVerifier}
              setDeclarations={setAVerifier}
              onHistoriqueChange={handleHistoriqueChange}
            />
          )}
          {section === "historique" && (
            <SectionHistorique
              apiKey={apiKey}
              historique={historique}
              setHistorique={setHistorique}
              key={`hist-${histLoadTrigger}`}
            />
          )}
          {section === "plaintes" && (
            <SectionPlaintes
              apiKey={apiKey}
              plaintes={plaintes}
              setPlaintes={setPlaintes}
            />
          )}
        </main>
      </div>
    </div>
  );
}
