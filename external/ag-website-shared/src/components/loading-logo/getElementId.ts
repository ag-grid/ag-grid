export function getLoadingIFrameId({ pageName, exampleName }: { pageName: string; exampleName: string }) {
    return `loading-frame-${pageName}-${exampleName}`;
}
