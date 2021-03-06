import {CsvFilter} from '../src/csvFilter';

const emptyField = '';
const headerLine = 'Num_factura, Fecha, Bruto, Neto, IVA, IGIC, Concepto, CIF_cliente, NIF_cliente';
const emptyDataFile = [headerLine];
const fileWithOneInvoiceLineHaving = (
  args: {
    invoiceId: string,
    invoiceDate:string,
    grossAmount: string,
    netAmount: string,
    ivaTax: string,
    igicTax: string,
    concept: string,
    cif: string,
    nif: string})
    : string[] => {
  const formattedLine = [
    args.invoiceId,
    args.invoiceDate,
    args.grossAmount,
    args.netAmount,
    args.ivaTax,
    args.igicTax,
    args.concept,
    args.cif,
    args.nif,
  ].join(',');
  return [headerLine, formattedLine];
};

const defaultParamsForOneLineFile = {
  invoiceId: '1',
  invoiceDate: '02/05/2019',
  grossAmount: '1000',
  netAmount: '810',
  ivaTax: '19',
  igicTax: emptyField,
  concept: 'irrelevant',
  cif: 'B76430134',
  nif: emptyField,
};

const defaultFileWithOneInvoiceLine = fileWithOneInvoiceLineHaving(defaultParamsForOneLineFile);


/**
 * Tras analizarlo con los especialistas en el negocio las reglas son:
 *   * No es válido para una lista sin cabecera
 *   * Es válido que algunos campos estén vacíos (apareciendo dos comas seguidas o una coma final)
 *   * Los impuestos IVA e IGIC son excluyentes, sólo puede aplicarse uno de los dos. Si alguna línea tiene contenido en ambos campos debe quedarse fuera.
 *   * Los campos CIF y NIF son excluyentes, sólo se puede usar uno de ellos.
 *   * El neto es el resultado de aplicar al bruto el correspondiente impuesto. Si algún neto no está bien calculado se queda fuera.
 *   * Un fichero con una sola factura donde todo es correcto, debería producir como salida la misma línea
 *   * Un fichero con una sola factura donde IVA e IGIC están rellenos, debería eliminar la línea
 *   * Un fichero con una sola factura donde el neto está mal calculado, debería ser eliminada
 *   * Un fichero con una sola factura donde CIF y NIF están rellenos, debería eliminar la línea
 *   * Un fichero de una sola línea es incorrecto porque no tiene cabecera
 *   * Si el número de factura se repite en varias líneas, se eliminan todas ellas (sin dejar ninguna).
 *   * Una lista vacía o nula producirá una lista vacía de salida
 */
describe('Csv Filter should', () => {
  let filter:CsvFilter;

  beforeEach(() => {
    filter = new CsvFilter();
  });

  it('check if header is missing', () => {
    const lines = defaultFileWithOneInvoiceLine;
    lines.shift();
    const result = () => filter.apply(lines);

    expect(result).toThrow(/Invalid/);
  });

  it('check if list is empty', () => {
    const lines = [headerLine];
    const result = filter.apply(lines);

    expect(result).toEqual(emptyDataFile);
  });

  it('not filter correct lines', () => {
    const lines = fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile, concept: 'a correct line with irrelevant data'});
    const result = filter.apply(lines);

    expect(result).toEqual(lines);
  });

  it('make tax fields mutually exclusive', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving(
      {...defaultParamsForOneLineFile, ivaTax: '19', igicTax: '8'} ));

    expect(result).toEqual(emptyDataFile);
  });

  it('there must be at least one tax field for the invoice', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving(
      {...defaultParamsForOneLineFile,
        ivaTax: emptyField,
        igicTax: emptyField}));

    expect(result).toEqual(emptyDataFile);
  });

  it('not accept non decimal tax fields', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving(
      {...defaultParamsForOneLineFile,
        ivaTax: 'XYZ',
        igicTax: emptyField}));

    expect(result).toEqual(emptyDataFile);
  });

  it('not accept non decimal tax fields and they must be exclusive', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving({
      ...defaultParamsForOneLineFile,
      ivaTax: 'XYZ',
      igicTax: '12',
    }));

    expect(result).toEqual(emptyDataFile);
  });

  it('make cif and nif fields exclusive', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving({
      ...defaultParamsForOneLineFile,
      nif: '12A',
      cif: '12C'}));

    expect(result).toEqual(emptyDataFile);
  });

  it('there must be at least one id field for the invoice', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving(
      {
        ...defaultParamsForOneLineFile,
        cif: emptyField,
        nif: emptyField,
      }));

    expect(result).toEqual(emptyDataFile);
  });

  it('not accept not correct net amount', () => {
    const result = filter.apply(fileWithOneInvoiceLineHaving({
      ...defaultParamsForOneLineFile,
      netAmount: '9'}));
    expect(result).toEqual(emptyDataFile);
  });

  it('not accept same id for bills', () => {
    const lines = fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile});
    const linesToAdd = fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile});
    lines.push(linesToAdd[1]);

    const result = filter.apply(lines);

    expect(result).toEqual(emptyDataFile);
  });

  it('accept all of the previous restrictions together', () => {
    const expectedResult = [
      headerLine,
      fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile})[1],
      fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile, invoiceId: '4', grossAmount: '1000', ivaTax: '10', netAmount: '900'})[1],
    ];
    const lines = [
      headerLine,
      fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile})[1],
      fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile, invoiceId: '2', concept: 'a correct line with irrelevant data'})[1],
      fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile, invoiceId: '2', concept: 'should fail because of same id as previous line'})[1],
      fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile, invoiceId: '3', netAmount: '9', concept: 'should fail because of incorrect net amount'})[1],
      fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile, invoiceId: '4', grossAmount: '1000', ivaTax: '10', netAmount: '900'})[1],
      fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile, invoiceId: '5', nif: '123', concept: 'should fail  because of nif and cif together'})[1],
      fileWithOneInvoiceLineHaving({...defaultParamsForOneLineFile, invoiceId: '6', concept: 'should fail because of both tax fields filleds', igicTax: '5'})[1],
    ];

    const result = filter.apply(lines);

    expect(result).toEqual(expectedResult);
  });
});


