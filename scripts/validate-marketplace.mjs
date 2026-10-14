// Repo constraints. Official results come only from `claude plugin validate`.
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const errors = [];

function fail(message) {
  errors.push(message);
}

function insideRepo(repoRoot, target) {
  const rel = path.relative(path.resolve(repoRoot), path.resolve(target));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

// shortcut: folded and literal scalars only, upgrade when a skill needs nested maps
function parseFrontmatter(text) {
  const normalized = text.replace(/^﻿/, '');
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(normalized);
  if (!match) throw new Error('SKILL.md must start with a closed --- frontmatter block');
  const fields = {};
  const lines = match[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const parsed = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (!parsed) throw new Error(`unsupported frontmatter line: ${lines[i]}`);
    let value = parsed[2].trim();
    if (value === '>' || value === '|' || value === '>-' || value === '|-') {
      const block = [];
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t') || !lines[i + 1].trim())) {
        i++;
        if (lines[i].trim()) block.push(lines[i].trim());
      }
      value = value.startsWith('|') ? block.join('\n') : block.join(' ');
    } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fields[parsed[1]] = value;
  }
  return fields;
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${path.relative(root, file)}: invalid JSON (${error.message})`);
    return null;
  }
}

function checkSkill(skillFile) {
  const dirName = path.basename(path.dirname(skillFile));
  const label = path.relative(root, skillFile);
  let fields;
  try {
    fields = parseFrontmatter(readFileSync(skillFile, 'utf8'));
  } catch (error) {
    fail(`${label}: ${error.message}`);
    return;
  }
  if (!fields.description) fail(`${label}: description is required`);
  if (!fields.name) fail(`${label}: name is required and must match the directory`);
  else if (fields.name !== dirName) fail(`${label}: name "${fields.name}" must match directory "${dirName}"`);
  else if (!kebab.test(fields.name)) fail(`${label}: name must be kebab-case`);
}

function checkPluginDir(pluginDir) {
  const label = path.relative(root, pluginDir);
  const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  const manifest = readJson(manifestPath);
  if (!manifest) return;
  if (!kebab.test(manifest.name ?? '')) fail(`${label}: plugin.json name must be kebab-case`);
  if (typeof manifest.description !== 'string' || !manifest.description.trim()) {
    fail(`${label}: plugin.json description is required`);
  }
  if (!semver.test(manifest.version ?? '')) fail(`${label}: plugin.json version must be SemVer`);
  if (typeof manifest.author?.name !== 'string' || !manifest.author.name.trim()) {
    fail(`${label}: plugin.json author.name is required`);
  }
  const skillsDir = path.join(pluginDir, 'skills');
  if (!existsSync(skillsDir) || !statSync(skillsDir).isDirectory()) {
    fail(`${label}: skills/ is required`);
    return;
  }
  const skillDirs = readdirSync(skillsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (skillDirs.length === 0) fail(`${label}: at least one skill directory is required`);
  for (const entry of skillDirs) {
    const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
    if (!existsSync(skillFile)) fail(`${label}: missing ${entry.name}/SKILL.md`);
    else checkSkill(skillFile);
  }
}

function walkPluginManifests(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.claude-plugin') {
        const manifest = path.join(full, 'plugin.json');
        if (existsSync(manifest)) found.push(path.dirname(full));
      } else walkPluginManifests(full, found);
    }
  }
  return found;
}

function selfTest() {
  const sample = '---\r\nname: hello\r\ndescription: "hi"\r\n---\r\n\nbody\n';
  const fields = parseFrontmatter(sample);
  if (fields.name !== 'hello' || fields.description !== 'hi') throw new Error('frontmatter self-test failed');
  const folded = parseFrontmatter('---\nname: setup-project-specs\ndescription: >\n  Initialize specs.\n  From the repo.\n---\n');
  if (folded.description !== 'Initialize specs. From the repo.') throw new Error('folded frontmatter self-test failed');
  if (!insideRepo(root, path.join(root, 'plugins'))) throw new Error('insideRepo self-test failed');
  if (insideRepo(root, path.resolve(root, '..'))) throw new Error('insideRepo parent self-test failed');
}

const secretRes = [
  /sk-ant-[A-Za-z0-9_-]{8,}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
];
const absPathRes = [/[A-Za-z]:\\(?:Users|home)\\/, /\/Users\/[A-Za-z0-9._-]+/, /\/home\/[A-Za-z0-9._-]+/];

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

selfTest();

const marketplaceFile = path.join(root, '.claude-plugin', 'marketplace.json');
const marketplace = readJson(marketplaceFile);
const registered = new Map();

if (marketplace) {
  if (!kebab.test(marketplace.name ?? '')) fail('marketplace name must be kebab-case');
  if (typeof marketplace.owner?.name !== 'string' || !marketplace.owner.name.trim()) {
    fail('marketplace owner.name is required');
  }
  if (typeof marketplace.description !== 'string' || !marketplace.description.trim()) {
    fail('marketplace description is required');
  }
  if (!Array.isArray(marketplace.plugins)) fail('marketplace plugins must be an array');
  else {
    const names = new Set();
    for (const entry of marketplace.plugins) {
      if (!kebab.test(entry?.name ?? '')) fail(`plugin entry name is invalid: ${JSON.stringify(entry?.name)}`);
      else if (names.has(entry.name)) fail(`duplicate plugin name: ${entry.name}`);
      else names.add(entry.name);
      if (Object.hasOwn(entry ?? {}, 'version')) {
        fail(`${entry.name}: do not set version on the marketplace entry; plugin.json owns it`);
      }
      if (typeof entry?.source !== 'string' || !entry.source.startsWith('./') || entry.source.includes('..') || entry.source.includes('\\')) {
        fail(`${entry?.name ?? '(unnamed)'}: source must be a ./ path inside the repo`);
        continue;
      }
      const pluginDir = path.resolve(root, entry.source);
      if (!insideRepo(root, pluginDir) || !existsSync(pluginDir) || !statSync(pluginDir).isDirectory()) {
        fail(`${entry.name}: source does not exist inside the repo: ${entry.source}`);
        continue;
      }
      const real = realpathSync(pluginDir);
      if (!insideRepo(root, real)) fail(`${entry.name}: source resolves outside the repo`);
      const manifest = readJson(path.join(real, '.claude-plugin', 'plugin.json'));
      if (manifest && manifest.name !== entry.name) {
        fail(`${entry.name}: entry name does not match plugin.json name "${manifest.name}"`);
      }
      registered.set(path.resolve(real), entry.name);
    }
  }
}

for (const pluginDir of walkPluginManifests(root)) {
  const real = path.resolve(realpathSync(pluginDir));
  const rel = path.relative(root, real);
  const isTemplate = rel.startsWith(`templates${path.sep}`) || rel.startsWith('templates/');
  const isPlugins = rel.startsWith(`plugins${path.sep}`) || rel.startsWith('plugins/');
  const isRegistered = registered.has(real);
  if (isTemplate && isRegistered) fail(`${rel}: template must not be registered in marketplace.json`);
  if (isPlugins && !isRegistered) fail(`${rel}: plugins/ entry is not registered in marketplace.json`);
  if (!isTemplate && !isPlugins) fail(`${rel}: plugin manifests belong in plugins/ or templates/`);
  checkPluginDir(real);
}

const validator = path.resolve(root, 'scripts', 'validate-marketplace.mjs');
for (const file of walkFiles(root)) {
  if (path.resolve(file) === validator) continue;
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  const label = path.relative(root, file);
  for (const pattern of secretRes) if (pattern.test(text)) fail(`${label}: possible secret (${pattern})`);
  for (const pattern of absPathRes) if (pattern.test(text)) fail(`${label}: machine-specific absolute path`);
}

if (errors.length) {
  console.error('static-check: failed');
  for (const error of errors) console.error(`- ${error}`);
  console.error('official-cli: not run by this script');
  process.exit(1);
}

console.log('static-check: passed');
console.log('official-cli: not run by this script');
