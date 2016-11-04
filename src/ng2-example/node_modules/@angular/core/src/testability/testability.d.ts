import { NgZone } from '../zone/ng_zone';
/**
 * Testability API.
 * `declare` keyword causes tsickle to generate externs, so these methods are
 * not renamed by Closure Compiler.
 * @experimental
 */
export interface PublicTestability {
    isStable(): boolean;
    whenStable(callback: Function): void;
    findProviders(using: any, provider: string, exactMatch: boolean): any[];
}
/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 * @experimental
 */
export declare class Testability implements PublicTestability {
    private _ngZone;
    constructor(_ngZone: NgZone);
    increasePendingRequestCount(): number;
    decreasePendingRequestCount(): number;
    isStable(): boolean;
    whenStable(callback: Function): void;
    getPendingRequestCount(): number;
    /** @deprecated use findProviders */
    findBindings(using: any, provider: string, exactMatch: boolean): any[];
    findProviders(using: any, provider: string, exactMatch: boolean): any[];
}
/**
 * A global registry of {@link Testability} instances for specific elements.
 * @experimental
 */
export declare class TestabilityRegistry {
    constructor();
    registerApplication(token: any, testability: Testability): void;
    getTestability(elem: any): Testability;
    getAllTestabilities(): Testability[];
    getAllRootElements(): any[];
    findTestabilityInTree(elem: Node, findInAncestors?: boolean): Testability;
}
/**
 * Adapter interface for retrieving the `Testability` service associated for a
 * particular context.
 *
 * @experimental Testability apis are primarily intended to be used by e2e test tool vendors like
 * the Protractor team.
 */
export interface GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability;
}
/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 * @experimental
 */
export declare function setTestabilityGetter(getter: GetTestability): void;
