import { fetchTextFile } from '@utils/fetchTextFile';

export const fetchRuntimeFiles = async (urls?: Record<string, string>): Promise<Record<string, string>> => {
    const entries = await Promise.all(
        Object.entries(urls ?? {}).map(async ([fileName, url]) => [fileName, await fetchTextFile(url)] as const)
    );

    return Object.fromEntries(entries);
};
