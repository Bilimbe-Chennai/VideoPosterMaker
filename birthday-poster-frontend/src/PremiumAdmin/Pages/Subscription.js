import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Card from '../Components/Card';
import {
    Check,
    X,
    TrendingUp,
    Shield,
    Zap,
    Award,
    Star,
    Users,
    Globe,
    Clock,
    RefreshCw,
    ChevronRight,
    ChevronDown,
    Gift,
    Share2,
    Shield as ShieldIcon
} from 'react-feather';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 52, 52, 0.2); }
  50% { box-shadow: 0 0 40px rgba(255, 113, 52, 0.4); }
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const PageHeader = styled.div`
  margin-bottom: 48px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    font-size: 32px;
    margin-bottom: 12px;
    position: relative;
    display: inline-block;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 18px;
    max-width: 600px;
    line-height: 1.6;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #000000ff 0%, #000000ff 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 30px;
  animation: ${pulse} 2s infinite;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1A1A1A;
  
  svg {
    color: #6534FF;
  }
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 64px;
`;

const CircularProgressBar = ({ percent, color, size = 60, strokeWidth = 6 }) => {
    const radius = size / 2 - strokeWidth;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={`${color}20`}
                strokeWidth={strokeWidth}
                fill="none"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
            />
            <text
                x="50%"
                y="50%"
                dy="0.3em"
                textAnchor="middle"
                style={{
                    fontSize: 12,
                    fontWeight: 800,
                    fill: '#1A1A1A',
                    fontFamily: 'Inter, sans-serif',
                    transform: 'rotate(90deg)',
                    transformOrigin: 'center'
                }}
            >
                {Math.round(percent)}%
            </text>
        </svg>
    );
};

const UsageCard = styled(Card)`
  padding: 24px;
  background-color: ${({ $bg }) => $bg || 'white'};
  border: none;
  box-shadow: none;
  border-radius: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 180px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.05);
  color: #1A1A1A;
`;

const CardLabel = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1A1A1A;
`;

const CardBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #1A1A1A;
  line-height: 1;
`;

const TrendIndicator = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #4CAF50;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
`;

const PlanCard = styled.div`
  background: ${({ $active }) => $active ?
        'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)' :
        'linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%)'};
  color: ${({ $active }) => $active ? 'white' : '#1A1A1A'};
  border-radius: 32px;
  padding: ${({ $active }) => $active ? '40px 32px' : '32px'};
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ $active }) => $active ? 'transparent' : 'rgba(0,0,0,0.05)'};
  box-shadow: ${({ $active }) => $active ?
        '0 20px 60px rgba(255, 52, 52, 0.2)' :
        '0 10px 40px rgba(0,0,0,0.05)'};
  animation: ${({ $active }) => $active ? css`${glow} 3s infinite` : 'none'};
  
  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 40px 80px rgba(255, 96, 52, 0.2);
  }
  
  ${({ $popular }) => $popular && `
    &::before {
      content: '⭐ MOST POPULAR';
      position: absolute;
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      z-index: 10;
      box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
    }
  `}
