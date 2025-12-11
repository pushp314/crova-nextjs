'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Category {
    id: string;
    name: string;
}

interface ProductSearchProps {
    categories: Category[];
    className?: string;
    onSearchResults?: (products: unknown[]) => void;
}

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A-Z' },
];

export function ProductSearch({ categories, className, onSearchResults }: ProductSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance');
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get('minPrice')) || 0,
        Number(searchParams.get('maxPrice')) || 10000,
    ]);
    const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce the search query
    const [debouncedQuery] = useDebounce(query, 500);

    // Build search URL and trigger search
    const performSearch = useCallback(async () => {
        if (!debouncedQuery && selectedCategory === 'all') return;

        setIsSearching(true);

        const params = new URLSearchParams();
        if (debouncedQuery) params.set('q', debouncedQuery);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (sortBy !== 'relevance') params.set('sortBy', sortBy);
        if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
        if (priceRange[1] < 10000) params.set('maxPrice', priceRange[1].toString());
        if (inStock) params.set('inStock', 'true');

        try {
            const response = await fetch(`/api/search?${params.toString()}`);
            if (response.ok && onSearchResults) {
                const products = await response.json();
                onSearchResults(products);
            }
        } finally {
            setIsSearching(false);
        }
    }, [debouncedQuery, selectedCategory, sortBy, priceRange, inStock, onSearchResults]);

    // Trigger search on debounced query change
    useEffect(() => {
        if (debouncedQuery || selectedCategory !== 'all') {
            performSearch();
        }
    }, [debouncedQuery, selectedCategory, sortBy, priceRange, inStock, performSearch]);

    // Clear all filters
    const clearFilters = () => {
        setQuery('');
        setSelectedCategory('all');
        setSortBy('relevance');
        setPriceRange([0, 10000]);
        setInStock(false);
    };

    // Count active filters
    const activeFilterCount = [
        selectedCategory !== 'all',
        priceRange[0] > 0 || priceRange[1] < 10000,
        inStock,
    ].filter(Boolean).length;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search Bar Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Category Select */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Sort Select */}
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Filter Button (Mobile) */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="sm:hidden relative">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 justify-center">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px]">
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-6 mt-6">
                            {/* Price Range */}
                            <div className="space-y-4">
                                <Label>Price Range</Label>
                                <Slider
                                    value={priceRange}
                                    onValueChange={(value) => setPriceRange(value as [number, number])}
                                    min={0}
                                    max={10000}
                                    step={100}
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>₹{priceRange[0]}</span>
                                    <span>₹{priceRange[1]}</span>
                                </div>
                            </div>

                            {/* In Stock */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    checked={inStock}
                                    onChange={(e) => setInStock(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="inStock">In Stock Only</Label>
                            </div>

                            {/* Clear Filters */}
                            <Button variant="outline" className="w-full" onClick={clearFilters}>
                                Clear All Filters
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Filters Row */}
            <div className="hidden sm:flex items-center gap-4">
                {/* Price Range */}
                <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">Price:</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-24 h-8"
                            placeholder="Min"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-24 h-8"
                            placeholder="Max"
                        />
                    </div>
                </div>

                {/* In Stock */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="inStockDesktop"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="inStockDesktop" className="text-sm">In Stock</Label>
                </div>

                {/* Active Filters */}
                {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear Filters ({activeFilterCount})
                    </Button>
                )}

                {/* Loading Indicator */}
                {isSearching && (
                    <span className="text-sm text-muted-foreground">Searching...</span>
                )}
            </div>
        </div>
    );
}
