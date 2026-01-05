import React, { useState } from 'react';
import styled from 'styled-components';
import Card from '../Components/Card';
import { Plus, Edit, Trash2, Eye, Calendar, Users, Percent } from 'react-feather';

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

const promotionsData = [
  {
    id: 1,
    title: 'Festival Discount',
    description: 'Special discount for Diwali festival',
    type: 'percentage',
    value: '20%',
    code: 'DIWALI20',
    startDate: '2024-10-20',
    endDate: '2024-11-05',
    customers: '1,245',
    status: 'active',
    color: '#E8DFF1'
  },
  {
    id: 2,
    title: 'New Customer Offer',
    description: 'Welcome discount for new customers',
    type: 'fixed',
    value: '₹500',
    code: 'WELCOME500',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    customers: '842',
    status: 'active',
    color: '#EEF6E8'
  },
  {
    id: 3,
    title: 'Clearance Sale',
    description: 'End of season clearance',
    type: 'percentage',
    value: '40%',
    code: 'CLEAR40',
    startDate: '2024-08-15',
    endDate: '2024-08-30',
    customers: '2,184',
    status: 'expired',
    color: '#FCEADF'
  },
  {
    id: 4,
    title: 'Weekend Special',
    description: 'Special weekend discounts',
    type: 'percentage',
    value: '15%',
    code: 'WEEKEND15',
    startDate: '2024-09-01',
    endDate: '2024-12-31',
    customers: '956',
    status: 'active',
    color: '#F4E6F0'
  },
];

const Promotions = () => {
  const [promotions] = useState(promotionsData);

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
        {promotions.map((promo) => (
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
