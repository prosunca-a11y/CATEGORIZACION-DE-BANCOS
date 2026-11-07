/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag,
  CheckSquare,
  Square,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Transaccion, SoporteStatus, ClasificacionGrupo } from '../types';
import { formatearBolivares } from '../utils/excelExport';

interface TransactionsTableProps {
  transacciones: Transaccion[];
  onActualizarCategoria: (id: string, nuevaCategoria: string) => void;
  onActualizarSoporte: (id: string, nuevoEstado: SoporteStatus, docRef?: string) => void;
  onActualizacionMasiva: (ids: string[], nuevaCategoria?: string, nuevoEstadoSoporte?: SoporteStatus) => void;
  categoriasExistentes: string[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transacciones,
  onActualizarCategoria,
  onActualizarSoporte,
  onActualizacionMasiva,
  categoriasExistentes,
}) => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'I' | 'E'>('TODOS');
  const [filtroMes, setFiltroMes] = useState<string>('');
  const [filtroBanco, setFiltroBanco] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [filtroSoporte, setFiltroSoporte] = useState<string>('');
  const [ordenCampo, setOrdenCampo] = useState<'fecha' | 'monto' | 'descripcion'>('fecha');
  const [ordenAsc, setOrdenAsc] = useState<boolean>(false);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [modalMasivo, setModalMasivo] = useState<boolean>(false);
  const [categoriaMasiva, setCategoriaMasiva] = useState<string>('');
  const [soporteMasivo, setSoporteMasivo] = useState<SoporteStatus>('ubicado');
  const [editandoDocId, setEditandoDocId] = useState<string | null>(null);
  const [docTemp, setDocTemp] = useState<string>('');

  const itemsPorPagina = 50;

  const meses = useMemo(
    () => [...new Set(transacciones.map(t => t.fecha.slice(0, 7)))].sort(),
    [transacciones]
  );
  const bancos = useMemo(
    () => [...new Set(transacciones.map(t => t.banco))].sort(),
    [transacciones]
  );
  const categorias = useMemo(
    () => [...new Set(transacciones.map(t => t.categoria))].sort(),
    [transacciones]
  );

  // Filtrado y ordenamiento de alta velocidad
  const filtradas = useMemo(() => {
    let result = transacciones;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      result = result.filter(
        t =>
          t.descripcion.toLowerCase().includes(q) ||
          t.referencia.toLowerCase().includes(q) ||
          t.categoria.toLowerCase().includes(q) ||
          t.banco.toLowerCase().includes(q) ||
          (t.soporteDoc && t.soporteDoc.toLowerCase().includes(q))
      );
    }

    if (filtroTipo !== 'TODOS') {
      result = result.filter(t => t.tipo === filtroTipo);
    }

    if (filtroMes) {
      result = result.filter(t => t.fecha.startsWith(filtroMes));
    }

    if (filtroBanco) {
      result = result.filter(t => t.banco === filtroBanco);
    }

    if (filtroCategoria) {
      result = result.filter(t => t.categoria === filtroCategoria);
    }

    if (filtroSoporte) {
      result = result.filter(t => t.soporteEstado === filtroSoporte);
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      if (ordenCampo === 'fecha') {
        cmp = a.fecha.localeCompare(b.fecha);
      } else if (ordenCampo === 'monto') {
        cmp = Math.abs(a.monto) - Math.abs(b.monto);
      } else if (ordenCampo === 'descripcion') {
        cmp = a.descripcion.localeCompare(b.descripcion);
      }
      return ordenAsc ? cmp : -cmp;
    });
  }, [
    transacciones,
    busqueda,
    filtroTipo,
    filtroMes,
    filtroBanco,
    filtroCategoria,
    filtroSoporte,
    ordenCampo,
    ordenAsc,
  ]);

  const totalPaginas = Math.ceil(filtradas.length / itemsPorPagina) || 1;
  const paginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return filtradas.slice(inicio, inicio + itemsPorPagina);
  }, [filtradas, paginaActual]);

  const alternarSeleccion = (id: string) => {
    const next = new Set(seleccionados);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSeleccionados(next);
  };

  const seleccionarTodosVisibles = () => {
    if (seleccionados.size === paginadas.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(paginadas.map(p => p.id)));
    }
  };

  const aplicarAccionMasiva = () => {
    if (!seleccionados.size) return;
    onActualizacionMasiva(Array.from(seleccionados), categoriaMasiva || undefined, soporteMasivo);
    setModalMasivo(false);
    setSeleccionados(new Set());
    setCategoriaMasiva('');
  };

  const alternarOrden = (campo: 'fecha' | 'monto' | 'descripcion') => {
    if (ordenCampo === campo) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenCampo(campo);
      setOrdenAsc(false);
    }
  };

  const abrirEditorDoc = (t: Transaccion) => {
    setEditandoDocId(t.id);
    setDocTemp(t.soporteDoc || '');
  };

  const guardarDoc = (id: string) => {
    const tx = transacciones.find(t => t.id === id);
    if (tx) {
      onActualizarSoporte(id, tx.soporteEstado, docTemp.trim());
    }
    setEditandoDocId(null);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Búsqueda en vivo */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por concepto, referencia, monto, banco o factura..."
              value={busqueda}
              onChange={e => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0022F5]"
            />
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tipo */}
            <select
              value={filtroTipo}
              onChange={e => {
                setFiltroTipo(e.target.value as any);
                setPaginaActual(1);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
            >
              <option value="TODOS">Ingresos y Egresos</option>
              <option value="I">Solo Ingresos (+)</option>
              <option value="E">Solo Egresos (-)</option>
            </select>

            {/* Mes */}
            <select
              value={filtroMes}
              onChange={e => {
                setFiltroMes(e.target.value);
                setPaginaActual(1);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="">Todos los meses</option>
              {meses.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Banco */}
            <select
              value={filtroBanco}
              onChange={e => {
                setFiltroBanco(e.target.value);
                setPaginaActual(1);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="">Todos los bancos</option>
              {bancos.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Soporte Status */}
            <select
              value={filtroSoporte}
              onChange={e => {
                setFiltroSoporte(e.target.value);
                setPaginaActual(1);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="">Todos los soportes</option>
              <option value="ubicado">Soporte Ubicado (Listo)</option>
              <option value="pendiente">Soporte Pendiente</option>
            </select>

            {(busqueda || filtroTipo !== 'TODOS' || filtroMes || filtroBanco || filtroCategoria || filtroSoporte) && (
              <button
                onClick={() => {
                  setBusqueda('');
                  setFiltroTipo('TODOS');
                  setFiltroMes('');
                  setFiltroBanco('');
                  setFiltroCategoria('');
                  setFiltroSoporte('');
                  setPaginaActual(1);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Barra de Acciones Masivas cuando hay seleccionados */}
        {seleccionados.size > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between bg-blue-50/60 p-2 rounded-lg">
            <span className="text-xs font-semibold text-blue-900">
              {seleccionados.size} operación(es) seleccionada(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalMasivo(true)}
                className="px-3 py-1 bg-[#0022F5] text-white text-xs font-medium rounded-md hover:bg-[#0018B8] transition-colors cursor-pointer"
              >
                Cambiar categoría / soporte en lote
              </button>
              <button
                onClick={() => setSeleccionados(new Set())}
                className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Deseleccionar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginadas.length > 0 && seleccionados.size === paginadas.length}
                    onChange={seleccionarTodosVisibles}
                    className="rounded border-slate-300 text-[#0022F5] focus:ring-[#0022F5] cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => alternarOrden('fecha')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Fecha <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrden('descripcion')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Descripción Bancaria <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Referencia</th>
                <th
                  onClick={() => alternarOrden('monto')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Monto (Bs) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Categoría Asignada</th>
                <th className="py-2.5 px-3">Soporte SENIAT</th>
                <th className="py-2.5 px-3">Banco</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginadas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No se encontraron transacciones con los filtros actuales.
                  </td>
                </tr>
              ) : (
                paginadas.map(t => {
                  const esIngreso = t.monto > 0;
                  const seleccionado = seleccionados.has(t.id);

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        seleccionado ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => alternarSeleccion(t.id)}
                          className="rounded border-slate-300 text-[#0022F5] focus:ring-[#0022F5] cursor-pointer"
                        />
                      </td>

                      {/* Fecha */}
                      <td className="py-2 px-3 whitespace-nowrap tabular-nums font-mono text-slate-600 text-[11px]">
                        {t.fecha.split('-').reverse().join('/')}
                      </td>

                      {/* Descripción */}
                      <td className="py-2 px-3 max-w-[340px]">
                        <div className="font-medium text-slate-900 truncate" title={t.descripcion}>
                          {t.descripcion}
                        </div>
                        {t.reglaAplicada && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                            <span className="truncate">{t.reglaAplicada}</span>
                          </div>
                        )}
                      </td>

                      {/* Referencia */}
                      <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                        {t.referencia || '—'}
                      </td>

                      {/* Monto */}
                      <td
                        className={`py-2 px-3 text-right tabular-nums font-bold whitespace-nowrap ${
                          esIngreso ? 'text-[#00B32C]' : 'text-[#E52229]'
                        }`}
                      >
                        {esIngreso ? '+' : ''}
                        {formatearBolivares(t.monto)}
                      </td>

                      {/* Selector de Categoría Editable */}
                      <td className="py-2 px-3 max-w-[220px]">
                        <select
                          value={t.categoria}
                          onChange={e => onActualizarCategoria(t.id, e.target.value)}
                          className="w-full text-[11px] font-medium py-1 px-1.5 border border-slate-200 rounded bg-white text-slate-800 hover:border-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0022F5] cursor-pointer"
                        >
                          {categoriasExistentes.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Soporte SENIAT y Estado */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              onActualizarSoporte(
                                t.id,
                                t.soporteEstado === 'ubicado' ? 'pendiente' : 'ubicado',
                                t.soporteDoc
                              )
                            }
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                              t.soporteEstado === 'ubicado'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Haz clic para alternar entre Ubicado y Pendiente"
                          >
                            {t.soporteEstado === 'ubicado' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                Ubicado
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-700" />
                                Pendiente
                              </>
                            )}
                          </button>

                          {/* Número de documento o edición */}
                          {editandoDocId === t.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={docTemp}
                                onChange={e => setDocTemp(e.target.value)}
                                placeholder="N° Fact/Doc"
                                className="w-24 text-[10px] px-1.5 py-0.5 border border-blue-400 rounded focus:outline-hidden"
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === 'Enter') guardarDoc(t.id);
                                  if (e.key === 'Escape') setEditandoDocId(null);
                                }}
                              />
                              <button
                                onClick={() => guardarDoc(t.id)}
                                className="text-[10px] text-blue-600 font-bold hover:underline"
                              >
                                OK
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => abrirEditorDoc(t)}
                              className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer"
                              title="Asignar N° Factura / Planilla SENIAT"
                            >
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="font-mono">
                                {t.soporteDoc || 'Asignar N°'}
                              </span>
                            </button>
                          )}
                        </div>
                        <div
                          className="text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5"
                          title={t.soporteRequerido}
                        >
                          {t.soporteRequerido}
                        </div>
                      </td>

                      {/* Banco */}
                      <td className="py-2 px-3 whitespace-nowrap text-[11px] text-slate-600">
                        {t.banco}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Mostrando{' '}
            <span className="font-semibold text-slate-900">
              {filtradas.length > 0 ? (paginaActual - 1) * itemsPorPagina + 1 : 0}
            </span>{' '}
            a{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(paginaActual * itemsPorPagina, filtradas.length)}
            </span>{' '}
            de <span className="font-semibold text-slate-900">{filtradas.length}</span> operaciones
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
              disabled={paginaActual === 1}
              className="p-1 rounded border border-slate-300 hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="p-1 rounded border border-slate-300 hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Asignación Masiva */}
      {modalMasivo && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Editar en lote {seleccionados.size} operación(es)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Aplica una misma categoría y estado de soporte legal a todas las operaciones seleccionadas.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nueva Categoría:
                </label>
                <select
                  value={categoriaMasiva}
                  onChange={e => setCategoriaMasiva(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0022F5] focus:outline-hidden"
                >
                  <option value="">-- Dejar categoría actual --</option>
                  {categoriasExistentes.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado de Soporte Legal:
                </label>
                <select
                  value={soporteMasivo}
                  onChange={e => setSoporteMasivo(e.target.value as SoporteStatus)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0022F5] focus:outline-hidden"
                >
                  <option value="ubicado">Ubicado / Listo para fiscalización</option>
                  <option value="pendiente">Pendiente de ubicar soporte</option>
                  <option value="no_requerido">No Requerido</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setModalMasivo(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={aplicarAccionMasiva}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0022F5] hover:bg-[#0018B8] rounded-lg shadow-xs cursor-pointer"
              >
                Aplicar a las {seleccionados.size} seleccionadas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
