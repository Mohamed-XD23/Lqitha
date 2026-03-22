import { verifyEmail } from "@/actions/auth.actions";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <VerifyResult success={false} message="The security token is missing or malformed." />
    );
  }

  const result = await verifyEmail(token);

  return (
    <VerifyResult
      success={!!result.success}
      message={result.error ?? "Authentication complete. Your identity is now confirmed."}
    />
  );
}

function VerifyResult({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) {
  return (
    <div className="bg-[#080810] min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C4A35A]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 text-center">
        {/* Brand Header */}
        <div className="mb-14">
           <div className="inline-flex items-center gap-3 mb-4">
             <div className="h-px w-6 bg-[#C4A35A]/30"></div>
             <span className="font-outfit text-[10px] font-bold tracking-[4px] uppercase text-[#C4A35A]">
               Registry Protocol
             </span>
             <div className="h-px w-6 bg-[#C4A35A]/30"></div>
          </div>
          <h1 className="font-cormorant text-5xl font-light text-[#F2EFE8] leading-tight">
            Lqitha
          </h1>
        </div>

        <div className="bg-[#13131F] border border-[#C4A35A]/15 rounded-[4px] p-12 shadow-2xl relative group">
          <div className="absolute top-0 left-0 w-full h-[0.5px] bg-gradient-to-r from-transparent via-[#C4A35A]/40 to-transparent" />
          
          <div className="mb-10 relative">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border transition-all duration-1000 group-hover:scale-110 ${
               success ? "bg-[#30D158]/5 border-[#30D158]/20" : "bg-red-500/5 border-red-500/20"
             }`}>
                <i className={`fa-solid ${success ? "fa-badge-check" : "fa-shield-xmark"} text-4xl ${
                  success ? "text-[#30D158]" : "text-red-400"
                }`} />
             </div>
             
             <h2 className="font-cormorant text-4xl font-light text-[#F2EFE8] leading-tight">
               {success ? "Identity Confirmed" : "Access Denied"}
             </h2>
             <p className="font-outfit text-[11px] text-[#7A7A8C] mt-2 tracking-widest uppercase opacity-60">
               {success ? "Protocol Successful" : "Security Interception"}
             </p>
          </div>

          <p className="font-outfit text-sm text-[#7A7A8C] leading-relaxed mb-12">
            {message}
          </p>

          <Link
            href={success ? "/login" : "/register"}
            className="block w-full bg-[#C4A35A] py-5 rounded-[2px] text-[#080810] font-outfit text-[11px] font-bold uppercase tracking-[4px] hover:bg-[#F2EFE8] transition-all shadow-xl shadow-[#C4A35A]/5 group/btn"
          >
            <span className="flex items-center justify-center gap-3">
              {success ? "Enter Workspace" : "Re-Initiate Protocol"}
              <i className={`fa-solid ${success ? "fa-arrow-right-to-bracket" : "fa-rotate-left"} text-[10px] group-hover:translate-x-1 transition-transform`} />
            </span>
          </Link>
        </div>
        
        <p className="mt-12 text-[9px] text-[#7A7A8C] font-outfit tracking-[3px] uppercase opacity-30">
          Secure End-to-End Verification
        </p>
      </div>
    </div>
  );
}
