/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  FileText,
  Building2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { parsearExcelOCsv, parsearPdfBancario, BANCOS_VENEZUELA } from '../utils/fileParser';
import { Transaccion, ReglaInteligente } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransaccionesCargadas: (nuevas: Transaccion[]) => void;
  empresas: string[];
  onAgregarEmpresa: (nombre: string) => void;
  reglasPersonalizadas: ReglaInteligente[];
  onCargarDemo: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onTransaccionesCargadas,
  empresas,
  onAgregarEmpresa,
  reglasPersonalizadas,
  onCargarDemo,
}) => {
  const [empresaActual, setEmpresaActual] = useState<string>(empresas[0] || 'Mi Empresa');
  const [nuevaEmpresaInput, setNuevaEmpresaInput] = useState<string>('');
  const [mostrarAgregarEmpresa, setMostrarAgregarEmpresa] = useState<boolean>(false);
  const [bancoSeleccionado, setBancoSeleccionado] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensajesLog, setMensajesLog] = useState<{ texto: string; tipo: 'ok' | 'err' | 'info' }[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      try {
        let resultado: { transacciones: Transaccion[]; bancoDetectado: string };

        if (/\.pdf$/i.test(archivo.name)) {
          resultado = await parsearPdfBancario(
            archivo,
            empresaActual,
            bancoSeleccionado,
            reglasPersonalizadas
          );
        } else {
          resultado = await parsearExcelOCsv(
            archivo,
            empresaActual,
            bancoSeleccionado,
            reglasPersonalizadas
          );
        }

        if (resultado.transacciones.length > 0) {
          nuevasTransacciones.push(...resultado.transacciones);
          logs.push({
            texto: `${archivo.name} (${resultado.bancoDetectado}): ${resultado.transacciones.length} operaciones extraídas y clasificadas exitosamente.`,
            tipo: 'ok',
          });
        } else {
          logs.push({
            texto: `${archivo.name}: No se detectaron filas válidas de transacciones. Asegúrate de que incluya columnas Fecha, Descripción y Monto/Debe/Haber.`,
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cargar Estados de Cuenta Bancarios
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Procesa archivos .xlsx, .xls, .csv y .pdf localmente en tu navegador sin enviar datos a servidores externos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Selectores de Empresa y Banco */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Empresa a imputar:
              </label>
              <div className="flex gap-1.5">
                <select
                  value={empresaActual}
                  onChange={e => setEmpresaActual(e.target.value)}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0022F5]"
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
                  className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Añadir otra empresa o RIF"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {mostrarAgregarEmpresa && (
                <div className="mt-2 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Nombre o RIF (Ej: Inversiones C.A.)"
                    value={nuevaEmpresaInput}
                    onChange={e => setNuevaEmpresaInput(e.target.value)}
                    className="flex-1 text-xs p-1.5 border border-blue-400 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={agregarEmpresa}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0022F5] rounded-lg cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Banco del estado de cuenta:
              </label>
              <select
                value={bancoSeleccionado}
                onChange={e => setBancoSeleccionado(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0022F5]"
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

          {/* Zona de Drop Drag & Drop */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#0022F5] bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
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

            <Upload className="w-9 h-9 text-[#0022F5] mx-auto mb-2" />
            <div className="font-semibold text-sm text-slate-800">
              Arrastra tus estados de cuenta aquí o haz clic para seleccionarlos
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Archivos compatibles: <strong>.xlsx, .xls, .csv, .pdf</strong> (BNC, Banesco, Mercantil, BDV, Provincial, etc.)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Puedes cargar varios meses y varios bancos simultáneamente.
            </p>
          </div>

          {/* Opción rápida: Cargar Dataset de Demostración Real */}
          <div className="bg-slate-100 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                ¿Quieres probar la app de inmediato?
              </div>
              <div className="text-[11px] text-slate-500">
                Carga el dataset real de China Korea Motors (864 ops: BNC, Banesco y Cashea).
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onCargarDemo();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              Cargar Datos Reales
            </button>
          </div>

          {/* Registro de Lectura y Logs */}
          {cargando && (
            <div className="text-center py-3 text-xs text-[#0022F5] font-semibold animate-pulse">
              Analizando estructura bancaria, extrayendo montos y ejecutando etiquetas inteligentes...
            </div>
          )}

          {mensajesLog.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
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
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  )}
                  <span>{log.texto}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
