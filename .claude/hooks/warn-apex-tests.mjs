// PostToolUse hook (Edit|Write). Warns when an Apex class changed without a fresher matching Test class.
// Exit 2 on PostToolUse cannot block, stderr is shown to Claude.
import { existsSync, statSync } from 'node:fs';
import { dirname, basename, join, resolve } from 'node:path';

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const f = input.tool_input?.file_path;
  if (!f) process.exit(0);
  const file = resolve(input.cwd ?? process.cwd(), f);
  const norm = file.split('\\').join('/');
  if (!/\/force-app\/.*\/classes\/[^/]+\.cls$/.test(norm)) process.exit(0);
  const name = basename(file, '.cls');
  if (/Test$/.test(name)) process.exit(0);
  const test = join(dirname(file), `${name}Test.cls`);
  let msg = null;
  if (!existsSync(test)) msg = `${name}Test.cls does not exist. Add it.`;
  else if (statSync(test).mtimeMs < statSync(file).mtimeMs) msg = `${name}Test.cls was not updated after this change. Update it.`;
  if (msg) {
    console.error(`WARNING (warn-apex-tests): Apex class ${name} changed. ${msg} CLAUDE.md requires a test with every Apex change.`);
    process.exit(2);
  }
  process.exit(0);
});
