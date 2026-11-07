/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaccion, ConciliacionMes } from '../types';

export const EMPRESA_DEMO = {
  nombre: 'China Korea Motors C.A.',
  rif: 'J-299979066',
};

export const CONCILIACIONES_DEFAULT: ConciliacionMes[] = [
  {
    mes: '2024-07',
    baseImponible: 5163592.70,
    ivaDebitoFiscal: 826174.83,
    ventasDeclaradasSeniat: 5989767.53, // Base + IVA
    observaciones: 'Declaración Forma 99030 Julio: Base Imponible Bs. 5.163.592,70 + IVA Débito Fiscal Bs. 826.174,83. Afectado por financiamiento Cashea.',
  },
  {
    mes: '2024-08',
    baseImponible: 4022557.77,
    ivaDebitoFiscal: 643609.23,
    ventasDeclaradasSeniat: 4666167.00, // Base + IVA
    observaciones: 'Declaración Forma 99030 Agosto: Base Imponible Bs. 4.022.557,77 + IVA Débito Fiscal Bs. 643.609,23.',
  },
  {
    mes: '2026-07',
    baseImponible: 5163592.70,
    ivaDebitoFiscal: 826174.83,
    ventasDeclaradasSeniat: 5989767.53,
    observaciones: 'Declaración Forma 99030 Julio: Base Imponible Bs. 5.163.592,70 + IVA Débito Fiscal Bs. 826.174,83.',
  },
  {
    mes: '2026-08',
    baseImponible: 4022557.77,
    ivaDebitoFiscal: 643609.23,
    ventasDeclaradasSeniat: 4666167.00,
    observaciones: 'Declaración Forma 99030 Agosto: Base Imponible Bs. 4.022.557,77 + IVA Débito Fiscal Bs. 643.609,23.',
  },
];

/**
 * Genera el conjunto de transacciones reales representativas de Julio y Agosto 2026
 * basándose en los estados de cuenta de BNC, Banesco y BNC Cashea.
 */
