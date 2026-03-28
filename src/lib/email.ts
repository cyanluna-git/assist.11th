import { Resend } from "resend";
import { toAbsoluteUrl } from "@/lib/site-url";

const DEFAULT_FROM_NAME = "ASSIST 11기";
const DEFAULT_FROM_EMAIL = "noreply@notify.cyanluna.com";
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

function getEmailFromAddress() {
  const fromName = process.env.RESEND_FROM_NAME?.trim() || DEFAULT_FROM_NAME;
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
  return `${fromName} <${fromEmail}>`;
}

interface SendDigestParams {
  to: string;
  name: string;
  unreadCount: number;
  notifications: Array<{ title: string; createdAt: Date }>;
}

export async function sendDigestEmail(params: SendDigestParams): Promise<void> {
  const { to, name, unreadCount, notifications } = params;
  const resend = getResendClient();

  const notificationList = notifications
    .slice(0, 10)
    .map((n) => `<li style="margin-bottom:8px">${n.title}<br><small style="color:#888">${new Date(n.createdAt).toLocaleDateString("ko-KR")}</small></li>`)
    .join("");

  await resend.emails.send({
    from: getEmailFromAddress(),
    to,
    subject: `[ASSIST] 읽지 않은 알림 ${unreadCount}개가 있습니다`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
        <h2 style="color:#0f4d81">안녕하세요 ${name}님!</h2>
        <p>지난 한 주 동안 <strong>${unreadCount}개</strong>의 읽지 않은 알림이 있습니다.</p>
        <ul style="list-style:none;padding:0">${notificationList}</ul>
        ${unreadCount > 10 ? `<p>...외 ${unreadCount - 10}개</p>` : ""}
        <p style="margin-top:24px">
          <a href="https://assist11th.vercel.app" style="display:inline-block;padding:12px 24px;background:#0f4d81;color:white;text-decoration:none;border-radius:8px">
            커뮤니티 바로가기
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#888;font-size:12px">이 이메일은 주간 다이제스트 설정이 켜져 있어 발송되었습니다.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const resend = getResendClient();
  const resetUrl = toAbsoluteUrl(`/reset-password?token=${encodeURIComponent(params.token)}`);

  await resend.emails.send({
    from: getEmailFromAddress(),
    to: params.to,
    subject: "[ASSIST] 비밀번호 재설정 링크",
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
        <h2 style="color:#0f4d81">안녕하세요 ${params.name}님</h2>
        <p>비밀번호 재설정을 요청하셨다면 아래 버튼을 눌러 새 비밀번호를 설정해주세요.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0f4d81;color:white;text-decoration:none;border-radius:8px">
            비밀번호 재설정
          </a>
        </p>
        <p style="font-size:13px;color:#64748b">이 링크는 1시간 동안만 유효합니다.</p>
        <p style="font-size:13px;color:#64748b">직접 연 경우가 아니라면 이 메일은 무시하셔도 됩니다.</p>
      </div>
    `,
  });
}
