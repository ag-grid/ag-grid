import * as GeneralUtils from './general';
import * as AriaUtils from './aria';
import * as ArrayUtils from './array';
import * as BrowserUtils from './browser';
import * as DateUtils from './date';
import * as DomUtils from './dom';
import * as EventUtils from './event';
import * as FunctionUtils from './function';
import * as FuzzyMatchUtils from './fuzzyMatch';
import * as GenericUtils from './generic';
import * as IconUtils from './icon';
import * as KeyboardUtils from './keyboard';
import * as MapUtils from './map';
import * as MouseUtils from './mouse';
import * as NumberUtils from './number';
import * as ObjectUtils from './object';
import * as RowNodeUtils from './rowNode';
import * as SetUtils from './set';
import * as StringUtils from './string';
import { _ } from './utils';

it('exports all util methods', () => {
    const combinedMethodCount = NumberUtils.sum([
        GeneralUtils,
        AriaUtils,
        ArrayUtils,
        BrowserUtils,
        DateUtils,
        DomUtils,
        EventUtils,
        FunctionUtils,
        FuzzyMatchUtils,
        GenericUtils,
        IconUtils,
        KeyboardUtils,
        MapUtils,
        MouseUtils,
        NumberUtils,
        ObjectUtils,
        RowNodeUtils,
        SetUtils,
        StringUtils,
    ].map(x => Object.keys(x).length));

    const exportedMethodCount = Object.keys(_).length;

    expect(exportedMethodCount).toBe(combinedMethodCount);
});