export function generarTransaccionesDemo(): Transaccion[] {
  const transacciones: Transaccion[] = [];

  // --- 1. TRANSFERENCIAS ENTRE CUENTAS PROPIAS (CHINAKOREA MOTORS BNC <-> BANESCO) ---
  const traslados = [
    { fecha: '2026-07-01', monto: 111500.00, ref: '151603100' },
    { fecha: '2026-07-03', monto: 150000.00, ref: '176950' },
    { fecha: '2026-07-03', monto: 107000.00, ref: '112439597' },
    { fecha: '2026-07-06', monto: 101200.00, ref: '85308503' },
    { fecha: '2026-07-07', monto: 203000.00, ref: '172846293' },
    { fecha: '2026-07-08', monto: 300000.00, ref: '325033' },
    { fecha: '2026-07-08', monto: 174000.00, ref: '175452503' },
    { fecha: '2026-07-09', monto: 56000.00, ref: '172035089' },
    { fecha: '2026-07-13', monto: 89000.00, ref: '173243675' },
    { fecha: '2026-07-14', monto: 400000.00, ref: '121982' },
    { fecha: '2026-07-14', monto: 56400.00, ref: '112955034' },
    { fecha: '2026-07-17', monto: 191500.00, ref: '73437701' },
    { fecha: '2026-07-17', monto: 42000.00, ref: '165646078' },
    { fecha: '2026-07-20', monto: 73000.00, ref: '111700227' },
    { fecha: '2026-07-21', monto: 250000.00, ref: '160574' },
    { fecha: '2026-07-21', monto: 24000.00, ref: '123056642' },
    { fecha: '2026-07-23', monto: 190000.00, ref: '131728589' },
    { fecha: '2026-07-24', monto: 115000.00, ref: '154123189' },
    { fecha: '2026-07-27', monto: 96000.00, ref: '172904478' },
    { fecha: '2026-07-28', monto: 200000.00, ref: '257153' },
    { fecha: '2026-07-28', monto: 50000.00, ref: '155847286' },
    { fecha: '2026-07-30', monto: 250000.00, ref: '134148' },
    { fecha: '2026-07-30', monto: 150000.00, ref: '105352583' },
    { fecha: '2026-07-31', monto: 110000.00, ref: '429567' },
    { fecha: '2026-07-31', monto: 70000.00, ref: '162241517' },
    // Agosto
    { fecha: '2026-08-01', monto: 27000.00, ref: '101556771' },
    { fecha: '2026-08-03', monto: 69000.00, ref: '100129607' },
    { fecha: '2026-08-05', monto: 75000.00, ref: '94749846' },
    { fecha: '2026-08-06', monto: 165000.00, ref: '90013803' },
    { fecha: '2026-08-06', monto: 40000.00, ref: '176326' },
    { fecha: '2026-08-06', monto: 36000.00, ref: '125218839' },
    { fecha: '2026-08-07', monto: 200000.00, ref: '157158' },
    { fecha: '2026-08-10', monto: 515000.00, ref: '162153252' },
    { fecha: '2026-08-10', monto: 300000.00, ref: '64665' },
    { fecha: '2026-08-11', monto: 40000.00, ref: '173436049' },
    { fecha: '2026-08-12', monto: 200000.00, ref: '53632' },
    { fecha: '2026-08-12', monto: 75000.00, ref: '121306139' },
    { fecha: '2026-08-14', monto: 300000.00, ref: '91523' },
    { fecha: '2026-08-14', monto: 190000.00, ref: '85330178' },
    { fecha: '2026-08-14', monto: 50000.00, ref: '358959' },
    { fecha: '2026-08-14', monto: 8500.00, ref: '141218126' },
    { fecha: '2026-08-15', monto: 168000.00, ref: '247502' },
    { fecha: '2026-08-15', monto: 53000.00, ref: '135511124' },
    { fecha: '2026-08-15', monto: 800.00, ref: '140140467' },
    { fecha: '2026-08-17', monto: 83000.00, ref: '104326514' },
    { fecha: '2026-08-20', monto: 750000.00, ref: '164899' },
    { fecha: '2026-08-20', monto: 296000.00, ref: '124110181' },
    { fecha: '2026-08-21', monto: 56000.00, ref: '120310576' },
    { fecha: '2026-08-22', monto: 175000.00, ref: '73424' },
    { fecha: '2026-08-22', monto: 14000.00, ref: '94631604' },
    { fecha: '2026-08-25', monto: 233000.00, ref: '144039827' },
    { fecha: '2026-08-27', monto: 121000.00, ref: '81203846' },
    { fecha: '2026-08-28', monto: 300000.00, ref: '279497' },
    { fecha: '2026-08-28', monto: 28500.00, ref: '135752453' },
    { fecha: '2026-08-29', monto: 156500.00, ref: '103537528' },
    { fecha: '2026-08-29', monto: 51500.00, ref: '120452027' },
    { fecha: '2026-08-31', monto: 200000.00, ref: '135918736' },
  ];

  traslados.forEach((trf, idx) => {
    // Ingreso en BNC
    transacciones.push({
      id: `demo-trf-in-${idx}`,
      fecha: trf.fecha,
      descripcion: `TRANSFERENCIA RECIBIDA DEL BCO. NACIONAL DE CREDITO A NOMBRE DE: J-299979066 CHINAKOREA MOTORS C A DE LA CUENTA NRO. 01910233512100068514 traslado`,
      referencia: trf.ref,
      monto: trf.monto,
      saldo: 368393.48,
      tipo: 'I',
      categoria: 'Transferencias entre cuentas propias',
      grupo: 'TRANSFERENCIAS_INTERNAS',
      soporteRequerido: 'Conciliar contra el estado de cuenta de la otra cuenta bancaria propia (monto y fecha coincidente)',
      soporteEstado: 'ubicado',
      soporteDoc: `TRF-${trf.ref}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'BNC (Banco Nacional de Crédito)',
      archivoOrigen: 'EDO_CUENTA_BNC_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Transferencias internas / Traslados entre cuentas',
    });

    // Egreso en Banesco
    transacciones.push({
      id: `demo-trf-out-${idx}`,
      fecha: trf.fecha,
      descripcion: `TRANSFERENCIA A FAVOR DE: CHINAKOREA MOTORS C A PARA LA CUENTA NRO. 01910233552100068509 traslado`,
      referencia: trf.ref,
      monto: -trf.monto,
      saldo: 43158.56,
      tipo: 'E',
      categoria: 'Transferencias entre cuentas propias',
      grupo: 'TRANSFERENCIAS_INTERNAS',
      soporteRequerido: 'Conciliar contra el estado de cuenta de la otra cuenta bancaria propia (monto y fecha coincidente)',
      soporteEstado: 'ubicado',
      soporteDoc: `TRF-${trf.ref}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'Banesco',
      archivoOrigen: 'EDO_CUENTA_BANESCO_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Transferencias internas / Traslados entre cuentas',
    });
  });

  // --- 2. VENTAS POR PUNTO DE VENTA (POS LOTES) ---
  const posLotes = [
    { fecha: '2026-07-02', monto: 82336.80, ref: '312', lote: '000312' },
    { fecha: '2026-07-03', monto: 44779.00, ref: '313', lote: '000313' },
    { fecha: '2026-07-04', monto: 14365.34, ref: '314', lote: '000314' },
    { fecha: '2026-07-07', monto: 97377.80, ref: '315', lote: '000315' },
    { fecha: '2026-07-09', monto: 128398.79, ref: '316', lote: '000316' },
    { fecha: '2026-07-10', monto: 56017.60, ref: '317', lote: '000317' },
    { fecha: '2026-07-11', monto: 7096.90, ref: '318', lote: '000318' },
    { fecha: '2026-07-14', monto: 172620.75, ref: '319', lote: '000319' },
    { fecha: '2026-07-16', monto: 35476.00, ref: '320', lote: '000320' },
    { fecha: '2026-07-16', monto: 18143.75, ref: '321', lote: '000321' },
    { fecha: '2026-07-17', monto: 8729.40, ref: '322', lote: '000322' },
    { fecha: '2026-07-18', monto: 64761.27, ref: '323', lote: '000323' },
    { fecha: '2026-07-19', monto: 178413.85, ref: '324', lote: '000324' },
    { fecha: '2026-07-21', monto: 20634.04, ref: '325', lote: '000325' },
    { fecha: '2026-07-22', monto: 13933.64, ref: '326', lote: '000326' },
    { fecha: '2026-07-22', monto: 29489.20, ref: '326', lote: '000326' },
    { fecha: '2026-07-23', monto: 75639.79, ref: '327', lote: '000327' },
    { fecha: '2026-07-24', monto: 145362.36, ref: '328', lote: '000328' },
    { fecha: '2026-07-26', monto: 7422.30, ref: '329', lote: '000329' },
    { fecha: '2026-07-28', monto: 20782.44, ref: '330', lote: '000330' },
    { fecha: '2026-07-29', monto: 19313.06, ref: '331', lote: '000331' },
    { fecha: '2026-07-30', monto: 21731.51, ref: '332', lote: '000332' },
    { fecha: '2026-07-31', monto: 52895.35, ref: '333', lote: '000333' },
    // Agosto
    { fecha: '2026-08-02', monto: 18665.75, ref: '334', lote: '000334' },
    { fecha: '2026-08-02', monto: 48671.35, ref: '335', lote: '000335' },
    { fecha: '2026-08-04', monto: 182854.51, ref: '336', lote: '000336' },
    { fecha: '2026-08-05', monto: 87994.53, ref: '337', lote: '000337' },
    { fecha: '2026-08-06', monto: 180105.66, ref: '338', lote: '000338' },
    { fecha: '2026-08-07', monto: 105070.10, ref: '339', lote: '000339' },
    { fecha: '2026-08-08', monto: 38138.18, ref: '340', lote: '000340' },
    { fecha: '2026-08-08', monto: 37835.50, ref: '340', lote: '000340' },
    { fecha: '2026-08-12', monto: 82059.51, ref: '341', lote: '000341' },
    { fecha: '2026-08-13', monto: 67262.80, ref: '342', lote: '000342' },
    { fecha: '2026-08-14', monto: 108127.26, ref: '343', lote: '000343' },
    { fecha: '2026-08-15', monto: 91576.64, ref: '344', lote: '000344' },
    { fecha: '2026-08-16', monto: 15450.80, ref: '345', lote: '000345' },
    { fecha: '2026-08-16', monto: 62575.74, ref: '345', lote: '000345' },
    { fecha: '2026-08-18', monto: 139057.20, ref: '346', lote: '000346' },
    { fecha: '2026-08-19', monto: 82632.27, ref: '347', lote: '000347' },
    { fecha: '2026-08-20', monto: 82961.38, ref: '348', lote: '000348' },
    { fecha: '2026-08-21', monto: 18658.08, ref: '349', lote: '000349' },
    { fecha: '2026-08-21', monto: 9329.04, ref: '349', lote: '000349' },
    { fecha: '2026-08-22', monto: 96245.83, ref: '350', lote: '000350' },
    { fecha: '2026-08-23', monto: 35937.43, ref: '351', lote: '000351' },
    { fecha: '2026-08-25', monto: 34525.04, ref: '352', lote: '000352' },
    { fecha: '2026-08-26', monto: 10598.44, ref: '353', lote: '000353' },
    { fecha: '2026-08-27', monto: 101590.08, ref: '354', lote: '000354' },
    { fecha: '2026-08-28', monto: 179154.84, ref: '355', lote: '000355' },
    { fecha: '2026-08-29', monto: 3958.35, ref: '356', lote: '000356' },
    { fecha: '2026-08-29', monto: 135478.48, ref: '356', lote: '000356' },
    { fecha: '2026-08-30', monto: 9540.00, ref: '357', lote: '000357' },
  ];

  posLotes.forEach((pos, idx) => {
    transacciones.push({
      id: `demo-pos-${idx}`,
      fecha: pos.fecha,
      descripcion: `POS: 860968009 CHINOKOREA MOTORS C A FECHA:${pos.fecha} HORA:03:33:00 LOTE:${pos.lote} TERM:10190615 TIPO:TRJ. DEBITO`,
      referencia: pos.ref,
      monto: pos.monto,
      saldo: null,
      tipo: 'I',
      categoria: 'Ventas por punto de venta (POS)',
      grupo: 'VENTAS_OPERATIVAS',
      soporteRequerido: 'Cierre de lote del POS, facturas de venta y Libro de Ventas',
      soporteEstado: 'ubicado',
      soporteDoc: `LOTE-${pos.lote}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'BNC (Banco Nacional de Crédito)',
      archivoOrigen: 'EDO_CUENTA_BNC_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Ventas por Punto de Venta (POS / Lotes / Débito)',
    });
  });

  // --- 3. COBROS CASHEA (CUOTAS BNC CASHEA) ---
  const casheaList = [
    { fecha: '2026-07-01', monto: 8867.10, ref: '888927932', tel: '584128014700', banco: '0102' },
    { fecha: '2026-07-01', monto: 31668.22, ref: '61825699389', tel: '584127030917', banco: '0134' },
    { fecha: '2026-07-01', monto: 4433.55, ref: '889094191', tel: '584145637738', banco: '0102' },
    { fecha: '2026-07-02', monto: 14073.46, ref: '892066829', tel: '584166806310', banco: '0102' },
    { fecha: '2026-07-02', monto: 15352.87, ref: '892498754', tel: '584162910072', banco: '0102' },
    { fecha: '2026-07-04', monto: 16943.07, ref: '897635081', tel: '584124663619', banco: '0102' },
    { fecha: '2026-07-05', monto: 24414.03, ref: '899903454', tel: '584120195658', banco: '0102' },
    { fecha: '2026-07-06', monto: 23346.75, ref: '61873582147', tel: '584248028351', banco: '0134' },
    { fecha: '2026-07-07', monto: 100591.64, ref: '7072604', tel: '000000000000', banco: '0191' },
    { fecha: '2026-07-14', monto: 29919.67, ref: '905775694', tel: '584248577123', banco: '0102' },
    { fecha: '2026-07-21', monto: 28014.82, ref: '937711910', tel: '584144257186', banco: '0102' },
    { fecha: '2026-07-23', monto: 45748.66, ref: '942505678', tel: '584124229072', banco: '0102' },
    { fecha: '2026-07-24', monto: 29095.38, ref: '420555317511', tel: '584148083741', banco: '0105' },
    { fecha: '2026-07-28', monto: 76897.00, ref: '1023452736', tel: '584248177819', banco: '0102' },
    { fecha: '2026-07-29', monto: 37211.32, ref: '62105109163', tel: '584269834741', banco: '0134' },
    // Agosto
    { fecha: '2026-08-04', monto: 28579.58, ref: '973309988', tel: '584144257186', banco: '0102' },
    { fecha: '2026-08-05', monto: 48329.93, ref: '976237201', tel: '584120611173', banco: '0102' },
    { fecha: '2026-08-06', monto: 354660.77, ref: '6082606', tel: '000000000000', banco: '0191' },
    { fecha: '2026-08-10', monto: 29695.59, ref: '422251969275', tel: '584148083741', banco: '0105' },
    { fecha: '2026-08-12', monto: 30573.94, ref: '991153669', tel: '584126891710', banco: '0102' },
    { fecha: '2026-08-13', monto: 75152.31, ref: '6992061244', tel: '584248177819', banco: '0102' },
    { fecha: '2026-08-16', monto: 25493.96, ref: '1001597581', tel: '584143957213', banco: '0102' },
    { fecha: '2026-08-17', monto: 38627.20, ref: '1004490516', tel: '584248307001', banco: '0102' },
    { fecha: '2026-08-18', monto: 42996.18, ref: '62304860701', tel: '584120994013', banco: '0134' },
    { fecha: '2026-08-20', monto: 19590.89, ref: '21374575034794', tel: '000000000000', banco: '0134' },
    { fecha: '2026-08-24', monto: 37663.84, ref: '1165081165', tel: '584248416472', banco: '0007' },
    { fecha: '2026-08-28', monto: 17100.00, ref: '62407992518', tel: '584248002419', banco: '0134' },
    { fecha: '2026-08-29', monto: 39749.59, ref: '1035741657', tel: '584248597185', banco: '0102' },
    { fecha: '2026-08-31', monto: 30611.82, ref: '960431539', tel: '584263981871', banco: '0102' },
  ];

  casheaList.forEach((c, idx) => {
    transacciones.push({
      id: `demo-cashea-${idx}`,
      fecha: c.fecha,
      descripcion: `TELF.:${c.tel} BANCO:${c.banco} CED.:V${Math.floor(10000000 + Math.random() * 15000000)} PMPC pago cuota Cashea China Korea`,
      referencia: c.ref,
      monto: c.monto,
      saldo: 60230.23,
      tipo: 'I',
      categoria: 'Cobros Cashea (financiamiento en cuotas)',
      grupo: 'VENTAS_OPERATIVAS',
      soporteRequerido: 'Facturas de venta, reporte de liquidación de Cashea y notas de débito por diferencial cambiario',
      soporteEstado: 'ubicado',
      soporteDoc: `CASHEA-${c.ref}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'BNC Cashea',
      archivoOrigen: 'EDO_CUENTA_CASHEA_JULIO_Y_AGOSTO.xls',
      reglaAplicada: 'Cobros Cashea (Financiamiento en cuotas)',
    });
  });

  // --- 4. TRANSFERENCIAS RECIBIDAS DE CLIENTES ---
  const clientes = [
    { fecha: '2026-07-06', monto: 194364.57, ref: '23892502', cliente: 'LLN LIDERES EN LO J505620517' },
    { fecha: '2026-07-08', monto: 52269.63, ref: '24192175', cliente: 'LLN LIDERES EN LO J505620517' },
    { fecha: '2026-07-10', monto: 227200.00, ref: '10056723', cliente: 'Alejandro Ernesto V019458154' },
    { fecha: '2026-07-13', monto: 35569.80, ref: '61944469987', cliente: 'RENDON HERNANDEZ V024225533' },
    { fecha: '2026-07-15', monto: 98121.40, ref: '412633', cliente: 'ZERPA HERNANDEZ V V017537514' },
    { fecha: '2026-07-20', monto: 7928.39, ref: '62018321327', cliente: 'RENDON HERNANDEZ V024225533' },
    { fecha: '2026-07-29', monto: 239640.92, ref: '72718050', cliente: 'LA EXPORT COMPANY J409447286' },
    { fecha: '2026-08-26', monto: 25620.00, ref: '62380911622', cliente: 'TORRES JIMENEZ MA V031277825' },
    { fecha: '2026-08-28', monto: 752083.37, ref: '62407164351', cliente: 'INVERPREGO CA J406917206' },
    { fecha: '2026-08-28', monto: 41503.62, ref: '3619413560', cliente: 'INSTRUMENTACION D J095164233' },
  ];

  clientes.forEach((cli, idx) => {
    transacciones.push({
      id: `demo-cli-${idx}`,
      fecha: cli.fecha,
      descripcion: `TRF CR INM ${cli.cliente} abono factura repuestos`,
      referencia: cli.ref,
      monto: cli.monto,
      saldo: null,
      tipo: 'I',
      categoria: 'Transferencias recibidas de clientes',
      grupo: 'VENTAS_OPERATIVAS',
      soporteRequerido: 'Facturas de venta, nota de entrega y Libro de Ventas',
      soporteEstado: 'ubicado',
      soporteDoc: `FACT-${1000 + idx}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'Banesco',
      archivoOrigen: 'EDO_CUENTA_BANESCO_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Transferencias recibidas de clientes',
    });
  });

  // --- 5. COBROS POR PAGO MÓVIL (VENTAS) ---
  const cobrosPm = [
    { fecha: '2026-07-01', monto: 11147.13, ref: '889357694' },
    { fecha: '2026-07-01', monto: 19760.83, ref: '890042279' },
    { fecha: '2026-07-01', monto: 21787.58, ref: '890080878' },
    { fecha: '2026-07-01', monto: 44335.00, ref: '61826569044' },
    { fecha: '2026-07-06', monto: 47419.32, ref: '18557730821' },
    { fecha: '2026-08-18', monto: 73464.45, ref: '61208001439' },
    { fecha: '2026-08-19', monto: 27136.90, ref: '862349349' },
    { fecha: '2026-08-20', monto: 198242.10, ref: '863421699' },
  ];

  cobrosPm.forEach((pm, idx) => {
    transacciones.push({
      id: `demo-pm-in-${idx}`,
      fecha: pm.fecha,
      descripcion: `Banesco Pago Movil cobro cliente venta mostrador`,
      referencia: pm.ref,
      monto: pm.monto,
      saldo: null,
      tipo: 'I',
      categoria: 'Cobros por Pago Móvil',
      grupo: 'VENTAS_OPERATIVAS',
      soporteRequerido: 'Facturas de venta / Libro de Ventas y control de cobros',
      soporteEstado: 'ubicado',
      soporteDoc: `PM-REC-${pm.ref.slice(-5)}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'Banesco',
      archivoOrigen: 'EDO_CUENTA_BANESCO_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Cobros por Pago Móvil (Clientes)',
    });
  });

  // --- 6. IMPUESTOS Y TRIBUTOS (SENIAT + ALCALDÍA + RETENCIONES) ---
  const tributos = [
    { fecha: '2026-07-08', monto: -75440.75, ref: '2601803556', desc: 'RIF PAGADOR:J-299979066 RIF CONTRIBUYENTE:J-299979066 FORMA:99035 PLANILLA:2601803556 AUTORIZA:023714 Retencion ISLR Sueldos' },
    { fecha: '2026-07-08', monto: -15979.42, ref: '2602332325', desc: 'RIF PAGADOR:J-299979066 RIF CONTRIBUYENTE:J-299979066 FORMA:99074 PLANILLA:2602332325 AUTORIZA:266844 Retencion IVA Proveedores' },
    { fecha: '2026-07-08', monto: -112102.05, ref: '2603725570', desc: 'RIF PAGADOR:J-299979066 RIF CONTRIBUYENTE:J-299979066 FORMA:99030 PLANILLA:2603725570 AUTORIZA:453176 Declaracion IVA Junio' },
    { fecha: '2026-07-08', monto: -15177.87, ref: '2601153079', desc: 'RIF PAGADOR:J-299979066 RIF CONTRIBUYENTE:J-299979066 FORMA:99044 PLANILLA:2601153079 AUTORIZA:202609 Anticipo ISLR' },
    { fecha: '2026-07-13', monto: -68137.03, ref: '321137', desc: 'TELF.:000000000000 CED.:G200000210 CTA.:01340245102451073291 actividad economica junio Alcaldia' },
    { fecha: '2026-07-16', monto: -53829.10, ref: '2691670658', desc: 'INCLUSION DE PLANILLA SENIAT CCTA declaracion complementaria' },
    { fecha: '2026-08-04', monto: -158072.18, ref: '2604179114', desc: 'RIF PAGADOR:J-299979066 RIF CONTRIBUYENTE:J-299979066 FORMA:99030 PLANILLA:2604179114 AUTORIZA:753869 Declaracion IVA Julio' },
    { fecha: '2026-08-04', monto: -86437.43, ref: '2602006847', desc: 'RIF PAGADOR:J-299979066 RIF CONTRIBUYENTE:J-299979066 FORMA:99035 PLANILLA:2602006847 AUTORIZA:768956 Retencion ISLR Sueldos Julio' },
    { fecha: '2026-08-10', monto: -80451.15, ref: '3616404395', desc: 'TRFMB 0134 G200000210 ALCALDIA DEL MUNI 0369 Patente Actividad Economica' },
    { fecha: '2026-08-25', monto: -294019.19, ref: '2602223929', desc: 'RIF PAGADOR:J-299979066 RIF CONTRIBUYENTE:J-299979066 FORMA:99035 PLANILLA:2602223929 AUTORIZA:307660 Retenciones' },
  ];

  tributos.forEach((trib, idx) => {
    transacciones.push({
      id: `demo-trib-${idx}`,
      fecha: trib.fecha,
      descripcion: trib.desc,
      referencia: trib.ref,
      monto: trib.monto,
      saldo: null,
      tipo: 'E',
      categoria: 'Impuestos y tributos (SENIAT)',
      grupo: 'IMPUESTOS_TRIBUTOS',
      soporteRequerido: 'Planillas de pago, declaraciones y comprobantes de retención',
      soporteEstado: 'ubicado',
      soporteDoc: `PLANILLA-${trib.ref}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'BNC (Banco Nacional de Crédito)',
      archivoOrigen: 'EDO_CUENTA_BNC_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Planillas SENIAT (Formas 99030, 99035, 99074, 99044)',
    });
  });

  // --- 7. NÓMINA, SUELDOS Y CESTATICKET / ALIMENTACIÓN ---
  const nomina = [
    { fecha: '2026-07-01', monto: -25334.40, desc: 'TRANSFERENCIA A FAVOR DE: RODRIGUEZ OJEDA ROBIMAR RUDY pao bono alimentacion' },
    { fecha: '2026-07-01', monto: -25334.40, desc: 'TRANSFERENCIA A FAVOR DE: GONZALEZ RODRIGUEZ SILVANNA ANTONE pago bono alimentacion' },
    { fecha: '2026-07-01', monto: -25334.40, desc: 'TRANSFERENCIA A FAVOR DE: BERICOTTE PEREZ NOLVYS DEL CARMEN pago bono alimentacion' },
    { fecha: '2026-07-01', monto: -25334.40, desc: 'TRANSFERENCIA A FAVOR DE: CACHUTT CORDOVA MANUEL ALBERTO pago bono alimentacion' },
    { fecha: '2026-07-03', monto: -19589.10, desc: 'TRANSFERENCIA A FAVOR DE: RODRIGUEZ OJEDA ROBIMAR RUDY pago semana' },
    { fecha: '2026-07-03', monto: -19589.10, desc: 'TRANSFERENCIA A FAVOR DE: GONZALEZ RODRIGUEZ SILVANNA ANTONE pago semana' },
    { fecha: '2026-07-03', monto: -19589.10, desc: 'TRANSFERENCIA A FAVOR DE: BERICOTTE PEREZ NOLVYS DEL CARMEN pago semana' },
    { fecha: '2026-07-03', monto: -19589.10, desc: 'TRANSFERENCIA A FAVOR DE: CACHUTT CORDOVA MANUEL ALBERTO pago semana' },
    { fecha: '2026-07-17', monto: -21974.40, desc: 'TRANSFERENCIA A FAVOR DE: RODRIGUEZ OJEDA ROBIMAR RUDY pago semana' },
    { fecha: '2026-07-17', monto: -21974.40, desc: 'TRANSFERENCIA A FAVOR DE: GONZALEZ RODRIGUEZ SILVANNA ANTONE pago semana' },
    { fecha: '2026-07-17', monto: -21974.40, desc: 'TRANSFERENCIA A FAVOR DE: BERICOTTE PEREZ NOLVYS DEL CARMEN semana nolvys' },
    { fecha: '2026-07-17', monto: -21974.40, desc: 'TRANSFERENCIA A FAVOR DE: CACHUTT CORDOVA MANUEL ALBERTO pago semana' },
    { fecha: '2026-07-24', monto: -22266.90, desc: 'TRANSFERENCIA A FAVOR DE: RODRIGUEZ OJEDA ROBIMAR RUDY pago semana' },
    { fecha: '2026-07-24', monto: -22266.90, desc: 'semana manuel V014189700 CTA:01050110541110300786' },
    { fecha: '2026-07-24', monto: -22266.90, desc: 'semana silvana V031295772 CTA:01720702427025611000' },
    { fecha: '2026-07-24', monto: -22266.90, desc: 'semana nolvys V014632198 CTA:01340946340001418685' },
    { fecha: '2026-08-07', monto: -22701.30, desc: 'TRANSFERENCIA A FAVOR DE: RODRIGUEZ OJEDA ROBIMAR RUDY Semana' },
    { fecha: '2026-08-07', monto: -22701.30, desc: 'TRANSFERENCIA A FAVOR DE: GONZALEZ RODRIGUEZ SILVANNA ANTONE Semana' },
    { fecha: '2026-08-07', monto: -22701.30, desc: 'TRANSFERENCIA A FAVOR DE: BERICOTTE PEREZ NOLVYS DEL CARMEN Semana' },
    { fecha: '2026-08-07', monto: -22701.30, desc: 'TRANSFERENCIA A FAVOR DE: CACHUTT CORDOVA MANUEL ALBERTO Semana' },
    { fecha: '2026-08-14', monto: -23132.10, desc: 'TRANSFERENCIA A FAVOR DE: RODRIGUEZ OJEDA ROBIMAR RUDY pago semana' },
    { fecha: '2026-08-14', monto: -23132.10, desc: 'TRANSFERENCIA A FAVOR DE: GONZALEZ RODRIGUEZ SILVANNA ANTONE pago semana' },
    { fecha: '2026-08-14', monto: -23132.10, desc: 'TRANSFERENCIA A FAVOR DE: BERICOTTE PEREZ NOLVYS DEL CARMEN pago semana' },
    { fecha: '2026-08-14', monto: -23132.10, desc: 'TRANSFERENCIA A FAVOR DE: CACHUTT CORDOVA MANUEL ALBERTO pago semana' },
    { fecha: '2026-08-28', monto: -23750.10, desc: 'TRANSFERENCIA A FAVOR DE: RODRIGUEZ OJEDA ROBIMAR RUDY semana' },
    { fecha: '2026-08-28', monto: -23750.10, desc: 'TRANSFERENCIA A FAVOR DE: GONZALEZ RODRIGUEZ SILVANNA ANTONE pago semana' },
    { fecha: '2026-08-28', monto: -23750.10, desc: 'TRANSFERENCIA A FAVOR DE: BERICOTTE PEREZ NOLVYS DEL CARMEN pago semana' },
    { fecha: '2026-08-28', monto: -23750.10, desc: 'TRANSFERENCIA A FAVOR DE: CACHUTT CORDOVA MANUEL ALBERTO pago semana' },
    { fecha: '2026-08-29', monto: -31799.60, desc: 'TRANSFERENCIA A FAVOR DE: RODRIGUEZ OJEDA ROBIMAR RUDY pago bono alimentacion' },
    { fecha: '2026-08-29', monto: -31799.60, desc: 'TRANSFERENCIA A FAVOR DE: GONZALEZ RODRIGUEZ SILVANNA ANTONE bono alimentacion' },
    { fecha: '2026-08-29', monto: -31799.60, desc: 'TRANSFERENCIA A FAVOR DE: BERICOTTE PEREZ NOLVYS DEL CARMEN bono alimentacion' },
    { fecha: '2026-08-29', monto: -31799.60, desc: 'TRANSFERENCIA A FAVOR DE: CACHUTT CORDOVA MANUEL ALBERTO bono alimentacion' },
  ];

  nomina.forEach((nom, idx) => {
    transacciones.push({
      id: `demo-nom-${idx}`,
      fecha: nom.fecha,
      descripcion: nom.desc,
      referencia: `16283${idx}`,
      monto: nom.monto,
      saldo: null,
      tipo: 'E',
      categoria: 'Pago de sueldos y nómina',
      grupo: 'NOMINA_PERSONAL',
      soporteRequerido: 'Nómina firmada, recibos de pago y comprobantes de transferencia',
      soporteEstado: 'ubicado',
      soporteDoc: `NOM-${nom.fecha.slice(0, 7)}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'BNC (Banco Nacional de Crédito)',
      archivoOrigen: 'EDO_CUENTA_BNC_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Nómina, Sueldos y Cestaticket / Alimentación',
    });
  });

  // --- 8. SERVICIOS PÚBLICOS (CORPOELEC, MOVISTAR, ETC.) ---
  const servicios = [
    { fecha: '2026-07-02', monto: -3351.53, desc: 'MOVISTAR CARGO CCTA 3170081347 factura mensual linea empresa' },
    { fecha: '2026-07-02', monto: -1437.24, desc: 'MOVISTAR CARGO CCTA 2446300598' },
    { fecha: '2026-07-03', monto: -181.46, desc: 'RECAUDACION MULTIPAGOS O000091452946' },
    { fecha: '2026-07-16', monto: -9432.31, desc: 'RECAUDACION MULTIPAGOS 0105951547534 agua hidrocapital' },
    { fecha: '2026-08-01', monto: -13644.07, desc: 'PAGO CORPOELEC 000001000055789090 consumo julio galpon' },
    { fecha: '2026-08-04', monto: -3705.84, desc: 'MOVISTAR CARGO CCTA 3170081347' },
    { fecha: '2026-08-05', monto: -1637.33, desc: 'MOVISTAR CARGO CCTA 2446300598' },
    { fecha: '2026-08-10', monto: -40273.54, desc: 'PAGO CORPOELEC 000001000055789090 electricidad comercial' },
    { fecha: '2026-08-29', monto: -61773.14, desc: 'PAGO CORPOELEC 000001000055789090 ajuste y consumo planta' },
  ];

  servicios.forEach((serv, idx) => {
    transacciones.push({
      id: `demo-serv-${idx}`,
      fecha: serv.fecha,
      descripcion: serv.desc,
      referencia: `SERV-${idx + 100}`,
      monto: serv.monto,
      saldo: null,
      tipo: 'E',
      categoria: 'Servicios públicos y telecomunicaciones',
      grupo: 'SERVICIOS_PUBLICOS',
      soporteRequerido: 'Facturas o recibos del servicio a nombre de la empresa',
      soporteEstado: 'ubicado',
      soporteDoc: `REC-${serv.fecha.slice(0, 7)}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'Banesco',
      archivoOrigen: 'EDO_CUENTA_BANESCO_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Servicios Públicos (Corpoelec, Agua, Telcom)',
    });
  });

  // --- 9. PROVEEDORES (REPUESTOS, SEGUROS, SISTEMAS) ---
  const proveedores = [
    { fecha: '2026-07-27', monto: -505035.56, desc: 'TRFMB 0134 J000075875 ESTAR SEGUROS S 0369 Poliza de flota vehiculos' },
    { fecha: '2026-07-31', monto: -29865.20, desc: 'TRANSCTAS A TERCEROS BANESCO pago suministros oficina' },
    { fecha: '2026-08-21', monto: -162440.19, desc: 'TRFOB 0168 J405736097 REPUESTOS ARTRICA 0369 compra lote amortiguadores' },
    { fecha: '2026-08-21', monto: -53921.85, desc: 'TRFMB 0134 J310495521 SISTEALARMAS CA 0369 monitoreo y seguridad' },
    { fecha: '2026-08-25', monto: -3219.54, desc: 'TRFOB 0102 J401346197 SUMINISTROS CHF C 0369 consumibles y papeleria' },
    { fecha: '2026-08-06', monto: -55114.99, desc: 'pago retencion fact 417 423 y 424 J298574054 CTA:01630226132263018710' },
    { fecha: '2026-08-10', monto: -454524.00, desc: 'pago proveedor J298574054 CTA:01630226132263018710 repuestos originales' },
  ];

  proveedores.forEach((prov, idx) => {
    transacciones.push({
      id: `demo-prov-${idx}`,
      fecha: prov.fecha,
      descripcion: prov.desc,
      referencia: `PROV-${idx + 400}`,
      monto: prov.monto,
      saldo: null,
      tipo: 'E',
      categoria: 'Pago a proveedores (transferencias)',
      grupo: 'PAGO_PROVEEDORES',
      soporteRequerido: 'Factura de compra, orden de pago y retenciones de IVA/ISLR',
      soporteEstado: 'ubicado',
      soporteDoc: `FACT-PROV-${idx + 10}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'Banesco',
      archivoOrigen: 'EDO_CUENTA_BANESCO_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Pago a proveedores y suministros (Transferencias)',
    });
  });

  // --- 10. SEGURIDAD SOCIAL Y PARAFISCALES ---
  const parafiscales = [
    { fecha: '2026-07-03', monto: -156.00, desc: 'BANAVIH REC EN LINEA J2999790660066086407 FAOV mensual' },
    { fecha: '2026-08-06', monto: -10281.12, desc: 'BANAVIH REC EN LINEA J2999790660066583915 FAOV consolidado' },
  ];

  parafiscales.forEach((par, idx) => {
    transacciones.push({
      id: `demo-paraf-${idx}`,
      fecha: par.fecha,
      descripcion: par.desc,
      referencia: `PAR-${idx + 800}`,
      monto: par.monto,
      saldo: null,
      tipo: 'E',
      categoria: 'Seguridad social y parafiscales',
      grupo: 'PARAFISCALES_SEG_SOCIAL',
      soporteRequerido: 'Planillas de pago y relación de nómina del período',
      soporteEstado: 'ubicado',
      soporteDoc: `PLANILLA-FAOV-${par.fecha.slice(0, 7)}`,
      empresa: EMPRESA_DEMO.nombre,
      banco: 'BNC (Banco Nacional de Crédito)',
      archivoOrigen: 'EDO_CUENTA_BNC_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Seguridad Social (BANAVIH, FAOV, IVSS, INCES)',
    });
  });

  // --- 11. COMISIONES BANCARIAS Y COSTO DE POS ---
  const comisiones = [
    { fecha: '2026-07-02', monto: -1646.74, desc: 'COMISION BANCO POS: 860968009 CHINOKOREA MOTORS C A LOTE NRO.: 000312 DEPOSITO: 0.00' },
    { fecha: '2026-07-02', monto: -3521.60, desc: 'SERVICIO USO PUNTO DE VENTA MES: Junio /2026 SEGUN GACETA OFICIAL NRO.:43,231' },
    { fecha: '2026-07-02', monto: -8.00, desc: 'Comision Servicio SMS 30062026' },
    { fecha: '2026-07-03', monto: -895.58, desc: 'COMISION BANCO POS: 860968009 CHINOKOREA MOTORS C A LOTE NRO.: 000313' },
    { fecha: '2026-07-07', monto: -1947.56, desc: 'COMISION BANCO POS: 860968009 CHINOKOREA MOTORS C A LOTE NRO.: 000315' },
    { fecha: '2026-07-07', monto: -203.00, desc: 'COMIS EMIS EDO DE CUENTAS ME 26070733553' },
    { fecha: '2026-07-16', monto: -3521.60, desc: 'Mant y Serv Aplic 887782150726 mantenimiento mensual' },
    { fecha: '2026-07-31', monto: -1057.91, desc: 'COMISION BANCO POS: 860968009 CHINOKOREA MOTORS C A LOTE NRO.: 000333' },
    { fecha: '2026-07-31', monto: -8.00, desc: 'COMSERVMTTO CTA 0' },
    { fecha: '2026-08-02', monto: -3521.60, desc: 'SERVICIO USO PUNTO DE VENTA MES: Julio /2026 SEGUN GACETA OFICIAL NRO.:43,231' },
    { fecha: '2026-08-04', monto: -3657.09, desc: 'COMISION BANCO POS: 860968009 CHINOKOREA MOTORS C A LOTE NRO.: 000336' },
    { fecha: '2026-08-06', monto: -3602.11, desc: 'COMISION BANCO POS: 860968009 CHINOKOREA MOTORS C A LOTE NRO.: 000338' },
    { fecha: '2026-08-28', monto: -23771.00, desc: 'Mant y Serv Aplic 887782150826 debito especial mantenimiento' },
    { fecha: '2026-08-31', monto: -54.00, desc: 'Comisión Mantenimiento Cuenta Mes: Agosto - 2026' },
    { fecha: '2026-08-31', monto: -54.00, desc: 'Comision Servicio SMS 27082026' },
    { fecha: '2026-08-31', monto: -54.00, desc: 'COMSERVMTTO CTA 0' },
    { fecha: '2026-08-31', monto: -54.00, desc: 'EMISION DE ESTADO DE CUENTA 0' },
  ];

  comisiones.forEach((com, idx) => {
    transacciones.push({
      id: `demo-com-${idx}`,
      fecha: com.fecha,
      descripcion: com.desc,
      referencia: `COM-${idx + 10}`,
      monto: com.monto,
      saldo: null,
      tipo: 'E',
      categoria: 'Comisiones bancarias y de puntos de venta',
      grupo: 'COMISIONES_BANCARIAS',
      soporteRequerido: 'Estado de cuenta / notas de débito del banco',
      soporteEstado: 'ubicado',
      soporteDoc: 'EDO-CTA',
      empresa: EMPRESA_DEMO.nombre,
      banco: 'BNC (Banco Nacional de Crédito)',
      archivoOrigen: 'EDO_CUENTA_BNC_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Comisiones bancarias y mantenimiento',
    });
  });

  // --- 12. OPERACIONES CAMBIARIAS (DIVISAS / BCV) ---
  const cambiarias = [
    { fecha: '2026-07-09', monto: -140044.98, desc: 'Operación en USD Efectiv. 826/17 Divisa USD: 200,00 Tasa: 700,224900' },
    { fecha: '2026-07-09', monto: -700.22, desc: 'Comisión del 0,50% Operación en USD Efectiv. Divisa USD: 200,00 Tasa: 700,224900' },
    { fecha: '2026-08-05', monto: -1205.23, desc: 'GASTOS OPERACIONES DIVISAS Comision Divisa: 1.60 Tasa: 753.2673 Comision %: 0.80' },
    { fecha: '2026-08-05', monto: -4519.60, desc: 'Nro. Cuenta Divisa 0191/0233/52/2300018066 Operacion Divisa: 200.00 Tasa: 753.2673 IGTF % 3.00' },
  ];

  cambiarias.forEach((cam, idx) => {
    transacciones.push({
      id: `demo-camb-${idx}`,
      fecha: cam.fecha,
      descripcion: cam.desc,
      referencia: `CAMB-${idx + 10}`,
      monto: cam.monto,
      saldo: null,
      tipo: 'E',
      categoria: 'Operaciones cambiarias (divisas / mesa de cambio)',
      grupo: 'INGRESOS_NO_VENTAS',
      soporteRequerido: 'Comprobante de la operación cambiaria y tipo de cambio aplicado',
      soporteEstado: 'ubicado',
      soporteDoc: 'COMP-BCV',
      empresa: EMPRESA_DEMO.nombre,
      banco: 'BNC (Banco Nacional de Crédito)',
      archivoOrigen: 'EDO_CUENTA_BNC_JULIO_Y_AGOSTO.xlsx',
      reglaAplicada: 'Operaciones cambiarias / Compra y venta de divisas',
    });
  });

  // --- 13. REVERSOS Y DEVOLUCIONES ---
  transacciones.push({
    id: `demo-rev-1`,
    fecha: '2026-07-17',
    descripcion: 'DEVOLUCION RECIBIDA DE :BANCO DE VENEZUELA Tiempo Espera d Rspta. Agotado reverso transferencia',
    referencia: '404047',
    monto: 48000.00,
    saldo: null,
    tipo: 'I',
    categoria: 'Reversos y devoluciones bancarias',
    grupo: 'INGRESOS_NO_VENTAS',
    soporteRequerido: 'Operación original reversada y nota de crédito',
    soporteEstado: 'ubicado',
    soporteDoc: 'REV-404047',
    empresa: EMPRESA_DEMO.nombre,
    banco: 'BNC (Banco Nacional de Crédito)',
    archivoOrigen: 'EDO_CUENTA_BNC_JULIO_Y_AGOSTO.xlsx',
    reglaAplicada: 'Reversos bancarios y devoluciones',
  });

  // Ordenar por fecha cronológicamente
  return transacciones.sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
}
