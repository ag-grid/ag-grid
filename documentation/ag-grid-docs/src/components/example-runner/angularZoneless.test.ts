import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) => readFileSync(path.resolve(__dirname, relativePath), 'utf-8');

describe('Angular example runner', () => {
    test('boilerplate bootstraps zoneless', () => {
        const main = read('../../../public/example-runner/grid-angular-boilerplate/main.ts');
        expect(main).not.toContain('provideZoneChangeDetection');
        expect(main).not.toContain('zone.js');
    });

    test('template does not load zone.js', () => {
        expect(read('framework-templates/AngularTemplate.astro')).not.toContain('zone.js');
    });
});
