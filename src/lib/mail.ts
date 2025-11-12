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
 * Send welcome email to new users (signup)
 */
export async function sendWelcomeEmail(to: string, firstName: string) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Crova Family</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px; text-align: center; background-color: #1a1a1a; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to the Crova Family 🧵</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; color: #333;">Hey <strong>${firstName}</strong>,</p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; color: #555; line-height: 1.6;">
                    Welcome to Crova — where every stitch tells a story.
                  </p>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; color: #555; line-height: 1.6;">
                    We're thrilled to have you join our creative circle. Check out our latest embroidered drops and see what fits your vibe.
                  </p>
                  
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
                          Shop Now
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 5px; font-size: 14px; color: #333;">— Love,</p>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #333; font-weight: 600;">The Crova Studio Team</p>
                  
                  <p style="margin: 10px 0 0; font-size: 12px; color: #777;">
                    Crova Studio, Bhilai, Chhattisgarh
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
    subject: 'Welcome to the Crova Family 🧵',
    html,
  });
}

/**
 * Send login notification email
 */
export async function sendLoginEmail(to: string, firstName: string) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome back to Crova</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px;">
                  <h1 style="margin: 0 0 20px; font-size: 24px; color: #333;">Welcome back to Crova!</h1>
                  
                  <p style="margin: 0 0 15px; font-size: 16px; color: #555;">Hey ${firstName},</p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; color: #555; line-height: 1.6;">
                    We noticed you just logged into your Crova account — welcome home!
                  </p>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; color: #555; line-height: 1.6;">
                    Your wardrobe of embroidered stories is waiting for you.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 0 40px 40px; text-align: center;">
                  <p style="margin: 0 0 5px; font-size: 14px; color: #333;">— Team Crova</p>
                  <p style="margin: 0; font-size: 13px; color: #777; font-style: italic;">"Wear your story."</p>
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
    subject: 'Welcome back to Crova!',
    html,
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderPlacedEmail(to: string, firstName: string, orderId: string, totalAmount: number) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Crova Order is Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px; text-align: center; background-color: #1a1a1a; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Your Crova Order is Confirmed!</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; color: #333;">Hey ${firstName},</p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; color: #555; line-height: 1.6;">
                    Your Crova order has been received and is now being embroidered with care.
                  </p>
                  
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 30px 0;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #777;">Order ID:</p>
                    <p style="margin: 0 0 15px; font-size: 18px; color: #333; font-weight: 600;">${orderId}</p>
                    
                    <p style="margin: 0 0 10px; font-size: 14px; color: #777;">Total Amount:</p>
                    <p style="margin: 0; font-size: 20px; color: #333; font-weight: 600;">₹${totalAmount.toFixed(2)}</p>
                  </div>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; color: #555; line-height: 1.6;">
                    Once it's ready to ship, we'll send you the tracking details.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 5px; font-size: 14px; color: #333; font-weight: 600;">— Team Crova</p>
                  <p style="margin: 0; font-size: 13px; color: #777; font-style: italic;">Crafted with thread, packed with emotion.</p>
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
    subject: 'Your Crova Order is Confirmed!',
    html,
  });
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(to: string, firstName: string, orderId: string, trackingLink?: string) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Crova Order is on its way</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px; text-align: center; background-color: #1a1a1a; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Your Crova Order is on its way! 🚚</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; color: #333;">Hey ${firstName},</p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; color: #555; line-height: 1.6;">
                    Your embroidered tee has just left our studio and is on its journey to you.
                  </p>
                  
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 30px 0;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #777;">Order ID:</p>
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333; font-weight: 600;">${orderId}</p>
                    ${trackingLink ? `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center">
                          <a href="${trackingLink}" style="display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">
                            Track Your Order
                          </a>
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                  </div>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; color: #555; line-height: 1.6;">
                    Can't wait for you to wear your story!
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #333; font-weight: 600;">— Team Crova</p>
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
    subject: 'Your Crova Order is on its way! 🚚',
    html,
  });
}
