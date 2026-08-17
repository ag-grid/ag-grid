import type { InternalFramework } from '@ag-grid-types';

import {
    getModuleSourceFileName,
    isTransformableModule,
    toModuleFileName,
    transformExampleModule,
} from './transformExampleModule';

const transform = (fileName: string, source: string, internalFramework: InternalFramework = 'typescript') =>
    transformExampleModule({ fileName, source, internalFramework });

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
                "import type { ColDef } from 'ag-grid-community';",
                "import { createGrid } from 'ag-grid-community';",
                'const columnDefs: ColDef[] = [{ field: "make" }];',
                'createGrid(document.body, { columnDefs });',
            ].join('\n')
        );

        expect(code).toContain("from 'ag-grid-community'");
        expect(code).not.toContain('ColDef[]');
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
            ["import React from 'react';", 'export const App = () => <div className="grid" />;'].join('\n'),
            'reactFunctional'
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
            ].join('\n'),
            'angular'
        );

        expect(code).toContain('Component({');
        expect(code).toContain('design:paramtypes');
    });

    test('turns package stylesheet imports into a link element', () => {
        const code = transform('main.ts', "import 'ag-grid-community/styles/ag-grid.css';");

        expect(code).toContain("await __agLoadStylesheet(import.meta.resolve('ag-grid-community/styles/ag-grid.css'))");
        expect(code).toContain("link.rel = 'stylesheet'");
    });

    test('turns relative stylesheet imports into a link element too, awaited before the module runs', () => {
        const code = transform('main.ts', ["import './styles.css';", 'export const x = 1;'].join('\n'));

        expect(code).toContain("await __agLoadStylesheet(import.meta.resolve('./styles.css'))");
        expect(code).toContain('link[rel="stylesheet"]');
    });

    test('leaves process.env.NODE_ENV for the page to define', () => {
        const code = transform(
            'main.ts',
            ['if (process.env.NODE_ENV !== "production") {', '    console.log("dev");', '}'].join('\n')
        );

        expect(code).toContain('process.env.NODE_ENV');
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
