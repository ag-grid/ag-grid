import * as html from '../../ml_parser/ast';
import * as i18n from '../i18n_ast';
import { MessageBundle } from '../message_bundle';
import { Serializer } from './serializer';
export declare class Xmb implements Serializer {
    write(messageMap: {
        [k: string]: i18n.Message;
    }): string;
    load(content: string, url: string, messageBundle: MessageBundle): {
        [id: string]: html.Node[];
    };
}
