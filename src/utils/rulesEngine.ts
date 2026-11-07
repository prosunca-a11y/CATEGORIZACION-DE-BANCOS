/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReglaInteligente, Transaccion, TipoTransaccion, ClasificacionGrupo } from '../types';

export const REGLAS_SISTEMA_DEFAULT: ReglaInteligente[] = [
  // --- TRANSFERENCIAS ENTRE CUENTAS PROPIAS (CRUCIAL PARA NO TRIBUTAR) ---
  {
    id: 'sis-trf-propias-1',
    nombre: 'Transferencias internas / Traslados entre cuentas',
    tipo: 'AMBOS',
    patron: 'CUENTAS PROPIAS|TRASPASO|ENTRE CUENTAS|TRANSF.*INTERNA|TRASLADO',
    categoria: 'Transferencias entre cuentas propias',
    grupo: 'TRANSFERENCIAS_INTERNAS',
    soporteSugerido: 'Conciliar contra el estado de cuenta de la otra cuenta bancaria propia (monto y fecha coincidente)',
    esSistema: true,
    activa: true,
    orden: 1,
  },

  // --- IMPUESTOS Y TRIBUTOS (SENIAT, ALCALDÍA, IGTF, RETENCIONES) ---
  {
    id: 'sis-seniat-formas',
    nombre: 'Planillas SENIAT (Formas 99030, 99035, 99074, 99044)',
    tipo: 'E',
    patron: 'FORMA:?\\s*990[0-9]{2}|SENIAT|PLANILLA:?\\s*260|ISLR RETENIDO|INCLUSION DE PLANILLA SENIAT|DECLARACION.*SENIAT',
    categoria: 'Impuestos y tributos (SENIAT)',
    grupo: 'IMPUESTOS_TRIBUTOS',
    soporteSugerido: 'Planilla de pago SENIAT, número de certificado electrónico de recepción y declaración de IVA/ISLR',
    esSistema: true,
    activa: true,
    orden: 2,
  },
  {
    id: 'sis-impuesto-municipal',
    nombre: 'Tributos Municipales (Alcaldías y Actividad Económica)',
    tipo: 'E',
    patron: 'ALCALDIA|ACTIVIDAD ECONOMICA|PATENTE|MUNICIPAL|TIMBRE FISCAL|G200[0-9]{5}',
    categoria: 'Impuestos y tributos (Alcaldía / Municipal)',
    grupo: 'IMPUESTOS_TRIBUTOS',
    soporteSugerido: 'Planilla de autoliquidación municipal, recibo de pago de actividad económica y solvencia municipal',
    esSistema: true,
    activa: true,
    orden: 3,
  },
  {
    id: 'sis-igtf',
    nombre: 'IGTF (Impuesto a Grandes Transacciones Financieras)',
    tipo: 'E',
    patron: '\\bIGTF\\b|IMPUESTO.*TRANSACCIONES|IGTF %|IGTF 3%',
    categoria: 'Impuestos y tributos (IGTF)',
    grupo: 'IMPUESTOS_TRIBUTOS',
    soporteSugerido: 'Débito bancario por IGTF 3% en cuenta en divisas o pagos en moneda extranjera',
    esSistema: true,
    activa: true,
    orden: 4,
  },

  // --- NÓMINA Y COMPENSACIÓN LABORAL ---
  {
    id: 'sis-nomina-completa',
    nombre: 'Nómina, Sueldos y Cestaticket / Alimentación',
    tipo: 'E',
    patron: 'NOMINA|SUELDO|SALARIO|BONO ALIMENTACION|CESTATICKET|PAO BONO|PAGO SEMANA|SEMANA\\s+[A-Z]+|QUINCENA|UTILIDADES|VACACIONES|LIQUIDACION|PRESTACIONES',
    categoria: 'Pago de sueldos y nómina',
    grupo: 'NOMINA_PERSONAL',
    soporteSugerido: 'Relación de nómina firmada por los trabajadores, recibo de bono de alimentación y txt bancario',
    esSistema: true,
    activa: true,
    orden: 5,
  },

  // --- PARAFISCALES Y SEGURIDAD SOCIAL ---
  {
    id: 'sis-parafiscales',
    nombre: 'Seguridad Social (BANAVIH, FAOV, IVSS, INCES)',
    tipo: 'E',
    patron: 'BANAVIH|FAOV|IVSS|INCES|PARAFISC|\\bSSO\\b|\\bLPH\\b|SOLVENCIA LABORAL',
    categoria: 'Seguridad social y parafiscales',
    grupo: 'PARAFISCALES_SEG_SOCIAL',
    soporteSugerido: 'Planilla de liquidación BANAVIH/FAOV, orden de pago IVSS/Tiuna y solvencias vigentes',
    esSistema: true,
    activa: true,
    orden: 6,
  },

  // --- SERVICIOS PÚBLICOS Y TELECOMUNICACIONES ---
  {
    id: 'sis-servicios-publicos',
    nombre: 'Servicios Públicos (Corpoelec, Agua, Telcom)',
    tipo: 'E',
    patron: 'CORPOELEC|MOVISTAR|DIGITEL|CANTV|\\bINTER\\b|NETUNO|HIDRO|MULTIPAGOS|SIMPLE ?TV|ELECTRICIDAD|AGUAS?',
    categoria: 'Servicios públicos y telecomunicaciones',
    grupo: 'SERVICIOS_PUBLICOS',
    soporteSugerido: 'Factura fiscal del servicio emitida a nombre y RIF de la empresa con dirección fiscal',
    esSistema: true,
    activa: true,
    orden: 7,
  },

  // --- COMISIONES BANCARIAS Y COSTOS FINANCIEROS ---
  {
    id: 'sis-comisiones',
    nombre: 'Comisiones bancarias y mantenimiento',
    tipo: 'E',
    patron: '\\bCOM\\b|\\bCOMIS|COMSERV|MANT Y SERV|MANTENIMIENTO|EMISION DE ESTADO|EMIS EDO|\\bSMS\\b|SERVICIO USO PUNTO|USO PUNTO DE VENTA|COMISION BANCO POS|COM PAGO MOVIL|COM TRF',
    categoria: 'Comisiones bancarias y de puntos de venta',
    grupo: 'COMISIONES_BANCARIAS',
    soporteSugerido: 'Estado de cuenta bancario y notas de débito emitidas por la institución bancaria',
    esSistema: true,
    activa: true,
    orden: 8,
  },

  // --- INGRESOS POR VENTAS OPERATIVAS (TRIBUTABLES EN IVA) ---
  {
    id: 'sis-ing-pos',
    nombre: 'Ventas por Punto de Venta (POS / Lotes / Débito)',
    tipo: 'I',
    patron: 'PUNTO DE VENTA|\\bPOS:?\\b|\\bLOTE:?\\b|\\bTDD\\b|\\bTDC\\b|ADQUIRENCIA|MERCHANT|CREDICARD|TDB CAPIT|\\bTMD\\b|VENTAS? TARJETA|\\bPPV\\b',
    categoria: 'Ventas por punto de venta (POS)',
    grupo: 'VENTAS_OPERATIVAS',
    soporteSugerido: 'Cierre de lote diario de la máquina POS, reporte de adquirencia y facturas del Libro de Ventas',
    esSistema: true,
    activa: true,
    orden: 9,
  },
  {
    id: 'sis-ing-cashea',
    nombre: 'Cobros Cashea (Financiamiento en cuotas)',
    tipo: 'I',
    patron: 'CASHEA|PAGO CASHEA|PAGO A CACHEA|CUOTA CASHEA|GRUPO CASHEA',
    categoria: 'Cobros Cashea (financiamiento en cuotas)',
    grupo: 'VENTAS_OPERATIVAS',
    soporteSugerido: 'Factura de venta original, liquidación de la plataforma Cashea y notas de débito por diferencial cambiario',
    esSistema: true,
    activa: true,
    orden: 10,
  },
  {
    id: 'sis-ing-pagomovil',
    nombre: 'Cobros por Pago Móvil (Clientes)',
    tipo: 'I',
    patron: 'PAGO ?MOVIL|\\bC2P\\b|\\bP2C\\b|\\bPMPC\\b|\\bPMPP\\b|BANESCO PAGO MOVIL|PAGOMOVILBDV',
    categoria: 'Cobros por Pago Móvil',
    grupo: 'VENTAS_OPERATIVAS',
    soporteSugerido: 'Factura fiscal emitida al cliente o comprobante de máquina fiscal / Libro de Ventas mensual',
    esSistema: true,
    activa: true,
    orden: 11,
  },
  {
    id: 'sis-ing-trf-clientes',
    nombre: 'Transferencias recibidas de clientes',
    tipo: 'I',
    patron: 'TRF CR|TRFMB|TRANSF.*(REC|CR)|CREDITO INM|ABONO|TRANSFERENCIA RECIBIDA',
    categoria: 'Transferencias recibidas de clientes',
    grupo: 'VENTAS_OPERATIVAS',
    soporteSugerido: 'Factura comercial a crédito/contado, nota de entrega firmada y reflejo en el Libro de Ventas',
    esSistema: true,
    activa: true,
    orden: 12,
  },
  {
    id: 'sis-ing-depositos',
    nombre: 'Depósitos en efectivo o cheque de ventas',
    tipo: 'I',
    patron: 'DEPOSITO|\\bDEP\\b|REMESA|DEPOSITO EN EFECTIVO',
    categoria: 'Depósitos en efectivo o cheque',
    grupo: 'VENTAS_OPERATIVAS',
    soporteSugerido: 'Planilla de depósito bancario sellada, arqueo y cierre diario de caja y Libro de Ventas',
    esSistema: true,
    activa: true,
    orden: 13,
  },

  // --- INGRESOS QUE NO SON VENTAS (JUSTIFICATIVOS CLAVE ANTE EL SENIAT) ---
  {
    id: 'sis-ing-socios',
    nombre: 'Aportes y préstamos de socios o accionistas',
    tipo: 'I',
    patron: 'SOCIO|ACCIONISTA|APORTE|PRESTAMO SOCIO|CAPITAL SOCIAL|MUTUO',
    categoria: 'Aportes y préstamos de socios',
    grupo: 'INGRESOS_NO_VENTAS',
    soporteSugerido: 'Acta de asamblea de accionistas o contrato de mutuo con fecha cierta y registro en cuenta de pasivo de socios',
    esSistema: true,
    activa: true,
    orden: 14,
  },
  {
    id: 'sis-ing-prestamos-banco',
    nombre: 'Préstamos bancarios y créditos comerciales recibidos',
    tipo: 'I',
    patron: 'PRESTAMO BANCARIO|DESEMBOLSO|CREDITO OTORGADO|FINANCIAMIENTO BANCARIO|PAGARE',
    categoria: 'Préstamos bancarios y financiamiento recibido',
    grupo: 'INGRESOS_NO_VENTAS',
    soporteSugerido: 'Contrato de préstamo comercial firmado con el banco, tabla de amortización y nota de crédito de desembolso',
    esSistema: true,
    activa: true,
    orden: 15,
  },
  {
    id: 'sis-cambiario',
    nombre: 'Operaciones cambiarias / Compra y venta de divisas',
    tipo: 'AMBOS',
    patron: 'DIVISA|MESA DE CAMBIO|MONEDA EXTRANJERA|\\bBCV\\b|OPERACION EN USD',
    categoria: 'Operaciones cambiarias (divisas / mesa de cambio)',
    grupo: 'INGRESOS_NO_VENTAS',
    soporteSugerido: 'Comprobante de intervención cambiaria o mesa de cambio del banco y tipo de cambio oficial BCV del día',
    esSistema: true,
    activa: true,
    orden: 16,
  },
  {
    id: 'sis-reversos',
    nombre: 'Reversos bancarios y devoluciones',
    tipo: 'I',
    patron: 'REVERSO|DEVOLUCION|ANULACION|CORRECCION BANCARIA',
    categoria: 'Reversos y devoluciones bancarias',
    grupo: 'INGRESOS_NO_VENTAS',
    soporteSugerido: 'Comprobante del error u operación original reversada, carta al banco o nota de crédito',
    esSistema: true,
    activa: true,
    orden: 17,
  },

  // --- EGRESOS A PROVEEDORES ---
  {
    id: 'sis-egr-proveedores',
    nombre: 'Pago a proveedores y suministros (Transferencias)',
    tipo: 'E',
    patron: 'TRANSCTAS|TRFOB|TRFMB|TRF DB|TRANSF.*(ENV|DEB)|TERCEROS|PROVEEDOR|PAGO A |SUMINISTROS|REPUESTOS|SEGUROS',
    categoria: 'Pago a proveedores (transferencias)',
    grupo: 'PAGO_PROVEEDORES',
    soporteSugerido: 'Factura fiscal de compra con RIF del proveedor, comprobante de retención de IVA e ISLR si aplica',
    esSistema: true,
    activa: true,
    orden: 18,
  },
  {
    id: 'sis-egr-pagomovil',
    nombre: 'Pagos menores y suministros vía Pago Móvil',
    tipo: 'E',
    patron: 'PAGO ?MOVIL|\\bC2P\\b|PAGOMOV|BANESCO PAGO MOVIL',
    categoria: 'Pagos por Pago Móvil',
    grupo: 'PAGO_PROVEEDORES',
    soporteSugerido: 'Factura fiscal del gasto a nombre de la empresa y confirmación de recepción del beneficiario',
    esSistema: true,
    activa: true,
    orden: 19,
  },
  {
    id: 'sis-egr-efectivo-cheque',
    nombre: 'Retiros en cajero o cheques pagados',
    tipo: 'E',
    patron: 'RETIRO|CAJERO|\\bATM\\b|EFECTIVO|CHEQUE|\\bCHQ\\b',
    categoria: 'Retiros en efectivo o cheques pagados',
    grupo: 'OTROS_GASTOS',
    soporteSugerido: 'Recibo o vale de caja chica con factura fiscal o copia del cheque y orden de pago (alto riesgo en fiscalización)',
    esSistema: true,
    activa: true,
    orden: 20,
  },
];

