export interface TableOptions {
  color: string; // ex: ^g
  title: string;
  headers: string[];
  rows: (string | number)[][];
  comment?: string;
}
