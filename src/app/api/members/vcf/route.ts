import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function cleanPhone(phone: string | null): string {
  if (!phone) return "";
  // Normalize to digits only, then format as 010-XXXX-XXXX
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("010")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return phone.trim();
}

function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

function toVcard(user: {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  position: string | null;
  avatarUrl: string | null;
}): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`FN:${escapeVcard(user.name)}`);
  lines.push(`N:${escapeVcard(user.name)};;;;`);

  if (user.company?.trim()) {
    lines.push(`ORG:${escapeVcard(user.company.trim())}`);
  }
  if (user.position?.trim()) {
    lines.push(`TITLE:${escapeVcard(user.position.trim())}`);
  }

  const phone = cleanPhone(user.phone);
  if (phone) {
    lines.push(`TEL;TYPE=CELL:${phone}`);
  }

  if (user.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${user.email}`);
  }

  lines.push("NOTE:aSSiST 11기 원우");
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await db
    .select({
      name: users.name,
      email: users.email,
      phone: users.phone,
      company: users.company,
      position: users.position,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .orderBy(asc(users.name));

  const vcfContent = members.map(toVcard).join("\r\n");

  return new NextResponse(vcfContent, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="assist11th-contacts.vcf"`,
    },
  });
}
