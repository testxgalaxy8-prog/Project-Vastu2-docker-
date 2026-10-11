import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server.ts';
import { createSessionToken } from '../src/middleware/auth.ts';

describe('Handbook Management & Client Reading Access Suite', () => {
  let server: http.Server;
  let baseUrl: string;
  let adminToken: string;

  before(async () => {
    adminToken = createSessionToken({
      id: 1,
      uid: 'local-admin-1',
      email: 'admin@vasturitam.com',
      displayName: 'Vastu Ritam Acharya',
      role: 'admin',
      avatarUrl: '/trademark-logo.jpg',
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/handbooks returns published handbooks', async () => {
    const res = await fetch(`${baseUrl}/api/handbooks`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.handbooks));
    assert.ok(data.handbooks.length >= 3);
    const first = data.handbooks[0];
    assert.ok(first.title);
    assert.ok(first.targetAudience);
  });

  it('POST /api/handbooks/request-access validates email and mobile number', async () => {
    // 1. Invalid email
    const resInvalidEmail = await fetch(`${baseUrl}/api/handbooks/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handbookId: 1,
        email: 'invalid-email',
        phone: '9820018272',
      }),
    });
    assert.equal(resInvalidEmail.status, 400);

    // 2. Invalid phone (too short)
    const resInvalidPhone = await fetch(`${baseUrl}/api/handbooks/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handbookId: 1,
        email: 'client@example.com',
        phone: '12345',
      }),
    });
    assert.equal(resInvalidPhone.status, 400);

    // 3. Valid submission
    const resValid = await fetch(`${baseUrl}/api/handbooks/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handbookId: 1,
        fullName: 'Ar. Rajesh Sharma',
        email: 'rajesh.sharma@architects.in',
        phone: '+91 98200 18272',
      }),
    });
    assert.equal(resValid.status, 200);
    const data = await resValid.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Token must be issued');
    assert.ok(data.handbook.title);
  });

  it('GET /api/handbooks/:id/stream protects PDF from direct public access and streams with valid token or admin auth', async () => {
    // 1. Direct unauthenticated request without token -> 401
    const resNoAuth = await fetch(`${baseUrl}/api/handbooks/1/stream`);
    assert.equal(resNoAuth.status, 401);

    // 2. Request with forged or invalid token -> 401
    const resFakeToken = await fetch(`${baseUrl}/api/handbooks/1/stream?token=invalid.token`);
    assert.equal(resFakeToken.status, 401);

    // 3. Request with valid token obtained via lead submission
    const leadRes = await fetch(`${baseUrl}/api/handbooks/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handbookId: 2,
        fullName: 'Dr. Meera Iyer',
        email: 'meera.iyer@heritage.org',
        phone: '9820045678',
      }),
    });
    const leadData = await leadRes.json();
    const validToken = leadData.token;

    const resStream = await fetch(`${baseUrl}/api/handbooks/2/stream?token=${encodeURIComponent(validToken)}`);
    assert.equal(resStream.status, 200);
    assert.equal(resStream.headers.get('content-type'), 'application/pdf');
    const pdfBytes = await resStream.arrayBuffer();
    assert.ok(pdfBytes.byteLength > 100);
    const headerStr = Buffer.from(pdfBytes.slice(0, 5)).toString('ascii');
    assert.equal(headerStr, '%PDF-');

    // 4. Admin authenticated access without token
    const resAdminStream = await fetch(`${baseUrl}/api/handbooks/2/stream`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(resAdminStream.status, 200);
    assert.equal(resAdminStream.headers.get('content-type'), 'application/pdf');
  });

  it('Admin API: lists handbooks, allows PDF upload, views leads, and exports CSV', async () => {
    // 1. List handbooks
    const listRes = await fetch(`${baseUrl}/api/admin/handbooks`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(Array.isArray(listData.handbooks));
    assert.ok(listData.handbooks.length >= 3);

    // 2. Reject non-PDF upload
    const uploadBadRes = await fetch(`${baseUrl}/api/admin/handbooks/1/upload-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fileName: 'test.txt',
        mimeType: 'text/plain',
        base64Data: Buffer.from('hello').toString('base64'),
      }),
    });
    assert.equal(uploadBadRes.status, 400);

    // 3. Upload valid PDF
    const dummyPdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n115\n%%EOF';
    const uploadRes = await fetch(`${baseUrl}/api/admin/handbooks/1/upload-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fileName: 'custom_arch_handbook_v2.pdf',
        mimeType: 'application/pdf',
        base64Data: Buffer.from(dummyPdfContent).toString('base64'),
      }),
    });
    assert.equal(uploadRes.status, 200);
    const uploadData = await uploadRes.json();
    assert.equal(uploadData.success, true);
    assert.equal(uploadData.fileName, 'custom_arch_handbook_v2.pdf');

    // 4. View client leads
    const leadsRes = await fetch(`${baseUrl}/api/admin/handbook-leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(leadsRes.status, 200);
    const leadsData = await leadsRes.json();
    assert.ok(Array.isArray(leadsData.leads));
    assert.ok(leadsData.leads.length >= 2);
    assert.ok(leadsData.stats.totalLeads >= 2);

    // 5. Export leads as CSV
    const exportRes = await fetch(`${baseUrl}/api/admin/handbook-leads/export`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(exportRes.status, 200);
    assert.ok(exportRes.headers.get('content-type')?.includes('text/csv'));
    const csvText = await exportRes.text();
    assert.ok(csvText.includes('Email Address'));
    assert.ok(csvText.includes('Mobile Number'));
  });
});
