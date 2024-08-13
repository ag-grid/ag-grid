export const fetchYouTubeThumbnail = async (videoId: string) => {
    const url = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
};
