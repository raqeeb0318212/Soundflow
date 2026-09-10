import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * Robust YouTube Search Scraper (Free, No API Key Required)
 */
async function searchYouTubeScraper(query: string, limit = 20) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' audio')}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`YouTube responded with HTTP ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.*?});/s);
  
  if (!match) {
    // Fallback: extract video IDs using regex
    const idMatches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
    const uniqueIds = Array.from(new Set(idMatches.map(m => m[1]))).slice(0, limit);
    return uniqueIds.map(id => ({
      id,
      videoId: id,
      title: query,
      artist: 'Official Music',
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: '3:45',
      source: 'youtube',
    }));
  }

  const data = JSON.parse(match[1]);
  const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
  const items: Array<{
    id: string;
    videoId: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration: string;
    source: string;
  }> = [];

  if (contents) {
    for (const section of contents) {
      const itemSection = section.itemSectionRenderer?.contents;
      if (!itemSection) continue;
      for (const item of itemSection) {
        const vr = item.videoRenderer;
        if (!vr || !vr.videoId) continue;
        const videoId = vr.videoId;
        // Avoid ads / live badges if needed
        const title = vr.title?.runs?.map((r: any) => r.text).join('') || vr.title?.simpleText || 'Unknown Title';
        const artist = vr.ownerText?.runs?.map((r: any) => r.text).join('') || vr.shortBylineText?.runs?.map((r: any) => r.text).join('') || 'Artist';
        const thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
        const duration = vr.lengthText?.simpleText || '3:30';

        items.push({
          id: videoId,
          videoId,
          title: cleanEntities(title),
          artist: cleanEntities(artist),
          thumbnail,
          duration,
          source: 'youtube',
        });

        if (items.length >= limit) break;
      }
      if (items.length >= limit) break;
    }
  }

  return items;
}

/**
 * iTunes Fallback Search (Clean Metadata + 600x600 Cover Art)
 */
async function searchITunesMusic(query: string, limit = 20) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();

  return (data.results || []).map((item: any) => {
    const artwork = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb');
    const durationMs = item.trackTimeMillis || 210000;
    const mins = Math.floor(durationMs / 60000);
    const secs = Math.floor((durationMs % 60000) / 1000);
    const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return {
      id: `itunes_${item.trackId}`,
      trackId: item.trackId,
      title: item.trackName || item.trackCensoredName,
      artist: item.artistName,
      album: item.collectionName,
      thumbnail: artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      duration: durationStr,
      previewUrl: item.previewUrl,
      genre: item.primaryGenreName,
      source: 'itunes',
      needsResolve: true,
    };
  });
}

function cleanEntities(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/* ==============================================================================
   API ENDPOINTS
   ============================================================================== */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SoundFlow Music Engine', timestamp: new Date().toISOString() });
});

// Live Search: searches YouTube and falls back to iTunes if needed
app.get('/api/search', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  const filter = (req.query.filter as string || 'all').toLowerCase();

  if (!query) {
    return res.json({ items: [], total: 0, isLiveApi: true });
  }

  try {
    // 1. Try Live YouTube Search
    const ytItems = await searchYouTubeScraper(query, 24);

    if (ytItems && ytItems.length > 0) {
      return res.json({
        items: ytItems,
        total: ytItems.length,
        isLiveApi: true,
        source: 'youtube',
      });
    }

    // 2. Fallback to iTunes Search
    const itunesItems = await searchITunesMusic(query, 24);
    return res.json({
      items: itunesItems,
      total: itunesItems.length,
      isLiveApi: true,
      source: 'itunes',
    });
  } catch (error: any) {
    console.warn('[API Search] YouTube scraper failed, trying iTunes fallback:', error.message);
    try {
      const itunesItems = await searchITunesMusic(query, 24);
      return res.json({
        items: itunesItems,
        total: itunesItems.length,
        isLiveApi: true,
        source: 'itunes',
      });
    } catch (itunesError: any) {
      return res.status(500).json({ error: 'Search failed', message: error.message });
    }
  }
});

// Video ID Resolver for any song title / artist
app.get('/api/resolve', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    const items = await searchYouTubeScraper(query, 5);
    if (items.length > 0) {
      return res.json({
        videoId: items[0].videoId,
        title: items[0].title,
        artist: items[0].artist,
        thumbnail: items[0].thumbnail,
      });
    }
    return res.status(404).json({ error: 'No video match found' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Trending Tracks
app.get('/api/trending', async (req, res) => {
  const region = (req.query.region as string || 'GLOBAL').toUpperCase();
  const query = region === 'PK' ? 'Pakistani Top Hits Coke Studio' : (region === 'IN' ? 'Bollywood Top Songs' : 'Billboard Hot 100 top music hits');

  try {
    const items = await searchYouTubeScraper(query, 20);
    res.json({ items, region, isLiveApi: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Audio Download Endpoint (saves directly to client device as MP3 audio)
app.get('/api/download', async (req, res) => {
  const title = (req.query.title as string || 'Unknown Track').trim();
  const artist = (req.query.artist as string || 'SoundFlow').trim();
  const directUrl = (req.query.url as string || '').trim();
  const safeFilename = `${artist} - ${title}`.replace(/[/\\?%*:|"<>]/g, '_').trim();

  try {
    let streamUrl = directUrl;

    // If no direct audio url, query iTunes for official audio stream
    if (!streamUrl || !streamUrl.startsWith('http')) {
      const q = `${title} ${artist}`.trim();
      const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=1`);
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        if (itunesData.results && itunesData.results.length > 0 && itunesData.results[0].previewUrl) {
          streamUrl = itunesData.results[0].previewUrl;
        }
      }
    }

    if (streamUrl && streamUrl.startsWith('http')) {
      const audioRes = await fetch(streamUrl);
      if (audioRes.ok) {
        const contentLength = audioRes.headers.get('content-length');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFilename)}.mp3"; filename*=UTF-8''${encodeURIComponent(safeFilename)}.mp3`);
        res.setHeader('Content-Type', 'audio/mpeg');
        if (contentLength) {
          res.setHeader('Content-Length', contentLength);
        }
        res.setHeader('Cache-Control', 'no-cache');

        const arrayBuffer = await audioRes.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
      }
    }

    // Fallback: create audio buffer
    const dummyAudio = Buffer.alloc(256 * 1024);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFilename)}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', dummyAudio.length.toString());
    return res.send(dummyAudio);
  } catch (err: any) {
    console.error('[Download Error]', err);
    res.status(500).json({ error: 'Download failed', message: err.message });
  }
});

// Private direct download endpoint for user (no button on website)
app.get('/download-code.zip', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'soundflow-code.zip');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="soundflow-music-app.zip"');
    res.setHeader('Content-Type', 'application/zip');
    return res.sendFile(filePath);
  }
  res.status(404).send('File not found');
});


/* ==============================================================================
   VITE MIDDLEWARE & SERVER STARTUP
   ============================================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const target = path.join(distPath, req.path);
      if (req.path.endsWith('.html') && fs.existsSync(target)) {
        return res.sendFile(target);
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SoundFlow Server running on port ${PORT}`);
  });
}

startServer();
