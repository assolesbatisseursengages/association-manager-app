/**
 * Custom hook for pagination
 */

import { useState, useCallback, useMemo } from "react";

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  offset: number;
}

export interface PaginationControls {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

/**
 * Hook for managing pagination state
 */
export function usePagination(initialLimit = 50) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [page, totalPages]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setLimit(initialLimit);
    setTotal(0);
  }, [initialLimit]);

  const canGoNext = page < totalPages;
  const canGoPrevious = page > 1;

  return {
    // State
    page,
    limit,
    total,
    offset,
    totalPages,
    
    // Computed
    canGoNext,
    canGoPrevious,
    hasMore: offset + limit < total,
    
    // Controls
    goToPage,
    nextPage,
    previousPage,
    setLimit: handleSetLimit,
    setTotal,
    reset,
  };
}

/**
 * Hook for pagination with search
 */
export function usePaginationWithSearch(initialLimit = 50) {
  const pagination = usePagination(initialLimit);
  const [search, setSearch] = useState("");

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    pagination.reset(); // Reset pagination when searching
  }, [pagination]);

  return {
    ...pagination,
    search,
    setSearch: handleSearch,
  };
}

/**
 * Hook for pagination with sorting
 */
export function usePaginationWithSort(initialLimit = 50) {
  const pagination = usePagination(initialLimit);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Set new sort field
      setSortBy(field);
      setSortOrder("asc");
    }
    pagination.reset(); // Reset pagination when sorting
  }, [sortBy, pagination]);

  return {
    ...pagination,
    sortBy,
    sortOrder,
    handleSort,
  };
}

/**
 * Hook for pagination with filters
 */
export function usePaginationWithFilters(initialLimit = 50) {
  const pagination = usePagination(initialLimit);
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    pagination.reset(); // Reset pagination when filters change
  }, [pagination]);

  const clearFilters = useCallback(() => {
    setFilters({});
    pagination.reset();
  }, [pagination]);

  return {
    ...pagination,
    filters,
    handleFilterChange,
    clearFilters,
  };
}

/**
 * Pagination info component helper
 */
export function getPaginationInfo(
  page: number,
  limit: number,
  total: number
): string {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `${start}-${end} sur ${total}`;
}

/**
 * Generate page numbers for pagination controls
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | string)[] {
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const leftRange = Array.from(
    { length: Math.max(0, leftSiblingIndex - 1) },
    (_, i) => i + 1
  );
  const rightRange = Array.from(
    { length: Math.max(0, totalPages - rightSiblingIndex) },
    (_, i) => rightSiblingIndex + i + 1
  );

  const pages: (number | string)[] = [];

  // Add first page
  pages.push(1);

  // Add left dots
  if (shouldShowLeftDots) {
    pages.push("...");
  } else if (leftRange.length > 0) {
    pages.push(...leftRange);
  }

  // Add current range
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  // Add right dots
  if (shouldShowRightDots) {
    pages.push("...");
  } else if (rightRange.length > 0) {
    pages.push(...rightRange);
  }

  // Add last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
