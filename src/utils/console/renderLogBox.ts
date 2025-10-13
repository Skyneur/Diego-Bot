import colors from '@src/constants/consoleFormats'
import formatConsole from "./consoleFormatter";
import stripAnsi from "./stripAnsi";
import type { IconType } from "@mytypes/iconType";
import type { LogIcon } from "@mytypes/logIcon";
import type { LogBoxLine } from "@mytypes/logBoxLine";

const CHARS = ["┌", "─", "┐", "┘", "└", "│", "├", "┤", "┬", "┴", "┼"] as const;

const ICONS: Record<IconType, LogIcon> = {
  success: { icon: "✓", colorCode: "^g" },
  error: { icon: "⨯", colorCode: "^r" },
  warning: { icon: "!", colorCode: "^y" },
  info: { icon: "•", colorCode: "^c" },
  default: { icon: "•", colorCode: "^w" },
};

/**
 * Affiche un encadré de log stylisé
 */
export function renderLogBox(
  colorCode: keyof typeof colors,
  title: string,
  args: LogBoxLine[] = []
): void {
  const lines = args.map(({ type = "default", content }) => {
    const { icon, colorCode: iconColor } = ICONS[type] || ICONS.default;
    return `${formatConsole(iconColor + icon)} ${formatConsole(content)}`;
  });

  let maxWidth =
    Math.max(
      stripAnsi(` ${title} `).length + 2,
      ...lines.map((l) => stripAnsi(l).length)
    ) + 1;

  if (maxWidth < 58) {
    maxWidth = 58;
  }


  const titleDisplay = ` ${title.toUpperCase()} `;
  const remaining = maxWidth - titleDisplay.length;
  const leftPad = 2;
  const rightPad = remaining - leftPad + 1;
  console.log(
    formatConsole(
      colorCode +
        CHARS[0] +
        CHARS[1].repeat(leftPad) +
        titleDisplay +
        CHARS[1].repeat(rightPad) +
        CHARS[2]
    )
  );


  lines.forEach((line) => {
    const pad = maxWidth - stripAnsi(line).length;
    console.log(
      formatConsole(colorCode + CHARS[5]) +
        " " +
        line +
        " ".repeat(Math.max(0, pad)) +
        formatConsole(colorCode + CHARS[5])
    );
  });


  console.log(
    formatConsole(
      colorCode + CHARS[4] + CHARS[1].repeat(maxWidth + 1) + CHARS[3]
    )
  );
}
