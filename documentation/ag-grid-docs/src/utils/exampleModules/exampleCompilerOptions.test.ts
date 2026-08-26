import { transformExampleModule } from '@ag-website-shared/components/example-runner/utils/transformExampleModule';

import { getCompilerOptionNames } from './exampleCompilerOptions';

const transform = (fileName: string, source: string, internalFramework: Parameters<typeof getCompilerOptionNames>[0]) =>
    transformExampleModule({ fileName, source, compilerOptionNames: getCompilerOptionNames(internalFramework) });

describe('the options a framework is actually transpiled with', () => {
    test('compiles JSX for React', () => {
        const code = transform(
            'index.jsx',
            ["import React from 'react';", 'export const App = () => <div className="grid" />;'].join('\n'),
            'reactFunctional'
        );

        expect(code).toContain('React.createElement');
        expect(code).not.toContain('<div');
    });

    test('emits decorator metadata for Angular, which its JIT compiler needs for injection', () => {
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

    test('leaves a plain TypeScript example without decorator metadata', () => {
        const code = transform(
            'main.ts',
            ['export class Thing {', '    constructor(private value: string) {}', '}'].join('\n'),
            'typescript'
        );

        expect(code).not.toContain('design:paramtypes');
    });
});
