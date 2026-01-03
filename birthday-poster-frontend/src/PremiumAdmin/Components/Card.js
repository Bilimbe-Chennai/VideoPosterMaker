import React from 'react';
import styled from 'styled-components';
import { MoreHorizontal } from 'react-feather';

const CardContainer = styled.div`
  background: ${props => props.$dark ? '#1A1A1A' : 'white'};
  border-radius: 32px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  ${({ $hoverable }) => $hoverable && `
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }
  `}
  ${({ $bgColor }) => $bgColor && `background-color: ${$bgColor};`}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${props => props.$dark ? '#FFFFFF' : props.theme.colors.textPrimary};
`;

const CardSubtitle = styled.p`
  font-size: 14px;
  color: ${props => props.$dark ? '#7A7A7A' : props.theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$dark ? '#7A7A7A' : '#999'};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover {
    color: ${props => props.$dark ? '#FFF' : '#333'};
  }
`;

const Card = ({ title, subtitle, children, hoverable, bgColor, dark, ...props }) => {
  return (
    <CardContainer $hoverable={hoverable} $bgColor={bgColor} $dark={dark} {...props}>
      {(title || subtitle) && (
        <CardHeader>
          <div>
            {title && <CardTitle $dark={dark}>{title}</CardTitle>}
            {subtitle && <CardSubtitle $dark={dark}>{subtitle}</CardSubtitle>}
          </div>
          <MenuButton $dark={dark}>
            <MoreHorizontal size={20} />
          </MenuButton>
        </CardHeader>
      )}
      {children}
    </CardContainer>
  );
};

export default Card;
