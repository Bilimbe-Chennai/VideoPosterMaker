const axios = require('axios');

const API_URL = 'http://localhost:7000/api';

async function runTests() {
    try {
        console.log('--- Testing Login Restriction with Unique Email ---');

        const testEmail = `uni-${Date.now()}@example.com`;
        const testPassword = 'password123';

        // 1. Create App User
        console.log(`Creating App User with email: ${testEmail}...`);
        await axios.post(`${API_URL}/users`, {
            name: 'Unique App User',
            email: testEmail,
            password: testPassword,
            type: 'app user',
            status: 'active'
        });

        // 2. Try to create ANOTHER user with SAME email (Should FAIL)
        console.log(`Attempting to create another user with SAME email: ${testEmail}...`);
        try {
            await axios.post(`${API_URL}/users`, {
                name: 'Duplicate Admin',
                email: testEmail,
                password: testPassword,
                type: 'admin',
                status: 'active'
            });
            console.error('FAILED: Duplicate email should have been forbidden');
        } catch (error) {
            console.log('SUCCESS: Duplicate email creation forbidden as expected');
        }

        // 3. Test App User Login (Restricted)
        console.log('\n--- Testing App User Login ---');
        console.log('Attempting first app user login...');
        const appRes1 = await axios.post(`${API_URL}/users/login`, {
            email: testEmail,
            password: testPassword,
            type: 'app user'
        });
        console.log(`App User login 1 success: ${appRes1.data.success}, Count: ${appRes1.data.data.loginCount}`);

        console.log('Attempting second app user login...');
        try {
            await axios.post(`${API_URL}/users/login`, {
                email: testEmail,
                password: testPassword,
                type: 'app user'
            });
            console.error('FAILED: Second app user login should have been forbidden');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('SUCCESS: Second login forbidden as expected (403)');
                console.log('Error message:', error.response.data.error);
            } else {
                console.error('FAILED: Unexpected error:', error.message);
            }
        }

        // 4. Test Login with WRONG TYPE (Admin vs App User)
        console.log('\n--- Testing Login with Correct Email but Wrong Type ---');
        try {
            await axios.post(`${API_URL}/users/login`, {
                email: testEmail,
                password: testPassword,
                type: 'admin' // Database has 'app user'
            });
            console.error('FAILED: Login with wrong type should have failed');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('SUCCESS: Login with wrong type forbidden (403)');
                console.log('Error message:', error.response.data.error);
            } else {
                console.error('FAILED: Unexpected error:', error.message);
            }
        }

    } catch (error) {
        console.error('TEST FAILED:');
        if (error.response) {
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
}

runTests();
