import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `"Lqitha" <${process.env.GMAIL_USER}>`;

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your Lqitha password",
    html: `
            <div style="font-family: sans-serif; max-width:480px; margin: 0 auto; background: #080810; padding: 32px; border-radius: 8px;">
                <h2 style="color:#C4A35A;font-family:Georgia,serif;font-weight:300;">Password Reset</h2>
                <p style="color:#F2EFE8;font-size:14px;">You requested a password reset for your Lqitha account.</p>
                <p style="color:#7A7A8C;font-size:13px;">This link expires in <strong style="color:#F2EFE8;">1 hour</strong>.</p>
                <a href="${resetUrl}" style="display:inline-block;background:#C4A35A;color:#080810;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:600;margin:16px 0;font-size:13px;">
                Reset Password
                </a>
                <p style="color:#7A7A8C;font-size:11px;margin-top:24px;">If you didn't request this, ignore this email.</p>
            </div>
        `,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your Lqitha email",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#080810;padding:32px;border-radius:8px;">
        <h2 style="color:#C4A35A;font-family:Georgia,serif;font-weight:300;">Email Verification</h2>
        <p style="color:#F2EFE8;font-size:14px;">Welcome to Lqitha! Please verify your email address.</p>
        <p style="color:#7A7A8C;font-size:13px;">This link expires in <strong style="color:#F2EFE8;">24 hours</strong>.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#C4A35A;color:#080810;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:600;margin:16px 0;font-size:13px;">
          Verify Email
        </a>
        <p style="color:#7A7A8C;font-size:11px;margin-top:24px;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}
