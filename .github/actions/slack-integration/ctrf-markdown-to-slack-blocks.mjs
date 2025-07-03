const ctrfSummary = process.env.CTRF_OUTPUT;
const ctrfReport = process.env.CTRF_REPORT;
if (!ctrfSummary) {
    console.log('CTRF_OUTPUT environment variable must be set.');
}
if (!ctrfReport) {
    console.log('CTRF_REPORT environment variable must be set.');
}

console.log('Converting CTRF report to Slack blocks...');
console.log(`CTRF summary:\n${ctrfSummary}`);
console.log(`CTRF report:\n${ctrfReport}`);
