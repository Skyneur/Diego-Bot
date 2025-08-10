import fs from "fs";
import path from "path";
import config from "@src/config";

type Translations = Record<string, string>;

const translations: Record<string, Translations> = {};

const defaultLang = "fr";

function loadTranslations() {
  const localesPath = path.join(__dirname, "../locales");
  const files = fs.readdirSync(localesPath);
  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const lang = file.replace(".json", "");
      const data = fs.readFileSync(path.join(localesPath, file), "utf8");
      translations[lang] = JSON.parse(data);
    }
  });
}

function _T(key: string, variables?: Record<string, string | number | undefined>): string {
  const lang = config.language;
  const language = lang && translations[lang] ? lang : defaultLang;
  let text =
    translations[language]?.[key] || translations[defaultLang]?.[key] || key;

  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{${k}}`, "g"), String(v));
    });
  }

  return text;
}

loadTranslations();

export { _T };
