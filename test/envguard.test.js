import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseEnv, compareEnv } from "../src/index.js";

test("parseEnv handles comments, quotes, export", () => {
  const m = parseEnv(`# c\nA=1\nexport B="two words" # note\nC='x#y'\nD=val # c\nE=\n`);
  assert.deepEqual([...m], [["A", "1"], ["B", "two words"], ["C", "x#y"], ["D", "val"], ["E", ""]]);
});

test("compareEnv reports missing, empty, extra", () => {
  const r = compareEnv(parseEnv("A=\nB=\nC="), parseEnv("A=1\nB=\nX=1"));
  assert.deepEqual(r.missing, ["C"]);
  assert.deepEqual(r.empty, ["B"]);
  assert.deepEqual(r.extra, ["X"]);
  assert.equal(r.ok, false);
  assert.equal(compareEnv(parseEnv("A="), parseEnv("A=1\nX=1")).ok, true);
  assert.equal(compareEnv(parseEnv("A="), parseEnv("A=1\nX=1"), { strict: true }).ok, false);
});

test("cli exit codes", () => {
  const dir = mkdtempSync(join(tmpdir(), "eg-"));
  writeFileSync(join(dir, "ex"), "A=\nB=\n");
  writeFileSync(join(dir, "good"), "A=1\nB=2\n");
  writeFileSync(join(dir, "bad"), "A=1\n");
  const run = (f) => spawnSync("node", ["bin/envguard.js", "-e", join(dir, "ex"), "-f", join(dir, f)]);
  assert.equal(run("good").status, 0);
  assert.equal(run("bad").status, 1);
  assert.equal(run("nope").status, 2);
  assert.match(execFileSync("node", ["bin/envguard.js", "-h"]).toString(), /Usage/);
});
