//------->straight view page
// import React, { useState, useRef } from 'react';
// import './ClientPageUser.css';

// // Import template images from src/images
// import template1 from '../images/template1.jpg';
// import template2 from '../images/template2.png';
// import template3 from '../images/template3.png';
// import template4 from '../images/template4.png';
// import template5 from '../images/template5.png';
// import template6 from '../images/template6.png';

// const ClientPageUser = () => {
//   const [userData, setUserData] = useState({
//     name: '',
//     email: '',
//     whatsappNo: '',
//     selectedTemplate: null,
//     userPhoto: null,
//     showOutput: false,
//     isLoading: false
//   });

//   const fileInputRef = useRef(null);

//   // Templates with photo mask areas for fitting
//   const templates = [
//     {
//       id: 1,
//       name: 'Professional Red',
//       image: template1,
//       photoArea: { top: '30%', left: '20%', width: '60%', height: '60%', borderRadius: '50%' }
//     },
//     {
//       id: 2,
//       name: 'Modern VIP',
//       image: template2,
//       photoArea: { top: '25%', left: '10%', width: '35%', height: '50%', borderRadius: '10%' }
//     },
//     {
//       id: 3,
//       name: 'Elegant Style',
//       image: template3,
//       photoArea: { top: '20%', left: '35%', width: '30%', height: '45%', borderRadius: '8%' }
//     },
//     {
//       id: 4,
//       name: 'Premium Card',
//       image: template4,
//       photoArea: { top: '15%', left: '60%', width: '30%', height: '40%', borderRadius: '5%' }
//     },
//     {
//       id: 5,
//       name: 'Business Red',
//       image: template5,
//       photoArea: { top: '35%', left: '15%', width: '35%', height: '40%', borderRadius: '50%' }
//     },
//     {
//       id: 6,
//       name: 'Minimalist',
//       image: template6,
//       photoArea: { top: '25%', left: '10%', width: '35%', height: '45%', borderRadius: '12%' }
//     },
//   ];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserData({ ...userData, [name]: value });
//   };

//   const handleTemplateSelect = (template) => {
//     setUserData({ ...userData, selectedTemplate: template });
//   };

//   const handlePhotoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUserData({ ...userData, userPhoto: reader.result });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!userData.name || !userData.email) {
//       alert('Please enter your name and email');
//       return;
//     }

//     if (!userData.selectedTemplate) {
//       alert('Please select a template');
//       return;
//     }

//     if (!userData.userPhoto) {
//       alert('Please upload a photo');
//       return;
//     }

//     setUserData({ ...userData, isLoading: true });

//     setTimeout(() => {
//       setUserData({
//         ...userData,
//         showOutput: true,
//         isLoading: false
//       });
//     }, 1000);
//   };

//   const handleReset = () => {
//     setUserData({
//       name: '',
//       email: '',
//       whatsappNo: '',
//       selectedTemplate: null,
//       userPhoto: null,
//       showOutput: false,
//       isLoading: false
//     });
//   };

//   return (
//     <div className="user-photo-app">
//       {/* Header */}
//       <header className="app-header">
//         <div className="container">
//           <div className="header-content">
//             <h1 className="logo">
//               <span className="logo-red">BioSis</span>Templates
//             </h1>
//             <p className="tagline">Upload your photo and get a professional profile instantly</p>
//           </div>
//         </div>
//       </header>

//       {userData.isLoading ? (
//         /* Loading State */
//         <div className="loading-container">
//           <div className="loading-content">
//             <div className="spinner"></div>
//             <h3>Creating Your Photo...</h3>
//             <p>Processing your photo with selected template</p>
//           </div>
//         </div>
//       ) : (
//         <main className="main-content">
//           <div className="container">
//             {!userData.showOutput ? (
//               /* Form View */
//               <>
//                 {/* User Details Form */}
//                 <div className="form-section">
//                   <div className="form-card">
//                     <h2 className="form-title">Enter Your Details</h2>

//                     <form onSubmit={handleSubmit} className="user-form">
//                       <div className="form-group">
//                         <div className="input-grid">
//                           <div className="input-field">
//                             <label className="input-label">
//                               <span className="label-icon">👤</span>
//                               Full Name *
//                             </label>
//                             <input
//                               type="text"
//                               name="name"
//                               value={userData.name}
//                               onChange={handleInputChange}
//                               placeholder="Enter your full name"
//                               className="form-input"
//                               required
//                             />
//                           </div>

//                           <div className="input-field">
//                             <label className="input-label">
//                               <span className="label-icon">✉️</span>
//                               Email Address *
//                             </label>
//                             <input
//                               type="email"
//                               name="email"
//                               value={userData.email}
//                               onChange={handleInputChange}
//                               placeholder="your.email@example.com"
//                               className="form-input"
//                               required
//                             />
//                           </div>

//                           <div className="input-field">
//                             <label className="input-label">
//                               <span className="label-icon">📱</span>
//                               WhatsApp Number
//                             </label>
//                             <input
//                               type="tel"
//                               name="whatsappNo"
//                               value={userData.whatsappNo}
//                               onChange={handleInputChange}
//                               placeholder="+1 234 567 8900"
//                               className="form-input"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Template Selection */}
//                       <div className="template-section">
//                         <div className="section-header">
//                           <h3 className="section-title">
//                             <span className="title-icon">🎨</span>
//                             Choose Template
//                           </h3>
//                           <span className="hint-text">Select one template</span>
//                         </div>

//                         <div className="templates-grid">
//                           {templates.map((template) => (
//                             <div
//                               key={template.id}
//                               className={`template-card ${userData.selectedTemplate?.id === template.id ? 'selected' : ''}`}
//                               onClick={() => handleTemplateSelect(template)}
//                             >
//                               <div className="template-preview">
//                                 <img
//                                   src={template.image}
//                                   alt={template.name}
//                                   className="template-img"
//                                 />
//                                 <div
//                                   className="photo-area-mask"
//                                   style={{
//                                     clipPath: `inset(${template.photoArea.top} ${template.photoArea.left} auto auto)`,
//                                     borderRadius: template.photoArea.borderRadius
//                                   }}
//                                 >
//                                   {userData.userPhoto && userData.selectedTemplate?.id === template.id && (
//                                     <img
//                                       src={userData.userPhoto}
//                                       alt="Your photo preview"
//                                       className="photo-preview-in-template"
//                                     />
//                                   )}
//                                 </div>
//                                 <div className="photo-area-indicator">
//                                   <span>Your Photo Here</span>
//                                 </div>
//                               </div>
//                               <div className="template-footer">
//                                 <span className="template-name">{template.name}</span>
//                                 <button
//                                   type="button"
//                                   className={`select-btn ${userData.selectedTemplate?.id === template.id ? 'selected' : ''}`}
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleTemplateSelect(template);
//                                   }}
//                                 >
//                                   {userData.selectedTemplate?.id === template.id ? '✓ Selected' : 'Select'}
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Photo Upload */}
//                       <div className="upload-section">
//                         <div className="section-header">
//                           <h3 className="section-title">
//                             <span className="title-icon">📸</span>
//                             Upload Your Photo
//                           </h3>
//                           {userData.userPhoto && (
//                             <span className="success-badge">✓ Photo Uploaded</span>
//                           )}
//                         </div>

//                         <div className="upload-area" onClick={triggerFileInput}>
//                           <input
//                             type="file"
//                             ref={fileInputRef}
//                             accept="image/*"
//                             onChange={handlePhotoUpload}
//                             className="file-input"
//                           />

//                           {userData.userPhoto ? (
//                             <div className="photo-preview">
//                               <img
//                                 src={userData.userPhoto}
//                                 alt="Your photo"
//                                 className="uploaded-photo"
//                               />
//                               <div className="change-overlay">
//                                 <span className="change-text">Change Photo</span>
//                               </div>
//                             </div>
//                           ) : (
//                             <div className="upload-content">
//                               <div className="upload-icon">
//                                 <svg width="48" height="48" viewBox="0 0 24 24" fill="#dc2626">
//                                   <path d="M19 13C19.7 13 20.37 13.1 21 13.29V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19H13.29C13.1 18.37 13 17.7 13 17C13 14.79 14.79 13 17 13C17.7 13 18.37 13.1 19 13ZM15 13L11 9L8 12L6 10L3 14H13C13 13.34 13.08 12.68 13.23 12.05L14 13L15 13ZM17 11C15.9 11 15 11.9 15 13C15 14.1 15.9 15 17 15C18.1 15 19 14.1 19 13C19 11.9 18.1 11 17 11Z"/>
//                                 </svg>
//                               </div>
//                               <div className="upload-text">
//                                 <h4>Click to upload your photo</h4>
//                                 <p>PNG, JPG up to 5MB • Square photos work best</p>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       {/* Submit Button */}
//                       <div className="submit-section">
//                         <button
//                           type="submit"
//                           className="submit-btn"
//                           disabled={!userData.name || !userData.email || !userData.selectedTemplate || !userData.userPhoto}
//                         >
//                           <span className="btn-text">Generate Profile Photo</span>
//                           <span className="btn-icon">✨</span>
//                         </button>
//                         <p className="submit-note">One click to create photo with template and send to you</p>
//                       </div>
//                     </form>
//                   </div>
//                 </div>

