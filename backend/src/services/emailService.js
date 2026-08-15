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

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });

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
