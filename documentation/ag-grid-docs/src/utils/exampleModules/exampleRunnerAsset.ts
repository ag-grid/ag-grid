import { SITE_BASE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

/** Where the example runtime's served scripts live, under `public/` */
const EXAMPLE_RUNNER_PATH = '/example-runner';

/**
 * The URL of one of the example runtime's served scripts.
 *
 * Absolute, like the import map's own entries, because the same page is exported to Plunker and
 * CodeSandbox, where a site-relative URL would resolve against their host instead of ours.
 * These are always served by the site: unlike the AG packages, they are not published to npm.
 */
export const exampleRunnerAsset = (fileName: string): string =>
    pathJoin(import.meta.env?.PUBLIC_SITE_URL, SITE_BASE_URL, EXAMPLE_RUNNER_PATH, fileName);
