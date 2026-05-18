import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

function createTransport() {
  if (!gmailUser || !gmailPass) {
    throw new Error("GMAIL_USER ou GMAIL_APP_PASSWORD não configurados.");
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
    tls: { rejectUnauthorized: false },
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transport = createTransport();

  await transport.sendMail({
    from: `"PoupaMais" <${gmailUser}>`,
    to,
    subject: "Seu código de verificação — PoupaMais",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Código de verificação</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#111111;padding:28px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">PoupaMais</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;">Verifique sua conta</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.7;">
                Use o código abaixo para confirmar seu e-mail. Ele expira em <strong>10 minutos</strong>.
              </p>

              <div style="text-align:center;margin:0 0 28px;">
                <div style="display:inline-block;background:#f4f4f4;border:2px dashed #dddddd;border-radius:12px;padding:20px 40px;">
                  <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#111111;font-family:'Courier New',monospace;">${otp}</span>
                </div>
              </div>

              <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;text-align:center;">
                Se você não criou uma conta no PoupaMais, ignore este e-mail.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#bbbbbb;">&copy; ${new Date().getFullYear()} PoupaMais</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const transport = createTransport();

  await transport.sendMail({
    from: `"PoupaMais" <${gmailUser}>`,
    to,
    subject: "Redefinição de senha — PoupaMais",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Redefinição de senha</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#111111;padding:28px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">PoupaMais</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;">Redefinir sua senha</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.7;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para continuar.<br/>
                O link expira em <strong>1 hora</strong>.
              </p>
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${resetLink}" style="display:inline-block;background:#111111;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">
                  Redefinir senha
                </a>
              </div>
              <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;text-align:center;">
                Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanece inalterada.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#bbbbbb;">&copy; ${new Date().getFullYear()} PoupaMais</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

export function isSmtpConfigured(): boolean {
  return Boolean(gmailUser && gmailPass);
}
