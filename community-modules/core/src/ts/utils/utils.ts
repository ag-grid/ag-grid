import * as GeneralUtils from './general';
import * as BrowserUtils from './browser';
import * as DateUtils from './date';
import * as FuzzyMatchUtils from './fuzzyMatch';
import * as HTMLElementUtils from './htmlElement';
import * as NumberUtils from './number';

const utils = {
    ...GeneralUtils,
    ...BrowserUtils,
    ...DateUtils,
    ...FuzzyMatchUtils,
    ...HTMLElementUtils,
    ...NumberUtils,
};

export const _ = utils;