import { NextResponse } from 'next/server';
import { Resend } from 'resend'; 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const resetLink = `http://localhost:3000/reset-password?email=${email}`;

    console.log(`Sending reset email to: ${email}`);

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Oya use karana email address eka
      to: email,
      subject: 'Reset Your Furniture App Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    });

    if (data.error) {
      console.error("Resend API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    console.log("Email sent successfully!");
    return NextResponse.json({ message: "Email sent successfully" });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}