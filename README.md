# json-flatten-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/json-flatten-cli)](https://www.npmjs.com/package/@kszongic/json-flatten-cli)
[![npm downloads](https://img.shields.io/npm/dm/@kszongic/json-flatten-cli)](https://www.npmjs.com/package/@kszongic/json-flatten-cli)
[![license](https://img.shields.io/npm/l/@kszongic/json-flatten-cli)](./LICENSE)
[![node](https://img.shields.io/node/v/@kszongic/json-flatten-cli)](https://nodejs.org)
![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![platform](https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-blue)

Flatten nested JSON objects into dot-notation key-value pairs. **Zero dependencies.** Works on Windows, macOS, and Linux.

> Nested JSON is great for humans. Flat JSON is great for databases, spreadsheets, and grep.

## Why?

Working with deeply nested JSON is a daily pain point:

- **Searching** — `grep` doesn't understand `user.address.city`
- **Importing** — CSV, SQL, and Elasticsearch want flat rows
- **Diffing** — flat keys make `diff` and `jq` comparisons trivial
- **Logging** — structured log platforms index flat fields faster
- **Migrations** — flattening is step one of any schema transformation

**json-flatten-cli** does one thing well: turn nested structures into flat key-value pairs, with full control over delimiters, depth, and array notation.

`ash
echo '{"user":{"name":"Alice","address":{"city":"NYC"}}}' | json-flatten
# {
#   "user.name": "Alice",
#   "user.address.city": "NYC"
# }
`

## Install

`ash
npm i -g @kszongic/json-flatten-cli
`

Or run directly without installing:

`ash
npx @kszongic/json-flatten-cli < data.json
`

## Usage

### Basic flattening

`ash
echo '{"user":{"name":"Alice","address":{"city":"NYC"}}}' | json-flatten
# {
#   "user.name": "Alice",
#   "user.address.city": "NYC"
# }
`

### Arrays with bracket notation (default)

`ash
echo '{"tags":["a","b"]}' | json-flatten
# {
#   "tags[0]": "a",
#   "tags[1]": "b"
# }
`

### Dot notation for arrays

`ash
echo '{"tags":["a","b"]}' | json-flatten -a
# {
#   "tags.0": "a",
#   "tags.1": "b"
# }
`

### Custom delimiter

`ash
echo '{"a":{"b":1}}' | json-flatten -d /
# {
#   "a/b": 1
# }
`

### Limit nesting depth

`ash
echo '{"a":{"b":{"c":1}}}' | json-flatten --max-depth 1
# {
#   "a.b": {"c": 1}
# }
`

### Prefix all keys

`ash
echo '{"x":1}' | json-flatten -p data
# {
#   "data.x": 1
# }
`

### Read from file

`ash
json-flatten data.json
`

## Options

| Flag | Description |
|---|---|
| `-d, --delimiter <str>` | Key delimiter (default: `.`) |
| `-a, --array-index` | Use dot-notation for array indices |
| `-s, --safe` | Skip circular references |
| `-p, --prefix <str>` | Prefix all keys |
| `--max-depth <n>` | Max nesting depth |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Recipes

### 1. Flatten API responses for grep

`ash
curl -s https://api.example.com/users/1 | json-flatten | grep email
# "contact.email": "alice@example.com"
`

### 2. Convert nested JSON to CSV-ready format

`ash
cat records.json | json-flatten -d , | jq -r 'to_entries[] | [.key, .value] | @csv'
`

### 3. Elasticsearch bulk indexing

Flatten deeply nested documents before indexing to avoid mapping explosions:

`ash
cat nested-docs.ndjson | while read -r line; do
  echo "``" | json-flatten --max-depth 2
done > flat-docs.ndjson
`

### 4. Diff two API responses

`ash
diff <(curl -s url/v1 | json-flatten | sort) \
     <(curl -s url/v2 | json-flatten | sort)
`

### 5. Flatten with path-style keys for S3/storage

`ash
echo '{"images":{"profile":{"url":"..."}}}' | json-flatten -d /
# {
#   "images/profile/url": "..."
# }
`

### 6. Use in npm scripts

`json
{
  "scripts": {
    "flatten": "cat data.json | json-flatten",
    "flatten:csv": "cat data.json | json-flatten | jq -r 'to_entries[] | [.key,.value] | @csv'"
  }
}
`

## How It Works

The CLI recursively traverses the input JSON object. For each leaf value (string, number, boolean, null), it builds a flattened key by joining all parent keys with the delimiter.

- **Objects** → keys joined with delimiter (`user.name`)
- **Arrays** → bracket notation by default (`tags[0]`), or dot notation with `-a` (`tags.0`)
- **Max depth** → stops recursion and keeps the remaining value as-is
- **Safe mode** → tracks visited references to skip circular structures

All processing happens in a single pass with O(n) time complexity where n is the total number of keys.

## Use Cases

- **API debugging** — flatten responses to quickly find nested fields
- **Data pipelines** — transform nested JSON for flat-file databases (CSV, TSV, SQL)
- **Log analysis** — flatten structured logs for grep/awk workflows
- **Schema migration** — flatten first, transform, then unflatten
- **Elasticsearch/OpenSearch** — prevent mapping explosions from deeply nested docs
- **Configuration diffing** — compare YAML/JSON configs after flattening

## Comparison

| Tool | Zero deps | Stdin pipe | Custom delimiter | Depth limit | Array control | Install |
|---|---|---|---|---|---|---|
| **json-flatten-cli** | ✅ | ✅ | ✅ | ✅ | ✅ | `npx @kszongic/json-flatten-cli` |
| [flat](https://www.npmjs.com/package/flat) | ❌ (3 deps) | ❌ (library) | ✅ | ✅ | ❌ | `npm i flat` |
| `jq` (manual) | N/A | ✅ | Manual | Manual | Manual | System package |
| Python `json_normalize` | N/A | Script | ✅ | ✅ | ✅ | `pip install pandas` |
| Online tools | N/A | ❌ | Varies | ❌ | ❌ | Browser |

## Related

- [json-fmt-cli](https://github.com/kszongic/json-fmt-cli) — Format and prettify JSON
- [ndjson-dedup-cli](https://github.com/kszongic/ndjson-dedup-cli) — Deduplicate NDJSON streams
- [wc-json-cli](https://github.com/kszongic/wc-json-cli) — Count keys/values in JSON
- [tail-json-cli](https://github.com/kszongic/tail-json-cli) — Tail NDJSON streams
- [dep-size](https://github.com/kszongic/dep-size) — Check npm package install size

## License

MIT © 2026 kszongic
