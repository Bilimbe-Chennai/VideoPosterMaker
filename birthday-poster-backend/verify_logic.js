const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:7000/api';

async function runTests() {
    try {
        console.log('--- Health Check ---');
        try {
            await axios.get(API_URL.replace('/api', ''));
            console.log('Server is reachable');
        } catch (e) {
            console.log('Server might be down or not responding to root:', e.message);
        }

        console.log('--- User Creation Test ---');
        // 1. Create User with templateCount
        const userPayload = {
            name: 'Test Admin User',
            email: `testadmin-${Date.now()}@example.com`,
            password: 'password123',
            type: 'admin',
            accessType: ['photomerge', 'videovideo'],
            templateCount: 3,
            status: 'active'
        };

        const userRes = await axios.post(`${API_URL}/users`, userPayload);
        console.log('User Created Data:', userRes.data.data);
        const userId = userRes.data.data._id;

        if (userRes.data.data.templateCount !== 3) {
            console.error('FAILED: templateCount mismatch');
        } else {
            console.log('SUCCESS: templateCount verified');
        }

        console.log('\n--- Template Upload Test ---');
        // 2. Create Template with new fields
        // Create a dummy image file
        fs.writeFileSync('test_image.jpg', 'dummy content');

        const form = new FormData();
        form.append('templatename', 'Verification Template');
        form.append('description', 'Test Description');
        form.append('type', 'basic');
        form.append('accessType', 'photomerge');
        form.append('status', 'active');
        form.append('settings', JSON.stringify({}));
        form.append('customFields', JSON.stringify([]));
        form.append('adminid', userId);

        // Append multiple photos
        form.append('photos', fs.createReadStream('test_image.jpg'));
        form.append('photos', fs.createReadStream('test_image.jpg'));

        const templateRes = await axios.post(`${API_URL}/photomerge/template-upload`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Template Created:', templateRes.data.template);
        if (templateRes.data.template.accessType !== 'photomerge' || templateRes.data.template.status !== 'active') {
            console.error('FAILED: accessType/status mismatch');
        } else {
            console.log('SUCCESS: accessType/status verified');
        }

        // Cleanup
        fs.unlinkSync('test_image.jpg');

    } catch (error) {
        console.error('TEST FAILED:');
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        } else {
            console.error('Message:', error.message);
        }
    }
}

runTests();
