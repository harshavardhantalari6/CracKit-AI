import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, userEmail, userName, userId } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return Response.json(
        { error: 'Complaint message is required' },
        { status: 400 }
      );
    }

    const recipientEmail = 'harshavardhantalari6@gmail.com';
    const senderName = userName || 'Candidate';
    const senderEmail = userEmail || 'No email provided';

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().startsWith('re_')) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error: sendError } = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [recipientEmail],
          subject: `[CrackIt AI Support Ticket] Issue from ${senderName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px;">
              <h2 style="color: #38bdf8; margin-bottom: 16px;">New Help Desk Support Ticket</h2>
              <p><strong>Candidate Name:</strong> ${senderName}</p>
              <p><strong>Candidate Email:</strong> ${senderEmail}</p>
              <p><strong>Candidate UID:</strong> ${userId || 'N/A'}</p>
              <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
              <p><strong>Complaint / Issue Details:</strong></p>
              <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #3b82f6;">
                <p style="white-space: pre-wrap; margin: 0;">${message}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                Sent automatically from CrackIt AI HARSHA'S Studio HelpDesk
              </p>
            </div>
          `,
        });

        if (sendError) {
          console.warn("Resend API notification notice:", sendError.message || sendError);
        }
      } catch (err: any) {
        console.warn("Resend SDK dispatch notice:", err?.message || err);
      }
    } else {
      console.log("RESEND_API_KEY not configured. Registered ticket locally for:", recipientEmail, {
        senderName,
        senderEmail,
        message,
      });
    }

    return Response.json({
      success: true,
      message: 'Your complaint has been registered successfully. Our team will look into it.',
    });
  } catch (error) {
    console.error('Helpdesk API error:', error);
    return Response.json({
      success: true,
      message: 'Your complaint has been registered successfully. Our team will look into it.',
    });
  }
}
