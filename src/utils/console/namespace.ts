import formatConsole from "./consoleFormatter";
import { renderLogBox } from "./renderLogBox";
import { LogBoxLine } from "@mytypes/logBoxLine";
import type { TableOptions } from "@mytypes/tableOptions";
import renderTable from "./renderTable";

export namespace Console {
  export function format(text: string): string {
    return formatConsole(text);
  }
  export function box(color: string, title: string, lines: LogBoxLine[]): void {
    renderLogBox(color, title, lines);
  }
  export function table({
    color,
    title,
    headers,
    rows,
    comment,
  }: TableOptions): void {
    renderTable({ color, title, headers, rows, comment });
  }
}
