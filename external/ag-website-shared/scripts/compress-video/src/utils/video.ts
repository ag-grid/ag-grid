import ffmpeg from 'ffmpeg';
import { join, parse } from 'path';

import { copyFiles, deleteFile, exists, fileSize } from './files';

export type Metadata = Record<string, any>;
export interface OnVideoProcessCompleteParams {
    skipReplace?: boolean;
    source: string;
    destination: string;
    originalFileSize: string;
    fileSize: string;
    metadata: Metadata;
    width: number;
    frameRate: number;
}

export async function getVideo({ source }: { source: string }) {
    const process = new ffmpeg(source);
    const video = await process;

    const metadata: Metadata = {
        width: video.metadata.video.resolution.w,
        height: video.metadata.video.resolution.h,
        filename: video.metadata.filename,
        duration: video.metadata.duration.seconds,
        bitrate: video.metadata.video.bitrate,
        codec: video.metadata.video.codec,
        aspect: video.metadata.video.aspect,
        fps: video.metadata.video.fps,
    };

    return {
        video,
        metadata,
    };
}

export async function reduceVideo({
    video,
    destination,
    width,
    frameRate,
}: {
    video: ReturnType<typeof ffmpeg>;
    /**
     * Destination of the resized video
     *
     * NOTE: Can't be the same as the source video, otherwise it fails silently
     */
    destination: string;
    width?: number;
    frameRate?: number;
}) {
    const processVideo = () =>
        new Promise((resolve, reject) => {
            if (width !== undefined) {
                video.setVideoSize(`${width}x?`, true, true);
            }
            if (frameRate !== undefined) {
                video.setVideoFrameRate(frameRate);
            }

            video.save(destination, function (error, file) {
                if (error) {
                    return reject(new Error('Error saving video file: ' + file));
                }
                return resolve(video);
            });
        });

    await processVideo();

    const newFileSize = await fileSize(destination);

    return {
        fileSize: newFileSize,
    };
}

export async function reduceVideos({
    videoFiles,
    maxWidth,
    maxFrameRate,
    skipReplace,
    condition,
    onVideoProcessComplete,
}: {
    videoFiles: string[];
    maxWidth: number;
    maxFrameRate: number;
    skipReplace?: boolean;
    condition: (params: { metadata: Metadata }) => boolean;
    onVideoProcessComplete: (params: OnVideoProcessCompleteParams) => void;
}) {
    return Promise.all(
        videoFiles.map(async (source) => {
            const originalFileSize = await fileSize(source);
            const { video, metadata } = await getVideo({ source });
            if (condition({ metadata })) {
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

                onVideoProcessComplete &&
                    onVideoProcessComplete({
                        skipReplace,
                        source,
                        destination,
                        originalFileSize,
                        fileSize,
                        metadata,
                        width,
                        frameRate,
                    });
            }
        })
    );
}
