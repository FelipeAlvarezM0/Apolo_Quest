import { useEffect, useState, useMemo, useRef } from 'react';
import { useHistoryStore } from '../store/useHistoryStore';
import { useRequestStore } from '../../request-builder/store/useRequestStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { StatusBadge } from '../../../shared/ui/Badge';
import { Play, Trash2, Clock, Search } from 'lucide-react';
import type { HttpRequest } from '../../../shared/models';

type SortBy = 'date' | 'duration' | 'status';
type SortOrder = 'asc' | 'desc';

export function History() {
  const { entries, loadHistory, clearHistory, deleteEntry } = useHistoryStore();
  const { loadRequest } = useRequestStore();
  const { success } = useToastStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredAndSortedEntries = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const matchesSearch =
        searchTerm === '' ||
        entry.request.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.response.status.toString().includes(searchTerm);

      const matchesMethod = methodFilter === 'all' || entry.request.method === methodFilter;

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const status = entry.response.status;
        switch (statusFilter) {
          case '2xx':
            matchesStatus = status >= 200 && status < 300;
            break;
          case '3xx':
            matchesStatus = status >= 300 && status < 400;
            break;
          case '4xx':
            matchesStatus = status >= 400 && status < 500;
            break;
          case '5xx':
            matchesStatus = status >= 500 && status < 600;
            break;
        }
      }

      return matchesSearch && matchesMethod && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'duration':
          comparison = a.response.timeMs - b.response.timeMs;
          break;
        case 'status':
          comparison = a.response.status - b.response.status;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [entries, searchTerm, sortBy, sortOrder, methodFilter, statusFilter]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleLoadRequest = (request: HttpRequest, environmentId?: string | null) => {
    loadRequest(request, environmentId);
    success('Request loaded in builder');
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    success('History entry deleted');
  };

  const handleClearHistory = () => {
    clearHistory();
    success('History cleared');
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-100">History</h2>
        {entries.length > 0 && (
          <Button
            onClick={handleClearHistory}
            variant="danger"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span className="hidden xs:inline">Clear All</span>
          </Button>
        )}
      </div>

      {entries.length > 0 && (
        <div className="mb-4 sm:mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <Input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by URL, name, or status... (Ctrl+F)"
                className="pl-10"
              />
            </div>
            <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="w-full sm:w-32">
              <option value="all">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-32">
              <option value="all">All Status</option>
              <option value="2xx">2xx Success</option>
              <option value="3xx">3xx Redirect</option>
              <option value="4xx">4xx Client Error</option>
              <option value="5xx">5xx Server Error</option>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="w-full sm:w-40">
              <option value="date">Sort by Date</option>
              <option value="duration">Sort by Duration</option>
              <option value="status">Sort by Status</option>
            </Select>
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="w-full sm:w-40">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            Showing {filteredAndSortedEntries.length} of {entries.length} requests
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Clock size={48} className="mb-3 opacity-50" />
          <p>No history yet</p>
          <p className="text-sm">Request history will appear here</p>
        </div>
      ) : filteredAndSortedEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Search size={48} className="mb-3 opacity-50" />
          <p>No results found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-600 hover:shadow-lg transition-all animate-fade-in"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <span className="text-xs font-mono text-blue-400 w-14 sm:w-16 flex-shrink-0">{entry.request.method}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-300 truncate">{entry.request.url}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{formatDate(entry.timestamp)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <StatusBadge status={entry.response.status} />
                    <span className="text-xs sm:text-sm text-gray-400">{entry.response.timeMs}ms</span>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleLoadRequest(entry.request, entry.environmentId)}
                      className="p-1.5 sm:p-2 text-green-400 hover:text-green-300 transition-colors rounded hover:bg-gray-700"
                      title="Load request in builder"
                    >
                      <Play size={14} className="sm:hidden" />
                      <Play size={16} className="hidden sm:block" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-gray-700"
                      title="Delete entry"
                    >
                      <Trash2 size={14} className="sm:hidden" />
                      <Trash2 size={16} className="hidden sm:block" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
