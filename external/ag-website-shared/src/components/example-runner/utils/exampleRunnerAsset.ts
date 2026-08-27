import { SITE_BASE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

const EXAMPLE_RUNNER_PATH = '/example-runner';

/** Absolute URL of a file served verbatim from the site's `public/example-runner/` */
export const exampleRunnerAsset = (fileName: string): string =>
    pathJoin(import.meta.env?.PUBLIC_SITE_URL, SITE_BASE_URL, EXAMPLE_RUNNER_PATH, fileName);
