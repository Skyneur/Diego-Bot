function removeAnsiCodes(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

export default removeAnsiCodes;
