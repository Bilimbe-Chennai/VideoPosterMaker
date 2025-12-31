import React from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const ProgressItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LabelText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const PercentageText = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primaryDark};
`;

const ProgressBarWrapper = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: 4px;
  width: 100%;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: ${({ $color, theme }) => $color || theme.colors.primaryDark};
  width: ${({ $progress }) => $progress}%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.17, 0.67, 0.83, 0.67);
`;

const data = [
    { label: 'Royal Wedding Saree', progress: 85, color: '#E8DFF1' },
    { label: 'Grand Pattu Collection', progress: 72, color: '#EEF6E8' },
    { label: 'Classic Silk Border', progress: 65, color: '#FCEADF' },
    { label: 'Designer Lehengas', progress: 58, color: '#F4E6F0' },
    { label: 'Ethnic Accessories', progress: 42, color: '#E8F0FE' },
];

const HorizontalProgress = () => {
    return (
        <ProgressContainer>
            {data.map((item, index) => (
                <ProgressItem key={index}>
                    <LabelRow>
                        <LabelText>{item.label}</LabelText>
                        <PercentageText>{item.progress}%</PercentageText>
                    </LabelRow>
                    <ProgressBarWrapper>
                        <ProgressBarFill $progress={item.progress} $color={item.color !== '#E8DFF1' ? item.color : null} />
                    </ProgressBarWrapper>
                </ProgressItem>
            ))}
        </ProgressContainer>
    );
};

export default HorizontalProgress;