//                 {/* Live Preview (Below Form) */}
//                 {userData.selectedTemplate && userData.userPhoto && (
//                   <div className="preview-section">
//                     <div className="preview-card">
//                       <div className="preview-header">
//                         <h3 className="preview-title">
//                           <span className="title-icon">👁️</span>
//                           Live Preview
//                         </h3>
//                         <div className="preview-status">
//                           <span className="status-dot"></span>
//                           <span>Live Update</span>
//                         </div>
//                       </div>

//                       <div className="preview-content">
//                         <div className="preview-container">
//                           <div className="template-preview-large">
//                             <img
//                               src={userData.selectedTemplate.image}
//                               alt="Template"
//                               className="template-bg"
//                             />
//                             <div
//                               className="user-photo-mask"
//                               style={{
//                                 top: userData.selectedTemplate.photoArea.top,
//                                 left: userData.selectedTemplate.photoArea.left,
//                                 width: userData.selectedTemplate.photoArea.width,
//                                 height: userData.selectedTemplate.photoArea.height,
//                                 borderRadius: userData.selectedTemplate.photoArea.borderRadius,
//                                 overflow: 'hidden',
//                                 position: 'absolute'
//                               }}
//                             >
//                               <img
//                                 src={userData.userPhoto}
//                                 alt="User"
//                                 className="user-photo-fitted"
//                               />
//                             </div>
//                             <div className="user-details">
//                               <div className="user-name">{userData.name || 'Your Name'}</div>
//                               <div className="user-email">{userData.email || 'your.email@example.com'}</div>
//                               {userData.whatsappNo && (
//                                 <div className="user-phone">📱 {userData.whatsappNo}</div>
//                               )}
//                             </div>
//                             <div className="vip-badge">VIP</div>
//                           </div>
//                         </div>

//                         <div className="preview-info">
//                           <div className="info-grid">
//                             <div className="info-item">
//                               <span className="info-label">Template:</span>
//                               <span className="info-value">{userData.selectedTemplate.name}</span>
//                             </div>
//                             <div className="info-item">
//                               <span className="info-label">Photo:</span>
//                               <span className="info-value">✓ Uploaded & Fitted</span>
//                             </div>
//                             <div className="info-item">
//                               <span className="info-label">Ready:</span>
//                               <span className="info-value ready">Click Generate</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               /* Output View (Below Form) */
//               <div className="output-section">
//                 <div className="output-card">
//                   <div className="output-header">
//                     <h2 className="output-title">🎉 Your Photo is Ready!</h2>
//                     <p className="output-subtitle">Download your professionally designed profile photo</p>
//                   </div>

//                   <div className="output-content">
//                     <div className="final-result">
//                       <div className="final-template">
//                         <img
//                           src={userData.selectedTemplate.image}
//                           alt="Template"
//                           className="final-template-bg"
//                         />
//                         <div
//                           className="final-photo-mask"
//                           style={{
//                             top: userData.selectedTemplate.photoArea.top,
//                             left: userData.selectedTemplate.photoArea.left,
//                             width: userData.selectedTemplate.photoArea.width,
//                             height: userData.selectedTemplate.photoArea.height,
//                             borderRadius: userData.selectedTemplate.photoArea.borderRadius,
//                             overflow: 'hidden',
//                             position: 'absolute'
//                           }}
//                         >
//                           <img
//                             src={userData.userPhoto}
//                             alt="User"
//                             className="final-user-photo"
//                           />
//                         </div>
//                         <div className="final-user-details">
//                           <div className="final-name">{userData.name}</div>
//                           <div className="final-email">{userData.email}</div>
//                           {userData.whatsappNo && (
//                             <div className="final-phone">📱 {userData.whatsappNo}</div>
//                           )}
//                         </div>
//                         <div className="final-vip-badge">VIP</div>
//                       </div>
//                     </div>

//                     <div className="output-actions">
//                       <button className="action-btn primary-btn">
//                         <span className="action-icon">⬇</span>
//                         Download Photo
//                       </button>

//                       <button className="action-btn secondary-btn">
//                         <span className="action-icon">✉</span>
//                         Send to Email
//                       </button>

//                       <button onClick={handleReset} className="action-btn outline-btn">
//                         <span className="action-icon">🔄</span>
//                         Create Another
//                       </button>
//                     </div>

//                     <div className="output-details">
//                       <h3 className="details-title">Photo Details</h3>
//                       <div className="details-grid">
//                         <div className="detail-item">
//                           <span className="detail-label">Template:</span>
//                           <span className="detail-value">{userData.selectedTemplate.name}</span>
//                         </div>
//                         <div className="detail-item">
//                           <span className="detail-label">Photo Fit:</span>
//                           <span className="detail-value">✓ Perfectly Fitted</span>
//                         </div>
//                         <div className="detail-item">
//                           <span className="detail-label">Resolution:</span>
//                           <span className="detail-value">1080 × 1350px</span>
//                         </div>
//                         <div className="detail-item">
//                           <span className="detail-label">Format:</span>
//                           <span className="detail-value">PNG</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </main>
//       )}

//       {/* Footer */}
//       <footer className="app-footer">
//         <div className="container">
//           <div className="footer-content">
//             <p className="footer-text">© 2023 BioSis Templates • Professional Photo Creation</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default ClientPageUser;

//------>left and right split page and dark theme
// import React, { useState, useRef, useEffect } from 'react';
// import './ClientPageUser.css';

// // Import template images from src/images
// import template1 from '../images/template1.jpg';
// import template2 from '../images/template2.png';
// import template3 from '../images/template3.png';
// import template4 from '../images/template4.png';
// import template5 from '../images/template5.png';
// import template6 from '../images/template6.png';

// const ClientPageUser = () => {
//   const [userData, setUserData] = useState({
//     name: '',
//     email: '',
//     whatsappNo: '',
//     selectedTemplate: null,
//     userPhoto: null,
//     showOutput: false,
//     isLoading: false,
//     aiEnhance: true,
//     addBorder: false
//   });

//   const fileInputRef = useRef(null);

//   // Templates with photo mask areas for fitting
//   const templates = [
//     {
//       id: 1,
//       name: 'Professional Red',
//       image: template1,
//       photoArea: { top: '30%', left: '20%', width: '60%', height: '60%', borderRadius: '50%' }
//     },
//     {
//       id: 2,
//       name: 'Modern VIP',
//       image: template2,
//       photoArea: { top: '25%', left: '10%', width: '35%', height: '50%', borderRadius: '10%' }
//     },
//     {
//       id: 3,
//       name: 'Elegant Style',
//       image: template3,
//       photoArea: { top: '20%', left: '35%', width: '30%', height: '45%', borderRadius: '8%' }
//     },
//     {
//       id: 4,
//       name: 'Premium Card',
//       image: template4,
//       photoArea: { top: '15%', left: '60%', width: '30%', height: '40%', borderRadius: '5%' }
//     },
//     {
//       id: 5,
//       name: 'Business Red',
//       image: template5,
//       photoArea: { top: '35%', left: '15%', width: '35%', height: '40%', borderRadius: '50%' }
//     },
//     {
//       id: 6,
//       name: 'Minimalist',
//       image: template6,
//       photoArea: { top: '25%', left: '10%', width: '35%', height: '45%', borderRadius: '12%' }
//     },
//   ];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserData({ ...userData, [name]: value });
//   };

//   const handleTemplateSelect = (template) => {
//     setUserData({ ...userData, selectedTemplate: template });
//   };

//   const handlePhotoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // File validation
//       if (!file.type.match('image.*')) {
//         alert('Please select an image file');
//         return;
//       }

//       if (file.size > 10 * 1024 * 1024) { // 10MB limit
//         alert('File size should be less than 10MB');
//         return;
//       }

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUserData({ ...userData, userPhoto: reader.result });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handlePhotoUpload({ target: { files: e.dataTransfer.files } });
//     }
//   };

