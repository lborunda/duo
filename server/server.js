require('dotenv').config();
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const WebSocket = require('ws');
const { URLSearchParams, URL } = require('url');

const app = express();
const port = process.env.PORT || 8080;
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const externalApiBaseUrl = 'https://generativelanguage.googleapis.com';
const externalWsBaseUrl = 'wss://generativelanguage.googleapis.com';

const staticPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname, 'public');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (!apiKey) {
  console.warn('⚠️ No GEMINI_API_KEY provided. Proxy functionality disabled.');
}

// CORS middleware
app.use('/api-proxy', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust for production
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ---------- ✅ Gemini HTTP Proxy ----------
app.all('/api-proxy/*', async (req, res) => {
  if (!apiKey) return res.status(403).json({ error: 'API key not set on server' });

  const targetPath = req.url.replace(/^\/api-proxy\//, '');
  const targetUrl = `${externalApiBaseUrl}/${targetPath}`;
  console.log(`Proxying: ${req.method} → ${targetUrl}`);

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        'X-Goog-Api-Key': apiKey,
        ...(req.headers['content-type'] && { 'Content-Type': req.headers['content-type'] }),
        Accept: '*/*',
      },
      data: req.body,
      responseType: 'stream',
    });

    res.status(response.status);
    for (const [k, v] of Object.entries(response.headers)) {
      res.setHeader(k, v);
    }

    response.data.pipe(res);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ---------- ✅ WebSocket Proxy ----------
const server = app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;

  if (!pathname.startsWith('/api-proxy/')) {
    return socket.destroy();
  }

  const geminiPath = pathname.replace('/api-proxy', '');
  reqUrl.searchParams.set('key', apiKey);

  const targetWsUrl = `${externalWsBaseUrl}${geminiPath}?${reqUrl.searchParams.toString()}`;
  const targetWs = new WebSocket(targetWsUrl, {
    headers: { 'X-Goog-Api-Key': apiKey },
  });

  wss.handleUpgrade(req, socket, head, (client) => {
    client.on('message', (msg) => {
      if (targetWs.readyState === WebSocket.OPEN) targetWs.send(msg);
    });
    targetWs.on('message', (msg) => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
    client.on('close', () => targetWs.close());
    targetWs.on('close', () => client.close());
  });
});

// ---------- ✅ Serve frontend with injection ----------
const wsScript = `<script src="/public/websocket-interceptor.js" defer></script>`;
const swScript = `
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(reg => {
    console.log('✅ Service worker registered:', reg.scope);
  }).catch(err => {
    console.error('❌ Service worker registration failed:', err);
  });
}
</script>`;

app.get('/', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  const placeholder = path.join(publicPath, 'placeholder.html');

  fs.readFile(indexPath, 'utf8', (err, html) => {
    if (err || !apiKey) {
      console.log(`⚠️ index.html not found or API key missing. Serving placeholder.`);
      return res.sendFile(placeholder);
    }

    let injected = html.includes('<head>')
      ? html.replace('<head>', `<head>${wsScript}${swScript}`)
      : `${wsScript}${swScript}${html}`;

    res.send(injected);
  });
});

// ---------- ✅ Static Files ----------
app.use('/public', express.static(publicPath));
app.get('/service-worker.js', (_, res) => res.sendFile(path.join(publicPath, 'service-worker.js')));
app.use(express.static(staticPath));
