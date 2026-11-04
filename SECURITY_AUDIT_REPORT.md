# 현대의료기(Express) 운영 보안 점검 보고서

대상: Node.js / Express / Neon PostgreSQL / Toss Payments  
일자: 2026-11-04  
범위: 요구사항 1–27 (쇼핑몰 결제 무결성 포함)  
배포: 이 점검은 **로컬 코드에만 반영**되어 있습니다. 원격 반영은 `푸시해줘`를 받은 뒤에 합니다.

운영 환경변수 필수 값: `NODE_ENV=production`, `DEBUG=False`, `SESSION_SECRET`, `DATABASE_URL`, `TOSS_SECRET_KEY`, `TOSS_CLIENT_KEY`, `ADMIN_URL_PATH`. 웹훅 서명 검증을 쓰려면 `TOSS_WEBHOOK_SECRET`도 넣습니다.

---

## 1. 결제 무결성 및 주문 보안 (요구 6, 19)

| 항목 | 점검 | 조치 |
|---|---|---|
| Zero-Trust 금액 | 클라이언트가 보낸 단가/합계를 쓰지 않음 | `buildItems()`가 DB/카탈로그 단가 × 수량(1–20)으로 재계산. `confirmTossOrder`는 DB `total_amount`와 요청 `amount`를 **정수 원 단위**로 비교하고, 주문 품목 합 + 배송비와도 재대조. 불일치 시 `payment_tamper` 감사 로그 후 승인 거부. |
| 토스 confirm | 승인 금액은 클라이언트가 아니라 서버 `expected` | `POST /v1/payments/confirm` body의 `amount`에 DB 금액만 전달. 승인 응답 `totalAmount`/`orderId` 재검증. 불일치 시 자동 취소. |
| 재고 동시성 | PostgreSQL 트랜잭션 | `finalizePaidOrder`: `BEGIN` + `SELECT ... FOR UPDATE` (주문·결제·상품·재고) 후 `qty >= ?` 조건부 차감. 실패 시 트랜잭션 예외 → `ROLLBACK`. |
| 망취소 | DB 저장 실패 시 결제 취소 | confirm 이후 `finalizePaidOrder` 실패 시 `cancelTossPayment` (`/cancel`) 호출. |
| 웹훅 | 본문 금액 미신뢰 | `/api/payments/webhook`: (선택) `TOSS_WEBHOOK_SECRET` 검사 → 토스 `GET /v1/payments/{paymentKey}` 재조회 → DB 주문번호·금액 일치 시에만 상태 변경. |

관련 파일: `server/payments.js`, `server/db.js` (`finalizePaidOrder`, `withTransaction`), `server.js` (`buildItems`).

---

## 2. 인증·세션·관리자 (요구 1, 5, 8, 9, 12, 15, 17)

| 항목 | 점검 | 조치 |
|---|---|---|
| 비밀번호 해시 | bcrypt 12 rounds | `server/passwords.js` `bcrypt.hashSync(..., 12)`. 기존 scrypt 해시는 검증만 유지, 로그인 성공 시 bcrypt로 재해시. |
| 세션 쿠키 | HttpOnly / Secure / SameSite=Lax | `hm_session`, `hm_oauth`: `HttpOnly`, `SameSite=Lax`, 운영에서 `Secure`. |
| Rate limit | express-rate-limit v6 | 일반 API: IP당 15분 100회. 로그인: 15분 5회(**성공 요청은 제외**). 회원가입: 15분 5회. 계정 단위 5회 실패 시 30분 잠금은 기존 유지. |
| 관리자 경로 | `/admin.html` 운영 차단 | `ADMIN_URL_PATH`(기본 `hyundai-control-99`). 운영에서 `/admin`, `/admin.html`은 404. API는 `requireAdmin`. |
| 재설정 토큰 | 암호학 난수 + 만료 + 1회용 | `crypto.randomBytes(32)` → SHA-256 저장, 30분 만료, `used_at` 원자적 갱신. 신규 발급 시 기존 미사용 토큰 무효화. |
| 보안 로깅 | 구조화 JSON + DB | `server/security_log.js` + `audit_logs`. 로그인 실패, 결제 위변조, 웹훅 위변조, 관리자 업로드/비밀번호 도움 작업에 IP·시각 기록. |

