import { describe, expect, it } from '@jest/globals';
import * as fs from 'fs';

import type { ChartModel } from 'ag-grid-community';

import { VERSION } from '../version';
import { heuristicVersionDetection, upgradeChartModel } from './chartModelMigration';

function loadChartModel(name: string): ChartModel {
    return JSON.parse(fs.readFileSync(`${__dirname}/test/chart-model-examples/${name}-chart-model.json`).toString());
}

function snapshotVersion(name: string): string {
    const hyphenIndex = name.indexOf('-');
    if (hyphenIndex >= 0) {
        return name.substring(0, hyphenIndex);
    }
    return name;
}

function nextVersions(): string[] {
    const versionParts = VERSION.split('.').map(Number);
    const result: string[] = [];

    for (let i = 0; i < 3; i++) {
        const newVersionParts: number[] = [];

        for (let v = 0; v < 3; v++) {
            if (v < i) {
                newVersionParts[v] = versionParts[v];
            } else if (v === i) {
                newVersionParts[v] = versionParts[v] + 1;
            } else {
                newVersionParts[v] = 0;
            }
        }

        result.push(newVersionParts.join('.'));
    }

    return result;
}

const NEXT_VERSIONS = nextVersions();

describe('chartModelMigration', () => {
    const SNAPSHOT_CASES = {
        '22.1.0': {},
        '22.1.0-bar': {},
        '22.1.0-pie': {},
        '22.1.0-pie-callout': {},
        '22.1.0-scatter': {},
        '22.1.0-doughnut': {},
        '22.1.0-doughnut-callout': {},
        '23.0.0': {},
        '24.0.0': {},
        '25.0.0': {},
        '25.0.0-line': {},
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
            delete upgradedChartModel.version; // Exercised in the next test-case.
            expect(upgradedChartModel).toMatchSnapshot();
        });

        it.each(SNAPSHOT_NAMES)(`should upgrade %s to ${VERSION}`, (name) => {
            const chartModel = loadChartModel(name);

            const upgradedChartModel = upgradeChartModel(chartModel);
            const isCurrentOrNextVersion = [VERSION, ...NEXT_VERSIONS].includes(upgradedChartModel.version ?? '');
            expect(isCurrentOrNextVersion).toEqual(true);
        });
    });

    describe('heuristicVersionDetection', () => {
        it.each(SNAPSHOT_NAMES)(`should detect best approximate version for %s ChartModel`, (name: string) => {
            const { detectedVersion = snapshotVersion(name) } = SNAPSHOT_CASES[name] ?? {};
            const chartModel = loadChartModel(name);

            const version = heuristicVersionDetection(chartModel);
            expect(version).toBeDefined();
            expect(version).toEqual(detectedVersion);
        });
    });
});
