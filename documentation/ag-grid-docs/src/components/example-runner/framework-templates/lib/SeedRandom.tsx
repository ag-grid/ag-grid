import type { InternalFramework } from '@ag-grid-types';
import { EXAMPLE_RANDOM_SEED, NPM_CDN } from '@constants';

const SEEDRANDOM_CDN_URL = `${NPM_CDN}/seedrandom@3.0.5/seedrandom.min.js`;

// React calls Math.random internally, so we mimic this for the other frameworks
// to ensure the examples start with the same random seed.
const EXTRA_RND_CALLS = `
// Add calls so all framework examples start with the same test data
Math.random();
Math.random();
`;

const INIT_RANDOM_SEED = (internalFramework: InternalFramework) => `
// Seed random number generator for predictable tests and examples
Math.seedrandom('${EXAMPLE_RANDOM_SEED}');
${internalFramework.includes('react') ? '' : EXTRA_RND_CALLS}`;

/**
 * Inject the seedrandom library and initialise the random number generator with a seed.
 */
export const SeedRandom = ({ nonce, internalFramework }: { nonce?: string; internalFramework: InternalFramework }) => {
    return (
        <>
            <script nonce={nonce} src={SEEDRANDOM_CDN_URL} />
            <script
                nonce={nonce}
                dangerouslySetInnerHTML={{
                    __html: INIT_RANDOM_SEED(internalFramework),
                }}
            />
        </>
    );
};