/**
 * Normaliza una cadena de texto para comparación libre de acentos y caracteres especiales
 */
export function normalizarTexto(texto: string): string {
  if (!texto) return '';
  return texto
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Clasifica automáticamente una transacción bancaria según el motor de reglas
 */
export function clasificarTransaccion(
  tx: Omit<Transaccion, 'categoria' | 'grupo' | 'soporteRequerido' | 'soporteEstado'>,
  reglasPersonalizadas: ReglaInteligente[] = []
): {
  categoria: string;
  grupo: ClasificacionGrupo;
  soporteRequerido: string;
  reglaAplicada?: string;
} {
  const todasLasReglas = [
    ...reglasPersonalizadas.filter(r => r.activa),
    ...REGLAS_SISTEMA_DEFAULT.filter(r => r.activa),
  ].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99));

  // Regla especial para cuenta BNC Cashea
  if (tx.banco === 'BNC Cashea' && tx.monto > 0) {
    return {
      categoria: 'Cobros Cashea (financiamiento en cuotas)',
      grupo: 'VENTAS_OPERATIVAS',
      soporteRequerido:
        'Facturas de venta, reporte de liquidación de Cashea y notas de débito por diferencial cambiario',
      reglaAplicada: 'Detección automática por banco BNC Cashea',
    };
  }

  const tipo = tx.monto > 0 ? 'I' : 'E';
  const descNorm = normalizarTexto(tx.descripcion);
  const refNorm = normalizarTexto(tx.referencia || '');
  const textoEval = `${descNorm} ${refNorm}`;

  for (const regla of todasLasReglas) {
    if (regla.tipo !== 'AMBOS' && regla.tipo !== tipo) continue;

    try {
      const regex = new RegExp(regla.patron, 'i');
      if (regex.test(textoEval)) {
        return {
          categoria: regla.categoria,
          grupo: regla.grupo,
          soporteRequerido: regla.soporteSugerido,
          reglaAplicada: regla.nombre,
        };
      }
    } catch {
      // Si la regex falla, comparación de inclusión básica
      if (textoEval.includes(normalizarTexto(regla.patron))) {
        return {
          categoria: regla.categoria,
          grupo: regla.grupo,
          soporteRequerido: regla.soporteSugerido,
          reglaAplicada: regla.nombre,
        };
      }
    }
  }

  // Si no coincidió con ninguna regla específica:
  const palabras = descNorm
    .replace(/[^A-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(p => p.length > 2 && !/^(TELF|BANCO|CED|CTA|NRO|PARA|FECHA|PAGO|TRF)/.test(p))
    .slice(0, 3)
    .join(' ');

  if (tipo === 'I') {
    return {
      categoria: palabras ? `Otros ingresos: ${palabras}` : 'Otros ingresos por identificar',
      grupo: 'OTROS_INGRESOS',
      soporteRequerido: 'Identificar el soporte (contrato, factura u orden de pago) que respalde la operación',
    };
  } else {
    return {
      categoria: palabras ? `Otros egresos: ${palabras}` : 'Otros egresos por identificar',
      grupo: 'OTROS_GASTOS',
      soporteRequerido: 'Identificar el soporte (factura de compra, recibo o contrato) para deducción en ISLR/IVA',
    };
  }
}

/**
 * Empareja transferencias entre cuentas propias de la misma empresa (BNC <-> Banesco, etc.)
 * y las concilia bidireccionalmente para asegurar que no se dupliquen o cuenten como ventas.
 */
export function emparejarTransferenciasInternas(transacciones: Transaccion[]): Transaccion[] {
  const resultado = transacciones.map(t => ({ ...t }));
  const ingresosCandidatos = resultado.filter(
    t => t.monto > 0 && !t.esManual && (
      t.grupo === 'OTROS_INGRESOS' ||
      t.categoria.includes('Transferencias') ||
      t.categoria.includes('Pago Móvil') ||
      t.categoria.includes('Otros')
    )
  );

  const matchedIngresos = new Set<string>();

  for (const egreso of resultado) {
    if (egreso.monto >= 0 || egreso.esManual) continue;

    // Buscar si hay un ingreso opuesto por el mismo monto exacto (±0.05 Bs) y fecha cercana (±2 días)
    const egresoFecha = new Date(egreso.fecha).getTime();
    const egresoMontoAbs = Math.abs(egreso.monto);

    const match = ingresosCandidatos.find(ingreso => {
      if (matchedIngresos.has(ingreso.id)) return false;
      if (ingreso.empresa !== egreso.empresa) return false;
      if (ingreso.banco === egreso.banco) return false; // Cuentas distintas

      const montoDiferencia = Math.abs(ingreso.monto - egresoMontoAbs);
      if (montoDiferencia > 0.05) return false;

      const ingresoFecha = new Date(ingreso.fecha).getTime();
      const diasDif = Math.abs(ingresoFecha - egresoFecha) / (1000 * 60 * 60 * 24);
      return diasDif <= 3;
    });

    if (match) {
      matchedIngresos.add(match.id);

      const catPropias = 'Transferencias entre cuentas propias';
      const grupoPropias: ClasificacionGrupo = 'TRANSFERENCIAS_INTERNAS';
      const soporte = 'Conciliar con el estado de cuenta de la otra cuenta bancaria: egreso e ingreso deben cuadrar';

      egreso.categoria = catPropias;
      egreso.grupo = grupoPropias;
      egreso.soporteRequerido = soporte;
      egreso.reglaAplicada = `Conciliación interbancaria automática (${egreso.banco} ↔ ${match.banco})`;

      match.categoria = catPropias;
      match.grupo = grupoPropias;
      match.soporteRequerido = soporte;
      match.reglaAplicada = `Conciliación interbancaria automática (${match.banco} ↔ ${egreso.banco})`;
    }
  }

  return resultado;
}
