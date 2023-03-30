import { expect, it, describe } from '@jest/globals';

import * as examples from '../test/examples';

import { DataModel } from './dataModel';

describe('DataModel', () => {
    describe('ungrouped processing', () => {
        it('should generated the expected results', () => {
            const data = examples.SIMPLE_LINE_CHART_EXAMPLE.data!;
            const dataModel = new DataModel<any, any>({
                dimensionKeys: ['date'],
                valueKeys: ['petrol', 'diesel'],
                dimensionKeyTypes: ['range'],
                valueKeyTypes: ['range', 'range'],
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });
    });

    describe('grouped processing - grouped example', () => {
        it('should generated the expected results', () => {
            const data = examples.GROUPED_BAR_CHART_EXAMPLE.data!;
            const dataModel = new DataModel<any, any>({
                dimensionKeys: ['type'],
                valueKeys: ['total', 'regular'],
                dimensionKeyTypes: ['category'],
                valueKeyTypes: ['range', 'range'],
                groupByKeys: true,
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });
    });

    describe('grouped processing - stacked example', () => {
        it('should generated the expected results', () => {
            const data = examples.STACKED_BAR_CHART_EXAMPLE.data!;
            const dataModel = new DataModel<any, any>({
                dimensionKeys: ['type'],
                valueKeys: ['ownerOccupied', 'privateRented', 'localAuthority', 'housingAssociation'],
                dimensionKeyTypes: ['category'],
                valueKeyTypes: ['range', 'range', 'range', 'range'],
                groupByKeys: true,
                sumGroupDataDomains: [['ownerOccupied', 'privateRented', 'localAuthority', 'housingAssociation']],
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });
    });
});
