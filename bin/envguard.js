#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { parseEnv, compareEnv } from "../src/index.js";

const { values } = parseArgs({
  options: {
    example: { type: "string", short: "e", default: ".env.example" },
    env: { type: "string", short: "f", default: ".env" },
    strict: { type: "boolean", short: "s", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log(`envguard — check that .env matches .env.example

Usage: envguard [-e .env.example] [-f .env] [--strict]

  -e, --example  template file   (default .env.example)
  -f, --env      actual file     (default .env)
  -s, --strict   also fail on keys that are not in the template
Exit code: 0 = ok, 1 = problems found, 2 = file not found`);
  process.exit(0);
}

for (const f of [values.example, values.env]) {
  if (!existsSync(f)) {
    console.error(`envguard: file not found: ${f}`);
    process.exit(2);
  }
}

const r = compareEnv(
  parseEnv(readFileSync(values.example, "utf8")),
  parseEnv(readFileSync(values.env, "utf8")),
  { strict: values.strict },
);

const show = (title, list, sign) => list.length && console.log(`${title}:\n${list.map((k) => `  ${sign} ${k}`).join("\n")}`);
show("Missing keys", r.missing, "-");
show("Empty values", r.empty, "!");
show("Extra keys", r.extra, values.strict ? "+" : "~");
console.log(r.ok ? "✔ .env looks good" : "✖ .env has problems");
process.exit(r.ok ? 0 : 1);
