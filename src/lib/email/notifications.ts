import { resend } from './resend';

export interface SendAdminNewPostNotificationParams {
  postTitle: string;
  authorName: string;
  postId: string;
}

export interface SendWaitlistInviteEmailParams {
  userEmail: string;
  userName: string;
}

export interface SendPostStatusNotificationParams {
  userEmail: string;
  postTitle: string;
  status: 'approved' | 'rejected' | string;
  rejectionReason?: string;
}

export interface NotificationResponse {
  success: boolean;
  error?: string;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

interface CtaButton {
  text: string;
  url: string;
}

/**
 * Reusable email HTML layout template wrapper with inline responsive styling.
 */
function getEmailHtmlLayout(title: string, bodyHtml: string, cta?: CtaButton): string {
  const ctaHtml = cta
    ? `
      <div style="margin: 30px 0; text-align: center;">
        <a href="${cta.url}" target="_blank" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          ${cta.text}
        </a>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f5f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.6; color: #333333;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f5f6; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e1e4e8;">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 40px; background-color: #ffffff; border-bottom: 1px solid #f0f0f0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111111; letter-spacing: -0.5px;">
                    ${title}
                  </h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 40px 30px 40px;">
                  ${bodyHtml}
                  ${ctaHtml}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px 40px 40px; background-color: #fafbfc; border-top: 1px solid #f0f0f0; text-align: center; font-size: 12px; color: #666666;">
                  <p style="margin: 0 0 8px 0;">This is an automated notification. Please do not reply directly to this email.</p>
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} GodTeck. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Sends an email to ADMIN_EMAIL notifying them that a new pending post needs review,
 * with a direct link to the /admin/posts moderation dashboard.
 */
export async function sendAdminNewPostNotification({
  postTitle,
  authorName,
  postId,
}: SendAdminNewPostNotificationParams): Promise<NotificationResponse> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return { success: false, error: 'ADMIN_EMAIL environment variable is not defined' };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/admin/posts`;

    const title = 'New Pending Post Needs Review';
    const bodyHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333;">Hello Admin,</p>
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
        A new post has been submitted and is currently pending moderation.
      </p>
      <div style="background-color: #f8f9fa; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #4b5563;"><strong>Post Title:</strong> ${postTitle}</p>
        <p style="margin: 0; font-size: 15px; color: #4b5563;"><strong>Author Name:</strong> ${authorName}</p>
        <p style="margin: 0; font-size: 15px; color: #4b5563;"><strong>Post ID:</strong> ${postId}</p>
      </div>
      <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.6;">
        Please log in to the admin moderation dashboard to review, approve, or reject this submission.
      </p>
    `;

    const html = getEmailHtmlLayout(title, bodyHtml, {
      text: 'Review Post',
      url: dashboardUrl,
    });

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `[Pending Review] "${postTitle}" by ${authorName}`,
      html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to send admin notification email' };
  }
}

/**
 * Sends an invitation email to an approved waitlist user with a link to register via /sign-up.
 */
export async function sendWaitlistInviteEmail({
  userEmail,
  userName,
}: SendWaitlistInviteEmailParams): Promise<NotificationResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const signUpUrl = `${baseUrl}/sign-up`;

    const title = "You're Invited!";
    const bodyHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333;">Hello ${userName},</p>
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
        Great news! Your application to join our waitlist has been approved. We are thrilled to invite you to join our platform.
      </p>
      <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.6;">
        Click the button below to complete your registration and get started. We can't wait to see what you create!
      </p>
    `;

    const html = getEmailHtmlLayout(title, bodyHtml, {
      text: 'Complete Registration',
      url: signUpUrl,
    });

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "You're Invited! Complete Your Registration",
      html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to send waitlist invitation email' };
  }
}

/**
 * Sends an update to the post author when their post is either 'approved' or 'rejected'.
 * If rejected, includes the custom rejection reason provided by the admin.
 */
export async function sendPostStatusNotification({
  userEmail,
  postTitle,
  status,
  rejectionReason,
}: SendPostStatusNotificationParams): Promise<NotificationResponse> {
  try {
    const isApproved = status.toLowerCase() === 'approved';
    const isRejected = status.toLowerCase() === 'rejected';

    const statusText = isApproved ? 'Approved' : isRejected ? 'Rejected' : status;
    const title = `Your Post Has Been ${statusText}`;

    let bodyHtml = '';
    if (isApproved) {
      bodyHtml = `
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333;">Hello,</p>
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          We are pleased to inform you that your post, <strong>"${postTitle}"</strong>, has been approved and published!
        </p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px; color: #15803d; font-weight: 600;">Status: Approved & Published</p>
        </div>
        <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.6;">
          Thank you for your valuable contribution to our community. Keep writing!
        </p>
      `;
    } else if (isRejected) {
      const reasonHtml = rejectionReason
        ? `
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 15px; color: #991b1b; font-weight: 600;">Status: Rejected</p>
            <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;"><strong>Reason:</strong> ${rejectionReason}</p>
          </div>
        `
        : `
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 15px; color: #991b1b; font-weight: 600;">Status: Rejected</p>
          </div>
        `;

      bodyHtml = `
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333;">Hello,</p>
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          We regret to inform you that your post, <strong>"${postTitle}"</strong>, was not approved for publication at this time.
        </p>
        ${reasonHtml}
        <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.6;">
          If you have any questions or would like to submit a revised version, please make sure it aligns with our community guidelines.
        </p>
      `;
    } else {
      bodyHtml = `
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333;">Hello,</p>
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          This is an update regarding your post: <strong>"${postTitle}"</strong>.
        </p>
        <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px; color: #92400e; font-weight: 600;">Status: ${statusText}</p>
        </div>
      `;
    }

    const html = getEmailHtmlLayout(title, bodyHtml);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Post Update: "${postTitle}" - ${statusText}`,
      html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to send post status notification email' };
  }
}
