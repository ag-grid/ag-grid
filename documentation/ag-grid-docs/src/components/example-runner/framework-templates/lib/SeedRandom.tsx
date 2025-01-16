import { EXAMPLE_RANDOM_SEED, NPM_CDN } from '@constants';

const SEEDRANDOM_CDN_URL = `${NPM_CDN}/seedrandom/3.0.5/seedrandom.min.js`;

const INIT_RANDOM_SEED = `
// Seed random number generator for predictable tests and examples
Math.seedrandom('${EXAMPLE_RANDOM_SEED}');
`;

/**
 * These are the CSS styles shared by all examples.
 */
export const SeedRandom = () => {
    return (
        <>
            <script src={SEEDRANDOM_CDN_URL} />
            <script
                dangerouslySetInnerHTML={{
                    __html: `${INIT_RANDOM_SEED}`,
                }}
            />
        </>
    );
};
