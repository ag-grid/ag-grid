/**
 * Version keys in the changes database are 1-3 dot-separated numbers. Missing segments
 * are treated as zero, so '32.2' means 32.2.0 and compares equal to '32.2.0'.
 */
const VERSION_KEY_PATTERN = /^\d+(\.\d+){0,2}$/;

export function isValidVersionKey(version: string): boolean {
    return VERSION_KEY_PATTERN.test(version);
}

/**
 * Reduce a full version string to its `major.minor.patch` release form, dropping any
 * pre-release or build suffix, e.g. '36.0.0-beta.20260705.2117' -> '36.0.0'.
 */
export function toReleaseVersion(version: string): string {
    return normaliseVersion(version.split(/[-+]/)[0]);
}

/** Zero-fill a version key to its full three-segment form, e.g. '32.2' -> '32.2.0'. */
export function normaliseVersion(version: string): string {
    const segments = version.split('.');
    while (segments.length < 3) {
        segments.push('0');
    }
    return segments.join('.');
}

/** Standard comparator semantics: negative if a < b, zero if equal, positive if a > b. */
export function compareVersions(a: string, b: string): number {
    const aSegments = normaliseVersion(a).split('.');
    const bSegments = normaliseVersion(b).split('.');
    for (let i = 0; i < 3; i++) {
        const difference = Number(aSegments[i]) - Number(bSegments[i]);
        if (difference !== 0) {
            return difference;
        }
    }
    return 0;
}
