import formatConsole from "./consoleFormatter";
import stripAnsi from "./stripAnsi";
import type { TableOptions } from "@mytypes/tableOptions";

const chars = ["┌", "─", "┐", "┘", "└", "│", "├", "┤", "┬", "┴", "┼"] as const;

function renderTable({
  color = "",
  title,
  headers,
  rows,
  comment = "",
}: TableOptions): void {
  const colWidths = headers.map((header, i) => {
    return Math.max(
      stripAnsi(header).length,
      ...rows.map((row) => (row[i] ? stripAnsi(row[i].toString()).length : 0))
    );
  });

  let fullWidth = colWidths.reduce((a, b) => a + b, 0) + headers.length * 3 + 1;

  if (comment) {
    const commentLength = stripAnsi(comment).length + 2;
    if (commentLength + 2 > fullWidth) {
      const extra = commentLength + 2 - fullWidth;
      colWidths[colWidths.length - 1] += extra;
      fullWidth = commentLength + 2;
    }
  }

  if (fullWidth < 60) {
    const extra = 60 - fullWidth;
    colWidths[colWidths.length - 1] += extra;
    fullWidth = 60;
  }

  // ---- Ligne titre ----
  const titleDisplay = ` ${title.toUpperCase()} `;
  const remaining = fullWidth - titleDisplay.length - 2;
  console.log(
    formatConsole(
      `${color}${chars[0]}${chars[1].repeat(2)}${titleDisplay}${chars[1].repeat(
        remaining
      )}${chars[2]}`
    )
  );

  // ---- Commentaire ----
  if (comment) {
    const paddedComment = ` ${comment}${" ".repeat(
      fullWidth - comment.length - 3
    )}`;
    console.log(
      formatConsole(`${color}${chars[5]}${paddedComment}${chars[5]}`)
    );
  }

  // ---- Ligne séparateur haut colonnes ----
  console.log(
    horizontalLine(colWidths, color, chars[6], chars[1], chars[8], chars[7])
  );

  // ---- Headers ----
  const headerLine =
    color +
    chars[5] +
    headers
      .map((h, i) => {
        const content = stripAnsi(h).padEnd(colWidths[i]);
        return ` ${content} `;
      })
      .join(chars[5]) +
    chars[5];
  console.log(formatConsole(headerLine));

  // ---- Ligne séparateur entête / données ----
  console.log(
    horizontalLine(colWidths, color, chars[6], chars[1], chars[10], chars[7])
  );

  // ---- Lignes de données ----
  rows.forEach((row) => {
    const rowLine =
      color +
      chars[5] +
      row
        .map((cell, i) => {
          const text = cell?.toString() ?? "";
          const clean = stripAnsi(text);
          return ` ${text}${" ".repeat(colWidths[i] - clean.length + 1)}`;
        })
        .join(chars[5]) +
      chars[5];
    console.log(formatConsole(rowLine));
  });

  // ---- Ligne de fin ----
  console.log(
    horizontalLine(colWidths, color, chars[4], chars[1], chars[9], chars[3])
  );
}

// Génère une ligne horizontale (haut, séparateur, bas)
function horizontalLine(
  colWidths: number[],
  color: string,
  left: string,
  fill: string,
  middle: string,
  right: string
): string {
  return formatConsole(
    color + left + colWidths.map((w) => fill.repeat(w + 2)).join(middle) + right
  );
}

export default renderTable;
