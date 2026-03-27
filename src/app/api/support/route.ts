import { NextResponse } from "next/server";
import { sendSupportEmail } from "@/lib/sendSupportEmail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, type, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message too short" },
        { status: 400 }
      );
    }

    // ✅ Anti-spam: simple honeypot (optional but powerful)
    if (body.website) {
      // bots often fill hidden fields
      return NextResponse.json({ success: true });
    }

    await sendSupportEmail({ name, email, type, message });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending support email:", err);
    return NextResponse.json(
      { error: "Failed to send support email." },
      { status: 500 },
    );
  }
}
