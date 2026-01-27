import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  HardDrive,
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  Save,
  Plus,
  X
} from 'react-feather';
import useAxios from '../useAxios';
import { theme } from '../PremiumAdmin/theme';

// --- Styled Components ---

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.xl};
`;

const TitleSection = styled.div`
  h1 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: #1A1A1A;
  }
  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    font-size: 14px;
  }
`;

const SettingsCard = styled.div`
  background: white;
  border-radius: 32px;
  box-shadow: ${theme.shadows.card};
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.03);
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #F0F0F0;
  background: #FAFAFA;
  padding: 0 ${theme.spacing.lg};
  gap: ${theme.spacing.md};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #E0E0E0;
    border-radius: 10px;
  }
`;

const TabButton = styled.button`
  padding: 16px 20px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover {
    color: #1A1A1A;
    background: rgba(0,0,0,0.02);
  }
  
  ${props => props.$active && `
    color: #1A1A1A;
    border-bottom-color: #1A1A1A;
    background: white;
  `}
`;

const TabContent = styled.div`
  padding: ${theme.spacing.xl};
  display: ${props => props.$active ? 'block' : 'none'};
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionDescription = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: 14px;
  margin: 0 0 ${theme.spacing.lg} 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
  
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
  font-family: inherit;

  &:focus {
    border-color: #1A1A1A;
    outline: none;
    box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border-radius: 14px;
  border: 1.5px solid #EEE;
  font-size: 14px;
  background: white;
  outline: none;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    border-color: #1A1A1A;
    box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
  }
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
    color: #1A1A1A;
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
    border-radius: 50%;
    background: white;
    top: 3px;
    left: ${props => props.$checked ? '23px' : '3px'};
    transition: all 0.3s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: ${props => props.$primary ? '#1A1A1A' : 'white'};
  color: ${props => props.$primary ? 'white' : '#1A1A1A'};
  border: ${props => props.$primary ? 'none' : '1px solid #E0E0E0'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    background: ${props => props.$primary ? '#000' : '#F5F5F5'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FooterBar = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-top: 1px solid #F0F0F0;
  display: flex;
  justify-content: flex-end;
  background: #FAFAFA;
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: #E8F5E9;
  color: #25D366;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GuideCard = styled.div`
  padding: 20px;
  border: 1px solid #E5E5E5;
  border-radius: 16px;
  margin-bottom: 16px;
  background: #FAFAFA;
`;

const GuideHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const GuideInfo = styled.div`
  h3 {
    margin: 0 0 6px 0;
    font-size: 15px;
    font-weight: 600;
    color: #1A1A1A;
  }
  p {
    margin: 0;
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const StatusMessage = styled.div`
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  background: ${props => props.$success ? '#E8F5E9' : '#FFEBEE'};
  color: ${props => props.$success ? '#25D366' : '#F44336'};
`;

const Settings = () => {
  const axios = useAxios();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    siteName: 'Admin System',
    siteLogo: '',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    enable2FA: false,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    emailNotifications: true,
    adminEmails: 'admin@example.com',
    userWelcomeEmail: true,
    maintenanceMode: false,
    backupFrequency: 'daily',
    logRetention: 30,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [templateGuides, setTemplateGuides] = useState([]);
  const [uploading, setUploading] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [pendingPdfs, setPendingPdfs] = useState({}); // Store files to upload on save
  const [customAccessTypes, setCustomAccessTypes] = useState([]); // Custom access types added by user
  const [showAddGuide, setShowAddGuide] = useState(false);
  const [newGuideType, setNewGuideType] = useState({ accessType: '', displayName: '' });

  useEffect(() => {
    fetchTemplateGuides();
  }, []);

  // Get all unique access types from guides and custom types
  const getAllAccessTypes = () => {
    const defaultTypes = ['photomerge', 'videomerge', 'videovideo'];
    const guideTypes = templateGuides.map(g => g.accessType);
    const allTypes = [...new Set([...defaultTypes, ...guideTypes, ...customAccessTypes.map(c => c.accessType)])];
    return allTypes;
  };

  const getDisplayName = (accessType) => {
    // Check if guide exists in database and has a display name (highest priority)
    const guide = templateGuides.find(g => g.accessType === accessType);
    if (guide && guide.displayName) return guide.displayName;
    
    // Check custom display names from current session
    const custom = customAccessTypes.find(c => c.accessType === accessType);
    if (custom) return custom.displayName;
    
    // Default display names
    const displayNames = {
      'photomerge': 'Photo Merge Guide',
      'videomerge': 'Video Merge Guide',
      'videovideo': 'Video + Video Guide',
      'videovideovideo': 'Video + Video + Video Guide'
    };
    return displayNames[accessType] || accessType.charAt(0).toUpperCase() + accessType.slice(1).replace(/_/g, ' ') + ' Guide';
  };

  const handleAddGuideType = () => {
    if (!newGuideType.accessType.trim() || !newGuideType.displayName.trim()) {
      alert('Please enter both access type and display name');
      return;
    }
    
    const accessType = newGuideType.accessType.trim().toLowerCase();
    if (getAllAccessTypes().includes(accessType)) {
      alert('This access type already exists');
      return;
    }
    
    setCustomAccessTypes([...customAccessTypes, { accessType, displayName: newGuideType.displayName.trim() }]);
    setNewGuideType({ accessType: '', displayName: '' });
    setShowAddGuide(false);
  };

  const handleRemoveCustomGuide = (accessType) => {
    setCustomAccessTypes(customAccessTypes.filter(c => c.accessType !== accessType));
    // Also remove pending PDF if any
    setPendingPdfs(prev => {
      const newPending = { ...prev };
      delete newPending[accessType];
      return newPending;
    });
  };

  const fetchTemplateGuides = async () => {
    try {
      const response = await axios.get('/admin/template-guide');
      if (response.data.success) {
        setTemplateGuides(response.data.guides || []);
      }
    } catch (error) {
      console.error('Error fetching template guides:', error);
    }
  };

  const handlePdfSelect = (accessType, file) => {
    if (!file || file.type !== 'application/pdf') {
      setUploadStatus({ ...uploadStatus, [accessType]: { success: false, message: 'Please select a valid PDF file' } });
      setTimeout(() => {
        setUploadStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[accessType];
          return newStatus;
        });
      }, 3000);
      return;
    }

    // Store file for later upload
    setPendingPdfs(prev => ({
      ...prev,
      [accessType]: file
    }));
    
    // Clear any previous status
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[accessType];
      return newStatus;
    });
  };

  const handlePdfUpload = async (accessType, file) => {
    setUploading(prev => ({ ...prev, [accessType]: true }));
    setUploadStatus(prev => ({ ...prev, [accessType]: null }));

    try {
      const formData = new FormData();
      formData.append('accessType', accessType);
      // Get display name from custom types or use default
      const customType = customAccessTypes.find(c => c.accessType === accessType);
      if (customType && customType.displayName) {
        formData.append('displayName', customType.displayName);
      }
      formData.append('pdf', file);
      formData.append('adminid', user._id || user.id || '');

      const response = await axios.post('/admin/template-guide/upload', formData);

      if (response.data.success) {
        setUploadStatus(prev => ({ ...prev, [accessType]: { success: true, message: 'PDF uploaded successfully!' } }));
        await fetchTemplateGuides();
        // Remove from pending after successful upload
        setPendingPdfs(prev => {
          const newPending = { ...prev };
          delete newPending[accessType];
          return newPending;
        });
        setTimeout(() => {
          setUploadStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[accessType];
            return newStatus;
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to upload PDF. Please try again.';
      setUploadStatus(prev => ({ ...prev, [accessType]: { success: false, message: errorMessage } }));
    } finally {
      setUploading(prev => ({ ...prev, [accessType]: false }));
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Upload all pending PDFs
      const uploadPromises = Object.entries(pendingPdfs).map(([accessType, file]) => 
        handlePdfUpload(accessType, file)
      );
      
      // Wait for all PDF uploads to complete
      await Promise.all(uploadPromises);
      
      // Save other settings here if needed
      // For now, just show success message
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSuccess('');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'system', label: 'System', icon: <HardDrive size={18} /> },
    { id: 'guides', label: 'Template Guides', icon: <FileText size={18} /> },
  ];

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header>
          <TitleSection>
            <h1>Settings</h1>
            <p>Configure application behavior, integrations, and security preferences</p>
          </TitleSection>
        </Header>

        {success && (
          <SuccessMessage>
            <CheckCircle size={16} />
            {success}
          </SuccessMessage>
        )}

        <SettingsCard>
          <TabsContainer>
            {tabs.map((tab, index) => (
              <TabButton
                key={tab.id}
                $active={activeTab === index}
                onClick={() => setActiveTab(index)}
              >
                {tab.icon}
                {tab.label}
              </TabButton>
            ))}
          </TabsContainer>

          <TabContent $active={activeTab === 0}>
            <SectionTitle><SettingsIcon size={20} /> General Settings</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Site Name</Label>
                <Input
                  type="text"
                  value={settings.siteName}
                  onChange={handleChange('siteName')}
                  placeholder="Admin System"
                />
              </FormGroup>
              <FormGroup>
                <Label>Timezone</Label>
                <Select value={settings.timezone} onChange={handleChange('timezone')}>
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                  <option value="IST">IST</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Date Format</Label>
                <Select value={settings.dateFormat} onChange={handleChange('dateFormat')}>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </FormGroup>
            </FormGrid>
          </TabContent>

          <TabContent $active={activeTab === 1}>
            <SectionTitle><Shield size={20} /> Security Settings</SectionTitle>
            <div>
              <ToggleRow>
                <ToggleInfo>
                  <h4>Enable Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </ToggleInfo>
                <Switch
                  $checked={settings.enable2FA}
                  onClick={() => handleChange('enable2FA')({ target: { type: 'checkbox', checked: !settings.enable2FA } })}
                />
              </ToggleRow>
              <FormGrid style={{ marginTop: '24px' }}>
                <FormGroup>
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={handleChange('sessionTimeout')}
                    min="5"
                    max="1440"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Password Policy</Label>
                  <Select value={settings.passwordPolicy} onChange={handleChange('passwordPolicy')}>
                    <option value="basic">Basic (6+ characters)</option>
                    <option value="medium">Medium (8+ characters with mixed case)</option>
                    <option value="strong">Strong (10+ characters with special chars)</option>
                  </Select>
                </FormGroup>
              </FormGrid>
            </div>
          </TabContent>

          <TabContent $active={activeTab === 2}>
            <SectionTitle><Bell size={20} /> Notification Settings</SectionTitle>
            <div>
              <ToggleRow>
                <ToggleInfo>
                  <h4>Enable Email Notifications</h4>
                  <p>Receive system alerts via email</p>
                </ToggleInfo>
                <Switch
                  $checked={settings.emailNotifications}
                  onClick={() => handleChange('emailNotifications')({ target: { type: 'checkbox', checked: !settings.emailNotifications } })}
                />
              </ToggleRow>
              <FormGroup style={{ marginTop: '24px' }}>
                <Label>Admin Notification Emails</Label>
                <Input
                  type="text"
                  value={settings.adminEmails}
                  onChange={handleChange('adminEmails')}
                  placeholder="admin@example.com"
                />
                <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>Comma separated email addresses</p>
              </FormGroup>
              <ToggleRow>
                <ToggleInfo>
                  <h4>Send Welcome Email to New Users</h4>
                  <p>Automatically send welcome email when new users register</p>
                </ToggleInfo>
                <Switch
                  $checked={settings.userWelcomeEmail}
                  onClick={() => handleChange('userWelcomeEmail')({ target: { type: 'checkbox', checked: !settings.userWelcomeEmail } })}
                />
              </ToggleRow>
            </div>
          </TabContent>

          <TabContent $active={activeTab === 3}>
            <SectionTitle><HardDrive size={20} /> System Settings</SectionTitle>
            <div>
              <ToggleRow>
                <ToggleInfo>
                  <h4>Maintenance Mode</h4>
                  <p>Put the system in maintenance mode</p>
                </ToggleInfo>
                <Switch
                  $checked={settings.maintenanceMode}
                  onClick={() => handleChange('maintenanceMode')({ target: { type: 'checkbox', checked: !settings.maintenanceMode } })}
                />
              </ToggleRow>
              <FormGrid style={{ marginTop: '24px' }}>
                <FormGroup>
                  <Label>Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onChange={handleChange('backupFrequency')}>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Log Retention (days)</Label>
                  <Input
                    type="number"
                    value={settings.logRetention}
                    onChange={handleChange('logRetention')}
                    min="1"
                    max="365"
                  />
                </FormGroup>
              </FormGrid>
            </div>
          </TabContent>

          <TabContent $active={activeTab === 4}>
            <SectionTitle><FileText size={20} /> Template Guide PDFs</SectionTitle>
            <SectionDescription>
              Upload PDF guides for each template access type. These guides will be displayed to users when creating templates.
            </SectionDescription>
            
            {/* Add New Guide Type Section */}
            <div style={{ marginBottom: '24px', padding: '16px', background: '#F5F5F5', borderRadius: '12px' }}>
              {!showAddGuide ? (
                <Button onClick={() => setShowAddGuide(true)} style={{ background: '#4CAF50', color: 'white' }}>
                  <Plus size={16} />
                  Add New Guide Type
                </Button>
              ) : (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <FormGroup style={{ flex: 1 }}>
                    <Label>Access Type</Label>
                    <Input
                      type="text"
                      placeholder="e.g., customtype"
                      value={newGuideType.accessType}
                      onChange={(e) => setNewGuideType({ ...newGuideType, accessType: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup style={{ flex: 1 }}>
                    <Label>Display Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g., Custom Template Guide"
                      value={newGuideType.displayName}
                      onChange={(e) => setNewGuideType({ ...newGuideType, displayName: e.target.value })}
                    />
                  </FormGroup>
                  <Button $primary onClick={handleAddGuideType}>
                    <Plus size={16} />
                    Add
                  </Button>
                  <Button onClick={() => {
                    setShowAddGuide(false);
                    setNewGuideType({ accessType: '', displayName: '' });
                  }}>
                    <X size={16} />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div>
              {getAllAccessTypes().map((accessType) => {
                const guide = templateGuides.find(g => g.accessType === accessType);
                const isUploading = uploading[accessType];
                const status = uploadStatus[accessType];
                const pendingFile = pendingPdfs[accessType];
                
                return (
                  <GuideCard key={accessType}>
                    <GuideHeader>
                      <GuideInfo>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3>{getDisplayName(accessType)}</h3>
                          {customAccessTypes.find(c => c.accessType === accessType) && (
                            <Button
                              onClick={() => handleRemoveCustomGuide(accessType)}
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '12px',
                                background: '#FF5252',
                                color: 'white',
                                minWidth: 'auto'
                              }}
                            >
                              <X size={12} />
                              Remove
                            </Button>
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                          Access Type: {accessType}
                        </p>
                        {pendingFile && (
                          <p style={{ color: '#FF9800', fontWeight: 600 }}>
                            <Upload size={14} />
                            Selected: {pendingFile.name} (will upload on save)
                          </p>
                        )}
                        {!pendingFile && guide && (
                          <p>
                            <CheckCircle size={14} color="#25D366" />
                            Uploaded: {new Date(guide.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                        {!pendingFile && !guide && (
                          <p style={{ color: '#999' }}>No PDF uploaded yet</p>
                        )}
                      </GuideInfo>
                      <label>
                        <input
                          type="file"
                          accept="application/pdf"
                          style={{ display: 'none' }}
                          disabled={isUploading || saving}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handlePdfSelect(accessType, file);
                            }
                            e.target.value = '';
                          }}
                        />
                        <Button
                          $primary
                          as="span"
                          style={{ 
                            opacity: (isUploading || saving) ? 0.6 : 1,
                            cursor: (isUploading || saving) ? 'not-allowed' : 'pointer',
                            pointerEvents: (isUploading || saving) ? 'none' : 'auto'
                          }}
                        >
                          <Upload size={16} />
                          {pendingFile ? 'Change PDF' : guide ? 'Replace PDF' : 'Select PDF'}
                        </Button>
                      </label>
                    </GuideHeader>
                    {status && (
                      <StatusMessage $success={status.success}>
                        {status.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {status.message}
                      </StatusMessage>
                    )}
                  </GuideCard>
                );
              })}
            </div>
          </TabContent>

          <FooterBar>
            <Button $primary onClick={handleSave} disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </FooterBar>
        </SettingsCard>
      </PageContainer>
    </ThemeProvider>
  );
};

export default Settings;
