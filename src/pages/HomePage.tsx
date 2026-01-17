import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { getAllLoops } from "../lib/storage";
import type { Loop } from "../types";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const loops = useMemo(() => {
    try {
      return getAllLoops().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Error loading loops:", error);
      return [];
    }
  }, []);

  const filteredLoops = useMemo(() => {
    if (!searchQuery.trim()) return loops;

    const query = searchQuery.toLowerCase();
    return loops.filter(
      (loop) =>
        loop.title.toLowerCase().includes(query) ||
        loop.situation.toLowerCase().includes(query) ||
        loop.emotion.toLowerCase().includes(query),
    );
  }, [loops, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero Section */}
      <div className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-medium text-white mb-5 tracking-tight">
              Welcome to LoopBack
            </h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">
              A simple tool to help you process difficult situations, identify
              what matters, and take meaningful steps forward.
            </p>
            <Link
              to="/loop/new"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-600/90 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            >
              <PlusIcon className="w-4 h-4 mr-2" aria-hidden="true" />
              Start a Loop
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-10">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon
                className="h-4 w-4 text-gray-500"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search loops by title, situation, or emotion..."
              className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-800 rounded-md bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-colors"
              aria-label="Search loops"
            />
          </div>
        </div>

        {/* Loops List */}
        <div>
          <h2 className="text-lg font-medium text-gray-300 mb-6">
            {searchQuery
              ? `Search Results (${filteredLoops.length})`
              : "Recent Loops"}
          </h2>

          {filteredLoops.length === 0 ? (
            <div className="text-center pt-16 pb-10">
              {searchQuery ? (
                <>
                  <p className="text-gray-500 text-sm mb-4">
                    No loops found matching your search.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-sm mb-6">
                    You haven't created any loops yet.
                  </p>
                  <Link
                    to="/loop/new"
                    className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-600/90 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                    Create Your First Loop
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredLoops.map((loop) => (
                <LoopCard key={loop.id} loop={loop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoopCard({ loop }: { loop: Loop }) {
  return (
    <Link
      to={`/loop/${loop.id}`}
      className="block p-5 bg-gray-900/50 border border-gray-800/50 rounded-md hover:border-gray-700/50 hover:bg-gray-900 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-medium text-white pr-4">{loop.title}</h3>
        <time className="text-xs text-gray-500 whitespace-nowrap shrink-0">
          {formatDistanceToNow(new Date(loop.createdAt), { addSuffix: true })}
        </time>
      </div>
      <div className="space-y-2.5">
        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
          {loop.situation}
        </p>
        <p>
          <span className="inline-block px-2.5 py-1 bg-gray-800/50 border border-gray-800 rounded-md text-xs text-gray-400">
            {loop.emotion}
          </span>
        </p>
      </div>
    </Link>
  );
}