`;

const PlanBadge = styled.div`
  position: absolute;
  top: 30px;
  right: 20px;
  background: ${({ $active }) => $active ? 'rgba(255,255,255,0.1)' : 'rgba(101, 52, 255, 0.1)'};
  color: ${({ $active }) => $active ? 'white' : '#6534FF'};
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid ${({ $active }) => $active ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
`;

const PlanName = styled.h3`
  font-size: 24px;
  font-weight: 800;
  margin-top: 30px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  svg {
    color: ${({ $active }) => $active ? '#FFD700' : '#6534FF'};
  }
`;

const PlanPrice = styled.div`
  font-size: 56px;
  font-weight: 800;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  
  span {
    font-size: 16px;
    font-weight: 500;
    opacity: ${({ $active }) => $active ? '0.7' : '0.5'};
  }
`;

const PlanPeriod = styled.div`
  font-size: 14px;
  color: ${({ $active }) => $active ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
  margin-top: 8px;
`;

const FeaturesList = styled.ul`
  list-style: none;
  margin: 0 0 40px 0;
  padding: 0;
  flex: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ $active }) => $active ? 'rgba(255,255,255,0.9)' : '#1A1A1A'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  
  svg {
    width: 22px;
    height: 22px;
    color: ${({ $disabled, $active }) =>
        $disabled ? ($active ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') :
            ($active ? '#4CAF50' : '#4CAF50')};
    flex-shrink: 0;
  }
`;

const PlanButton = styled.button`
  width: 100%;
  padding: 20px;
  border-radius: 20px;
  border: none;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  background: ${({ $active, $popular }) =>
        $active ? 'rgba(255,255,255,0.1)' :
            $popular ? 'linear-gradient(135deg, #6534FF 0%, #9B6BFF 100%)' :
                '#1A1A1A'};
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(101, 52, 255, 0.4);
    
    &::after {
      transform: translateX(100%);
    }
  }
  
  &:disabled {
    cursor: default;
    background: ${({ $active }) => $active ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)'};
    color: ${({ $active }) => $active ? 'white' : 'rgba(0,0,0,0.4)'};
    border: ${({ $active }) => $active ? '1px solid rgba(255,255,255,0.2)' : 'none'};
    transform: none;
    box-shadow: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: transform 0.6s;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
  margin: 48px 0;
`;

const FAQSection = styled.div`
  margin-top: 100px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const FAQHeader = styled.div`
  margin-bottom: 60px;
  
  .sub-title {
    font-size: 14px;
    font-weight: 700;
    color: #8E8E93;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    margin-bottom: 12px;
    display: block;
  }
  
  h2 {
    font-size: 36px;
    font-weight: 800;
    color: #1A1A1A;
    margin: 0;
  }
`;

const FAQLayout = styled.div`
  display: flex;
  gap: 60px;
  
  @media (max-width: 992px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const FAQSidebar = styled.div`
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid #F0F0F0;
  padding-right: 40px;
  
  @media (max-width: 992px) {
    width: 100%;
    border-right: none;
    padding-right: 0;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 20px;
  }
`;

const CategoryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: ${({ $active }) => $active ? 'rgba(101, 52, 255, 0.05)' : 'transparent'};
  color: ${({ $active }) => $active ? '#6534FF' : '#7A7A7A'};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  
  &:hover {
    background: rgba(101, 52, 255, 0.03);
    color: #6534FF;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const FAQAccordion = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FAQItem = styled.div`
  border-bottom: 1px solid #F0F0F0;
  padding-bottom: 16px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FAQQuestion = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  padding: 16px 0;
  background: none;
  border: none;
  cursor: pointer;
  gap: 20px;
  
  h4 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ $expanded }) => $expanded ? '#6534FF' : '#1A1A1A'};
    margin: 0;
    transition: color 0.2s ease;
  }
  
  svg {
    color: #7A7A7A;
    transition: transform 0.3s ease;
    transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0)'};
    flex-shrink: 0;
  }
`;

const FAQAnswer = styled.div`
  max-height: ${({ $expanded }) => $expanded ? '200px' : '0'};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ $expanded }) => $expanded ? '1' : '0'};
  
  p {
    padding: 8px 0 16px 0;
    margin: 0;
    font-size: 15px;
    color: #7A7A7A;
    line-height: 1.7;
    max-width: 800px;
  }
