/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InlineUploadSection } from './components/InlineUploadSection';
import { KpiCards } from './components/KpiCards';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView';
import { SeniatConciliationView } from './components/SeniatConciliationView';
import { TransactionsTable } from './components/TransactionsTable';
import { SmartRulesModal } from './components/SmartRulesModal';
import { BanksSummaryView } from './components/BanksSummaryView';
import { UploadModal } from './components/UploadModal';
import { Transaccion, ReglaInteligente, ConciliacionMes, SoporteStatus } from './types';
import {
  REGLAS_SISTEMA_DEFAULT,
  clasificarTransaccion,
  emparejarTransferenciasInternas,
} from './utils/rulesEngine';
import {
  generarTransaccionesDemo,
  EMPRESA_DEMO,
  CONCILIACIONES_DEFAULT,
} from './utils/sampleData';
import { exportarAuditoriaExcel } from './utils/excelExport';
import { ShieldCheck, Info, Upload, Sparkles, Database } from 'lucide-react';

export default function App() {
  // Inicialización limpia: por defecto 0 datos simulados o ficticios
  const [transacciones, setTransacciones] = useState<Transaccion[]>(() => {
    try {
      const guardadas = localStorage.getItem('conciliador_txs_v3');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error cargando transacciones de localStorage:', e);
    }
    // Estado inicial verdaderamente limpio para producción
    return [];
  });

  const [reglas, setReglas] = useState<ReglaInteligente[]>(() => {
    try {
      const guardadas = localStorage.getItem('conciliador_reglas_v3');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error cargando reglas de localStorage:', e);
    }
    return REGLAS_SISTEMA_DEFAULT;
  });

  const [conciliaciones, setConciliaciones] = useState<Record<string, ConciliacionMes>>(() => {
    try {
      const guardadas = localStorage.getItem('conciliador_seniat_v3');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error('Error cargando conciliaciones:', e);
    }
    return {};
  });

  const [empresas, setEmpresas] = useState<string[]>(() => {
    try {
      const guardadas = localStorage.getItem('conciliador_empresas_v3');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error cargando empresas:', e);
    }
    return [];
  });

  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>('');
  const [bancoSeleccionado, setBancoSeleccionado] = useState<string>('');
  const [vistaActual, setVistaActual] = useState<
    'resumen' | 'seniat' | 'operaciones' | 'reglas' | 'bancos'
  >('resumen');
  const [modalUploadAbierto, setModalUploadAbierto] = useState<boolean>(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState<string | null>(null);

  // Guardar datos en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('conciliador_txs_v3', JSON.stringify(transacciones));
    } catch (e) {
      console.warn('No se pudo guardar transacciones en localStorage (cuota excedida).');
    }
  }, [transacciones]);

  useEffect(() => {
    try {
      localStorage.setItem('conciliador_reglas_v3', JSON.stringify(reglas));
    } catch (e) {
      console.warn('No se pudo guardar reglas.');
    }
  }, [reglas]);

  useEffect(() => {
    try {
      localStorage.setItem('conciliador_seniat_v3', JSON.stringify(conciliaciones));
    } catch (e) {
      console.warn('No se pudo guardar conciliaciones.');
    }
  }, [conciliaciones]);

  useEffect(() => {
    try {
      localStorage.setItem('conciliador_empresas_v3', JSON.stringify(empresas));
    } catch (e) {
      console.warn('No se pudo guardar empresas.');
    }
  }, [empresas]);

  // Transacciones filtradas por la empresa y banco seleccionados
  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter(t => {
      const matchEmpresa = !empresaSeleccionada || t.empresa === empresaSeleccionada;
      const matchBanco = !bancoSeleccionado || t.banco === bancoSeleccionado;
      return matchEmpresa && matchBanco;
    });
  }, [transacciones, empresaSeleccionada, bancoSeleccionado]);

  // Métricas calculadas para KPIs
  const metrics = useMemo(() => {
    const txIngresos = transaccionesFiltradas.filter(t => t.monto > 0);
    const txEgresos = transaccionesFiltradas.filter(t => t.monto < 0);

    const totalIngresos = txIngresos.reduce((s, t) => s + t.monto, 0);
    const totalEgresos = txEgresos.reduce((s, t) => s + t.monto, 0);

    const transferenciasInternas = txIngresos
      .filter(t => t.grupo === 'TRANSFERENCIAS_INTERNAS')
      .reduce((s, t) => s + t.monto, 0);

    const aportesSocios = txIngresos
      .filter(t => t.categoria.includes('socios') || t.categoria.includes('accionista'))
      .reduce((s, t) => s + t.monto, 0);

    const prestamosBanco = txIngresos
      .filter(t => t.categoria.includes('Préstamos bancarios'))
      .reduce((s, t) => s + t.monto, 0);

    const otrosNoVentas = txIngresos
      .filter(
        t =>
          t.grupo === 'INGRESOS_NO_VENTAS' &&
          !t.categoria.includes('socios') &&
          !t.categoria.includes('Préstamos bancarios')
      )
      .reduce((s, t) => s + t.monto, 0);

    const ventasBanco =
      totalIngresos - transferenciasInternas - aportesSocios - prestamosBanco - otrosNoVentas;

    const meses = [...new Set(transaccionesFiltradas.map(t => t.fecha.slice(0, 7)))];
    const ventasDeclaradasSeniat = meses.reduce((s, m) => {
      return s + (conciliaciones[m]?.ventasDeclaradasSeniat || 0);
    }, 0);

    const soportesPendientes = transaccionesFiltradas.filter(
      t => t.soporteEstado === 'pendiente'
    ).length;

    return {
      totalIngresos,
      totalEgresos,
      transferenciasInternas,
      ventasBanco,
      ventasDeclaradasSeniat,
      soportesPendientes,
      totalOperaciones: transaccionesFiltradas.length,
    };
  }, [transaccionesFiltradas, conciliaciones]);

  // Lista de categorías existentes
  const categoriasExistentes = useMemo(() => {
    const set = new Set<string>();
    REGLAS_SISTEMA_DEFAULT.forEach(r => set.add(r.categoria));
    transacciones.forEach(t => set.add(t.categoria));
    return Array.from(set).sort();
  }, [transacciones]);

  const bancosDisponibles = useMemo(() => {
    const set = new Set<string>();
    transacciones.forEach(t => {
      if (t.banco) set.add(t.banco);
    });
    return Array.from(set).sort();
  }, [transacciones]);

  // Mostrar notificación breve
  const mostrarNotificacion = (texto: string) => {
    setMensajeNotificacion(texto);
    setTimeout(() => setMensajeNotificacion(null), 4000);
  };

  // Manejador: Actualizar categoría de transacción
  const handleActualizarCategoria = (id: string, nuevaCategoria: string) => {
    setTransacciones(prev => {
      const actualizadas = prev.map(t => {
        if (t.id !== id) return t;

        let grupo = t.grupo;
        if (nuevaCategoria.includes('cuentas propias')) grupo = 'TRANSFERENCIAS_INTERNAS';
        else if (nuevaCategoria.includes('socios') || nuevaCategoria.includes('Préstamos bancarios'))
          grupo = 'INGRESOS_NO_VENTAS';
        else if (
          nuevaCategoria.includes('POS') ||
          nuevaCategoria.includes('Cashea') ||
          nuevaCategoria.includes('clientes')
        )
          grupo = 'VENTAS_OPERATIVAS';
        else if (nuevaCategoria.includes('SENIAT') || nuevaCategoria.includes('Impuestos'))
          grupo = 'IMPUESTOS_TRIBUTOS';
        else if (nuevaCategoria.includes('nómina') || nuevaCategoria.includes('sueldos'))
          grupo = 'NOMINA_PERSONAL';

        return {
          ...t,
          categoria: nuevaCategoria,
          grupo,
          esManual: true,
        };
      });
      return emparejarTransferenciasInternas(actualizadas);
    });
    mostrarNotificacion('Categoría actualizada y conciliación recalculada.');
  };

  const handleActualizarSoporte = (id: string, nuevoEstado: SoporteStatus, docRef?: string) => {
    setTransacciones(prev =>
      prev.map(t => (t.id === id ? { ...t, soporteEstado: nuevoEstado, soporteDoc: docRef } : t))
    );
  };

  const handleActualizacionMasiva = (
    ids: string[],
    nuevaCategoria?: string,
    nuevoEstadoSoporte?: SoporteStatus
  ) => {
    const idSet = new Set(ids);
    setTransacciones(prev => {
      const actualizadas = prev.map(t => {
        if (!idSet.has(t.id)) return t;
        return {
          ...t,
          categoria: nuevaCategoria || t.categoria,
          soporteEstado: nuevoEstadoSoporte || t.soporteEstado,
          esManual: true,
        };
      });
      return emparejarTransferenciasInternas(actualizadas);
    });
    mostrarNotificacion(`Se actualizaron ${ids.length} operaciones en lote.`);
  };

  const handleGuardarConciliacion = (mes: string, datos: ConciliacionMes) => {
    setConciliaciones(prev => ({
      ...prev,
      [mes]: datos,
    }));
    mostrarNotificacion(`Ventas declaradas en Forma 99030 para ${mes} guardadas.`);
  };

  const handleAgregarRegla = (nuevaRegla: Omit<ReglaInteligente, 'id' | 'esSistema'>) => {
    const reglaCompleta: ReglaInteligente = {
      ...nuevaRegla,
      id: `regla-custom-${Date.now()}`,
      esSistema: false,
    };
    setReglas(prev => [reglaCompleta, ...prev]);
    mostrarNotificacion(`Regla «${reglaCompleta.nombre}» creada exitosamente.`);
  };

  const handleEliminarRegla = (id: string) => {
    setReglas(prev => prev.filter(r => r.id !== id));
    mostrarNotificacion('Regla eliminada.');
  };

  const handleAlternarRegla = (id: string) => {
    setReglas(prev =>
      prev.map(r => (r.id === id ? { ...r, activa: !r.activa } : r))
    );
  };

  const handleEjecutarReglasSobreTodo = () => {
    let reclasificadas = 0;
    const nuevas = transacciones.map(t => {
      if (t.esManual) return t;
      const clasificacion = clasificarTransaccion(t, reglas);
      if (clasificacion.categoria !== t.categoria) {
        reclasificadas++;
      }
      return {
        ...t,
        categoria: clasificacion.categoria,
        grupo: clasificacion.grupo,
        soporteRequerido: clasificacion.soporteRequerido,
        reglaAplicada: clasificacion.reglaAplicada,
      };
    });

    const emparejadas = emparejarTransferenciasInternas(nuevas);
    setTransacciones(emparejadas);
    mostrarNotificacion(`Reclasificación ejecutada: ${reclasificadas} operaciones actualizadas.`);
  };

  const handleTransaccionesCargadas = (nuevas: Transaccion[]) => {
    setTransacciones(prev => {
      const combinadas = [...prev, ...nuevas];
      return emparejarTransferenciasInternas(combinadas);
    });

    nuevas.forEach(t => {
      if (t.empresa && !empresas.includes(t.empresa)) {
        setEmpresas(prev => [...prev, t.empresa]);
        if (!empresaSeleccionada) setEmpresaSeleccionada(t.empresa);
      }
    });

    mostrarNotificacion(`${nuevas.length} operaciones verdaderas cargadas y procesadas.`);
  };

  const handleAgregarEmpresa = (nombre: string) => {
    if (!empresas.includes(nombre)) {
      setEmpresas(prev => [...prev, nombre]);
      setEmpresaSeleccionada(nombre);
      mostrarNotificacion(`Empresa «${nombre}» registrada.`);
    }
  };

  const handleCargarDemo = () => {
    const demo = emparejarTransferenciasInternas(generarTransaccionesDemo());
    setTransacciones(demo);
    setEmpresas([EMPRESA_DEMO.nombre]);
    setEmpresaSeleccionada(EMPRESA_DEMO.nombre);

    const inicial: Record<string, ConciliacionMes> = {};
    CONCILIACIONES_DEFAULT.forEach(c => {
      inicial[c.mes] = c;
    });
    setConciliaciones(inicial);
    mostrarNotificacion('Dataset real de prueba cargado.');
  };

  const handleLimpiarTodo = () => {
    if (
      window.confirm(
        '¿Confirmas que deseas vaciar todos los registros y dejar la aplicación 100% limpia para cargar tus nuevos estados de cuenta reales?'
      )
    ) {
      setTransacciones([]);
      setEmpresas([]);
      setEmpresaSeleccionada('');
      setBancoSeleccionado('');
      setConciliaciones({});
      try {
        localStorage.removeItem('conciliador_txs_v3');
        localStorage.removeItem('conciliador_empresas_v3');
        localStorage.removeItem('conciliador_seniat_v3');
        localStorage.removeItem('emps');
      } catch (e) {
        console.warn('Error limpiando localStorage:', e);
      }
      mostrarNotificacion('Base de datos vaciada por completo. Lista para cargar tus estados de cuenta reales.');
    }
  };

  const handleExportarExcel = () => {
    exportarAuditoriaExcel(
      transaccionesFiltradas,
      conciliaciones,
      empresaSeleccionada,
      bancoSeleccionado
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {mensajeNotificacion && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>{mensajeNotificacion}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        empresas={empresas}
        empresaSeleccionada={empresaSeleccionada}
        setEmpresaSeleccionada={setEmpresaSeleccionada}
        bancos={bancosDisponibles}
        bancoSeleccionado={bancoSeleccionado}
        setBancoSeleccionado={setBancoSeleccionado}
        onAbrirUpload={() => setModalUploadAbierto(true)}
        onExportarExcel={handleExportarExcel}
        onCargarDemo={handleCargarDemo}
        onLimpiarTodo={handleLimpiarTodo}
        totalTransacciones={transaccionesFiltradas.length}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Caja Principal de Carga (Siempre visible al inicio exactamente como el diseño Claude AI) */}
        <InlineUploadSection
          empresas={empresas.length ? empresas : ['Mi Empresa']}
          empresaActual={empresaSeleccionada || (empresas[0] || 'Mi Empresa')}
          setEmpresaActual={setEmpresaSeleccionada}
          onAgregarEmpresa={handleAgregarEmpresa}
          bancoSeleccionado={bancoSeleccionado}
          setBancoSeleccionado={setBancoSeleccionado}
          onTransaccionesCargadas={handleTransaccionesCargadas}
          reglasPersonalizadas={reglas}
          onCargarDemo={handleCargarDemo}
          onLimpiarTodo={handleLimpiarTodo}
        />

        {transacciones.length > 0 && (
          <>
            <KpiCards
              totalIngresos={metrics.totalIngresos}
              totalEgresos={metrics.totalEgresos}
              transferenciasInternas={metrics.transferenciasInternas}
              ventasBanco={metrics.ventasBanco}
              ventasDeclaradasSeniat={metrics.ventasDeclaradasSeniat}
              soportesPendientes={metrics.soportesPendientes}
              totalOperaciones={metrics.totalOperaciones}
            />

            {vistaActual === 'resumen' && (
              <ExecutiveSummaryView
                transacciones={transaccionesFiltradas}
                onSeleccionarCategoriaFiltro={() => setVistaActual('operaciones')}
                onIrAConciliacionSeniat={() => setVistaActual('seniat')}
                onExportarExcel={handleExportarExcel}
              />
            )}

            {vistaActual === 'seniat' && (
              <SeniatConciliationView
                transacciones={transaccionesFiltradas}
                conciliaciones={conciliaciones}
                onGuardarConciliacion={handleGuardarConciliacion}
                empresaSeleccionada={empresaSeleccionada}
              />
            )}

            {vistaActual === 'operaciones' && (
              <TransactionsTable
                transacciones={transaccionesFiltradas}
                onActualizarCategoria={handleActualizarCategoria}
                onActualizarSoporte={handleActualizarSoporte}
                onActualizacionMasiva={handleActualizacionMasiva}
                categoriasExistentes={categoriasExistentes}
              />
            )}

            {vistaActual === 'bancos' && (
              <BanksSummaryView
                transacciones={transaccionesFiltradas}
                empresaFiltro={empresaSeleccionada}
              />
            )}

            {vistaActual === 'reglas' && (
              <SmartRulesModal
                reglas={reglas}
                onAgregarRegla={handleAgregarRegla}
                onEliminarRegla={handleEliminarRegla}
                onAlternarRegla={handleAlternarRegla}
                onEjecutarReglasSobreTodo={handleEjecutarReglasSobreTodo}
                categoriasExistentes={categoriasExistentes}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">Conciliador Bancario SENIAT</span>
            <span aria-hidden="true">·</span>
            <span>Auditoría e Inteligencia Bancaria para Venezuela</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLimpiarTodo}
              className="text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
            >
              Vaciar base de datos
            </button>
          </div>
        </div>
      </footer>

      <UploadModal
        isOpen={modalUploadAbierto}
        onClose={() => setModalUploadAbierto(false)}
        onTransaccionesCargadas={handleTransaccionesCargadas}
        empresas={empresas.length ? empresas : ['Mi Empresa']}
        onAgregarEmpresa={handleAgregarEmpresa}
        reglasPersonalizadas={reglas}
        onCargarDemo={handleCargarDemo}
      />
    </div>
  );
}
