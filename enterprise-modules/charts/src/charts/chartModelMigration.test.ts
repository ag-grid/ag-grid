import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import { upgradeChartModel, heuristicVersionDetection } from './chartModelMigration';
import { VERSION } from '../version';

import { ChartModel } from '@ag-grid-community/core';

function loadChartModel(name: string): ChartModel {
    return JSON.parse(
        fs.readFileSync(`${__dirname}/../../test/chart-model-examples/${name}-chart-model.json`).toString()
    );
}

function snapshotVersion(name: string): string {
    const hyphenIndex = name.indexOf('-');
    if (hyphenIndex >= 0) {
        return name.substring(0, hyphenIndex);
    }
    return name;
}

describe('chartModelMigration', () => {
    const SNAPSHOT_CASES = {
        '22.1.0': {},
        '22.1.0-bar': {},
        '22.1.0-pie': {},
        '22.1.0-doughnut': {},
        '23.0.0': {},
        '24.0.0': {},
        '25.0.0': {},
        '25.0.0-line': {},
        // Client-supplied example.
        '25.2.0': {
            // Not enough markers to detect 25.2, overlap migrations are safe.
            detectedVersion: '25.0.0',
        },
        '26.0.0': {},
        '26.0.0-scatter': {},
        '26.1.0': {},
        '26.2.0': {},
        '27.0.0': {
            // Not enough markers to detect 27.0, overlap migrations are safe.
            detectedVersion: '26.2.0',
        },
        '28.0.0': {},
    };
    const SNAPSHOT_NAMES = Object.keys(SNAPSHOT_CASES);

    describe('upgradeChartModel', () => {
        it.each(SNAPSHOT_NAMES)('should upgrade %s successfully', (name) => {
            const chartModel = loadChartModel(name);

            const upgradedChartModel = upgradeChartModel(chartModel);
            expect(upgradedChartModel).toMatchSnapshot();
        });

        it.each(SNAPSHOT_NAMES)(`should upgrade %s to ${VERSION}`, (name) => {
            const chartModel = loadChartModel(name);

            const upgradedChartModel = upgradeChartModel(chartModel);
            expect(upgradedChartModel.version).toEqual(VERSION);
        });
    });

    describe('heuristicVersionDetection', () => {
        it.each(SNAPSHOT_NAMES)(`should detect best approximate version for %s ChartModel`, (name) => {
            const { detectedVersion = snapshotVersion(name) } = SNAPSHOT_CASES[name] ?? {};
            const chartModel = loadChartModel(name);

            const version = heuristicVersionDetection(chartModel);
            expect(version).toBeDefined();
            expect(version).toEqual(detectedVersion);
        });
    });
});