`;

const Subscription = () => {
    const [currentPlan, setCurrentPlan] = useState('Pro');
    const [activeCategory, setActiveCategory] = useState('General');
    const [expandedIndex, setExpandedIndex] = useState(0);

    const [usage, setUsage] = useState({
        photos: { used: 8430, limit: 10000 },
        campaigns: { used: 3, limit: 5 },
        shares: { used: 7050, limit: 8000 }
    });

    const calculatePercent = (used, limit) => {
        if (limit === Infinity) return 0;
        return Math.min(100, (used / limit) * 100);
    };

    const plans = [
        {
            name: 'Basic',
            price: '₹999',
            period: 'month',
            icon: <Shield />,
            features: [
                { text: '3,000 Photos/month', included: true },
                { text: '2,000 Shares/month', included: true },
                { text: 'WhatsApp Only', included: true },
                { text: 'Basic Analytics', included: true },
                { text: 'Watermarked Output', included: false },
                { text: 'Campaigns', included: false }
            ],
            color: '#4CAF50'
        },
        {
            name: 'Pro',
            price: '₹2,499',
            period: 'month',
            icon: <Award />,
            features: [
                { text: '10,000 Photos/month', included: true },
                { text: '8,000 Shares/month', included: true },
                { text: 'All Social Platforms', included: true },
                { text: 'Advanced Analytics', included: true },
                { text: 'No Watermark', included: true },
                { text: '5 Campaigns/month', included: true }
            ],
            color: '#6534FF',
            popular: true
        },
        {
            name: 'Pro+',
            price: '₹4,999',
            period: 'month',
            icon: <Star />,
            features: [
                { text: 'Unlimited Photos', included: true },
                { text: 'Unlimited Shares', included: true },
                { text: 'All Platforms + API', included: true },
                { text: 'Enterprise Analytics', included: true },
                { text: 'Priority Support', included: true },
                { text: 'Unlimited Campaigns', included: true }
            ],
            color: '#FFB74D'
        }
    ];

    const categories = [
        { id: 'General', label: 'General', icon: <Globe /> },
        { id: 'Support', label: 'Support', icon: <ShieldIcon /> },
        { id: 'Others', label: 'Others', icon: <Users /> }
    ];

    const faqs = [
        {
            category: 'General',
            question: 'How to create an account?',
            answer: 'To create an account, find the "Sign up" or "Create account" button, fill out the registration form with your personal information, and click "Create account" or "Sign up". Verify your email address if needed, and then log in to start using the platform.',
        },
        {
            category: 'General',
            question: 'Can I change my plan anytime?',
            answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
        },
        {
            category: 'General',
            question: 'What happens to unused photos?',
            answer: 'Unused photos do not roll over to the next month. We recommend choosing a plan that matches your needs.',
        },
        {
            category: 'Support',
            question: 'Have any trust issue?',
            answer: 'Our platform is used by thousands of businesses globally. We prioritize security and transparency in all our operations.',
        },
        {
            category: 'Support',
            question: 'Is there a free trial?',
            answer: 'All paid plans come with a 14-day free trial. No credit card required for the trial period.',
        },
        {
            category: 'Others',
            question: 'How can I reset my password?',
            answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page and following the instructions sent to your email.',
        },
        {
            category: 'Others',
            question: 'What is the payment process?',
            answer: 'Payments are processed securely via our payment gateway partners. You can use major credit cards, UPI, or Net Banking.',
        }
    ];

    const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

    return (
        <PageContainer>
            <PageHeader>
                <div>
                    <h1>Subscription Plans</h1>
                    <p>Choose the perfect plan that fits your needs. All plans include our core features with varying limits.</p>
                </div>
                <div>
                    <StatusBadge>
                        <Check size={16} /> Current Plan: {currentPlan} (Active)
                    </StatusBadge>
                </div>
            </PageHeader>

            <SectionTitle><TrendingUp /> Usage Overview</SectionTitle>
            <OverviewGrid>
                <UsageCard $bg="#F3F0FF">
                    <CardHeader>
                        <IconBox>
                            <Share2 size={20} />
                        </IconBox>
                        <CardLabel>Total Shares</CardLabel>
                    </CardHeader>
                    <CardBody>
                        <StatsContainer>
                            <CardValue>{usage.shares.used.toLocaleString()}</CardValue>
                            <TrendIndicator>
                                <TrendingUp size={14} /> 5%
                            </TrendIndicator>
                        </StatsContainer>
                        <CircularProgressBar
                            percent={calculatePercent(usage.shares.used, usage.shares.limit)}
                            color="#6534FF"
                            size={64}
                            strokeWidth={6}
                        />
                    </CardBody>
                </UsageCard>

                <UsageCard $bg="#EEF6E8">
                    <CardHeader>
                        <IconBox>
                            <Zap size={20} />
                        </IconBox>
                        <CardLabel>Photos Used</CardLabel>
                    </CardHeader>
                    <CardBody>
                        <StatsContainer>
                            <CardValue>{usage.photos.used.toLocaleString()}</CardValue>
                            <TrendIndicator>
                                <TrendingUp size={14} /> 5%
                            </TrendIndicator>
                        </StatsContainer>
                        <CircularProgressBar
                            percent={calculatePercent(usage.photos.used, usage.photos.limit)}
                            color="#4CAF50"
                            size={64}
                            strokeWidth={6}
                        />
                    </CardBody>
                </UsageCard>

                <UsageCard $bg="#FFF7ED">
                    <CardHeader>
                        <IconBox>
                            <Users size={20} />
                        </IconBox>
                        <CardLabel>Campaigns</CardLabel>
                    </CardHeader>
                    <CardBody>
                        <StatsContainer>
                            <CardValue>{usage.campaigns.used}</CardValue>
                            <TrendIndicator>
                                <TrendingUp size={14} /> 5%
                            </TrendIndicator>
                        </StatsContainer>
                        <CircularProgressBar
                            percent={calculatePercent(usage.campaigns.used, usage.campaigns.limit)}
                            color="#FF9800"
                            size={64}
                            strokeWidth={6}
                        />
                    </CardBody>
                </UsageCard>
            </OverviewGrid>

            <SectionTitle><Award /> Choose Your Plan</SectionTitle>
            <PlansContainer>
                {plans.map((plan, index) => (
                    <PlanCard
                        key={plan.name}
                        $active={plan.name === currentPlan}
                        $popular={plan.popular}
                    >
                        {plan.popular && <Star style={{ position: 'absolute', top: 32, left: 32 }} />}
                        <PlanBadge $active={plan.name === currentPlan}>
                            {plan.name === currentPlan ? <Check /> : <Star />}
                            {plan.name === currentPlan ? 'Current Plan' : 'Popular Choice'}
                        </PlanBadge>

                        <PlanHeader $active={plan.name === currentPlan}>
                            <PlanName $active={plan.name === currentPlan}>
                                {plan.icon} {plan.name}
                            </PlanName>
                            <PlanPrice $active={plan.name === currentPlan}>
                                {plan.price}<span>/{plan.period}</span>
                            </PlanPrice>
                            <PlanPeriod $active={plan.name === currentPlan}>
                                Billed {plan.period}ly · Cancel anytime
                            </PlanPeriod>
                        </PlanHeader>

                        <FeaturesList>
                            {plan.features.map((feature, idx) => (
                                <FeatureItem
                                    key={idx}
                                    $active={plan.name === currentPlan}
                                    $disabled={!feature.included}
                                >
                                    {feature.included ? <Check /> : <X />}
                                    {feature.text}
                                </FeatureItem>
                            ))}
                        </FeaturesList>

                        <PlanButton
                            $active={plan.name === currentPlan}
                            $popular={plan.popular}
                            disabled={plan.name === currentPlan}
                        >
                            {plan.name === currentPlan ? 'Current Plan' :
                                plan.popular ? 'Upgrade Now' : `Choose ${plan.name}`}
                            <ChevronRight style={{ position: 'absolute', right: 20 }} />
                        </PlanButton>
                    </PlanCard>
                ))}
            </PlansContainer>

            <Divider />

            <FAQSection>
                <FAQHeader>
                    <span className="sub-title">HOW TO GET STARTED</span>
                    <h2>Frequently asked questions</h2>
                </FAQHeader>

                <FAQLayout>
                    <FAQSidebar>
                        {categories.map(cat => (
                            <CategoryButton
                                key={cat.id}
                                $active={activeCategory === cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setExpandedIndex(0);
                                }}
                            >
                                {cat.icon}
                                {cat.label}
                            </CategoryButton>
                        ))}
                    </FAQSidebar>

                    <FAQAccordion>
                        {filteredFaqs.map((faq, index) => (
                            <FAQItem key={index}>
                                <FAQQuestion
                                    $expanded={expandedIndex === index}
                                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                >
                                    <h4>{faq.question}</h4>
                                    <ChevronDown size={20} />
                                </FAQQuestion>
                                <FAQAnswer $expanded={expandedIndex === index}>
                                    <p>{faq.answer}</p>
                                </FAQAnswer>
                            </FAQItem>
                        ))}
                    </FAQAccordion>
                </FAQLayout>
            </FAQSection>
        </PageContainer>
    );
};

export default Subscription;
