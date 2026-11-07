/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Plus, CheckCircle2, AlertCircle, Sparkles, Building2, Landmark, RotateCcw } from 'lucide-react';
import { parsearExcelOCsv, parsearPdfBancario, BANCOS_VENEZUELA } from '../utils/fileParser';
import { Transaccion, ReglaInteligente } from '../types';

interface InlineUploadSectionProps {
  empresas: string[];
  empresaActual: string;
  setEmpresaActual: (emp: string) => void;
  onAgregarEmpresa: (nombre: string) => void;
  bancoSeleccionado: string;
  setBancoSeleccionado: (banco: string) => void;
  onTransaccionesCargadas: (nuevas: Transaccion[]) => void;
  reglasPersonalizadas: ReglaInteligente[];
  onCargarDemo: () => void;
  onLimpiarTodo: () => void;
}

export const InlineUploadSection: React.FC<InlineUploadSectionProps> = ({
  empresas,
  empresaActual,
  setEmpresaActual,
  onAgregarEmpresa,
  bancoSeleccionado,
  setBancoSeleccionado,
  onTransaccionesCargadas,
  reglasPersonalizadas,
  onCargarDemo,
  onLimpiarTodo,
}) => {
  const [nuevaEmpresaInput, setNuevaEmpresaInput] = useState<string>('');
  const [mostrarAgregarEmpresa, setMostrarAgregarEmpresa] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensajesLog, setMensajesLog] = useState<{ texto: string; tipo: 'ok' | 'err' | 'info' }[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const agregarEmpresa = () => {
    if (!nuevaEmpresaInput.trim()) return;
    onAgregarEmpresa(nuevaEmpresaInput.trim());
    setEmpresaActual(nuevaEmpresaInput.trim());
    setNuevaEmpresaInput('');
    setMostrarAgregarEmpresa(false);
  };

  const procesarArchivos = async (archivos: FileList | File[]) => {
    if (!archivos || archivos.length === 0) return;

    setCargando(true);
    const nuevasTransacciones: Transaccion[] = [];
    const logs: { texto: string; tipo: 'ok' | 'err' | 'info' }[] = [];
    const empDestino = empresaActual || 'Mi Empresa';

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      try {
        let resultado: { transacciones: Transaccion[]; bancoDetectado: string };

        if (/\.pdf$/i.test(archivo.name)) {
          resultado = await parsearPdfBancario(
            archivo,
            empDestino,
            bancoSeleccionado,
            reglasPersonalizadas
          );
        } else {
          resultado = await parsearExcelOCsv(
            archivo,
            empDestino,
            bancoSeleccionado,
            reglasPersonalizadas
          );
        }

        if (resultado.transacciones.length > 0) {
          nuevasTransacciones.push(...resultado.transacciones);
          logs.push({
            texto: `${archivo.name} (${resultado.bancoDetectado}): ${resultado.transacciones.length} operaciones extraídas y clasificadas exitosamente para ${empDestino}.`,
            tipo: 'ok',
          });
        } else {
          logs.push({
            texto: `${archivo.name}: No se reconocieron columnas de fecha, descripción y monto/debe/haber. Verifica la estructura.`,
            tipo: 'err',
          });
        }
      } catch (err: any) {
        logs.push({
          texto: `${archivo.name}: Error al leer archivo (${err.message || 'formato no soportado'}).`,
          tipo: 'err',
        });
      }
    }

    setMensajesLog(logs);
    setCargando(false);

    if (nuevasTransacciones.length > 0) {
      onTransaccionesCargadas(nuevasTransacciones);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarArchivos(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Barra de opciones Empresa & Banco */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-700">Empresa:</span>
            <select
              value={empresaActual}
              onChange={e => setEmpresaActual(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0022F5] focus:outline-hidden"
            >
              {empresas.map(e => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setMostrarAgregarEmpresa(!mostrarAgregarEmpresa)}
              className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              title="Agregar nueva empresa o RIF"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {mostrarAgregarEmpresa && (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Nueva empresa (nombre o RIF)"
                value={nuevaEmpresaInput}
                onChange={e => setNuevaEmpresaInput(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-blue-400 rounded-lg focus:outline-hidden"
              />
              <button
                type="button"
                onClick={agregarEmpresa}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#0022F5] rounded-lg cursor-pointer hover:bg-[#0018B8] transition-colors"
              >
                Agregar empresa
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-[#0022F5]" />
            <span className="font-semibold text-slate-700">Banco:</span>
            <select
              value={bancoSeleccionado}
              onChange={e => setBancoSeleccionado(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0022F5] focus:outline-hidden"
            >
              <option value="">Detectar automáticamente del archivo</option>
              {BANCOS_VENEZUELA.map(b => (
                <option key={b.nombre} value={b.nombre}>
                  {b.nombre}
                </option>
              ))}
              <option value="Otro banco">Otro banco nacional</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLimpiarTodo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors cursor-pointer"
            title="Vaciar todos los datos de la app para una nueva carga"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            Limpiar todo
          </button>

          <button
            type="button"
            onClick={onCargarDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Cargar Dataset Ejemplo
          </button>
        </div>
      </div>

      {/* Caja Grande de Carga / Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[#0022F5] bg-blue-50/60 shadow-inner'
            : 'border-slate-300 hover:border-[#0022F5] bg-slate-50/80 hover:bg-blue-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf"
          className="hidden"
          onChange={e => {
            if (e.target.files) procesarArchivos(e.target.files);
            e.target.value = '';
          }}
        />

        <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0022F5] flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>

        <div className="font-bold text-sm sm:text-base text-slate-900">
          Arrastra aquí los estados de cuenta o toca para elegirlos
        </div>

        <p className="text-xs text-slate-600 mt-1 font-mono">
          .xlsx · .xls · .csv · .pdf — puedes cargar varios meses y bancos a la vez
        </p>

        <p className="text-[11px] text-slate-400 mt-2">
          Lectura instantánea de BNC, Banesco, Mercantil, BDV, BBVA Provincial, Bancamiga, Cashea y otros bancos venezolanos.
        </p>
      </div>

      {/* Estado del procesamiento */}
      {cargando && (
        <div className="text-center py-2 text-xs font-bold text-[#0022F5] animate-pulse">
          Procesando estados de cuenta y clasificando con etiquetas inteligentes...
        </div>
      )}

      {mensajesLog.length > 0 && (
        <div className="max-h-32 overflow-y-auto space-y-1 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
          {mensajesLog.map((log, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-1.5 ${
                log.tipo === 'ok'
                  ? 'text-emerald-700'
                  : log.tipo === 'err'
                  ? 'text-rose-700'
                  : 'text-slate-600'
              }`}
            >
              {log.tipo === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{log.texto}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
