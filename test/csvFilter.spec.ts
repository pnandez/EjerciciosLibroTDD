import {CsvFilter} from '../src/csvFilter';

const emptyField = '';
const headerLine = 'Num_factura, Fecha, Bruto, Neto, IVA, IGIC, Concepto, CIF_cliente, NIF_cliente';
const emptyDataFile = [headerLine];
const fileWithOneInvoiceLineHaving = (cif: string = 'B76430134', nif: string = emptyField, ivaTax: string = '19', igicTax: string = emptyField, concept: string = 'irrelevant'): string[] => {
  const invoiceId = '1';
  const invoiceDate = '02/05/2019';
  const grossAmount = '1000';
  const netAmount = '810';
  const formattedLine = [
    invoiceId,
    invoiceDate,
    grossAmount,
    netAmount,
    ivaTax,
    igicTax,
    concept,
    cif,
    nif,
  ].join(',');
  return [headerLine, formattedLine];
};

/**
 * Tras analizarlo con los especialistas en el negocio las reglas son:
 *   // Es válido que algunos campos estén vacíos (apareciendo dos comas seguidas o una coma final)
 *    El número de factura no puede estar repetido. Si lo estuviese eliminaríamos todas las líneas con repetición.
 *   // Los impuestos IVA e IGIC son excluyentes, sólo puede aplicarse uno de los dos. Si alguna línea tiene contenido en ambos campos debe quedarse fuera.
 *   // Los campos CIF y NIF son excluyentes, sólo se puede usar uno de ellos.
 *    El neto es el resultado de aplicar al bruto el correspondiente impuesto. Si algún neto no está bien calculado se queda fuera.
 *    Un fichero con una sola factura donde todo es correcto, debería producir como salida la misma línea
 *    Un fichero con una sola factura donde IVA e IGIC están rellenos, debería eliminar la línea
 *    Un fichero con una sola factura donde el neto está mal calculado, debería ser eliminada
 *    Un fichero con una sola factura donde CIF y NIF están rellenos, debería eliminar la línea
 *    Un fichero de una sola línea es incorrecto porque no tiene cabecera
 *    Si el número de factura se repite en varias líneas, se eliminan todas ellas (sin dejar ninguna).
 *    Una lista vacía o nula producirá una lista vacía de salida
 */
describe('Csv Filter should', () => {
  let filter:CsvFilter;

  beforeEach(() => {
    filter = new CsvFilter();
  });

  it('not filter correct lines', () => {
    const lines = fileWithOneInvoiceLineHaving(undefined, undefined, undefined, undefined, 'a correct line with irrelevant data');
    const result = filter.apply(lines);

    expect(result).toEqual(lines);
  });

  it('make tax fields mutually exclusive', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving(undefined, undefined, '19', '8', undefined));

    expect(result).toEqual(emptyDataFile);
  });

  it('there must be at least one tax field for the invoice', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving(
      undefined,
      undefined,
      emptyField,
      emptyField,
    ));

    expect(result).toEqual(emptyDataFile);
  });

  it('not accept non decimal tax fields', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving(undefined, undefined, 'XYZ', emptyField));

    expect(result).toEqual(emptyDataFile);
  });

  it('not accept non decimal tax fields and they must be exclusive', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving(undefined, undefined, 'XYZ', emptyField));

    expect(result).toEqual(emptyDataFile);
  });

  it('make cif and nif fields exclusive', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving('12A', '12C', undefined, undefined));

    expect(result).toEqual(emptyDataFile);
  });

  it('there must be at least one id field for the invoice', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving(
      emptyField,
      emptyField,
      undefined,
      undefined,
    ));

    expect(result).toEqual(emptyDataFile);
  });
});


