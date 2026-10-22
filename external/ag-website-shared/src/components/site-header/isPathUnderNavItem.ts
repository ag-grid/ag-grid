/**
 * Whether a page path falls under a nav path, matched on whole path segments, so the
 * `/[framework]/context` nav entry cannot also claim the `/[framework]/context-menu` page.
 */
export const isPathUnderNavItem = (path: string, navPath: string): boolean => {
    const navPathWithoutTrailingSlash = navPath.endsWith('/') ? navPath.slice(0, -1) : navPath;
    return path === navPathWithoutTrailingSlash || path.startsWith(`${navPathWithoutTrailingSlash}/`);
};
