import React from 'react';
import styled from 'styled-components';
import Card from './Card';
import { Info } from 'react-feather';

const PlaceholderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentPurple + '30'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primaryDark};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Placeholder = ({ title }) => {
    return (
        <Card>
            <PlaceholderContainer>
                <IconWrapper>
                    <Info size={40} />
                </IconWrapper>
                <h2>{title} Page</h2>
                <p style={{ color: '#7A7A7A', marginTop: '12px' }}>
                    This module is currently under development. Please check back later.
                </p>
            </PlaceholderContainer>
        </Card>
    );
};

export default Placeholder;
