/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as html from '../ml_parser/ast';
import { MessageBundle } from './message_bundle';
import { Serializer } from './serializers/serializer';
/**
 * A container for translated messages
 */
export declare class TranslationBundle {
    private _messageMap;
    constructor(_messageMap?: {
        [id: string]: html.Node[];
    });
    static load(content: string, url: string, messageBundle: MessageBundle, serializer: Serializer): TranslationBundle;
    get(id: string): html.Node[];
    has(id: string): boolean;
}
