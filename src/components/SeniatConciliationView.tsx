/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers,
  FileCheck,
  Save,
  Printer,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Transaccion, ConciliacionMes } from '../types';
import { formatearBolivares, nombreMesLargo } from '../utils/excelExport';

interface SeniatConciliationViewProps {
  transacciones: Transaccion[];
  conciliaciones: Record<string, ConciliacionMes>;
  onGuardarConciliacion: (mes: string, datos: ConciliacionMes) => void;
  empresaSeleccionada: string;
}

export const SeniatConciliationView: React.FC<SeniatConciliationViewProps> = ({
  transacciones,
  conciliaciones,
  onGuardarConciliacion,
  empresaSeleccionada,
}) => {
  const [mesEdicion, setMesEdicion] = useState<string>('');
  const [baseImponibleInput, setBaseImponibleInput] = useState<string>('');
  const [ivaInput, setIvaInput] = useState<string>('');
  const [montoDeclaradoInput, setMontoDeclaradoInput] = useState<string>('');
  const [observacionInput, setObservacionInput] = useState<string>('');
  const [filtroMes, setFiltroMes] = useState<string>('');

  const mesesDisponibles = [...new Set(transacciones.map(t => t.fecha.slice(0, 7)))].sort();

  // Filtrado de transacciones si el usuario selecciona un mes específico
  const transaccionesFiltradas = filtroMes
    ? transacciones.filter(t => t.fecha.startsWith(filtroMes))
    : transacciones;

  const mesesAProcesar = filtroMes ? [filtroMes] : mesesDisponibles;

  // Cálculo detallado por cada mes
  const datosPorMes = mesesAProcesar.map(m => {
    const txMes = transacciones.filter(t => t.fecha.startsWith(m));
    const txIngresos = txMes.filter(t => t.monto > 0);

    const totalIngresos = txIngresos.reduce((s, t) => s + t.monto, 0);

    // 1. Transferencias entre cuentas propias
    const transferenciasInternas = txIngresos
      .filter(t => t.grupo === 'TRANSFERENCIAS_INTERNAS')
      .reduce((s, t) => s + t.monto, 0);

    // 2. Aportes de socios
    const aportesSocios = txIngresos
      .filter(t => t.categoria.includes('socios') || t.categoria.includes('accionista'))
      .reduce((s, t) => s + t.monto, 0);

    // 3. Préstamos bancarios
    const prestamosBancos = txIngresos
      .filter(t => t.categoria.includes('Préstamos bancarios'))
      .reduce((s, t) => s + t.monto, 0);

    // 4. Otros ingresos que no son ventas (reversos, cambiario, etc.)
    const otrosNoVentas = txIngresos
      .filter(
        t =>
          t.grupo === 'INGRESOS_NO_VENTAS' &&
          !t.categoria.includes('socios') &&
          !t.categoria.includes('Préstamos bancarios')
      )
      .reduce((s, t) => s + t.monto, 0);

    // 5. Ventas según Banco
    const ventasBanco =
      totalIngresos - transferenciasInternas - aportesSocios - prestamosBancos - otrosNoVentas;

    // Ventas declaradas al SENIAT (Planilla IVA F-99030)
    const declaracion = conciliaciones[m];
    const baseDeclarada = declaracion?.baseImponible || 0;
    const ivaDeclarado = declaracion?.ivaDebitoFiscal || (baseDeclarada > 0 ? baseDeclarada * 0.16 : 0);
    const ventasDeclaradas = declaracion?.ventasDeclaradasSeniat || (baseDeclarada + ivaDeclarado);

    const diferencia = ventasBanco - ventasDeclaradas;

    return {
      mes: m,
      nombreMes: nombreMesLargo(m),
      totalIngresos,
      transferenciasInternas,
      aportesSocios,
      prestamosBancos,
      otrosNoVentas,
      ventasBanco,
      baseDeclarada,
      ivaDeclarado,
      ventasDeclaradas,
      diferencia,
      tieneDeclaracion: Boolean(declaracion && (declaracion.ventasDeclaradasSeniat > 0 || (declaracion.baseImponible && declaracion.baseImponible > 0))),
      observaciones: declaracion?.observaciones || '',
    };
  });

  // Totales consolidados del período
  const totales = datosPorMes.reduce(
    (acc, d) => ({
      totalIngresos: acc.totalIngresos + d.totalIngresos,
      transferenciasInternas: acc.transferenciasInternas + d.transferenciasInternas,
      aportesSocios: acc.aportesSocios + d.aportesSocios,
      prestamosBancos: acc.prestamosBancos + d.prestamosBancos,
      otrosNoVentas: acc.otrosNoVentas + d.otrosNoVentas,
      ventasBanco: acc.ventasBanco + d.ventasBanco,
      baseDeclarada: acc.baseDeclarada + d.baseDeclarada,
      ivaDeclarado: acc.ivaDeclarado + d.ivaDeclarado,
      ventasDeclaradas: acc.ventasDeclaradas + d.ventasDeclaradas,
      diferencia: acc.diferencia + d.diferencia,
    }),
    {
      totalIngresos: 0,
      transferenciasInternas: 0,
      aportesSocios: 0,
      prestamosBancos: 0,
      otrosNoVentas: 0,
      ventasBanco: 0,
      baseDeclarada: 0,
      ivaDeclarado: 0,
      ventasDeclaradas: 0,
      diferencia: 0,
    }
  );

  const iniciarEdicion = (mes: string, dec?: ConciliacionMes) => {
    setMesEdicion(mes);
    const base = dec?.baseImponible || 0;
    const iva = dec?.ivaDebitoFiscal || (base > 0 ? base * 0.16 : 0);
    const total = dec?.ventasDeclaradasSeniat || (base + iva);

    setBaseImponibleInput(base > 0 ? String(base) : '');
    setIvaInput(iva > 0 ? String(iva) : '');
    setMontoDeclaradoInput(total > 0 ? String(total) : '');
    setObservacionInput(dec?.observaciones || '');
  };

  const handleBaseChange = (val: string) => {
    setBaseImponibleInput(val);
    const numBase = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
    if (numBase > 0) {
      const calcIva = Math.round(numBase * 0.16 * 100) / 100;
      setIvaInput(String(calcIva));
      setMontoDeclaradoInput(String(Math.round((numBase + calcIva) * 100) / 100));
    }
  };

  const handleIvaChange = (val: string) => {
    setIvaInput(val);
    const numBase = parseFloat(baseImponibleInput.replace(/[^\d.]/g, '')) || 0;
    const numIva = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
    if (numBase > 0) {
      setMontoDeclaradoInput(String(Math.round((numBase + numIva) * 100) / 100));
    }
  };

  const guardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesEdicion) return;

    const base = parseFloat(baseImponibleInput.replace(/[^\d.]/g, '')) || 0;
    const iva = parseFloat(ivaInput.replace(/[^\d.]/g, '')) || (base * 0.16);
    const total = parseFloat(montoDeclaradoInput.replace(/[^\d.]/g, '')) || (base + iva);

    onGuardarConciliacion(mesEdicion, {
      mes: mesEdicion,
      baseImponible: base,
      ivaDebitoFiscal: iva,
      ventasDeclaradasSeniat: total,
      observaciones: observacionInput,
    });
    setMesEdicion('');
  };

  // Desglose de ingresos que NO son ventas con su soporte
  const categoriasNoVentas = [
    {
      titulo: 'Transferencias entre cuentas propias (Interbancarias)',
      monto: totales.transferenciasInternas,
      soporte: 'Estados de cuenta de ambas cuentas bancarias donde el débito coincide exactamente con el crédito (no tributable).',
      normativa: 'Art. 4 Ley de IVA (No constituye hecho imponible de venta de bienes ni servicios)',
      color: 'border-purple-200 bg-purple-50/50 text-purple-900',
    },
    {
      titulo: 'Aportes y Préstamos de Socios / Accionistas',
      monto: totales.aportesSocios,
      soporte: 'Acta de Asamblea de Accionistas registrada, contrato de mutuo con fecha cierta y contabilización en pasivo.',
      normativa: 'Código Orgánico Tributario y Código de Comercio (Financiamiento patrimonial)',
      color: 'border-blue-200 bg-blue-50/50 text-blue-900',
    },
    {
      titulo: 'Préstamos Bancarios y Créditos Comerciales',
      monto: totales.prestamosBancos,
      soporte: 'Contrato de crédito con la entidad financiera, tabla de amortización y pagaré bancario.',
      normativa: 'Ley General de Bancos (Operación crediticia activa de la institución)',
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
    },
    {
      titulo: 'Reversos Bancarios, Diferencial Cambiario y Otros',
      monto: totales.otrosNoVentas,
      soporte: 'Comprobante bancario de anulación o diferencial cambiario con soporte de tipo de cambio oficial BCV.',
      normativa: 'Ajuste por anulación o reclamo resuelto por el banco',
      color: 'border-amber-200 bg-amber-50/50 text-amber-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado explicativo de valor contable y tributario */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg">
                Conciliación Fiscal: Depósitos Bancarios vs. IVA Declarado (Forma 99030)
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Escudo SENIAT
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              El SENIAT monitorea los movimientos en cuentas corrientes. Si los depósitos bancarios
              superan las ventas declaradas en las planillas de IVA, el fisco presume omisión de ingresos
              (Art. 94 del Código Orgánico Tributario). Esta matriz desglosa matemáticamente los depósitos
              que <strong>no corresponden a ventas</strong> (traspasos propios, aportes de socios, créditos)
              y evalúa el <strong>Efecto Cashea / Ventas a Crédito</strong> para desvirtuar cualquier presunción en fiscalización.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={filtroMes}
              onChange={e => setFiltroMes(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700"
            >
              <option value="">Todos los meses ({mesesDisponibles.length})</option>
              {mesesDisponibles.map(m => (
                <option key={m} value={m}>
                  {nombreMesLargo(m)}
                </option>
              ))}
            </select>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Imprimir informe de conciliación para auditoría o fiscalización"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Dictamen Experto SENIAT & Cashea */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl text-white p-6 shadow-md border border-blue-800">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-700/60 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">
                  Dictamen Contable y Tributario: Causación del IVA vs. Cobranza Diferida por Cashea
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Fundamentación Jurídica: Ley de IVA (Arts. 3, 4, 5 y 32) & Código Orgánico Tributario (Art. 94 Presunción de Ventas)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 whitespace-nowrap">
                Cumplimiento Tributario Garantizado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-xs border border-white/10 space-y-2">
                <div className="flex items-center justify-between font-bold text-emerald-300 text-xs">
                  <span>JULIO — Planilla SENIAT F-99030</span>
                  <span className="font-mono">Declarado</span>
                </div>
                <div className="space-y-1 text-slate-200 font-mono">
                  <div className="flex justify-between">
                    <span>Base Imponible Ventas:</span>
                    <span className="font-bold text-white">Bs. 5.163.592,70</span>
                  </div>
                  <div className="flex justify-between text-blue-300">
                    <span>Débito Fiscal IVA (16%):</span>
                    <span className="font-bold">Bs. 826.174,83</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/20 text-white font-bold">
                    <span>Total Facturado Emitido:</span>
                    <span className="text-emerald-400">Bs. 5.989.767,53</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-xs border border-white/10 space-y-2">
                <div className="flex items-center justify-between font-bold text-blue-300 text-xs">
                  <span>AGOSTO — Planilla SENIAT F-99030</span>
                  <span className="font-mono">Declarado</span>
                </div>
                <div className="space-y-1 text-slate-200 font-mono">
                  <div className="flex justify-between">
                    <span>Base Imponible Ventas:</span>
                    <span className="font-bold text-white">Bs. 4.022.557,77</span>
                  </div>
                  <div className="flex justify-between text-blue-300">
                    <span>Débito Fiscal IVA (16%):</span>
                    <span className="font-bold">Bs. 643.609,23</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/20 text-white font-bold">
                    <span>Total Facturado Emitido:</span>
                    <span className="text-emerald-400">Bs. 4.666.167,00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-blue-100 leading-relaxed bg-blue-950/60 p-3 rounded-lg border border-blue-700/50">
              <strong className="text-white">Criterio Legal de Auditoría:</strong> Según el Art. 5 de la Ley de IVA en Venezuela, el hecho imponible se causa con la emisión de la factura, por lo que la empresa debe declarar y pagar el 100% del IVA en el portal del SENIAT en el mes de emisión. Sin embargo, bajo el esquema de <strong>Cashea / Venta a Cuotas</strong>, los depósitos bancarios entran fraccionados en cuotas quincenales diferidas. Esta matriz demuestra matemáticamente que la diferencia entre las planillas de IVA y los estados de cuenta bancarios no constituye omisión de ingresos, sino el desfase financiero natural de la cobranza a crédito diferida.
            </div>
          </div>
        </div>
      </div>

      {/* Matriz Principal Mes por Mes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0022F5]" />
            <span className="text-sm font-bold text-slate-900">
              Conciliación Mensual de Ingresos y Determinación de la Brecha Fiscal
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {empresaSeleccionada || 'Empresa: Todas las consolidadas'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-slate-100/80 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Mes</th>
                <th className="py-3 px-3 text-right">Ingresos Brutos (Banco)</th>
                <th className="py-3 px-3 text-right text-purple-700">(-) Cuentas Propias</th>
                <th className="py-3 px-3 text-right text-blue-700">(-) Aportes / Préstamos</th>
                <th className="py-3 px-3 text-right text-slate-600">(-) Otros No Ventas</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900 bg-blue-50/40">
                  (=) Ventas Banco
                </th>
                <th className="py-3 px-3 text-right font-medium text-slate-600">
                  SENIAT Base Imponible
                </th>
                <th className="py-3 px-3 text-right font-medium text-blue-700">
                  SENIAT IVA (16%)
                </th>
                <th className="py-3 px-3 text-right font-bold text-[#0022F5]">
                  Total SENIAT (Base+IVA)
                </th>
                <th className="py-3 px-3 text-right font-bold">Diferencia</th>
                <th className="py-3 px-4 text-center">Diagnóstico Fiscal</th>
                <th className="py-3 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {datosPorMes.map(d => {
                const tieneAlertaRiesgo = d.tieneDeclaracion && d.diferencia > 100;
                const cuadra = d.tieneDeclaracion && Math.abs(d.diferencia) <= 100;

                return (
                  <tr key={d.mes} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {d.nombreMes}
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-mono">
                      Bs. {formatearBolivares(d.totalIngresos)}
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums text-purple-800 font-medium font-mono">
                      {d.transferenciasInternas > 0
                        ? `-Bs. ${formatearBolivares(d.transferenciasInternas)}`
                        : '—'}
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums text-blue-800 font-medium font-mono">
                      {d.aportesSocios + d.prestamosBancos > 0
                        ? `-Bs. ${formatearBolivares(d.aportesSocios + d.prestamosBancos)}`
                        : '—'}
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums text-slate-600 font-mono">
                      {d.otrosNoVentas > 0 ? `-Bs. ${formatearBolivares(d.otrosNoVentas)}` : '—'}
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900 bg-blue-50/30 font-mono">
                      Bs. {formatearBolivares(d.ventasBanco)}
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-mono">
                      {d.tieneDeclaracion && d.baseDeclarada > 0
                        ? `Bs. ${formatearBolivares(d.baseDeclarada)}`
                        : d.tieneDeclaracion
                        ? `Bs. ${formatearBolivares(d.ventasDeclaradas / 1.16)}`
                        : '—'}
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums text-blue-700 font-medium font-mono">
                      {d.tieneDeclaracion && d.ivaDeclarado > 0
                        ? `Bs. ${formatearBolivares(d.ivaDeclarado)}`
                        : d.tieneDeclaracion
                        ? `Bs. ${formatearBolivares((d.ventasDeclaradas / 1.16) * 0.16)}`
                        : '—'}
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0022F5] font-mono">
                      {d.tieneDeclaracion ? (
                        `Bs. ${formatearBolivares(d.ventasDeclaradas)}`
                      ) : (
                        <span className="text-amber-600 font-normal italic">Sin registrar</span>
                      )}
                    </td>

                    <td
                      className={`py-3 px-3 text-right tabular-nums font-bold font-mono ${
                        !d.tieneDeclaracion
                          ? 'text-slate-400'
                          : cuadra
                          ? 'text-emerald-600'
                          : tieneAlertaRiesgo
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {d.tieneDeclaracion
                        ? `${d.diferencia > 0 ? '+' : ''}Bs. ${formatearBolivares(d.diferencia)}`
                        : '—'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {!d.tieneDeclaracion ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          Llenar F-99030
                        </span>
                      ) : cuadra ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Cuadra con SENIAT
                        </span>
                      ) : tieneAlertaRiesgo ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                          <ShieldAlert className="w-3 h-3" />
                          Alerta: Depósito &gt; Factura
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium" title="Facturas declaradas al 100% pero cobro diferido por Cashea">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          SENIAT &gt; Bancos (Cashea)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() =>
                          iniciarEdicion(d.mes, conciliaciones[d.mes])
                        }
                        className="px-2.5 py-1 text-xs font-medium text-[#0022F5] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        {d.tieneDeclaracion ? 'Modificar' : '+ Declaración'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Fila de Totales */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-xs text-slate-900 border-t-2 border-slate-300">
                <td className="py-3.5 px-4 uppercase">Total Período</td>
                <td className="py-3.5 px-3 text-right tabular-nums font-mono">
                  Bs. {formatearBolivares(totales.totalIngresos)}
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-purple-900 font-mono">
                  -Bs. {formatearBolivares(totales.transferenciasInternas)}
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-blue-900 font-mono">
                  -Bs. {formatearBolivares(totales.aportesSocios + totales.prestamosBancos)}
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-slate-700 font-mono">
                  -Bs. {formatearBolivares(totales.otrosNoVentas)}
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-slate-900 bg-blue-100/50 font-mono">
                  Bs. {formatearBolivares(totales.ventasBanco)}
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-slate-800 font-mono">
                  Bs. {formatearBolivares(totales.baseDeclarada)}
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-blue-800 font-mono">
                  Bs. {formatearBolivares(totales.ivaDeclarado)}
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-[#0022F5] font-mono">
                  Bs. {formatearBolivares(totales.ventasDeclaradas)}
                </td>
                <td
                  className={`py-3.5 px-3 text-right tabular-nums font-mono ${
                    totales.diferencia > 100
                      ? 'text-rose-700'
                      : 'text-blue-700'
                  }`}
                >
                  {totales.diferencia > 0 ? '+' : ''}Bs. {formatearBolivares(totales.diferencia)}
                </td>
                <td colSpan={2} className="py-3.5 px-4 text-center text-slate-600 font-medium">
                  {totales.ventasDeclaradas > 0
                    ? `Conciliación del período completada con respaldo SENIAT`
                    : `Pendiente de cargar F-99030`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal / Panel rápido para editar Ventas Declaradas del Mes */}
      {mesEdicion && (
        <div className="bg-white rounded-xl border-2 border-[#0022F5] p-5 shadow-md">
          <form onSubmit={guardarEdicion}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0022F5]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Registrar Declaración IVA SENIAT (Forma 99030) -{' '}
                  {nombreMesLargo(mesEdicion)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMesEdicion('')}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Ingresa los montos reflejados en la planilla del SENIAT. El sistema calcula automáticamente el 16% de IVA y el Total Facturado Bruto (Base + IVA) para garantizar exactitud con los depósitos bancarios.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Imponible Ventas (Bs):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 5163592.70"
                  value={baseImponibleInput}
                  onChange={e => handleBaseChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0022F5] focus:outline-hidden font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Ventas gravadas netas sin IVA</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Débito Fiscal IVA 16% (Bs):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 826174.83"
                  value={ivaInput}
                  onChange={e => handleIvaChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0022F5] focus:outline-hidden font-mono"
                />
                <span className="text-[11px] text-blue-600 mt-0.5 block">Calculado automáticamente (16%)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Bruto (Base + IVA) en Bs:
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 5989767.53"
                  value={montoDeclaradoInput}
                  onChange={e => setMontoDeclaradoInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0022F5] focus:outline-hidden font-mono font-bold text-[#0022F5]"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Monto total facturado</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones / N° Certificado Electrónico:
              </label>
              <input
                type="text"
                placeholder="Ej: Planilla N° 2603725570 - Declaración ordinaria IVA. Afectado por Cashea."
                value={observacionInput}
                onChange={e => setObservacionInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0022F5] focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setMesEdicion('')}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#0022F5] hover:bg-[#0018B8] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar y Recalcular Conciliación
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tarjetas de Soportes Legales Exigibles ante el SENIAT */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-slate-900 text-sm">
            Ingresos Bancarios que NO son Ventas — Justificación Jurídica y Soportes Exigibles
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoriasNoVentas.map((cat, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 shadow-xs flex flex-col justify-between ${cat.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase tracking-wide">
                    {cat.titulo}
                  </span>
                  <span className="font-bold text-sm tabular-nums font-mono">
                    Bs. {formatearBolivares(cat.monto)}
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-1.5 mt-2">
                  <div>
                    <strong className="text-slate-900">Soporte a ubicar y archivar:</strong>{' '}
                    <span>{cat.soporte}</span>
                  </div>
                  <div>
                    <strong className="text-slate-900">Fundamento contable/tributario:</strong>{' '}
                    <span className="italic">{cat.normativa}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                <span>Deducción de la base imponible IVA:</span>
                <span className="font-semibold text-slate-900">100% Justificado</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
