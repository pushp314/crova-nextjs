import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    await transporter.sendMail({
      from: `"Crova" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    // In a real app, you might want to throw this error or handle it differently
    throw new Error('Failed to send email.');
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, firstName: string) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Crova</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FAF0E6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #FFDAB9 0%, #F08080 100%); border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    ✨ Welcome to Crova ✨
                  </h1>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 18px; color: #333; line-height: 1.6;">
                    Hey <strong style="color: #F08080;">${firstName}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; color: #555; line-height: 1.6;">
                    <strong style="font-size: 18px; color: #333;">Welcome to Crova! 💫</strong>
                  </p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; color: #555; line-height: 1.6;">
                    You've just stepped into a world where clothing isn't just worn — it's <em>felt</em>.
                  </p>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; color: #555; line-height: 1.6;">
                    At Crova, every stitch, shade, and fabric is crafted to reflect <strong>you</strong> — your vibe, your story, your confidence.
                  </p>
                  
                  <!-- Features Box -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FAF0E6; border-radius: 8px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 30px;">
                        <h3 style="margin: 0 0 20px; font-size: 18px; color: #333; font-weight: 600;">
                          Here's what you can do next:
                        </h3>
                        
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 10px 0;">
                              <span style="font-size: 20px; margin-right: 10px;">👗</span>
                              <strong style="color: #333;">Explore:</strong>
                              <span style="color: #555;"> Discover uniquely embroidered and custom-made pieces.</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <span style="font-size: 20px; margin-right: 10px;">🎨</span>
                              <strong style="color: #333;">Personalize:</strong>
                              <span style="color: #555;"> Design your own style — because trends fade, but you are timeless.</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <span style="font-size: 20px; margin-right: 10px;">📦</span>
                              <strong style="color: #333;">Shop:</strong>
                              <span style="color: #555;"> Start your journey with our latest drops and limited editions.</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; padding: 16px 40px; background-color: #F08080; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(240, 128, 128, 0.3);">
                          Start Shopping Now 🛍️
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 10px; font-size: 14px; color: #777; line-height: 1.6;">
                    If you didn't create this account, please ignore this email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #FAF0E6; border-radius: 0 0 12px 12px; text-align: center;">
                  <p style="margin: 0 0 10px; font-size: 16px; color: #333; font-weight: 600;">
                    Welcome to the Crova family,<br>
                    <span style="color: #F08080;">Team Crova</span>
                  </p>
                  
                  <p style="margin: 20px 0 10px; font-size: 14px; color: #555; font-style: italic;">
                    ✨ Custom. Crafted. Crova.
                  </p>
                  
                  <p style="margin: 10px 0 0; font-size: 14px;">
                    <a href="https://www.crova.in" style="color: #F08080; text-decoration: none; font-weight: 600;">
                      www.crova.in
                    </a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    to,
    subject: '💌 Welcome to Crova — Where Every Stitch is a Statement ✨',
    html,
  });
}
