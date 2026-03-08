const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"CodeCanvas" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Reset your CodeCanvas password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; border-radius: 12px; color: #e5e5e5;">
        
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #ffffff;">
          Reset your password
        </h2>

        <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset the password for your CodeCanvas account.
          Click the button below to choose a new password. This link expires in <strong style="color: #e5e5e5;">1 hour</strong>.
        </p>

        <a href="${resetUrl}"
          style="display: inline-block; padding: 12px 28px; background: #7c3aed; color: #ffffff;
                 text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          Reset Password
        </a>

        <p style="color: #525252; font-size: 12px; margin-top: 32px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email — your password won't change.
          <br /><br />
          Or copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
        </p>

      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };