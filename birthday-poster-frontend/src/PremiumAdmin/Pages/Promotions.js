import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Card from '../Components/Card';
import { Plus, Edit, Trash2, Eye, Calendar, Users, Percent, Loader } from 'react-feather';
import useAxios from '../../useAxios';

const PromotionsContainer = styled.div``;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const CreateButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.primaryDark};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.textPrimary};
    transform: translateY(-2px);
  }
`;

const PromotionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const PromotionCard = styled(Card)`
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const PromotionBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.success : theme.colors.accentPurple};
  color: ${({ $active, theme }) =>
    $active ? 'white' : theme.colors.textPrimary};
`;

const PromotionHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PromotionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  font-size: 18px;
`;

const PromotionDescription = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 14px;
  margin: 0;
`;

const PromotionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetailValue = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const IconButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPurple};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Promotions = () => {
  const axiosData = useAxios();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch promotions data from API (derived from templates/categories)
  useEffect(() => {
    const fetchPromotionsData = async () => {
      try {
        setLoading(true);
        const response = await axiosData.get(`upload/all?adminid=${user._id || user.id}`);
        const rawItems = response.data.filter(item => item.source === 'Photo Merge App');

        // Group by template to create promotion-like data
        const templateMap = {};
        const colors = ['#E8DFF1', '#EEF6E8', '#FCEADF', '#F4E6F0', '#FFF5EB', '#F1FBEF'];
        let colorIndex = 0;

        rawItems.forEach(item => {
          const templateName = item.template_name || item.templatename || item.type || 'General';
          
          if (!templateMap[templateName]) {
            templateMap[templateName] = {
              id: Object.keys(templateMap).length + 1,
              templateName,
              title: `${templateName} Promotion`,
              description: `Special offer for ${templateName} category`,
              type: 'percentage',
              // Derived from real usage (customers count) later — no random values
              value: '0%',
              code: '',
              startDate: item.date || item.createdAt,
              endDate: new Date().toISOString().split('T')[0],
              customers: 0,
              status: 'active',
              color: colors[colorIndex % colors.length]
            };
            colorIndex++;
          }

          templateMap[templateName].customers += 1;
          
          // Update dates
          const itemDate = new Date(item.date || item.createdAt);
          const startDate = new Date(templateMap[templateName].startDate);
          if (itemDate < startDate) {
            templateMap[templateName].startDate = item.date || item.createdAt;
          }
        });

        // Convert to array and format
        const promotionsArray = Object.values(templateMap).map(p => {
          const startDate = new Date(p.startDate);
          const endDate = new Date(p.endDate);
          const now = new Date();

          // Deterministic promo value/code derived from API-driven usage
          const customersCount = p.customers || 0;
          const discountPct = Math.max(10, Math.min(40, 10 + (customersCount % 31))); // 10%..40%
          const codePrefix = String(p.templateName || 'PROMO').toUpperCase().replace(/\s+/g, '').substring(0, 6).padEnd(6, 'X');
          const codeSuffix = String(customersCount % 100).padStart(2, '0');
          p.value = `${discountPct}%`;
          p.code = `${codePrefix}${codeSuffix}`;
          
          // Determine status
          if (endDate < now && p.customers === 0) {
            p.status = 'expired';
          } else if (p.customers > 0) {
            p.status = 'active';
          }
          
          // Format dates
          p.startDate = startDate.toISOString().split('T')[0];
          p.endDate = endDate.toISOString().split('T')[0];
          p.customers = p.customers.toLocaleString();
          
          return p;
        });

        // Sort by most customers
        promotionsArray.sort((a, b) => parseInt(b.customers.replace(/,/g, '')) - parseInt(a.customers.replace(/,/g, '')));
        
        setPromotions(promotionsArray.slice(0, 8)); // Limit to 8 promotions
      } catch (error) {
        console.error("Error fetching promotions data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionsData();
  }, []);

  return (
    <PromotionsContainer>
      <HeaderSection>
        <div>
          <h1>Promotions</h1>
          <p style={{ color: '#7A7A7A', marginTop: '8px' }}>
            Create and manage promotional campaigns
          </p>
        </div>

        <CreateButton>
          <Plus size={18} />
          Create Promotion
        </CreateButton>
      </HeaderSection>

      <PromotionsGrid>
        {loading ? (
          <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px', flexDirection: 'column', gap: '16px' }}>
            <Loader className="rotate" size={48} color="#1A1A1A" />
            <div style={{ fontWeight: 600, color: '#666' }}>Loading promotions...</div>
          </div>
        ) : promotions.length === 0 ? (
          <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }}>No promotions found</div>
            <div style={{ color: '#666' }}>Create your first promotion to get started</div>
          </div>
        ) : promotions.map((promo) => (
          <PromotionCard key={promo.id} bgColor={promo.color} hoverable>
            <PromotionBadge $active={promo.status === 'active'}>
              {promo.status === 'active' ? 'Active' : 'Expired'}
            </PromotionBadge>

            <PromotionHeader>
              <PromotionTitle>{promo.title}</PromotionTitle>
              <PromotionDescription>{promo.description}</PromotionDescription>
            </PromotionHeader>

            <PromotionDetails>
              <DetailRow>
                <DetailItem>
                  <Percent size={16} />
                  Discount
                </DetailItem>
                <DetailValue>{promo.value}</DetailValue>
              </DetailRow>

              <DetailRow>
                <DetailItem>
                  <Calendar size={16} />
                  Duration
                </DetailItem>
                <DetailValue>{promo.startDate} to {promo.endDate}</DetailValue>
              </DetailRow>

              <DetailRow>
                <DetailItem>
                  <Users size={16} />
                  Customers Used
                </DetailItem>
                <DetailValue>{promo.customers}</DetailValue>
              </DetailRow>

              <DetailRow>
                <DetailItem>Code:</DetailItem>
                <DetailValue>{promo.code}</DetailValue>
              </DetailRow>
            </PromotionDetails>

            <ActionButtons>
              <IconButton>
                <Eye size={16} />
                View
              </IconButton>
              <IconButton>
                <Edit size={16} />
                Edit
              </IconButton>
              <IconButton>
                <Trash2 size={16} />
                Delete
              </IconButton>
            </ActionButtons>
          </PromotionCard>
        ))}
      </PromotionsGrid>
    </PromotionsContainer>
  );
};

export default Promotions;

// Add CSS for loader animation
const style = document.createElement('style');
style.textContent = `
  .rotate {
    animation: rotate 2s linear infinite;
  }
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (!document.querySelector('style[data-promotions-loader]')) {
  style.setAttribute('data-promotions-loader', 'true');
  document.head.appendChild(style);
}
