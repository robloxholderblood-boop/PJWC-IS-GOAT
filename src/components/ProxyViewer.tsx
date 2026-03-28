import React, { useState, useRef, useEffect } from 'react';
import { Globe, ArrowRight, RotateCcw, Shield, Lock, Loader2, AlertCircle, ExternalLink, X, Maximize2 } from 'lucide-react';

interface ProxyViewerProps {
  onExit: () => void;
}

export function ProxyViewer({ onExit }: ProxyViewerProps) {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setActiveUrl(targetUrl);
    setLoading(true);
    setError(null);
  };

  useEffect(() => {
    if (!activeUrl) return;

    const loadProxiedContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const proxyUrl = `/api/proxy-game?url=${encodeURIComponent(activeUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to reach site (Status: ${response.status})`);
        }
        
        let html = await response.text();
        
        if (!html || html.trim().length === 0) {
          throw new Error('Received empty response from server');
        }
        
        // Calculate base URL
        const baseUrl = activeUrl.endsWith('/') ? activeUrl : activeUrl.substring(0, activeUrl.lastIndexOf('/') + 1);
        const baseTag = `<base href="${baseUrl}">`;
        
        // Inject base tag and security headers
        html = html.replace(/<base[^>]*>/gi, '');
        if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>${baseTag}`);
        } else if (html.includes('<HEAD>')) {
          html = html.replace('<HEAD>', `<HEAD>${baseTag}`);
        } else {
          html = baseTag + html;
        }

        if (iframeRef.current) {
          iframeRef.current.srcdoc = html;
        }
      } catch (err) {
        console.error('Proxy error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred while proxying the site.');
        setLoading(false);
      }
    };

    loadProxiedContent();
    
    const timeout = setTimeout(() => setLoading(false), 20000);
    return () => clearTimeout(timeout);
  }, [activeUrl]);

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }
  };

  return (
    <div className="w-full h-full bg-[#09090b] flex flex-col overflow-hidden">
      {/* Proxy Header/Address Bar */}
      <div className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center gap-4 px-6 z-10">
        <div className="flex items-center gap-2 text-indigo-500">
          <Shield size={20} />
          <span className="font-bold text-xs uppercase tracking-widest hidden md:inline">Secure Proxy</span>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-3xl relative group">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
          <input 
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to browse (e.g. google.com)"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-200"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="flex items-center gap-2">
          {activeUrl && (
            <>
              <button 
                onClick={toggleFullscreen}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                title="Fullscreen"
              >
                <Maximize2 size={18} />
              </button>
              <button 
                onClick={() => setActiveUrl(activeUrl)}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                title="Refresh"
              >
                <RotateCcw size={18} />
              </button>
              <button 
                onClick={() => window.open(activeUrl, '_blank')}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                title="Open Original"
              >
                <ExternalLink size={18} />
              </button>
            </>
          )}
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <button 
            onClick={onExit}
            className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-zinc-400 transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Browser Area */}
      <div className="flex-1 relative bg-white">
        {!activeUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] p-8 text-center">
            <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
              <Globe className="text-indigo-500" size={40} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">ANONYMOUS BROWSING</h2>
            <p className="text-zinc-500 max-w-md mb-8 leading-relaxed">
              Enter any URL above to browse the web through our secure bypass proxy. Perfect for accessing blocked sites at school or work.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
              {['google.com', 'wikipedia.org', 'github.com', 'reddit.com', 'youtube.com', 'twitter.com'].map(site => (
                <button 
                  key={site}
                  onClick={() => { setUrl(site); setActiveUrl('https://' + site); }}
                  className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white text-sm font-medium"
                >
                  {site}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-20">
                <Loader2 className="text-indigo-500 animate-spin mb-4" size={48} />
                <p className="text-zinc-400 font-medium animate-pulse uppercase tracking-widest text-xs">Establishing Secure Tunnel...</p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-20 p-8 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Proxy Connection Failed</h3>
                <p className="text-zinc-500 max-w-md mb-8">{error}</p>
                <button 
                  onClick={() => setActiveUrl(activeUrl)}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                  <RotateCcw size={18} />
                  Retry Connection
                </button>
              </div>
            )}

            <iframe 
              ref={iframeRef}
              title="Proxy Browser"
              onLoad={() => setLoading(false)}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads allow-storage-access-by-user-activation allow-pointer-lock allow-modals"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            />
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between px-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Proxy Active</span>
          </div>
          <span>AES-256 Encrypted</span>
        </div>
        <div className="flex gap-4">
          <span>IP Masked</span>
          <span>{activeUrl || 'Idle'}</span>
        </div>
      </div>
    </div>
  );
}
