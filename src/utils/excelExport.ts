/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Transaccion, ConciliacionMes } from '../types';

export function formatearBolivares(valor: number): string {
  return valor.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function nombreMesLargo(mesIso: string): string {
  if (!mesIso) return '';
  const [anio, mesNum] = mesIso.split('-');
  const meses = [
    '',
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return `${meses[parseInt(mesNum, 10)] || mesIso} ${anio}`;
}

/**
 * Genera un informe auditable de alta calidad ejecutiva en formato Excel (.xlsx),
 * incluyendo la HOJA DE RESUMEN MENSUAL POR CATEGORÍA (Ingresos y Egresos con fórmulas SUMIFS),
 * conciliación fiscal SENIAT, resumen de bancos y detalle de operaciones.
 */
export function exportarAuditoriaExcel(
  transacciones: Transaccion[],
  conciliaciones: Record<string, ConciliacionMes>,
  empresaFiltro: string,
  bancoFiltro: string
) {
  if (!transacciones.length) {
    alert('No hay operaciones cargadas para exportar a Excel. Carga un estado de cuenta o los datos de prueba primero.');
    return;
  }

  const wb = XLSX.utils.book_new();
  const meses = [...new Set(transacciones.map(t => t.fecha.slice(0, 7)))].sort();
  const numTx = transacciones.length + 1; // Última fila en Hoja Detalle

  const formatBs = '#,##0.00;[Red]-#,##0.00;"-"';
  const colLetter = (n: number) => XLSX.utils.encode_col(n);
  const serialFecha = (fechaIso: string) =>
    Math.round(Date.parse(fechaIso) / 864e5) + 25569;

  // =========================================================================
  // HOJA 1: RESUMEN MENSUAL POR CATEGORÍA (INGRESOS Y EGRESOS)
  // =========================================================================
  const rowsCategorias: any[][] = [
    [
      {
        v: `RESUMEN MENSUAL POR CATEGORÍA DE INGRESOS Y EGRESOS — ${
          empresaFiltro || 'CONSOLIDADO GENERAL'
        }`,
        t: 's',
      },
    ],
    [
      {
        v: `Soporte para fiscalización SENIAT | Empresa: ${
          empresaFiltro || 'Todas'
        } | Banco: ${bancoFiltro || 'Todos'} | Moneda: Bolívares (Bs.)`,
        t: 's',
      },
    ],
    [],
  ];

  // --- SECCIÓN 1: INGRESOS ---
  const catsIngresos = [
    ...new Set(transacciones.filter(t => t.monto > 0).map(t => t.categoria)),
  ].sort();

  rowsCategorias.push(['INGRESOS BANCARIOS (BOLÍVARES)']);
  const headerCatRow = ['Categoría / Concepto', ...meses.map(nombreMesLargo), 'Total Acumulado', 'Soporte Exigible SENIAT'];
  rowsCategorias.push(headerCatRow);

  const startIngRow = rowsCategorias.length + 1;

  catsIngresos.forEach((cat, idx) => {
    const r = startIngRow + idx;
    const row: any[] = [cat];
    const soporte =
      transacciones.find(t => t.categoria === cat)?.soporteRequerido ||
      'Identificar factura fiscal u orden de pago correspondiente';

    meses.forEach(m => {
      const mesKey = Number(m.replace('-', ''));
      row.push({
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$G$2:$G$${numTx},"$A${r}",Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      });
    });

    // Total Fila
    const lastMesCol = colLetter(meses.length);
    row.push({
      t: 'n',
      f: `SUM(B${r}:${lastMesCol}${r})`,
      z: formatBs,
    });
    row.push(soporte);

    rowsCategorias.push(row);
  });

  const endIngRow = startIngRow + catsIngresos.length - 1;
  const totIngRow: any[] = ['TOTAL INGRESOS BANCARIOS'];
  for (let colIdx = 1; colIdx <= meses.length + 1; colIdx++) {
    const cLet = colLetter(colIdx);
    totIngRow.push({
      t: 'n',
      f: `SUM(${cLet}${startIngRow}:${cLet}${endIngRow})`,
      z: formatBs,
    });
  }
  totIngRow.push('Ingresos Brutos');
  rowsCategorias.push(totIngRow);
  rowsCategorias.push([]);

  // --- SECCIÓN 2: EGRESOS ---
  const catsEgresos = [
    ...new Set(transacciones.filter(t => t.monto < 0).map(t => t.categoria)),
  ].sort();

  rowsCategorias.push(['EGRESOS BANCARIOS (BOLÍVARES)']);
  rowsCategorias.push(headerCatRow);

  const startEgrRow = rowsCategorias.length + 1;

  catsEgresos.forEach((cat, idx) => {
    const r = startEgrRow + idx;
    const row: any[] = [cat];
    const soporte =
      transacciones.find(t => t.categoria === cat)?.soporteRequerido ||
      'Factura fiscal de compra o comprobante del gasto';

    meses.forEach(m => {
      const mesKey = Number(m.replace('-', ''));
      row.push({
        t: 'n',
        f: `-SUMIFS(Detalle!$E$2:$E$${numTx},Detalle!$G$2:$G$${numTx},"$A${r}",Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      });
    });

    const lastMesCol = colLetter(meses.length);
    row.push({
      t: 'n',
      f: `SUM(B${r}:${lastMesCol}${r})`,
      z: formatBs,
    });
    row.push(soporte);

    rowsCategorias.push(row);
  });

  const endEgrRow = startEgrRow + catsEgresos.length - 1;
  const totEgrRow: any[] = ['TOTAL EGRESOS BANCARIOS'];
  for (let colIdx = 1; colIdx <= meses.length + 1; colIdx++) {
    const cLet = colLetter(colIdx);
    totEgrRow.push({
      t: 'n',
      f: `SUM(${cLet}${startEgrRow}:${cLet}${endEgrRow})`,
      z: formatBs,
    });
  }
  totEgrRow.push('Egresos Brutos');
  rowsCategorias.push(totEgrRow);
  rowsCategorias.push([]);

  // --- SECCIÓN 3: FLUJO NETO ---
  const totNetoRow: any[] = ['RESULTADO OPERATIVO NETO DE CAJA (INGRESOS - EGRESOS)'];
  const totIngRowNumber = endIngRow + 1;
  const totEgrRowNumber = endEgrRow + 1;

  for (let colIdx = 1; colIdx <= meses.length + 1; colIdx++) {
    const cLet = colLetter(colIdx);
    totNetoRow.push({
      t: 'n',
      f: `${cLet}${totIngRowNumber}-${cLet}${totEgrRowNumber}`,
      z: formatBs,
    });
  }
  totNetoRow.push('Superávit / Déficit');
  rowsCategorias.push(totNetoRow);

  const wsCategorias = XLSX.utils.aoa_to_sheet(rowsCategorias);
  wsCategorias['!cols'] = [
    { wch: 42 },
    ...meses.map(() => ({ wch: 18 })),
    { wch: 22 },
    { wch: 55 },
  ];
  wsCategorias['!freeze'] = { xSplit: 0, ySplit: 4 };
  XLSX.utils.book_append_sheet(wb, wsCategorias, 'Resumen por Categoría');

  // =========================================================================
  // HOJA 2: RESUMEN EJECUTIVO Y FLUIDEZ DE CAJA
  // =========================================================================
  const rowsResumen: any[][] = [
    [
      {
        v: `INFORME EJECUTIVO DE FLUIDEZ Y CAJA BANCARIA — ${
          empresaFiltro || 'CONSOLIDADO GENERAL'
        }`,
        t: 's',
      },
    ],
    [
      {
        v: `Generado el: ${new Date().toLocaleDateString(
          'es-VE'
        )} | Banco: ${bancoFiltro || 'Todos los bancos'} | Moneda: Bolívares (Bs.)`,
        t: 's',
      },
    ],
    [],
    [
      'Mes',
      'Ingresos Brutos',
      'Egresos Brutos',
      'Flujo Neto Bancario',
      'Traspasos Cuentas Propias (Entrada)',
      'Traspasos Cuentas Propias (Salida)',
      'Ingresos Operativos Reales',
      'Egresos Operativos Reales',
      'Resultado Operativo',
      'Dictamen de Caja',
    ],
  ];

  meses.forEach((m, idx) => {
    const r = 5 + idx;
    const mesKey = Number(m.replace('-', ''));

    rowsResumen.push([
      nombreMesLargo(m),
      {
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      },
      {
        t: 'n',
        f: `-SUMIFS(Detalle!$E$2:$E$${numTx},Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      },
      { t: 'n', f: `B${r}-C${r}`, z: formatBs },
      {
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$H$2:$H$${numTx},"TRANSFERENCIAS_INTERNAS",Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      },
      {
        t: 'n',
        f: `-SUMIFS(Detalle!$E$2:$E$${numTx},Detalle!$H$2:$H$${numTx},"TRANSFERENCIAS_INTERNAS",Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      },
      { t: 'n', f: `B${r}-E${r}`, z: formatBs },
      { t: 'n', f: `C${r}-F${r}`, z: formatBs },
      { t: 'n', f: `G${r}-H${r}`, z: formatBs },
      {
        t: 'str',
        v: '',
        f: `IF(I${r}>0,"Superávit operativo de caja",IF(I${r}<0,"Déficit operativo cubierto con saldo/crédito","Ingresos = Egresos"))`,
      },
    ]);
  });

  const mCount = meses.length;
  const totRowIndex = 5 + mCount;

  rowsResumen.push([
    'TOTAL ACUMULADO PERÍODO',
    { t: 'n', f: `SUM(B5:B${totRowIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(C5:C${totRowIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(D5:D${totRowIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(E5:E${totRowIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(F5:F${totRowIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(G5:G${totRowIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(H5:H${totRowIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(I5:I${totRowIndex - 1})`, z: formatBs },
    'Consolidado Auditado',
  ]);

  const wsResumen = XLSX.utils.aoa_to_sheet(rowsResumen);
  wsResumen['!cols'] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 22 },
    { wch: 38 },
  ];
  wsResumen['!freeze'] = { xSplit: 0, ySplit: 4 };
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

  // =========================================================================
  // HOJA 3: CONCILIACIÓN FISCAL SENIAT (FORMA 99030 vs. BANCOS)
  // =========================================================================
  const rowsSeniat: any[][] = [
    [
      {
        v: 'CONCILIACIÓN MATEMÁTICA: DEPÓSITOS BANCARIOS VS. VENTAS DECLARADAS SENIAT (FORMA 99030)',
        t: 's',
      },
    ],
    [
      {
        v: 'Soporte legal para justificar ante fiscalizaciones del SENIAT por qué no todo depósito bancario es venta gravable.',
        t: 's',
      },
    ],
    [],
    [
      'Mes',
      'Depósitos Totales Banco (A)',
      '(-) Traspasos Cuentas Propias (B)',
      '(-) Aportes / Préstamos Socios (C)',
      '(-) Préstamos Bancarios (D)',
      '(-) Otros Ingresos No Ventas (E)',
      '(=) Ventas Netas según Banco (F)',
      'Ventas Declaradas SENIAT F-99030 (G)',
      'Diferencia Banco - SENIAT (F - G)',
      'Diagnóstico de Riesgo Fiscal SENIAT',
    ],
  ];

  meses.forEach((m, idx) => {
    const r = 5 + idx;
    const mesKey = Number(m.replace('-', ''));
    const decl = conciliaciones[m]?.ventasDeclaradasSeniat || 0;

    rowsSeniat.push([
      nombreMesLargo(m),
      {
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      },
      {
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$H$2:$H$${numTx},"TRANSFERENCIAS_INTERNAS",Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      },
      {
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$G$2:$G$${numTx},"Aportes y préstamos de socios",Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      },
      {
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$G$2:$G$${numTx},"Préstamos bancarios y financiamiento recibido",Detalle!$I$2:$I$${numTx},${mesKey})`,
        z: formatBs,
      },
      {
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$H$2:$H$${numTx},"INGRESOS_NO_VENTAS",Detalle!$I$2:$I$${numTx},${mesKey})-D${r}-E${r}`,
        z: formatBs,
      },
      { t: 'n', f: `B${r}-C${r}-D${r}-E${r}-F${r}`, z: formatBs },
      decl > 0 ? { t: 'n', v: Math.round(decl * 100) / 100, z: formatBs } : '',
      { t: 'n', f: `IF(ISNUMBER(H${r}),G${r}-H${r},"")`, z: formatBs },
      {
        t: 'str',
        v: '',
        f: `IF(NOT(ISNUMBER(H${r})),"Pendiente registrar F-99030",IF(ABS(I${r})<1.0,"✔ Cuadra perfectamente",IF(I${r}>0,"⚠ ALERTA: Depósitos superan ventas declaradas (Justificar)","Declaró más ventas que lo depositado (Créditos/Efectivo)")))`,
      },
    ]);
  });

  const totSeniatIndex = 5 + mCount;
  rowsSeniat.push([
    'TOTAL ACUMULADO PERÍODO',
    { t: 'n', f: `SUM(B5:B${totSeniatIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(C5:C${totSeniatIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(D5:D${totSeniatIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(E5:E${totSeniatIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(F5:F${totSeniatIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(G5:G${totSeniatIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(H5:H${totSeniatIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(I5:I${totSeniatIndex - 1})`, z: formatBs },
    'Verificado SENIAT',
  ]);

  const wsSeniat = XLSX.utils.aoa_to_sheet(rowsSeniat);
  wsSeniat['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 26 },
    { wch: 24 },
    { wch: 48 },
  ];
  wsSeniat['!freeze'] = { xSplit: 0, ySplit: 4 };
  XLSX.utils.book_append_sheet(wb, wsSeniat, 'Conciliación SENIAT');

  // =========================================================================
  // HOJA 4: RESUMEN BANCARIO Y COMPENSACIÓN INTERBANCARIA
  // =========================================================================
  const bancos = [...new Set(transacciones.map(t => t.banco))].sort();
  const rowsBancos: any[][] = [
    ['CONTROL BANCARIO MULTICUENTA Y COMPENSACIÓN DE TRASPASOS INTERNOS'],
    [
      'Las transferencias entre cuentas propias deben sumar exactamente 0,00 Bs. a nivel consolidado para garantizar que no hay omisiones ni duplicaciones.',
    ],
    [],
    [
      'Banco / Cuenta',
      'N° Operaciones',
      'Ingresos Totales (Bs)',
      'Egresos Totales (Bs)',
      'Flujo Neto (Bs)',
      'Entradas Cuentas Propias',
      'Salidas Cuentas Propias',
      'Balance Traspasos Propios',
      'Estado Compensación',
    ],
  ];

  bancos.forEach((b, idx) => {
    const r = 5 + idx;

    rowsBancos.push([
      b,
      {
        t: 'n',
        f: `COUNTIF(Detalle!$L$2:$L$${numTx},"${b}")`,
        z: '#,##0',
      },
      {
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$L$2:$L$${numTx},"${b}")`,
        z: formatBs,
      },
      {
        t: 'n',
        f: `-SUMIFS(Detalle!$E$2:$E$${numTx},Detalle!$L$2:$L$${numTx},"${b}")`,
        z: formatBs,
      },
      { t: 'n', f: `C${r}-D${r}`, z: formatBs },
      {
        t: 'n',
        f: `SUMIFS(Detalle!$D$2:$D$${numTx},Detalle!$H$2:$H$${numTx},"TRANSFERENCIAS_INTERNAS",Detalle!$L$2:$L$${numTx},"${b}")`,
        z: formatBs,
      },
      {
        t: 'n',
        f: `-SUMIFS(Detalle!$E$2:$E$${numTx},Detalle!$H$2:$H$${numTx},"TRANSFERENCIAS_INTERNAS",Detalle!$L$2:$L$${numTx},"${b}")`,
        z: formatBs,
      },
      { t: 'n', f: `F${r}-G${r}`, z: formatBs },
      {
        t: 'str',
        v: '',
        f: `IF(ABS(H${r})<0.01,"✔ Neutro (Compensado)","Revisar saldo interbancario")`,
      },
    ]);
  });

  const totBancosIndex = 5 + bancos.length;
  rowsBancos.push([
    'TOTAL CONSOLIDADO BANCOS',
    { t: 'n', f: `SUM(B5:B${totBancosIndex - 1})`, z: '#,##0' },
    { t: 'n', f: `SUM(C5:C${totBancosIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(D5:D${totBancosIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(E5:E${totBancosIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(F5:F${totBancosIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(G5:G${totBancosIndex - 1})`, z: formatBs },
    { t: 'n', f: `SUM(H5:H${totBancosIndex - 1})`, z: formatBs },
    {
      t: 'str',
      v: '',
      f: `IF(ROUND(H${totBancosIndex},2)=0,"✔ Compensación Perfecta (0,00 Bs)","✖ Error: Traspasos sin contraparte")`,
    },
  ]);

  const wsBancos = XLSX.utils.aoa_to_sheet(rowsBancos);
  wsBancos['!cols'] = [
    { wch: 28 },
    { wch: 16 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 32 },
  ];
  wsBancos['!freeze'] = { xSplit: 0, ySplit: 4 };
  XLSX.utils.book_append_sheet(wb, wsBancos, 'Resumen Bancos');

  // =========================================================================
  // HOJA 5: DETALLE COMPLETO DE OPERACIONES Y SOPORTES FISCALES
  // =========================================================================
  const rowsDetalle: any[][] = [
    [
      'Fecha',
      'Descripción Bancaria',
      'Referencia',
      'Ingreso (+)',
      'Egreso (-)',
      'Saldo Banco',
      'Categoría Asignada',
      'Grupo Fiscal',
      'Mes Key',
      'Soporte SENIAT Exigible',
      'Estado Soporte',
      'Banco',
      'Empresa',
      'N° Factura / Documento',
    ],
  ];

  transacciones.forEach(t => {
    const mesKey = Number(t.fecha.slice(0, 4) + t.fecha.slice(5, 7));

    rowsDetalle.push([
      { t: 'n', v: serialFecha(t.fecha), z: 'dd/mm/yyyy' },
      t.descripcion,
      t.referencia || '',
      t.monto > 0 ? { t: 'n', v: Math.round(t.monto * 100) / 100, z: formatBs } : '',
      t.monto < 0 ? { t: 'n', v: Math.round(t.monto * 100) / 100, z: formatBs } : '',
      t.saldo != null ? { t: 'n', v: Math.round(t.saldo * 100) / 100, z: formatBs } : '',
      t.categoria,
      t.grupo,
      { t: 'n', v: mesKey, z: '0' },
      t.soporteRequerido,
      t.soporteEstado === 'ubicado'
        ? 'Ubicado / Listo'
        : t.soporteEstado === 'pendiente'
        ? 'Pendiente'
        : 'No Requerido',
      t.banco,
      t.empresa,
      t.soporteDoc || '',
    ]);
  });

  const wsDetalle = XLSX.utils.aoa_to_sheet(rowsDetalle);
  wsDetalle['!cols'] = [
    { wch: 12 },
    { wch: 48 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 34 },
    { wch: 24 },
    { wch: 10 },
    { wch: 48 },
    { wch: 16 },
    { wch: 24 },
    { wch: 24 },
    { wch: 22 },
  ];
  wsDetalle['!autofilter'] = { ref: `A1:N${numTx}` };
  wsDetalle['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

  // Ajustes de Cálculo Automático al Abrir en Excel
  (wb as any).Workbook = { CalcPr: { fullCalcOnLoad: true } };

  const nombreArchivo = `Informe_Resumen_Categorias_${(
    empresaFiltro || 'Todas_las_empresas'
  ).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(wb, nombreArchivo);
}
