import type { ColDef, ColGroupDef } from 'ag-grid-community';

import { mergeLeafPathTrees } from './sideBarUtils';

function createChild(colId: string): ColDef {
    return {
        colId,
    };
}

function createGroup(groupId: string, children: (ColDef | ColGroupDef)[]): ColGroupDef {
    return {
        groupId,
        children,
    };
}

describe('side bar utils', () => {
    describe('mergeLeafPathTrees', () => {
        describe('single level of groups', () => {
            it('with split children', () => {
                expect(
                    mergeLeafPathTrees([
                        createGroup('0', [createChild('a')]),
                        createChild('b'),
                        createGroup('0', [createChild('c')]),
                        createGroup('0', [createChild('d')]),
                    ])
                ).toEqual([
                    createGroup('0', [createChild('a')]),
                    createChild('b'),
                    createGroup('0', [createChild('c'), createChild('d')]),
                ]);
            });
        });

        describe('multiple levels of groups', () => {
            it('with split children and un-split at start', () => {
                expect(
                    mergeLeafPathTrees([
                        createGroup('0', [createGroup('1', [createChild('a')])]),
                        createGroup('0', [createGroup('1', [createChild('b')])]),
                        createGroup('0', [createChild('c')]),
                        createGroup('0', [createGroup('1', [createChild('d')])]),
                    ])
                ).toEqual([
                    createGroup('0', [
                        createGroup('1', [createChild('a'), createChild('b')]),
                        createChild('c'),
                        createGroup('1', [createChild('d')]),
                    ]),
                ]);
            });
            it('with split children and un-split at end', () => {
                expect(
                    mergeLeafPathTrees([
                        createGroup('0', [createGroup('1', [createChild('a')])]),
                        createGroup('0', [createChild('b')]),
                        createGroup('0', [createGroup('1', [createChild('c')])]),
                        createGroup('0', [createGroup('1', [createChild('d')])]),
                    ])
                ).toEqual([
                    createGroup('0', [
                        createGroup('1', [createChild('a')]),
                        createChild('b'),
                        createGroup('1', [createChild('c'), createChild('d')]),
                    ]),
                ]);
            });
        });
    });
});
