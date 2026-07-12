/* Fotos de campo — Supabase STORAGE (bucket privado `fotos-campo`) + tabela permanente `campo_fotos`.
 *
 * Arquitetura (V1.1.15 / GeofieldS V1.3):
 *  · o GeofieldS comprime a foto no aparelho e a coloca numa FILA OFFLINE (localStorage);
 *  · com sinal, a fila sobe: arquivo → Storage (caminho IDGEO/data/matrícula/…) e
 *    metadados → tabela `campo_fotos` (só-inserção — base firme, como o rdo_log);
 *  · o GeoópS lista as fotos por projeto/dia e gera URLS ASSINADAS (validade curta)
 *    para visualização/download — bucket privado, nenhuma foto tem link público.
 *
 * Pré-requisito no servidor: rodar supabase/fotos_campo.sql (bucket + tabela + RLS).
 * Sem o bucket/tabela, nada quebra: a fila permanece no aparelho e tenta de novo depois.
 */
import { supabase, supabaseConfigured } from "./supabase.js";

const BUCKET = "fotos-campo";
const QKEY = "geofields_fila_fotos";

export const filaFotos = () => { try { return JSON.parse(localStorage.getItem(QKEY) || "[]"); } catch { return []; } };
const salvarFila = (f) => { try { localStorage.setItem(QKEY, JSON.stringify(f)); } catch { /* quota cheia: mantém as já gravadas */ } };

/* coloca uma foto na fila offline; meta = { mat, idgeo, data, tipo, legenda, lat, lng } */
export function enfileirarFoto(meta, dataURL) {
  if (!dataURL) return 0;
  const f = filaFotos();
  f.push({ id: "ft_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), ...meta, dataURL, criadoEm: new Date().toISOString() });
  salvarFila(f);
  return f.length;
}

/* sobe a fila para o Storage; para no primeiro erro (sem sinal / SQL ainda não rodado) e tenta depois */
export async function subirFilaFotos() {
  if (!supabaseConfigured || !supabase) return { enviadas: 0, restantes: filaFotos().length, erro: "Supabase não configurado" };
  let fila = filaFotos();
  let enviadas = 0, erro = null;
  for (const item of [...fila]) {
    try {
      const blob = await (await fetch(item.dataURL)).blob();
      const caminho = `${item.idgeo || "geral"}/${item.data}/${item.mat}/${item.tipo || "execucao"}-${item.id}.jpg`;
      const up = await supabase.storage.from(BUCKET).upload(caminho, blob, { contentType: "image/jpeg", upsert: true });
      if (up.error) throw up.error;
      const ins = await supabase.from("campo_fotos").insert({
        idgeo: item.idgeo || null, mat: item.mat || "", data: item.data, tipo: item.tipo || "execucao",
        legenda: item.legenda || "", lat: item.lat ?? null, lng: item.lng ?? null, storage_path: caminho,
      });
      if (ins.error) throw ins.error;
      fila = fila.filter((x) => x.id !== item.id);
      salvarFila(fila);
      enviadas++;
    } catch (e) { erro = (e && e.message) || String(e); break; }
  }
  return { enviadas, restantes: fila.length, erro };
}

/* lista os metadados das fotos (mais recentes primeiro) — filtros opcionais por projeto e dia */
export async function listarFotos({ idgeo, data, limite = 400 } = {}) {
  if (!supabaseConfigured || !supabase) return { fotos: [], erro: "Supabase não configurado" };
  let q = supabase.from("campo_fotos").select("*").order("criado_em", { ascending: false }).limit(limite);
  if (idgeo) q = q.eq("idgeo", idgeo);
  if (data) q = q.eq("data", data);
  const { data: rows, error } = await q;
  if (error) return { fotos: [], erro: error.message || "Falha ao listar (a tabela campo_fotos existe? rode supabase/fotos_campo.sql)" };
  return { fotos: rows || [], erro: null };
}

/* URL assinada de curta duração para ver/baixar uma foto do bucket privado */
export async function urlAssinadaFoto(storagePath, segundos = 3600) {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, segundos);
  return error ? null : (data && data.signedUrl) || null;
}
