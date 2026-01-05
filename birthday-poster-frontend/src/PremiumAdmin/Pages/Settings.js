import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    Settings,
    Bell,
    Link2,
    Download,
    Shield,
    Save,
    Check,
    AlertCircle,
    ExternalLink,
    Globe,
    Mail,
    Smartphone,
    MessageSquare,
    Clock,
    HardDrive
} from 'react-feather';
import Card from '../Components/Card';

// --- Styled Components ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: auto;
  min-height: calc(100vh - 120px);
`;

const PageHeader = styled.div`
  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
  }
  p {
    color: #666;
    margin-top: 4px;
    font-size: 15px;
  }
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 32px;
  flex: 1;
  overflow: visible;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const SettingsNav = styled.div`
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 1024px) {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
    
    &::-webkit-scrollbar {
        height: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #EEE;
        border-radius: 10px;
    }
  }
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? '#1A1A1A' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  white-space: nowrap;

  &:hover {
    background: ${props => props.$active ? '#1A1A1A' : '#F5F5F5'};
  }
`;

const SettingsContent = styled(Card)`
  flex: 1;
  padding: 32px;
  border-radius: 32px;
  overflow-y: auto;
  position: relative;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 14px;
  border: 1.5px solid #EEE;
  font-size: 14px;
  transition: all 0.2s;
  background: #FFF;

  &:focus {
    border-color: #1A1A1A;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border-radius: 14px;
  border: 1.5px solid #EEE;
  font-size: 14px;
  background: white;
  outline: none;
`;

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ToggleInfo = styled.div`
  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
  }
  p {
    margin: 4px 0 0 0;
    font-size: 13px;
    color: #888;
  }
`;

const Switch = styled.div`
  width: 44px;
  height: 24px;
  background: ${props => props.$checked ? '#1A1A1A' : '#DDD'};
  border-radius: 100px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;

  &::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: ${props => props.$checked ? '23px' : '3px'};
    transition: all 0.3s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const IntegrationCard = styled.div`
  border: 1.5px solid #EEE;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
`;

const IntegrationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.$active ? '#059669' : '#666'};
  background: ${props => props.$active ? '#ECFDF5' : '#F5F5F5'};
  padding: 4px 10px;
  border-radius: 100px;
`;

const FooterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #F0F0F0;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
`;

const SaveButton = styled.button`
  background: #1A1A1A;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
`;

const AuditInfo = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
`;

// --- Mock Initial Settings ---

