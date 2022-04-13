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
    // TODO: rename array
    const noConflictsArray: string[] = [];
    const usedIds = new Map<string, number[]>();
    for (let i = 1; i < lines.length; i++) {
      const invoice = lines[i];
      const fields = invoice.split(',');
      const id = fields[indexDictionary.invoiceId];

      if (this.checkTaxFields(fields) &&
        this.checkIdentificationFields(fields) &&
        this.checkNetAmount(fields)) {
        const existingEntry = usedIds.get(id);
        if (existingEntry) {
          existingEntry.push(i);
        } else {
          usedIds.set(id, [i]);
        }
        noConflictsArray.push(lines[i]);
      }
    }

    let result: string[] = [];
    result = noConflictsArray.filter((noConflictedLine) => {
      const fields = noConflictedLine.split(',');
      const id = fields[indexDictionary.invoiceId];
      const existingEntryInMap = usedIds.get(id) ?? [];
      if (existingEntryInMap.length === 1) {
        return noConflictedLine;
      }
    });
    result.unshift(lines[0]);
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

    return (identificationFieldsAreMutuallyExclusive);
  }

  private checkNetAmount(fields:string[]): boolean {
    const taxField = Number.parseInt(fields[indexDictionary.ivaFieldIndex]);
    const grossAmountField = Number.parseInt(fields[indexDictionary.grossAmount]);
    const netAmountField = Number.parseInt(fields[indexDictionary.netAmount]);
    return (netAmountField === (grossAmountField - (grossAmountField * (taxField / 100))));
  }

  private isNullOrEmpty(valueToCheck: string): boolean {
    return (valueToCheck === null || valueToCheck.length === 0);
  }
}