//   const handleGenerate = () => {
//     if (!userData.name || !userData.email) {
//       alert('Please enter your name and email');
//       return;
//     }

//     if (!userData.selectedTemplate) {
//       alert('Please select a template');
//       return;
//     }

//     if (!userData.userPhoto) {
//       alert('Please upload a photo');
//       return;
//     }

//     setUserData({ ...userData, isLoading: true });

//     // Simulate processing
//     setTimeout(() => {
//       setUserData({
//         ...userData,
//         showOutput: true,
//         isLoading: false
//       });
//     }, 2000);
//   };

//   const handleReset = () => {
//     setUserData({
//       name: '',
//       email: '',
//       whatsappNo: '',
//       selectedTemplate: null,
//       userPhoto: null,
//       showOutput: false,
//       isLoading: false,
//       aiEnhance: true,
//       addBorder: false
//     });
//   };

//   const handleDownload = () => {
//     alert('Download functionality would be implemented here');
//     // In a real app, you would generate and download the image
//   };

//   const handleShare = () => {
//     alert('Share functionality would be implemented here');
//   };

//   const toggleAIEnhance = () => {
//     setUserData({ ...userData, aiEnhance: !userData.aiEnhance });
//   };

//   const toggleAddBorder = () => {
//     setUserData({ ...userData, addBorder: !userData.addBorder });
//   };

//   return (
//     <div className="split-screen">
//       {/* Left Panel - Controls */}
//       <div className="control-panel">
//         <div className="logo">
//           <div className="logo-icon">
//             <i className="fas fa-camera"></i>
//           </div>
//           <div className="logo-text">
//             <h1>PhotoStudio</h1>
//             <p>CREATIVE STUDIO</p>
//           </div>
//         </div>

//         {/* User Information */}
//         <div className="control-section">
//           <div className="section-title">
//             <div className="section-icon">
//               <i className="fas fa-user"></i>
//             </div>
//             <span>User Information</span>
//           </div>

//           <div className="form-group">
//             <label className="form-label" htmlFor="name">
//               <i className="fas fa-user-circle"></i>
//               Full Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={userData.name}
//               onChange={handleInputChange}
//               className="form-input"
//               placeholder="Enter your name"
//             />
//           </div>

//           <div className="form-group">
//             <label className="form-label" htmlFor="email">
//               <i className="fas fa-envelope"></i>
//               Email Address
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={userData.email}
//               onChange={handleInputChange}
//               className="form-input"
//               placeholder="your@email.com"
//             />
//           </div>

//           {/* <div className="form-group">
//             <label className="form-label" htmlFor="document">
//               <i className="fas fa-id-card"></i>
//               Document Type
//             </label>
//             <select id="document" className="form-input">
//               <option value="" disabled selected>Select document type</option>
//               <option value="passport">Passport</option>
//               <option value="id">ID Card</option>
//               <option value="license">Driver's License</option>
//             </select>
//           </div> */}

//           <div className="form-group">
//             <label className="form-label" htmlFor="whatsapp">
//               <i className="fab fa-whatsapp"></i>
//               WhatsApp Number
//             </label>
//             <input
//               type="tel"
//               id="whatsapp"
//               name="whatsappNo"
//               value={userData.whatsappNo}
//               onChange={handleInputChange}
//               className="form-input"
//               placeholder="+1 234 567 8900"
//             />
//           </div>
//         </div>

//         {/* Template Selection */}
//         <div className="control-section">
//           <div className="section-title">
//             <div className="section-icon">
//               <i className="fas fa-palette"></i>
//             </div>
//             <span>Template Style</span>
//           </div>

//           <div className="template-selector">
//             {templates.map((template, index) => (
//               <div
//                 key={template.id}
//                 className={`template-tab ${userData.selectedTemplate?.id === template.id ? 'active' : ''}`}
//                 onClick={() => handleTemplateSelect(template)}
//                 data-template={template.name.toLowerCase().replace(/\s+/g, '')}
//               >
//                 <i className={index % 3 === 0 ? "fas fa-image" : index % 3 === 1 ? "fas fa-id-card" : "fas fa-newspaper"}></i>
//                 <div style={{ marginTop: '8px' }}>{template.name}</div>
//               </div>
//             ))}
//           </div>

//           {/* <div className="effects-toggle">
//             <div className="toggle-label">
//               <i className="fas fa-magic"></i>
//               <span>AI Enhancements</span>
//             </div>
//             <label className="toggle-switch">
//               <input
//                 type="checkbox"
//                 className="toggle-checkbox"
//                 checked={userData.aiEnhance}
//                 onChange={toggleAIEnhance}
//               />
//               <span className="toggle-slider"></span>
//             </label>
//           </div> */}

//           {/* <div className="effects-toggle">
//             <div className="toggle-label">
//               <i className="fas fa-border-style"></i>
//               <span>Add Border</span>
//             </div>
//             <label className="toggle-switch">
//               <input
//                 type="checkbox"
//                 className="toggle-checkbox"
//                 checked={userData.addBorder}
//                 onChange={toggleAddBorder}
//               />
//               <span className="toggle-slider"></span>
//             </label>
//           </div> */}
//         </div>

//         {/* Photo Upload */}
//         <div className="control-section">
//           <div className="section-title">
//             <div className="section-icon">
//               <i className="fas fa-cloud-upload-alt"></i>
//             </div>
//             <span>Upload Photo</span>
//           </div>

//           <div className="upload-container">
//             <div
//               className="upload-area"
//               id="uploadArea"
//               onClick={triggerFileInput}
//               onDragOver={handleDragOver}
//               onDrop={handleDrop}
//             >
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 accept=".jpg,.jpeg,.png,.gif"
//                 onChange={handlePhotoUpload}
//                 style={{ display: 'none' }}
//               />

//               {userData.userPhoto ? (
//                 <>
//                   <div className="upload-icon" style={{ color: '#dc2626' }}>
//                     <i className="fas fa-check-circle"></i>
//                   </div>
//                   <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
//                     Photo Uploaded!
//                   </div>
//                   <div style={{ color: '#64748B', fontSize: '14px' }}>
//                     Ready for processing
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="upload-icon">
//                     <i className="fas fa-file-upload"></i>
//                   </div>
//                   <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
//                     Drop your photo here
//                   </div>
//                   <div style={{ color: '#64748B', fontSize: '14px' }}>
//                     JPG, PNG, GIF up to 10MB
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Generate Button */}
//         <div className="generate-section">
//           <button
//             className="generate-btn"
//             id="generateBtn"
//             onClick={handleGenerate}
//             disabled={!userData.name || !userData.email || !userData.selectedTemplate || !userData.userPhoto}
//           >
//             <i className="fas fa-sparkles"></i>
//             Generate Custom Photo
//           </button>
//         </div>
//       </div>

//       {/* Right Panel - Preview */}
//       <div className="preview-panel">
//         <div className="preview-header">
//           <div className="preview-title">Live Preview</div>
//           <div className="preview-actions">
//             <button className="preview-btn" onClick={handleDownload}>
//               <i className="fas fa-download"></i>
//               Export
//             </button>
//             <button className="preview-btn" onClick={handleShare}>
//               <i className="fas fa-share-alt"></i>
//               Share
//             </button>
//             <button className="preview-btn" onClick={handleReset}>
//               <i className="fas fa-redo"></i>
//               Reset
//             </button>
//           </div>
//         </div>

