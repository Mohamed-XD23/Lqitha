import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `"Lqitha" <${process.env.GMAIL_USER}>`;

function emailLayout({
  badge,
  title,
  description,
  expiry,
  buttonText,
  url,
  footer,
}: {
  badge: string;
  title: string;
  description: string;
  expiry?: string;
  buttonText: string;
  url: string;
  footer: string;
}) {
  return `
  <div style="background:#080810;padding:40px 0;">
    <div style="max-width:480px;margin:0 auto;background:#0E0E17;border:1px solid rgba(196,163,90,0.15);border-radius:6px;padding:36px 32px;font-family:Arial, sans-serif;">

      <!-- Top Accent -->
      <div style="height:1px;background:linear-gradient(to right, transparent, #C4A35A, transparent);margin-bottom:28px;"></div>

      <!-- Header -->
      <div style="text-align:center;margin-bottom:28px;">
        <p style="color:#C4A35A;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">
          ${badge}
        </p>
        <h2 style="color:#F2EFE8;font-family:Georgia,serif;font-weight:300;font-size:26px;margin:0;">
          ${title}
        </h2>
      </div>

      <!-- Description -->
      <p style="color:#F2EFE8;font-size:14px;line-height:1.6;margin:0 0 14px 0;">
        ${description}
      </p>

      ${
        expiry
          ? `
      <p style="color:#7A7A8C;font-size:13px;margin:0 0 22px 0;">
        This link expires in <strong style="color:#F2EFE8;">${expiry}</strong>.
      </p>
      `
          : ""
      }

      <!-- CTA -->
      <div style="text-align:center;margin:24px 0;">
        <a href="${url}" 
          style="display:inline-block;background:#C4A35A;color:#080810;padding:12px 32px;border-radius:3px;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">
          ${buttonText}
        </a>
      </div>

      <!-- Divider -->
      <div style="height:1px;background:#1A1A26;margin:28px 0;"></div>

      <!-- Footer -->
      <p style="color:#7A7A8C;font-size:11px;line-height:1.5;margin:0;">
        ${footer}
      </p>

      <p style="color:#4A4A5C;font-size:10px;margin-top:16px;text-align:center;letter-spacing:2px;">
        LQITHA • SYSTEM
      </p>

    </div>
  </div>
  `;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your Lqitha password",
    html: emailLayout({
      badge: "LQITHA SECURITY",
      title: "Password Reset",
      description:
        "You requested to reset your password for your LQITHA account.",
      expiry: "1 hour",
      buttonText: "RESET PASSWORD",
      url: resetUrl,
      footer: "If you didn’t request this action, you can safely ignore this email.",
    }),
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your Lqitha email",
    html: emailLayout({
      badge: "LQITHA ONBOARDING",
      title: "Email Verification",
      description:
        "Welcome to LQITHA. Please verify your email address to activate your account.",
      expiry: "24 hours",
      buttonText: "VERIFY EMAIL",
      url: verifyUrl,
      footer: "If you didn’t create an account, you can ignore this email.",
    }),
  });
}

export async function sendMatchEmail({
  to,
  ownerName,
  newItemType,
  newItemTitle,
  matchedItemType,
  matchedItemTitle,
  newItemId,
  similarity,
}: {
  to: string;
  ownerName: string;
  newItemType: string;
  newItemTitle: string;
  matchedItemType: string;
  matchedItemTitle: string;
  newItemId: string;
  similarity: number;
}) {
  const matchPercent = Math.round(similarity * 100);
  const itemUrl = `${process.env.NEXTAUTH_URL}/items/${newItemId}`;

  await transporter.sendMail({
    from: `"Lqitha Platform" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🔍 Possible Match Found for Your ${matchedItemType} Item — Lqitha`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Possible Match Found</title>
</head>
<body style="margin:0;padding:0;background:#080810;font-family:'Outfit',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080810;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#13131F;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#13131F;padding:32px 40px;border-bottom:1px solid #2a2a3d;">
              <h1 style="margin:0;font-size:28px;color:#C4A35A;letter-spacing:1px;">Lqitha</h1>
              <p style="margin:4px 0 0;color:#7A7A8C;font-size:13px;">Secure Digital Lost &amp; Found</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 8px;color:#7A7A8C;font-size:14px;">Hello, ${ownerName}</p>
              <h2 style="margin:0 0 24px;color:#F2EFE8;font-size:22px;font-weight:600;">
                We found a possible match!
              </h2>

              <p style="margin:0 0 24px;color:#F2EFE8;font-size:15px;line-height:1.6;">
                Someone just posted a <strong style="color:#C4A35A;">${newItemType}</strong> item
                that our AI matching engine flagged as a
                <strong style="color:#C4A35A;">${matchPercent}% match</strong>
                for your <strong style="color:#C4A35A;">${matchedItemType}</strong> item.
              </p>

              <!-- Match Card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#080810;border:1px solid #2a2a3d;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="48%" style="padding:0 8px 0 0;vertical-align:top;">
                          <p style="margin:0 0 6px;font-size:11px;color:#7A7A8C;text-transform:uppercase;letter-spacing:1px;">
                            Your ${matchedItemType} item
                          </p>
                          <p style="margin:0;font-size:15px;color:#F2EFE8;font-weight:600;">
                            ${matchedItemTitle}
                          </p>
                        </td>

                        <td width="4%" align="center" style="color:#C4A35A;font-size:20px;">⇄</td>

                        <td width="48%" style="padding:0 0 0 8px;vertical-align:top;">
                          <p style="margin:0 0 6px;font-size:11px;color:#7A7A8C;text-transform:uppercase;letter-spacing:1px;">
                            New ${newItemType} item
                          </p>
                          <p style="margin:0;font-size:15px;color:#F2EFE8;font-weight:600;">
                            ${newItemTitle}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Similarity bar -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 6px;font-size:12px;color:#7A7A8C;">
                            Match confidence: <span style="color:#C4A35A;font-weight:600;">${matchPercent}%</span>
                          </p>
                          <div style="background:#2a2a3d;border-radius:4px;height:6px;width:100%;">
                            <div style="background:#C4A35A;border-radius:4px;height:6px;width:${matchPercent}%;"></div>
                          </div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#C4A35A;border-radius:8px;">
                    <a href="${itemUrl}"
                       style="display:inline-block;padding:14px 32px;color:#080810;font-size:15px;
                              font-weight:700;text-decoration:none;border-radius:8px;">
                      View the Matching Item →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#7A7A8C;font-size:13px;line-height:1.6;">
                This match was detected automatically by Lqitha's AI engine.
                If this doesn't look right, you can ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2a3d;">
              <p style="margin:0;color:#7A7A8C;font-size:12px;text-align:center;">
                © 2026 Lqitha Platform · University of Tissemsilt
                <br/>
                <a href="${process.env.NEXTAUTH_URL}" style="color:#C4A35A;text-decoration:none;">
                  lqitha.vercel.app
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
    `,
  });
}

