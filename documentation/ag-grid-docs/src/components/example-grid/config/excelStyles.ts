import type { ExcelStyle } from 'ag-grid-community';

export const excelStyles: ExcelStyle[] = [
    {
        id: 'v-align',
        alignment: {
            vertical: 'Center',
        },
    },
    {
        id: 'alphabet',
        alignment: {
            vertical: 'Center',
        },
    },
    {
        id: 'good-score',
        alignment: {
            horizontal: 'Center',
            vertical: 'Center',
        },
        interior: {
            color: '#C6EFCE',
            pattern: 'Solid',
        },
        numberFormat: {
            format: '[$$-409]#,##0',
        },
    },
    {
        id: 'bad-score',
        alignment: {
            horizontal: 'Center',
            vertical: 'Center',
        },
        interior: {
            color: '#FFC7CE',
            pattern: 'Solid',
        },
        numberFormat: {
            format: '[$$-409]#,##0',
        },
    },
    {
        id: 'header',
        font: {
            color: '#44546A',
            size: 16,
        },
        interior: {
            color: '#F2F2F2',
            pattern: 'Solid',
        },
        alignment: {
            horizontal: 'Center',
            vertical: 'Center',
        },
        borders: {
            borderTop: {
                lineStyle: 'Continuous',
                weight: 0,
                color: '#8EA9DB',
            },
            borderRight: {
                lineStyle: 'Continuous',
                weight: 0,
                color: '#8EA9DB',
            },
            borderBottom: {
                lineStyle: 'Continuous',
                weight: 0,
                color: '#8EA9DB',
            },
            borderLeft: {
                lineStyle: 'Continuous',
                weight: 0,
                color: '#8EA9DB',
            },
        },
    },
    {
        id: 'currency-cell',
        alignment: {
            horizontal: 'Center',
            vertical: 'Center',
        },
        numberFormat: {
            format: '[$$-409]#,##0',
        },
    },
    {
        id: 'boolean-type',
        dataType: 'Boolean',
        alignment: {
            vertical: 'Center',
        },
    },
    {
        id: 'country-cell',
        alignment: {
            indent: 4,
        },
    },
];
