import * as ml from '../../ml_parser/ast';
import { HtmlParser } from '../../ml_parser/html_parser';
import { InterpolationConfig } from '../../ml_parser/interpolation_config';
import * as i18n from '../i18n_ast';
import { MessageBundle } from '../message_bundle';
import { Serializer } from './serializer';
export declare class Xliff implements Serializer {
    private _htmlParser;
    private _interpolationConfig;
    constructor(_htmlParser: HtmlParser, _interpolationConfig: InterpolationConfig);
    write(messageMap: {
        [id: string]: i18n.Message;
    }): string;
    load(content: string, url: string, messageBundle: MessageBundle): {
        [id: string]: ml.Node[];
    };
}
