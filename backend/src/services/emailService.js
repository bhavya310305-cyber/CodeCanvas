const https = require('https');

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    const data = JSON.stringify({
        sender: { name: 'CodeCanvas', email: 'bhavya310305@gmail.com' },
        to: [{ email: toEmail }],
        subject: 'Reset your CodeCanvas password',
        htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; border-radius: 12px; color: #e5e5e5;">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #ffffff;">Reset your password</h2>
        <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset the password for your CodeCanvas account.
          Click the button below to choose a new password. This link expires in <strong style="color: #e5e5e5;">1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 28px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #525252; font-size: 12px; margin-top: 32px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email — your password won't change.<br /><br />
          Or copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    `,
    });

    const options = {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(data),
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(new Error(`Brevo API error: ${res.statusCode} ${body}`));
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
};

module.exports = { sendPasswordResetEmail };