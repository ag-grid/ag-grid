import { parse } from 'path';

import { getContentFolder } from './utils/agFiles';
import { getFilePathsRecursively } from './utils/files';
import { reduceVideos } from './utils/video';
import type { Metadata, OnVideoProcessCompleteParams } from './utils/video';

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

    await reduceVideos({
        videoFiles,
        maxWidth,
        maxFrameRate,
        skipReplace,
        condition: ({ metadata }: { metadata: Metadata }) => metadata.width > maxWidth || metadata.fps > maxFrameRate,
        onVideoProcessComplete: ({
            skipReplace,
            source,
            destination,
            originalFileSize,
            fileSize,
            metadata,
            width,
            frameRate,
        }: OnVideoProcessCompleteParams) => {
            if (log) {
                console.log(
                    `Resized video: ${skipReplace ? destination : source} (${originalFileSize} -> ${fileSize}, width ${metadata.width} -> ${width}, fps ${metadata.fps} -> ${frameRate})`
                );
            }
        },
    });
}

main({
    maxWidth: VIDEO_MAX_WIDTH,
    maxFrameRate: VIDEO_MAX_FRAMERATE,
    log: true,
});
