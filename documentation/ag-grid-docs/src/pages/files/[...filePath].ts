import { type ExtraFileRoute, getExtraFiles } from '@utils/pages';
import fsOriginal from 'node:fs';
import fs from 'node:fs/promises';

export function getStaticPaths() {
    return getExtraFiles();
}

/**
 * Get files for dev server
 */
export async function GET({ props }: ExtraFileRoute) {
    const { fullFilePath } = props;

    const fileExists = fsOriginal.existsSync(fullFilePath);
    const body = fileExists
        ? await fs.readFile(fullFilePath)
        : `throw new Error("File does not exist: '${fullFilePath}'. You may need to generate it, or try reloading again.");`;

    return new Response(body);
}
