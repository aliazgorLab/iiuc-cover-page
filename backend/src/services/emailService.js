import nodemailer from 'nodemailer';

const ALLOWED_DOMAINS = [
  '@ugrad.iiuc.ac.bd',
  '@student.iiuc.ac.bd',
  '@iiuc.ac.bd',
];

export const validateAcademicEmail = (email) => {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return ALLOWED_DOMAINS.some((domain) => lower.endsWith(domain));
};

export const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = Number(process.env.SMTP_PORT) || 2525;
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const verifySmtpConnection = async () => {
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = Number(process.env.SMTP_PORT) || 2525;
  const user = process.env.SMTP_USER || '';
  const maskedUser = user
    ? `${user.slice(0, 2)}***${user.includes('@') ? '@' + user.split('@')[1] : ''}`
    : 'unconfigured';

  console.log(`[SMTP Diagnostic] Target: ${host}:${port} | User: ${maskedUser}`);

  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log(`✓ [SMTP Diagnostic] Connection & authentication verified successfully.`);
    return { success: true, message: 'SMTP connection verified successfully.' };
  } catch (error) {
    const isAuthError =
      error.code === 'EAUTH' ||
      error.responseCode === 535 ||
      error.message?.includes('535') ||
      error.message?.includes('Invalid credentials');

    const message = isAuthError
      ? 'SMTP authentication failed. Please verify SMTP_USER and SMTP_PASS in environment configuration.'
      : `SMTP connection error: ${error.message}`;

    console.warn(`⚠️ [SMTP Diagnostic] ${message}`);
    return { success: false, isAuthError, message };
  }
};

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  const transporter = createTransporter();

  const mailOptions = {
    from: '"IIUC Cover Page Portal" <no-reply@iiuc.ac.bd>',
    to: email,
    subject: 'Activate Your IIUC Student Account',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #006A4E;">IIUC Academic Verification</h2>
        <p>Thank you for registering on the IIUC Cover Page Generator Portal.</p>
        <p>Please click the button below to verify your academic email address:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #006A4E; color: white; text-decoration: none; font-weight: bold; border-radius: 8px;">Verify Account</a>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">If you did not initiate this request, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.warn(`Email sending failed (Development Mode): ${error.message}`);
  }
};

export const escapeHtml = (text = '') => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const isValidUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

export const sendAnnouncementEmail = async ({
  to,
  subject,
  title,
  badgeText = 'IIUC ANNOUNCEMENT',
  announcementBody,
  ctaUrl = '',
  ctaText = 'Explore Upgrade',
}) => {
  if (!to) throw new Error('Recipient email address is required.');

  // Sanitize & enforce maximum length security limits
  const safeSubject = escapeHtml(subject || 'IIUC Academic Portal Update').slice(0, 150);
  const safeTitle = escapeHtml(title || 'IIUC System Upgrade Notice').slice(0, 150);
  const safeBadge = escapeHtml(badgeText || 'IIUC ANNOUNCEMENT').slice(0, 60);
  const safeBodyText = escapeHtml(announcementBody || '').slice(0, 5000);
  const safeBodyHtml = safeBodyText.replace(/\n/g, '<br />');
  const safeCtaText = escapeHtml(ctaText || 'Explore Upgrade').slice(0, 50);

  const safeCtaUrl = isValidUrl(ctaUrl)
    ? ctaUrl.trim()
    : `${process.env.FRONTEND_URL || 'https://iiuccoverpage.vercel.app'}`;

  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${safeSubject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
        <div style="max-width: 600px; margin: 24px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #006A4E; padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #e6fffa; text-transform: uppercase; margin-bottom: 12px;">
              ${safeBadge}
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.35; color: #ffffff;">
              ${safeTitle}
            </h1>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 24px; font-size: 14px; line-height: 1.65; color: #334155;">
            <div style="background-color: #f1f5f9; border-left: 4px solid #006A4E; padding: 18px 20px; border-radius: 6px; margin-bottom: 24px; font-size: 14px; color: #1e293b;">
              ${safeBodyHtml}
            </div>

            <!-- Call to Action Button -->
            ${
              safeCtaUrl
                ? `
            <div style="text-align: center; margin: 32px 0 16px 0;">
              <a href="${safeCtaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; background-color: #006A4E; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 106, 78, 0.3);">
                ${safeCtaText} &rarr;
              </a>
            </div>
            `
                : ''
            }
          </div>

          <!-- Institutional Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
            <strong>International Islamic University Chittagong (IIUC)</strong><br />
            Academic Document Workspace & Student Portal<br />
            <span style="color: #94a3b8;">This is an official automated institutional notification.</span>
          </div>

        </div>
      </body>
    </html>
  `;

  const plainTextContent = `[${safeBadge}]\n\n${safeTitle}\n\n${safeBodyText}\n\nLink: ${safeCtaUrl}\n\n-- International Islamic University Chittagong`;

  const mailOptions = {
    from: '"IIUC Academic Portal" <no-reply@iiuc.ac.bd>',
    to,
    subject: safeSubject,
    text: plainTextContent,
    html: htmlContent,
  };

  return await transporter.sendMail(mailOptions);
};

