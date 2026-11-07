/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TipoTransaccion = 'I' | 'E';

export type ClasificacionGrupo =
  | 'VENTAS_OPERATIVAS'          // POS, Pago Móvil clientes, Transferencias clientes, Cashea
  | 'INGRESOS_NO_VENTAS'          // Aportes de socios, Préstamos bancarios, Reversos, Divisas
  | 'TRANSFERENCIAS_INTERNAS'    // Traspasos entre cuentas propias de la misma empresa
  | 'PAGO_PROVEEDORES'           // Bienes y servicios
  | 'IMPUESTOS_TRIBUTOS'         // SENIAT, IVA F-99030, ISLR, Retenciones, Alcaldía, IGTF
  | 'NOMINA_PERSONAL'            // Sueldos, quincenas, bono alimentación / cestaticket, semanas
  | 'PARAFISCALES_SEG_SOCIAL'    // IVSS, FAOV/Banavih, INCES
  | 'SERVICIOS_PUBLICOS'         // Luz (Corpoelec), agua, teléfono/internet
  | 'COMISIONES_BANCARIAS'       // Comisiones POS, Pago Móvil, mantenimiento, SMS
  | 'OTROS_GASTOS'               // No identificados o varios
  | 'OTROS_INGRESOS';

export type SoporteStatus = 'ubicado' | 'pendiente' | 'no_requerido';

export interface Transaccion {
  id: string;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  referencia: string;
  monto: number; // Positivo para Ingreso (+), Negativo para Egreso (-)
  saldo: number | null;
  tipo: TipoTransaccion;
  categoria: string;
  grupo: ClasificacionGrupo;
  soporteRequerido: string;
  soporteEstado: SoporteStatus;
  soporteDoc?: string; // N° Factura / Planilla / Contrato
  empresa: string;
  banco: string;
  archivoOrigen: string;
  esManual?: boolean;
  reglaAplicada?: string;
  marcadaRevision?: boolean;
}

export interface ReglaInteligente {
  id: string;
  nombre: string;
  tipo: 'I' | 'E' | 'AMBOS';
  patron: string; // Expresión regular o palabras clave
  categoria: string;
  grupo: ClasificacionGrupo;
  soporteSugerido: string;
  esSistema: boolean;
  activa: boolean;
  orden?: number;
}

export interface ConciliacionMes {
  mes: string; // YYYY-MM
  baseImponible?: number; // Base imponible de ventas declaradas en Formulario 99030 (SENIAT)
  ivaDebitoFiscal?: number; // Débito Fiscal IVA 16% declarado en Formulario 99030
  ventasDeclaradasSeniat: number; // Total Bruto Declarado (Base + IVA) o Base Imponible
  observaciones?: string;
}

export interface Empresa {
  id: string;
  nombre: string;
  rif: string;
}

export interface ResumenMensual {
  mes: string; // YYYY-MM
  nombreMes: string;
  ingresosTotales: number;
  egresosTotales: number;
  neto: number;
  transferenciasInternasIngreso: number;
  transferenciasInternasEgreso: number;
  ingresosOperativos: number;
  egresosOperativos: number;
  resultadoOperativo: number;
  ventasBanco: number; // Ingresos que cuentan como ventas
  ingresosNoVentas: number; // Aportes, préstamos, etc.
  ventasDeclaradasSeniat: number;
  diferenciaSeniat: number; // ventasBanco - ventasDeclaradasSeniat
  operacionesTotal: number;
  soportesPendientes: number;
}
