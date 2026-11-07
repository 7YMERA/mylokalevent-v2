// One CSV cell. Quotes anything containing a comma, quote or line break, and
// defuses spreadsheet formulas: a cell that starts with = + - @ (or a tab or
// carriage return) gets a leading apostrophe so Excel shows it as text.
export function csvCell(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
