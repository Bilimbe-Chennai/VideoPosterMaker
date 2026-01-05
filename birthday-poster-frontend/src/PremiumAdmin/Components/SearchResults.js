import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FileText, Users, Image, Calendar, ChevronRight } from 'react-feather';
import useAxios from '../../useAxios';

const SearchContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.card};
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
  display: ${({ $show }) => $show ? 'block' : 'none'};
  animation: slideDown 0.2s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderLight};
    border-radius: 3px;
  }
`;

const SearchSection = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPurple};
  }
`;

const ResultIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color || 'rgba(102, 126, 234, 0.1)'};
  color: ${({ iconColor }) => iconColor || '#667eea'};
  flex-shrink: 0;
`;

const ResultContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultSubtitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultArrow = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
`;

const LoadingText = styled.p`
  margin: 0;
  font-size: 14px;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textLight};
`;

const HighlightedText = styled.span`
  background: #ffd54f;
  color: #1A1A1A;
  font-weight: 700;
  border-radius: 2px;
  padding: 0 2px;
`;

const SearchResults = ({ query, show, onResultClick }) => {
    const axiosData = useAxios();
    const [results, setResults] = useState({
        templates: [],
        users: [],
        photos: []
    });
    const [loading, setLoading] = useState(false);

    // Fetch search results from API
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query || query.length < 2) {
                setResults({ templates: [], users: [], photos: [] });
                return;
            }

            setLoading(true);
            try {
                const searchRegex = query.toLowerCase();

                // Fetch all data in parallel
                const [templatesRes, usersRes, photosRes] = await Promise.all([
                    axiosData.get('/photomerge/templates'),
                    axiosData.get('/users/'),
                    axiosData.get('/upload/all')
                ]);

                // Filter templates
                const filteredTemplates = (templatesRes.data || [])
                    .filter(t =>
                        t.templatename?.toLowerCase().includes(searchRegex) ||
                        t.accessType?.toLowerCase().includes(searchRegex)
                    )
                    .slice(0, 5)
                    .map(t => ({
                        id: t._id,
                        name: t.templatename,
                        category: t.accessType || 'Photo Merge',
                        date: t.createdDate ? new Date(t.createdDate).toLocaleDateString() : 'N/A'
                    }));

                // Filter users (Admin/App Users)
                const filteredUsers = (usersRes.data?.data || [])
                    .filter(u =>
                        u.name?.toLowerCase().includes(searchRegex) ||
                        u.email?.toLowerCase().includes(searchRegex) ||
                        u.mobile?.includes(query)
                    )
                    .map(u => ({
                        id: u._id,
                        name: u.name || 'Unknown',
                        email: u.email || 'N/A',
                        type: u.type || 'staff',
                        source: 'user'
                    }));

                // AGGREGATE Unique Customers from posters (Matches Customers.js logic)
                const posterData = (photosRes.data || []).filter(item => item.source === 'Photo Merge App');
                const customersMap = {};

                posterData.forEach(item => {
                    const phone = item.whatsapp || item.mobile || '';
                    const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
                    if (!customersMap[key]) {
                        customersMap[key] = {
                            id: item._id,
                            name: item.name || 'Anonymous',
                            email: item.email || 'N/A',
                            phone: phone || 'N/A',
                            type: 'customer',
                            source: 'poster'
                        };
                    }
                });

                const filteredCustomers = Object.values(customersMap)
                    .filter(c =>
                        c.name.toLowerCase().includes(searchRegex) ||
                        c.email.toLowerCase().includes(searchRegex) ||
                        c.phone.includes(query)
                    )
                    .slice(0, 5);

                // Combine results for "Customers" category (Staff + Real Customers)
                const combinedUsers = [...filteredUsers, ...filteredCustomers].slice(0, 10);

                // Filter photos (from Photo Merge App)
                const photoMergePhotos = (photosRes.data || [])
                    .filter(item => item.source === 'Photo Merge App');

                const filteredPhotos = photoMergePhotos
                    .filter(p =>
                        p.name?.toLowerCase().includes(searchRegex) ||
                        p.template_name?.toLowerCase().includes(searchRegex) ||
                        p.templatename?.toLowerCase().includes(searchRegex) ||
                        p.whatsapp?.includes(query) ||
                        p.mobile?.includes(query)
                    )
                    .slice(0, 5)
                    .map(p => ({
                        id: p._id,
                        name: p.name || 'Anonymous',
                        template: p.template_name || p.templatename || p.type || 'Custom',
                        date: p.date || p.createdAt ? new Date(p.date || p.createdAt).toLocaleDateString() : 'N/A'
                    }));

                setResults({
                    templates: filteredTemplates,
                    users: combinedUsers,
                    photos: filteredPhotos
                });
            } catch (error) {
                console.error('Error fetching search results:', error);
                setResults({ templates: [], users: [], photos: [] });
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query, axiosData]);

    const hasResults = results.templates.length > 0 ||
        results.users.length > 0 ||
        results.photos.length > 0;

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const parts = String(text).split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ?
                <HighlightedText key={index}>{part}</HighlightedText> : part
        );
    };

    return (
        <SearchContainer $show={show && query.length > 0}>
            {loading && !hasResults ? (
                <LoadingText>Searching...</LoadingText>
            ) : !hasResults && !loading ? (
                <EmptyState>
                    <EmptyText>No results found for "{query}"</EmptyText>
                </EmptyState>
            ) : (
                <>
                    {loading && hasResults && (
                        <div style={{ padding: '8px 16px', fontSize: '12px', color: '#A0A0A0', background: 'rgba(0,0,0,0.02)' }}>
                            Updating results...
                        </div>
                    )}
                    {results.templates.length > 0 && (
                        <SearchSection>
                            <SectionTitle>Templates</SectionTitle>
                            {results.templates.map(template => (
                                <ResultItem
                                    key={template.id}
                                    onClick={() => onResultClick('template', template)}
                                >
                                    <ResultIcon color="rgba(102, 126, 234, 0.1)" iconColor="#667eea">
                                        <FileText size={18} />
                                    </ResultIcon>
                                    <ResultContent>
                                        <ResultTitle>{highlightText(template.name, query)}</ResultTitle>
                                        <ResultSubtitle>
                                            {highlightText(template.category, query)} • {highlightText(template.date, query)}
                                        </ResultSubtitle>
                                    </ResultContent>
                                    <ResultArrow>
                                        <ChevronRight size={16} />
                                    </ResultArrow>
                                </ResultItem>
                            ))}
                        </SearchSection>
                    )}

                    {results.users.length > 0 && (
                        <SearchSection>
                            <SectionTitle>Users</SectionTitle>
                            {results.users.map(user => (
                                <ResultItem
                                    key={user.id}
                                    onClick={() => onResultClick('user', user)}
                                >
                                    <ResultIcon color="rgba(34, 197, 94, 0.1)" iconColor="#22c55e">
                                        <Users size={18} />
                                    </ResultIcon>
                                    <ResultContent>
                                        <ResultTitle>{highlightText(user.name, query)}</ResultTitle>
                                        <ResultSubtitle>
                                            {highlightText(user.email, query)} • {highlightText(user.type, query)}
                                        </ResultSubtitle>
                                    </ResultContent>
                                    <ResultArrow>
                                        <ChevronRight size={16} />
                                    </ResultArrow>
                                </ResultItem>
                            ))}
                        </SearchSection>
                    )}

                    {results.photos.length > 0 && (
                        <SearchSection>
                            <SectionTitle>Photos</SectionTitle>
                            {results.photos.map(photo => (
                                <ResultItem
                                    key={photo.id}
                                    onClick={() => onResultClick('photo', photo)}
                                >
                                    <ResultIcon color="rgba(251, 191, 36, 0.1)" iconColor="#fbbf24">
                                        <Image size={18} />
                                    </ResultIcon>
                                    <ResultContent>
                                        <ResultTitle>{highlightText(photo.name, query)}</ResultTitle>
                                        <ResultSubtitle>
                                            {highlightText(photo.template, query)} • {highlightText(photo.date, query)}
                                        </ResultSubtitle>
                                    </ResultContent>
                                    <ResultArrow>
                                        <ChevronRight size={16} />
                                    </ResultArrow>
                                </ResultItem>
                            ))}
                        </SearchSection>
                    )}
                </>
            )}
        </SearchContainer>
    );
};

export default SearchResults;
