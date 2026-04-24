/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const args = yargs(hideBin(process.argv))
    .option('target', { alias: 't', type: 'string', demandOption: true, describe: 'Nx target to filter projects by' })
    .option('shard', { alias: 's', type: 'number', demandOption: true, describe: 'Current shard (1-based)' })
    .option('total', { type: 'number', demandOption: true, describe: 'Total number of shards' })
    .option('command', { type: 'string', default: 'affected', describe: 'Nx command type (affected or run-many)' })
    .parse();

const { target, shard, total, command } = args;

if (shard < 1 || shard > total) {
    console.error(`Invalid shard ${shard}/${total}`);
    process.exit(1);
}

const showProjectsCmd =
    command === 'run-many' ? `yarn nx show projects -t ${target}` : `yarn nx show projects --affected -t ${target}`;

const projects = execSync(showProjectsCmd, { encoding: 'utf-8' })
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    // Filter out yarn output lines that may be captured
    .filter((p) => !p.startsWith('yarn run'))
    .filter((p) => !p.startsWith('$'))
    .filter((p) => !p.startsWith('Done in'))
    // Exclude 'all' meta-project which triggers full generation via dependsOn
    .filter((p) => p !== 'all');

if (projects.length === 0) {
    process.exit(0);
}

const shardProjects = projects.filter((_, idx) => idx % total === shard - 1);

console.log(shardProjects.join(','));
