import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { connectDB, disconnectDB, createTestTenant } from './helpers.js';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('Authentication & User Resolution Tests', () => {
  let testTenant;
  let server;
  let serverPort;
  let baseUrl;

  before(async () => {
    await connectDB();
    testTenant = await createTestTenant('Auth Test Org');

    // Start ephemeral server for testing HTTP transport & cookies
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        serverPort = server.address().port;
        baseUrl = `http://127.0.0.1:${serverPort}/api/v1/auth`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) await new Promise(res => server.close(res));
    await disconnectDB();
  });

  it('A. Employee ID login (ADMIN01 / password123) should return HTTP 200, user data, and JWT cookie', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginId: 'ADMIN01',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.employeeId, 'ADMIN01');
    assert.strictEqual(body.data.role, 'ADMIN');
    assert.ok(body.data.token, 'Token must be returned');

    // Check Set-Cookie header
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'set-cookie header should be present');
    assert.ok(setCookie.includes('jwt='), 'cookie should contain jwt');
  });

  it('B. Email login (admin@shivfurniture.in / password123) should return HTTP 200 and user data', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shivfurniture.in',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.email, 'admin@shivfurniture.in');
  });

  it('C. Invalid password should return HTTP 401', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginId: 'ADMIN01',
        password: 'wrongpassword'
      })
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  it('D. Authenticated /me endpoint should return authenticated user details using cookie', async () => {
    // First login to get cookie
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: 'ADMIN01', password: 'password123' })
    });
    const cookie = loginRes.headers.get('set-cookie');
    assert.ok(cookie);

    // Call /me with cookie
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { Cookie: cookie }
    });

    assert.strictEqual(meRes.status, 200);
    const meBody = await meRes.json();
    assert.strictEqual(meBody.success, true);
    assert.strictEqual(meBody.data.employeeId, 'ADMIN01');
    assert.strictEqual(meBody.data.role, 'ADMIN');
    assert.ok(meBody.data.permissions.includes('*'));
  });

  it('E. Logout should clear JWT cookie and subsequent /me should return 401', async () => {
    const logoutRes = await fetch(`${baseUrl}/logout`, { method: 'POST' });
    assert.strictEqual(logoutRes.status, 200);

    const logoutCookie = logoutRes.headers.get('set-cookie');
    assert.ok(logoutCookie);
    assert.ok(logoutCookie.includes('jwt=;') || logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires='));

    // Try /me with cleared cookie
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { Cookie: logoutCookie }
    });
    assert.strictEqual(meRes.status, 401);
  });
});
