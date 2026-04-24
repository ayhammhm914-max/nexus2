type BaseEmailOptions = {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

const shell = ({ title, body, ctaLabel, ctaUrl }: BaseEmailOptions) => `
  <div style="background:#0D0D14;padding:32px;font-family:Inter,Arial,sans-serif;color:#F5F7FF;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#151523;border:1px solid #26263B;border-radius:20px;overflow:hidden;">
      <tr>
        <td style="padding:28px 32px;background:linear-gradient(135deg,#00D4FF 0%,#7C3AED 100%);">
          <div style="font-family:Orbitron,Inter,Arial,sans-serif;font-size:28px;font-weight:700;letter-spacing:0.16em;">NEXUS</div>
          <div style="margin-top:8px;opacity:0.9;">Digital game codes, delivered with precision.</div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">${title}</h1>
          <div style="font-size:15px;line-height:1.7;color:#D7DBF4;">${body}</div>
          ${
            ctaLabel && ctaUrl
              ? `<div style="margin-top:28px;"><a href="${ctaUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#00D4FF;color:#04121A;text-decoration:none;font-weight:700;">${ctaLabel}</a></div>`
              : ""
          }
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px;border-top:1px solid #26263B;color:#9AA4D6;font-size:13px;line-height:1.6;">
          Need help? Contact <a href="mailto:support@nexus.gg" style="color:#8BE9FF;">support@nexus.gg</a>.<br/>
          You are receiving this email because you interacted with NEXUS.
        </td>
      </tr>
    </table>
  </div>
`;

export const welcomeEmail = (username: string, verificationUrl: string) =>
  shell({
    title: `Welcome to NEXUS, ${username}`,
    body: "Your account is ready. Verify your email to unlock secure order history, wishlist syncing, and fast checkout.",
    ctaLabel: "Verify Email",
    ctaUrl: verificationUrl
  });

export const verificationEmail = (username: string, verificationUrl: string) =>
  shell({
    title: `Verify your email, ${username}`,
    body: "Use the button below to finish securing your NEXUS account.",
    ctaLabel: "Verify Email",
    ctaUrl: verificationUrl
  });

export const passwordResetEmail = (username: string, resetUrl: string, expiresIn: string) =>
  shell({
    title: `Reset your password, ${username}`,
    body: `A password reset was requested for your NEXUS account. This link expires in ${expiresIn}. If you did not request it, you can safely ignore this email.`,
    ctaLabel: "Reset Password",
    ctaUrl: resetUrl
  });

export const orderConfirmationEmail = (orderNumber: string) =>
  shell({
    title: `Order ${orderNumber} confirmed`,
    body: "Your payment was successful. For security, your keys are available from your authenticated order page inside NEXUS."
  });

