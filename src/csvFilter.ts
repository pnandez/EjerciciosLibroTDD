export class CsvFilter {
  public apply(lines: string[]): string[] {
    const result: string[] = [];
    result.push(lines[0]);
    const invoice = lines[1];
    const fields = invoice.split(',');
    const ivaFieldIndex = 4;
    const igicFieldIndex = 5;
    const ivaField = fields[ivaFieldIndex];
    const igicField = fields[igicFieldIndex];
    const decimalRegex = new RegExp('\\d+(\\.\\d+)?');
    const taxFieldsAreMutuallyExclusive =
      (ivaField.match(decimalRegex) || igicField.match(decimalRegex)) &&
      (ivaField === null || ivaField.length === 0 ||
      igicField === null || igicField.length === 0);
    if (taxFieldsAreMutuallyExclusive) {
      result.push(lines[1]);
    }
    return result;
  }
}
