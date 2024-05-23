#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folderPath = path.join(__dirname, 'tmp');
const filePath = path.join(folderPath, 'buildTime.json');

async function ensureDirectoryExists() {
    try {
        await fs.mkdir(folderPath, { recursive: true });
    } catch (err) {
        console.error(`Error creating directory: ${err}`);
    }
}

async function writeJSON(data) {
    await ensureDirectoryExists();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function readJSON() {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return {};
        }
        throw err;
    }
}

async function start() {
    const data = await readJSON();
    data.startTime = Date.now();
    await writeJSON(data);
    console.log('Start build time recorded');
}

async function stop() {
    const data = await readJSON();
    data.endTime = Date.now();
    await writeJSON(data);
    console.log('End build time recorded');
}

async function elapsed() {
    const data = await readJSON();
    if (!data.startTime || !data.endTime) {
        console.log('Start time or end time is not recorded.');
        return;
    }
    const elapsedTime = (data.endTime - data.startTime) / 1000; // Convert to seconds
    console.log(`Elapsed build time: ${elapsedTime} seconds`);
}

const command = process.argv[2];

switch (command) {
    case 'start':
        await start();
        break;
    case 'stop':
        await stop();
        break;
    case 'elapsed':
        await elapsed();
        break;
    default:
        console.log('Unknown command. Use "time start", "time stop", or "time elapsed".');
}
