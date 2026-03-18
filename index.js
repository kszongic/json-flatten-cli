#!/usr/bin/env node
'use strict';

const HELP = `
Usage: json-flatten [options]

Flatten nested JSON objects into dot-notation key-value pairs.
Reads from stdin or a file argument.

Options:
  -d, --delimiter <str>   Key delimiter (default: ".")
  -a, --array-index       Use numeric indices for arrays (a.0, a.1)
                          Default: bracket notation (a[0], a[1])
  -s, --safe              Skip circular references instead of erroring
  -p, --prefix <str>      Prefix all keys with a string
  --max-depth <n>         Maximum nesting depth to flatten
  -h, --help              Show this help
  -v, --version           Show version

Examples:
  echo '{"a":{"b":1}}' | json-flatten
  json-flatten < data.json
  echo '{"x":[1,2]}' | json-flatten -a
  echo '{"deep":{"nested":{"val":1}}}' | json-flatten --max-depth 1
`;

const args = process.argv.slice(2);
let delimiter = '.';
let bracketArrays = true;
let safe = false;
let prefix = '';
let maxDepth = Infinity;
let file = null;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '-h' || a === '--help') { process.stdout.write(HELP.trim() + '\n'); process.exit(0); }
  if (a === '-v' || a === '--version') {
    process.stdout.write(require('./package.json').version + '\n');
    process.exit(0);
  }
  if ((a === '-d' || a === '--delimiter') && args[i + 1]) { delimiter = args[++i]; continue; }
  if (a === '-a' || a === '--array-index') { bracketArrays = false; continue; }
  if (a === '-s' || a === '--safe') { safe = true; continue; }
  if ((a === '-p' || a === '--prefix') && args[i + 1]) { prefix = args[++i]; continue; }
  if (a === '--max-depth' && args[i + 1]) { maxDepth = parseInt(args[++i], 10); continue; }
  if (!a.startsWith('-')) { file = a; continue; }
}

function flatten(obj, pre, depth, seen) {
  const result = {};
  if (depth > maxDepth) {
    result[pre] = obj;
    return result;
  }
  if (obj && typeof obj === 'object' && !Buffer.isBuffer(obj)) {
    if (seen.has(obj)) {
      if (safe) { result[pre] = '[Circular]'; return result; }
      process.stderr.write('Error: circular reference detected\n');
      process.exit(1);
    }
    seen.add(obj);
    const isArr = Array.isArray(obj);
    const keys = isArr ? obj.map((_, i) => i) : Object.keys(obj);
    if (keys.length === 0) {
      result[pre || '{}'] = isArr ? [] : {};
    }
    for (const k of keys) {
      let newKey;
      if (isArr && bracketArrays) {
        newKey = (pre || '') + '[' + k + ']';
      } else {
        newKey = pre ? pre + delimiter + k : String(k);
      }
      Object.assign(result, flatten(obj[k], newKey, depth + 1, seen));
    }
    seen.delete(obj);
  } else {
    result[pre] = obj;
  }
  return result;
}

function run(input) {
  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    process.stderr.write('Error: invalid JSON input\n');
    process.exit(1);
  }
  const flat = flatten(data, prefix, 0, new WeakSet());
  process.stdout.write(JSON.stringify(flat, null, 2) + '\n');
}

if (file) {
  try {
    run(require('fs').readFileSync(file, 'utf8'));
  } catch (e) {
    process.stderr.write('Error: ' + e.message + '\n');
    process.exit(1);
  }
} else if (!process.stdin.isTTY) {
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', c => buf += c);
  process.stdin.on('end', () => run(buf));
} else {
  process.stdout.write(HELP.trim() + '\n');
}