관련 파일: `server.js`, `server/guard.js`, `server/passwords.js`, `server/db.js`, `server/security_log.js`.

---

## 3. DB·입력 검증 (요구 3, 7, 10, 16)

| 항목 | 점검 | 조치 |
|---|---|---|
| SQL 인젝션 | 문자열 결합 쿼리 없음 | `pg`는 `toPg()`로 `?` → `$1,$2,...` 파라미터 바인딩만 사용. |
| XSS | 저장 시 script 차단, 출력 시 이스케이프 | `cleanText()`가 `<script` 거부. 마이페이지/관리자 주문 HTML은 `esc()`로 `&<>"'` 이스케이프. 후기 게시판은 없음(카탈로그 후기 수는 정적). |
| 입력 검증 | 서버측 | 이름/주소/수량/전화번호(`validPhone`), 주문 수량 1–20, 비밀번호 정책 `security.passwordError`. |
| CSRF | JSON API | 브라우저 폼 POST가 아닌 fetch API. `X-Requested-With: fetch`가 없으면 `/api/*`, `/orders/*`의 변경 요청 403. 웹훅만 예외. |

관련 파일: `server/db.js`, `server/pii.js`, `server/guard.js`, `js/app.js`.

---

## 4. 미들웨어·네트워크·헤더 (요구 4, 11, 13, 14, 20)

| 항목 | 점검 | 조치 |
|---|---|---|
| 운영 모드 | 스택 비노출 | `NODE_ENV=production` 권장. 전역 에러 핸들러가 운영에서 `err.stack`을 클라이언트로 보내지 않음. API 500은 고정 문구. |
| Helmet | 등록 | HSTS(운영), X-Content-Type-Options, X-Frame-Options=DENY. CSP는 토스/다음 주소검색과 충돌하지 않도록 Helmet CSP를 끄고 `securityHeaders`에서 페이지별 CSP 적용. |
| CORS | 허용 오리진 고정 | `https://hyundaimedi.com`, `https://www.hyundaimedi.com`, `https://heriumcare.com`, `https://www.heriumcare.com`. DEBUG일 때만 localhost. |
| HTTPS | 프록시 신뢰 + 리다이렉트 | `app.set("trust proxy", 1)`. `x-forwarded-proto !== https`이면 301 HTTPS. |

관련 파일: `server.js`, `server/guard.js`.

---

## 5. 파일 업로드 (요구 18)

`POST /api/admin/upload` + `requireAdmin`.  
`multer` `limits.fileSize = 5MB`, MIME `image/jpeg|png|webp`만. 디스크 파일명은 난수. 저장 경로 `uploads/products/` (git 무시).

관련 파일: `server/upload.js`, `server.js`.

---

## 6. 시크릿·정적 파일·의존성 (요구 2, 21–27)

| 항목 | 점검 | 조치 |
|---|---|---|
| 시크릿 | 코드에 키 하드코딩 없음 | `TOSS_SECRET_KEY`, `SESSION_SECRET`, `DATABASE_URL`은 `process.env`. `.env`는 `.gitignore`. 운영에서 `SESSION_SECRET` 없으면 프로세스 종료. |
| 정적 파일 | 루트 전체 서빙 금지 | `/css`, `/js`, `/uploads`만 `express.static`, `dotfiles: deny`. `.env`/`.git`/`server/` 미서빙. |
| npm audit | 실행함 | `npm audit fix`(비강제)로 `body-parser`/`qs` 완화. **잔여 2건(high)** 은 메이저 업그레이드가 필요해 이번엔 강제 적용하지 않음. |

잔여 취약점 (개발자 후속):

1. **nodemailer@6** — `npm audit fix --force` 시 10.x. SMTP 재설정 메일만 사용. 사용자 입력을 envelope/raw로 넣지 않음. 업그레이드 전 발송 경로 회귀 테스트 필요.
2. **zod@3** — 4.x는 스키마 API 파괴적 변경. 결제 입력 검증 회귀 후 올리기.

추가 패키지: `helmet`, `cors`, `express-rate-limit@6`, `multer`.

---

## 취약했던 점 → 이번에 보강한 코드

