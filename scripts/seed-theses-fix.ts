/**
 * Fix missing thesis #2 and #8 — upload to R2 + insert into DB
 * Run: pnpm tsx scripts/seed-theses-fix.ts
 */
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

const PDF_DIR =
  "/Users/cyanluna-pro16/Library/CloudStorage/GoogleDrive-pjy8412@gmail.com/내 드라이브/01_Project/dev_blob/assist_hub_classroom_materials/announcements/notice_20260303/[Article]_extracted";

const ADMIN_USER_ID = "d91060e1-502b-4622-9022-06bc0e34fe5b";

// Find actual filenames by prefix (avoids apostrophe/encoding issues)
function findFileByPrefix(prefix: string): string | null {
  const files = fs.readdirSync(PDF_DIR);
  const match = files.find((f) => f.startsWith(prefix));
  return match ?? null;
}

const MISSING = [
  {
    prefix: "2.",
    title:
      "Online review data analytics to explore factors affecting consumers' airport recommendations",
    abstract:
      "온라인 리뷰 데이터 분석을 통해 소비자의 공항 추천에 영향을 미치는 요인을 탐색한다. 텍스트 마이닝 및 감성 분석 기법을 활용하여 서비스 품질 요소를 도출하였다.",
    field: "데이터분석/서비스",
  },
  {
    prefix: "8.",
    title:
      "Impact of Digital Assistant Attributes on Millennials' Purchasing Intentions: A Multi-Group Analysis using PLS-SEM, Artificial Neural Network and fsQCA",
    abstract:
      "디지털 어시스턴트 속성이 밀레니얼 세대의 구매 의도에 미치는 영향을 PLS-SEM, 인공신경망, fsQCA를 활용한 다중 그룹 분석으로 검증한다.",
    field: "디지털마케팅/AI",
  },
];

async function main() {
  const db = neon((process.env.DATABASE_URL ?? "").trim());

  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const bucket = process.env.R2_BUCKET_NAME!;
  const publicUrl = process.env.R2_PUBLIC_URL!;

  console.log("\n📚 누락 논문 2편 등록\n");

  for (const t of MISSING) {
    const file = findFileByPrefix(t.prefix);
    if (!file) {
      console.log(`⚠️  파일 없음 (prefix: ${t.prefix})`);
      continue;
    }

    const filePath = path.join(PDF_DIR, file);
    const fileSize = fs.statSync(filePath).size;
    console.log(`\n📄 ${t.title}`);
    console.log(`   파일: ${file}`);
    console.log(`   크기: ${(fileSize / 1024 / 1024).toFixed(1)}MB`);

    try {
      const key = `thesis/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
      const buffer = fs.readFileSync(filePath);

      await r2.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: "application/pdf",
        }),
      );

      const fileUrl = `${publicUrl}/${key}`;
      console.log(`   ✅ R2 업로드 완료: ${key}`);

      const rows = await db`
        INSERT INTO thesis (title, abstract, field, status, file_url, author_id)
        VALUES (${t.title}, ${t.abstract}, ${t.field}, 'submitted', ${fileUrl}, ${ADMIN_USER_ID})
        ON CONFLICT DO NOTHING
        RETURNING id
      `;

      if (rows.length > 0) {
        console.log(`   ✅ DB 등록 완료: ${rows[0].id}`);
      } else {
        console.log(`   ⚠️  이미 등록된 논문 (스킵)`);
      }
    } catch (err) {
      console.error(`   ❌ 오류:`, err instanceof Error ? err.message : err);
    }
  }

  const [{ count }] = await db`SELECT COUNT(*) as count FROM thesis`;
  console.log(`\n✅ 완료! 총 논문 수: ${count}편\n`);
}

main().catch(console.error);
