import {
    getModuleSourceFileName,
    isTransformableModule,
    toModuleFileName,
    transformExampleModule,
} from './transformExampleModule';

const transform = (fileName: string, source: string) => transformExampleModule({ fileName, source });

describe('isTransformableModule', () => {
    test.each([
        ['main.ts', true],
        ['index.tsx', true],
        ['index.jsx', true],
        ['main.js', false],
        ['styles.css', false],
        ['index.html', false],
    ])('%s is %s', (fileName, expected) => {
        expect(isTransformableModule(fileName)).toBe(expected);
    });
});

describe('getModuleSourceFileName', () => {
    const files = ['main.ts', 'index.jsx', 'data.js', 'styles.css'];

    test('maps a requested .js name back to its source', () => {
        expect(getModuleSourceFileName('main.js', files)).toBe('main.ts');
        expect(getModuleSourceFileName('index.js', files)).toBe('index.jsx');
    });

    test('leaves files that need no transpiling alone', () => {
        expect(getModuleSourceFileName('data.js', files)).toBeUndefined();
        expect(getModuleSourceFileName('styles.css', files)).toBeUndefined();
    });

    test('leaves the source extensions serving source', () => {
        expect(getModuleSourceFileName('main.ts', files)).toBeUndefined();
        expect(getModuleSourceFileName('index.jsx', files)).toBeUndefined();
    });

    test('is undefined when there is no matching source', () => {
        expect(getModuleSourceFileName('missing.js', files)).toBeUndefined();
    });
});

describe('transformExampleModule', () => {
    test('strips types and keeps bare specifiers for the import map to resolve', () => {
        const code = transform(
            'main.ts',
            [
                "import type { AgCartesianChartOptions } from 'ag-charts-community';",
                "import { AgCharts } from 'ag-charts-community';",
                'const options: AgCartesianChartOptions = { container: document.body };',
                'AgCharts.create(options);',
            ].join('\n')
        );

        expect(code).toContain("from 'ag-charts-community'");
        expect(code).not.toContain('AgCartesianChartOptions');
    });

    test('gives relative specifiers the extension native resolution needs', () => {
        const code = transform(
            'main.ts',
            [
                "import { getData } from './data';",
                "import { Renderer } from './renderer.ts';",
                'getData(Renderer);',
            ].join('\n')
        );

        expect(code).toContain("'./data.js'");
        expect(code).toContain("'./renderer.js'");
    });

    test('leaves relative specifiers that name another file type', () => {
        const code = transform(
            'main.ts',
            ["import data from './values.json';", "import './styles.css';", 'export const x = data;'].join('\n')
        );

        expect(code).toContain("'./values.json'");
        expect(code).not.toContain('values.json.js');
    });

    test('rewrites a relative specifier whose name contains a dot', () => {
        const code = transform(
            'main.ts',
            ["import { AppComponent } from './app.component';", 'console.log(AppComponent);'].join('\n')
        );

        expect(code).toContain("'./app.component.js'");
    });

    test('compiles JSX', () => {
        const code = transform(
            'index.jsx',
            ["import React from 'react';", 'export const App = () => <div className="grid" />;'].join('\n')
        );

        expect(code).toContain('React.createElement');
        expect(code).not.toContain('<div');
    });

    test('emits decorator metadata, which the Angular JIT compiler needs for injection', () => {
        const code = transform(
            'app.component.ts',
            [
                "import { Component, ElementRef } from '@angular/core';",
                "@Component({ selector: 'my-app', template: '<div></div>' })",
                'export class AppComponent {',
                '    constructor(private elementRef: ElementRef) {}',
                '}',
            ].join('\n')
        );

        expect(code).toContain('Component({');
        // design:paramtypes is what makes constructor injection resolvable (NG0202 without it)
        expect(code).toContain('design:paramtypes');
    });

    test('turns package stylesheet imports into a link element', () => {
        const code = transform('main.ts', "import 'ag-charts-community/styles/ag-charts.css';");

        expect(code).toContain(
            'await __agLoadStylesheet(import.meta.resolve("ag-charts-community/styles/ag-charts.css"))'
        );
        expect(code).toContain("link.rel = 'stylesheet'");
    });

    test('turns relative stylesheet imports into a link element too, awaited before the module runs', () => {
        const code = transform('main.ts', ["import './styles.css';", 'export const x = 1;'].join('\n'));

        expect(code).toContain('await __agLoadStylesheet(import.meta.resolve("./styles.css"))');
        // The template links the stylesheet itself for some frameworks, so it must not be loaded twice
        expect(code).toContain('link[rel="stylesheet"]');
    });

    test('leaves process.env.NODE_ENV for the page to define', () => {
        const code = transform(
            'main.ts',
            ['if (process.env.NODE_ENV !== "production") {', '    console.log("dev");', '}'].join('\n')
        );

        expect(code).toContain('process.env.NODE_ENV');
    });

    test('rewrites the path of a specifier that carries a query or fragment, keeping the suffix', () => {
        const code = transformExampleModule({
            fileName: 'main.ts',
            source: "export { default as worker } from './worker.ts?v=1';\nexport { m } from './mod#frag';\n",
        });

        expect(code).toContain("'./worker.js?v=1'");
        expect(code).toContain("'./mod.js#frag'");
    });

    test('leaves an asset that carries a query as authored', () => {
        const code = transformExampleModule({
            fileName: 'main.ts',
            source: "export { default as data } from './data.json?v=1';\n",
        });

        expect(code).toContain("'./data.json?v=1'");
    });
});

describe('toModuleFileName', () => {
    test.each([
        ['main.ts', 'main.js'],
        ['index.tsx', 'index.js'],
        ['index.jsx', 'index.js'],
        ['data.js', 'data.js'],
    ])('%s -> %s', (fileName, expected) => {
        expect(toModuleFileName(fileName)).toBe(expected);
    });
});
