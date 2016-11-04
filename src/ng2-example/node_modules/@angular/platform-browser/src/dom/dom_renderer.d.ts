/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { RenderComponentType, Renderer, RootRenderer } from '@angular/core';
import { AnimationKeyframe, AnimationPlayer, AnimationStyles, RenderDebugInfo } from '../private_import_core';
import { AnimationDriver } from './animation_driver';
import { EventManager } from './events/event_manager';
import { DomSharedStylesHost } from './shared_styles_host';
export declare abstract class DomRootRenderer implements RootRenderer {
    document: any;
    eventManager: EventManager;
    sharedStylesHost: DomSharedStylesHost;
    animationDriver: AnimationDriver;
    protected registeredComponents: Map<string, DomRenderer>;
    constructor(document: any, eventManager: EventManager, sharedStylesHost: DomSharedStylesHost, animationDriver: AnimationDriver);
    renderComponent(componentProto: RenderComponentType): Renderer;
}
export declare class DomRootRenderer_ extends DomRootRenderer {
    constructor(_document: any, _eventManager: EventManager, sharedStylesHost: DomSharedStylesHost, animationDriver: AnimationDriver);
}
export declare class DomRenderer implements Renderer {
    private _rootRenderer;
    private componentProto;
    private _animationDriver;
    private _contentAttr;
    private _hostAttr;
    private _styles;
    constructor(_rootRenderer: DomRootRenderer, componentProto: RenderComponentType, _animationDriver: AnimationDriver);
    selectRootElement(selectorOrNode: string | any, debugInfo: RenderDebugInfo): Element;
    createElement(parent: Element, name: string, debugInfo: RenderDebugInfo): Node;
    createViewRoot(hostElement: any): any;
    createTemplateAnchor(parentElement: any, debugInfo: RenderDebugInfo): any;
    createText(parentElement: any, value: string, debugInfo: RenderDebugInfo): any;
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
    invokeElementMethod(renderElement: any, methodName: string, args: any[]): void;
    setText(renderNode: any, text: string): void;
    animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
}
export declare const COMPONENT_VARIABLE: string;
export declare const HOST_ATTR: string;
export declare const CONTENT_ATTR: string;
