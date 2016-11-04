/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare class CliOptions {
    basePath: string;
    constructor({basePath}: {
        basePath?: string;
    });
}
export declare class I18nExtractionCliOptions extends CliOptions {
    i18nFormat: string;
    constructor({i18nFormat}: {
        i18nFormat?: string;
    });
}
export declare class NgcCliOptions extends CliOptions {
    i18nFormat: string;
    i18nFile: string;
    locale: string;
    constructor({i18nFormat, i18nFile, locale, basePath}: {
        i18nFormat?: string;
        i18nFile?: string;
        locale?: string;
        basePath?: string;
    });
}
