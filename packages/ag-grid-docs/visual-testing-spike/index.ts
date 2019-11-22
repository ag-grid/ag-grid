import { runCli } from "./src/cli";

runCli(__dirname)
    .then(() => process.exit())
    .catch(e => {
        console.error('😢 ', e);
        process.exit(1);
    });
