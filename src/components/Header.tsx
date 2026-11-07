/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Building2,
  Landmark,
  Tag,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  vistaActual: 'resumen' | 'seniat' | 'operaciones' | 'reglas' | 'bancos';
  setVistaActual: (v: 'resumen' | 'seniat' | 'operaciones' | 'reglas' | 'bancos') => void;
  empresas: string[];
  empresaSeleccionada: string;
  setEmpresaSeleccionada: (emp: string) => void;
  bancos: string[];
  bancoSeleccionado: string;
  setBancoSeleccionado: (banco: string) => void;
  onAbrirUpload: () => void;
  onExportarExcel: () => void;
  onCargarDemo: () => void;
  onLimpiarTodo: () => void;
  totalTransacciones: number;
}

export const Header: React.FC<HeaderProps> = ({
  vistaActual,
  setVistaActual,
  empresas,
  empresaSeleccionada,
  setEmpresaSeleccionada,
  bancos,
  bancoSeleccionado,
  setBancoSeleccionado,
  onAbrirUpload,
  onExportarExcel,
  onCargarDemo,
  onLimpiarTodo,
  totalTransacciones,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Zona 1, 2 y 3: Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zona 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#0022F5] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base whitespace-nowrap">
                  Clasificador de Estados de Cuenta
                </span>
                <span className="text-[11px] font-semibold text-[#0022F5] bg-blue-50 px-2 py-0.5 rounded text-center whitespace-nowrap">
                  Soportes SENIAT
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Nube Segura
                </span>
              </div>
            </div>
          </div>

          {/* Zona 2: Nav Tabs (Single line controls) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setVistaActual('resumen')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                vistaActual === 'resumen'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resumen Ejecutivo
            </button>
            <button
              onClick={() => setVistaActual('seniat')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                vistaActual === 'seniat'
                  ? 'bg-[#0022F5] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Conciliación SENIAT
            </button>
            <button
              onClick={() => setVistaActual('operaciones')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                vistaActual === 'operaciones'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Operaciones ({totalTransacciones})
            </button>
            <button
              onClick={() => setVistaActual('bancos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                vistaActual === 'bancos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cuentas y Bancos
            </button>
            <button
              onClick={() => setVistaActual('reglas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                vistaActual === 'reglas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              Etiquetas Inteligentes
            </button>
          </nav>

          {/* Zona 3: Acciones Principales y Selectores Multi-Empresa & Multi-Banco */}
          <div className="flex items-center gap-2 shrink-0">
            {empresas.length > 0 && (
              <div className="hidden lg:flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5" title="Filtrar por Empresa / RIF">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={empresaSeleccionada}
                  onChange={e => setEmpresaSeleccionada(e.target.value)}
                  className="bg-transparent border-0 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer max-w-[130px] truncate"
                >
                  <option value="">Todas las empresas</option>
                  {empresas.map(e => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {bancos.length > 0 && (
              <div className="hidden xl:flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5" title="Filtrar por Banco de la Empresa">
                <Landmark className="w-3.5 h-3.5 text-[#0022F5]" />
                <select
                  value={bancoSeleccionado}
                  onChange={e => setBancoSeleccionado(e.target.value)}
                  className="bg-transparent border-0 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer max-w-[140px] truncate"
                >
                  <option value="">Todos los bancos ({bancos.length})</option>
                  {bancos.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onExportarExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#00B32C] hover:bg-[#009624] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Descargar informe completo de resumen por categorías en Excel con fórmulas vivas"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              Descargar Excel
            </button>

            <button
              onClick={onAbrirUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0022F5] hover:bg-[#0018B8] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              Cargar Estados de Cuenta
            </button>

            <button
              onClick={onLimpiarTodo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
              title="Vaciar todos los registros para iniciar una nueva carga limpia"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              Limpiar todo
            </button>
          </div>
        </div>

        {/* Barra móvil para cambiar de pestaña en pantallas pequeñas */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
          <button
            onClick={() => setVistaActual('resumen')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              vistaActual === 'resumen' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setVistaActual('seniat')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              vistaActual === 'seniat' ? 'bg-[#0022F5] text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Conciliación SENIAT
          </button>
          <button
            onClick={() => setVistaActual('operaciones')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              vistaActual === 'operaciones' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Operaciones ({totalTransacciones})
          </button>
          <button
            onClick={() => setVistaActual('bancos')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              vistaActual === 'bancos' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Bancos
          </button>
          <button
            onClick={() => setVistaActual('reglas')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              vistaActual === 'reglas' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Etiquetas
          </button>
        </div>
      </div>
    </header>
  );
};
