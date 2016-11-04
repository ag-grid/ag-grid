/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationKeyframe } from '../animation/animation_keyframe';
import { AnimationPlayer } from '../animation/animation_player';
import { AnimationStyles } from '../animation/animation_styles';
import { RenderComponentType, RenderDebugInfo, Renderer, RootRenderer } from '../render/api';
export declare class DebugDomRootRenderer implements RootRenderer {
    private _delegate;
    constructor(_delegate: RootRenderer);
    renderComponent(componentProto: RenderComponentType): Renderer;
}
export declare class DebugDomRenderer implements Renderer {
    private _delegate;
    constructor(_delegate: Renderer);
    selectRootElement(selectorOrNode: string | any, debugInfo?: RenderDebugInfo): any;
    createElement(parentElement: any, name: string, debugInfo?: RenderDebugInfo): any;
    createViewRoot(hostElement: any): any;
    createTemplateAnchor(parentElement: any, debugInfo?: RenderDebugInfo): any;
    createText(parentElement: any, value: string, debugInfo?: RenderDebugInfo): any;
    projectNodes(parentElement: any, nodes: any[]): void;
    attachViewAfter(node: any, viewRootNodes: any[]): void;
    detachView(viewRootNodes: any[]): void;
    destroyView(hostElement: any, viewAllNodes: any[]): void;
    listen(renderElement: any, name: string, callback: Function): Function;
    listenGlobal(target: string, name: string, callback: Function): Function;
    setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void;
    setElementAttribute(renderElement: any, attributeName: string, attributeValue: string): void;
    setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string): void;
    setElementClass(renderElement: any, className: string, isAdd: boolean): void;
    setElementStyle(renderElement: any, styleName: string, styleValue: string): void;
    invokeElementMethod(renderElement: any, methodName: string, args?: any[]): void;
    setText(renderNode: any, text: string): void;
    animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
}
