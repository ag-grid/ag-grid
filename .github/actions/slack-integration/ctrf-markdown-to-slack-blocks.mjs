const ctrfReport = process.env.CTRF_OUTPUT;

if (!ctrfReport) {
    console.log('CTRF_OUTPUT environment variable must be set.');
}

console.log('Converting CTRF report to Slack blocks...');
console.log(`CTRF report: ${ctrfReport}`);
