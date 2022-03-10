const fs=require('fs')

// updates chartModelMigration.ts with the current enterprise-modules/charts/package.json version
// to be run during a release, and from the root folder of this monorepo

const CHAT_MODEL_MIGRATION_FILE='enterprise-modules/charts/src/charts/chartModelMigration.ts';

const newVersion = require(`${process.cwd()}/enterprise-modules/charts/package.json`).version;

const chartModelMigrationSrc = fs.readFileSync(CHAT_MODEL_MIGRATION_FILE, 'utf8');
const releaseInfoIndex = chartModelMigrationSrc.indexOf('export const CURRENT_VERSION');
const startOfValue = chartModelMigrationSrc.indexOf('"', releaseInfoIndex) + 1;
const endOfValue = chartModelMigrationSrc.indexOf('"', startOfValue);
const existingVersion = chartModelMigrationSrc.substring(startOfValue, endOfValue);

const newChartModelMigrationSrc = chartModelMigrationSrc.replace(existingVersion, newVersion);

fs.writeFileSync(CHAT_MODEL_MIGRATION_FILE,
    newChartModelMigrationSrc,
    "utf8");

