/**
 * A function that will be executed when an application is initialized.
 * @experimental
 */
export declare const APP_INITIALIZER: any;
/**
 * A class that reflects the state of running {@link APP_INITIALIZER}s.
 *
 * @experimental
 */
export declare class ApplicationInitStatus {
    private _donePromise;
    private _done;
    constructor(appInits: (() => any)[]);
    done: boolean;
    donePromise: Promise<any>;
}
