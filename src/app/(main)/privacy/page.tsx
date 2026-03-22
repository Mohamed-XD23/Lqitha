export default function PrivacyPage() {
  return (
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div style={{ marginBottom: "40px" }}>
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#C4A35A",
            }}
          >
            Legal
          </span>
          <h1
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "48px",
              fontWeight: 300,
              color: "#F2EFE8",
              marginTop: "8px",
            }}
          >
            Privacy Policy
          </h1>
          <p
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "12px",
              color: "#7A7A8C",
              marginTop: "8px",
            }}
          >
            Last updated: March 2026
          </p>
        </div>

        {[
          {
            title: "1. Information We Collect",
            content:
              "We collect information you provide directly: name, email address, password (encrypted), phone number (for item listings), and profile picture. We also collect usage data such as items posted, claims made, and login timestamps.",
          },
          {
            title: "2. How We Use Your Information",
            content:
              "Your information is used to: operate and improve the Lqitha platform, verify your identity during the claim process, send email notifications (verification, password reset), and compute your Trust Score based on platform activity.",
          },
          {
            title: "3. Data Storage & Security",
            content:
              "Your data is stored in a secure PostgreSQL database hosted on Neon.tech. Passwords and secret answers are encrypted using bcrypt with 12 salt rounds. We use HTTPS for all data transmission. JWT tokens are stored in HTTP-only cookies.",
          },
          {
            title: "4. Phone Number Privacy",
            content:
              "Your phone number is never displayed publicly. It is only revealed to a claimant after their ownership has been verified and their claim has been accepted by you.",
          },
          {
            title: "5. Third-Party Services",
            content:
              "We use the following third-party services: Cloudinary for image storage, Stream Chat for real-time messaging, Google OAuth for social login, and Gmail for email delivery. Each service has its own privacy policy.",
          },
          {
            title: "6. Data Retention",
            content:
              "We retain your data as long as your account is active. You may request deletion of your account and associated data by contacting us. Password reset and email verification tokens expire automatically (1 hour and 24 hours respectively).",
          },
          {
            title: "7. Cookies",
            content:
              "We use HTTP-only cookies for session management. These cookies are essential for the platform to function and cannot be disabled. We do not use tracking or advertising cookies.",
          },
          {
            title: "8. Your Rights",
            content:
              "You have the right to access, correct, or delete your personal data. You may update your profile information and picture from your Dashboard at any time.",
          },
          {
            title: "9. Children's Privacy",
            content:
              "Lqitha is not intended for users under the age of 18. We do not knowingly collect personal information from minors.",
          },
          {
            title: "10. Contact Us",
            content:
              "For any privacy-related questions or data requests, please contact us at lqitha.platform@gmail.com.",
          },
        ].map((section, i) => (
          <div
            key={i}
            style={{
              marginBottom: "32px",
              paddingBottom: "32px",
              borderBottom: "1px solid rgba(196,163,90,0.1)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "22px",
                fontWeight: 400,
                color: "#C4A35A",
                marginBottom: "12px",
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "14px",
                color: "#B0B0C0",
                lineHeight: 1.8,
              }}
            >
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
