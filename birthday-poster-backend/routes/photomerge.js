const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Readable } = require('stream');
const { getConnection } = require('../InitDB');
const PhotoMergeTemplate = require('../models/PhotoMergeTemplate');

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
                let source = 'photo merge app';
                let adminid = '';
                let branchid = '';
                let accessType = 'photomerge';
                let status = 'active';
                let photosBuffers = [];

                parts.forEach((part) => {
                    const [rawHeaders, rawBody] = splitBuffer(part, Buffer.from('\r\n\r\n'));
                    const headersText = rawHeaders.toString();
                    const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF

                    if (headersText.includes('name="templatename"')) {
                        templatename = body.toString().trim();
                    } else if (headersText.includes('name="type"')) {
                        type = body.toString().trim();
                    } else if (headersText.includes('name="source"')) {
                        source = body.toString().trim();
                    } else if (headersText.includes('name="adminid"')) {
                        adminid = body.toString().trim();
                    } else if (headersText.includes('name="branchid"')) {
                        branchid = body.toString().trim();
                    } else if (headersText.includes('name="accessType"')) {
                        accessType = body.toString().trim();
                    } else if (headersText.includes('name="status"')) {
                        status = body.toString().trim();
                    } else if (headersText.includes('name="photos"')) {
                        console.log('Found photo part'); // DEBUG
                        photosBuffers.push({
                            buffer: body,
                            filename: headersText.match(/filename="(.+?)"/)?.[1] || `photo-${Date.now()}.jpg`,
                            mimetype: headersText.match(/Content-Type: (.+?)\r\n/)?.[1] || 'image/jpeg'
                        });
                    }
                });

                if (!templatename || photosBuffers.length === 0) {
                    return res.status(400).json({ error: 'Template name and at least one photo are required' });
                }

                const templatePhotos = [];
                for (const p of photosBuffers) {
                    const photoId = await uploadToGridFS(p.filename, p.buffer, p.mimetype);
                    templatePhotos.push(photoId);
                }

                const template = new PhotoMergeTemplate({
                    templatename,
                    templatePhotos,
                    createdDate: new Date(),
                    updatedDate: new Date(),
                    type,
                    source,
                    adminid,
                    branchid,
                    accessType,
                    status
                });

                await template.save();
                res.status(201).json({ success: true, template });
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
                        updateData.source = body.toString().trim();
                    } else if (headersText.includes('name="adminid"')) {
                        updateData.adminid = body.toString().trim();
                    } else if (headersText.includes('name="branchid"')) {
                        updateData.branchid = body.toString().trim();
                    } else if (headersText.includes('name="accessType"')) {
                        updateData.accessType = body.toString().trim();
                    } else if (headersText.includes('name="status"')) {
                        updateData.status = body.toString().trim();
                    } else if (headersText.includes('name="photos"')) {
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
                });

                if (photoOrder && Array.isArray(photoOrder)) {
                    // Hybrid Update Logic
                    console.log('Processing photoOrder:', photoOrder);
                    console.log('Available photo buffers:', photosBuffers.length);
                    const templatePhotos = [];
                    let fileIndex = 0;

                    for (const item of photoOrder) {
                        if (item === 'NEW_FILE') {
                            if (fileIndex < photosBuffers.length) {
                                const p = photosBuffers[fileIndex];
                                const photoId = await uploadToGridFS(p.filename, p.buffer, p.mimetype);
                                console.log(`Uploaded new file at index ${fileIndex}:`, photoId);
                                templatePhotos.push(photoId);
                                fileIndex++;
                            }
                        } else {
                            // Verify it's a valid ID to prevent injection/errors?
                            if (mongoose.Types.ObjectId.isValid(item)) {
                                console.log('Keeping existing photo:', item);
                                templatePhotos.push(item);
                            }
                        }
                    }
                    console.log('Final templatePhotos array:', templatePhotos);
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

                const updatedTemplate = await PhotoMergeTemplate.findByIdAndUpdate(
                    templateId,
                    { $set: updateData },
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

        const templates = await PhotoMergeTemplate.find(query).sort({ createdAt: -1 });
        res.json(templates);
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ error: 'Internal Server Error' });
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

// DELETE a template and its photos
router.delete('/templates/:id', async (req, res) => {
    try {
        const templateId = req.params.id;
        const template = await PhotoMergeTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Delete photos from GridFS
        const { bucket } = getConnection();
        if (template.templatePhotos && template.templatePhotos.length > 0) {
            for (const photoId of template.templatePhotos) {
                try {
                    await bucket.delete(new mongoose.Types.ObjectId(photoId));
                } catch (e) {
                    console.error(`Failed to delete template photo ${photoId}:`, e.message);
                }
            }
        }

        await PhotoMergeTemplate.findByIdAndDelete(templateId);
        res.json({ success: true, message: 'Template and associated photos deleted successfully' });
    } catch (err) {
        console.error('Error deleting template:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
