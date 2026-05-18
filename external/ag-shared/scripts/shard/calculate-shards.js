/* eslint-disable @typescript-eslint/no-require-imports */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const args = yargs(hideBin(process.argv))
    .command('eval <test-count>', 'calculate GHA shards', (yargs) => {
        yargs
            .option('min', { number: true, default: 0 })
            .option('max', { number: true, default: 10 })
            .option('ratio', { number: true, default: 100 })
            .option('zero', { boolean: true, default: false })
            .positional('test-count', { alias: 'count', type: 'number', demandOption: true });
    })
    .parse();

const { count, min, max, ratio, zero } = args;

const shardCount = Math.max(Math.min(Math.ceil(count / ratio), max), min);
const result = { shard: [] };
if (zero && shardCount > 0) {
    result.shard.push(0);
}
for (let i = 1; i <= shardCount; i++) {
    result.shard.push(i);
}

console.log(JSON.stringify(result));
