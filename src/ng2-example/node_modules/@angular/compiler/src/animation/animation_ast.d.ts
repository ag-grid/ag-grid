/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare abstract class AnimationAst {
    startTime: number;
    playTime: number;
    abstract visit(visitor: AnimationAstVisitor, context: any): any;
}
export declare abstract class AnimationStateAst extends AnimationAst {
    abstract visit(visitor: AnimationAstVisitor, context: any): any;
}
export interface AnimationAstVisitor {
    visitAnimationEntry(ast: AnimationEntryAst, context: any): any;
    visitAnimationStateDeclaration(ast: AnimationStateDeclarationAst, context: any): any;
    visitAnimationStateTransition(ast: AnimationStateTransitionAst, context: any): any;
    visitAnimationStep(ast: AnimationStepAst, context: any): any;
    visitAnimationSequence(ast: AnimationSequenceAst, context: any): any;
    visitAnimationGroup(ast: AnimationGroupAst, context: any): any;
    visitAnimationKeyframe(ast: AnimationKeyframeAst, context: any): any;
    visitAnimationStyles(ast: AnimationStylesAst, context: any): any;
}
export declare class AnimationEntryAst extends AnimationAst {
    name: string;
    stateDeclarations: AnimationStateDeclarationAst[];
    stateTransitions: AnimationStateTransitionAst[];
    constructor(name: string, stateDeclarations: AnimationStateDeclarationAst[], stateTransitions: AnimationStateTransitionAst[]);
    visit(visitor: AnimationAstVisitor, context: any): any;
}
export declare class AnimationStateDeclarationAst extends AnimationStateAst {
    stateName: string;
    styles: AnimationStylesAst;
    constructor(stateName: string, styles: AnimationStylesAst);
    visit(visitor: AnimationAstVisitor, context: any): any;
}
export declare class AnimationStateTransitionExpression {
    fromState: string;
    toState: string;
    constructor(fromState: string, toState: string);
}
export declare class AnimationStateTransitionAst extends AnimationStateAst {
    stateChanges: AnimationStateTransitionExpression[];
    animation: AnimationWithStepsAst;
    constructor(stateChanges: AnimationStateTransitionExpression[], animation: AnimationWithStepsAst);
    visit(visitor: AnimationAstVisitor, context: any): any;
}
export declare class AnimationStepAst extends AnimationAst {
    startingStyles: AnimationStylesAst;
    keyframes: AnimationKeyframeAst[];
    duration: number;
    delay: number;
    easing: string;
    constructor(startingStyles: AnimationStylesAst, keyframes: AnimationKeyframeAst[], duration: number, delay: number, easing: string);
    visit(visitor: AnimationAstVisitor, context: any): any;
}
export declare class AnimationStylesAst extends AnimationAst {
    styles: Array<{
        [key: string]: string | number;
    }>;
    constructor(styles: Array<{
        [key: string]: string | number;
    }>);
    visit(visitor: AnimationAstVisitor, context: any): any;
}
export declare class AnimationKeyframeAst extends AnimationAst {
    offset: number;
    styles: AnimationStylesAst;
    constructor(offset: number, styles: AnimationStylesAst);
    visit(visitor: AnimationAstVisitor, context: any): any;
}
export declare abstract class AnimationWithStepsAst extends AnimationAst {
    steps: AnimationAst[];
    constructor(steps: AnimationAst[]);
}
export declare class AnimationGroupAst extends AnimationWithStepsAst {
    constructor(steps: AnimationAst[]);
    visit(visitor: AnimationAstVisitor, context: any): any;
}
export declare class AnimationSequenceAst extends AnimationWithStepsAst {
    constructor(steps: AnimationAst[]);
    visit(visitor: AnimationAstVisitor, context: any): any;
}
