import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, ExternalLink, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';

interface GameViewerProps {
  title: string;
  embedUrl: string;
  onExit: () => void;
}

export function GameViewer({ title, embedUrl, onExit }: GameViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use our proxy to fetch the HTML content
        const proxyUrl = `/api/proxy-game?url=${encodeURIComponent(embedUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to fetch game content (Status: ${response.status})`);
        }
        
        let html = await response.text();
        
        if (!html || html.trim().length === 0) {
          throw new Error('Received empty response from game server');
        }
        
        // Calculate the base URL (the directory of the index.html)
        const baseUrl = embedUrl.substring(0, embedUrl.lastIndexOf('/') + 1);
        
        // Inject the <base> tag to fix relative paths
        // We insert it right after the <head> tag or at the beginning of the document
        const baseTag = `<base href="${baseUrl}">`;
        
        // Remove any existing base tags to avoid conflicts
        html = html.replace(/<base[^>]*>/gi, '');
        
        if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>${baseTag}`);
        } else if (html.includes('<HEAD>')) {
          html = html.replace('<HEAD>', `<HEAD>${baseTag}`);
        } else if (html.includes('<html>')) {
          html = html.replace('<html>', `<html><head>${baseTag}</head>`);
        } else {
          html = `<html><head>${baseTag}</head><body>${html}</body></html>`;
        }

        if (iframeRef.current) {
          // Clear the iframe first to ensure a clean load
          iframeRef.current.srcdoc = '';
          // Small delay to ensure the clear is processed
          setTimeout(() => {
            if (iframeRef.current) {
              iframeRef.current.srcdoc = html;
            }
          }, 50);
        }
      } catch (err) {
        console.error('Error loading game:', err);
        setError(err instanceof Error ? err.message : 'The game could not be loaded. This might be due to network restrictions or a broken link.');
        setLoading(false);
      }
    };

    loadGame();
    
    // Safety timeout
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 15000);

    return () => clearTimeout(timeout);
  }, [embedUrl, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }
  };

  return (
    <div className="w-full h-full bg-black flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-bold text-sm tracking-tight text-zinc-100 uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
            title="Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
          <button 
            onClick={() => window.open(embedUrl, '_blank')}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
            title="Open in New Tab"
          >
            <ExternalLink size={18} />
          </button>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <button 
            onClick={onExit}
            className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-zinc-400 transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative bg-[#0c0c0e]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0c0e] z-20">
            <Loader2 className="text-indigo-500 animate-spin mb-4" size={48} />
            <p className="text-zinc-400 font-medium animate-pulse">Loading game assets...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0c0e] z-20 p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Connection Blocked</h3>
            <p className="text-zinc-500 max-w-md mb-8">{error}</p>
            <div className="flex gap-4">
              <button 
                onClick={handleRefresh}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                <RefreshCcw size={18} />
                Try Again
              </button>
              <button 
                onClick={onExit}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        <iframe 
          ref={iframeRef}
          title={title}
          onLoad={() => setLoading(false)}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads allow-storage-access-by-user-activation allow-pointer-lock allow-modals"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Footer Info */}
      <div className="h-8 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between px-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
        <span>Catsweater Proxy Mode Active</span>
        <div className="flex gap-4">
          <span>Secure Connection</span>
          <span>Bypass Protocol</span>
        </div>
      </div>
    </div>
  );
}
