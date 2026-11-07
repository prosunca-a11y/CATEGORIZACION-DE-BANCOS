/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { Transaccion, ReglaInteligente } from '../types';
import { clasificarTransaccion } from './rulesEngine';

// Configurar el worker de PDF.js si estamos en el navegador
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export const BANCOS_VENEZUELA = [
  { nombre: 'BNC Cashea', patron: /cashea/i },
  { nombre: 'Banesco', patron: /banesco/i },
  { nombre: 'Mercantil', patron: /mercantil/i },
  { nombre: 'BNC (Banco Nacional de Crédito)', patron: /\bbnc\b|nacional de cr[eé]dito/i },
  { nombre: 'Banco de Venezuela', patron: /banco de venezuela|\bbdv\b/i },
  { nombre: 'Provincial (BBVA)', patron: /provincial|bbva/i },
  { nombre: 'Bancamiga', patron: /bancamiga/i },
  { nombre: 'Banplus', patron: /banplus/i },
  { nombre: 'Banco Plaza', patron: /\bplaza\b/i },
  { nombre: 'Bicentenario', patron: /bicentenario/i },
  { nombre: 'Exterior', patron: /banco exterior|\bexterior\b/i },
  { nombre: 'Banco del Tesoro', patron: /banco del tesoro|\btesoro\b/i },
  { nombre: 'BFC (Fondo Común)', patron: /fondo com[uú]n|\bbfc\b/i },
  { nombre: '100% Banco', patron: /100% ?banco/i },
  { nombre: 'Sofitasa', patron: /sofitasa/i },
  { nombre: 'Venezolano de Crédito', patron: /venezolano de cr/i },
  { nombre: 'Banco Caroní', patron: /caron[ií]/i },
  { nombre: 'Banco Activo', patron: /banco activo/i },
  { nombre: 'Del Sur', patron: /del sur/i },
  { nombre: 'Bancrecer', patron: /bancrecer/i },
];

export function detectarBanco(textoOArchivo: string): string {
  const t = String(textoOArchivo).toLowerCase();
  const match = BANCOS_VENEZUELA.find(b => b.patron.test(t));
  return match ? match.nombre : 'Otro banco';
}

/**
 * Convierte formatos numéricos venezolanos (con comas decimales o puntos) a Number
 */
export function parsearNumeroVenezolano(valor: unknown): number | null {
  if (typeof valor === 'number') return isNaN(valor) ? null : valor;
  if (!valor) return null;

  let s = String(valor).trim();
  const esNegativo = /^\(.*\)$|^-|-$/.test(s);
  s = s.replace(/[^\d.,]/g, '');
  if (!s) return null;

  if (s.includes(',') && s.includes('.')) {
    // Si la coma está después del punto: formato 1.234.567,89
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (s.includes(',')) {
    // Solo tiene coma: si tiene 1 o 2 decimales al final: 1234,56
    s = /,\d{1,2}$/.test(s) && s.split(',').length === 2
      ? s.replace(',', '.')
      : s.replace(/,/g, '');
  } else if ((s.match(/\./g) || []).length > 1) {
    s = s.replace(/\./g, '');
  }

  const n = parseFloat(s);
  if (isNaN(n)) return null;
  return esNegativo ? -Math.abs(n) : n;
}

/**
 * Normaliza fechas variadas a formato ISO YYYY-MM-DD
 */
export function normalizarFechaIso(valor: unknown): string | null {
  if (!valor) return null;

  // Número de fecha de Excel (serial)
  if (typeof valor === 'number' && valor > 20000 && valor < 80000) {
    const fecha = new Date(Math.round((valor - 25569) * 864e5));
    if (!isNaN(fecha.getTime())) {
      return fecha.toISOString().slice(0, 10);
    }
  }

  const str = String(valor).trim();
  // Formatos DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const m = str.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) {
    let dia = parseInt(m[1], 10);
    let mes = parseInt(m[2], 10);
    let anio = parseInt(m[3], 10);
    if (anio < 100) anio += 2000;

    // Validación básica de mes/día en caso de formato inverso
    if (mes > 12 && dia <= 12) {
      const temp = dia;
      dia = mes;
      mes = temp;
    }

    const d = new Date(Date.UTC(anio, mes - 1, dia));
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  }

  // Formato ISO ya existente YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  return null;
}

