import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.warn(
    "[email] GMAIL_USER or GMAIL_APP_PASSWORD is missing — outbound email will fail.",
  );
}

const FROM_ADDRESS = `Dead Man's Switch <${GMAIL_USER ?? "noreply@example.com"}>`;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Headers that mark a message as high priority across major clients (Gmail,
// Apple Mail, Outlook). Used sparingly — only for genuinely time-critical
// messages, since overuse trains spam filters against us.
const HIGH_PRIORITY_HEADERS = {
  "X-Priority": "1",
  "X-MSMail-Priority": "High",
  Importance: "high",
} as const;

function shell(title: string, body: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0d0d12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#ededed;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0d0d12;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:#15151c;border:1px solid #26262f;border-radius:14px;padding:40px;">
            <tr>
              <td style="padding-bottom:8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8a96;">
                Dead Man's Switch
              </td>
            </tr>
            <tr>
              <td style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#f5f5f0;padding-bottom:20px;">
                ${title}
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#cfcfd6;">
                ${body}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendMagicLinkEmail(email: string, link: string): Promise<void> {
  const text = `Sign in to Dead Man's Switch

Tap the link below to sign in. This link is good for 15 minutes.

${link}

If you didn't request this, you can ignore it.`;

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: email,
    subject: "Your sign-in link",
    text,
    html: shell(
      "Sign in",
      `
        <p>Tap the button below to sign in. This link is good for 15 minutes.</p>
        <p style="margin:28px 0;">
          <a href="${link}" style="display:inline-block;background:#f5f5f0;color:#15151c;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
            Sign in
          </a>
        </p>
        <p style="font-size:13px;color:#8a8a96;">If you didn't request this, you can ignore it.</p>
      `,
    ),
    headers: HIGH_PRIORITY_HEADERS,
  });
}

type ReminderInput = {
  to: string;
  switchTitle: string;
  recipientEmail: string;
  deadline: Date;
  checkinLink: string;
  type: "7_day" | "1_day";
};

export async function sendReminderEmail(input: ReminderInput): Promise<void> {
  const { to, switchTitle, recipientEmail, deadline, checkinLink, type } = input;
  const urgency = type === "1_day" ? "tomorrow" : "in a week";
  const subject =
    type === "1_day"
      ? `Check in by tomorrow — "${switchTitle}"`
      : `One week to check in — "${switchTitle}"`;

  const niceDeadline = deadline.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const text = `Your switch "${switchTitle}" will fire ${urgency} (${niceDeadline}) if you don't check in.

If it does fire, the message goes to ${recipientEmail}.

Check in here (one click, no login needed):
${checkinLink}`;

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject,
    text,
    html: shell(
      type === "1_day" ? "One day left" : "One week left",
      `
        <p>Your switch <strong style="color:#f5f5f0;">${escapeHtml(switchTitle)}</strong> will fire ${urgency} (${niceDeadline}) if you don't check in.</p>
        <p>If it does fire, the message goes to <span style="font-family:'SF Mono',Menlo,monospace;color:#f5f5f0;">${escapeHtml(recipientEmail)}</span>.</p>
        <p style="margin:28px 0;">
          <a href="${checkinLink}" style="display:inline-block;background:#f5f5f0;color:#15151c;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
            I'm still here — check in
          </a>
        </p>
        <p style="font-size:13px;color:#8a8a96;">One click resets the deadline. No login needed.</p>
      `,
    ),
    // Only the 1-day reminder is urgent enough to mark high priority.
    headers: type === "1_day" ? HIGH_PRIORITY_HEADERS : undefined,
  });
}

type DeliveryInput = {
  to: string;
  senderEmail: string;
  switchTitle: string;
  message: string;
};

export async function sendDeliveryEmail(input: DeliveryInput): Promise<void> {
  const { to, senderEmail, switchTitle, message } = input;

  const text = `${senderEmail} set up a Dead Man's Switch to send you this message if they ever went quiet. They didn't check in by the deadline.

---

${message}

---

This message was held encrypted until delivery and is not stored after being sent.`;

  await transporter.sendMail({
    from: FROM_ADDRESS,
    // Replies go to the actual person, not the system mailbox.
    replyTo: senderEmail,
    to,
    subject: `A message from ${senderEmail}`,
    text,
    html: shell(
      escapeHtml(switchTitle),
      `
        <p style="color:#8a8a96;font-size:13px;margin-top:0;">
          ${escapeHtml(senderEmail)} set up a Dead Man's Switch to send you this message if they ever went quiet. They didn't check in by the deadline.
        </p>
        <hr style="border:none;border-top:1px solid #26262f;margin:24px 0;" />
        <div style="white-space:pre-wrap;font-size:16px;line-height:1.7;color:#ededed;">${escapeHtml(message)}</div>
        <hr style="border:none;border-top:1px solid #26262f;margin:24px 0;" />
        <p style="font-size:12px;color:#6a6a76;">
          This message was held encrypted until delivery and is not stored after being sent.
        </p>
      `,
    ),
    headers: HIGH_PRIORITY_HEADERS,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
