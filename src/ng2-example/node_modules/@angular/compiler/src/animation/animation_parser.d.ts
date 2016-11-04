/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileAnimationEntryMetadata, CompileDirectiveMetadata } from '../compile_metadata';
import { ParseError } from '../parse_util';
import { AnimationEntryAst } from './animation_ast';
export declare class AnimationParseError extends ParseError {
    constructor(message: string);
    toString(): string;
}
export declare class AnimationEntryParseResult {
    ast: AnimationEntryAst;
    errors: AnimationParseError[];
    constructor(ast: AnimationEntryAst, errors: AnimationParseError[]);
}
export declare class AnimationParser {
    parseComponent(component: CompileDirectiveMetadata): AnimationEntryAst[];
    parseEntry(entry: CompileAnimationEntryMetadata): AnimationEntryParseResult;
}
