/** Parse dotenv text into a Map of KEY -> value. Ignores comments and blank lines. */
export function parseEnv(text) {
  const out = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.lastIndexOf(quote) > 0) {
      value = value.slice(1, value.lastIndexOf(quote));
    } else {
      value = value.replace(/\s+#.*$/, "");
    }
    out.set(m[1], value);
  }
  return out;
}

/**
 * Compare an actual env against a template (.env.example).
 * @returns {{missing: string[], extra: string[], empty: string[], ok: boolean}}
 */
export function compareEnv(template, actual, { strict = false } = {}) {
  const missing = [...template.keys()].filter((k) => !actual.has(k));
  const extra = [...actual.keys()].filter((k) => !template.has(k));
  const empty = [...template.keys()].filter((k) => actual.has(k) && actual.get(k) === "");
  const ok = missing.length === 0 && empty.length === 0 && (!strict || extra.length === 0);
  return { missing, extra, empty, ok };
}
