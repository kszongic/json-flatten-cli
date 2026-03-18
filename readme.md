# @kszongic/json-flatten-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/json-flatten-cli)](https://www.npmjs.com/package/@kszongic/json-flatten-cli)
[![license](https://img.shields.io/npm/l/@kszongic/json-flatten-cli)](./LICENSE)

Flatten nested JSON objects into dot-notation key-value pairs. Zero dependencies.

## Install

```bash
npm install -g @kszongic/json-flatten-cli
```

## Usage

```bash
# Pipe JSON from stdin
echo '{"user":{"name":"Alice","address":{"city":"NYC"}}}' | json-flatten
# {
#   "user.name": "Alice",
#   "user.address.city": "NYC"
# }

# Arrays use bracket notation by default
echo '{"tags":["a","b"]}' | json-flatten
# {
#   "tags[0]": "a",
#   "tags[1]": "b"
# }

# Use dot notation for arrays
echo '{"tags":["a","b"]}' | json-flatten -a
# {
#   "tags.0": "a",
#   "tags.1": "b"
# }

# Custom delimiter
echo '{"a":{"b":1}}' | json-flatten -d /
# {
#   "a/b": 1
# }

# Max depth
echo '{"a":{"b":{"c":1}}}' | json-flatten --max-depth 1
# {
#   "a.b": {"c": 1}
# }

# Prefix all keys
echo '{"x":1}' | json-flatten -p data
# {
#   "data.x": 1
# }

# Read from file
json-flatten data.json
```

## Options

| Flag | Description |
|------|-------------|
| `-d, --delimiter <str>` | Key delimiter (default: `.`) |
| `-a, --array-index` | Use dot-notation for array indices |
| `-s, --safe` | Skip circular references |
| `-p, --prefix <str>` | Prefix all keys |
| `--max-depth <n>` | Max nesting depth |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## License

MIT
