import ffmpeg from 'ffmpeg';

import { fileSize } from './files';

export async function getVideo({ source }: { source: string }) {
    const process = new ffmpeg(source);
    const video = await process;

    const metadata: Record<string, any> = {
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
        new Promise(async (resolve, reject) => {
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
