/**
 * Posted on `window` by the example runner island before an example iFrame navigates, so the
 * separate loading logo island can show itself again. Must carry the `loadingIFrameId` from
 * `getLoadingIFrameId`, as pages contain one loading logo per example.
 */
export const EXAMPLE_RELOADING_MESSAGE_TYPE = 'exampleReloading';
