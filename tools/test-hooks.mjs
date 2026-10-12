// Run: node tools/test-hooks.mjs. Feeds sample tool-call JSON to each hook and checks the exit code.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (hook, input) =>
  spawnSync('node', [`.claude/hooks/${hook}`], { input: JSON.stringify(input), encoding: 'utf8' });
const bash = (command) => ({ tool_name: 'Bash', tool_input: { command } });

let fail = 0;
const expect = (label, r, code) => {
  const ok = r.status === code;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} [exit ${r.status}, want ${code}] ${label}`);
};

for (const c of [
  'sf project deploy start --target-org prod',
  'sf project deploy start -o prod',
  'sf project deploy start --target-org=prod',
  'git push origin main',
  'git push origin HEAD:main',
  'git push --force',
  'git push -f origin feature/x',
  'cd x && git push origin main',
  'git push origin +main',
  'git -C . push origin main',
  'git push origin main&',
  'git push --mirror',
  'sf project deploy start -oprod',
  'sf apex run -o prod',
  'sf data delete record -o prod',
  'git push origin HEAD:refs/heads/main',
]) expect(`block: ${c}`, run('guard-production.mjs', bash(c)), 2);

for (const c of [
  'sf project deploy start --target-org ci-sandbox',
  'sf project deploy start -o ci-sandbox',
  'git push origin feature/onboarding-tax-id',
  'git push -u origin HEAD',
  'git status',
  'git push origin feature/main',
]) expect(`allow: ${c}`, run('guard-production.mjs', bash(c)), 0);

// Apex warn hook, using a temp project with real files.
const d = mkdtempSync(join(tmpdir(), 'hooks-'));
const cls = join(d, 'force-app/main/default/classes');
mkdirSync(cls, { recursive: true });
const w = (p) => ({ tool_name: 'Edit', cwd: d, tool_input: { file_path: p } });
writeFileSync(join(cls, 'OnboardingService.cls'), 'x');
expect('warn: class with no test', run('warn-apex-tests.mjs', w(join(cls, 'OnboardingService.cls'))), 2);
writeFileSync(join(cls, 'OnboardingServiceTest.cls'), 'x');
const old = new Date(Date.now() - 60000);
utimesSync(join(cls, 'OnboardingServiceTest.cls'), old, old);
expect('warn: test older than class', run('warn-apex-tests.mjs', w(join(cls, 'OnboardingService.cls'))), 2);
const now = new Date(Date.now() + 5000);
utimesSync(join(cls, 'OnboardingServiceTest.cls'), now, now);
expect('ok: test updated', run('warn-apex-tests.mjs', w(join(cls, 'OnboardingService.cls'))), 0);
expect('ok: editing the test itself', run('warn-apex-tests.mjs', w(join(cls, 'OnboardingServiceTest.cls'))), 0);
expect('ok: non-Apex file', run('warn-apex-tests.mjs', w(join(d, 'README.md'))), 0);

console.log(fail ? `\n${fail} FAILED` : '\nall passed');
process.exit(fail ? 1 : 0);
