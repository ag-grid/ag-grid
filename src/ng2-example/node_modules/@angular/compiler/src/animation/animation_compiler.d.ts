import * as o from '../output/output_ast';
import { AnimationEntryAst } from './animation_ast';
export declare class AnimationEntryCompileResult {
    name: string;
    statements: o.Statement[];
    fnExp: o.Expression;
    constructor(name: string, statements: o.Statement[], fnExp: o.Expression);
}
export declare class AnimationCompiler {
    compile(factoryNamePrefix: string, parsedAnimations: AnimationEntryAst[]): AnimationEntryCompileResult[];
}
