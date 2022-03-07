import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

jest.mock('../documentation-helpers');
jest.mock('../use-json-file-nodes');

import React from 'react';
import renderer from 'react-test-renderer';
import * as fs from 'fs';
import { ExpandableSnippet } from './ExpandableSnippet';

import { getJsonFromFile } from '../documentation-helpers';

describe('ExpandableSnippet', () => {
    let mockInterfaces: {};
    let mockDocInterfaces: {};
    let mockOverrides: {};

    beforeAll(() => {
        mockInterfaces = JSON.parse(fs.readFileSync('./doc-pages/grid-api/interfaces.AUTO.json').toString());
        mockDocInterfaces = JSON.parse(fs.readFileSync('./doc-pages/grid-api/doc-interfaces.AUTO.json').toString());
        mockOverrides = JSON.parse(fs.readFileSync('./doc-pages/charts-api/api.json').toString());
    });

    beforeEach(() => {
        (getJsonFromFile as any)
            .mockReturnValueOnce(mockInterfaces)
            .mockReturnValueOnce(mockDocInterfaces)
            .mockReturnValueOnce(mockOverrides);
    });
    
    it('renders with title', () => {
        const tree = renderer
            // .create({ type: ExpandableSnippet, props: { interfacename: "AgChartOptions", overridesrc: "" }, key: null })
            .create(<ExpandableSnippet
                interfacename={"AgCartesianChartOptions"}
                overridesrc={"overrides.test.json"}
                config={({expandAll: true})}
            ></ExpandableSnippet>)
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
