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
  const targetWidth = 57;
  const numCols = headers.length;

  const availableWidth = targetWidth - (numCols + 1);
  const baseColWidth = Math.floor(availableWidth / numCols);
  const extraChars = availableWidth % numCols;

  const colWidths = headers.map(
    (_, i) => baseColWidth + (i < extraChars ? 1 : 0)
  );

  let fullWidth = colWidths.reduce((a, b) => a + b, 0) + headers.length + 1;

  const titleDisplay = ` ${title.toUpperCase()} `;
  const remaining = fullWidth - titleDisplay.length;
  console.log(
    formatConsole(
      color +
        chars[0] +
        chars[1].repeat(2) +
        titleDisplay +
        chars[1].repeat(remaining) +
        chars[2]
    )
  );
  if (comment) {
    const commentClean = stripAnsi(formatConsole(comment));
    const paddedComment = ` ${comment}^R${" ".repeat(
      fullWidth - commentClean.length + 1
    )}`;
    console.log(
      formatConsole(color + chars[5]) +
        formatConsole("^R" + paddedComment) +
        formatConsole(color + chars[5])
    );
  }

  console.log(
    formatConsole(
      color +
        chars[6] +
        colWidths.map((w) => chars[1].repeat(w + 2)).join(chars[8]) +
        chars[7]
    )
  );
  const centerText = (text: string, width: number): string => {
    const cleanText = stripAnsi(formatConsole(text));
    const padding = width - cleanText.length;
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return " ^R".repeat(leftPad) + text + "^R ".repeat(rightPad);
  };

  let headerContent = "";
  headers.forEach((h, i) => {
    const centeredHeader = centerText(h, colWidths[i]);
    headerContent += ` ${centeredHeader} `;
    if (i < headers.length - 1) {
      headerContent += formatConsole(color + chars[5]) + formatConsole("^R");
    }
  });
  console.log(
    formatConsole(color + chars[5]) +
      formatConsole("^R" + headerContent) +
      formatConsole(color + chars[5])
  );

  console.log(
    formatConsole(
      color +
        chars[6] +
        colWidths.map((w) => chars[1].repeat(w + 2)).join(chars[10]) +
        chars[7]
    )
  );
  rows.forEach((row) => {
    let rowContent = "";
    row.forEach((cell, i) => {
      const text = cell?.toString() ?? "";
      const centeredText = centerText(text, colWidths[i]);
      rowContent += ` ${centeredText} `;
      if (i < row.length - 1) {
        rowContent += formatConsole(color + chars[5]) + formatConsole("^R");
      }
    });
    console.log(
      formatConsole(color + chars[5]) +
        formatConsole("^R" + rowContent) +
        formatConsole(color + chars[5])
    );
  });

  console.log(
    formatConsole(
      color +
        chars[4] +
        colWidths.map((w) => chars[1].repeat(w + 2)).join(chars[9]) +
        chars[3]
    )
  );
}

export default renderTable;
