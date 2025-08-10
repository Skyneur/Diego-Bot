import formats from "../../constants/consoleFormats";

function formatConsole(text: string, autoReset: boolean = true): string {
  let formatted = text;
  for (const code in formats) {
    const regex = new RegExp(`\\${code}`, "g");
    formatted = formatted.replace(regex, formats[code]);
  }
  return formatted + (autoReset ? formats["^R"] : "");
}

export default formatConsole;