const formats: Record<string, string> = {
  // ----------- Text Colors -----------
  "^0": "\x1b[30m", // Noir
  "^r": "\x1b[31m", // Rouge
  "^g": "\x1b[32m", // Vert
  "^y": "\x1b[33m", // Jaune
  "^b": "\x1b[34m", // Bleu
  "^m": "\x1b[35m", // Magenta
  "^c": "\x1b[36m", // Cyan
  "^w": "\x1b[37m", // Blanc

  // ----------- Background Colors -----------
  "^B0": "\x1b[40m", // Fond noir
  "^Br": "\x1b[41m", // Fond rouge
  "^Bg": "\x1b[42m", // Fond vert
  "^By": "\x1b[43m", // Fond jaune
  "^Bb": "\x1b[44m", // Fond bleu
  "^Bm": "\x1b[45m", // Fond magenta
  "^Bc": "\x1b[46m", // Fond cyan
  "^Bw": "\x1b[47m", // Fond blanc

  // ----------- Text Styles -----------
  "^B": "\x1b[1m", // Bright
  "^D": "\x1b[2m", // Dim
  "^U": "\x1b[4m", // Underscore
  "^L": "\x1b[5m", // Blink
  "^V": "\x1b[7m", // Reverse
  "^H": "\x1b[8m", // Hidden

  // ----------- Reset -----------
  "^R": "\x1b[0m", // Reset
};

export default formats;
