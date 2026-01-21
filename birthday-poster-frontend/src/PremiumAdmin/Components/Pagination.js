import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronLeft, ChevronRight, List, Grid, Loader } from 'react-feather';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding: 16px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button`
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1.5px solid ${props => props.$active ? '#1A1A1A' : '#EEE'};
  background: ${props => props.$active ? '#1A1A1A' : 'white'};
  color: ${props => props.$active ? 'white' : '#1A1A1A'};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    border-color: #1A1A1A;
    background: ${props => props.$active ? '#1A1A1A' : '#FAFAFA'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageSizeSelect = styled.select`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1.5px solid #EEE;
  background: white;
  color: #1A1A1A;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:hover {
    border-color: #DDD;
  }

  &:focus {
    border-color: #1A1A1A;
  }
`;

const ViewModeToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: #F5F5F5;
  border-radius: 10px;
`;

const ViewButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? '#1A1A1A' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#1A1A1A' : '#E5E5E5'};
  }
`;

const ScrollModeToggle = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: 1.5px solid ${props => props.$active ? '#1A1A1A' : '#EEE'};
  background: ${props => props.$active ? '#1A1A1A' : 'white'};
  color: ${props => props.$active ? 'white' : '#1A1A1A'};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: #1A1A1A;
    background: ${props => props.$active ? '#1A1A1A' : '#FAFAFA'};
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid #EEE;
  background: white;
  color: #1A1A1A;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;

  &:hover:not(:disabled) {
    border-color: #1A1A1A;
    background: #FAFAFA;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Pagination = ({ 
  // New API props
  currentPage, 
  totalPages, 
  total, 
  limit, 
  onPageChange, 
  onLimitChange,
  showPageSize = true,
  viewMode = 'table', // 'table' or 'grid'
  onViewModeChange,
  scrollMode = false, // true for infinite scroll
  onScrollModeChange,
  onLoadMore,
  loadingMore = false,
  hasMore = false,
  // Legacy API props (for backward compatibility)
  totalItems,
  itemsPerPage,
  onItemsPerPageChange
}) => {
  // Support both new and legacy APIs
  const finalTotal = total !== undefined ? total : (totalItems || 0);
  const finalLimit = limit !== undefined ? limit : (itemsPerPage || 10);
  const finalTotalPages = totalPages !== undefined ? totalPages : Math.ceil(finalTotal / finalLimit);
  const finalOnLimitChange = onLimitChange || onItemsPerPageChange;
  
  const startItem = finalTotal === 0 ? 0 : (currentPage - 1) * finalLimit + 1;
  const endItem = Math.min(currentPage * finalLimit, finalTotal);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (finalTotalPages <= maxVisible) {
      for (let i = 1; i <= finalTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(finalTotalPages);
      } else if (currentPage >= finalTotalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = finalTotalPages - 4; i <= finalTotalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(finalTotalPages);
      }
    }
    
    return pages;
  };

  // Don't show pagination if no data
  if (finalTotal === 0) {
    return null;
  }

  // Show pagination only if:
  // 1. There are multiple pages, OR
  // 2. Scroll mode is enabled, OR
  // 3. View mode toggle is provided, OR
  // 4. Scroll mode toggle is provided
  // For legacy API, always show if there's data (backward compatibility)
  const shouldShow = finalTotalPages > 1 || scrollMode || onViewModeChange || onScrollModeChange || (totalItems !== undefined && finalTotal > 0);
  
  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <PaginationContainer>
        <PaginationInfo>
          <span>
            Showing {startItem} to {endItem} of {finalTotal} results
          </span>
          {showPageSize && !scrollMode && finalOnLimitChange && (
            <>
              <span>|</span>
              <span>Show:</span>
              <PageSizeSelect value={finalLimit} onChange={(e) => finalOnLimitChange(parseInt(e.target.value))}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </PageSizeSelect>
            </>
          )}
          {onViewModeChange && (
            <>
              <span>|</span>
              <ViewModeToggle>
                <ViewButton
                  $active={viewMode === 'table'}
                  onClick={() => onViewModeChange('table')}
                  title="Table View"
                >
                  <List size={18} />
                </ViewButton>
                <ViewButton
                  $active={viewMode === 'grid'}
                  onClick={() => onViewModeChange('grid')}
                  title="Grid View"
                >
                  <Grid size={18} />
                </ViewButton>
              </ViewModeToggle>
            </>
          )}
          {onScrollModeChange && (
            <>
              <span>|</span>
              <ScrollModeToggle
                $active={scrollMode}
                onClick={() => onScrollModeChange(!scrollMode)}
                title={scrollMode ? "Switch to Pagination" : "Switch to Infinite Scroll"}
              >
                {scrollMode ? 'Pagination' : 'Infinite Scroll'}
              </ScrollModeToggle>
            </>
          )}
        </PaginationInfo>
        
        {!scrollMode && finalTotalPages > 1 && (
          <PaginationControls>
            <PageButton
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </PageButton>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} style={{ padding: '0 8px', color: '#999' }}>...</span>
              ) : (
                <PageButton
                  key={page}
                  $active={currentPage === page}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PageButton>
              )
            ))}
            
            <PageButton
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === finalTotalPages || finalTotalPages === 0}
            >
              <ChevronRight size={18} />
            </PageButton>
          </PaginationControls>
        )}
      </PaginationContainer>
      
      {scrollMode && hasMore && finalTotal > 0 && (
        <LoadMoreButton onClick={onLoadMore} disabled={loadingMore}>
          {loadingMore ? (
            <>
              <Loader size={16} style={{ animation: `${spin} 1s linear infinite` }} />
              Loading more...
            </>
          ) : (
            'Load More'
          )}
        </LoadMoreButton>
      )}
    </>
  );
};

export default Pagination;
