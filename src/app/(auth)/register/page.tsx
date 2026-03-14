"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth.actions";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (password !== confirm) {
      setPasswordError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await registerUser(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/login");
  }

  const inputStyle = {
    width: "100%",
    background: "#0F0F1A",
    border: "1px solid rgba(196,163,90,0.18)",
    borderRadius: "2px",
    padding: "12px 16px",
    fontFamily: "var(--font-outfit)",
    fontSize: "13px",
    color: "#F2EFE8",
    outline: "none",
  };
  const labelStyle = {
    fontFamily: "var(--font-outfit)",
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#7A7A8C",
    display: "block",
    marginBottom: "8px",
  };

  return (
    <div
      style={{
        background: "#080810",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <svg width="24" height="34" viewBox="0 0 261.42 370" fill="none">
              <path
                d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z"
                fill="#C4A35A"
              />
              <path
                d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z"
                fill="#7A7A8C"
              />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "28px",
                fontWeight: 300,
                letterSpacing: "4px",
                color: "#F2EFE8",
              }}
            >
              LQITHA
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "10px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#7A7A8C",
            }}
          >
            Lost · Found · Verified
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#13131F",
            border: "1px solid rgba(196,163,90,0.18)",
            borderRadius: "4px",
            padding: "40px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "32px",
              fontWeight: 300,
              color: "#F2EFE8",
              marginBottom: "28px",
            }}
          >
            إنشاء حساب
          </h1>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div>
              <label style={labelStyle}>الاسم</label>
              <input name="name" type="text" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>البريد الإلكتروني</label>
              <input name="email" type="email" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>كلمة المرور</label>
              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#7A7A8C",
                    fontSize: "14px",
                  }}
                >
                  <i
                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  />
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>تأكيد كلمة المرور</label>
              <div style={{ position: "relative" }}>
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: "44px",
                    borderColor: passwordError
                      ? "rgba(200,100,100,0.5)"
                      : "rgba(196,163,90,0.18)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#7A7A8C",
                    fontSize: "14px",
                  }}
                >
                  <i
                    className={`fa-solid ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}
                  />
                </button>
              </div>
              {passwordError && (
                <p
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "11px",
                    color: "#D48080",
                    marginTop: "6px",
                  }}
                >
                  {passwordError}
                </p>
              )}
            </div>

            {error && (
              <p
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "12px",
                  color: "#D48080",
                  padding: "10px 14px",
                  background: "rgba(200,100,100,0.06)",
                  border: "1px solid rgba(200,100,100,0.2)",
                  borderRadius: "2px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "14px",
                borderRadius: "2px",
                background: "#C4A35A",
                color: "#080810",
                border: "none",
                cursor: "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "24px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(196,163,90,0.15)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#7A7A8C",
              }}
            >
              أو
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(196,163,90,0.15)",
              }}
            />
          </div>

          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontFamily: "var(--font-outfit)",
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "13px",
              borderRadius: "2px",
              background: "transparent",
              color: "#F2EFE8",
              border: "1px solid rgba(196,163,90,0.2)",
              cursor: "pointer",
            }}
          >
            <i className="fa-brands fa-google" style={{ color: "#C4A35A" }} />
            المتابعة مع Google
          </button>

          <p
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "12px",
              color: "#7A7A8C",
              textAlign: "center",
              marginTop: "24px",
            }}
          >
            لديك حساب بالفعل؟{" "}
            <Link
              href="/login"
              style={{ color: "#C4A35A", textDecoration: "none" }}
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
