import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy route for games to bypass school filters
  app.get("/api/proxy-game", async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).send("URL is required");
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      
      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch game: ${response.statusText}`);
      }

      let html = await response.text();
      
      // Basic path rewriting to handle absolute paths in proxied games
      // We want to turn src="/assets/..." into src="assets/..." so they resolve relative to the base tag
      // This handles both double and single quotes
      html = html.replace(/(src|href)=["']\/([^"']+)["']/g, (match, attr, path) => {
        // Skip protocol-relative URLs (starting with //)
        if (path.startsWith('/')) return match;
        // Skip external URLs (unlikely to start with / but good to be safe)
        if (path.startsWith('http')) return match;
        return `${attr}="${path}"`;
      });

      // Also handle some common game engine patterns
      html = html.replace(/url\(["']?\/([^"'\)]+)["']?\)/g, (match, path) => {
        if (path.startsWith('http') || path.startsWith('//')) return match;
        return `url("${path}")`;
      });

      res.send(html);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).send("Failed to proxy game");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
