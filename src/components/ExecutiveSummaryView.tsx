/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ArrowRight,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaccion } from '../types';
import { formatearBolivares, nombreMesLargo } from '../utils/excelExport';

interface ExecutiveSummaryViewProps {
  transacciones: Transaccion[];
  onSeleccionarCategoriaFiltro: (cat: string) => void;
  onIrAConciliacionSeniat: () => void;
  onExportarExcel: () => void;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  transacciones,
  onSeleccionarCategoriaFiltro,
  onIrAConciliacionSeniat,
  onExportarExcel,
}) => {
  const meses = [...new Set(transacciones.map(t => t.fecha.slice(0, 7)))].sort();

  // Agrupación mensual
  const datosMeses = meses.map(m => {
    const txMes = transacciones.filter(t => t.fecha.startsWith(m));
    const ing = txMes.filter(t => t.monto > 0).reduce((s, t) => s + t.monto, 0);
    const egr = txMes.filter(t => t.monto < 0).reduce((s, t) => s + Math.abs(t.monto), 0);
    const neto = ing - egr;

    return {
      mes: m,
      nombreMes: nombreMesLargo(m),
      ingresos: ing,
      egresos: egr,
      neto,
      operaciones: txMes.length,
      lectura:
        neto > 0
          ? 'Ingresó más de lo gastado (Superávit operativo)'
          : neto < 0
          ? 'Se gastó más de lo ingresado (Déficit del mes)'
          : 'Ingresos iguales a los egresos',
    };
  });

  // Agrupación por Categoría de Ingresos
  const txIngresos = transacciones.filter(t => t.monto > 0);
  const totalIngresos = txIngresos.reduce((s, t) => s + t.monto, 0);
  const catIngresosMap: Record<string, { total: number; count: number; soporte: string }> = {};

  txIngresos.forEach(t => {
    if (!catIngresosMap[t.categoria]) {
      catIngresosMap[t.categoria] = { total: 0, count: 0, soporte: t.soporteRequerido };
    }
    catIngresosMap[t.categoria].total += t.monto;
    catIngresosMap[t.categoria].count += 1;
  });

  const rankingIngresos = Object.entries(catIngresosMap)
    .map(([cat, data]) => ({
      categoria: cat,
      total: data.total,
      count: data.count,
      soporte: data.soporte,
      porcentaje: totalIngresos > 0 ? (data.total / totalIngresos) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Agrupación por Categoría de Egresos
  const txEgresos = transacciones.filter(t => t.monto < 0);
  const totalEgresos = txEgresos.reduce((s, t) => s + Math.abs(t.monto), 0);
  const catEgresosMap: Record<string, { total: number; count: number; soporte: string }> = {};

  txEgresos.forEach(t => {
    if (!catEgresosMap[t.categoria]) {
      catEgresosMap[t.categoria] = { total: 0, count: 0, soporte: t.soporteRequerido };
    }
    catEgresosMap[t.categoria].total += Math.abs(t.monto);
    catEgresosMap[t.categoria].count += 1;
  });

  const rankingEgresos = Object.entries(catEgresosMap)
    .map(([cat, data]) => ({
      categoria: cat,
      total: data.total,
      count: data.count,
      soporte: data.soporte,
      porcentaje: totalEgresos > 0 ? (data.total / totalEgresos) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Banner Principal de Descarga de Resumen Mensual en Excel */}
      <div className="bg-white rounded-xl border-2 border-[#0022F5] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-base">
                Resumen Mensual por Categoría de Ingresos y Egresos (Excel Auditable)
              </h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase tracking-wide">
                Formato Profesional
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Descarga la matriz completa con fórmulas vivas de Excel (`SUMIFS`), desglose mes a mes por categoría,
              subtotales cuadrados y la lista de soportes requeridos para presentar directamente a tus clientes o al SENIAT.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={onExportarExcel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#00B32C] hover:bg-[#009624] rounded-xl shadow-md transition-all cursor-pointer"
            title="Descargar archivo Excel con la matriz de resumen por categoría"
          >
            <Download className="w-4 h-4 text-white" />
            Descargar Resumen en Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Banner de Acceso Rápido a Conciliación SENIAT */}
      <div className="bg-gradient-to-r from-blue-900 to-[#0022F5] text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">
              ¿Listo para conciliar contra las declaraciones del portal SENIAT?
            </span>
            <span className="text-[11px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded">
              Protección Fiscal
            </span>
          </div>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl">
            Compara los depósitos bancarios de tus cuentas contra la facturación mensual declarada en las
            planillas de IVA (Forma 99030) y asegura que todas las transferencias internas y aportes tengan soporte.
          </p>
        </div>

        <button
          onClick={onIrAConciliacionSeniat}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0022F5] bg-white hover:bg-blue-50 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer shrink-0"
        >
          Ver Matriz SENIAT
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabla Mensual: Ingresos vs Egresos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Comportamiento Mensual: Ingresos vs. Egresos (Bs)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {meses.length} mes(es) analizado(s)
            </span>
            <button
              onClick={onExportarExcel}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0022F5] hover:underline cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">Mes</th>
                <th className="py-2.5 px-3 text-right text-emerald-700">Ingresos (Bs)</th>
                <th className="py-2.5 px-3 text-right text-rose-700">Egresos (Bs)</th>
                <th className="py-2.5 px-3 text-right text-slate-900 font-bold">Flujo Neto (Bs)</th>
                <th className="py-2.5 px-4">Lectura Financiera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {datosMeses.map(d => (
                <tr key={d.mes} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {d.nombreMes}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#00B32C] font-semibold">
                    {formatearBolivares(d.ingresos)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#E52229] font-semibold">
                    {formatearBolivares(d.egresos)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right tabular-nums font-bold ${
                      d.neto >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {d.neto >= 0 ? '+' : ''}
                    {formatearBolivares(d.neto)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        d.neto >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    ></span>
                    {d.lectura}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-xs text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-4 uppercase">Total Acumulado</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#00B32C]">
                  {formatearBolivares(datosMeses.reduce((s, d) => s + d.ingresos, 0))}
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-[#E52229]">
                  {formatearBolivares(datosMeses.reduce((s, d) => s + d.egresos, 0))}
                </td>
                <td className="py-3 px-3 text-right tabular-nums">
                  {formatearBolivares(datosMeses.reduce((s, d) => s + d.neto, 0))}
                </td>
                <td className="py-3 px-4 text-slate-600 font-normal">
                  Consolidado total
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Grid de 2 Columnas: Ingresos por Categoría vs Egresos por Categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Ingresos por Categoría */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00B32C]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ingresos por Categoría
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#00B32C] tabular-nums">
                Total: Bs. {formatearBolivares(totalIngresos)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-2 text-center">Ops</th>
                    <th className="py-2.5 px-2 text-right">Total (Bs)</th>
                    <th className="py-2.5 px-2 text-right">%</th>
                    <th className="py-2.5 px-3">Soporte Legal Requerido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankingIngresos.map(item => (
                    <tr
                      key={item.categoria}
                      onClick={() => onSeleccionarCategoriaFiltro(item.categoria)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      title="Haz clic para ver las operaciones de esta categoría"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.categoria}
                      </td>
                      <td className="py-2.5 px-2 text-center tabular-nums text-slate-500">
                        {item.count}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-[#00B32C] font-semibold whitespace-nowrap">
                        {formatearBolivares(item.total)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-slate-500 whitespace-nowrap">
                        {item.porcentaje.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 max-w-[200px] truncate">
                        {item.soporte}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Egresos por Categoría */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#E52229]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Egresos por Categoría
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#E52229] tabular-nums">
                Total: Bs. {formatearBolivares(totalEgresos)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-2 text-center">Ops</th>
                    <th className="py-2.5 px-2 text-right">Total (Bs)</th>
                    <th className="py-2.5 px-2 text-right">%</th>
                    <th className="py-2.5 px-3">Soporte Legal Requerido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankingEgresos.map(item => (
                    <tr
                      key={item.categoria}
                      onClick={() => onSeleccionarCategoriaFiltro(item.categoria)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      title="Haz clic para ver las operaciones de esta categoría"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.categoria}
                      </td>
                      <td className="py-2.5 px-2 text-center tabular-nums text-slate-500">
                        {item.count}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-[#E52229] font-semibold whitespace-nowrap">
                        {formatearBolivares(item.total)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-slate-500 whitespace-nowrap">
                        {item.porcentaje.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 max-w-[200px] truncate">
                        {item.soporte}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
