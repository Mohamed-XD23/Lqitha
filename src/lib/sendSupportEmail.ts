import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
const FROM = `"Lqitha" <${process.env.GMAIL_USER}>`;

export async function sendSupportEmail(data: {
  name: string;
  email: string;
  type: string;
  message: string;
}) {
  await transporter.sendMail({
    from: FROM,
    to: process.env.Support_EMAIL,
    subject: `${data.type} - New support request from ${data.name}`,
    html: `
          <div style="background:#080810;padding:40px 0;">
            <div style="max-width:480px;margin:0 auto;background:#0E0E17;border:1px solid rgba(196,163,90,0.15);border-radius:6px;padding:36px 32px;font-family:Arial, sans-serif;">

              <!-- Top Accent -->
              <div style="height:1px;background:linear-gradient(to right, transparent, #C4A35A, transparent);margin-bottom:28px;"></div>

              <!-- Header -->
              <div style="text-align:center;margin-bottom:28px;">
                <p style="color:#C4A35A;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">
                  LQITHA SUPPORT
                </p>
                <h2 style="color:#F2EFE8;font-family:Georgia,serif;font-weight:300;font-size:26px;margin:0;">
                  New Support Message
                </h2>
              </div>

              <!-- User Info -->
              <div style="margin-bottom:20px;">
                <p style="color:#7A7A8C;font-size:12px;margin:0 0 6px 0;">Name</p>
                <p style="color:#F2EFE8;font-size:14px;margin:0;">${data.name}</p>
              </div>

              <div style="margin-bottom:20px;">
                <p style="color:#7A7A8C;font-size:12px;margin:0 0 6px 0;">Email</p>
                <p style="color:#F2EFE8;font-size:14px;margin:0;">${data.email}</p>
              </div>

              <div style="margin-bottom:20px;">
                <p style="color:#7A7A8C;font-size:12px;margin:0 0 6px 0;">Type</p>
                <p style="color:#F2EFE8;font-size:14px;margin:0;text-transform:capitalize;">
                  ${data.type}
                </p>
              </div>

              <!-- Divider -->
              <div style="height:1px;background:#1A1A26;margin:24px 0;"></div>

              <!-- Message -->
              <div style="margin-bottom:24px;">
                <p style="color:#7A7A8C;font-size:12px;margin:0 0 8px 0;">Message</p>
                <p style="color:#F2EFE8;font-size:14px;line-height:1.6;margin:0;">
                  ${data.message}
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-top:24px;">
                <a href="mailto:${data.email}" 
                  style="display:inline-block;background:#C4A35A;color:#080810;padding:12px 28px;border-radius:3px;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">
                  REPLY TO USER
                </a>
              </div>

              <!-- Footer -->
              <div style="height:1px;background:#1A1A26;margin:28px 0;"></div>

              <p style="color:#4A4A5C;font-size:10px;text-align:center;letter-spacing:2px;margin:0;">
                LQITHA • SUPPORT SYSTEM
              </p>

            </div>
          </div>`,
  });
}
