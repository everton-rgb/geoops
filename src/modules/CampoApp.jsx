/* ============================================================================
 * GeoópS · MODO CAMPO (V2 — F1) — app do líder de campo (PWA instalável)
 * ============================================================================
 * Jornada guiada do dia: check-in de chegada (GPS + selfie + foto dos
 * equipamentos + cerca eletrônica) → checkout almoço → check-in retorno →
 * checkout de saída com o RDO completo (vai para validação do Gestor de
 * Operações na aba RDOs do GeoópS).
 * Offline-first: tudo grava no estado local (persist), que já sincroniza com
 * o Supabase quando há conexão — sem sinal, os eventos ficam salvos no
 * dispositivo e sobem sozinhos depois.
 * ========================================================================== */
import React, { useState, useRef, useEffect } from "react";
import { T } from "../constants/base.js";
import { ATIVIDADES, UNID_PROD } from "../constants/atividades.js";
import { tokenAtual } from "../services/supabase.js";
import { enfileirarFoto, subirFilaFotos, filaFotos } from "../services/fotos.js";

const hojeISO = () => new Date().toISOString().slice(0, 10);
const horaAgora = () => new Date().toTimeString().slice(0, 5);
const fmtData = (iso) => { if (!iso) return "—"; const [a, m, d] = iso.split("-"); return `${d}/${m}/${a}`; };
const RAIO_PADRAO_M = 500;
const VERSAO_GEOFIELDS = "V1.3";
const DIFICULDADES = [["equip", "🔧 Equipamento com defeito / manutenção"], ["acesso", "🚧 Acesso difícil ao local"], ["clima", "🌧 Clima atrapalhou"], ["espera", "⏳ Espera de terceiros / cliente"], ["material", "📦 Faltou material / insumo"], ["outra", "✍️ Outra dificuldade"]];

/* distância Haversine em metros */
const distM = (lat1, lng1, lat2, lng2) => {
  const R = 6371000, rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
};
const pegarGPS = () => new Promise((resolve) => {
  if (!navigator.geolocation) { resolve(null); return; }
  navigator.geolocation.getCurrentPosition(
    (p) => resolve({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6), precisao: Math.round(p.coords.accuracy || 0) }),
    () => resolve(null),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
  );
});
/* comprime a foto no cliente (~640px JPEG) para não inflar a base */
const comprimirFoto = (file, max = 640, qual = 0.6) => new Promise((resolve) => {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const esc = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * esc); cv.height = Math.round(img.height * esc);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL("image/jpeg", qual));
    };
    img.onerror = () => resolve(null);
    img.src = r.result;
  };
  r.readAsDataURL(file);
});

