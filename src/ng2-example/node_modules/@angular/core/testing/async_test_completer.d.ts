/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
export declare class AsyncTestCompleter {
    private _resolve;
    private _reject;
    private _promise;
    done(value?: any): void;
    fail(error?: any, stackTrace?: string): void;
    promise: Promise<any>;
}