/**
 * Procesa datos tabulares (filas de Excel o CSV) y extrae transacciones bancarias
 */
export function procesarFilasTabulares(
  filas: (string | number | null | undefined)[][],
  empresa: string,
  banco: string,
  archivoOrigen: string,
  reglasPersonalizadas: ReglaInteligente[] = []
): Transaccion[] {
  // Buscar la fila de encabezado
  const headerIndex = filas.findIndex(r =>
    r.some(c => /fecha/i.test(String(c || ''))) &&
    r.some(c => /descrip|concepto|detalle|motivo|beneficiario/i.test(String(c || '')))
  );

  if (headerIndex < 0) {
    return [];
  }

  const headerRow = filas[headerIndex].map(c => String(c || '').toLowerCase().trim());
  const findCol = (regex: RegExp) => headerRow.findIndex(c => regex.test(c));

  const colFecha = findCol(/fecha/i);
  const colDesc = findCol(/descrip|concepto|detalle|motivo|beneficiario/i);
  const colRef = findCol(/ref|comprobante|documento|secuencia|nro\s*op/i);
  const colMonto = findCol(/^monto$|^importe$|^valor$/i);
  const colHaber = findCol(/haber|credito|crédito|abono|ingreso|dep[oó]sito/i);
  const colDebe = findCol(/debe|debito|débito|cargo|egreso|retiro/i);
  const colSaldo = findCol(/saldo|balance/i);

  const transacciones: Transaccion[] = [];

  for (let i = headerIndex + 1; i < filas.length; i++) {
    const fila = filas[i];
    if (!fila || fila.length === 0) continue;

    const fecha = normalizarFechaIso(fila[colFecha]);
    if (!fecha) continue;

    let monto: number | null = null;
    if (colMonto >= 0 && fila[colMonto] != null && fila[colMonto] !== '') {
      monto = parsearNumeroVenezolano(fila[colMonto]);
    } else {
      const haberVal = colHaber >= 0 ? parsearNumeroVenezolano(fila[colHaber]) : null;
      const debeVal = colDebe >= 0 ? parsearNumeroVenezolano(fila[colDebe]) : null;

      if (haberVal != null && haberVal > 0) {
        monto = Math.abs(haberVal);
      } else if (debeVal != null && debeVal > 0) {
        monto = -Math.abs(debeVal);
      } else if (haberVal != null && debeVal != null) {
        monto = haberVal - debeVal;
      }
    }

    if (monto == null || monto === 0) continue;

    const descripcion = String(colDesc >= 0 ? fila[colDesc] ?? '' : '').trim();
    const referencia = String(colRef >= 0 ? fila[colRef] ?? '' : '').trim();
    const saldo = colSaldo >= 0 ? parsearNumeroVenezolano(fila[colSaldo]) : null;

    const txBase = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      fecha,
      descripcion,
      referencia,
      monto: Math.round(monto * 100) / 100,
      saldo,
      tipo: (monto > 0 ? 'I' : 'E') as 'I' | 'E',
      empresa,
      banco,
      archivoOrigen,
    };

    const clasificacion = clasificarTransaccion(txBase, reglasPersonalizadas);

    transacciones.push({
      ...txBase,
      categoria: clasificacion.categoria,
      grupo: clasificacion.grupo,
      soporteRequerido: clasificacion.soporteRequerido,
      soporteEstado: 'pendiente',
      reglaAplicada: clasificacion.reglaAplicada,
    });
  }

  return transacciones;
}

/**
 * Lee un archivo Excel (.xlsx / .xls) o CSV usando SheetJS
 */
