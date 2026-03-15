import React from 'react';
import { Search } from 'lucide-react';
import { cn } from './ui/Base';
import { useAppContext } from '../context/AppContext';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const { searchQuery, setSearchQuery } = useAppContext();

  return (
    <div className={cn("relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg", className)}>
      <Search className="absolute left-3 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search on map..."
        className="w-full bg-transparent border-none rounded-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 transition-all"
      />
    </div>
  );
};

export default SearchBar;