//         <div className="preview-container">
//           <div className="preview-frame">
//             {userData.showOutput && userData.selectedTemplate && userData.userPhoto ? (
//               <div className="final-template-preview">
//                 <img
//                   src={userData.selectedTemplate.image}
//                   alt="Template"
//                   className="template-bg-preview"
//                 />
//                 <div
//                   className="user-photo-mask-preview"
//                   style={{
//                     top: userData.selectedTemplate.photoArea.top,
//                     left: userData.selectedTemplate.photoArea.left,
//                     width: userData.selectedTemplate.photoArea.width,
//                     height: userData.selectedTemplate.photoArea.height,
//                     borderRadius: userData.selectedTemplate.photoArea.borderRadius,
//                     overflow: 'hidden',
//                     position: 'absolute'
//                   }}
//                 >
//                   <img
//                     src={userData.userPhoto}
//                     alt="User"
//                     className="user-photo-preview"
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       objectFit: 'cover'
//                     }}
//                   />
//                 </div>
//                 <div className="user-details-overlay">
//                   <div className="preview-user-name">{userData.name || 'Your Name'}</div>
//                   <div className="preview-user-email">{userData.email || 'your.email@example.com'}</div>
//                 </div>
//               </div>
//             ) : userData.selectedTemplate && userData.userPhoto ? (
//               <div className="live-preview-content">
//                 <img
//                   src={userData.selectedTemplate.image}
//                   alt="Template"
//                   className="template-bg-preview"
//                 />
//                 <div
//                   className="user-photo-mask-preview"
//                   style={{
//                     top: userData.selectedTemplate.photoArea.top,
//                     left: userData.selectedTemplate.photoArea.left,
//                     width: userData.selectedTemplate.photoArea.width,
//                     height: userData.selectedTemplate.photoArea.height,
//                     borderRadius: userData.selectedTemplate.photoArea.borderRadius,
//                     overflow: 'hidden',
//                     position: 'absolute'
//                   }}
//                 >
//                   <img
//                     src={userData.userPhoto}
//                     alt="User"
//                     className="user-photo-preview"
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       objectFit: 'cover'
//                     }}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div className="preview-placeholder">
//                 <i className="fas fa-camera"></i>
//                 <div style={{ fontSize: '20px', fontWeight: '600', margin: '16px 0' }}>
//                   Photo Preview
//                 </div>
//                 <div style={{ color: '#64748B', maxWidth: '300px' }}>
//                   Your generated photo will appear here in real-time
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientPageUser;
// const CameraModal = ({ template, onCapture }) => {
//   const videoRef = useRef(null);
//   const [stream, setStream] = useState(null);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: 'user' }
//       });
//       setStream(stream);
//       videoRef.current.srcObject = stream;
//     } catch (err) {
//       console.error('Camera error:', err);
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//     }
//   };

//   const capture = () => {
//     const canvas = document.createElement('canvas');
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext('2d');

//     ctx.drawImage(video, 0, 0);

//     // Draw template overlay
//     if (template) {
//       const img = new Image();
//       img.onload = () => {
//         ctx.globalAlpha = 0.5;
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//         onCapture(canvas.toDataURL('image/jpeg'));
//       };
//       img.src = template.image;
//     }
//   };

//   useEffect(() => {
//     startCamera();
//     return stopCamera;
//   }, []);

//   return (
//     <Box sx={{ position: 'relative', width: '100%' }}>
//       <video
//         ref={videoRef}
//         autoPlay
//         style={{ width: '100%', borderRadius: '8px' }}
//       />
//       {template && (
//         <Box
//           component="img"
//           src={template.image}
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             opacity: 0.4,
//             pointerEvents: 'none'
//           }}
//         />
//       )}
//       <Button
//         onClick={capture}
//         variant="contained"
//         color="error"
//         sx={{ mt: 2, width: '100%' }}
//       >
//         Capture with Template
//       </Button>
//     </Box>
//   );
// };
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Paper,
  Chip,
  LinearProgress,
  Avatar,
  Snackbar,
  Alert,
  Tooltip,
  Fade,
  useMediaQuery,
  useTheme,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  CameraAlt as CameraIcon,
  Palette as PaletteIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  AutoAwesome as AutoAwesomeIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Done as DoneIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  WhatsApp,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import heic2any from "heic2any";
// Import template images from src/images
import template1 from "../images/template1.jpg";
import template2 from "../images/template2.png";
import template3 from "../images/template3.png";
import template4 from "../images/template4.png";
import template5 from "../images/template5.png";
import template6 from "../images/template6.png";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";

const CameraModal = ({ open, onClose, template, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user"); // 'user' or 'environment'
  const [isCapturing, setIsCapturing] = useState(false);

  // Start camera when modal opens
  useEffect(() => {
    if (open) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, facingMode]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !template) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Create an off-screen canvas for the template
    const templateCanvas = document.createElement("canvas");
    const templateCtx = templateCanvas.getContext("2d");

    // Load template image
    const templateImg = new Image();
    templateImg.crossOrigin = "anonymous";
    templateImg.onload = () => {
      // Set template canvas size
      templateCanvas.width = canvas.width;
      templateCanvas.height = canvas.height;

      // Draw template as overlay (semi-transparent frame)
      // templateCtx.globalAlpha = 0.9; // Adjust transparency
      templateCtx.drawImage(
        templateImg,
        0,
        0,
        templateCanvas.width,
        templateCanvas.height
      );

      // Draw the template overlay onto the main canvas
      context.globalAlpha = 0.5;
      context.drawImage(templateCanvas, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // Call the capture callback
      onCapture(photoDataUrl);
      setIsCapturing(false);

      // Close camera
      stopCamera();
      onClose();
    };

    templateImg.src = template.image;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        style: {
          backgroundColor: "#000",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close button */}
        <IconButton
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            color: "white",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>

        {/* Camera view with template overlay */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            //overflow: 'hidden',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "20%",
              left: "50%",
              top: "50%",
              height: "100%",
              objectFit: "cover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          {/* Template frame overlay */}
          {template && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                //left: "20%",
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={template.image}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  //opacity: 0.5, // Semi-transparent frame
                  //border: '2px dashed rgba(255,255,255,0.5)',
                  //borderRadius: template.photoArea?.borderRadius || '8px'
                }}
              />
            </Box>
          )}

          {/* Capture area indicator */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "25%",
              height: "100%",
              border: "2px solid rgba(211, 47, 47, 0.8)",
              borderRadius: "12px",
              boxShadow: "0 0 0 1000px rgba(0,0,0,0.5)",
              pointerEvents: "none",
            }}
          />
        </Box>

        {/* Camera controls */}
        <Box
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          {/* Switch camera button */}
          <IconButton
            onClick={switchCamera}
            sx={{
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            <FlipCameraIosIcon />
          </IconButton>

          {/* Capture button */}
          <Button
            variant="contained"
            onClick={capturePhoto}
            disabled={isCapturing}
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              minWidth: "auto",
              backgroundColor: "#d32f2f",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
            }}
          >
            <CameraIcon sx={{ fontSize: 32 }} />
          </Button>

          {/* Placeholder for symmetry */}
          <Box sx={{ width: 48 }} />
        </Box>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </Box>
    </Dialog>
  );
};
// Styled Components

const RedGradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
  color: "white",
  padding: "12px 24px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "15px",
  textTransform: "none",
  boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(45deg, #b71c1c 0%, #8b0000 100%)",
    boxShadow: "0 6px 16px rgba(211, 47, 47, 0.4)",
    transform: "translateY(-2px)",
  },
  "&:disabled": {
    background: "linear-gradient(45deg, #ffcdd2 0%, #ef9a9a 100%)",
    color: "#858585ff",
  },
}));

const TemplateCard = styled(Card)(({ theme, selected }) => ({
  cursor: "pointer",
  borderRadius: "8px",
  border: selected ? "2px solid #1fc54bff" : "1px solid #e0e0e0",
  overflow: "hidden",
  transition: "all 0.3s ease",
  position: "relative",
  height: "150px",
  // width: "110px",
  flexShrink: 0,
  margin: "0 6px",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
    borderColor: selected ? "#1fc54bff" : "#ff5252",
  },
  "&::after": selected
    ? {
        content: '"✓"',
        position: "absolute",
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        background: "#1fc54bff",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "10px",
        fontWeight: "bold",
        zIndex: 2,
      }
    : {},
}));

const UploadArea = styled(Paper)(({ theme, hasimage }) => ({
  border: hasimage === "true" ? "2px dashed #4caf50" : "2px dashed #d32f2f",
  borderRadius: "10px",
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: hasimage === "true" ? "#f8f9fa" : "#fff",
  minHeight: "180px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(1.5),
  "&:hover": {
    backgroundColor: hasimage === "true" ? "#f1f8e9" : "#ffebee",
    transform: "translateY(-2px)",
  },
}));

const PreviewContainer = styled(Paper)(({ theme }) => ({
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  position: "relative",
  backgroundColor: "#fff",
  height: "calc(100vh - 200px)",
  minHeight: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const TemplateSlider = styled(Box)(({ theme }) => ({
  position: "relative",
  margin: theme.spacing(2, 0),
  width: "100%",
  height: "180px",
  display: "flex",
  alignItems: "center",
}));

const ScrollableContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "784px", // 5 templates * 108px each (100px width + 8px margin)
  overflowX: "auto",
  scrollbarWidth: "thin",
  scrollbarColor: "#d32f2f transparent",
  padding: theme.spacing(1, 1),
  scrollBehavior: "smooth",
  height: "100%",
  alignItems: "center",
  // overflow: "hidden",
  position: "relative",
  gap: "10px",
  "&::-webkit-scrollbar": {
    height: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f5f5f5",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
    borderRadius: "4px",
    "&:hover": {
      background: "linear-gradient(45deg, #b71c1c 0%, #8b0000 100%)",
    },
  },
  // Hide scrollbar on mobile
  [theme.breakpoints.down("sm")]: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
    scrollbarWidth: "none",
  },
}));

