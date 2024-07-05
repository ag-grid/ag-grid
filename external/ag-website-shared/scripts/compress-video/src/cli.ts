import { parse } from 'path';
import prompts from 'prompts';
import type { PromptObject } from 'prompts';

import { getContentFolder } from './utils/agFiles';
import { getFilePathsRecursively } from './utils/files';
import { getVideo, reduceVideos } from './utils/video';
import type { OnVideoProcessCompleteParams } from './utils/video';

const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.webm'];
const VIDEO_MAX_WIDTH = 1036;
const VIDEO_MAX_FRAMERATE = 30;

async function getPromptResults({
    defaultWidth,
    defaultFrameRate,
    defaultSkipReplace,
}: {
    defaultWidth: number;
    defaultFrameRate: number;
    defaultSkipReplace?: boolean;
}): Promise<{
    hasCancelled: boolean;
    maxWidth: number;
    maxFrameRate: number;
    skipReplace?: boolean;
}> {
    const questions: PromptObject[] = [
        {
            type: 'number',
            name: 'maxWidth',
            message: 'What should the max width of the video be (px)?',
            initial: defaultWidth,
            min: 1,
        },
        {
            type: 'number',
            name: 'maxFrameRate',
            message: 'What should the frame rate of the video be?',
            initial: defaultFrameRate,
            min: 1,
            max: 120,
        },
        {
            type: 'confirm',
            name: 'replaceFiles',
            message: 'Do you want to replace the existing files?',
            initial: !defaultSkipReplace,
        },
    ];
    let hasCancelled = false;
    const { maxWidth, maxFrameRate, replaceFiles } = await prompts(questions, {
        onCancel: () => {
            hasCancelled = true;
        },
    });

    const skipReplace = !replaceFiles;

    return {
        hasCancelled,
        maxWidth,
        maxFrameRate,
        skipReplace,
    };
}

async function main({
    defaultWidth,
    defaultFrameRate,
    defaultSkipReplace,
    skipPrompts,
    log,
}: {
    defaultWidth: number;
    defaultFrameRate: number;
    defaultSkipReplace?: boolean;
    skipPrompts?: boolean;
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

    if (videoFiles.length <= 0) {
        if (log) {
            console.log(`No video files found in ${contentFolder}`);
        }
        return;
    } else {
        if (log) {
            console.log(`Found ${videoFiles.length} video files in ${contentFolder}`);
        }
    }

    let maxWidth = defaultWidth;
    let maxFrameRate = defaultFrameRate;
    let skipReplace = defaultSkipReplace;
    if (!skipPrompts) {
        const results = await getPromptResults({
            defaultWidth,
            defaultFrameRate,
            defaultSkipReplace,
        });

        if (results.hasCancelled) {
            return;
        }

        maxWidth = results.maxWidth;
        maxFrameRate = results.maxFrameRate;
        skipReplace = results.skipReplace;
    }

    const videosFromFiles = videoFiles.map(async (source) => {
        const { video, metadata } = await getVideo({ source });

        return { video, metadata };
    });
    const videos = (await Promise.all(videosFromFiles)).filter(({ metadata }) => {
        return metadata.width > maxWidth || metadata.fps > maxFrameRate;
    });

    if (videos.length <= 0) {
        if (log) {
            console.log(`No video files requiring updates in ${contentFolder}`);
        }
        return;
    }

    console.log(`Found the following video files to update:`);
    console.log(videos.map(({ video }) => video.metadata.filename));

    const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Would you like to update the ${videos.length} video files?`,
        initial: !defaultSkipReplace,
    });

    if (!confirm) {
        return;
    }

    await reduceVideos({
        videos,
        maxWidth,
        maxFrameRate,
        skipReplace,
        onVideoProcessComplete: ({
            source,
            destination,
            originalFileSize,
            fileSize,
            metadata,
            width,
            frameRate,
        }: OnVideoProcessCompleteParams) => {
            if (log) {
                const { base } = parse(destination);
                console.log(
                    `Resized video: ${source} -> ${base} (${originalFileSize} -> ${fileSize}, width ${metadata.width} -> ${width}, fps ${metadata.fps} -> ${frameRate})`
                );
            }
        },
    });
}

main({
    defaultWidth: VIDEO_MAX_WIDTH,
    defaultFrameRate: VIDEO_MAX_FRAMERATE,
    defaultSkipReplace: false,
    skipPrompts: true,
    log: true,
});
