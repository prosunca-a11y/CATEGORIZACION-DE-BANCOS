/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Repeat,
  FileCheck2,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { formatearBolivares } from '../utils/excelExport';

interface KpiCardsProps {
  totalIngresos: number;
  totalEgresos: number;
  transferenciasInternas: number;
  ventasBanco: number;
  ventasDeclaradasSeniat: number;
  soportesPendientes: number;
  totalOperaciones: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalIngresos,
  totalEgresos,
  transferenciasInternas,
  ventasBanco,
  ventasDeclaradasSeniat,
  soportesPendientes,
  totalOperaciones,
}) => {
  const flujoNeto = totalIngresos + totalEgresos; // egresos son negativos
  const brechaSeniat = ventasBanco - ventasDeclaradasSeniat;
  const tieneAlertaSeniat = ventasDeclaradasSeniat > 0 && brechaSeniat > 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Ingresos */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wide">Ingresos Totales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            Bs. {formatearBolivares(totalIngresos)}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Ventas reales banco:</span>
          <span className="font-semibold text-emerald-700 tabular-nums">
            Bs. {formatearBolivares(ventasBanco)}
          </span>
        </div>
      </div>

      {/* 2. Total Egresos */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wide">Egresos Totales</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            Bs. {formatearBolivares(Math.abs(totalEgresos))}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Flujo neto bancario:</span>
          <span
            className={`font-semibold tabular-nums ${
              flujoNeto >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {flujoNeto >= 0 ? '+' : ''}Bs. {formatearBolivares(flujoNeto)}
          </span>
        </div>
      </div>

      {/* 3. Transferencias Cuentas Propias (Neutralizadas) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wide">Cuentas Propias</span>
            <Repeat className="w-4 h-4 text-[#7E00F5]" />
          </div>
          <div className="text-xl font-bold text-purple-900 tabular-nums">
            Bs. {formatearBolivares(transferenciasInternas)}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Efecto fiscal SENIAT:</span>
          <span className="font-semibold text-purple-700">No gravable (0 Bs)</span>
        </div>
      </div>

      {/* 4. Brecha Fiscal SENIAT */}
      <div
        className={`rounded-xl border p-4 shadow-xs flex flex-col justify-between ${
          tieneAlertaSeniat
            ? 'bg-amber-50/60 border-amber-300'
            : 'bg-white border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wide flex items-center gap-1">
              {tieneAlertaSeniat && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
              Conciliación SENIAT
            </span>
            <Scale className="w-4 h-4 text-[#0022F5]" />
          </div>
          <div
            className={`text-xl font-bold tabular-nums ${
              tieneAlertaSeniat ? 'text-amber-900' : 'text-slate-900'
            }`}
          >
            {ventasDeclaradasSeniat > 0
              ? `Bs. ${formatearBolivares(brechaSeniat)}`
              : 'Por Declarar'}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          {ventasDeclaradasSeniat > 0 ? (
            <>
              <span className="text-slate-500">Ventas SENIAT F-99030:</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                Bs. {formatearBolivares(ventasDeclaradasSeniat)}
              </span>
            </>
          ) : (
            <span className="text-amber-700 font-medium">Ingresa F-99030 para cuadre</span>
          )}
        </div>
      </div>

      {/* 5. Soportes Requeridos */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wide">Soportes SENIAT</span>
            <FileCheck2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {soportesPendientes}{' '}
            <span className="text-xs font-normal text-slate-500">pendientes</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Total operaciones:</span>
          <span className="font-semibold text-slate-800 tabular-nums">{totalOperaciones}</span>
        </div>
      </div>
    </div>
  );
};
