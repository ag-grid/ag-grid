import { join, parse } from 'path';

import { getContentFolder } from './utils/agFiles';
import { copyFiles, deleteFile, exists, fileSize, getFilePathsRecursively } from './utils/files';
import { getVideo, reduceVideo } from './utils/video';

const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.webm'];
const VIDEO_MAX_WIDTH = 1036;
const VIDEO_MAX_FRAMERATE = 30;

async function main({
    maxWidth,
    maxFrameRate,
    skipReplace,
    log,
}: {
    maxWidth: number;
    maxFrameRate: number;
    skipReplace?: boolean;
    log?: boolean;
}) {
    const contentFolder = getContentFolder();
    if (!contentFolder) {
        throw new Error('No content folder found');
    }

    const videoFiles = (await getFilePathsRecursively(contentFolder)).filter((path) => {
        const { ext } = parse(path);
        return VIDEO_EXTENSIONS.includes(ext);
    });

    videoFiles.map(async (source) => {
        const originalFileSize = await fileSize(source);
        const { video, metadata } = await getVideo({ source });
        if (metadata.width > maxWidth || metadata.fps > maxFrameRate) {
            const { name, dir, ext } = parse(source);
            const destination = join(dir, `${name}-optimized${ext}`);

            if (await exists(destination)) {
                await deleteFile(destination);
            }

            const width = metadata.width > maxWidth ? maxWidth : metadata.width;
            const frameRate = metadata.fps > maxFrameRate ? maxFrameRate : metadata.fps;
            const { fileSize } = await reduceVideo({
                video,
                width,
                frameRate,
                destination,
            });

            if (!skipReplace) {
                await copyFiles(destination, source);
                await deleteFile(destination);
            }

            if (log) {
                console.log(
                    `Resized video: ${skipReplace ? destination : source} (${originalFileSize} -> ${fileSize}, width ${metadata.width} -> ${width}, fps ${metadata.fps} -> ${frameRate})`
                );
            }
        }
    });
}

main({
    maxWidth: VIDEO_MAX_WIDTH,
    maxFrameRate: VIDEO_MAX_FRAMERATE,
    log: true,
});
