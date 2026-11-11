import { describe, expect, it } from "vitest";

import { csvCell, toCsv } from "./csv";

describe("csvCell", () => {
  it("leaves plain text alone", () => {
    expect(csvCell("approved")).toBe("approved");
    expect(csvCell(42)).toBe("42");
    expect(csvCell(null)).toBe("");
  });

  it("quotes commas, quotes and line breaks", () => {
    expect(csvCell("a, b")).toBe('"a, b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("one\ntwo")).toBe('"one\ntwo"');
  });

  it("defuses spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+1")).toBe("'+1");
    expect(csvCell("-1")).toBe("'-1");
    expect(csvCell("@sum")).toBe("'@sum");
  });
});

describe("toCsv", () => {
  it("joins cells and rows with CRLF", () => {
    expect(
      toCsv([
        ["a", "b"],
        ["c", "d,e"],
      ]),
    ).toBe('a,b\r\nc,"d,e"\r\n');
  });
});
