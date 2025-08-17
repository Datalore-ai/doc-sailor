"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Search,
  Compass,
  ExternalLink,
  Loader2,
  FileText,
  ChevronRight,
  Anchor,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { setupDocs, queryDocs, type QueryResult } from "@/lib/api";
import { Input } from "./ui/input";
import logo from "@/assets/icon512.png"

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  section: string;
  relevanceScore: number;
}

export default function WebDocsSailor() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [Status, setStatus] = useState<string>("");

  // Generate session ID on component mount
  useEffect(() => {
    // Get current active tab's URL (requires "tabs" permission in manifest.json)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url && tabs[0]?.id) {
        try {
          const url = new URL(tabs[0].url);
          setSessionId(tabs[0]?.id);
          setCurrentUrl(`${url.protocol}//${url.hostname}${url.pathname}`);
        } catch (e) {
          console.error("Invalid tab URL", e);
        }
      }
    });
  }, []);

  useEffect(() => {
  const testing_setup = async () => {
    console.log("Effect triggered with:", { sessionId, currentUrl });

    if (sessionId !== null && currentUrl) {
      setIsAnalyzing(true);

      try {
        await setupDocs(
          {
            link: currentUrl,
            session_id: sessionId,
            should_setup_new: false
          },
          (msg) => {
            setStatus(msg);
            console.log("Progress update:", msg);
            if (msg !== "no session exists") {
              setIsAnalyzed(true);
            }
          }
        );
      } catch (err) {
        console.error("setupDocs error:", err);
      } finally {
        setIsAnalyzing(false);
      }

    } else {
      console.warn("Skipping setupDocs — missing sessionId or currentUrl", { sessionId, currentUrl });
    }
  };

  testing_setup();
}, [currentUrl, sessionId]);


  const handleAnalyze = async () => {
    if (!currentUrl) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      await setupDocs(
        {
          link: currentUrl,
          session_id: sessionId,
          should_setup_new: true
        },
        (msg) => {
          setStatus(msg);
          console.log("Progress update:", msg);
          // You can also update your UI here instead of console.log
        }
      );
      setIsAnalyzed(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze documentation"
      );
      console.error("Setup error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() || !isAnalyzed) return;

    setIsSearching(true);
    setHasSearched(true);
    setError(null);

    try {
      const response = await queryDocs({
        query: query.trim(),
        session_id: sessionId,
        max_results: 10,
      });

      // Transform API results to our SearchResult format
      const transformedResults: SearchResult[] = response.result.map(
        (item: QueryResult, index: number) => ({
          id: `result_${index}`,
          title: `Page ${item.page}`,
          url: item.source_link,
          snippet:
            item.content.length > 200
              ? `${item.content.substring(0, 200)}...`
              : item.content,
          section: `Page ${item.page}`,
          relevanceScore: item.similarity
        })
      );

      setResults(transformedResults);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to search documentation"
      );
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // In a real extension, this would open the URL in a new tab
    window.open(result.url, "_blank");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isAnalyzed) {
      handleSearch();
    }
  };

  return (
    <div className="w-[400px] h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2">
            <img className="h-15 w-15" src={logo} alt="logo"/>
          </div>
          <div>
            <div className="font-bold text-4xl">DocSailor</div>
            <p className="text-xs text-slate-400">
              Navigate docs with AI search
            </p>
          </div>
        </div>
      </div>

      {/* Current URL Display */}
      <div className="p-4 pb-2">
        <div className="text-xs text-slate-400 mb-2">Current page:</div>
        <div className="text-sm text-blue-400 truncate bg-slate-800/50 px-2 py-1 rounded">
          {currentUrl}
        </div>
      </div>

      {/* Analyze Section */}
      {!isAnalyzed && (
        <div className="p-4 pt-2">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Documentation...
              </>
            ) : (
              <>
                <Anchor className="w-4 h-4 mr-2" />
                Analyze Documentation
              </>
            )}
          </Button>
          <div className="my-2 font-bold text-white text-center">{Status}</div>
        </div>
      )}

      {/* Success Message */}
      {isAnalyzed && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 px-3 py-2 rounded">
            <CheckCircle className="w-4 h-4" />
            Documentation analyzed successfully!
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Search Section */}
      {isAnalyzed && (
        <div className="p-4 pt-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search through documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Documentation
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results Section */}
      <div className="flex-1 overflow-hidden">
        {isSearching ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p className="text-slate-400">Sailing through documentation...</p>
            </div>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 p-4">
              <FileText className="w-12 h-12 mx-auto text-slate-500" />
              <p className="text-slate-400">No results found</p>
              <p className="text-xs text-slate-500">
                Try different keywords or check your spelling
              </p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="p-4 space-y-3 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
            </div>

            {results.map((result) => (
              <Card
                key={result.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer group"
                onClick={() => handleResultClick(result)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                        {result.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* <Badge
                        variant="secondary"
                        className="text-xs bg-slate-700 text-slate-300"
                      >
                        {result.section}
                      </Badge> */}
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-400">
                          {Math.round(result.relevanceScore * 100)}% match
                        </span>
                      </div>
                    </div>

                    {/* <p className="text-sm text-slate-400 line-clamp-3">
                      {result.snippet}
                    </p> */}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-500 truncate">
                        {result.url}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isAnalyzed ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 p-4">
              <Anchor className="w-12 h-12 mx-auto text-slate-500" />
              <p className="text-slate-400">Ready to analyze documentation</p>
              <p className="text-xs text-slate-500">
                Click "Analyze Documentation" to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 p-4">
              <Compass className="w-12 h-12 mx-auto text-slate-500" />
              <p className="text-slate-400">Ready to sail through docs</p>
              <p className="text-xs text-slate-500">
                Enter your search query above to get started
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
        <p className="text-xs text-slate-500 text-center">
          {isAnalyzed
            ? `tab_id: ${sessionId}`
            : "Powered by neural search • v1.0.0"}
        </p>
      </div>
    </div>
  );
}