const DEFAULT_SETTINGS = {
    general: {
        appName: 'P Poster Maker Admin',
        companyName: 'Bilimbe Chennai',
        email: 'contact@bilimbe.com',
        phone: '+91 98844 55663',
        timezone: 'India (IST)',
        dateFormat: 'DD/MM/YYYY',
        exportFormat: 'Excel'
    },
    notifications: {
        email: true,
        whatsapp: true,
        push: false,
        onPhoto: true,
        onShare: true,
        onCampaign: true,
        onReport: false,
        onBackup: true
    },
    integrations: {
        whatsapp: { active: true, provider: 'Twilio', apiKey: 'SK_TW_••••••••••••', senderID: '+15005550006' },
        email: { active: true, provider: 'SendGrid', apiKey: 'SG.••••••••••••', senderID: 'admin@varamahalakshmi.in' },
        sms: { active: false, provider: 'Nexmo', apiKey: '', senderID: '' }
    },
    export: {
        autoDaily: true,
        modules: ['Customers', 'Photos', 'Shares'],
        frequency: 'Weekly',
        destination: 'Download'
    },
    backup: {
        enabled: true,
        frequency: 'Daily',
        scope: ['Database', 'Configuration'],
        storage: 'Local Server'
    },
    audit: {
        lastUpdated: '2026-01-05 10:30 AM',
        updatedBy: 'Dhivya (Admin)'
    }
};

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('General');
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('admin_settings');
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const handleSave = () => {
        setSaving(true);
        // Simulate API delay
        setTimeout(() => {
            const updated = {
                ...settings,
                audit: {
                    lastUpdated: new Date().toLocaleString(),
                    updatedBy: 'Admin User'
                }
            };
            setSettings(updated);
            localStorage.setItem('admin_settings', JSON.stringify(updated));
            setSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1200);
    };

    const updateSetting = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const tabs = [
        { id: 'General', icon: <Settings size={18} /> },
        { id: 'Notifications', icon: <Bell size={18} /> },
        { id: 'Integrations', icon: <Link2 size={18} /> },
        { id: 'Export Settings', icon: <Download size={18} /> },
        { id: 'Backup', icon: <Shield size={18} /> }
    ];

    return (
        <PageContainer>
            <PageHeader>
                <h1>Settings</h1>
                <p>Configure application behavior, integrations, and security preferences</p>
            </PageHeader>

            <ContentLayout>
                <SettingsNav>
                    {tabs.map(tab => (
                        <NavItem
                            key={tab.id}
                            $active={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon} {tab.id}
                        </NavItem>
                    ))}
                </SettingsNav>

                <SettingsContent>
                    {activeTab === 'General' && (
                        <div>
                            <SectionTitle><Globe size={20} /> General Settings</SectionTitle>
                            <FormGrid>
                                <FormGroup>
                                    <Label>Application Name</Label>
                                    <Input
                                        value={settings.general.appName}
                                        onChange={e => updateSetting('general', 'appName', e.target.value)}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Company Name</Label>
                                    <Input
                                        value={settings.general.companyName}
                                        onChange={e => updateSetting('general', 'companyName', e.target.value)}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Contact Email</Label>
                                    <Input
                                        value={settings.general.email}
                                        onChange={e => updateSetting('general', 'email', e.target.value)}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Contact Phone</Label>
                                    <Input
                                        value={settings.general.phone}
                                        onChange={e => updateSetting('general', 'phone', e.target.value)}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Timezone</Label>
                                    <Select
                                        value={settings.general.timezone}
                                        onChange={e => updateSetting('general', 'timezone', e.target.value)}
                                    >
                                        <option>India (IST)</option>
                                        <option>US (EST)</option>
                                        <option>UK (GMT)</option>
                                    </Select>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Date Format</Label>
                                    <Select
                                        value={settings.general.dateFormat}
                                        onChange={e => updateSetting('general', 'dateFormat', e.target.value)}
                                    >
                                        <option>DD/MM/YYYY</option>
                                        <option>MM/DD/YYYY</option>
                                        <option>YYYY-MM-DD</option>
                                    </Select>
                                </FormGroup>
                            </FormGrid>
                        </div>
                    )}

                    {activeTab === 'Notifications' && (
                        <div>
                            <SectionTitle><Bell size={20} /> Notification Channels</SectionTitle>
                            <div style={{ marginBottom: '32px' }}>
                                <ToggleRow>
                                    <ToggleInfo>
                                        <h4>Email Notifications</h4>
                                        <p>Receive system alerts via your admin email address</p>
                                    </ToggleInfo>
                                    <Switch
                                        $checked={settings.notifications.email}
                                        onClick={() => updateSetting('notifications', 'email', !settings.notifications.email)}
                                    />
                                </ToggleRow>
                                <ToggleRow>
                                    <ToggleInfo>
                                        <h4>WhatsApp Notifications</h4>
                                        <p>Send instant alerts to configured admin phone numbers</p>
                                    </ToggleInfo>
                                    <Switch
                                        $checked={settings.notifications.whatsapp}
                                        onClick={() => updateSetting('notifications', 'whatsapp', !settings.notifications.whatsapp)}
                                    />
                                </ToggleRow>
                                <ToggleRow>
                                    <ToggleInfo>
                                        <h4>Push Notifications</h4>
                                        <p>Browser-level notifications for real-time engagement</p>
                                    </ToggleInfo>
                                    <Switch
                                        $checked={settings.notifications.push}
                                        onClick={() => updateSetting('notifications', 'push', !settings.notifications.push)}
                                    />
                                </ToggleRow>
                            </div>

                            <SectionTitle>Event Triggers</SectionTitle>
                            <FormGrid>
                                <ToggleRow>
                                    <ToggleInfo>
                                        <h4>New Photo Capture</h4>
                                        <p>Alert when a customer takes a new photo</p>
                                    </ToggleInfo>
                                    <Switch
                                        $checked={settings.notifications.onPhoto}
                                        onClick={() => updateSetting('notifications', 'onPhoto', !settings.notifications.onPhoto)}
                                    />
                                </ToggleRow>
                                <ToggleRow>
                                    <ToggleInfo>
                                        <h4>Campaign Completed</h4>
                                        <p>Alert when a marketing campaign finishes</p>
                                    </ToggleInfo>
                                    <Switch
                                        $checked={settings.notifications.onCampaign}
                                        onClick={() => updateSetting('notifications', 'onCampaign', !settings.notifications.onCampaign)}
                                    />
                                </ToggleRow>
                            </FormGrid>
                        </div>
                    )}

                    {activeTab === 'Integrations' && (
                        <div>
                            <SectionTitle><Link2 size={20} /> API Integrations</SectionTitle>
                            <IntegrationCard>
                                <IntegrationHeader>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <MessageSquare size={24} color="#25D366" />
                                        <div style={{ fontWeight: 700 }}>WhatsApp API (Twilio)</div>
                                    </div>
                                    <StatusIndicator $active={true}>
                                        <Check size={14} /> ACTIVE
                                    </StatusIndicator>
                                </IntegrationHeader>
                                <FormGrid>
                                    <FormGroup>
                                        <Label>API Key</Label>
                                        <Input type="password" value={settings.integrations.whatsapp.apiKey} readOnly />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Sender ID</Label>
                                        <Input value={settings.integrations.whatsapp.senderID} readOnly />
                                    </FormGroup>
                                </FormGrid>
                            </IntegrationCard>

                            <IntegrationCard>
                                <IntegrationHeader>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Mail size={24} color="#EA4335" />
                                        <div style={{ fontWeight: 700 }}>Email Service (SendGrid)</div>
                                    </div>
                                    <StatusIndicator $active={true}>
                                        <Check size={14} /> ACTIVE
                                    </StatusIndicator>
                                </IntegrationHeader>
                                <FormGrid>
                                    <FormGroup>
                                        <Label>API Token</Label>
                                        <Input type="password" value={settings.integrations.email.apiKey} readOnly />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Verified Sender</Label>
                                        <Input value={settings.integrations.email.senderID} readOnly />
                                    </FormGroup>
                                </FormGrid>
                            </IntegrationCard>
                        </div>
                    )}

                    {activeTab === 'Export Settings' && (
                        <div>
                            <SectionTitle><Download size={20} /> Export Configuration</SectionTitle>
                            <FormGrid>
                                <FormGroup>
                                    <Label>Default File Format</Label>
                                    <Select>
                                        <option>Excel (.xlsx)</option>
                                        <option>CSV</option>
                                        <option>PDF</option>
                                    </Select>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Automation Frequency</Label>
                                    <Select>
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </Select>
                                </FormGroup>
                            </FormGrid>
                            <div style={{ marginTop: '24px' }}>
                                <ToggleRow>
                                    <ToggleInfo>
                                        <h4>Enable Automatic Daily Export</h4>
                                        <p>System will automatically generate and store reports every midnight</p>
                                    </ToggleInfo>
                                    <Switch
                                        $checked={settings.export.autoDaily}
                                        onClick={() => updateSetting('export', 'autoDaily', !settings.export.autoDaily)}
                                    />
                                </ToggleRow>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Backup' && (
                        <div>
                            <SectionTitle><Shield size={20} /> System Backup</SectionTitle>
                            <FormGrid>
                                <FormGroup>
                                    <Label>Backup Frequency</Label>
                                    <Select>
                                        <option>Every 12 Hours</option>
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                    </Select>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Storage Location</Label>
                                    <Select>
                                        <option>Local Server</option>
                                        <option>Cloud Storage (S3)</option>
                                        <option>Google Drive</option>
                                    </Select>
                                </FormGroup>
                            </FormGrid>
                            <div style={{ marginTop: '24px' }}>
                                <ToggleRow>
                                    <ToggleInfo>
                                        <h4>Database Backup</h4>
                                        <p>Include full customer and transaction records</p>
                                    </ToggleInfo>
                                    <Switch $checked={true} readOnly />
                                </ToggleRow>
                                <ToggleRow>
                                    <ToggleInfo>
                                        <h4>Configurations Backup</h4>
                                        <p>Include all settings and environment variables</p>
                                    </ToggleInfo>
                                    <Switch $checked={true} readOnly />
                                </ToggleRow>
                            </div>
                        </div>
                    )}

                    <FooterBar>
                        <AuditInfo>
                            <Clock size={14} />
                            Last updated: {settings.audit.lastUpdated} by {settings.audit.updatedBy}
                        </AuditInfo>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {showSuccess && (
                                <span style={{ color: '#059669', fontSize: '13px', fontWeight: 700 }}>
                                    <Check size={14} /> Changes saved successfully!
                                </span>
                            )}
                            <SaveButton onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                            </SaveButton>
                        </div>
                    </FooterBar>
                </SettingsContent>
            </ContentLayout>
        </PageContainer>
    );
};

export default SettingsPage;
