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
