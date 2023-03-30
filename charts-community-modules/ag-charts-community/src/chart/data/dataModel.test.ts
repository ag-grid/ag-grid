import { expect, it, describe } from '@jest/globals';

import * as examples from '../test/examples';

import { DataModel } from './dataModel';

describe('DataModel', () => {
    describe('ungrouped processing', () => {
        it('should generated the expected results', () => {
            const data = examples.SIMPLE_LINE_CHART_EXAMPLE.data!;
            const dataModel = new DataModel<any, any>({
                props: [
                    { property: 'date', type: 'key', valueType: 'range' },
                    { property: 'petrol', type: 'value', valueType: 'range' },
                    { property: 'diesel', type: 'value', valueType: 'range' },
                ],
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });
    });

    describe('grouped processing - grouped example', () => {
        it('should generated the expected results', () => {
            const data = examples.GROUPED_BAR_CHART_EXAMPLE.data!;
            const dataModel = new DataModel<any, any>({
                props: [
                    { property: 'type', type: 'key', valueType: 'category' },
                    { property: 'total', type: 'value', valueType: 'range' },
                    { property: 'regular', type: 'value', valueType: 'range' },
                ],
                groupByKeys: true,
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });
    });

    describe('grouped processing - stacked example', () => {
        it('should generated the expected results', () => {
            const data = examples.STACKED_BAR_CHART_EXAMPLE.data!;
            const dataModel = new DataModel<any, any>({
                props: [
                    { property: 'type', type: 'key', valueType: 'category' },
                    { property: 'ownerOccupied', type: 'value', valueType: 'range' },
                    { property: 'privateRented', type: 'value', valueType: 'range' },
                    { property: 'localAuthority', type: 'value', valueType: 'range' },
                    { property: 'housingAssociation', type: 'value', valueType: 'range' },
                ],
                groupByKeys: true,
                sumGroupDataDomains: [['ownerOccupied', 'privateRented', 'localAuthority', 'housingAssociation']],
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });
    });
});