export async function parsearExcelOCsv(
  file: File,
  empresa: string,
  bancoSeleccionado: string,
  reglasPersonalizadas: ReglaInteligente[] = []
): Promise<{ transacciones: Transaccion[]; bancoDetectado: string }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  let banco = bancoSeleccionado;
  if (!banco) {
    banco = detectarBanco(file.name);
  }

  const todasLasTransacciones: Transaccion[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const filas = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      raw: true,
      defval: '',
    });

    if (filas.length > 0 && (!banco || banco === 'Otro banco')) {
      const hint = JSON.stringify(filas.slice(0, 10));
      const detectado = detectarBanco(hint);
      if (detectado !== 'Otro banco') {
        banco = detectado;
      }
    }

    const txs = procesarFilasTabulares(
      filas,
      empresa,
      banco || 'Otro banco',
      file.name,
      reglasPersonalizadas
    );
    todasLasTransacciones.push(...txs);
  }

  return { transacciones: todasLasTransacciones, bancoDetectado: banco || 'Otro banco' };
}

/**
 * Parsea un PDF de estado de cuenta bancario extrayendo texto y coordenadas
 */
export async function parsearPdfBancario(
  file: File,
  empresa: string,
  bancoSeleccionado: string,
  reglasPersonalizadas: ReglaInteligente[] = []
): Promise<{ transacciones: Transaccion[]; bancoDetectado: string }> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const lineas: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const textContent = await page.getTextContent();
    const mapY: Record<number, { str: string; x: number }[]> = {};

    textContent.items.forEach(item => {
      if ('str' in item && 'transform' in item) {
        const y = Math.round(item.transform[5] / 3);
        const x = item.transform[4];
        mapY[y] = mapY[y] || [];
        mapY[y].push({ str: item.str, x });
      }
    });

    Object.keys(mapY)
      .map(Number)
      .sort((a, b) => b - a)
      .forEach(y => {
        const linea = mapY[y]
          .sort((a, b) => a.x - b.x)
          .map(i => i.str)
          .join(' ')
          .trim();
        if (linea) lineas.push(linea);
      });
  }

  let banco = bancoSeleccionado;
  const textoMuestra = lineas.slice(0, 30).join(' ') + ' ' + file.name;
  if (!banco || banco === 'Otro banco') {
    banco = detectarBanco(textoMuestra);
  }

  const transacciones: Transaccion[] = [];
  let saldoPrevio: number | null = null;

  for (const l of lineas) {
    const m = l.match(/^\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\s+(.*)$/);
    if (!m) continue;

    const fecha = normalizarFechaIso(m[1]);
    if (!fecha) continue;

    const resto = m[2];
    const matchNumeros = [...resto.matchAll(/-?\d{1,3}(?:[.,]\d{3})*[.,]\d{2}-?/g)];
    if (!matchNumeros.length) continue;

    let monto = parsearNumeroVenezolano(
      matchNumeros.length > 1
        ? matchNumeros[matchNumeros.length - 2][0]
        : matchNumeros[0][0]
    );

    const saldo =
      matchNumeros.length > 1
        ? parsearNumeroVenezolano(matchNumeros[matchNumeros.length - 1][0])
        : null;

    if (saldo != null && saldoPrevio != null && monto != null) {
      const diff = Math.round((saldo - saldoPrevio) * 100) / 100;
      if (Math.abs(Math.abs(diff) - Math.abs(monto)) < 0.05) {
        monto = diff;
      }
    }
    if (saldo != null) saldoPrevio = saldo;

    const descBruta = resto.slice(0, matchNumeros[0].index).trim();
    const refMatch = descBruta.match(/\b\d{5,}\b/);
    const ref = refMatch ? refMatch[0] : '';
    const descripcion = ref ? descBruta.replace(ref, '').trim() || descBruta : descBruta;

    if (monto == null || monto === 0) continue;

    const txBase = {
      id: `tx-pdf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      fecha,
      descripcion,
      referencia: ref,
      monto: Math.round(monto * 100) / 100,
      saldo,
      tipo: (monto > 0 ? 'I' : 'E') as 'I' | 'E',
      empresa,
      banco: banco || 'Otro banco',
      archivoOrigen: file.name,
    };

    const clasificacion = clasificarTransaccion(txBase, reglasPersonalizadas);

    transacciones.push({
      ...txBase,
      categoria: clasificacion.categoria,
      grupo: clasificacion.grupo,
      soporteRequerido: clasificacion.soporteRequerido,
      soporteEstado: 'pendiente',
      reglaAplicada: clasificacion.reglaAplicada,
    });
  }

  return { transacciones, bancoDetectado: banco || 'Otro banco' };
}
