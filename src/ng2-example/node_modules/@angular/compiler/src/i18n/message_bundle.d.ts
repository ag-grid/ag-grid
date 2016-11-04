/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HtmlParser } from '../ml_parser/html_parser';
import { InterpolationConfig } from '../ml_parser/interpolation_config';
import { ParseError } from '../parse_util';
import { Message } from './i18n_ast';
import { Serializer } from './serializers/serializer';
/**
 * A container for message extracted from the templates.
 */
export declare class MessageBundle {
    private _htmlParser;
    private _implicitTags;
    private _implicitAttrs;
    private _messageMap;
    constructor(_htmlParser: HtmlParser, _implicitTags: string[], _implicitAttrs: {
        [k: string]: string[];
    });
    updateFromTemplate(html: string, url: string, interpolationConfig: InterpolationConfig): ParseError[];
    getMessageMap(): {
        [id: string]: Message;
    };
    write(serializer: Serializer): string;
}
