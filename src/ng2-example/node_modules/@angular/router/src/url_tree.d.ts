export declare function createEmptyUrlTree(): UrlTree;
export declare function containsTree(container: UrlTree, containee: UrlTree, exact: boolean): boolean;
/**
 * @whatItDoes Represents the parsed URL.
 *
 * @howToUse
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const tree: UrlTree =
 * router.parseUrl('/team/33/(user/victor//support:help)?debug=true#fragment');
 *     const f = tree.fragment; // return 'fragment'
 *     const q = tree.queryParams; // returns {debug: 'true'}
 *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
 *     const s: UrlSegment[] = g.segments; // returns 2 segments 'team' and '33'
 *     g.children[PRIMARY_OUTLET].segments; // returns 2 segments 'user' and 'victor'
 *     g.children['support'].segments; // return 1 segment 'help'
 *   }
 * }
 * ```
 *
 * @description
 *
 * Since a router state is a tree, and the URL is nothing but a serialized state, the URL is a
 * serialized tree.
 * UrlTree is a data structure that provides a lot of affordances in dealing with URLs
 *
 * @stable
 */
export declare class UrlTree {
    /**
    * The root segment group of the URL tree.
     */
    root: UrlSegmentGroup;
    /**
     * The query params of the URL.
     */
    queryParams: {
        [key: string]: string;
    };
    /**
     * The fragment of the URL.
     */
    fragment: string;
    /**
     * @docsNotRequired
     */
    toString(): string;
}
/**
 * @whatItDoes Represents the parsed URL segment.
 *
 * See {@link UrlTree} for more information.
 *
 * @stable
 */
export declare class UrlSegmentGroup {
    /**
     * The URL segments of this group. See {@link UrlSegment} for more information.
     */
    segments: UrlSegment[];
    /**
     * The list of children of this group.
     */
    children: {
        [key: string]: UrlSegmentGroup;
    };
    /**
     * The parent node in the url tree.
     */
    parent: UrlSegmentGroup;
    constructor(
        /**
         * The URL segments of this group. See {@link UrlSegment} for more information.
         */
        segments: UrlSegment[], 
        /**
         * The list of children of this group.
         */
        children: {
        [key: string]: UrlSegmentGroup;
    });
    /**
     * Return true if the segment has child segments
     */
    hasChildren(): boolean;
    /**
     * Returns the number of child sements.
     */
    numberOfChildren: number;
    /**
     * @docsNotRequired
     */
    toString(): string;
}
/**
 * @whatItDoes Represents a single URL segment.
 *
 * @howToUse
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const tree: UrlTree = router.parseUrl('/team;id=33');
 *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
 *     const s: UrlSegment[] = g.segments;
 *     s[0].path; // returns 'team'
 *     s[0].parameters; // returns {id: 33}
 *   }
 * }
 * ```
 *
 * @description
 *
 * A UrlSegment is a part of a URL between the two slashes. It contains a path and
 * the matrix parameters associated with the segment.
 *
 * @stable
 */
export declare class UrlSegment {
    /**
     * The part part of a URL segment.
     */
    path: string;
    /**
     * The matrix parameters associated with a segment.
     */
    parameters: {
        [key: string]: string;
    };
    constructor(
        /**
         * The part part of a URL segment.
         */
        path: string, 
        /**
         * The matrix parameters associated with a segment.
         */
        parameters: {
        [key: string]: string;
    });
    /**
     * @docsNotRequired
     */
    toString(): string;
}
export declare function equalSegments(a: UrlSegment[], b: UrlSegment[]): boolean;
export declare function equalPath(a: UrlSegment[], b: UrlSegment[]): boolean;
export declare function mapChildrenIntoArray<T>(segment: UrlSegmentGroup, fn: (v: UrlSegmentGroup, k: string) => T[]): T[];
/**
 * @whatItDoes Serializes and deserializes a URL string into a URL tree.
 *
 * @description The url serialization strategy is customizable. You can
 * make all URLs case insensitive by providing a custom UrlSerializer.
 *
 * See {@link DefaultUrlSerializer} for an example of a URL serializer.
 *
 * @stable
 */
export declare abstract class UrlSerializer {
    /**
     * Parse a url into a {@link UrlTree}.
     */
    abstract parse(url: string): UrlTree;
    /**
     * Converts a {@link UrlTree} into a url.
     */
    abstract serialize(tree: UrlTree): string;
}
/**
 * @whatItDoes A default implementation of the {@link UrlSerializer}.
 *
 * @description
 *
 * Example URLs:
 *
 * ```
 * /inbox/33(popup:compose)
 * /inbox/33;open=true/messages/44
 * ```
 *
 * DefaultUrlSerializer uses parentheses to serialize secondary segments (e.g., popup:compose), the
 * colon syntax to specify the outlet, and the ';parameter=value' syntax (e.g., open=true) to
 * specify route specific parameters.
 *
 * @stable
 */
export declare class DefaultUrlSerializer implements UrlSerializer {
    /**
     * Parse a url into a {@link UrlTree}.
     */
    parse(url: string): UrlTree;
    /**
     * Converts a {@link UrlTree} into a url.
     */
    serialize(tree: UrlTree): string;
}
export declare function serializePaths(segment: UrlSegmentGroup): string;
export declare function encode(s: string): string;
export declare function decode(s: string): string;
export declare function serializePath(path: UrlSegment): string;
