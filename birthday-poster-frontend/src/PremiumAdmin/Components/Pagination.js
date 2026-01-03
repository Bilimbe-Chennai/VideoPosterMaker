import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, ChevronDown } from 'react-feather';

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px 24px;
  gap: 24px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  border-top: 1px solid #F5F5F5;
  background: white;
`;

const RowsPerPage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledSelect = styled.select`
  appearance: none;
  background: #F8F9FA;
  border: none;
  border-radius: 12px;
  padding: 6px 32px 6px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #1A1A1A;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:hover {
    background: #F0F2F5;
  }
`;

const SelectIcon = styled(ChevronDown)`
  position: absolute;
  right: 10px;
  pointer-events: none;
  color: #999;
`;

const PageInfo = styled.div`
  color: #666;
  min-width: 80px;
  text-align: center;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: ${props => props.disabled ? '#CCC' : '#666'};
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.disabled ? 'transparent' : '#F5F5F5'};
    color: ${props => props.disabled ? '#CCC' : '#1A1A1A'};
  }
`;

const Pagination = ({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
    onItemsPerPageChange
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startRange = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endRange = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalItems === 0) return null;

    return (
        <PaginationContainer>
            <RowsPerPage>
                <span>Rows per page:</span>
                <SelectWrapper>
                    <StyledSelect
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    >
                        {[5, 10, 20, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </StyledSelect>
                    <SelectIcon size={14} />
                </SelectWrapper>
            </RowsPerPage>

            <PageInfo>
                {startRange}-{endRange} of {totalItems}
            </PageInfo>

            <NavButtons>
                <NavButton
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    title="Previous Page"
                >
                    <ChevronLeft size={20} />
                </NavButton>
                <NavButton
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    title="Next Page"
                >
                    <ChevronRight size={20} />
                </NavButton>
            </NavButtons>
        </PaginationContainer>
    );
};

export default Pagination;
