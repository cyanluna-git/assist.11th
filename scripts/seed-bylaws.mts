import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env manually
const envPath = resolve(import.meta.dirname!, "..", ".env");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const sql = neon(process.env.DATABASE_URL!);

// 1. Find admin user
const admins = await sql`SELECT id, name, email FROM users WHERE role = 'admin' LIMIT 5`;
console.log("Admin users:", admins);

const adminId = admins[0]?.id ?? null;

// 2. Upsert organization roles
const roles = [
  { roleKey: "president", memberName: "박근윤" },
  { roleKey: "vice_president", memberName: "이현준" },
  { roleKey: "women_president", memberName: null },
  { roleKey: "treasurer", memberName: "신은정" },
];

for (const { roleKey, memberName } of roles) {
  await sql`
    INSERT INTO organization_roles (role_key, member_name, updated_at)
    VALUES (${roleKey}, ${memberName}, NOW())
    ON CONFLICT (role_key)
    DO UPDATE SET member_name = ${memberName}, updated_at = NOW()
  `;
  console.log(`  ${roleKey}: ${memberName ?? "(공석)"}`);
}

// 3. Insert bylaw version (수정안)
const bylawContent = `## 제1장 총칙

### 제1조 (명칭)
본 조직은 'AI전략경영 석사과정 제11기 원우회'(이하 '본 회')라 칭한다.

### 제2조 (목적)
본 회는 회원 간의 친목 도모, 학술 정보 공유 및 AI 비즈니스 네트워크 구축을 통해 원우 공동의 발전과 화합을 목적으로 한다.

### 제3조 (소재지)
본 회의 사무처는 해당 교육기관 내 지정 장소 또는 온라인 공식 커뮤니티(단톡방 등)에 둔다.

---

## 제2장 회원 및 권리·의무

### 제4조 (회원 자격)
본 회의 회원은 AI전략경영 석사과정 제1기에 재학 중인 원우 전원으로 한다. 단, 졸업 후에는 동문회원으로 그 자격이 전환된다.

### 제5조 (권리와 의무)
- 본 회의 운영에 관한 의결권과 선거권을 가진다.
- 본 회가 주최하는 모든 행사에 참여하고 혜택을 받을 권리가 있다.
- 본 규정을 준수하고, 정해진 연회비를 납부할 의무를 가진다.
- 원우회 네트워크를 이용하여 타 회원에게 금전적 손실을 입히는 행위, 공동체 윤리에 어긋나는 행위, 회원 간의 불화를 지속적으로 조장하는 행위 등을 금지한다.
  - 본 항을 위반할 시 임원진 회의를 거쳐 경고, 회원 자격 정지 또는 제명할 수 있다.

---

## 제3장 조직 및 임원

### 제6조 (임원의 구성)
원활한 운영을 위해 다음과 같은 임원을 둔다.

- **회장 (1인)**: 본 회를 대표하며 업무 전반을 총괄하고 모든 회의를 주재한다.
- **부회장 (2인)**: 회장의 총괄업무를 보좌하며, 회장 유고 시 그 직무를 대행한다.
- **총무 (1인)**: 본 회의 재무 관리, 회계 기록 및 행정 실무를 담당한다.
- **학술팀장 (2인)**: AI 관련 최신 트렌드 공유, 정기 학술 세미나 기획, 스터디 그룹 운영 및 학업 자료(논문/과제 등) 아카이빙을 담당한다.
- **대외협력팀장 (2인)**: 대외(학교, 타 기수) 공식적인 경조사 공지 및 원우 비즈니스 홍보와 공식 소통 채널(단톡방/밴드 등) 관리를 담당한다.
- **오락팀장 (2인)**: 정기 회식 및 종강 파티 등 각종 행사의 레크리에이션 기획, 원우 간 친목 도모를 위한 이벤트 등 주관 및 행사의 분위기 조성을 담당한다.
- **감사 (2인)**: 본 회의 회계 집행의 적정성과 운영 전반을 감독하며, 학기별 1회 이상 결산 내역을 검토하여 그 결과를 원우들에게 보고한다.

각 팀장은 원활한 업무 수행을 위해 필요한 경우, 약간명의 팀원을 구성하여 운영할 수 있다.

### 제7조 (임원의 선출 및 임기)
임원의 임기는 1년을 원칙으로 하되, 총회 참석 인원의 과반수 찬성 하에 연임할 수 있다.

---

## 제4장 총회 및 의결

### 제8조 (총회 및 의결 기준)
본 회의 총회는 재적 회원 과반수의 출석으로 개회하고, 출석 회원 과반수의 찬성으로 의결한다. 가부동수일 경우 회장이 결정권을 가진다.

---

## 제5장 재정 및 행사 운영

### 제9조 (연회비 및 납부)

본 회의 회계 연도는 매년 3월 1일부터 익년 2월 말일까지로 한다.

- 본 회의 연회비는 1인당 연 금 일십만 원(₩100,000)으로 정한다.
- 회원은 학기 초 지정된 기일 내에 일시 납부하는 것을 원칙으로 한다.
- 지정된 기일 내 연회비 미납 시, 경조사 지원 및 원우회 주최 행사 참여에 제한을 둘 수 있다.

### 제10조 (행사 운영 원칙)
- 본 회가 주최하는 정기 회식, 세미나, 종강 파티 등 모든 공식적인 행사의 비용은 원우회비에서 지출하는 것을 원칙으로 한다.
- 공식 행사 외 소수 인원의 번개 모임이나 사적인 모임은 해당 참여자가 자율적으로 비용을 부담한다.

### 제11조 (지출 용도)
회비는 공식 행사비(식사 및 대관), 경조사 지원, 원우 수첩 및 기념품 제작, 학술 자료 구매비 등으로 사용한다.

### 제12조 (회계 투명성)
총무는 모든 지출 내역을 디지털 장부에 기록하고, 영수증을 첨부하여 분기별 1회 이상 전체 원우에게 투명하게 공개한다.

---

## 제6장 경조사 지원 규정

### 제13조 (경조사 범위 및 기준)
- 회원 본인 및 배우자 부모상: 원우회 명의의 조화 송부 및 조의금 전달
- 회원 본인 및 자녀 결혼: 원우회 명의의 축하 화환 송부
- 기타 특수한 상황은 임원진 협의를 거쳐 결정한다.

---

## 제7장 커뮤니티 에티켓 및 보칙

### 제14조 (상호 존중 및 온라인 예절)
세대가 공존하는 조직의 특성상 상호 존중을 원칙으로 하고, 공식 단톡방에서의 비방, 정치적 발언, 과도한 개인 홍보 활동을 금지하며 상호 예의를 준수한다.

### 제15조 (효력)
본 규정은 재적 회원 과반수 출석과 출석 회원 과반수 찬성으로 통과 즉시 효력을 발생하며, 명시되지 않은 사항은 임원진의 합의와 일반 관례에 따른다.`;

const version = "v1.0 초안";

// Check if version already exists
const existing = await sql`SELECT id FROM bylaw_versions WHERE version = ${version}`;
if (existing.length > 0) {
  console.log(`\nBylaw version "${version}" already exists, updating...`);
  await sql`UPDATE bylaw_versions SET content = ${bylawContent}, created_by = ${adminId} WHERE version = ${version}`;
} else {
  await sql`
    INSERT INTO bylaw_versions (version, content, created_by)
    VALUES (${version}, ${bylawContent}, ${adminId})
  `;
}
console.log(`\nBylaw published: "${version}"`);

console.log("\nDone!");
