/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  Wallet,
} from 'lucide-react';
import { Transaccion } from '../types';
import { formatearBolivares, nombreMesLargo } from '../utils/excelExport';

interface BanksSummaryViewProps {
  transacciones: Transaccion[];
  empresaFiltro: string;
}

export const BanksSummaryView: React.FC<BanksSummaryViewProps> = ({
  transacciones,
  empresaFiltro,
}) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('');

  const meses = [...new Set(transacciones.map(t => t.fecha.slice(0, 7)))].sort();
  const bancos = [...new Set(transacciones.map(t => t.banco))].sort();

  const txFiltradas = mesSeleccionado
    ? transacciones.filter(t => t.fecha.startsWith(mesSeleccionado))
    : transacciones;

  // Resumen consolidado por banco
  const resumenPorBanco = bancos.map(b => {
    const txB = txFiltradas.filter(t => t.banco === b);
    const ingresos = txB.filter(t => t.monto > 0).reduce((s, t) => s + t.monto, 0);
    const egresos = txB.filter(t => t.monto < 0).reduce((s, t) => s + Math.abs(t.monto), 0);
    const neto = ingresos - egresos;
    const ultimoSaldo = txB.slice(-1)[0]?.saldo ?? null;

    // Transferencias propias
    const trfIn = txB
      .filter(t => t.monto > 0 && t.grupo === 'TRANSFERENCIAS_INTERNAS')
      .reduce((s, t) => s + t.monto, 0);
    const trfOut = txB
      .filter(t => t.monto < 0 && t.grupo === 'TRANSFERENCIAS_INTERNAS')
      .reduce((s, t) => s + Math.abs(t.monto), 0);

    return {
      banco: b,
      operaciones: txB.length,
      ingresos,
      egresos,
      neto,
      ultimoSaldo,
      trfIn,
      trfOut,
      trfNeto: trfIn - trfOut,
    };
  });

  // Control de Transferencias Internas (debe ser exactamente 0 a nivel global)
  const totalTrfInGlobal = txFiltradas
    .filter(t => t.monto > 0 && t.grupo === 'TRANSFERENCIAS_INTERNAS')
    .reduce((s, t) => s + t.monto, 0);
  const totalTrfOutGlobal = txFiltradas
    .filter(t => t.monto < 0 && t.grupo === 'TRANSFERENCIAS_INTERNAS')
    .reduce((s, t) => s + Math.abs(t.monto), 0);
  const diferenciaTrfGlobal = Math.round((totalTrfInGlobal - totalTrfOutGlobal) * 100) / 100;
  const transferenciasCompensadas = Math.abs(diferenciaTrfGlobal) < 1.0;

  return (
    <div className="space-y-6">
      {/* Control de Transferencias entre Cuentas Propias */}
      <div
        className={`rounded-xl border p-5 shadow-xs ${
          transferenciasCompensadas
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg mt-0.5 ${
                transferenciasCompensadas ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Control de Transferencias entre Cuentas Propias (Consolidado Interbancario)
              </h3>
              <p className="text-xs mt-1 text-slate-700 max-w-2xl">
                Al consolidar todos los bancos de la empresa, las transferencias entre cuentas propias
                deben dar una suma algebraica de <strong>0,00 Bs</strong> (todo egreso de Banesco debe
                tener su ingreso espejo en BNC o viceversa). Esto demuestra formalmente ante el SENIAT
                que no existe omisión de depósitos ni doble contabilización.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-slate-600 font-medium">Balance Transferencias Propias:</div>
            <div
              className={`text-xl font-bold tabular-nums ${
                transferenciasCompensadas ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              Bs. {formatearBolivares(diferenciaTrfGlobal)}
            </div>
            <div className="text-[11px] font-semibold flex items-center justify-end gap-1 mt-0.5">
              {transferenciasCompensadas ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ✔ Compensan perfectamente (0,00 Bs)
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Diferencia detectada: verificar corte de mes
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla por Banco */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#0022F5]" />
            <span className="text-sm font-bold text-slate-900">
              Resumen de Cuentas por Banco y Empresa
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={mesSeleccionado}
              onChange={e => setMesSeleccionado(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700"
            >
              <option value="">Todos los meses acumulados</option>
              {meses.map(m => (
                <option key={m} value={m}>
                  {nombreMesLargo(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Banco / Cuenta</th>
                <th className="py-3 px-3 text-center">Operaciones</th>
                <th className="py-3 px-3 text-right text-emerald-700">Ingresos (Bs)</th>
                <th className="py-3 px-3 text-right text-rose-700">Egresos (Bs)</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900">Flujo Neto</th>
                <th className="py-3 px-3 text-right text-purple-700">Traspasos Cuentas Propias</th>
                <th className="py-3 px-4 text-right">Saldo Final Banco</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {resumenPorBanco.map(r => (
                <tr key={r.banco} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0022F5]"></span>
                    {r.banco}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-slate-600">
                    {r.operaciones}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-[#00B32C] font-semibold">
                    {formatearBolivares(r.ingresos)}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-[#E52229] font-semibold">
                    {formatearBolivares(r.egresos)}
                  </td>
                  <td
                    className={`py-3.5 px-3 text-right tabular-nums font-bold ${
                      r.neto >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {r.neto >= 0 ? '+' : ''}
                    {formatearBolivares(r.neto)}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-purple-800">
                    <span title={`Entradas: +${formatearBolivares(r.trfIn)} | Salidas: -${formatearBolivares(r.trfOut)}`}>
                      {r.trfNeto > 0 ? '+' : ''}
                      {formatearBolivares(r.trfNeto)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right tabular-nums font-mono text-slate-700">
                    {r.ultimoSaldo != null ? `Bs. ${formatearBolivares(r.ultimoSaldo)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-xs text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-4 uppercase">Total Consolidado</td>
                <td className="py-3 px-3 text-center tabular-nums">
                  {resumenPorBanco.reduce((s, r) => s + r.operaciones, 0)}
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-[#00B32C]">
                  {formatearBolivares(resumenPorBanco.reduce((s, r) => s + r.ingresos, 0))}
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-[#E52229]">
                  {formatearBolivares(resumenPorBanco.reduce((s, r) => s + r.egresos, 0))}
                </td>
                <td className="py-3 px-3 text-right tabular-nums">
                  {formatearBolivares(resumenPorBanco.reduce((s, r) => s + r.neto, 0))}
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-purple-900">
                  {formatearBolivares(diferenciaTrfGlobal)}
                </td>
                <td className="py-3 px-4 text-right font-normal text-slate-500">
                  Consolidado
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
