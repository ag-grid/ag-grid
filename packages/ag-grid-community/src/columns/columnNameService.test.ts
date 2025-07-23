import { AgColumn } from '../entities/agColumn';
import { ColumnNameService } from './columnNameService';

describe('_camelCaseToHumanText', () => {
    it.each([
        ['thisIsMe', 'This Is Me'],
        ['FTssRRsDSEd', 'F Tss R Rs DS Ed'],
        ['ALL.CAPS', 'ALL CAPS'],
        ['normal.testMe.canUS', 'Normal Test Me Can US'],
        ['SSSTall', 'SSS Tall'],
        ['HEREToThere', 'HERE To There'],
        ['person.address.town', 'Person Address Town'],
        ['person_address.town', 'Person_address Town'],
    ])('Value: %s', (field, expected) => {
        const column = new AgColumn({ field }, null, field, false);

        const columnNameService = new ColumnNameService();
        (columnNameService as any).beans = {} as any; // Mock beans
        const result = columnNameService.getDisplayNameForColumn(column, 'header');
        expect(result).toBe(expected);
    });
});