const btn = (cor, cheio = true) => ({ width: "100%", border: cheio ? "none" : `2px solid ${cor}`, background: cheio ? cor : "#fff", color: cheio ? "#fff" : cor, borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" });
const cardS = { background: "#fff", borderRadius: 14, padding: "16px 18px", marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,.06)" };
const inputS = { width: "100%", boxSizing: "border-box", border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 12px", fontSize: 15, fontFamily: "inherit" };

/* Passo da jornada — em escopo de MÓDULO (dentro do componente, era recriado a cada
   render e o teclado fechava a cada dígito digitado). */
const Passo = ({ num, feito, atual, titulo, evento, children }) => (
  <div style={{ ...cardS, opacity: feito || atual ? 1 : 0.45, border: atual ? `2px solid ${T.green700}` : "none" }}>
    <div style={{ fontWeight: 800, fontSize: 15, color: feito ? T.green700 : T.green900, marginBottom: atual ? 10 : 0 }}>
      {feito ? "✅" : num} {titulo} {feito && evento?.hora ? <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>· {evento.hora}{evento.dentroCerca === false ? " ⚠ fora da cerca" : ""}{evento.foraJanela ? " ⏰ fora da janela" : ""}</span> : null}
    </div>
    {atual && children}
  </div>
);

export default function ModoCampo({ user, data, persist, onSair, versao }) {
  const colaboradores = data.colaboradores || [];
  const [matSel, setMatSelRaw] = useState(user.mat || (typeof localStorage !== "undefined" && localStorage.getItem("geofields_mat")) || "");
  const setMatSel = (m) => { setMatSelRaw(m); try { if (m) localStorage.setItem("geofields_mat", m); } catch (e) { /* ignora */ } };
  const colab = colaboradores.find((c) => c.mat === matSel);
  const ordens = data.ordens || {};
  const taps = data.taps || [];
  const meus = Object.entries(ordens).filter(([, os]) => os.status === "Aprovada" && (os.equipe || []).some((e) => !e.vazio && e.mat === matSel));
  const [idgeoSel, setIdgeoSel] = useState("");
  const idgeo = idgeoSel || (meus[0] || [])[0] || "";
  const os = ordens[idgeo];
  const tap = taps.find((t) => t.idgeo === idgeo);
  const hoje = hojeISO();
  const regDia = (((data.campoEventos || {})[matSel] || {})[hoje] || {});
  const etapa = !regDia.checkin ? "checkin" : !regDia.almoco ? "almoco" : !regDia.retorno ? "retorno" : !regDia.saida ? "saida" : "fim";
  const [ocupado, setOcupado] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const [fotoEquip, setFotoEquip] = useState(null);
  const selfieRef = useRef(null), equipRef = useRef(null);
  /* RDO do checkout de saída */
  const [rdo, setRdo] = useState({ itens: {}, km: "", obs: "", naoConforme: false, descNC: "", ocorrencia: "", difs: {} });
  const [agendaTudo, setAgendaTudo] = useState(false);
  const [heAberto, setHeAberto] = useState(false);
  const [he, setHe] = useState({ data: hojeISO(), horas: "", just: "" });
  const [sol, setSol] = useState({ tipo: "ferramentas", data: hojeISO(), valor: "", just: "" }); // solicitações de campo
  const [solAberta, setSolAberta] = useState(false);
  const [fotoLeg, setFotoLeg] = useState(""); // legenda das fotos de trabalho
  const [filaN, setFilaN] = useState(0);      // fotos aguardando sinal para subir
  const fotoTrabRef = useRef(null);
  useEffect(() => {
    setFilaN(filaFotos().length);
    const flush = () => subirFilaFotos().then((r) => setFilaN(r.restantes));
    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, []);
  const [parcial, setParcial] = useState({}); // realizado da manhã (RDO parcial no checkout do almoço)
  const [notTudo, setNotTudo] = useState(false);
  const devolvidos = (data.campoRdos || []).filter((r) => r.mat === matSel && r.status === "devolvido");
  /* ===== login diário + metas do dia + ritmo + clima ===== */
  const [clima, setClima] = useState(null);
  const loginHoje = (data.campoLogins || []).some((l) => l.mat === matSel && l.data === hoje);
  const realizadoAcum = {};
  (((data.apontamentos || {})[idgeo]) || []).forEach((ap2) => Object.entries(ap2.itens || {}).forEach(([k, v]) => { realizadoAcum[k] = (realizadoAcum[k] || 0) + (+v || 0); }));
  const prodMeta = data.produtividade || {};
  const metasDia = (os?.atividades || []).map((a) => {
    const prev = +a.qtd || 0, feito = Math.round((realizadoAcum[a.id] || 0) * 100) / 100, rest = Math.max(0, Math.round((prev - feito) * 100) / 100);
    const metaEmpresa = +prodMeta[a.id] || 0;
    const metaHoje = rest > 0 ? Math.round(Math.min(metaEmpresa > 0 ? metaEmpresa : rest, rest) * 100) / 100 : 0;
    return { id: a.id, label: a.label || a.id, prev, rest, metaHoje, unid: (UNID_PROD[a.id] || "unid").replace("/dia", "") };
  }).filter((m) => m.prev > 0);
  const nDias = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 864e5) + 1);
  const esperadoPct = os?.janelaIni && os?.janelaFim ? Math.min(100, Math.round((nDias(os.janelaIni, hoje) / nDias(os.janelaIni, os.janelaFim)) * 100)) : null;
  const ritmoAbaixo = os?.avancoReal != null && esperadoPct != null && os.avancoReal < esperadoPct - 10;
  const FRASES = ["Segurança em primeiro lugar — e a meta vem junto! 💪", "Grande dia! Cada metro conta. 🚀", "Time GEOAMBIENTE: qualidade e ritmo andam juntos. ⭐", "Foco na meta de hoje — um passo de cada vez. 🎯", "Seu trabalho move a empresa. Bom campo! 🛰"];
  const frase = FRASES[new Date().getDate() % FRASES.length];
  useEffect(() => {
    if (loginHoje || !idgeo) return;
    const cc = (data.cercasProjeto || {})[idgeo];
    if (!cc || cc.lat == null) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cc.lat}&longitude=${cc.lng}&current=temperature_2m,weather_code,wind_speed_10m,precipitation`)
      .then((r) => r.json()).then((j) => setClima(j.current || null)).catch(() => {});
  }, [idgeo, loginHoje]); // eslint-disable-line
  const climaTxt = clima ? `${Math.round(clima.temperature_2m)}°C · vento ${Math.round(clima.wind_speed_10m)} km/h${(clima.precipitation || 0) > 0 ? ` · 🌧 chuva ${clima.precipitation} mm` : " · sem chuva agora"}` : null;

  const gravar = async (tipo, extras = {}, patchExtra = {}) => {
    /* Janela de jornada: parâmetro POR COLABORADOR definido pelo gestor (até 3 turnos).
       Fora da janela NÃO bloqueia — apenas avisa e grava a marcação para o gestor. */
    const jcfg = ((data.janelasCampo || {})[matSel]) || {};
    const PAD = { checkin: "08:00", almoco: "12:00", retorno: "13:12", saida: "18:00" };
    const centro = jcfg[tipo] || PAD[tipo];
    const tolMin = +jcfg.tol || 30;
    let foraJanela = false;
    if (centro) {
      const [hh, mm] = centro.split(":").map(Number);
      const agoraMin = new Date().getHours() * 60 + new Date().getMinutes();
      if (Math.abs(agoraMin - (hh * 60 + mm)) > tolMin) {
        foraJanela = true;
        if (!confirm(`⏰ Você está fora da sua janela prevista para este registro (${centro} ±${tolMin} min). Registrar mesmo assim? O aviso fica gravado para o gestor.`)) return false;
      }
    }
    setOcupado(true);
    const gps = await pegarGPS();
    const cercas = data.cercasProjeto || {};
    let cerca = cercas[idgeo] || null;
    let cercaPatch = {};
    let dentro = null, dist = null;
    if (gps && cerca && cerca.lat != null) {
      dist = distM(gps.lat, gps.lng, cerca.lat, cerca.lng);
      dentro = dist <= (cerca.raio || RAIO_PADRAO_M) + (gps.precisao || 0);
    } else if (gps && !cerca && tipo === "checkin") {
      /* 1º check-in do projeto define a cerca provisória (o gestor pode ajustar) */
      cercaPatch = { cercasProjeto: { ...cercas, [idgeo]: { lat: gps.lat, lng: gps.lng, raio: RAIO_PADRAO_M, origem: `1º check-in ${matSel}`, em: hoje } } };
      dentro = true; dist = 0;
    }
    let motivoFora = "";
    if (dentro === false) {
      motivoFora = window.prompt(`⚠ Você está a ~${dist} m do site do projeto (fora da cerca de ${cerca.raio || RAIO_PADRAO_M} m). Informe o motivo:`) || "";
      if (!motivoFora.trim()) { setOcupado(false); alert("Evento não registrado — o motivo é obrigatório fora da cerca."); return false; }
    }
    const ev = { ts: new Date().toISOString(), hora: horaAgora(), gps, dentroCerca: dentro, distM: dist, motivoFora: motivoFora.trim(), foraJanela, ...extras };
    /* conexão com a gestão de recursos: o check-in atualiza a POSIÇÃO do colaborador
       (aba Localização, distâncias e Motor leem daqui — substitui a importação de ponto) */
    let dispPatch = {};
    if (tipo === "checkin" && gps) {
      const dAll = data.disponibilidade || {};
      const baseD = dAll[matSel] || { tempoMaxCampo: 15, emCampoDesde: "", ferias: [], afastamentos: [] };
      dispPatch = { disponibilidade: { ...dAll, [matSel]: { ...baseD, localAtual: (tap && tap.cidade ? `${tap.cidade}${tap.uf ? "/" + tap.uf : ""}` : baseD.localAtual || "Em campo"), fonteLocal: "GeoFields (check-in)", dataLocal: hoje, lat: gps.lat, lng: gps.lng } } };
    }
    const ce = { ...(data.campoEventos || {}) };
    ce[matSel] = { ...(ce[matSel] || {}), [hoje]: { ...regDia, [tipo]: ev } };
    persist({ ...data, campoEventos: ce, ...cercaPatch, ...dispPatch, ...patchExtra });
    setOcupado(false);
    return true;
  };

  const enviarRDO = async () => {
    const itensNum = {};
    Object.entries(rdo.itens).forEach(([k, v]) => { if (v !== "" && +v >= 0) itensNum[k] = +v; });
    if (rdo.naoConforme && !rdo.descNC.trim()) { alert("Descreva a não conformidade."); return; }
    const chegada = regDia.checkin, almoco = regDia.almoco, retorno = regDia.retorno;
    const hFim = horaAgora();
    const horas = (() => {
      const min = (h) => h ? +h.slice(0, 2) * 60 + +h.slice(3, 5) : 0;
      const trab = Math.max(0, min(hFim) - min(chegada?.hora || hFim) - Math.max(0, min(retorno?.hora || 0) - min(almoco?.hora || 0)));
      return Math.round((trab / 60) * 10) / 10;
    })();
    const payload = {
      data: hoje, horaInicio: chegada?.hora || "", horaFim: hFim, horasTecnico: horas,
      km: rdo.km === "" ? 0 : +rdo.km, itens: itensNum, statusDia: "normal",
      ocorrencias: [
        ...Object.entries(rdo.difs || {}).filter(([, v]) => v).map(([id]) => ({ tipo: id, label: (DIFICULDADES.find((d) => d[0] === id) || [])[1] || id, detalhe: "", atrasa: false })),
        ...(rdo.ocorrencia.trim() ? [{ tipo: "campo", label: "Relato do líder", detalhe: rdo.ocorrencia.trim(), atrasa: false }] : []),
      ],
      naoConforme: rdo.naoConforme, descNC: rdo.naoConforme ? rdo.descNC.trim() : "", obs: rdo.obs.trim(),
      jornadaCampo: { checkin: chegada, almoco, retorno, saida: { hora: hFim } },
    };
    const anterior = (data.campoRdos || []).find((r) => r.mat === matSel && r.idgeo === idgeo && r.data === hoje);
    const novo = { id: anterior ? anterior.id : "crdo_" + Date.now().toString(36), mat: matSel, nome: colab?.nome || matSel, idgeo, data: hoje, payload, status: "aguardando", criadoEm: new Date().toISOString() };
    const lista = anterior ? (data.campoRdos || []).map((r) => r.id === anterior.id ? novo : r) : [...(data.campoRdos || []), novo];
    const ok = await gravar("saida", {}, { campoRdos: lista });
    if (ok) {
      try {
        const us = (Array.isArray(data.usuarios) ? data.usuarios : []).filter((u) => u.email && !u.inativo);
        /* classe ✅ Aprovação em RDOs primeiro (é quem valida); depois quem edita; por fim diretores */
        const aprov = us.filter((u) => (u.permissoes || {}).prog === "aprovar").map((u) => u.email);
        const resp = aprov.length ? aprov : us.filter((u) => u.tipo === "master" || (u.permissoes || {}).prog === true || (u.permissoes || {}).prog === "editar" || (u.permissoes || {}).prog === "aprovar").map((u) => u.email);
        const para = resp.length ? resp : (data.diretoresNotificacao || []);
        if (para.length) tokenAtual().then((tk) => fetch("/api/enviar-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "avisos", para, assunto: `RDO de campo aguardando validação — ${idgeo} (${colab?.nome || matSel})`, html: `<p><b>${colab?.nome || matSel}</b> encerrou o dia no projeto <b>${idgeo}</b> e o RDO aguarda a sua validação na aba RDOs.</p><p><a href="https://www.geoops.ia.br" style="background:#2F6B4F;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Validar no GeoópS</a></p>`, token: tk }) }).catch(() => {})).catch(() => {});
      } catch (e) { /* silencioso */ }
      alert("✅ Dia encerrado! Seu RDO foi enviado para validação do Gestor de Operações.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.paper, fontFamily: "'IBM Plex Sans', sans-serif", padding: "14px 14px 40px", maxWidth: 520, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;800&family=IBM+Plex+Mono&display=swap');`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: T.green900 }}>🌍 GeoFields</div>
          <div style={{ fontSize: 11, color: T.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>GeoópS · app de campo · {fmtData(hoje)} · {VERSAO_GEOFIELDS}</div>
        </div>
        <button onClick={onSair} style={{ border: `1px solid ${T.line}`, background: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 12, cursor: "pointer" }}>Sair</button>
      </div>

      {/* identificação (quando o login não traz a matrícula) */}
      {!colab && (
        <div style={cardS}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Quem é você?</div>
          <select style={inputS} value={matSel} onChange={(e) => setMatSel(e.target.value)}>
            <option value="">Selecione seu nome…</option>
            {colaboradores.filter((c) => c.status !== "Desligado").map((c) => <option key={c.mat} value={c.mat}>{c.nome} ({c.mat})</option>)}
          </select>
        </div>
      )}

      {colab && (
        <>
          <div style={cardS}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{colab.nome}</div>
            <div style={{ fontSize: 12, color: T.inkSoft }}>{colab.cargo} · {colab.mat}</div>
            <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 4 }}>🔒 Este aparelho está vinculado à sua conta — todos os registros ficam associados a você.{!user.mat && <> <button onClick={() => { if (confirm("Desvincular este aparelho da conta atual? (uso do gestor)")) { try { localStorage.removeItem("geofields_mat"); } catch (e) {} setMatSelRaw(""); } }} style={{ border: "none", background: "none", color: T.blue, fontSize: 10.5, cursor: "pointer", textDecoration: "underline" }}>desvincular (gestor)</button></>}</div>
            {meus.length === 0 && <div style={{ marginTop: 8, fontSize: 13, color: T.amber }}>⚠ Você não está escalado em nenhuma OS aprovada hoje. Fale com o seu gestor.</div>}
            {meus.length > 0 && (
              <select style={{ ...inputS, marginTop: 10 }} value={idgeo} onChange={(e) => setIdgeoSel(e.target.value)}>
                {meus.map(([id, o]) => <option key={id} value={id}>{id} — {tap?.projeto || o.projeto || o.cliente || id}</option>)}
              </select>
            )}
          </div>

          {/* ===== Notícias da empresa ===== */}
          {(() => {
            const nots = (data.noticias || []).slice().sort((a, b) => (a.data < b.data ? 1 : -1));
            if (!nots.length) return null;
            const vis = notTudo ? nots : nots.slice(0, 3);
            return (
              <div style={cardS}>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.green900, marginBottom: 6 }}>📰 Notícias da empresa</div>
                {vis.map((n) => (
                  <div key={n.id} style={{ padding: "6px 0", borderBottom: `1px solid ${T.paper}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{n.titulo} <span style={{ color: T.inkSoft, fontWeight: 400, fontSize: 11 }}>· {fmtData(n.data)}</span></div>
                    <div style={{ fontSize: 12.5, color: T.inkSoft }}>{n.texto}</div>
                  </div>
                ))}
                {nots.length > 3 && <button onClick={() => setNotTudo((v) => !v)} style={{ border: "none", background: "none", color: T.blue, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "8px 0" }}>{notTudo ? "▲ menos" : `▼ todas as notícias (${nots.length})`}</button>}
              </div>
            );
          })()}

          {/* ===== Minha agenda: programações · folga · treinamento (base do GeoópS) ===== */}
          {(() => {
            const travasP = (((data.travas || {}).pessoa || {})[matSel] || []).filter((t) => t.fim >= hoje).sort((a, b) => (a.ini < b.ini ? -1 : 1));
            const nomeProj = (id) => { const t2 = taps.find((x) => x.idgeo === id) || {}; return t2.cliente || t2.projeto || id; };
            const rot = (t) => t.idgeo ? `🚧 ${t.idgeo} — ${nomeProj(t.idgeo)}` : (t.motivo === "ferias" ? "🏖 Folga / férias" : t.motivo === "atestado" ? "🤒 Afastamento" : `🔒 ${t.obs || "Bloqueio"}`);
            const disp = (data.disponibilidade || {})[matSel] || {};
            const folgasDisp = (Array.isArray(disp.ferias) ? disp.ferias : []).filter((f) => f && (f.fim || f.ini) >= hoje).map((f) => ({ ini: f.ini, fim: f.fim || f.ini }));
            const folgas = [...travasP.filter((t) => t.motivo === "ferias").map((t) => ({ ini: t.ini, fim: t.fim })), ...folgasDisp].sort((a, b) => (a.ini < b.ini ? -1 : 1));
            const treinos = (data.treinamentosAgendados || []).filter((t) => t.mat === matSel && t.data >= hoje).sort((a, b) => (a.data < b.data ? -1 : 1));
            const naFolga = (d) => folgas.some((f) => f.ini <= d && d <= f.fim);
            const visiveis = agendaTudo ? travasP : travasP.slice(0, 3);
            return (
              <div style={cardS}>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.green900, marginBottom: 8 }}>📅 Minha agenda</div>
                {travasP.length === 0 && <div style={{ fontSize: 12.5, color: T.inkSoft }}>Nenhuma programação futura registrada.</div>}
                {visiveis.map((t, i) => (
                  <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${T.paper}` }}>
                    <b style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{fmtData(t.ini)} → {fmtData(t.fim)}</b> · {rot(t)}
                  </div>
                ))}
                {travasP.length > 3 && (
                  <button onClick={() => setAgendaTudo((v) => !v)} style={{ border: "none", background: "none", color: T.blue, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "8px 0" }}>
                    {agendaTudo ? "▲ mostrar menos" : `▼ ver o cronograma completo (${travasP.length})`}
                  </button>
                )}
                {folgas.length > 0 && <div style={{ marginTop: 8, fontSize: 12.5, background: T.green100, borderRadius: 8, padding: "8px 10px" }}>🏖 <b>Próxima folga programada:</b> {fmtData(folgas[0].ini)}{folgas[0].fim !== folgas[0].ini ? ` → ${fmtData(folgas[0].fim)}` : ""}</div>}
                {treinos.map((t) => (
                  <div key={t.id} style={{ marginTop: 6, fontSize: 12.5, background: T.blueBg, borderRadius: 8, padding: "8px 10px" }}>🎓 <b>Treinamento:</b> {t.titulo} em {fmtData(t.data)}{naFolga(t.data) ? " — ⚠ no dia da sua folga programada" : ""}</div>
                ))}
              </div>
            );
          })()}

          {/* ===== 📷 Fotos do trabalho: sobem para o Storage do Supabase (fila offline) ===== */}
          {(() => {
            const aoEscolher = async (e) => {
              const files = Array.from(e.target.files || []);
              if (!files.length) return;
              for (const f of files) {
                const durl = await comprimirFoto(f, 1280, 0.72);
                if (durl) enfileirarFoto({ mat: matSel, idgeo, data: hoje, tipo: "execucao", legenda: (fotoLeg || "").trim() }, durl);
              }
              e.target.value = "";
              setFotoLeg("");
              setFilaN(filaFotos().length);
              const r = await subirFilaFotos();
              setFilaN(r.restantes);
              alert(r.restantes === 0
                ? `📷 ${files.length} foto(s) enviada(s) para o servidor da GEOAMBIENTE!`
                : `📷 Foto(s) guardada(s) no aparelho — ${r.restantes} na fila. Elas sobem sozinhas quando o sinal voltar.`);
            };
            return (
              <div style={cardS}>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.green900, marginBottom: 6 }}>📷 Fotos do trabalho</div>
                <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 8 }}>Registre o serviço executado durante o dia. As fotos sobem para o servidor da empresa e ficam disponíveis para os gestores{idgeo ? ` no projeto ${idgeo}` : ""}.</div>
                <input style={inputS} value={fotoLeg} onChange={(e) => setFotoLeg(e.target.value)} placeholder="Legenda (opcional) — ex.: poço PM-03 concluído" />
                <button style={{ ...btn(T.green700), marginTop: 8 }} onClick={() => fotoTrabRef.current && fotoTrabRef.current.click()}>📷 TIRAR / ANEXAR FOTOS</button>
                <input ref={fotoTrabRef} type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }} onChange={aoEscolher} />
                {filaN > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, background: "#FAF3E0", color: "#8a6d1a", borderRadius: 8, padding: "7px 10px" }}>
                    ⏳ {filaN} foto(s) aguardando sinal para subir — <button onClick={async () => { const r = await subirFilaFotos(); setFilaN(r.restantes); if (r.enviadas) alert(`📤 ${r.enviadas} foto(s) enviada(s).`); else if (r.erro) alert("Ainda sem conexão com o servidor. As fotos continuam guardadas no aparelho."); }} style={{ border: "none", background: "none", color: T.blue, fontWeight: 700, cursor: "pointer", padding: 0 }}>tentar agora</button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ===== Solicitações de campo: ferramentas · hotel · combustível · carro alugado · Uber ===== */}
          {(() => {
            const TIPOS_SOL = [["ferramentas", "🧰", "Ferramentas"], ["hotel", "🏨", "Hotel"], ["combustivel", "⛽", "Combustível"], ["carro_alugado", "🚙", "Carro alugado"], ["uber", "🚕", "Uber / transporte por app"]];
            const rotSol = (id) => { const t2 = TIPOS_SOL.find((x) => x[0] === id); return t2 ? `${t2[1]} ${t2[2]}` : (id === "hora_extra" ? "⏱ Hora extra" : id); };
            const minhasSol = (data.autorizacoes || []).filter((a) => a.mat === matSel && a.tipo !== "hora_extra").slice(0, 5);
            const enviarSol = () => {
              if (!sol.just.trim()) { alert("Descreva o que você precisa e por quê — a justificativa vai para o gestor."); return; }
              const tapS = taps.find((x) => x.idgeo === idgeo) || {};
              const nova = { id: "aut_" + Date.now().toString(36), mat: matSel, nome: colab?.nome || matSel, idgeo, projeto: tapS.projeto || idgeo, carteira: tapS.carteira || "", tipo: sol.tipo, data: sol.data || hoje, valor: +sol.valor || 0, placa: "", justificativa: sol.just.trim(), status: "Pendente", decididoPor: null, decididoEm: null, motivo: "", criadoEm: new Date().toISOString(), origem: "geofields" };
              persist({ ...data, autorizacoes: [nova, ...(data.autorizacoes || [])] });
              /* aviso ao gestor: quem tem a classe ✅ em Autorizações; fallback diretores (fire-and-forget) */
              try {
                const usS = (Array.isArray(data.usuarios) ? data.usuarios : []).filter((u) => u.email && !u.inativo);
                const aprovS = usS.filter((u) => (u.permissoes || {}).autoriz === "aprovar").map((u) => u.email);
                const destS = (aprovS.length ? aprovS : (data.diretoresNotificacao || [])).filter(Boolean);
                if (destS.length) tokenAtual().then((tk) => fetch("/api/enviar-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "avisos", para: destS, assunto: `Solicitação de campo — ${rotSol(sol.tipo)} · ${nova.nome} (${idgeo || "sem projeto"})`, html: `<p><b>${nova.nome}</b> solicitou <b>${rotSol(sol.tipo)}</b>${nova.valor ? ` (estimativa R$ ${nova.valor})` : ""} para ${fmtData(nova.data)}${idgeo ? ` no projeto <b>${idgeo}</b>` : ""}: ${nova.justificativa}</p><p><a href="https://www.geoops.ia.br" style="background:#2F6B4F;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Decidir no GeoópS</a></p>`, token: tk }) }).catch(() => {})).catch(() => {});
              } catch (e) { /* silencioso */ }
              setSol({ tipo: "ferramentas", data: hoje, valor: "", just: "" });
              setSolAberta(false);
              alert("🙋 Solicitação enviada! Acompanhe a resposta aqui — o gestor decide no GeoópS (Operações → Autorizações).");
            };
            return (
              <div style={cardS}>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.green900, marginBottom: 6 }}>🙋 Solicitações</div>
                <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 8 }}>Precisa de algo para trabalhar? Peça aqui e o gestor aprova: ferramentas, hotel, combustível, carro alugado ou Uber.</div>
                {minhasSol.map((a) => (
                  <div key={a.id} style={{ fontSize: 12.5, padding: "6px 0", borderBottom: `1px solid ${T.paper}` }}>
                    <b>{rotSol(a.tipo)}</b> · {fmtData(a.data)}{+a.valor > 0 ? ` · R$ ${a.valor}` : ""} — {a.status === "Pendente" ? "⏳ aguardando decisão" : a.status === "Aprovada" ? "✅ aprovada" : `❌ negada${a.motivo ? ": " + a.motivo : ""}`}
                  </div>
                ))}
                {!solAberta ? (
                  <button style={{ ...btn(T.blue), marginTop: 10 }} onClick={() => setSolAberta(true)}>+ NOVA SOLICITAÇÃO</button>
                ) : (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {TIPOS_SOL.map(([id, ic, lb]) => (
                        <button key={id} onClick={() => setSol((c) => ({ ...c, tipo: id }))} style={{ border: `1.5px solid ${sol.tipo === id ? T.green700 : T.line}`, background: sol.tipo === id ? T.green100 : "#fff", color: T.ink, borderRadius: 99, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{ic} {lb}</button>
                      ))}
                    </div>
                    <label style={{ fontSize: 11.5, color: T.inkSoft }}>Para quando?</label>
                    <input type="date" style={inputS} value={sol.data} onChange={(e) => setSol((c) => ({ ...c, data: e.target.value }))} />
                    <label style={{ fontSize: 11.5, color: T.inkSoft }}>Valor estimado (R$) — se souber</label>
                    <input type="number" min="0" step="1" inputMode="decimal" style={inputS} value={sol.valor} onChange={(e) => setSol((c) => ({ ...c, valor: e.target.value }))} placeholder="0" />
                    <label style={{ fontSize: 11.5, color: T.inkSoft }}>O que você precisa e por quê?</label>
                    <textarea rows={2} style={{ ...inputS, resize: "vertical" }} value={sol.just} onChange={(e) => setSol((c) => ({ ...c, just: e.target.value }))} placeholder="ex.: cavadeira nova — a atual quebrou; hotel 2 noites em Registro…" />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button style={btn(T.green700)} onClick={enviarSol}>ENVIAR AO GESTOR</button>
                      <button style={btn("#8B97A3")} onClick={() => setSolAberta(false)}>cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ===== Hora extra: opcional ao FIM do dia, após o RDO ===== */}
          {etapa === "fim" && (() => {
            const minhas = (data.autorizacoes || []).filter((a) => a.mat === matSel).slice(0, 3);
            return (
              <div style={cardS}>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.green900, marginBottom: 8 }}>⏱ Hora extra</div>
                {!heAberto ? (
                  <button style={{ ...btn(T.blue), padding: "12px" }} onClick={() => setHeAberto(true)}>⏱ SOLICITAR HORA EXTRA</button>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input type="date" style={{ ...inputS, flex: 1 }} value={he.data} onChange={(e) => setHe((c) => ({ ...c, data: e.target.value }))} />
                      <input type="number" inputMode="decimal" min="0.5" step="0.5" placeholder="horas" style={{ ...inputS, width: 90 }} value={he.horas} onChange={(e) => setHe((c) => ({ ...c, horas: e.target.value }))} />
                    </div>
                    <textarea rows={2} placeholder="Justificativa (obrigatória)" style={{ ...inputS, marginBottom: 8 }} value={he.just} onChange={(e) => setHe((c) => ({ ...c, just: e.target.value }))} />
                    <button style={btn(T.green700)} onClick={() => {
                      if (!(+he.horas > 0) || !he.just.trim()) { alert("Informe as horas e a justificativa."); return; }
                      const tapHE = taps.find((x) => x.idgeo === idgeo) || {};
                      const nova = { id: "aut_" + Date.now().toString(36), mat: matSel, nome: colab?.nome || matSel, idgeo, projeto: tapHE.projeto || idgeo, carteira: tapHE.carteira || "", tipo: "hora_extra", data: he.data || hoje, valor: +he.horas, placa: "", justificativa: he.just.trim(), status: "Pendente", decididoPor: null, decididoEm: null, motivo: "", criadoEm: new Date().toISOString(), origem: "geofields" };
                      persist({ ...data, autorizacoes: [nova, ...(data.autorizacoes || [])] });
                      /* aviso por e-mail ao gestor (fire-and-forget; degrada sem SMTP) */
                      try {
                        const usA = (Array.isArray(data.usuarios) ? data.usuarios : []).filter((u) => u.email && !u.inativo);
                        const aprovA = usA.filter((u) => (u.permissoes || {}).autoriz === "aprovar").map((u) => u.email);
                        const dest = (aprovA.length ? aprovA : (data.diretoresNotificacao || [])).filter(Boolean);
                        if (dest.length) tokenAtual().then((tk) => fetch("/api/enviar-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "avisos", para: dest, assunto: `Hora extra solicitada — ${nova.nome} (${idgeo})`, html: `<p><b>${nova.nome}</b> solicitou <b>${nova.valor}h</b> de hora extra em ${nova.data} no projeto <b>${idgeo}</b>: ${nova.justificativa}</p><p><a href="https://www.geoops.ia.br" style="background:#2F6B4F;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Decidir no GeoópS</a></p>`, token: tk }) }).catch(() => {})).catch(() => {});
                      } catch (e) { /* silencioso */ }
                      setHe({ data: hoje, horas: "", just: "" }); setHeAberto(false);
                      alert("✅ Solicitação enviada ao Gestor de Operações — acompanhe o status aqui.");
                    }}>ENVIAR SOLICITAÇÃO</button>
                  </>
                )}
                {minhas.map((a) => (
                  <div key={a.id} style={{ fontSize: 12.5, marginTop: 6, color: /aprov/i.test(a.status) ? T.green700 : /nega|reprov/i.test(a.status) ? T.red : T.amber }}>
                    {/aprov/i.test(a.status) ? "✅" : /nega|reprov/i.test(a.status) ? "❌" : "🕓"} {fmtData(a.data)} · {a.valor}h — <b>{a.status}</b>{a.motivo ? ` (${a.motivo})` : ""}
                  </div>
                ))}
              </div>
            );
          })()}

          {devolvidos.length > 0 && (
            <div style={{ ...cardS, background: T.redBg }}>
              <div style={{ fontWeight: 700, color: T.red }}>↩ RDO devolvido pelo gestor</div>
              {devolvidos.map((r) => <div key={r.id} style={{ fontSize: 12.5, marginTop: 4 }}>{fmtData(r.data)} · {r.idgeo} — “{r.motivoDevolucao}”. Corrija e reenvie no checkout de hoje (ou refaça o dia).</div>)}
            </div>
          )}

          {/* ===== BOAS-VINDAS + LOGIN DIÁRIO (registrado na base) ===== */}
          {idgeo && !loginHoje && (
            <div style={{ ...cardS, border: `2px solid ${T.green700}` }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: T.green900 }}>☀️ {new Date().getHours() < 12 ? "Bom dia" : "Boa tarde"}, {colab.nome.split(" ")[0]}!</div>
              <div style={{ fontSize: 13, color: T.inkSoft, margin: "6px 0 10px" }}>{frase}</div>
              {climaTxt && <div style={{ fontSize: 12.5, background: T.blueBg, borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>🌤 Tempo na região do trabalho: <b>{climaTxt}</b></div>}
              {ritmoAbaixo && <div style={{ fontSize: 12.5, background: T.redBg, color: T.red, borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>⚠ O projeto está em {os.avancoReal}% vs {esperadoPct}% esperado — a meta de hoje é decisiva. Vamos juntos! 💪</div>}
              {metasDia.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>🎯 Metas de hoje — guia da OS {idgeo}:</div>
                  {metasDia.map((m) => (
                    <div key={m.id} style={{ fontSize: 12.5, padding: "4px 0", borderBottom: `1px solid ${T.paper}` }}>
                      {m.label}: <b>{m.metaHoje > 0 ? `${m.metaHoje} ${m.unid}` : "concluída ✅"}</b> <span style={{ color: T.inkSoft }}>(faltam {m.rest} de {m.prev} {m.unid})</span>
                    </div>
                  ))}
                </div>
              )}
              <button style={btn(T.green700)} onClick={() => persist({ ...data, campoLogins: [...(data.campoLogins || []), { id: "cl_" + Date.now().toString(36), mat: matSel, nome: colab.nome, idgeo, data: hoje, ts: new Date().toISOString(), versao, origem: "geofields" }] })}>✅ INICIAR MEU DIA</button>
              <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 6, textAlign: "center" }}>O login diário fica registrado na base do GeoópS.</div>
            </div>
          )}

          {idgeo && loginHoje && (
            <>
              <Passo num="1️⃣" feito={regDia.checkin ? "checkin" : null} evento={regDia.checkin} atual={etapa === "checkin"} titulo="Check-in — chegada no cliente">
                <div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 10 }}>Tire a selfie e a foto dos equipamentos. O GPS e a cerca eletrônica são verificados ao confirmar.</div>
                <input ref={selfieRef} type="file" accept="image/*" capture="user" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) setSelfie(await comprimirFoto(f)); }} />
                <input ref={equipRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) setFotoEquip(await comprimirFoto(f)); }} />
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button style={{ ...btn(selfie ? T.green700 : T.blue, !selfie), flex: 1, padding: "12px 6px", fontSize: 13 }} onClick={() => selfieRef.current?.click()}>{selfie ? "✅ Selfie ok" : "🤳 Selfie"}</button>
                  <button style={{ ...btn(fotoEquip ? T.green700 : T.blue, !fotoEquip), flex: 1, padding: "12px 6px", fontSize: 13 }} onClick={() => equipRef.current?.click()}>{fotoEquip ? "✅ Equip. ok" : "📷 Equipamentos"}</button>
                </div>
                <button disabled={!selfie || !fotoEquip || ocupado} style={{ ...btn(T.green700), opacity: !selfie || !fotoEquip || ocupado ? 0.5 : 1 }} onClick={() => gravar("checkin", { selfie, fotoEquip })}>{ocupado ? "Registrando…" : "📍 CONFIRMAR CHEGADA"}</button>
              </Passo>

              <Passo num="2️⃣" feito={regDia.almoco ? "almoco" : null} evento={regDia.almoco} atual={etapa === "almoco"} titulo="Checkout — almoço · Preenchimento Parcial OBRIGATÓRIO">
                <div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 8 }}><b>Preenchimento Parcial Obrigatório:</b> informe o realizado da manhã (use 0 quando não houve produção) — o app recalcula a meta da tarde para você.</div>
                {(os?.atividades || []).filter((a) => +a.qtd > 0).map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ flex: 1, fontSize: 13 }}>{a.label || a.id}</span>
                    <input type="number" inputMode="decimal" min="0" placeholder="manhã" style={{ ...inputS, width: 90 }} value={parcial[a.id] ?? ""} onChange={(e) => setParcial((c) => ({ ...c, [a.id]: e.target.value }))} />
                    <span style={{ width: 46, fontSize: 11.5, color: T.inkSoft }}>{(UNID_PROD[a.id] || "unid").replace("/dia", "")}</span>
                  </div>
                ))}
                <button disabled={ocupado} style={btn(T.amber)} onClick={() => { const pn = {}; Object.entries(parcial).forEach(([k, v]) => { if (v !== "" && +v >= 0) pn[k] = +v; }); if ((os?.atividades || []).some((a) => +a.qtd > 0) && !Object.keys(pn).length) { alert("Preenchimento parcial é OBRIGATÓRIO — informe o realizado da manhã (use 0 quando não houve produção)."); return; } gravar("almoco", { parcial: pn }); }}>{ocupado ? "Registrando…" : "🍽 SAIR PARA O ALMOÇO"}</button>
              </Passo>

              <Passo num="3️⃣" feito={regDia.retorno ? "retorno" : null} evento={regDia.retorno} atual={etapa === "retorno"} titulo="Check-in — retorno do almoço">
                <button disabled={ocupado} style={btn(T.blue)} onClick={() => gravar("retorno")}>{ocupado ? "Registrando…" : "📍 VOLTEI DO ALMOÇO"}</button>
              </Passo>

              {etapa === "saida" && (() => {
                const pc = regDia.almoco?.parcial || {};
                const comMeta = metasDia.filter((m) => m.metaHoje > 0);
                const temParcial = comMeta.some((m) => pc[m.id] != null);
                const pctManha = temParcial && comMeta.length ? Math.round(comMeta.reduce((s2, m) => s2 + Math.min(1, (+pc[m.id] || 0) / m.metaHoje), 0) / comMeta.length * 100) : null;
                const bom = pctManha != null ? pctManha >= 45 : !ritmoAbaixo;
                const metaTarde = comMeta.map((m) => `${m.label}: ${Math.max(0, Math.round((m.metaHoje - (+pc[m.id] || 0)) * 100) / 100)} ${m.unid}`).join(" · ");
                return (
                  <div style={{ ...cardS, background: bom ? T.green100 : T.redBg }}>
                    <div style={{ fontSize: 13, color: bom ? T.green900 : T.red, fontWeight: 700 }}>
                      {pctManha != null
                        ? (bom ? `✅ Boa manhã — ${pctManha}% da meta do dia. Mantenha o ritmo! 🚀` : `⚠ Manhã em ${pctManha}% da meta — dá para recuperar à tarde, com segurança! 💪`)
                        : (bom ? "✅ Bom ritmo! Produtividade em dia — mantenha até o fim do dia. 🚀" : `⚠ Ritmo abaixo do esperado (${os?.avancoReal ?? "—"}% vs ${esperadoPct}%) — acelere com segurança! 💪`)}
                    </div>
                    {pctManha != null && metaTarde && <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 4 }}>🎯 Meta da tarde: {metaTarde}</div>}
                  </div>
                );
              })()}
              <Passo num="4️⃣" feito={regDia.saida ? "saida" : null} evento={regDia.saida} atual={etapa === "saida"} titulo="Checkout de saída + RDO do dia">
                <div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 10 }}><b>Preenchimento final:</b> informe TUDO que foi produzido no dia (manhã + tarde), bem como as não conformidades do dia — segue para a validação do Gestor de Operações.</div>
                {(os?.atividades || []).map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ flex: 1, fontSize: 13.5 }}>{a.label || a.id}</span>
                    <input type="number" inputMode="decimal" min="0" style={{ ...inputS, width: 90 }} value={rdo.itens[a.id] ?? ""} onChange={(e) => setRdo((c) => ({ ...c, itens: { ...c.itens, [a.id]: e.target.value } }))} />
                    <span style={{ width: 46, fontSize: 11.5, color: T.inkSoft }}>{(UNID_PROD[a.id] || "unid").replace("/dia", "")}</span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ flex: 1, fontSize: 13.5 }}>🚗 Distância rodada no dia</span>
                  <input type="number" inputMode="decimal" min="0" style={{ ...inputS, width: 90 }} value={rdo.km} onChange={(e) => setRdo((c) => ({ ...c, km: e.target.value }))} />
                  <span style={{ width: 46, fontSize: 11.5, color: T.inkSoft }}>km</span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, margin: "4px 0 2px" }}>Como foi o dia? Marque o que aconteceu:</div>
                <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 6 }}>Registrar dificuldades é <b>estimulado</b> — ajuda a empresa a melhorar equipamentos, logística e prazos. Não gera repreensão. 🤝</div>
                {DIFICULDADES.map(([id, lb]) => (
                  <label key={id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0" }}>
                    <input type="checkbox" checked={!!rdo.difs?.[id]} onChange={(e) => setRdo((c) => ({ ...c, difs: { ...(c.difs || {}), [id]: e.target.checked } }))} style={{ width: 17, height: 17 }} /> {lb}
                  </label>
                ))}
                {Object.values(rdo.difs || {}).some(Boolean) && <textarea rows={2} placeholder="Conte um pouco mais (opcional)" style={{ ...inputS, margin: "6px 0 8px" }} value={rdo.ocorrencia} onChange={(e) => setRdo((c) => ({ ...c, ocorrencia: e.target.value }))} />}
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0", marginBottom: 4 }}>
                  <input type="checkbox" checked={rdo.naoConforme} onChange={(e) => setRdo((c) => ({ ...c, naoConforme: e.target.checked }))} style={{ width: 17, height: 17 }} /> Algo saiu fora do procedimento (não conformidade)
                </label>
                {rdo.naoConforme && <textarea rows={2} placeholder="O que aconteceu? Registro simples, sem burocracia — ajuda a melhorar o processo." style={{ ...inputS, marginBottom: 8 }} value={rdo.descNC} onChange={(e) => setRdo((c) => ({ ...c, descNC: e.target.value }))} />}
                <textarea rows={2} placeholder="Observações" style={{ ...inputS, marginBottom: 10 }} value={rdo.obs} onChange={(e) => setRdo((c) => ({ ...c, obs: e.target.value }))} />
                <button disabled={ocupado} style={btn(T.red)} onClick={enviarRDO}>{ocupado ? "Enviando…" : "🏁 ENCERRAR O DIA E ENVIAR RDO"}</button>
              </Passo>

              {etapa === "fim" && (
                <div style={{ ...cardS, background: T.green100, textAlign: "center" }}>
                  <div style={{ fontSize: 34 }}>✅</div>
                  <div style={{ fontWeight: 800, color: T.green900 }}>Dia encerrado — bom descanso!</div>
                  <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 4 }}>Jornada {regDia.checkin?.hora} → {regDia.saida?.hora} · RDO aguardando validação do gestor.</div>
                </div>
              )}
            </>
          )}
        </>
      )}
      <div style={{ textAlign: "center", fontSize: 10.5, color: T.inkSoft, marginTop: 16 }}>GeoFields — GeoópS app de campo · GEOAMBIENTE S/A · dados sincronizam automaticamente quando houver sinal</div>
    </div>
  );
}
