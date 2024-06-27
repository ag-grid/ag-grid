import { getExtraFileUrl } from '@utils/extraFileUrl';

export async function fetchExtraFile(filePath: string) {
    const contents = await fetch(
        getExtraFileUrl({
            filePath,
        })
    ).then((res) => res.json());

    return contents;
}
