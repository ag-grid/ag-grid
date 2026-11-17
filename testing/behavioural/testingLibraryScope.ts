import type { Config } from '@testing-library/dom';
import { configure, getConfig } from '@testing-library/dom';

type WrapperConfig = Pick<Config, 'asyncWrapper' | 'eventWrapper' | 'unstable_advanceTimersWrapper'>;
type ActEnvironment = { IS_REACT_ACT_ENVIRONMENT?: boolean };

const pickWrappers = (config: Config): WrapperConfig => ({
    asyncWrapper: config.asyncWrapper,
    eventWrapper: config.eventWrapper,
    unstable_advanceTimersWrapper: config.unstable_advanceTimersWrapper,
});

// Read on load, in the first file's setup: `@testing-library/react` replaces them on import for every later file.
const domWrappers = pickWrappers(getConfig());
let reactWrappers: WrapperConfig | undefined;

/** Gives a file the testing-library wrappers and act environment it would have alone: React's for a React test
 * file, the plain DOM ones otherwise. Returns React Testing Library's `cleanup`, run after each test. */
export async function useTestingLibraryFor(reactFile: boolean): Promise<() => void> {
    const reactTestingLibrary = await import('@testing-library/react');
    reactWrappers ??= pickWrappers(getConfig());
    configure(reactFile ? reactWrappers : domWrappers);
    if (reactFile) {
        (globalThis as ActEnvironment).IS_REACT_ACT_ENVIRONMENT = true;
    }
    return reactTestingLibrary.cleanup;
}

/** Leaves the page without React's act environment, as a file that never set it found it. */
export function endTestingLibraryFile(): void {
    delete (globalThis as ActEnvironment).IS_REACT_ACT_ENVIRONMENT;
}
