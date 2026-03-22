export default function TermsPage() {
  return (
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <div className="mx-auto max-w-3xl px-6 py-16">

        <div style={{ marginBottom: "40px" }}>
          <span style={{ fontFamily: "var(--font-outfit)", fontSize: "10px", fontWeight: 500, letterSpacing: "4px", textTransform: "uppercase", color: "#C4A35A" }}>
            Legal
          </span>
          <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "48px", fontWeight: 300, color: "#F2EFE8", marginTop: "8px" }}>
            Terms of Service
          </h1>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: "12px", color: "#7A7A8C", marginTop: "8px" }}>
            Last updated: March 2026
          </p>
        </div>

        {[
          {
            title: "1. Acceptance of Terms",
            content: "By accessing and using Lqitha, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform."
          },
          {
            title: "2. Use of the Platform",
            content: "Lqitha is a lost and found platform designed to help people recover their belongings. You agree to use the platform only for legitimate lost and found purposes. Any fraudulent claims or misuse of the verification system is strictly prohibited."
          },
          {
            title: "3. User Accounts",
            content: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when registering. You are responsible for all activities that occur under your account."
          },
          {
            title: "4. Content & Listings",
            content: "You are solely responsible for the content you post on Lqitha. You must not post false, misleading, or fraudulent item listings. Lqitha reserves the right to remove any content that violates these terms."
          },
          {
            title: "5. Ownership Verification",
            content: "The secret question system is designed to verify ownership. Attempting to guess or brute-force secret answers is prohibited. Repeated failed attempts will result in automatic rejection of your claim."
          },
          {
            title: "6. Privacy",
            content: "Your personal information, including phone numbers, is kept private until ownership is verified. We do not sell your personal data to third parties. Please refer to our Privacy Policy for full details."
          },
          {
            title: "7. Trust Score",
            content: "The Trust Score system reflects your activity on the platform. Fraudulent behavior may result in score penalties. Lqitha reserves the right to suspend accounts with consistently low trust scores."
          },
          {
            title: "8. Limitation of Liability",
            content: "Lqitha provides a platform for connecting users but is not responsible for the actual recovery of items. We do not guarantee the accuracy of any listing or the identity of any user."
          },
          {
            title: "9. Changes to Terms",
            content: "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms."
          },
          {
            title: "10. Contact",
            content: "For any questions regarding these terms, please contact us at lqitha.platform@gmail.com."
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid rgba(196,163,90,0.1)" }}>
            <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "22px", fontWeight: 400, color: "#C4A35A", marginBottom: "12px" }}>
              {section.title}
            </h2>
            <p style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", color: "#B0B0C0", lineHeight: 1.8 }}>
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}