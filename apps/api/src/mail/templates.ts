export interface MailTemplateData {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
}

const baseTemplate = (data: MailTemplateData) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-family: 'Playfair Display', serif; font-weight: 900; font-size: 2rem; margin: 0; color: #333;">
        More<span style="color: #ff5722;">Dutch</span>
      </h1>
    </div>
    
    <h2 style="color: #333; font-size: 1.5rem; margin-bottom: 20px; text-align: center;">${data.title}</h2>
    
    <div style="color: #555; line-height: 1.6; font-size: 1rem;">
      ${data.content}
    </div>
    
    ${
      data.buttonText && data.buttonUrl
        ? `
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.buttonUrl}" style="background-color: #ff5722; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);">
          ${data.buttonText}
        </a>
      </div>
    `
        : ''
    }
    
    ${
      data.footerText
        ? `<p style="color: #888; font-size: 0.85rem; text-align: center; margin-top: 30px;">${data.footerText}</p>`
        : ''
    }
    
    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
    
    <div style="text-align: center;">
      <p style="color: #bbb; font-size: 0.75rem; margin-bottom: 5px;">&copy; ${new Date().getFullYear()} More Dutch. All rights reserved.</p>
      <p style="color: #bbb; font-size: 0.75rem;">
        If you're having trouble clicking the button, copy and paste the URL below into your web browser:
      </p>
      <p style="color: #ff5722; font-size: 0.7rem; word-break: break-all; opacity: 0.8;">
        ${data.buttonUrl || ''}
      </p>
    </div>
  </div>
`;

export const verificationTemplate = (url: string) =>
  baseTemplate({
    title: 'Verify your account',
    content: `
    <p>Hi there,</p>
    <p>Welcome to <strong>More Dutch</strong>! You're just one step away from mastering Dutch grammar with our interactive hub.</p>
    <p>Please confirm your email address by clicking the button below:</p>
  `,
    buttonText: 'Confirm Email Address',
    buttonUrl: url,
    footerText: "If you didn't create an account with us, you can safely ignore this email.",
  });

export const passwordResetTemplate = (url: string) =>
  baseTemplate({
    title: 'Reset your password',
    content: `
    <p>Hi,</p>
    <p>We received a request to reset the password for your More Dutch account.</p>
    <p>Click the button below to choose a new password. <strong>This link will expire in 1 hour.</strong></p>
  `,
    buttonText: 'Reset Password',
    buttonUrl: url,
    footerText: "If you didn't request a password reset, no further action is required.",
  });
