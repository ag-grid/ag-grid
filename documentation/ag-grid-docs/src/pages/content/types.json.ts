import { getContentApiExtraFileUrl } from '@ag-website-shared/utils/content-api/urlPaths';
import { FILES_PATH_MAP } from '@utils/pages';

const TYPE_FILE_SUFFIX = '.AUTO.json';

function getTypeFiles() {
    const files = Object.keys(FILES_PATH_MAP).filter((key) => {
        return key.endsWith(TYPE_FILE_SUFFIX);
    });

    return files.map((filePath) => {
        const fileParts = filePath.split('/');
        const id = fileParts[fileParts.length - 1].replace(TYPE_FILE_SUFFIX, '');
        return {
            id,
            url: getContentApiExtraFileUrl({ filePath }),
            mimeType: 'application/json',
        };
    });
}

export async function GET() {
    const typeFiles = getTypeFiles();

    return new Response(JSON.stringify(typeFiles), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
