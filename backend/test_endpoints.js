
const http = require('http');

function checkEndpoint(path) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        headers: {
            'userid': '1', // Assuming admin/demo user exists
            'role': 'Admin'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log(`Response from ${path}: Status ${res.statusCode}`);
            try {
                const json = JSON.parse(data);
                console.log('Body:', JSON.stringify(json).substring(0, 100) + '...');
            } catch (e) {
                console.log('Body (not JSON):', data.substring(0, 100));
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request to ${path}: ${e.message}`);
    });

    req.end();
}

checkEndpoint('/api/users');
setTimeout(() => checkEndpoint('/api/messages/unread/senders'), 500);