const NavigationButton = styled(IconButton)(({ theme, direction }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  background: "white",
  border: "2px solid rgba(211, 47, 47, 0.3)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  zIndex: 10,
  width: "36px",
  height: "36px",
  "&:hover": {
    background: "#f5f5f5",
    borderColor: "#d32f2f",
    transform: "translateY(-50%) scale(1.1)",
  },
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
  ...(direction === "left"
    ? {
        left: 5,
      }
    : {
        right: 5,
      }),
}));

const ClientPageUser = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    whatsappNo: "",
    selectedTemplate: null,
    userPhoto: null,
    showOutput: false,
    isLoading: false,
    mergedPhoto: null, // Add merged photo state
  });
  const [cameraState, setCameraState] = useState({
    isCameraOpen: false,
    stream: null,
    videoRef: null,
    canvasRef: null,
    isCapturing: false,
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Open camera with template
  const openCamera = () => {
    if (!userData.selectedTemplate) {
      setErrors((prev) => ({
        ...prev,
        template: "Please select a template first to use camera with frame",
      }));
      return;
    }

    // Check if browser supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera is not supported in your browser");
      return;
    }

    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
  };

  const handleCameraCapture = (photoDataUrl) => {
    setUserData((prev) => ({ ...prev, userPhoto: photoDataUrl }));
    setErrors((prev) => ({ ...prev, photo: "" }));
  };

  // Trigger file input
  // const triggerFileInput = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click();
  //   }
  // };
  // State for errors
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    whatsappNo: "",
    template: "",
    photo: "",
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // Templates with photo mask areas for fitting
  const templates = [
    {
      id: 1,
      name: "Professional Red",
      image: template1,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#d32f2f",
    },
    {
      id: 2,
      name: "Modern VIP",
      image: template6,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#1976d2",
    },
    {
      id: 3,
      name: "Elegant Style",
      image: template3,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#388e3c",
    },
    {
      id: 4,
      name: "Premium Card",
      image: template4,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#7b1fa2",
    },
    {
      id: 5,
      name: "Business Red",
      image: template5,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#d32f2f",
    },
    {
      id: 6,
      name: "Minimalist",
      image: template2,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#616161",
    },
    {
      id: 7,
      name: "Classic Blue",
      image: template1,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#1565c0",
    },
    {
      id: 8,
      name: "Gold Premium",
      image: template2,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#ff9800",
    },
    {
      id: 9,
      name: "Modern Black",
      image: template3,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#212121",
    },
    {
      id: 10,
      name: "Vibrant Green",
      image: template4,
      photoArea: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        borderRadius: "0%",
      },
      color: "#2e7d32",
    },
  ];
  // Validation functions
  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]*$/.test(value.trim())) {
          error = "Name can only contain letters and spaces";
        }
        break;

      // case 'email':
      //   // if (!value) {
      //   //   error = 'Email is required';
      //   // } else
      //   //   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      //   //   error = 'Please enter a valid email address';
      //   // }
      //   break;

      case "whatsappNo":
        if (!value) {
          error = "WhatsApp number is required";
        } else if (!/^[\d+()\-\s]+$/.test(value)) {
          error = "Only numbers, +, -, (, ), and spaces are allowed";
        } else {
          // Remove all non-digit characters to check the actual number count
          const digitsOnly = value.replace(/\D/g, "");
          if (digitsOnly.length < 8) {
            error = "Phone number must have at least 8 digits";
          } else if (digitsOnly.length > 15) {
            error = "Phone number is too long";
          }
        }
        break;

      case "template":
        if (!value) {
          error = "Please select a template";
        }
        break;

      case "photo":
        if (!value) {
          error = "Please upload a photo";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!userData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (userData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Validate email
    // if (!userData.email) {
    //   newErrors.email = 'Email is required';
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    //   newErrors.email = 'Please enter a valid email address';
    // }

    // Validate WhatsApp number (optional validation)
    if (
      userData.whatsappNo &&
      !/^(\+?\d{1,4}[\s-]?)?(\(?\d{1,}\)?[\s-]?)?[\d\s-]{8,}$/.test(
        userData.whatsappNo
      )
    ) {
      newErrors.whatsappNo = "Please enter a valid phone number";
    }

    // Validate template selection
    if (!userData.selectedTemplate) {
      newErrors.template = "Please select a template";
    }

    // Validate photo
    if (!userData.userPhoto) {
      newErrors.photo = "Please upload a photo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      userData.name &&
      userData.name.trim().length >= 2 &&
      // /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email) &&
      (!userData.whatsappNo ||
        /^(\+?\d{1,4}[\s-]?)?(\(?\d{1,}\)?[\s-]?)?[\d\s-]{8,}$/.test(
          userData.whatsappNo
        )) &&
      userData.selectedTemplate &&
      userData.userPhoto &&
      !userData.isLoading
    );
  };

  useEffect(() => {
    const checkScrollButtons = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    // Initial check
    checkScrollButtons();

    // Add event listener for scroll
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "whatsappNo") {
      // Only allow digits, plus sign, parentheses, hyphens, and spaces
      const sanitizedValue = value.replace(/[^\d+()\-\s]/g, "");
      setUserData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // setUserData({ ...userData, [name]: value });
  };

  const handleTemplateSelect = (template) => {
    setUserData({ ...userData, selectedTemplate: template });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // File validation
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          photo: "Please upload a valid image file",
        }));
        return;
      }
      if (!file.type.match("image.*")) {
        setSnackbar({
          open: true,
          message: "Please upload a valid image file",
          severity: "error",
        });
        return;
      }
      // List of common image MIME types including iPhone images
      const allowedTypes = [
        "image/jpeg", // .jpg, .jpeg
        "image/jpg", // .jpg
        "image/png", // .png
        "image/gif", // .gif
        "image/webp", // .webp
        "image/bmp", // .bmp
        "image/tiff", // .tiff, .tif (common in iPhone)
        "image/heic", // iPhone HEIC format
        "image/heif", // iPhone HEIF format
        "image/svg+xml", // SVG
      ];

      // iPhone specific formats
      const isIphoneImage =
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif");

      const maxSize = 10 * 1024 * 1024; // 10MB
      // Check file type (allow all image types)
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          photo:
            "Invalid file type. Please upload an image file (JPG, PNG, GIF, WebP, HEIC, etc.)",
        }));
        return;
      }

      if (file.size > maxSize) {
        // 10MB limit
        setSnackbar({
          open: true,
          message: "File size should be less than 10MB",
          severity: "error",
        });
        setErrors((prev) => ({
          ...prev,
          photo: `File size too large (${(file.size / (1024 * 1024)).toFixed(
            1
          )}MB). Maximum 10MB allowed`,
        }));
        return;
      }
      // Handle HEIC/HEIF conversion
      let processedFile = file;

      if (
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif")
      ) {
        try {
          // Convert HEIC to JPEG
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });

          processedFile = new File(
            [convertedBlob],
            file.name.replace(/\.(heic|heif)$/i, ".jpg"),
            { type: "image/jpeg" }
          );
        } catch (error) {
          // HEIC conversion error
          setErrors((prev) => ({
            ...prev,
            photo:
              "This iPhone image format cannot be processed. Please convert it to JPG/PNG first.",
          }));
          return;
        }
      }

      setErrors((prev) => ({ ...prev, photo: "" }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, userPhoto: reader.result });
        reader.onerror = () => {
          setErrors((prev) => ({
            ...prev,
            photo: "Error reading the image file. Please try another image.",
          }));
        };
        setSnackbar({
          open: true,
          message: "Photo uploaded successfully!",
          severity: "success",
        });
      };
      reader.readAsDataURL(processedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleGenerate = async () => {
    if (!userData.name || !userData.whatsappNo) {
      setSnackbar({
        open: true,
        message: "Please enter your name and whatsapp number",
        severity: "warning",
      });
      return;
    }

    if (!userData.selectedTemplate) {
      setSnackbar({
        open: true,
        message: "Please select a template",
        severity: "warning",
      });
      return;
    }

    if (!userData.userPhoto) {
      setSnackbar({
        open: true,
        message: "Please upload a photo",
        severity: "warning",
      });
      return;
    }

    setUserData({ ...userData, isLoading: true });
    try {
      // Prepare data to send to backend
      const formData = new FormData();

      // Convert base64 image to blob
      const userPhotoBlob = await fetch(userData.userPhoto).then((res) =>
        res.blob()
      );
      formData.append("userPhoto", userPhotoBlob, "user-photo.jpg");

      // Add template data
      formData.append("templateId", userData.selectedTemplate.id);
      formData.append("templateName", userData.selectedTemplate.name);
      formData.append("templateImage", userData.selectedTemplate.image);

      // Add user details
      formData.append("userName", userData.name);
      formData.append("userEmail", userData.email);
      formData.append("whatsappNo", userData.whatsappNo);

      // Add photo area info
      formData.append(
        "photoArea",
        JSON.stringify(userData.selectedTemplate.photoArea)
      );

      // Call backend API to merge images
      // Replace with your actual backend endpoint
      const response = await fetch("YOUR_BACKEND_API_ENDPOINT", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to merge images");
      }

      // Get the merged image from response
      const blob = await response.blob();
      const mergedImageUrl = URL.createObjectURL(blob);

      // Update state with merged photo
      setUserData({
        ...userData,
        isLoading: false,
        showOutput: true,
        mergedPhoto: mergedImageUrl,
      });

      setSnackbar({
        open: true,
        message: "Photo merged successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error merging images:", error);
      setSnackbar({
        open: true,
        message: "Failed to merge images. Please try again.",
        severity: "error",
      });

      // Fall back to client-side preview if backend fails
      setUserData({
        ...userData,
        isLoading: false,
        showOutput: true,
        mergedPhoto: null, // Show preview instead
      });
    }
    // Simulate processing
    // setTimeout(() => {
    //   setUserData({
    //     ...userData,
    //     showOutput: true,
    //     isLoading: false,
    //   });
    //   setSnackbar({
    //     open: true,
    //     message: "Photo generated successfully!",
    //     severity: "success",
    //   });
    // }, 2000);
  };

  const handleReset = () => {
    setUserData({
      name: "",
      email: "",
      whatsappNo: "",
      selectedTemplate: null,
      userPhoto: null,
      showOutput: false,
      isLoading: false,
      mergedPhoto: null,
    });
    setSnackbar({
      open: true,
      message: "All fields have been reset",
      severity: "info",
    });
  };

  const handleDownload = () => {
    if (userData.mergedPhoto) {
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = userData.mergedPhoto;
      link.download = `merged-photo-${userData.name || "user"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: "Photo downloaded successfully!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: "No merged photo available to download",
        severity: "warning",
      });
    }
  };

  const handleShare = () => {
    setSnackbar({
      open: true,
      message: "Share functionality would be implemented here",
      severity: "info",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: -containerWidth / 2,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: containerWidth / 2,
        behavior: "smooth",
      });
    }
  };

  const scrollToTemplate = (templateId) => {
    if (scrollContainerRef.current) {
      const templateIndex = templates.findIndex((t) => t.id === templateId);
      if (templateIndex !== -1) {
        const cardWidth = scrollContainerRef.current.clientWidth / 5;
        scrollContainerRef.current.scrollTo({
          left: templateIndex * cardWidth,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: isMobile ? "100vh" : "50vh",
        background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
        py: 3,
        px: { xs: 2, sm: 3, md: 4 },
        // display: "flex",
        // alignItems: "center",
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Grid container spacing={3}>
          {/* Left Panel - Controls */}
          <Grid
            item
            xs={12}
            md={8}
            lg={8.4}
            sx={{ height: isMobile ? "100%" : "93vh" }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: "16px",
                p: 2,
                background: "white",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <Box ssx={{ mb: 3 }}>
                {/* <Avatar sx={{ 
                  bgcolor: '#d32f2f', 
                  width: 56, 
                  height: 56,
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
                }}>
                  <CameraIcon sx={{ fontSize: 32 }} />
                </Avatar> */}

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background:
                      "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 0.5,
                  }}
                >
                  Photo Merge Maker
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#666",
                    fontWeight: 500,
                    letterSpacing: "1px",
                    fontSize: "0.95rem",
                  }}
                >
                  CREATE STUNNING PHOTOS
                </Typography>
                <Divider
                  sx={{ mt: 2, mb: 3, borderColor: "rgba(0,0,0,0.08)" }}
                />
              </Box>

              {/* User Information Section */}
              <Box sx={{ flex: 1, overflow: "auto", px: 1 }}>
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background:
                          "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 22, color: "white" }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#333" }}
                    >
                      User Information
                    </Typography>
                  </Box>
                  {isMobile ? (
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} md={6} sx={{ minWidth: "100%" }}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="name"
                          value={userData.name}
                          onChange={handleInputChange}
                          onBlur={(e) => validateField("name", e.target.value)}
                          placeholder="Enter your name"
                          variant="outlined"
                          size="medium"
                          error={!!errors.name}
                          helperText={errors.name}
                          InputProps={{
                            sx: {
                              borderRadius: "10px",
                              background: "#f8f9fa",
                            },
                            startAdornment: (
                              <PersonIcon
                                sx={{
                                  mr: 0.5,
                                  fontSize: 18,
                                  color: errors.name
                                    ? "error.main"
                                    : "text.secondary",
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ minWidth: "100%" }}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          onBlur={(e) => validateField("email", e.target.value)}
                          placeholder="your@email.com"
                          variant="outlined"
                          size="medium"
                          error={!!errors.email}
                          helperText={errors.email}
                          InputProps={{
                            sx: {
                              borderRadius: "10px",
                              background: "#f8f9fa",
                            },
                            startAdornment: (
                              <EmailIcon
                                sx={{
                                  mr: 0.5,
                                  fontSize: 18,
                                  color: errors.email
                                    ? "error.main"
                                    : "text.secondary",
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ minWidth: "100%" }}>
                        <TextField
                          fullWidth
                          label="WhatsApp Number"
                          name="whatsappNo"
                          value={userData.whatsappNo}
                          onChange={handleInputChange}
                          onBlur={(e) =>
                            validateField("whatsappNo", e.target.value)
                          }
                          placeholder="1234567890"
                          variant="outlined"
                          size="medium"
                          error={!!errors.whatsappNo}
                          helperText={errors.whatsappNo}
                          sx={{
                            "& .MuiFormHelperText-root": {
                              maxWidth: "100%", // or specific width like '300px'
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                            },
                          }}
                          InputProps={{
                            sx: {
                              borderRadius: "10px",
                              background: "#f8f9fa",
                            },
                            startAdornment: (
                              <WhatsAppIcon
                                sx={{
                                  mr: 0.5,
                                  fontSize: 18,
                                  color: errors.whatsappNo
                                    ? "error.main"
                                    : "text.secondary",
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="name"
                          value={userData.name}
                          onChange={handleInputChange}
                          onBlur={(e) => validateField("name", e.target.value)}
                          placeholder="Enter your name"
                          variant="outlined"
                          size="medium"
                          error={!!errors.name}
                          helperText={errors.name}
                          InputProps={{
                            sx: {
                              borderRadius: "10px",
                              background: "#f8f9fa",
                            },
                            startAdornment: (
                              <PersonIcon
                                sx={{
                                  mr: 0.5,
                                  fontSize: 18,
                                  color: errors.name
                                    ? "error.main"
                                    : "text.secondary",
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          onBlur={(e) => validateField("email", e.target.value)}
                          placeholder="your@email.com"
                          variant="outlined"
                          size="medium"
                          error={!!errors.email}
                          helperText={errors.email}
                          InputProps={{
                            sx: {
                              borderRadius: "10px",
                              background: "#f8f9fa",
                            },
                            startAdornment: (
                              <EmailIcon
                                sx={{
                                  mr: 0.5,
                                  fontSize: 18,
                                  color: errors.email
                                    ? "error.main"
                                    : "text.secondary",
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="WhatsApp Number"
                          name="whatsappNo"
                          value={userData.whatsappNo}
                          onChange={handleInputChange}
                          onBlur={(e) =>
                            validateField("whatsappNo", e.target.value)
                          }
                          placeholder="1234567890"
                          variant="outlined"
                          size="medium"
                          error={!!errors.whatsappNo}
                          helperText={errors.whatsappNo}
                          sx={{
                            "& .MuiFormHelperText-root": {
                              maxWidth: "100%", // or specific width like '300px'
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                            },
                          }}
                          InputProps={{
                            sx: {
                              borderRadius: "10px",
                              background: "#f8f9fa",
                            },
                            startAdornment: (
                              <WhatsAppIcon
                                sx={{
                                  mr: 0.5,
                                  fontSize: 18,
                                  color: errors.whatsappNo
                                    ? "error.main"
                                    : "text.secondary",
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>

                {/* Template Selection with Scrollable Slider and Arrows */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "10px",
                          background:
                            "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PaletteIcon sx={{ fontSize: 22, color: "white" }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#333" }}
                      >
                        Choose Template
                      </Typography>
                    </Box>
                    <Chip
                      label={`${templates.length} templates`}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem", height: "24px" }}
                    />
                  </Box>
                  <TemplateSlider>
                    {/* Left Navigation Button */}
                    {canScrollLeft && (
                      <NavigationButton
                        direction="left"
                        onClick={scrollLeft}
                        size="small"
                        sx={{
                          opacity: canScrollLeft ? 1 : 0.5,
                          pointerEvents: canScrollLeft ? "auto" : "none",
                        }}
                      >
                        <ChevronLeftIcon
                          sx={{ fontSize: 22, color: "#d32f2f" }}
                        />
                      </NavigationButton>
                    )}

                    <ScrollableContainer ref={scrollContainerRef}>
                      {templates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          selected={
                            userData.selectedTemplate?.id === template.id
                          }
                          onClick={() => {
                            handleTemplateSelect(template);
                            scrollToTemplate(template.id);
                          }}
                          //sx={{ width: { xs: '160px', sm: '140px' } }}
                        >
                          <CardContent
                            sx={{ p: "0px !important", height: "100%" }}
                          >
                            <Box sx={{ height: "100%", position: "relative" }}>
                              {/* Template Image Preview */}
                              {/* <Box
                              sx={{
                                height: "100px",
                                position: "relative",
                                //overflow: 'hidden',
                                backgroundColor: "#f5f5f5",
                              }}
                            > */}
                              <img
                                src={template.image}
                                alt={template.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  // filter:
                                  //   userData.selectedTemplate?.id ===
                                  //   template.id
                                  //     ? "brightness(0.9)"
                                  //     : "brightness(1)",
                                }}
                              />
                              {/* Photo Area Overlay */}
                              {/* <Box
                                sx={{
                                  position: 'absolute',
                                  top: template.photoArea.top,
                                  left: template.photoArea.left,
                                  width: template.photoArea.width,
                                  height: template.photoArea.height,
                                  borderRadius: template.photoArea.borderRadius,
                                  border: userData.selectedTemplate?.id === template.id 
                                    ? '2px solid #d32f2f' 
                                    : '1px dashed rgba(211, 47, 47, 0.3)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {userData.selectedTemplate?.id === template.id && (
                                  <Box sx={{ 
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    width: 20,
                                    height: 20,
                                    bgcolor: '#d32f2f',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                  }}>
                                    <CameraIcon sx={{ fontSize: 10, color: 'white' }} />
                                  </Box>
                                )}
                              </Box> */}
                              {/* </Box> */}

                              {/* Template Name */}
                              {/* <Box sx={{ 
                              p: 1.5, 
                              flexGrow: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: userData.selectedTemplate?.id === template.id ? 'rgba(211, 47, 47, 0.05)' : 'transparent',
                              borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                            }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  textAlign: 'center',
                                  fontSize: '0.875rem',
                                  color: userData.selectedTemplate?.id === template.id ? '#d32f2f' : 'text.primary'
                                }}
                                noWrap
                              >
                                {template.name}
                              </Typography>
                            </Box> */}
                            </Box>
                          </CardContent>
                        </TemplateCard>
                      ))}
                    </ScrollableContainer>

                    {/* Right Navigation Button */}
                    {canScrollRight && (
                      <NavigationButton
                        direction="right"
                        onClick={scrollRight}
                        size="small"
                        sx={{
                          opacity: canScrollRight ? 1 : 0.5,
                          pointerEvents: canScrollRight ? "auto" : "none",
                        }}
                      >
                        <ChevronRightIcon
                          sx={{ fontSize: 18, color: "#d32f2f" }}
                        />
                      </NavigationButton>
                    )}
                  </TemplateSlider>
                  {/* Navigation Hint */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: 1,
                      gap: 0.75,
                      color: "text.secondary",
                    }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: 12, opacity: 0.6 }} />
                    <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
                      {isMobile
                        ? "Swipe or use arrows"
                        : "Scroll or use arrows"}
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 12, opacity: 0.6 }} />
                  </Box>
                  {/* Selected Template Info */}
                  {/* {userData.selectedTemplate && (
                  <Fade in={true}>
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.5,
                        bgcolor: "rgba(211, 47, 47, 0.05)",
                        borderRadius: "6px",
                        border: "1px solid rgba(211, 47, 47, 0.1)",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 100,
                            height: 28,
                            borderRadius: 0.75,
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={userData.selectedTemplate.image}
                            alt="Selected template"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                          >
                            Selected: {userData.selectedTemplate.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.6rem" }}
                          >
                            Photo area highlighted
                          </Typography>
                        </Box>
                        <Chip
                          label={`#${userData.selectedTemplate.id}`}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{
                            fontSize: "0.6rem",
                            height: "18px",
                            minWidth: "30px",
                          }}
                        />
                      </Box>
                    </Box>
                  </Fade>
                )} */}
                </Box>

                {/* Photo Upload */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background:
                          "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <UploadIcon sx={{ fontSize: 22, color: "white" }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#333" }}
                    >
                      Upload Photo
                    </Typography>
                  </Box>
                  {/* Photo Validation Error */}
                  {errors.photo && (
                    <Box sx={{ mb: 2 }}>
                      <Alert
                        severity="error"
                        sx={{ py: 0.5, fontSize: "0.875rem" }}
                      >
                        {errors.photo}
                      </Alert>
                    </Box>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*" // Changed from specific extensions to accept all images
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />

                  <UploadArea
                    hasimage={userData.userPhoto ? "true" : "false"}
                    error={!!errors.photo}
                    // onClick={triggerFileInput}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {userData.userPhoto ? (
                      <>
                        <CheckCircleIcon
                          sx={{ fontSize: 48, color: "#4caf50" }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "#2e7d32",
                          }}
                        >
                          Photo Uploaded Successfully!
                        </Typography>
                        <Box
                          sx={{
                            width: 200,
                            height: 220,
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "3px solid #4caf50",
                            mt: 2,
                          }}
                        >
                          <img
                            src={userData.userPhoto}
                            alt="Uploaded preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Ready for processing
                        </Typography>
                      </>
                    ) : (
                      <>
                        <AddPhotoIcon
                          sx={{
                            fontSize: 48,
                            color: errors.photo ? "error.main" : "#d32f2f",
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: errors.photo ? "error.main" : "#333",
                          }}
                        >
                          {errors.photo
                            ? "Upload Required"
                            : "Drop your photo here"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={errors.photo ? "error.main" : "text.secondary"}
                        >
                          {errors.photo ||
                            "Supports all image formats (JPG, PNG, HEIC, etc.) up to 10MB"}
                        </Typography>
                        <RedGradientButton
                          startIcon={<UploadIcon />}
                          sx={{ mt: 2 }}
                          onClick={triggerFileInput}
                        >
                          Browse Files
                        </RedGradientButton>
                        <RedGradientButton
                          startIcon={<CameraIcon />}
                          onClick={openCamera}
                          disabled={!userData.selectedTemplate}
                          sx={{ flex: 1 }}
                        >
                          Take Photo with Template
                        </RedGradientButton>
                        {/* <Chip
                        icon={<UploadIcon sx={{ fontSize: 12 }} />}
                        label="Click to browse"
                        color="error"
                        variant="outlined"
                        size="small"
                        sx={{ fontSize: "0.65rem", height: "22px" }}
                      /> */}
                      </>
                    )}
                  </UploadArea>
                </Box>

                {/* Generate Button */}
                <Box sx={{ mt: "auto" }}>
                  {userData.isLoading ? (
                    <Box sx={{ width: "100%" }}>
                      <LinearProgress
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          "& .MuiLinearProgress-bar": {
                            background:
                              "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
                            borderRadius: 5,
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        align="center"
                        sx={{ mt: 2, color: "#d32f2f", fontWeight: 600 }}
                      >
                        Processing your photo...
                      </Typography>
                    </Box>
                  ) : (
                    <RedGradientButton
                      fullWidth
                      size="large"
                      startIcon={<AutoAwesomeIcon sx={{ fontSize: 24 }} />}
                      onClick={handleGenerate}
                      disabled={!isFormValid()}
                      sx={{ py: 1.5, fontSize: "16px" }}
                    >
                      Generate Custom Photo
                    </RedGradientButton>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel - Preview */}
          <Grid item xs={12} md={4} lg={3.6}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "16px",
                p: 3,
                background: "white",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                // height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box>
                {/* Preview Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2.5,
                    pb: 1.5,
                    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: "#d32f2f",
                        mb: 1,
                      }}
                    >
                      Live Output
                    </Typography>
                    {userData.mergedPhoto && !userData.isLoading && (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                        label="Generated"
                        color="success"
                        size="small"
                        sx={{ fontSize: "0.7rem", height: "24px" }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.75 }}>
                    <Tooltip title="Download">
                      <IconButton
                        onClick={handleDownload}
                        size="small"
                        disabled={!userData.mergedPhoto || userData.isLoading}
                        sx={{
                          color:
                            userData.mergedPhoto && !userData.isLoading
                              ? "#d32f2f"
                              : "rgba(0, 0, 0, 0.26)",
                          "&:hover": {
                            backgroundColor:
                              userData.mergedPhoto && !userData.isLoading
                                ? "rgba(211, 47, 47, 0.08)"
                                : "transparent",
                          },
                        }}
                      >
                        <DownloadIcon sx={{ fontSize: 30 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton
                        onClick={handleShare}
                        size="small"
                        disabled={!userData.mergedPhoto || userData.isLoading}
                        sx={{
                          color:
                            userData.mergedPhoto && !userData.isLoading
                              ? "#d32f2f"
                              : "rgba(0, 0, 0, 0.26)",
                          "&:hover": {
                            backgroundColor:
                              userData.mergedPhoto && !userData.isLoading
                                ? "rgba(211, 47, 47, 0.08)"
                                : "transparent",
                          },
                        }}
                      >
                        <WhatsApp sx={{ fontSize: 30 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset">
                      <IconButton
                        onClick={handleReset}
                        size="small"
                        disabled={!userData.mergedPhoto || userData.isLoading}
                        sx={{
                          color:
                            userData.mergedPhoto && !userData.isLoading
                              ? "#d32f2f"
                              : "rgba(0, 0, 0, 0.26)",
                          "&:hover": {
                            backgroundColor:
                              userData.mergedPhoto && !userData.isLoading
                                ? "rgba(211, 47, 47, 0.08)"
                                : "transparent",
                          },
                        }}
                      >
                        <RefreshIcon sx={{ fontSize: 30 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Preview Content */}
                <Box
                  sx={{
                    flex: 1,
                    mt: 3,
                    mb: 3,
                  }}
                >
                  <PreviewContainer>
                    {userData.mergedPhoto && !userData.isLoading ? (
                      <Fade in={true} timeout={500}>
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <img
                            src={userData.mergedPhoto}
                            alt="Merged Photo"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                          {/* <Box
                          sx={{
                            position: "absolute",
                            top: userData.selectedTemplate.photoArea.top,
                            left: userData.selectedTemplate.photoArea.left,
                            width: userData.selectedTemplate.photoArea.width,
                            height: userData.selectedTemplate.photoArea.height,
                            borderRadius:
                             userData.selectedTemplate.photoArea.borderRadius,
                            overflow: "hidden",
                             boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                          }}
                        >
                          <img
                            src={userData.userPhoto}
                            alt="User"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box> */}
                          {/* <Box
                          sx={{
                            position: "absolute",
                            bottom: 30,
                            left: 0,
                            right: 0,
                            textAlign: "center",
                            color: "white",
                            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                            padding: 1.5,
                            background:
                              "linear-gradient(transparent, rgba(0,0,0,0.7))",
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              mb: 0.5,
                              fontSize: "1.75rem",
                            }}
                          >
                            {userData.name || "Your Name"}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontSize: "1rem" }}
                          >
                            {userData.email || "your.email@example.com"}
                          </Typography>
                        </Box> */}
                        </Box>
                      </Fade>
                    ) : userData.isLoading ? (
                      // Show loader while processing
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",

                          p: 4,
                        }}
                      >
                        <CircularProgress
                          size={60}
                          thickness={4}
                          sx={{
                            color: "#d32f2f",
                            mb: 3,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "#d32f2f",
                            mb: 1,
                          }}
                        >
                          Merging Photos...
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                          sx={{ maxWidth: 544 }}
                        >
                          Sending your photo and template to backend for
                          processing. This may take a few moments.
                        </Typography>
                        <LinearProgress
                          sx={{
                            width: "100%",
                            maxWidth: 300,
                            height: 8,
                            borderRadius: 4,
                            mt: 3,
                            backgroundColor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              background:
                                "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      //   userData.selectedTemplate && userData.userPhoto ? (
                      //   <Fade in={true} timeout={300}>
                      //     <Box
                      //       sx={{
                      //         position: "relative",
                      //         width: "100%",
                      //         height: "100%",
                      //       }}
                      //     >
                      //       <img
                      //         src={userData.selectedTemplate.image}
                      //         alt="Template"
                      //         style={{
                      //           width: "100%",
                      //           height: "100%",
                      //           objectFit: "cover",
                      //           opacity: 0.8,
                      //         }}
                      //       />
                      //       <Box
                      //         sx={{
                      //           position: "absolute",
                      //           top: userData.selectedTemplate.photoArea.top,
                      //           left: userData.selectedTemplate.photoArea.left,
                      //           width: userData.selectedTemplate.photoArea.width,
                      //           height: userData.selectedTemplate.photoArea.height,
                      //           borderRadius:
                      //           userData.selectedTemplate.photoArea.borderRadius,
                      //           overflow: "hidden",
                      //           border: "3px dashed #d32f2f",
                      //           backgroundColor: "rgba(255,255,255,0.1)",
                      //         }}
                      //       >
                      //         <img
                      //           src={userData.userPhoto}
                      //           alt="User"
                      //           style={{
                      //             width: "100%",
                      //             height: "100%",
                      //             objectFit: "cover",
                      //           }}
                      //         />
                      //       </Box>
                      //       {/* <Typography
                      //         variant="subtitle1"
                      //         sx={{
                      //           position: "absolute",
                      //           bottom: 15,
                      //           left: 0,
                      //           right: 0,
                      //           textAlign: "center",
                      //           color: "white",
                      //           backgroundColor: "rgba(211, 47, 47, 0.8)",
                      //           padding: 0.75,
                      //           borderRadius: 0.75,
                      //           fontSize: "0.95rem",
                      //         }}
                      //       >
                      //         Preview Mode - Click Generate to Create
                      //       </Typography> */}
                      //     </Box>
                      //   </Fade>
                      // ) :
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 4,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "rgba(211, 47, 47, 0.1)",
                            color: "#d32f2f",
                            mb: 3,
                          }}
                        >
                          <CameraIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, mb: 2, color: "#333" }}
                        >
                          Photo Output
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ maxWidth: 544, mx: "auto", fontSize: "0.9rem" }}
                        >
                          Your generated photo will appear here in real-time.
                          Fill in all details and select a template to begin.
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1.5,
                            mt: 3,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            icon={<PersonIcon sx={{ fontSize: 16 }} />}
                            label="Enter Details"
                            color="default"
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            icon={<PaletteIcon sx={{ fontSize: 16 }} />}
                            label="Select Template"
                            color="default"
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            icon={<UploadIcon sx={{ fontSize: 16 }} />}
                            label="Upload Photo"
                            color="default"
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>
                    )}
                  </PreviewContainer>
                </Box>

                {/* Preview Footer */}
                {/* {userData.selectedTemplate && (
                <Box
                  sx={{
                    mt: 2.5,
                    pt: 1.5,
                    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box
                          sx={{
                            width: 50,
                            height: 32,
                            borderRadius: 1,
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={userData.selectedTemplate.image}
                            alt="Template"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                          >
                            Current Template: {userData.selectedTemplate.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            Photo area:{" "}
                            {userData.selectedTemplate.photoArea.width} width,{" "}
                            {userData.selectedTemplate.photoArea.height} height
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: { xs: "flex-start", md: "flex-end" },
                          gap: 0.75,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          {userData.selectedTemplate.id} of {templates.length}{" "}
                          templates
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )} */}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            "& .MuiAlert-icon": {
              alignItems: "center",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Camera Modal */}
      <CameraModal
        open={isCameraOpen}
        onClose={closeCamera}
        template={userData.selectedTemplate}
        onCapture={handleCameraCapture}
      />
    </Box>
  );
};

export default ClientPageUser;