- 결제 승인 전 **품목 재합산 vs DB 합계** 대조가 약했음 → `server/payments.js` `confirmTossOrder`.
- 웹훅이 토스 재조회 후에도 **주문 금액 불일치**를 상태 반영할 여지가 있었음 → 웹훅에서 금액 재검증 + `applyVerified`가 주문·결제 금액 모두 비교.
- Rate limit / Helmet / CORS 패키지 미적용 → `server/guard.js` + `server.js` 미들웨어.
- 업로드 한도·MIME 미통일 → `server/upload.js`.
- 로그인 실패가 감사 로그에 안 남을 수 있음 → `login_failed` + `security_log`.
- 세션 쿠키 Secure가 DEBUG 플래그에만 묶여 있었음 → `IS_PROD \|\| !DEBUG`.
- 전역 에러에 스택이 나갈 수 있음 → 운영 JSON/HTML 고정 응답.

---

## 개발자 보안 테스트 시나리오

전제: 로컬은 `DEBUG=true`, 스테이징은 `NODE_ENV=production`, `DEBUG=False`. 결제 테스트는 토스 테스트 키.

### A. 결제 위변조

1. 가주문 생성 후, 브라우저에서 confirm 요청 `amount`를 실제보다 1원 낮춰 보냄.  
   **기대:** 400, 로그 `payment_tamper`, 토스 승인 없음(또는 승인됐다면 망취소).
2. 상품 단가를 클라이언트 JSON에서 조작해 가주문.  
   **기대:** 서버가 카탈로그 단가로 재계산한 금액만 토스에 전달.
3. 동일 `orderId`로 confirm을 동시에 두 번.  
   **기대:** 한 번만 PAID, 재고 이중 차감 없음(`already` 또는 409).
4. 재고 1개인 상품을 수량 2로 결제.  
   **기대:** 409 재고 부족. 이미 승인된 결제는 망취소.
5. 웹훅 body의 `totalAmount`만 바꾸고 `paymentKey`는 유효하게 보냄.  
   **기대:** 토스 재조회 금액·DB 금액 불일치 시 상태 변경 없음, `webhook_tamper` 로그. HTTP는 200(재시도 폭주 방지).

### B. 인증·관리자

6. `/api/login`을 같은 IP에서 틀린 비밀번호로 6회.  
   **기대:** 6회째 429 또는 계정 잠금 423.
7. 운영 모드에서 `https://도메인/admin.html` 접속.  
   **기대:** 404. `https://도메인/{ADMIN_URL_PATH}`만 관리자 HTML. 비관리자 세션으로 `/api/admin/products` → 403.
8. 비밀번호 찾기 후 메일 토큰으로 재설정, 같은 링크로 재시도.  
   **기대:** 두 번째는 만료/사용됨. 31분 후 첫 링크도 실패.

### C. 입력·헤더·업로드

9. SQL 문자열을 로그인 아이디에 넣음 (`' OR 1=1 --`).  
   **기대:** 401, DB 오류 없음.
10. 주문 메모에 `<script>alert(1)</script>`.  
    **기대:** 400 또는 저장돼도 마이페이지에 이스케이프되어 표시.
11. CSRF: `X-Requested-With` 없이 POST `/api/orders`.  
    **기대:** 403.
12. 다른 Origin(`https://evil.example`)에서 credential CORS.  
    **기대:** ACAO 미허용.
13. HTTP로 스테이징 접속.  
    **기대:** 301 HTTPS.
14. 관리자로 6MB PNG, 또는 `image/svg+xml` 업로드.  
    **기대:** 400. jpeg/png/webp 5MB 이하는 `/uploads/products/...` 반환.
15. `/.env`, `/server/db.js` URL 직접 요청.  
    **기대:** 404 HTML. 파일 내용 미노출.

### D. 의존성

16. 배포 전 `npm audit`. nodemailer/zod 메이저 업은 별도 회귀 후.

---

## Render 체크리스트

- `NODE_ENV=production`
- `DEBUG=False`
- `SESSION_SECRET` (긴 난수)
- `ADMIN_URL_PATH` (추측 어려운 경로, robots에 Disallow 됨)
- `TOSS_SECRET_KEY` / `TOSS_CLIENT_KEY` (키 종류: `ck`/`gck`와 SDK 일치)
- (권장) `TOSS_WEBHOOK_SECRET`
- `DATABASE_URL` Neon
- `ALLOWED_HOSTS=hyundaimedi.com,www.hyundaimedi.com,.onrender.com`
