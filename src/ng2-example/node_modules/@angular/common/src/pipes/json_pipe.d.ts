/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PipeTransform } from '@angular/core';
/**
 * @ngModule CommonModule
 * @whatItDoes Converts value into JSON string.
 * @howToUse `expression | json`
 * @description
 *
 * Converts value into string using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example common/pipes/ts/json_pipe.ts region='JsonPipe'}
 *
 * @stable
 */
export declare class JsonPipe implements PipeTransform {
    transform(value: any): string;
}
