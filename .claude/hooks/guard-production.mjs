// PreToolUse hook (Bash). Blocks production deploys and pushes to main. Exit 2 = block.
let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let cmd = '';
  try {
    cmd = JSON.parse(raw).tool_input?.command ?? '';
  } catch {
    process.exit(0); // not our input, do not block
  }
  const reason = check(cmd);
  if (reason) {
    console.error(`BLOCKED by guard-production: ${reason}\nUse ci-sandbox, a feature branch and a PR. Production ships only through the GitHub environment "production" with human approval.`);
    process.exit(2);
  }
  process.exit(0);
});

const PROD = /^(prod|production)$/i;
const ORG_FLAGS = new Set(['-o', '--target-org', '-u', '--targetusername']);
// destination is main/master: "main", "+main", "HEAD:main", "refs/heads/main". Not "feature/main".
const MAIN = /^(\+)?(.*:)?(refs\/heads\/)?(main|master)$/;

function check(cmd) {
  // ponytail: naive split on shell separators, does not parse subshells or variables
  for (const seg of cmd.split(/&&|\|\||;|\||&|\n/)) {
    const t = seg.trim().split(/\s+/).map((x) => x.replace(/^['"]|['"]$/g, ''));
    // any sf/sfdx command aimed at the prod org, not only deploys
    if (t.some((x) => x === 'sf' || x === 'sfdx')) {
      for (let k = 0; k < t.length; k++) {
        const eq = t[k].split('=');
        const short = t[k].match(/^-[ou](.+)$/); // -oprod
        if (ORG_FLAGS.has(t[k]) && PROD.test(t[k + 1] ?? '')) return 'command aimed at the prod org alias';
        if (ORG_FLAGS.has(eq[0]) && eq[1] && PROD.test(eq[1])) return 'command aimed at the prod org alias';
        if (short && PROD.test(short[1])) return 'command aimed at the prod org alias';
      }
    }
    const g = t.indexOf('git');
    if (g >= 0 && t.slice(g + 1).includes('push')) {
      const args = t.slice(t.indexOf('push', g) + 1);
      if (args.some((a) => a === '-f' || a.startsWith('--force') || a === '--mirror')) return 'force push or mirror push';
      if (args.some((a) => /^\+/.test(a))) return 'force push by refspec';
      if (args.some((a) => !a.startsWith('-') && MAIN.test(a))) return 'push to main';
    }
  }
  return null;
}
