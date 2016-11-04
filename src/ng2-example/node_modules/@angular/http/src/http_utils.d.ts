/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { RequestMethod } from './enums';
export declare function normalizeMethodName(method: string | RequestMethod): RequestMethod;
export declare const isSuccess: (status: number) => boolean;
export declare function getResponseURL(xhr: any): string;
export declare function stringToArrayBuffer(input: String): ArrayBuffer;
export { isJsObject } from '../src/facade/lang';
