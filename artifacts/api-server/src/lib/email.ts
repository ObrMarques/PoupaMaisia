import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "PoupaMais <onboarding@resend.dev>";

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const firstName = name.split(" ")[0];

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bem-vindo ao PoupaMais!",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo ao PoupaMais</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;background:#ffffff;border-radius:8px;display:inline-block;text-align:center;line-height:36px;font-size:18px;font-weight:bold;color:#111111;">$</div>
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;vertical-align:middle;margin-left:10px;">PoupaMais</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111111;letter-spacing:-0.5px;">
                Olá, ${firstName}! 👋
              </h1>
              <p style="margin:0 0 20px;font-size:16px;color:#444444;line-height:1.6;">
                Seja muito bem-vindo ao <strong>PoupaMais</strong> — seu assistente de finanças pessoais inteligente.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.7;">
                Com o PoupaMais você pode:
              </p>

              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:18px;margin-right:12px;">💰</span>
                    <span style="font-size:14px;color:#333333;font-weight:500;">Controlar todas as suas transações</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:18px;margin-right:12px;">🎯</span>
                    <span style="font-size:14px;color:#333333;font-weight:500;">Criar e acompanhar metas financeiras</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:18px;margin-right:12px;">📊</span>
                    <span style="font-size:14px;color:#333333;font-weight:500;">Ver relatórios e gráficos dos seus gastos</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:18px;margin-right:12px;">🤖</span>
                    <span style="font-size:14px;color:#333333;font-weight:500;">Receber insights personalizados da PoupaAI</span>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://poupamaix.replit.app/dashboard"
                       style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:-0.2px;">
                      Acessar meu painel →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:24px 40px;border-top:1px solid #eeeeee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;">
                Você está recebendo este e-mail porque criou uma conta no PoupaMais.<br/>
                &copy; ${new Date().getFullYear()} PoupaMais. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}

export async function sendVerificationEmail(email: string, link: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verifique sua conta — PoupaMais",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifique sua conta</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#111111;padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;background:#ffffff;border-radius:8px;display:inline-block;text-align:center;line-height:36px;font-size:18px;font-weight:bold;color:#111111;">$</div>
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;vertical-align:middle;margin-left:10px;">PoupaMais</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.5px;">
                Confirme seu e-mail
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.7;">
                Clique no botão abaixo para verificar sua conta e começar a usar o PoupaMais.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${link}"
                       style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:-0.2px;">
                      Verificar e-mail →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;">
                Se você não criou uma conta no PoupaMais, ignore este e-mail. O link expira em 24 horas.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999999;">
                &copy; ${new Date().getFullYear()} PoupaMais. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Redefinição de senha — PoupaMais",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Redefinir senha</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#111111;padding:32px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;">PoupaMais</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111111;">Redefinir sua senha</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.7;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;">
                      Redefinir senha
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;">
                Se você não solicitou a redefinição de senha, ignore este e-mail. O link expira em 1 hora.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999999;">&copy; ${new Date().getFullYear()} PoupaMais</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
