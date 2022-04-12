const indexDictionary = {
  'invoiceId': 0,
  'invoiceDate': 1,
  'grossAmount': 2,
  'netAmount': 3,
  'ivaFieldIndex': 4,
  'igicFieldIndex': 5,
  'cifFieldIndex': 7,
  'nifFieldIndex': 8,
};

export class CsvFilter {
  public apply(lines: string[]): string[] {
    if (lines.length <= 1) {
      throw Error('Invalid file');
    }
    const result: string[] = [];
    result.push(lines[0]);
    const invoice = lines[1];
    const fields = invoice.split(',');

    if (this.checkTaxFields(fields) && this.checkIdentificationFields(fields)) {
      result.push(lines[1]);
    }
    return result;
  }

  private checkTaxFields(fields: string[]):boolean {
    const ivaField = fields[indexDictionary.ivaFieldIndex];
    const igicField = fields[indexDictionary.igicFieldIndex];
    const decimalRegex = new RegExp('\\d+(\\.\\d+)?');
    const taxFieldsAreMutuallyExclusive =
      (ivaField.match(decimalRegex) || igicField.match(decimalRegex)) &&
      (this.isNullOrEmpty(ivaField) || this.isNullOrEmpty(igicField));

    if (taxFieldsAreMutuallyExclusive) return true;
    return false;
  }

  private checkIdentificationFields(fields: string[]): boolean {
    const cifField = fields[indexDictionary.cifFieldIndex];
    const nifField = fields[indexDictionary.nifFieldIndex];
    const identificationFieldsAreMutuallyExclusive =
      (!this.isNullOrEmpty(cifField) && this.isNullOrEmpty(nifField) ||
        (this.isNullOrEmpty(cifField) && !this.isNullOrEmpty(nifField)));

    if (identificationFieldsAreMutuallyExclusive) return true;
    return false;
  }

  private isNullOrEmpty(valueToCheck:string): boolean {
    return (valueToCheck === null || valueToCheck.length === 0);
  }
}
