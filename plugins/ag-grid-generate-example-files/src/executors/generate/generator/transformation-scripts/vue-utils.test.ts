import type { EventHandler, Property } from '../types';
import {
    convertTemplate,
    getImport,
    indentTemplate,
    toAssignment,
    toComponentInstanceTypes,
    toConst,
    toGridApiRef,
    toInput,
    toMember,
    toOutput,
} from './vue-utils';

describe('toInput', () => {
    it('returns input definition', () => {
        const property = { name: 'foo' };
        const inputDefinition = toInput(property as Property);

        expect(inputDefinition).toBe(':foo="foo"');
    });
});

describe('toConst', () => {
    it('returns const definition', () => {
        const property = { name: 'foo', value: 'bar' };
        const constDefinition = toConst(property as Property);

        expect(constDefinition).toBe(':foo="bar"');
    });
});

describe('toOutput', () => {
    it('returns output definition', () => {
        const event = { name: 'onClick', handlerName: 'onClickHandler' };
        const outputDefinition = toOutput(event as EventHandler);

        expect(outputDefinition).toBe('@on-click="onClickHandler"');
    });
});

describe('toMember', () => {
    it('returns member definition', () => {
        const event = { name: 'foo' };
        const memberDefinition = toMember(event as Property);

        expect(memberDefinition).toBe('foo: null');
    });
});

describe('toAssignment', () => {
    it('returns assignment definition', () => {
        const event = { name: 'foo', value: '123' };
        const assignmentDefinition = toAssignment(event as Property, []);

        expect(assignmentDefinition).toBe('foo.value = 123');
    });

    it('converts functions', () => {
        const event = { name: 'foo', value: 'function(bar) { return true; }' };
        const assignmentDefinition = toAssignment(event as Property, []);

        expect(assignmentDefinition).toBe('foo.value = (bar) => { return true; }');
    });
});

describe('getImport', () => {
    it('returns import statement', () => {
        const filename = 'partialMatchFilterVue.js';
        const importStatement = getImport(filename, 'Vue', '');

        expect(importStatement).toBe("import PartialMatchFilter from './partialMatchFilterVue.js';");
    });
});

describe('convertTemplate', () => {
    it('converts event handlers', () => {
        const template = '<button onclick="foo(true)">Hello!</button>';
        const converted = convertTemplate(template).trim();

        expect(converted).toBe('<button v-on:click="foo(true)">Hello!</button>');
    });
});

describe('indentTemplate', () => {
    it('indents correctly', () =>
        expect(
            indentTemplate(
                `
                <div style="display: flex; flex-direction: column">
                    <div style="flex: none; display: flex; flex-direction: row; justify-content: center; gap: 0.5em">
                        <button v-on:click="changeSeriesBar()">Bar</button>
                        <button v-on:click="changeSeriesLine()">Line</button>
                        <button v-on:click="changeSeriesArea()">Area</button>
                        <button v-on:click="changeSeriesPie()">Pie</button>
                    </div>
                    <ag-charts-vue
                        ref="agCharts"
                        :options="options"
                    />
                </div>
            `.trim(),
                4,
                3
            )
        ).toBe(
            `
            <div style="display: flex; flex-direction: column">
                <div style="flex: none; display: flex; flex-direction: row; justify-content: center; gap: 0.5em">
                    <button v-on:click="changeSeriesBar()">Bar</button>
                    <button v-on:click="changeSeriesLine()">Line</button>
                    <button v-on:click="changeSeriesArea()">Area</button>
                    <button v-on:click="changeSeriesPie()">Pie</button>
                </div>
                <ag-charts-vue
                    ref="agCharts"
                    :options="options"
                />
            </div>
        `.slice(1, -9)
        ));
});

describe('toGridApiRef', () => {
    it('asserts the api is set where its members are used', () => {
        expect(toGridApiRef('gridApi.refreshCells(); gridApi!.redrawRows();')).toBe(
            'gridApi.value!.refreshCells(); gridApi.value!.redrawRows();'
        );
    });

    it('keeps optional chaining', () => {
        expect(toGridApiRef('gridApi?.destroy();')).toBe('gridApi.value?.destroy();');
    });

    it('asserts the api is set where it is passed as an argument', () => {
        expect(toGridApiRef('setPrinterFriendly(gridApi); pin(gridApi, value);')).toBe(
            'setPrinterFriendly(gridApi.value!); pin(gridApi.value!, value);'
        );
    });

    it('leaves assignments, conditions and comparisons unasserted', () => {
        expect(toGridApiRef('gridApi = api; if (gridApi) {} if (!gridApi) {} gridApi !== null;')).toBe(
            'gridApi.value = api; if (gridApi.value) {} if (!gridApi.value) {} gridApi.value !== null;'
        );
    });
});

describe('toComponentInstanceTypes', () => {
    it('types the instance of a Vue component the grid returns', () => {
        expect(
            toComponentInstanceTypes("gridApi.value!.getColumnFilterInstance<PartialMatchFilter>('name');", [
                'PartialMatchFilter',
            ])
        ).toBe("gridApi.value!.getColumnFilterInstance<InstanceType<typeof PartialMatchFilter>>('name');");
    });
});
