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

    beforeAll(() => {
        mockInterfaces = JSON.parse(fs.readFileSync('./src/components/expandable-snippet/test-interfaces.AUTO.json').toString());
        mockDocInterfaces = JSON.parse(fs.readFileSync('./src/components/expandable-snippet/test-doc-interfaces.AUTO.json').toString());
    });

    beforeEach(() => {
        (getJsonFromFile as any)
            .mockReturnValueOnce(mockInterfaces)
            .mockReturnValueOnce(mockDocInterfaces);
    });
    
    it('renders HTML as expected', () => {
        const tree = renderer
            .create(<ExpandableSnippet
                interfacename={"ExpandableSnippetTestInterface"}
                config={({expandAll: true})}
            ></ExpandableSnippet>)
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
