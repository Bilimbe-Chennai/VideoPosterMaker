const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Readable } = require('stream');
const { getConnection } = require('../InitDB');
const PhotoMergeTemplate = require('../models/PhotoMergeTemplate');
const Media = require('../models/Media');
const { mergeThreeVideos } = require('../utils/videoMerge');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

// Helper: upload buffer to GridFS
async function uploadToGridFS(filename, buffer, contentType) {
    const { bucket } = getConnection();
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, { contentType });
        Readable.from(buffer)
            .pipe(uploadStream)
            .on("error", reject)
            .on("finish", () => resolve(uploadStream.id));
    });
}

function splitBuffer(buffer, separator) {
    const parts = [];
    let start = 0;
    let index;
    while ((index = buffer.indexOf(separator, start)) !== -1) {
        if (index > start) {
            parts.push(buffer.slice(start, index));
        }
        start = index + separator.length;
    }
    if (start < buffer.length) {
        parts.push(buffer.slice(start));
    }
    return parts;
}

// POST create a template
router.post('/template-upload', async (req, res) => {
    try {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            return res.status(400).json({ error: 'Invalid content type' });
        }

        let boundary = contentType.split('boundary=')[1];
        if (boundary) {
            // Remove potential trailing parameters (separated by ;)
            boundary = boundary.split(';')[0].trim();
            // Remove surrounding quotes if present
            if (boundary.startsWith('"') && boundary.endsWith('"')) {
                boundary = boundary.slice(1, -1);
            }
            boundary = '--' + boundary;
        } else {
            return res.status(400).json({ error: 'Boundary not found' });
        }
        let chunks = [];
        req.on('data', (chunk) => {
            chunks.push(chunk);
        });

        req.on('end', async () => {
            try {
                const buffer = Buffer.concat(chunks);
                const boundaryBuffer = Buffer.from(boundary);
                const parts = splitBuffer(buffer, boundaryBuffer).slice(0, -1);

                let templatename = '';
                let type = 'template';
                let source = ''; // Will be set based on accessType
                let adminid = '';
                let branchid = '';
                let accessType = 'photomerge';
                let status = 'active';
                let photosBuffers = [];

                // Video merge fields (for accessType: 'videomerge')
                let name, date, faceSwap, videosMergeOption, clientname, brandname,
                    congratsOption, video1TextOption, video2TextOption, video3TextOption, approved;
                let video1Buffer, video2Buffer, video3Buffer, audioBuffer;
                // Animation fields
                let hasAnimation = false;
                let gifBuffer;

                // First pass: parse all fields to determine accessType
                parts.forEach((part) => {
                    const [rawHeaders, rawBody] = splitBuffer(part, Buffer.from('\r\n\r\n'));
                    const headersText = rawHeaders.toString();
                    const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF

                    if (headersText.includes('name="templatename"')) {
                        templatename = body.toString().trim();
                    } else if (headersText.includes('name="type"')) {
                        type = body.toString().trim();
                    } else if (headersText.includes('name="source"')) {
                        // Normalize source to lowercase only (preserve spaces): "Photo Merge App" -> "photo merge app", "Video Merge App" -> "video merge app"
                        source = body.toString().trim().toLowerCase();
                    } else if (headersText.includes('name="adminid"')) {
                        adminid = body.toString().trim();
                    } else if (headersText.includes('name="branchid"')) {
                        branchid = body.toString().trim();
                    } else if (headersText.includes('name="accessType"')) {
                        accessType = body.toString().trim();
                    } else if (headersText.includes('name="status"')) {
                        status = body.toString().trim();
                    }
                });

                // Second pass: parse fields based on accessType
                parts.forEach((part) => {
                    const [rawHeaders, rawBody] = splitBuffer(part, Buffer.from('\r\n\r\n'));
                    const headersText = rawHeaders.toString();
                    const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF

                    if (accessType === 'videomerge') {
                        // Parse video merge fields (same as admin.js videovideovideo endpoint)
                        if (headersText.includes('name="name"')) {
                            name = body.toString().trim();
                        } else if (headersText.includes('name="date"')) {
                            date = body.toString().trim();
                        } else if (headersText.includes('name="faceSwap"')) {
                            faceSwap = body.toString().trim();
                        } else if (headersText.includes('name="clientname"')) {
                            clientname = body.toString().trim();
                        } else if (headersText.includes('name="brandname"')) {
                            brandname = body.toString().trim();
                        } else if (headersText.includes('name="congratsOption"')) {
                            congratsOption = body.toString().trim();
                        } else if (headersText.includes('name="video1TextOption"')) {
                            video1TextOption = body.toString().trim();
                        } else if (headersText.includes('name="video2TextOption"')) {
                            video2TextOption = body.toString().trim();
                        } else if (headersText.includes('name="video3TextOption"')) {
                            video3TextOption = body.toString().trim();
                        } else if (headersText.includes('name="videosMergeOption"')) {
                            videosMergeOption = body.toString().trim();
                        } else if (headersText.includes('name="approved"')) {
                            approved = body.toString().trim();
                        } else if (headersText.includes('name="hasAnimation"')) {
                            hasAnimation = body.toString().trim() === 'true' || body.toString().trim() === true;
                        } else if (headersText.includes('name="video1"')) {
                            video1Buffer = body.length > 0 ? body : null;
                        } else if (headersText.includes('name="video2"')) {
                            video2Buffer = body.length > 0 ? body : null;
                        } else if (headersText.includes('name="video3"')) {
                            video3Buffer = body.length > 0 ? body : null;
                        } else if (headersText.includes('name="audio"')) {
                            audioBuffer = body.length > 0 ? body : null;
                        } else if (headersText.includes('name="gif"')) {
                            gifBuffer = body.length > 0 ? body : null;
                        }
                    } else {
                        // Parse photo merge fields (original logic)
                        if (headersText.includes('name="photos"')) {
                        photosBuffers.push({
                            buffer: body,
                            filename: headersText.match(/filename="(.+?)"/)?.[1] || `photo-${Date.now()}.jpg`,
                            mimetype: headersText.match(/Content-Type: (.+?)\r\n/)?.[1] || 'image/jpeg'
                        });
                        }
                    }
                });

                // Validate and process based on accessType
                if (accessType === 'videomerge') {
                    // Validate video merge template
                    if (!templatename) {
                        return res.status(400).json({ error: 'Template name is required' });
                    }
                    
                    // If animation is enabled, require gif
                    if (hasAnimation) {
                        if (!gifBuffer) {
                            return res.status(400).json({ error: 'Animation (GIF) is required when animation is enabled' });
                        }
                    }
                    
                    // Require at least video1 or video3 (start/end videos)
                    if (!video1Buffer && !video3Buffer) {
                        return res.status(400).json({ error: 'At least one video (Start Video or End Video) is required' });
                    }

                    // Upload videos and audio to GridFS (video2 will come from mobile app later)
                    let video1Id, video3Id, audioId, gifId;
                    if (video1Buffer) {
                        video1Id = await uploadToGridFS(
                            `video1-${Date.now()}.mp4`,
                            video1Buffer,
                            "video/mp4"
                        );
                    }
                    if (video3Buffer) {
                        video3Id = await uploadToGridFS(
                            `video3-${Date.now()}.mp4`,
                            video3Buffer,
                            "video/mp4"
                        );
                    }
                    // audio is optional - can be audio or video file
                    if (audioBuffer) {
                        // Check if it's a video file and extract audio if needed
                        const filename = audioBuffer.filename || '';
                        const contentType = audioBuffer.contentType || '';
                        const isVideo = filename.match(/\.(mp4|avi|mov|mkv|webm|flv|wmv|m4v)$/i) || 
                                       contentType.startsWith('video/');
                        
                        let finalAudioBuffer = audioBuffer.buffer;
                        
                        if (isVideo) {
                            // Extract audio from video
                            const { extractAudioFromVideo } = require('../utils/videoMerge');
                            const extension = filename.split('.').pop() || 'mp4';
                            finalAudioBuffer = await extractAudioFromVideo(finalAudioBuffer, extension);
                        }
                        
                        audioId = await uploadToGridFS(
                            `audio-${Date.now()}.mp3`,
                            finalAudioBuffer,
                            "audio/mp3"
                        );
                    }
                    // Upload animation file if enabled
                    if (hasAnimation && gifBuffer) {
                        gifId = await uploadToGridFS(
                            `animation-${Date.now()}.gif`,
                            gifBuffer,
                            "image/gif"
                        );
                    }

                    // Set source based on accessType if not provided, normalize to lowercase only (preserve spaces)
                    // Normalize "Photo Merge App" -> "photo merge app", "Video Merge App" -> "video merge app"
                    const normalizedSource = source ? source.trim().toLowerCase() : null;
                    const templateSource = normalizedSource || (accessType === 'videomerge' ? 'video merge app' : 'photo merge app');
                    
                    // Only save template data, no video merging or media saving
                    const template = new PhotoMergeTemplate({
                        templatename,
                        type,
                        source: templateSource,
                        adminid,
                        branchid,
                        accessType,
                        status,
                        // Video merge fields
                        name,
                        date,
                        video1Id,
                        video3Id,
                        audioId,
                        faceSwap,
                        videosMergeOption,
                        clientname,
                        brandname,
                        congratsOption,
                        video1TextOption,
                        video2TextOption,
                        video3TextOption,
                        approved,
                        // Animation fields
                        hasAnimation,
                        gifId,
                        createdDate: new Date(),
                        updatedDate: new Date()
                    });

                    await template.save();
                    res.status(201).json({ success: true, template });
                } else {
                    // Original photo merge logic
                if (!templatename || photosBuffers.length === 0) {
                    return res.status(400).json({ error: 'Template name and at least one photo are required' });
                }

                const templatePhotos = [];
                for (const p of photosBuffers) {
                    const photoId = await uploadToGridFS(p.filename, p.buffer, p.mimetype);
                    templatePhotos.push(photoId);
                }

                // Set source based on accessType if not provided
                // Normalize source to lowercase only (preserve spaces): "Photo Merge App" -> "photo merge app", "Video Merge App" -> "video merge app"
                const normalizedSource = source ? source.trim().toLowerCase() : null;
                const templateSource = normalizedSource || (accessType === 'videomerge' ? 'video merge app' : 'photo merge app');
                
                const template = new PhotoMergeTemplate({
                    templatename,
                    templatePhotos,
                    createdDate: new Date(),
                    updatedDate: new Date(),
                    type,
                    source: templateSource,
                    adminid,
                    branchid,
                    accessType,
                    status
                });

                await template.save();
                res.status(201).json({ success: true, template });
                }
            } catch (err) {
                console.error('Inner parse error:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    } catch (err) {
        console.error('Template upload error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT edit a template
router.put('/templates/:id', async (req, res) => {
    try {
        const templateId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(templateId)) {
            return res.status(400).json({ error: 'Invalid template ID' });
        }

        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            return res.status(400).json({ error: 'Invalid content type' });
        }

        const boundary = '--' + contentType.split('boundary=')[1];
        let chunks = [];
        req.on('data', (chunk) => {
            chunks.push(chunk);
        });

        req.on('end', async () => {
            try {
                const buffer = Buffer.concat(chunks);
                const boundaryBuffer = Buffer.from(boundary);
                const parts = splitBuffer(buffer, boundaryBuffer).slice(0, -1);

                let updateData = {
                    updatedDate: new Date()
                };
                let photosBuffers = [];
                let photoOrder = null;

                // Video merge fields - initialize as null to distinguish between "not sent" and "sent as empty"
                let name = null, date = null, clientname = null, brandname = null, congratsOption = null, video1TextOption = null, video2TextOption = null, video3TextOption = null, hasAnimation = null;
                let video1Buffer, video3Buffer, audioBuffer, gifBuffer;
                let removeVideo1 = false, removeVideo3 = false, removeAudio = false, removeGif = false;
                let accessType = null;
                let unsetFields = {}; // For fields that need to be unset (cleared)
                let fieldsReceived = {}; // Track which fields were actually sent in the form data

                // First pass: determine accessType
                parts.forEach((part) => {
                    const [rawHeaders, rawBody] = splitBuffer(part, Buffer.from('\r\n\r\n'));
                    const headersText = rawHeaders.toString();
                    const body = rawBody.slice(0, rawBody.length - 2);

                    if (headersText.includes('name="accessType"')) {
                        accessType = body.toString().trim();
                    }
                });

                // Get existing template to determine accessType if not provided
                const existingTemplate = await PhotoMergeTemplate.findById(templateId);
                if (!existingTemplate) {
                    return res.status(404).json({ error: 'Template not found' });
                }
                if (!accessType) {
                    accessType = existingTemplate.accessType || 'photomerge';
                }

                // Second pass: parse all fields
                parts.forEach((part) => {
                    const [rawHeaders, rawBody] = splitBuffer(part, Buffer.from('\r\n\r\n'));
                    const headersText = rawHeaders.toString();
                    const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF

                    if (headersText.includes('name="templatename"')) {
                        updateData.templatename = body.toString().trim();
                    } else if (headersText.includes('name="createdDate"')) {
                        updateData.createdDate = body.toString().trim();
                    } else if (headersText.includes('name="type"')) {
                        updateData.type = body.toString().trim();
                    } else if (headersText.includes('name="source"')) {
                        // Normalize source to lowercase only (preserve spaces): "Photo Merge App" -> "photo merge app", "Video Merge App" -> "video merge app"
                        updateData.source = body.toString().trim().toLowerCase();
                    } else if (headersText.includes('name="adminid"')) {
                        updateData.adminid = body.toString().trim();
                    } else if (headersText.includes('name="branchid"')) {
                        updateData.branchid = body.toString().trim();
                    } else if (headersText.includes('name="accessType"')) {
                        updateData.accessType = body.toString().trim();
                    } else if (headersText.includes('name="status"')) {
                        updateData.status = body.toString().trim();
                    } else if (accessType === 'videomerge') {
                        // Parse video merge fields
                        if (headersText.includes('name="name"')) {
                            name = body.toString().trim();
                            fieldsReceived.name = true;
                        } else if (headersText.includes('name="date"')) {
                            date = body.toString().trim();
                            fieldsReceived.date = true;
                        } else if (headersText.includes('name="clientname"')) {
                            clientname = body.toString().trim();
                            fieldsReceived.clientname = true;
                        } else if (headersText.includes('name="brandname"')) {
                            brandname = body.toString().trim();
                            fieldsReceived.brandname = true;
                        } else if (headersText.includes('name="congratsOption"')) {
                            congratsOption = body.toString().trim();
                            fieldsReceived.congratsOption = true;
                        } else if (headersText.includes('name="video1TextOption"')) {
                            video1TextOption = body.toString().trim();
                            fieldsReceived.video1TextOption = true;
                        } else if (headersText.includes('name="video2TextOption"')) {
                            video2TextOption = body.toString().trim();
                            fieldsReceived.video2TextOption = true;
                        } else if (headersText.includes('name="video3TextOption"')) {
                            video3TextOption = body.toString().trim();
                            fieldsReceived.video3TextOption = true;
                        } else if (headersText.includes('name="hasAnimation"')) {
                            hasAnimation = body.toString().trim() === 'true';
                            fieldsReceived.hasAnimation = true;
                        } else if (headersText.includes('name="video1"')) {
                            video1Buffer = body.length > 0 ? body : null;
                        } else if (headersText.includes('name="video3"')) {
                            video3Buffer = body.length > 0 ? body : null;
                        } else if (headersText.includes('name="audio"')) {
                            if (body.length > 0) {
                                audioBuffer = {
                                    buffer: body,
                                    filename: headersText.match(/filename="(.+?)"/)?.[1] || `audio-${Date.now()}.mp3`,
                                    contentType: headersText.match(/Content-Type: (.+?)\r\n/)?.[1] || 'audio/mpeg'
                                };
                            } else {
                                audioBuffer = null;
                            }
                        } else if (headersText.includes('name="gif"')) {
                            gifBuffer = body.length > 0 ? body : null;
                        } else if (headersText.includes('name="removeVideo1"')) {
                            removeVideo1 = body.toString().trim() === 'true';
                        } else if (headersText.includes('name="removeVideo3"')) {
                            removeVideo3 = body.toString().trim() === 'true';
                        } else if (headersText.includes('name="removeAudio"')) {
                            removeAudio = body.toString().trim() === 'true';
                        } else if (headersText.includes('name="removeGif"')) {
                            removeGif = body.toString().trim() === 'true';
                        }
                    } else {
                        // Photo merge fields
                        if (headersText.includes('name="photos"')) {
                            photosBuffers.push({
                                buffer: body,
                                filename: headersText.match(/filename="(.+?)"/)?.[1] || `photo-${Date.now()}.jpg`,
                                mimetype: headersText.match(/Content-Type: (.+?)\r\n/)?.[1] || 'image/jpeg'
                            });
                        } else if (headersText.includes('name="photoOrder"')) {
                            try {
                                photoOrder = JSON.parse(body.toString().trim());
                            } catch (e) {
                                console.error('Failed to parse photoOrder', e);
                            }
                        }
                    }
                });

                if (accessType === 'videomerge') {
                    // Handle video merge template updates
                    // Separate $set and $unset operations for proper field clearing
                    // Reset unsetFields for this update
                    unsetFields = {};
                    
                    // Update text fields if provided - empty strings should clear the field
                    // Only process fields that were actually sent in the form data
                    if (fieldsReceived.name) {
                        if (name === '' || name === null) {
                            unsetFields.name = '';
                        } else {
                            updateData.name = name;
                        }
                    }
                    if (fieldsReceived.date) {
                        if (date === '' || date === null) {
                            unsetFields.date = '';
                        } else {
                            updateData.date = date;
                        }
                    }
                    if (fieldsReceived.clientname) {
                        if (clientname === '' || clientname === null) {
                            unsetFields.clientname = '';
                        } else {
                            updateData.clientname = clientname;
                        }
                    }
                    if (fieldsReceived.brandname) {
                        if (brandname === '' || brandname === null) {
                            unsetFields.brandname = '';
                        } else {
                            updateData.brandname = brandname;
                        }
                    }
                    if (fieldsReceived.congratsOption) updateData.congratsOption = congratsOption;
                    if (fieldsReceived.video1TextOption) updateData.video1TextOption = video1TextOption;
                    if (fieldsReceived.video2TextOption) updateData.video2TextOption = video2TextOption;
                    if (fieldsReceived.video3TextOption) updateData.video3TextOption = video3TextOption;
                    if (fieldsReceived.hasAnimation) updateData.hasAnimation = hasAnimation;

                    // Handle video files - upload new ones or remove existing
                    if (video1Buffer) {
                        // New video1 uploaded
                        const video1Id = await uploadToGridFS(`video1-${Date.now()}.mp4`, video1Buffer, "video/mp4");
                        updateData.video1Id = video1Id;
                    } else if (removeVideo1) {
                        // Remove video1
                        updateData.video1Id = null;
                    }

                    if (video3Buffer) {
                        // New video3 uploaded
                        const video3Id = await uploadToGridFS(`video3-${Date.now()}.mp4`, video3Buffer, "video/mp4");
                        updateData.video3Id = video3Id;
                    } else if (removeVideo3) {
                        // Remove video3
                        updateData.video3Id = null;
                    }

                    if (audioBuffer) {
                        // New audio uploaded - can be audio or video file
                        // Check if it's a video file and extract audio if needed
                        const filename = audioBuffer.filename || '';
                        const contentType = audioBuffer.contentType || '';
                        const isVideo = filename.match(/\.(mp4|avi|mov|mkv|webm|flv|wmv|m4v)$/i) || 
                                       contentType.startsWith('video/');
                        
                        let finalAudioBuffer = audioBuffer.buffer;
                        
                        if (isVideo) {
                            // Extract audio from video
                            const { extractAudioFromVideo } = require('../utils/videoMerge');
                            const extension = filename.split('.').pop() || 'mp4';
                            finalAudioBuffer = await extractAudioFromVideo(finalAudioBuffer, extension);
                        }
                        
                        const audioId = await uploadToGridFS(`audio-${Date.now()}.mp3`, finalAudioBuffer, "audio/mp3");
                        updateData.audioId = audioId;
                    } else if (removeAudio) {
                        // Remove audio
                        updateData.audioId = null;
                    }

                    // Handle GIF
                    if (gifBuffer) {
                        // New GIF uploaded
                        const gifId = await uploadToGridFS(`animation-${Date.now()}.gif`, gifBuffer, "image/gif");
                        updateData.gifId = gifId;
                    } else if (removeGif) {
                        // Remove GIF
                        updateData.gifId = null;
                    }
                } else {
                    // Handle photo merge template updates
                    if (photoOrder && Array.isArray(photoOrder)) {
                        // Hybrid Update Logic
                        const templatePhotos = [];
                        let fileIndex = 0;

                        for (const item of photoOrder) {
                            if (item === 'NEW_FILE') {
                                if (fileIndex < photosBuffers.length) {
                                    const p = photosBuffers[fileIndex];
                                    const photoId = await uploadToGridFS(p.filename, p.buffer, p.mimetype);
                                    templatePhotos.push(photoId);
                                    fileIndex++;
                                }
                            } else {
                                // Verify it's a valid ID to prevent injection/errors?
                                if (mongoose.Types.ObjectId.isValid(item)) {
                                    templatePhotos.push(item);
                                }
                            }
                        }
                        updateData.templatePhotos = templatePhotos;

                    } else if (photosBuffers.length > 0) {
                        // Legacy: Replace all
                        const templatePhotos = [];
                        for (const p of photosBuffers) {
                            const photoId = await uploadToGridFS(p.filename, p.buffer, p.mimetype);
                            templatePhotos.push(photoId);
                        }
                        updateData.templatePhotos = templatePhotos;
                    }
                }

                // Set source based on accessType if not provided in updateData
                // Normalize source to lowercase only if provided (preserve spaces): "Photo Merge App" -> "photo merge app", "Video Merge App" -> "video merge app"
                if (updateData.source) {
                    updateData.source = updateData.source.trim().toLowerCase();
                } else if (updateData.accessType) {
                    updateData.source = updateData.accessType === 'videomerge' ? 'video merge app' : 'photo merge app';
                } else {
                    // If accessType is not being updated, get it from existing template
                    const existingTemplate = await PhotoMergeTemplate.findById(templateId);
                    if (existingTemplate) {
                        updateData.source = existingTemplate.accessType === 'videomerge' ? 'video merge app' : 'photo merge app';
                    }
                }
                
                // Build update query with both $set and $unset
                const updateQuery = {};
                
                // Always include updatedDate in $set
                if (Object.keys(updateData).length > 0) {
                    updateQuery.$set = updateData;
                } else {
                    // Even if no other fields, we still need $set for updatedDate
                    updateQuery.$set = { updatedDate: new Date() };
                }
                
                // Add $unset if there are fields to unset
                // MongoDB $unset requires the value to be any truthy value (1, "", true) - it just removes the field
                if (accessType === 'videomerge' && Object.keys(unsetFields).length > 0) {
                    // Convert empty strings to 1 for $unset (MongoDB standard)
                    const unsetQuery = {};
                    Object.keys(unsetFields).forEach(key => {
                        unsetQuery[key] = 1;
                    });
                    updateQuery.$unset = unsetQuery;
                }
                
                const updatedTemplate = await PhotoMergeTemplate.findByIdAndUpdate(
                    templateId,
                    updateQuery,
                    { new: true }
                );

                if (!updatedTemplate) {
                    return res.status(404).json({ error: 'Template not found' });
                }

                res.json({ success: true, template: updatedTemplate });
            } catch (err) {
                console.error('Inner parse error during update:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    } catch (err) {
        console.error('Template update error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET all templates with filtering and search
router.get('/templates', async (req, res) => {
    try {
        const { source, adminid, branchid, q } = req.query;
        let query = {};
        if (source) query.source = source;
        if (adminid) query.adminid = adminid;
        if (branchid) query.branchid = branchid;
        if (q) query.templatename = new RegExp(q, 'i');

        // Only return active templates when filtering by adminid and branchid
        if (adminid && branchid) {
            query.status = 'active';
        }

        const templates = await PhotoMergeTemplate.find(query).sort({ createdAt: -1 }).lean();
        res.json(templates || []);
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

// GET single template by ID
router.get('/templates/:id', async (req, res) => {
    try {
        const template = await PhotoMergeTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(template);
    } catch (err) {
        console.error('Error fetching single template:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE a template and its photos/videos
router.delete('/templates/:id', async (req, res) => {
    try {
        const templateId = req.params.id;
        const template = await PhotoMergeTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Delete files from GridFS
        const { bucket } = getConnection();
        
        if (template.accessType === 'videomerge') {
            // Delete video merge files
            const videoIds = [template.video1Id, template.video2Id, template.video3Id, template.audioId, template.mergedVideoId].filter(Boolean);
            for (const videoId of videoIds) {
                try {
                    await bucket.delete(new mongoose.Types.ObjectId(videoId));
                } catch (e) {
                    console.error(`Failed to delete template video/audio ${videoId}:`, e.message);
                }
            }
            // Delete animation file if it exists
            if (template.gifId) {
                try {
                    await bucket.delete(new mongoose.Types.ObjectId(template.gifId));
                } catch (e) {
                    console.error(`Failed to delete template gif ${template.gifId}:`, e.message);
                }
            }
            // Delete merged video if it exists
            if (template.mergedVideoId) {
                try {
                    await bucket.delete(new mongoose.Types.ObjectId(template.mergedVideoId));
                } catch (e) {
                    console.error(`Failed to delete template merged video ${template.mergedVideoId}:`, e.message);
                }
            }
        } else {
            // Delete photo merge files
        if (template.templatePhotos && template.templatePhotos.length > 0) {
            for (const photoId of template.templatePhotos) {
                try {
                    await bucket.delete(new mongoose.Types.ObjectId(photoId));
                } catch (e) {
                    console.error(`Failed to delete template photo ${photoId}:`, e.message);
                    }
                }
            }
        }

        await PhotoMergeTemplate.findByIdAndDelete(templateId);
        res.json({ success: true, message: 'Template and associated files deleted successfully' });
    } catch (err) {
        console.error('Error deleting template:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST endpoint for mobile app to send middle video and generate final video
router.post('/templates/:id/generate', async (req, res) => {
    try {
        // Video merge can take time—extend timeouts to avoid premature errors
        req.setTimeout(10 * 60 * 1000);
        res.setTimeout(10 * 60 * 1000);

        const templateId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(templateId)) {
            return res.status(400).json({ error: 'Invalid template ID' });
        }

        // Get template from database
        const template = await PhotoMergeTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        if (template.accessType !== 'videomerge') {
            return res.status(400).json({ error: 'Template is not a video merge template' });
        }

        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            return res.status(400).json({ error: 'Invalid content type' });
        }

        let boundary = contentType.split('boundary=')[1];
        if (boundary) {
            boundary = boundary.split(';')[0].trim();
            if (boundary.startsWith('"') && boundary.endsWith('"')) {
                boundary = boundary.slice(1, -1);
            }
            boundary = '--' + boundary;
        } else {
            return res.status(400).json({ error: 'Boundary not found' });
        }

        let chunks = [];
        req.on('data', (chunk) => {
            chunks.push(chunk);
        });

        req.on('end', async () => {
            try {
                const buffer = Buffer.concat(chunks);
                const boundaryBuffer = Buffer.from(boundary);
                const parts = splitBuffer(buffer, boundaryBuffer).slice(0, -1);

                let video2Buffer;
                let name, date, type; // Optional fields from mobile app

                // Parse form data
                parts.forEach((part) => {
                    const [rawHeaders, rawBody] = splitBuffer(part, Buffer.from('\r\n\r\n'));
                    const headersText = rawHeaders.toString();
                    const body = rawBody.slice(0, rawBody.length - 2);

                    if (headersText.includes('name="video2"')) {
                        video2Buffer = body.length > 0 ? body : null;
                    } else if (headersText.includes('name="name"')) {
                        name = body.toString().trim();
                    } else if (headersText.includes('name="date"')) {
                        date = body.toString().trim();
                    } else if (headersText.includes('name="type"')) {
                        type = body.toString().trim();
                    }
                });

                // Validate middle video is provided
                if (!video2Buffer) {
                    return res.status(400).json({ error: 'Middle Video (Video 2) is required' });
                }

                // Upload middle video to GridFS
                const video2Id = await uploadToGridFS(
                    `video2-${Date.now()}.mp4`,
                    video2Buffer,
                    "video/mp4"
                );

                // Get template video IDs
                const video1Id = template.video1Id;
                const video3Id = template.video3Id;
                const audioId = template.audioId;
                const gifId = template.gifId;
                const hasAnimation = template.hasAnimation;

                // Validate required template files
                if (!audioId) {
                    return res.status(400).json({ error: 'Template audio is missing' });
                }

                if (!video1Id && !video3Id) {
                    return res.status(400).json({ error: 'Template must have at least one video (video1 or video3)' });
                }

                // Merge videos using mergeThreeVideos
                const mergedVideoId = await mergeThreeVideos({
                    name: name || template.name || template.templatename,
                    date: date || template.date || new Date().toISOString(),
                    type: type || template.type || 'template',
                    video1Id: video1Id || video2Id, // Use video2 as fallback if video1 not provided
                    video2Id: video2Id,
                    video3Id: video3Id || video2Id, // Use video2 as fallback if video3 not provided
                    audioId: audioId,
                    clientname: template.clientname || '',
                    brandname: template.brandname || '',
                    congratsOption: template.congratsOption === 'true' || template.congratsOption === true || template.congratsOption === '1',
                    video1TextOption: template.video1TextOption === 'true' || template.video1TextOption === true || template.video1TextOption === '1',
                    video2TextOption: template.video2TextOption === 'true' || template.video2TextOption === true || template.video2TextOption === '1',
                    video3TextOption: template.video3TextOption === 'true' || template.video3TextOption === true || template.video3TextOption === '1',
                    clientPhotoId: null
                });

                let finalVideoId = mergedVideoId;

                // If animation is enabled, apply GIF animation to merged video
                if (hasAnimation && gifId) {
                    // Get merged video and GIF from GridFS
                    const { bucket } = getConnection();
                    const getFileFromGridFS = async (fileId) => {
                        return new Promise((resolve, reject) => {
                            const chunks = [];
                            bucket
                                .openDownloadStream(fileId)
                                .on("data", (chunk) => chunks.push(chunk))
                                .on("end", () => resolve(Buffer.concat(chunks)))
                                .on("error", reject);
                        });
                    };

                    const mergedVideoBuffer = await getFileFromGridFS(mergedVideoId);
                    const gifBufferFromGridFS = await getFileFromGridFS(gifId);

                    // Save temp files
                    const saveTempFile = async (buffer, extension) => {
                        const tempFilePath = path.join(
                            os.tmpdir(),
                            `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
                        );
                        await fs.writeFile(tempFilePath, buffer);
                        return tempFilePath;
                    };

                    const tempMergedVideoPath = await saveTempFile(mergedVideoBuffer, "mp4");
                    const tempGifPath = await saveTempFile(gifBufferFromGridFS, "gif");
                    const outputPath = path.join(os.tmpdir(), `animated-${Date.now()}.mp4`);

                    // Check if merged video has audio
                    const getStreamInfo = (filePath) => {
                        return new Promise((resolve, reject) => {
                            ffmpeg.ffprobe(filePath, (err, metadata) => {
                                if (err) return reject(err);
                                const hasAudio = metadata.streams.some((s) => s.codec_type === "audio");
                                resolve(hasAudio);
                            });
                        });
                    };
                    const hasAudio = await getStreamInfo(tempMergedVideoPath).catch(() => false);

                    // Apply GIF animation overlay (similar to photogif API)
                    await new Promise((resolve, reject) => {
                        const ffmpegCmd = ffmpeg()
                            .input(tempMergedVideoPath) // 0:v - merged video (keep original orientation/size)
                            .input(tempGifPath) // 1:v - gif
                            .inputOptions(["-stream_loop", "-1"]) // loop gif
                            .complexFilter([
                                // Keep base video as-is, normalize SAR
                                "[0:v]setsar=1[bg]",
                                // Scale gif to fit inside base while preserving aspect ratio, then center overlay
                                "[1:v]scale=w=main_w:h=main_h:force_original_aspect_ratio=decrease,format=rgba[gif]",
                                "[bg][gif]overlay=(main_w-w)/2:(main_h-h)/2:shortest=1[v]"
                            ])
                            .outputOptions([
                                "-map [v]",
                                ...(hasAudio ? ["-map 0:a", "-c:a aac"] : ["-an"]), // Use audio from merged video if available
                                "-c:v libx264",
                                "-pix_fmt yuv420p",
                                "-shortest"
                            ])
                            .on("end", resolve)
                            .on("error", (err) => {
                                console.error("FFmpeg animation error:", err);
                                reject(err);
                            })
                            .save(outputPath);
                    });

                    // Upload animated video to GridFS
                    const animatedVideoBuffer = await fs.readFile(outputPath);
                    finalVideoId = await uploadToGridFS(
                        `animated-${Date.now()}.mp4`,
                        animatedVideoBuffer,
                        "video/mp4"
                    );

                    // Cleanup temp files
                    try {
                        await fs.unlink(tempMergedVideoPath);
                        await fs.unlink(tempGifPath);
                        await fs.unlink(outputPath);
                    } catch (cleanupErr) {
                        console.warn("Failed to cleanup temp files:", cleanupErr);
                    }
                }

                // Verify merge completed successfully - finalVideoId must exist
                if (!finalVideoId) {
                    throw new Error('Video merge failed - no final video ID generated');
                }

                // Only save media data after merge is fully completed and verified
                const _id = new mongoose.Types.ObjectId();
                const media = new Media({
                    _id,
                    name: name || template.name || template.templatename,
                    date: date || template.date || new Date().toISOString(),
                    type: type || template.type || 'template',
                    video1Id: video1Id,
                    video2Id: video2Id,
                    video3Id: video3Id,
                    audioId: audioId,
                    mergedVideoId: finalVideoId,
                    gifId: hasAnimation ? gifId : undefined,
                    templateId: templateId,
                    whatsappstatus: "pending",
                    adminid: template.adminid || "",
                    createdAt: new Date()
                });
                await media.save();

                // Stream the final merged video back in the response so the client
                // receives the actual output once the flow is done.
                const { bucket } = getConnection();
                res.status(201);
                res.setHeader('Content-Type', 'video/mp4');
                res.setHeader('Content-Disposition', 'attachment; filename="merged-video.mp4"');

                const downloadStream = bucket.openDownloadStream(finalVideoId);
                downloadStream.on('error', (err) => {
                    console.error('Error streaming merged video:', err);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Failed to stream merged video', message: err.message });
                    } else {
                        res.end();
                    }
                });
                downloadStream.pipe(res);
            } catch (err) {
                console.error('Error generating video:', err);
                res.status(500).json({ error: 'Internal Server Error', message: err.message });
            }
        });
    } catch (err) {
        console.error('Template generate error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
