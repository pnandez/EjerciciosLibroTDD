export class CsvFilter {
  public apply(lines: string[]): string[] {
    const result: string[] = [];
    result.push(lines[0]);
    const invoice = lines[1];
    const fields = invoice.split(',');
    const ivaFieldIndex = 4;
    const igicFieldIndex = 5;
    const cifFieldIndex = 7;
    const nifFieldIndex = 8;
    const ivaField = fields[ivaFieldIndex];
    const igicField = fields[igicFieldIndex];
    const cifField = fields[cifFieldIndex];
    const nifField = fields[nifFieldIndex];
    const decimalRegex = new RegExp('\\d+(\\.\\d+)?');
    const taxFieldsAreMutuallyExclusive =
      (ivaField.match(decimalRegex) || igicField.match(decimalRegex)) &&
      (this.isNullOrEmpty(ivaField) || this.isNullOrEmpty(igicField));
    const identificationFieldsAreMutuallyExclusive =
      (!this.isNullOrEmpty(cifField) && this.isNullOrEmpty(nifField) ||
        (this.isNullOrEmpty(cifField) && !this.isNullOrEmpty(nifField)));
    if (taxFieldsAreMutuallyExclusive && identificationFieldsAreMutuallyExclusive) {
      result.push(lines[1]);
    }
    return result;
  }

  private isNullOrEmpty(valueToCheck:string): boolean {
    return (valueToCheck === null || valueToCheck.length === 0);
  }
}
