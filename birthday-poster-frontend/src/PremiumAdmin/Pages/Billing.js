import React, { useState } from 'react';
import styled from 'styled-components';
import Card from '../Components/Card';
import {
    FileText,
    Download,
    MapPin,
    Edit2,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle
} from 'react-feather';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  
  h1 {
    font-size: 32px;
    font-weight: 800;
    color: #1A1A1A;
    margin-bottom: 8px;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 16px;
  }
`;

const BillingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 32px;
  margin-bottom: 48px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const AddressCard = styled(Card)`
  padding: 32px;
  background: white;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1A1A1A;
`;

const AddressContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AddressInfo = styled.div`
  display: flex;
  gap: 16px;
  
  .icon {
    width: 40px;
    height: 40px;
    background: rgba(101, 52, 255, 0.05);
    color: #6534FF;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .details {
    h4 {
      font-size: 14px;
      color: #7A7A7A;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    p {
      font-size: 16px;
      font-weight: 600;
      color: #1A1A1A;
      line-height: 1.5;
    }
  }
`;

const EditButton = styled.button`
  position: absolute;
  top: 32px;
  right: 32px;
  background: transparent;
  border: 1px solid #F0F0F0;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #FAFAFA;
    border-color: #E0E0E0;
  }
`;

const InvoicesSection = styled.div`
  margin-top: 48px;
`;

const InvoicesTable = styled.div`
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 100px;
  padding: 20px 32px;
  align-items: center;
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.header {
    background: #FAFAFA;
    font-weight: 700;
    font-size: 13px;
    color: #7A7A7A;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const StatusChip = styled.span`
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ $status }) => $status === 'paid' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)'};
  color: ${({ $status }) => $status === 'paid' ? '#4CAF50' : '#FF9800'};
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const PeriodBadge = styled.span`
    background: ${({ theme }) => theme.colors.accentPurple};
    color: ${({ theme }) => theme.colors.primaryDark};
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
    font-family: 'Inter', sans-serif;
`;

const DownloadBtn = styled.button`
  background: transparent;
  border: none;
  color: #6534FF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const Billing = () => {
    const [address] = useState({
        companyName: 'Varamahalakshmi Silks',
        address: '123 Royal Silk Lane, Kanchipuram, Tamil Nadu 631501',
        gstin: '33AAAAA0000A1Z5',
        plan: 'Pro Plan (Monthly)',
        planEndDate: 'Jan 01, 2024'
    });

    const [invoices] = useState([
        {
            id: 'INV-2023-001',
            date: '2023-12-01',
            period: 'Dec 01 - Jan 01',
            amount: '₹2,499',
            status: 'paid'
        },
        {
            id: 'INV-2023-002',
            date: '2023-11-01',
            period: 'Nov 01 - Dec 01',
            amount: '₹2,499',
            status: 'paid'
        }
    ]);

    return (
        <PageContainer>
            <PageHeader>
                <h1>Billing & Invoices</h1>
                <p>Manage your billing details and view your subscription history.</p>
            </PageHeader>

            <BillingGrid>
                <AddressCard>
                    <CardTitle><MapPin size={20} /> Billing Address</CardTitle>
                    <EditButton><Edit2 size={14} /> Edit Details</EditButton>
                    <AddressContent>
                        <AddressInfo>
                            <div className="icon"><FileText size={20} /></div>
                            <div className="details">
                                <h4>Company Name</h4>
                                <p>{address.companyName}</p>
                            </div>
                        </AddressInfo>
                        <AddressInfo>
                            <div className="icon"><MapPin size={20} /></div>
                            <div className="details">
                                <h4>Address</h4>
                                <p>{address.address}</p>
                            </div>
                        </AddressInfo>
                        <AddressInfo>
                            <div className="icon"><CheckCircle size={20} /></div>
                            <div className="details">
                                <h4>GST / Tax ID</h4>
                                <p>{address.gstin}</p>
                            </div>
                        </AddressInfo>
                    </AddressContent>
                </AddressCard>

                <AddressCard>
                    <CardTitle><Calendar size={20} /> Current Plan</CardTitle>
                    <AddressContent>
                        <AddressInfo>
                            <div className="icon"><Clock size={20} /></div>
                            <div className="details">
                                <h4>Plan Type</h4>
                                <p>{address.plan}</p>
                            </div>
                        </AddressInfo>
                        <AddressInfo>
                            <div className="icon"><Calendar size={20} /></div>
                            <div className="details">
                                <h4>Next Billing Date</h4>
                                <p>{address.planEndDate}</p>
                            </div>
                        </AddressInfo>
                    </AddressContent>
                </AddressCard>
            </BillingGrid>

            <InvoicesSection>
                <SectionTitle><FileText size={24} /> Invoice History</SectionTitle>
                <InvoicesTable>
                    <TableRow className="header">
                        <div>Invoice</div>
                        <div>Billing Period</div>
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Action</div>
                    </TableRow>
                    {invoices.map(inv => (
                        <TableRow key={inv.id}>
                            <div style={{ fontWeight: 600 }}>{inv.id}</div>
                            <div><PeriodBadge>{inv.period}</PeriodBadge></div>
                            <div>{inv.date}</div>
                            <div style={{ fontWeight: 700 }}>{inv.amount}</div>
                            <div>
                                <DownloadBtn title="Download Invoice">
                                    <Download size={18} />
                                </DownloadBtn>
                            </div>
                        </TableRow>
                    ))}
                </InvoicesTable>
            </InvoicesSection>
        </PageContainer>
    );
};

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1A1A1A;
`;

export default Billing;
