const fs = require('fs');
const axios = require('axios');

const YOUTUBE_KEY = process.env.YOUTUBE_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const DESTINATION = "/home/aggrid/public_html/videos/youtube.json";

async function getVideoSummaries(query) {
    const executeQuery = async (props) => {
        const response = await query.get('/search', {
            params: {
                channelId: YOUTUBE_CHANNEL_ID,
                ...props
            }
        })

        return response.data;
    }

    const videoSummaries = [];

    let data = await executeQuery();
    videoSummaries.push(...data.items.filter(item => !!item.id.videoId))

    while (data.nextPageToken) {
        data = await executeQuery({pageToken: data.nextPageToken})
        videoSummaries.push(...data.items.filter(item => !!item.id.videoId))
    }
    return videoSummaries;
}

async function getVideoMetadata(query, videoIds) {
    return await query.get('/videos', {
        params: {
            id: videoIds.join(',')
        }
    });
}

(async () => {
    const query = await axios.create({
        baseURL: 'https://www.googleapis.com/youtube/v3/',
        params: {
            part: 'snippet',
            maxResults: 50,
            order: 'date',
            key: YOUTUBE_KEY
        }
    })

    const videoSummaries = await getVideoSummaries(query);

    const videoIds = videoSummaries.map(videoSummary => videoSummary.id.videoId)
    const videoMetadata = await getVideoMetadata(query, videoIds);

    const metadataById = {};
    videoMetadata.data.items.forEach(item => {
        metadataById[item.id] = {
            description: item.snippet.description,
            tags: item.snippet.tags,
        }
    })

    videoSummaries.forEach(videoSummary => {
        const videoId = videoSummary.id.videoId;
        videoSummary.snippet = {...videoSummary.snippet, ...metadataById[videoId]};
    })

    // extract only what we need for a smaller file
    const mappedData = videoSummaries.map(videoSummary => ({
        id: videoSummary.id.videoId,
        publishedAt: videoSummary.snippet.publishedAt,
        title: videoSummary.snippet.title,
        description: videoSummary.snippet.description,
        tags: videoSummary.snippet.tags,
        thumbnails: videoSummary.snippet.thumbnails
    }))

    // sort by most recently published
    mappedData.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

    fs.writeFileSync(DESTINATION, JSON.stringify(mappedData));
})();
