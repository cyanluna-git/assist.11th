/**
 * Seed theses from assist.hub PDF files to R2 + Neon DB
 * Run: pnpm tsx scripts/seed-theses.ts
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

// Thesis metadata
const THESES = [
  {
    file: "1. 연구논문_Humans as teammates The signal of human–AI teaming enhances consumer acceptance of chatbots.pdf",
    title: "Humans as teammates: The signal of human–AI teaming enhances consumer acceptance of chatbots",
    abstract: "본 연구는 인간-AI 팀워크 신호가 챗봇에 대한 소비자 수용도를 향상시키는 메커니즘을 분석한다. 팀워크 신호가 소비자의 챗봇 신뢰도와 사용 의도에 미치는 영향을 실험을 통해 검증하였다.",
    field: "AI/소비자행동",
  },
  {
    file: "2. 연구논문_Online review data analytics to explore factors affecting consumers' airport recommendations.pdf",
    title: "Online review data analytics to explore factors affecting consumers' airport recommendations",
    abstract: "온라인 리뷰 데이터 분석을 통해 소비자의 공항 추천에 영향을 미치는 요인을 탐색한다. 텍스트 마이닝 및 감성 분석 기법을 활용하여 서비스 품질 요소를 도출하였다.",
    field: "데이터분석/서비스",
  },
  {
    file: "3. 연구논문_PhiUSIIL A diverse security profile empowered phishing URL detection framework based on similarity index and incremental learning.pdf",
    title: "PhiUSIIL: A diverse security profile empowered phishing URL detection framework based on similarity index and incremental learning",
    abstract: "유사도 지수와 증분 학습을 기반으로 한 피싱 URL 탐지 프레임워크를 제안한다. 다양한 보안 프로파일을 활용하여 피싱 공격을 효과적으로 탐지하는 방법론을 제시한다.",
    field: "사이버보안/AI",
  },
  {
    file: "4. 연구논문_Automatic recognition system for concrete cracks with support vector machine based on crack features.pdf",
    title: "Automatic recognition system for concrete cracks with support vector machine based on crack features",
    abstract: "균열 특징을 기반으로 한 SVM을 활용하여 콘크리트 균열을 자동으로 인식하는 시스템을 개발한다. 이미지 처리 기술과 머신러닝을 결합하여 구조물 안전 진단을 자동화한다.",
    field: "AI/인프라",
  },
  {
    file: "5. 연구논문_A three‑step SEM‑Bayesian network approach for predicting the determinants of CloudIoT‑based healthcare adoption.pdf",
    title: "A three-step SEM-Bayesian network approach for predicting the determinants of CloudIoT-based healthcare adoption",
    abstract: "3단계 SEM-베이지안 네트워크 접근법을 통해 클라우드 IoT 기반 헬스케어 도입 결정 요인을 예측한다. 헬스케어 기술 수용 모델을 발전시킨 연구이다.",
    field: "헬스케어/IoT",
  },
  {
    file: "6. 연구논문_Application of cluster analysis to identify different reader groups through their engagement with a digital reading supplement.pdf",
    title: "Application of cluster analysis to identify different reader groups through their engagement with a digital reading supplement",
    abstract: "클러스터 분석을 통해 디지털 읽기 보조 도구의 참여도를 기반으로 다양한 독자 그룹을 식별한다. 디지털 학습 환경에서의 사용자 세분화 방법론을 제시한다.",
    field: "교육기술/데이터분석",
  },
  {
    file: "7. 연구논문_Elevating theoretical insight and predictive accuracy in business research Combining PLS-SEM and selected machine learning algorithms.pdf",
    title: "Elevating theoretical insight and predictive accuracy in business research: Combining PLS-SEM and selected machine learning algorithms",
    abstract: "PLS-SEM과 머신러닝 알고리즘을 결합하여 비즈니스 연구에서 이론적 통찰과 예측 정확도를 향상시키는 방법론을 제안한다.",
    field: "연구방법론/비즈니스",
  },
  {
    file: "8. 연구논문_Impact of Digital Assistant Attributes on Millennials' Purchasing Intentions A Multi‑Group Analysis using PLS‑SEM, Artifcial Neural Network and fsQCA.pdf",
    title: "Impact of Digital Assistant Attributes on Millennials' Purchasing Intentions: A Multi-Group Analysis using PLS-SEM, Artificial Neural Network and fsQCA",
    abstract: "디지털 어시스턴트 속성이 밀레니얼 세대의 구매 의도에 미치는 영향을 PLS-SEM, 인공신경망, fsQCA를 활용한 다중 그룹 분석으로 검증한다.",
    field: "디지털마케팅/AI",
  },
  {
    file: "9. 연구논문_CAF-ODNN Complementary attention fusion with optimized deep neural network for multimodal fake news detection.pdf",
    title: "CAF-ODNN: Complementary attention fusion with optimized deep neural network for multimodal fake news detection",
    abstract: "보완적 어텐션 융합과 최적화된 심층 신경망을 활용하여 멀티모달 가짜 뉴스를 탐지하는 CAF-ODNN 프레임워크를 제안한다.",
    field: "AI/미디어",
  },
  {
    file: "10. 연구논문_GNN-IR Examining graph neural networks for influencer recommendations.pdf",
    title: "GNN-IR: Examining graph neural networks for influencer recommendations",
    abstract: "그래프 신경망을 활용한 인플루언서 추천 시스템 GNN-IR을 제안한다. 소셜 네트워크 구조를 활용하여 효과적인 인플루언서 매칭을 수행한다.",
    field: "AI/소셜미디어",
  },
  {
    file: "11. 연구논문_Body stakes an existential ethics of care in living with biometrics.pdf",
    title: "Body stakes: An existential ethics of care in living with biometrics",
    abstract: "생체인식 기술과 함께 살아가는 것의 실존적 돌봄 윤리를 탐구한다. 개인 데이터와 신체 자율성에 관한 철학적·윤리적 함의를 분석한다.",
    field: "기술윤리/AI",
  },
  {
    file: "12. 연구논문_Artificial intelligence innovation of tourism businesses From satisfied tourists to continued service usage intention.pdf",
    title: "Artificial intelligence innovation of tourism businesses: From satisfied tourists to continued service usage intention",
    abstract: "관광 비즈니스의 AI 혁신이 관광객 만족도와 지속적 서비스 사용 의도에 미치는 영향을 분석한다. AI 기반 관광 서비스의 가치 창출 메커니즘을 규명한다.",
    field: "AI/관광",
  },
];

async function main() {
  const db = neon(process.env.DATABASE_URL!.trim());

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

  console.log(`\n📚 ASSIST 11기 논문 등록 시작 (${THESES.length}편)\n`);

  for (const t of THESES) {
    const filePath = path.join(PDF_DIR, t.file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  파일 없음: ${t.file}`);
      continue;
    }

    const fileSize = fs.statSync(filePath).size;
    console.log(`\n📄 ${t.title}`);
    console.log(`   파일: ${(fileSize / 1024 / 1024).toFixed(1)}MB`);

    try {
      // 1. Upload to R2
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

      // 2. Insert into DB
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
