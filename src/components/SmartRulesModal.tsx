/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Play,
  Trash2,
  CheckCircle,
  Sparkles,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { ReglaInteligente, ClasificacionGrupo, TipoTransaccion } from '../types';

interface SmartRulesModalProps {
  reglas: ReglaInteligente[];
  onAgregarRegla: (nuevaRegla: Omit<ReglaInteligente, 'id' | 'esSistema'>) => void;
  onEliminarRegla: (id: string) => void;
  onAlternarRegla: (id: string) => void;
  onEjecutarReglasSobreTodo: () => void;
  categoriasExistentes: string[];
}

export const SmartRulesModal: React.FC<SmartRulesModalProps> = ({
  reglas,
  onAgregarRegla,
  onEliminarRegla,
  onAlternarRegla,
  onEjecutarReglasSobreTodo,
  categoriasExistentes,
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
  const [nombre, setNombre] = useState<string>('');
  const [tipo, setTipo] = useState<'I' | 'E' | 'AMBOS'>('E');
  const [patron, setPatron] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [categoriaNueva, setCategoriaNueva] = useState<string>('');
  const [grupo, setGrupo] = useState<ClasificacionGrupo>('PAGO_PROVEEDORES');
  const [soporte, setSoporte] = useState<string>('');

  const guardarNuevaRegla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !patron.trim()) return;

    const catFinal = categoria === '__NUEVA__' ? categoriaNueva.trim() : categoria;
    if (!catFinal) return;

    onAgregarRegla({
      nombre: nombre.trim(),
      tipo,
      patron: patron.trim(),
      categoria: catFinal,
      grupo,
      soporteSugerido: soporte.trim() || 'Identificar factura, contrato o comprobante fiscal correspondiente',
      activa: true,
    });

    setNombre('');
    setPatron('');
    setCategoria('');
    setCategoriaNueva('');
    setSoporte('');
    setMostrarFormulario(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera explicativa */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-slate-900 text-lg">
              Automatización mediante Etiquetas Inteligentes
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Detecta automáticamente conceptos bancarios repetitivos (proveedores frecuentes, transferencias
            de nómina por semana o bono de alimentación, lotes de punto de venta, pagos a alcaldías y planillas
            del SENIAT) para que ninguna transacción quede clasificada como «Otros» sin soporte.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEjecutarReglasSobreTodo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0022F5] hover:bg-[#0018B8] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Re-clasificar Todas las Operaciones
          </button>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Regla
          </button>
        </div>
      </div>

      {/* Formulario de Nueva Regla */}
      {mostrarFormulario && (
        <div className="bg-purple-50/50 rounded-xl border-2 border-purple-300 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-200">
            <h3 className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-purple-700" />
              Crear Regla Inteligente de Categorización
            </h3>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="text-purple-600 hover:text-purple-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={guardarNuevaRegla} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre descriptivo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pago a Proveedor Repuestos ABC"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aplica a:
                </label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                >
                  <option value="E">Solo Egresos (-)</option>
                  <option value="I">Solo Ingresos (+)</option>
                  <option value="AMBOS">Ingresos y Egresos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patrón / Palabras clave en la descripción bancaria:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: REPUESTOS ABC|J-401346197"
                  value={patron}
                  onChange={e => setPatron(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoría a Asignar:
                </label>
                <select
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  required
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">-- Selecciona categoría --</option>
                  {categoriasExistentes.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__NUEVA__">+ Crear nueva categoría personalizada...</option>
                </select>

                {categoria === '__NUEVA__' && (
                  <input
                    type="text"
                    required
                    placeholder="Nombre de la nueva categoría"
                    value={categoriaNueva}
                    onChange={e => setCategoriaNueva(e.target.value)}
                    className="w-full text-xs p-2 mt-2 border border-purple-400 rounded-lg bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grupo Fiscal:
                </label>
                <select
                  value={grupo}
                  onChange={e => setGrupo(e.target.value as ClasificacionGrupo)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                >
                  <option value="PAGO_PROVEEDORES">Pago a Proveedores</option>
                  <option value="NOMINA_PERSONAL">Nómina y Personal</option>
                  <option value="IMPUESTOS_TRIBUTOS">Impuestos y Tributos</option>
                  <option value="SERVICIOS_PUBLICOS">Servicios Públicos</option>
                  <option value="COMISIONES_BANCARIAS">Comisiones Bancarias</option>
                  <option value="VENTAS_OPERATIVAS">Ventas Operativas</option>
                  <option value="INGRESOS_NO_VENTAS">Ingresos No Ventas (Aportes/Préstamos)</option>
                  <option value="TRANSFERENCIAS_INTERNAS">Transferencias Internas Cuentas Propias</option>
                  <option value="OTROS_GASTOS">Otros Gastos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Soporte SENIAT sugerido:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Factura fiscal de compra con retención de IVA e ISLR"
                  value={soporte}
                  onChange={e => setSoporte(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs cursor-pointer"
              >
                Guardar Regla Inteligente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Reglas Existentes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Reglas Activas ({reglas.filter(r => r.activa).length} de {reglas.length})
          </span>
          <span className="text-xs text-slate-500">
            Reglas del sistema + Personalizadas
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {reglas.map(r => (
            <div
              key={r.id}
              className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors ${
                !r.activa ? 'opacity-50 bg-slate-50/40' : ''
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">
                    {r.nombre}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      r.tipo === 'I'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.tipo === 'E'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {r.tipo === 'I' ? 'Ingreso (+)' : r.tipo === 'E' ? 'Egreso (-)' : 'Ambos'}
                  </span>
                  {r.esSistema && (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Experto SENIAT
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span>
                    Patrón:{' '}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-purple-800">
                      {r.patron}
                    </code>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-900">
                    Categoría: {r.categoria}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Soporte:</span> {r.soporteSugerido}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onAlternarRegla(r.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    r.activa
                      ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'border-slate-300 text-slate-500 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {r.activa ? 'Activa' : 'Pausada'}
                </button>

                {!r.esSistema && (
                  <button
                    onClick={() => onEliminarRegla(r.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar regla personalizada"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
