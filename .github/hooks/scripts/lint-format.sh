#!/usr/bin/env bash
# PostToolUse hook: auto-format & lint files the agent just wrote/edited.
# Non-blocking: always exits 0; surfaces results via systemMessage JSON on stdout.

set -u

# Read hook JSON payload from stdin
payload="$(cat)"

# Extract the file path from the tool input. Supports common edit tools.
# Keys checked: tool_input.filePath, tool_input.file_path, tool_input.path
file=$(printf '%s' "$payload" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
ti = data.get("tool_input") or data.get("toolInput") or {}
for k in ("filePath", "file_path", "path"):
    v = ti.get(k)
    if isinstance(v, str) and v:
        print(v)
        break
' 2>/dev/null)

# Nothing to do if we could not determine a target file
if [ -z "${file:-}" ] || [ ! -f "$file" ]; then
  exit 0
fi

repo_root="$(cd "$(dirname "$0")/../../.." && pwd)"
msg=""
status="ok"

case "$file" in
  *.cs)
    if command -v dotnet >/dev/null 2>&1; then
      # Scope format to the single changed file within the solution
      out=$(cd "$repo_root/backend" && dotnet format Notes.sln --include "$file" --verbosity quiet 2>&1) || status="warn"
      msg="dotnet format: ${status}"
      [ "$status" = "warn" ] && msg="$msg — $(printf '%s' "$out" | tail -n 5 | tr '\n' ' ')"
    fi
    ;;
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    case "$file" in
      */frontend/*|frontend/*)
        if command -v npx >/dev/null 2>&1; then
          out=$(cd "$repo_root/frontend" && npx --no-install eslint --fix "$file" 2>&1) || status="warn"
          msg="eslint --fix: ${status}"
          [ "$status" = "warn" ] && msg="$msg — $(printf '%s' "$out" | tail -n 5 | tr '\n' ' ')"
        fi
        ;;
    esac
    ;;
  *)
    exit 0
    ;;
esac

# Emit a non-blocking system message so the agent can see what happened.
python3 - "$file" "$msg" "$status" <<'PY'
import json, sys
file, msg, status = sys.argv[1], sys.argv[2], sys.argv[3]
if not msg:
    sys.exit(0)
print(json.dumps({
    "continue": True,
    "systemMessage": f"[lint-format hook] {file}: {msg}"
}))
PY

exit 0
