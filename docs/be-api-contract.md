# Backend API Contract (UserService + ChatService)

**Status:** Verified against source and live services · **Date of verification:** 2026-10-14
**BE repo (read-only):** `D:\KI 8\PRN232\BE\Alumni-Student-Community-Platform` (.NET 10, ASP.NET Core, EF Core + PostgreSQL, SignalR)
**Audience:** FE team (Nguyen Phuong Khai) and BE owner (Nguyen Chi Trung)

## 0. How this document was produced

| Evidence type | Meaning in this document |
| :--- | :--- |
| **[code]** | Read directly from BE source (file and line refs given as `File:line` relative to `src/Services/<Service>/`). |
| **[live]** | Observed by calling the running services on `localhost:5164` / `localhost:5199` on 2026-10-14. |
| **[expected]** | Follows from framework defaults / source, but was not executed (e.g. to avoid mutating seed data). |

Every `.cs` file under both services was read, plus `README.md` and `ARCHITECTURE_C4.md`.
Live probing side effects on the dev DB: several logins, one logout (one revoked token row), SignalR connections that joined/left a room. **No users, rooms or messages were created and no seed data was changed.**
The BE repo contains only `UserService` and `ChatService`. Forum, AI and Admin services are assigned to other members in `README.md` and **do not exist in this repo**.

---

## 1. Global conventions

| Topic | Fact | Evidence |
| :--- | :--- | :--- |
| Base URLs | User: `http://localhost:5164` · Chat REST: `http://localhost:5199` · Hub: `http://localhost:5199/hubs/chat` (HTTPS profiles: 7166 / 7078) | `Properties/launchSettings.json` [code] |
| Two origins | Auth/profile/users and chat live on **different ports**. The FE `apiClient` has a single `VITE_API_BASE_URL`; FE needs two base URLs (User API, Chat API) plus the hub URL. | [code] |
| JSON casing | **camelCase** for all request/response bodies and SignalR payloads (ASP.NET Core `AddControllers()` default; SignalR JSON protocol default). Request binding is case-insensitive. | [live] |
| Dates | ISO 8601 UTC with `Z` suffix and up to 7 fractional digits, e.g. `2026-10-21T02:22:40.3125626Z`. | [live] |
| IDs | GUID strings (lowercase, hyphenated). IDs of seeded users/rooms are random per database; **never hard-code them**. | [live] |
| Auth header | `Authorization: Bearer <jwt>` on both services. Hub additionally accepts `?access_token=<jwt>` (see section 5). | [code][live] |
| Language of messages | All `message` strings returned by BE are Vietnamese user-facing text. This document gives English glosses. FE must not branch on message text; branch on HTTP status + endpoint. | [live] |
| Swagger | Enabled in every environment (no `IsDevelopment()` guard), served at the **site root**: `http://localhost:5164/` and `http://localhost:5199/`; JSON at `/swagger/v1/swagger.json`. Swagger lists only the REST endpoints (hub is not listed). The generated document has `"security":[{}]` (empty requirement), so Swagger UI may not attach the Bearer token automatically. | `Program.cs:141-146` (User), `Program.cs:148-153` (Chat) [code][live] |
| CORS | **User:** policy `AllowAll` = any origin, method, header, **no credentials** (`Access-Control-Allow-Origin: *`). **Chat:** policy `AllowSignalR` = any origin reflected back + `AllowCredentials`. Preflight from `http://localhost:5173` returned 204 with correct headers on both. No FE proxy is required. | `User Program.cs:51-59`, `Chat Program.cs:61-70` [code][live] |
| Validation | `[ApiController]` auto model validation is on (see 1.2). | [live] |
| Auth failures | JwtBearer challenge: `401` with **empty body** and `WWW-Authenticate: Bearer` (no token) or `Bearer error="invalid_token"` (bad token). No `403` is ever produced (no role/policy authorization exists anywhere in BE). | [live] |

### 1.1 Response envelope rules (inconsistent by design of the BE, per endpoint)

There are **three** success shapes. The FE must pick the shape per endpoint, not globally:

1. **Raw DTO** (no wrapper): GET endpoints (`profile/me`, `profile/{id}`, `profile/privacy`, `users/search`, `users/blocked`, `chat/rooms`, `chat/rooms/{id}/messages`) and chat `POST .../messages`.
2. **Wrapped `{ "message": string, "data": T }`**: register, login, google-login, `PUT profile/me`, `PUT profile/privacy`.
3. **Message only `{ "message": string }`** (plus `token` for forgot-password): verify-email, resend-verification, change-password, forgot-password, reset-password, logout, block, unblock.
4. **Anonymous objects**: chat `POST rooms/direct` and `POST rooms/group` -> `{ "roomId", "name" }`; chat messages page -> `{ "items", "totalCount", "page", "pageSize" }`.

There is **no `success` field anywhere**. The FE type `ApiResponse<T> { data, message?, success }` in `src/types/api.types.ts` does not match any BE shape.

### 1.2 Error body shapes

| Status | Source | Body | Content-Type |
| :--- | :--- | :--- | :--- |
| `400` business rule | Controller `catch` blocks | `{ "message": string }` | `application/json` |
| `400` model validation | `[ApiController]` | RFC 9110 ProblemDetails: `{ "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1", "title": "One or more validation errors occurred.", "status": 400, "errors": { "<PropertyName>": ["..."] }, "traceId": "00-..." }` | `application/problem+json` |
| `401` bad credentials / wrong current password | Controller | `{ "message": string }` | `application/json` |
| `401` missing / invalid JWT | JwtBearer | empty body, `WWW-Authenticate` header | none |
| `401` revoked (logged-out) JWT | `TokenRevocationMiddleware` | `{"message": "<session expired or logged out>"}` | `application/json` |
| `404` | `GET profile/{id}`, `DELETE users/{id}/block`, `POST chat/rooms/{id}/messages` | `{ "message": string }` | `application/json` |
| `404` route constraint miss (e.g. `/api/profile/not-a-guid`) | Routing | empty body | none |
| `500` | Unhandled exception | In Development: `text/plain` stack trace (observed for chat `page=0`). Not an envelope. | `text/plain` |

Notes on `errors` keys [live]:
- Keys are the **C# property/parameter names in PascalCase** (`Email`, `Password`, `FullName`, `Content`, `TargetUserName`), not camelCase. FE must normalise (lower-case first letter) before binding to form fields.
- Empty request body: `errors: { "": ["A non-empty request body is required."], "request": ["The request field is required."] }`.
- Malformed JSON: `errors: { "$": ["'b' is an invalid start of a property name..."], "request": [...] }`.
- Message samples: `The Email field is not a valid e-mail address.`, `The Password field is required.`, `The field Password must be a string or array type with a minimum length of '6'.` (these are English framework messages).
- Whitespace-only strings fail `[Required]` (observed for chat `content: "  "` -> `errors.Content`).

---

## 2. Endpoint table

Legend — **Auth:** `Public` = no token needed; `Bearer` = `[Authorize]` (401 without valid token); `Optional` = no `[Authorize]` but token is honoured if valid.
**Envelope:** `raw` / `{message,data}` / `{message}` per 1.1.

### 2.1 UserService (`http://localhost:5164`)

| # | Method | Path | Auth | Request | Success (200) | Envelope | Error responses |
| :-- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| U1 | POST | `/api/auth/register` | Public | JSON `RegisterRequest` | `AuthResponse` (token issued immediately; `isEmailVerified=false`) | `{message,data}` | `400 {message}` email already used; `400` ProblemDetails; unhandled DB errors -> `500` |
| U2 | POST | `/api/auth/login` | Public | JSON `LoginRequest` | `AuthResponse` | `{message,data}` | `401 {message}` wrong email or password; `400` ProblemDetails; **`401 {message}` revoked-token body if a revoked Bearer header is sent (see 6.5)** |
| U3 | POST | `/api/auth/google-login` | Public | JSON `GoogleLoginRequest` | `AuthResponse` | `{message,data}` | `400 {message}` on any exception; `400` ProblemDetails |
| U4 | POST | `/api/auth/verify-email` | Public | JSON `{email, token}` | `{message}` | `{message}` | `400 {message}`: user not found, or token invalid/expired. Already-verified account returns `200` without checking the token. |
| U5 | POST | `/api/auth/resend-verification` | Public | JSON `{email}` | `{message}` | `{message}` | `400 {message}` user not found. Returns `200` (no-op) if already verified. |
| U6 | POST | `/api/auth/change-password` | Bearer | JSON `{currentPassword, newPassword}` | `{message}` | `{message}` | `401 {message}` wrong current password (**same status as an expired session**); `400 {message}` other errors; `400` ProblemDetails |
| U7 | POST | `/api/auth/forgot-password` | Public | JSON `{email}` | `{message, token}` — **reset token returned in body** | `{message,token}` | `400 {message}` account not found |
| U8 | POST | `/api/auth/reset-password` | Public | JSON `{email, token, newPassword}` | `{message}` | `{message}` | `400 {message}` account not found / token invalid or expired; `400` ProblemDetails |
| U9 | POST | `/api/auth/logout` | Bearer | none (reads token from `Authorization` header) | `{message}` | `{message}` | `401` |
| U10 | GET | `/api/profile/me` | Bearer | — | `MyProfileResponse` | raw | `401`; **any** failure (including not-found) -> `400 {message}` |
| U11 | PUT | `/api/profile/me` | Bearer | JSON `UpdateProfileRequest` (full overwrite) | `MyProfileResponse` | `{message,data}` | `401`; `400` ProblemDetails; other -> `400 {message}` |
| U12 | GET | `/api/profile/{id:guid}` | Optional | — | `PublicProfileResponse` | raw | `404 {message}` user missing, or caller is blocked by target; `404` empty body if `id` is not a GUID |
| U13 | GET | `/api/profile/privacy` | Bearer | — | `PrivacySettingDto` | raw | `401`; `400 {message}` |
| U14 | PUT | `/api/profile/privacy` | Bearer | JSON `UpdatePrivacySettingRequest` | `PrivacySettingDto` | `{message,data}` | `401`; `400 {message}` |
| U15 | GET | `/api/users/search` | **Optional (anonymous allowed)** | Query: `keyword, campus, major, role, page, pageSize` | `PagedResult<UserSummaryResponse>` | raw | `400 {message}` on exception |
| U16 | POST | `/api/users/{id:guid}/block` | Bearer | none | `{message}` (idempotent) | `{message}` | `401`; `400 {message}`: block self / target not found |
| U17 | DELETE | `/api/users/{id:guid}/block` | Bearer | none | `{message}` | `{message}` | `401`; `404 {message}` not currently blocked |
| U18 | GET | `/api/users/blocked` | Bearer | — | `BlockedUserDto[]` | raw (array) | `401` |

### 2.2 ChatService (`http://localhost:5199`) — whole controller is `[Authorize]`

| # | Method | Path | Auth | Request | Success (200) | Envelope | Error responses |
| :-- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C1 | GET | `/api/chat/rooms` | Bearer | — | `ChatRoomResponse[]` | raw (array) | `401` |
| C2 | POST | `/api/chat/rooms/direct` | Bearer | JSON `{targetUserId, targetUserName}` | `{roomId, name}` (existing or newly created room) | anonymous object | `400 {message}` target = self; `400` ProblemDetails; `401` |
| C3 | POST | `/api/chat/rooms/group` | Bearer | JSON `{name, major?}` | `{roomId, name}` | anonymous object | `400` ProblemDetails; `401`; name > 100 chars is expected to fail at DB -> `500` [expected] |
| C4 | GET | `/api/chat/rooms/{roomId:guid}/messages` | Bearer | Query `page=1`, `pageSize=50` | `{items: ChatMessageResponse[], totalCount, page, pageSize}` | anonymous object | `401`; **`500` for `page<=0`** [live]; unknown room returns `200` with empty `items` [live] |
| C5 | POST | `/api/chat/rooms/{roomId:guid}/messages` | Bearer | JSON `{content}` | `ChatMessageResponse` (also broadcast as `ReceiveMessage` to the room's SignalR group) | raw | `400` ProblemDetails (empty/whitespace); `404 {message}` room not found; `401` |
| H | WS | `/hubs/chat` | Bearer (header or `access_token` query) | SignalR | see section 5 | — | `401` on negotiate without token [live] |

---

## 3. DTO shapes (JSON, camelCase)

### 3.1 UserService

```jsonc
// RegisterRequest  (AuthDTOs.cs:5-13)
{ "email": "string, required, email format",
  "password": "string, required, min length 6",
  "fullName": "string, required (NO max length check here; DB column max 100)",
  "role": "string?, default 'Student'. NOT validated (see finding S2)",
  "campus": "string?", "major": "string?", "batch": "string?" }

// LoginRequest
{ "email": "required, email format", "password": "required" }

// GoogleLoginRequest  (AuthDTOs.cs:20-26) - ALL of idToken, email, fullName required
{ "idToken": "string", "email": "string", "fullName": "string",
  "avatarUrl": "string?", "role": "string? default 'Student'" }

// AuthResponse (inside data) (AuthDTOs.cs:28-36)
{ "userId": "guid", "email": "string", "fullName": "string", "role": "Student|Alumni|Admin",
  "token": "jwt", "expiresAt": "ISO UTC (now + 7 days)", "isEmailVerified": true }

// VerifyEmailRequest: { "email": required+email, "token": required }
// ResendVerificationRequest / ForgotPasswordRequest: { "email": required+email }
// ChangePasswordRequest: { "currentPassword": required, "newPassword": required, min 6 }
// ResetPasswordRequest: { "email": required+email, "token": required, "newPassword": required, min 6 }

// UpdateProfileRequest (ProfileDTOs.cs:5-13) - FULL OVERWRITE: omitted/null optional fields CLEAR the stored value
{ "fullName": "required, max 100", "avatarUrl": "string?", "campus": "string?", "major": "string?",
  "batch": "string?", "bio": "string?", "googleCalendarUrl": "string?" }

// MyProfileResponse (GET me; also `data` of PUT me)
{ "id": "guid", "email": "string", "fullName": "string", "avatarUrl": "string|null", "campus": "string|null",
  "major": "string|null", "batch": "string|null", "bio": "string|null", "googleCalendarUrl": "string|null",
  "role": "Student|Alumni|Admin", "isEmailVerified": true, "createdAt": "ISO UTC",
  "privacySetting": { "showEmail": false, "showCampus": true, "showMajor": true,
                      "showBatch": true, "showBio": true, "showGoogleCalendar": true } }

// PublicProfileResponse (GET profile/{id}) - fields below are null when the owner's privacy flag is off
{ "id": "guid", "fullName": "string", "avatarUrl": "string|null",
  "campus": "string|null (ShowCampus)", "major": "string|null (ShowMajor)", "batch": "string|null (ShowBatch)",
  "bio": "string|null (ShowBio)", "googleCalendarUrl": "string|null (ShowGoogleCalendar)",
  "role": "string", "email": "string|null (ShowEmail)" }

// PrivacySettingDto / UpdatePrivacySettingRequest - six booleans; a missing boolean in a PUT body is read as false [expected]
{ "showEmail": bool, "showCampus": bool, "showMajor": bool, "showBatch": bool, "showBio": bool, "showGoogleCalendar": bool }

// Search query (UserSearchRequest): keyword?, campus?, major?, role?, page=1, pageSize=10
// PagedResult<UserSummaryResponse>  (SearchAndBlockDTOs.cs:12-28)
{ "items": [ { "id": "guid", "fullName": "string", "avatarUrl": "string|null", "campus": "string|null",
               "major": "string|null", "batch": "string|null", "role": "string" } ],
  "totalCount": 2, "page": 1, "pageSize": 10, "totalPages": 1 }

// BlockedUserDto[] (GET users/blocked)
[ { "blockedUserId": "guid", "fullName": "string", "avatarUrl": "string|null", "blockedAt": "ISO UTC" } ]
```

### 3.2 ChatService

```jsonc
// ChatRoomResponse (GET rooms)  (ChatDTOs.cs:19-26)
{ "id": "guid", "name": "string", "roomType": "Group|Direct", "major": "string|null",
  "createdAt": "ISO UTC", "lastMessage": "ChatMessageResponse | null" }
// NOTE: no member list, no unread count, no other-participant id/avatar.

// ChatMessageResponse (REST and SignalR ReceiveMessage)  (ChatDTOs.cs:28-36)
{ "id": "guid", "roomId": "guid", "senderId": "guid", "senderName": "string",
  "senderAvatarUrl": "string|null (always null today)", "content": "string", "sentAt": "ISO UTC" }

// POST rooms/direct  request: { "targetUserId": "guid", "targetUserName": "string" }  -> { "roomId": "guid", "name": "string" }
// POST rooms/group   request: { "name": "string", "major": "string?" }                -> { "roomId": "guid", "name": "string" }
// GET  rooms/{id}/messages -> { "items": ChatMessageResponse[], "totalCount": n, "page": n, "pageSize": n }   // no totalPages
// POST rooms/{id}/messages request: { "content": "string" }                             -> ChatMessageResponse
```

---

## 4. Behaviour details (verified)

### 4.1 Login / registration / verification

| Question | Answer | Evidence |
| :--- | :--- | :--- |
| Is `IsEmailVerified` required to log in? | **No.** `LoginAsync` checks only email+password (BCrypt). `isEmailVerified` is just returned in `AuthResponse`. The FE must gate unverified users itself. | `AuthService.cs:70-82` [code] |
| Login error | Any wrong email or wrong password (or Google-only account without a password hash) -> `401 {message}` "email or password is incorrect". Same message for unknown email and wrong password (no enumeration on login). | `AuthService.cs:75-78` [code][live] |
| Email normalisation | Email is trimmed and lower-cased on register/login/verify/reset. | [code] |
| Register | Creates user, returns JWT **immediately** (`isEmailVerified=false`). Duplicate email -> `400 {message}`. Verification token (64 hex chars, 24 h expiry) is **only written to the server log**, never emailed or returned. | `AuthService.cs:35-68` [code] |
| Verify / resend | Unknown email -> `400`. Already verified -> `200`. Token mismatch or expired -> `400`. Resend rotates the token (24 h) and logs it; **no email is sent**. | `AuthService.cs:116-158` [code] |
| Google login | **Does not validate the ID token.** It uses the client-supplied `email` and `fullName`. See finding S1. If the email exists, a JWT for that user is returned and (if no `GoogleId` yet) the account is marked email-verified. If it does not exist, a user with `role = request.Role ?? "Student"` is auto-created, `isEmailVerified=true`, no password. | `AuthService.cs:84-114` [code] |
| Role at registration | `Role` is stored **as supplied** if non-blank (any string, including `"Admin"`). Only absence defaults to `"Student"`. The comment `"Student" or "Alumni"` in the DTO is not enforced. | `AuthService.cs:50, 98`; `AuthDTOs.cs:9, 25` [code] |
| Forgot password | Generates a 64-hex-char token (2 h expiry) and **returns it in the HTTP response body** as `token` (also logs it). Unknown email -> `400` (account enumeration). | `AuthController.cs:131-143`; `AuthService.cs:178-193` [code][live] |
| Reset password | Requires email + token; token cleared on success. Existing JWTs are **not** revoked. | `AuthService.cs:195-215` [code] |
| Change password | If the user has a password hash, `currentPassword` must match, else `401`. If the account has **no** password hash (Google-created), `currentPassword` is not checked (but must be non-empty by validation). Existing JWTs are not revoked. | `AuthService.cs:160-176` [code] |
| Password rules | Only `minLength 6`. | `AuthDTOs.cs` [code][live] |
| Token lifetime | 7 days, `ClockSkew = 0`, **no refresh-token endpoint**. After expiry FE must re-login. | `TokenService.cs:45`; `Program.cs:43` [code] |

### 4.2 Logout and revocation

- `POST /api/auth/logout` stores the **raw JWT string** in table `InvalidatedTokens` (`TokenService.cs:61-83`). Rows are never purged.
- `TokenRevocationMiddleware` runs **before** `UseAuthentication` and applies to **every path and method in UserService**, including anonymous endpoints. If the request has `Authorization: Bearer <token>` and that token string is in the revocation table, it short-circuits with `401`, `Content-Type: application/json`, body `{"message": "<session expired or you have logged out>"}` (note the space after the colon; hand-written JSON). [code][live]
- Live proof: after logout, `GET /api/profile/me` -> 401 with that body; **`POST /api/auth/login` with the stale Bearer header -> the same 401** (so the FE must clear `Authorization` before calling login/register/forgot-password).
- **ChatService has no revocation check.** After logout the same token still returned `200` on `GET /api/chat/rooms`. [live]
- Revocation is exact-string; a freshly logged-in user gets a different token (new `iat`), unless two logins happen within the same second for the same user (identical token string) [expected].

### 4.3 Profile and privacy

| Rule | Behaviour | Evidence |
| :--- | :--- | :--- |
| Own profile | Returns everything incl. `email`, `isEmailVerified`, `createdAt`, `privacySetting`. | `ProfileService.cs:26-59` |
| Public profile privacy | `campus`, `major`, `batch`, `bio`, `googleCalendarUrl`, `email` are returned only if the owner's matching `show*` flag is true; otherwise `null`. `id`, `fullName`, `avatarUrl`, `role` are always returned. | `ProfileService.cs:128-141` |
| Privacy defaults | `showEmail=false`; all others `true`. Users created by register/Google get defaults. | `UserPrivacySetting.cs:18-23` |
| Anonymous profile view | Allowed (no `[Authorize]`). Anonymous callers get no block filtering. | `ProfileController.cs:61-84` |
| Block on profile | **Unidirectional:** only if the **target has blocked the caller** -> `404 {message}` ("profile does not exist or you have no permission"). If the caller blocked the target, the caller can still open the target's profile. | `ProfileService.cs:110-119` |
| `PUT profile/me` | Overwrites all seven editable fields (including setting them to `null` when omitted). No length/URL validation except `fullName` required, max 100. `email`, `role` cannot be edited via this endpoint. | `ProfileService.cs:70-77` |
| `GET profile/privacy` | Creates a default row if none exists (write on GET). | `ProfileService.cs:144-162` |

### 4.4 Search (`GET /api/users/search`)

| Aspect | Behaviour | Evidence |
| :--- | :--- | :--- |
| Anonymous | **Allowed.** No `[Authorize]`. A valid token is honoured (to apply block filtering); an invalid token is treated as anonymous [expected]; a **revoked** token yields `401` via the middleware. | `UsersController.cs:23-42` [code][live] |
| Includes caller | **Yes**, the caller appears in results (observed with a token). | [live] |
| Includes Admin users | **Yes**, no exclusion. `role=Admin` filter is accepted (no Admin exists in seed data, returned empty). | `MemberService.cs:25-65` [code][live] |
| `keyword` | Case-insensitive substring over `fullName` **or `email`** (email is matched even when the owner's `showEmail=false`). Diacritics-sensitive. | `MemberService.cs:41-45`; `keyword=alumni.nam` found a user [live] |
| `campus`, `major` | Case-insensitive substring (`Contains`), null values excluded. Diacritics-sensitive (`Hoa Lac` does not match `Hòa Lạc`). | `MemberService.cs:48-59` |
| `role` | **Exact, case-sensitive** equality with the stored string (`Student`, `Alumni`, `Admin`). | `MemberService.cs:62-65` |
| Block filter | If the caller is authenticated, users blocked by the caller **and** users who blocked the caller are removed (**bidirectional**). | `MemberService.cs:30-38` |
| Paging | `page <= 0` -> 1. `pageSize` outside `1..50` -> **reset to 10** (not clamped; `pageSize=999` returned `pageSize:10`). Sorted by `fullName` ascending. | `MemberService.cs:67-84` [live] |
| Response | `{items, totalCount, page, pageSize, totalPages}`, camelCase. `items[]` = `{id, fullName, avatarUrl, campus, major, batch, role}`. **No email, no status, no createdAt, no isEmailVerified.** | [live] |
| Privacy | `campus`, `major`, `batch` in search items are returned **regardless** of the owner's `showCampus/showMajor/showBatch` flags. | `MemberService.cs:75-83` [code] |

### 4.5 Block semantics

| Action | Effect |
| :--- | :--- |
| `POST users/{id}/block` | Creates a (blocker, blocked) row; idempotent (`200` if already blocked); self-block and unknown user -> `400`. |
| Search | Hidden in both directions (4.4). |
| Profile | Hidden only from the blocked party (4.3). |
| Chat | **No effect.** ChatService does not know about blocks (no inter-service call). A blocked user can still be sent/receive direct messages and rooms are unaffected. |
| `DELETE users/{id}/block` | `404` if no such block row; `200` otherwise. |
| `GET users/blocked` | Only users the caller blocked (not who blocked the caller). |

### 4.6 Chat behaviour

| Question | Answer | Evidence |
| :--- | :--- | :--- |
| Seeded rooms | If `Rooms` table is empty at startup, 4 **Group** rooms are created: "Campus-wide common space" (`major: "Chung"`), "IT group" (`major: "Kỹ thuật phần mềm"`), "Business/Economics group" (`major: "Quản trị kinh doanh"`), "Graphic design group" (`major: "Thiết kế đồ họa"`). Room names are stored in Vietnamese. IDs are random per DB. | `Program.cs:111-139` [code][live] |
| Who sees which rooms | `GET rooms` returns **all Group rooms to every authenticated user** plus Direct rooms where the caller is a member. Ordered by `createdAt` desc (not by last activity). `lastMessage` = newest message or `null`. | `ChatController.cs:30-59` [live] |
| Membership on join | **Group rooms:** only the creator is stored as a `ChatMember` (via `POST rooms/group`). Neither the REST API nor `JoinRoom` adds members. `JoinRoom` only adds the SignalR connection to an in-memory group named by the room id string. | `ChatController.cs:117`; `ChatHub.cs:42-54` [code] |
| Who can read a room's messages | **Any authenticated user**, any room id. No membership check. A non-existent room id returns `200` with empty `items`. | `ChatController.cs:128-152` [code][live] |
| Who can post | **Any authenticated user** to any existing room via REST (only existence is checked). Via hub `SendMessage` no existence check: unknown room -> hub invocation fails with generic error `An unexpected error occurred invoking 'SendMessage' on the server.` [live]; blank content or non-GUID room id -> silently ignored (returns without error). | `ChatController.cs:157-196`; `ChatHub.cs:75-110` |
| Direct rooms | `POST rooms/direct` finds a Direct room that has both users as members, else creates one with `name = "<caller name from JWT> & <targetUserName from request body>"` and 2 members. It does **not** verify that `targetUserId` exists, is a different role (Student↔Alumni is not enforced), or has not blocked the caller. The stored `name` is the same string for both participants. | `ChatController.cs:65-99` [code] |
| Message ordering | Page 1 = the newest `pageSize` messages, returned in **ascending** `sentAt` order. Increasing `page` goes to older messages. | `ChatController.cs:131-149` |
| `sentAt` | Server `UtcNow`, ISO with `Z`. | |
| Sender fields | `senderName` is a snapshot of the JWT `unique_name` claim at send time. `senderAvatarUrl` is **never set** (always `null`). | `ChatController.cs:174, 187`; `ChatHub.cs:90, 103` |
| Limits | No max `pageSize`; `page<=0` -> `500` (Postgres "OFFSET must not be negative", observed). | [live] |

---

## 5. SignalR hub contract (`/hubs/chat`)

| Aspect | Fact | Evidence |
| :--- | :--- | :--- |
| Auth | Hub class is `[Authorize]`. JwtBearer is configured to read the token from query `access_token` **only when the path starts with `/hubs/chat`**. `negotiate` without token -> `401`; with `?access_token=<jwt>` -> `200` and transports `WebSockets`, `ServerSentEvents`, `LongPolling`. | `Chat Program.cs:41-54` [code][live] |
| Client | Not yet installed in FE (`package.json` has no `@microsoft/signalr`). Verified working with `@microsoft/signalr@10.0.11` using `withUrl(hubUrl, { accessTokenFactory: () => token })` over WebSockets. | [live] |
| Method names | `JoinRoom(roomId: string)`, `LeaveRoom(roomId: string)`, `SendMessage(roomId: string, content: string)`, `SendTyping(roomId: string, isTyping: boolean)`. Invocation is case-insensitive (`joinroom` worked). | `ChatHub.cs` [live] |
| On connect | Connection is added to group `user_<userId>`; **nothing is ever sent to that group** (unused). | `ChatHub.cs:23-37` |
| Group key | Room id string exactly as passed (GUID string). FE must call `JoinRoom` for each room it displays, **after** connecting, and re-join after reconnect (SignalR groups are lost on reconnect). | [expected] |

Server -> client events (all camelCase) [live]:

| Event | Payload | Sent to |
| :--- | :--- | :--- |
| `UserJoined` | `{ "roomId": "guid string", "userName": "string", "timestamp": "ISO UTC" }` | **Everyone in the group, including the joiner** (and a user's other connections). |
| `UserLeft` | `{ "roomId", "userName", "timestamp" }` | Everyone remaining in the group (the leaver has already been removed). |
| `UserTyping` | `{ "roomId", "userName", "isTyping": bool }` | `OthersInGroup` (not the sender's own connection). |
| `ReceiveMessage` | `ChatMessageResponse` = `{ id, roomId, senderId, senderName, senderAvatarUrl, content, sentAt }` | Everyone in the room's group. Emitted for hub `SendMessage` and for REST `POST .../messages`. A REST sender only receives it if its connection has joined that room. |

Notes: events identify users by `userName` only (no `userId`) for join/leave/typing; there is no presence list and no "member count" API. Duplicate `ReceiveMessage` handling: if the FE both POSTs via REST **and** has joined the group, it receives its own message via the event as well as the REST response; de-duplicate by `id`.

---

## 6. JWT claims and role mapping

### 6.1 JWT claim table (decoded from a real token) [live]

Header: `{"alg":"HS256","typ":"JWT"}`

| JWT payload key | Source in code (`TokenService.cs:35-41`) | Example | Notes |
| :--- | :--- | :--- | :--- |
| `nameid` | `ClaimTypes.NameIdentifier` = `user.Id` | `5a9a53f3-0763-4f81-829a-91d90dc26d15` | **There is no `sub` claim.** User id = `nameid`. |
| `email` | `ClaimTypes.Email` | `student.trung@fpt.edu.vn` | |
| `unique_name` | `ClaimTypes.Name` = `FullName` | `Chí Trung` | UTF-8. Not the email. |
| `role` | `ClaimTypes.Role` = `user.Role` | `Student` | Single string. Exactly `Student`, `Alumni` or `Admin` for seeded/normal users; any string if self-registered (S2). |
| `nbf`, `iat` | auto | `1791944560` | seconds |
| `exp` | `Expires = UtcNow + 7 days` | `1792549360` | equals `expiresAt` in `AuthResponse` |
| `iss` | `Jwt:Issuer` | `AlumniConnect.UserService` | **Not validated** by either service (`ValidateIssuer=false`). |
| `aud` | `Jwt:Audience` | `AlumniConnect.Clients` | Not validated. |

Not present: `userType`, `campus`, `isVerified`, `permissions`, `sub`, `refresh`. The FE type `JwtTokenPayload` in `src/types/auth.types.ts` (`sub, role: Role, userType, campus, isVerified, permissions`) does **not** match. Recommendation: do not decode the JWT in the FE for identity; take identity from `AuthResponse` (`userId, email, fullName, role, isEmailVerified`) and from `GET /api/profile/me`. If decoding is needed, read `nameid`, `unique_name`, `email`, `role`, `exp`.
Algorithm HS256, symmetric key shared by both services via config `Jwt:Key` (`appsettings.json`).

### 6.2 Role mapping BE -> FE

BE has **one** role string per user and no separate "user type". FE has two axes (`ROLES` = `ADMIN|USER|MODERATOR`, `USER_TYPES` = `STUDENT|ALUMNI|FACULTY`). Proposed adapter (FE side only):

| BE `role` | FE `ROLES` | FE `USER_TYPES` | Comment |
| :--- | :--- | :--- | :--- |
| `Student` | `USER` | `STUDENT` | Direct mapping. |
| `Alumni` | `USER` | `ALUMNI` | Direct mapping. FE `isVerified` (alumni degree verification) has **no BE field**; `isEmailVerified` is a different concept. |
| `Admin` | `ADMIN` | *(none in BE)* | FE `UserSummary.userType` is required, so FE needs a fallback decision (for example a neutral default) — the BE cannot supply one. |
| *(no BE value)* | `MODERATOR` | — | BE has no moderator role. |
| *(no BE value)* | `USER` | `FACULTY` | BE has no faculty role/registration path. |
| any other string | `USER` (least privilege) | none | Possible because role is free text at registration (S2). Do not map unknown values to `ADMIN`. |

Reverse mapping for registration (`FE userType` -> `role` sent to BE): `STUDENT` -> `"Student"`, `ALUMNI` -> `"Alumni"`. `FACULTY` is not supported; never send `"Admin"`.

Other FE <-> BE field mapping (from FE `RegisterPayload` / `UserSummary`):

| FE field | BE field | Note |
| :--- | :--- | :--- |
| `name` | `fullName` | |
| `email`, `password` | `email`, `password` | |
| `campus` (`CampusCode` `HOA_LAC \| DA_NANG \| HCM \| CAN_THO \| QUY_NHON`) | `campus` (**free text**) | BE does not enforce a list. Only evidence of expected values is a code comment (`User.cs:22`: Hòa Lạc, Hồ Chí Minh, Đà Nẵng, Quy Nhơn, Cần Thơ) and the seed (`Hòa Lạc`, `Hồ Chí Minh`). FE needs an explicit code<->label map; search is diacritics-sensitive. |
| `department` | `major` | Closest equivalent; BE has no separate department. |
| `cohort` | `batch` | Seed values look like `K14`, `K17`. |
| `studentId` | — | **No BE field.** |
| `avatarUrl` | `avatarUrl` | URL string only; no upload endpoint exists. |
| `bio` | `bio` | |
| `phone`, `linkedinUrl`, `githubUrl`, `currentCompany`, `currentPosition`, `industry`, `skills`, `graduationYear` | — | No BE fields. Only `googleCalendarUrl` extra exists. |
| `UserStatus` (`ACTIVE`, `BANNED`, ...) | — | No status/ban field on the BE `User` model. |
| `PaginationMeta { page, limit, total, totalPages }` | `{ page, pageSize, totalCount, totalPages }` | Rename needed in the adapter. Chat messages page has **no** `totalPages`. |

---

## 7. FE-needed gaps (FE screens with no backend API)

The BE exposes only identity/profile/member-search/block and chat. FE screens (from `src/constants/routes.ts`) with **no** BE endpoint:

| FE route | Needs | BE status |
| :--- | :--- | :--- |
| `APP.HOME` (feed), `APP.POSTS_CREATE`, `APP.POST_DETAIL`, `APP.SAVED` | Posts, comments, likes, saved items | **None** (Forum Service not in repo; assigned to Mai Tuan Vinh per `README.md`). |
| `APP.COMMUNITIES`, `APP.COMMUNITY_DETAIL`, `ADMIN.COMMUNITIES` | Communities CRUD/membership | **None.** (Chat Group rooms are chat rooms, not communities; `major` is only a label.) |
| `APP.JOBS`, `JOB_DETAIL`, `INTERNSHIPS`, `SCHOLARSHIPS`, `SCHOLARSHIP_DETAIL`, `ADMIN.OPPORTUNITIES` | Opportunities | **None.** |
| `APP.NOTIFICATIONS` | Notifications | **None** (no endpoint, no hub event for notifications). |
| `APP.AI` | AI assistant | **None** (AI Service not in repo). |
| `ADMIN.DASHBOARD`, `ADMIN.ANALYTICS` | Aggregates/metrics | **None.** (Only possible approximation: `users/search` `totalCount`, which is member count only.) |
| `ADMIN.REPORTS` | Reports/flags/moderation queue | **None.** |
| `ADMIN.POSTS` | Post moderation | **None.** |
| `ADMIN.ALUMNI_VERIFICATION` | Pending alumni verification, approve/reject, document upload | **None.** No `isVerified` flag, no document upload, no status. (`isEmailVerified` is email-token verification only.) |
| `ADMIN.SETTINGS` | System settings | **None.** |
| `ADMIN.USERS` | List users with status, email, last login; ban/unban/suspend; change role | **Only partial read:** `GET /api/users/search` (anonymous, public summary fields only; page size max 50, values >50 reset to 10). **No** admin user list with email/status/createdAt, **no** ban/unban/suspend, **no** role change, **no** delete, **no** `[Authorize(Roles = ...)]` anywhere. |
| `APP.ALUMNI` (directory with company/position/industry filters) | Alumni directory | **Partial:** `users/search?role=Alumni` with keyword/campus/major only. No company/position/industry/skills. |
| `APP.SEARCH` (global search) | Search across posts/jobs/communities/people | **People only** via `users/search`. |
| Moderator / Faculty features (FE `PERMISSIONS`) | Roles `MODERATOR`, `FACULTY` | **None in BE.** |
| Token refresh, "remember me" | Refresh tokens | **None** (7-day JWT only; `rememberMe` has no BE meaning). |
| Avatar upload | File upload | **None** (profile accepts a URL string only). |
| Chat: participant list / other user's avatar in Direct rooms, unread counts, delete/leave room, add members | | **None** (`ChatRoomResponse` has no members; see 4.6). FE can only derive the other party from `name` ("A & B") or from the id it passed when creating the room. |

---

## 8. Security and quality findings

Factual, ordered by impact on the FE/product. `File:line` are relative to `src/Services/<Service>/`. "Not executed" means confirmed from code only, to avoid altering seeded accounts.

| ID | Finding | Evidence | Impact |
| :-- | :--- | :--- | :--- |
| **S1** | **Google login trusts the client.** `GoogleLoginAsync` never validates `IdToken` (it only stores its first 50 chars as `GoogleId`). Identity comes entirely from client-supplied `Email`/`FullName`. For an **existing** email the method issues a JWT for that account without any credential check. | `AuthService.cs:84-114` (`:97`, `:107` use of `IdToken`); `AuthController.cs:57-69`; `AuthDTOs.cs:20-26`. Not executed. | Anyone who knows an account email (including the seeded accounts and any Admin account) can obtain a valid JWT for it with `POST /api/auth/google-login`. |
| **S2** | **Self-assigned role.** `Role` from the request body is stored verbatim at registration and at Google auto-registration; only `null/blank` defaults to `Student`. Role goes into the JWT `role` claim. | `AuthService.cs:50`, `:98`; `AuthDTOs.cs:9`, `:25`; `TokenService.cs:40`. Not executed. | A caller can register as `Admin` (or any string). BE currently has no role-protected endpoint, but the FE `RoleGuard`/permissions trust `role` and would grant the admin portal. |
| **S3** | **Reset token returned in API response.** `forgot-password` returns `{message, token}` and `reset-password` needs only email + that token. Unknown emails return `400`, which also enumerates accounts. | `AuthController.cs:131-143`; `AuthService.cs:178-193`; [live] `400` for unknown email. | Password reset for any known email can be completed with no mailbox access (account takeover). |
| **S4** | **No email delivery.** Verification and reset tokens are only written to the server log (and, for reset, to the response). The FE cannot complete email verification without access to BE logs. | `AuthService.cs:63-64`, `:156`, `:191` | Dev/demo flow needs BE log access; production would need an email sender. |
| **S5** | **Chat authorization missing.** No membership check for reading messages, posting via REST, or `JoinRoom`/`SendMessage` over the hub. Direct rooms are readable/writable by any authenticated user who knows the room GUID. Group membership is never recorded beyond the creator. | `ChatController.cs:128-152`, `:157-196`; `ChatHub.cs:42-54`, `:75-110`; [live] reading an arbitrary room id returned 200. | Private 1-1 conversations are only protected by GUID secrecy. |
| **S6** | **Direct room creation trusts the client.** `targetUserName` (used in the stored room name and member name) and `targetUserId` are not validated against UserService; Student↔Alumni rule, blocks are not enforced. | `ChatController.cs:65-99` (`:88`, `:93`) | Spoofable names; rooms with non-existent users; blocks ignored in chat. |
| **S7** | **Logout does not revoke on ChatService.** Revocation lives in UserService only. | `Chat Program.cs:23-57` (no revocation); [live] 200 after logout. Also hub token comes from query string and is never checked against the revocation table. | A logged-out token keeps working on chat REST and the hub until it expires (7 days). |
| **S8** | **Revocation middleware applies to anonymous routes.** A stale Bearer header makes even login/register/forgot-password return `401`. | `Middleware/TokenRevocationMiddleware.cs:14-27`; `Program.cs:150` (before `UseAuthentication`); [live] | FE must clear the header/token before auth calls. Also: DB lookup per request, table never purged (`TokenService.cs:61-88`). |
| **S9** | **Search leaks beyond privacy flags.** Items include `campus/major/batch` regardless of the owner's flags; `keyword` also matches `email` regardless of `showEmail`, so an email can be confirmed/enumerated by prefix search (anonymous allowed). | `MemberService.cs:44`, `:75-83`; `UsersController.cs:23` (no `[Authorize]`); [live] `keyword=alumni.nam` matched. | Privacy settings (US-09) are only applied to `GET profile/{id}`. |
| **S10** | **Search includes the caller and Admin accounts**, and anonymous callers can page through all members. | `MemberService.cs:25-65`; [live] | FE should filter out `id === currentUser.id` where needed. |
| **S11** | **Block is asymmetric across features:** bidirectional in search, one-way on profile view, none in chat. | `MemberService.cs:30-38`; `ProfileService.cs:110-119`; ChatService has no block logic | Inconsistent UX; the blocker can still open the blocked user's profile. |
| **S12** | **Hard-coded secrets/credentials** committed in config and code: JWT signing key, Postgres `postgres/postgres`, seed users with password `123456`. JWT issuer/audience not validated. | `appsettings.json:10,13` (both services); `Program.cs:105`, `:119` (User); `TokenService.cs:31`; `Program.cs:41-42` | Fine for a class demo; not for deployment. Seed accounts are created only when the Users table is empty. |
| **S13** | **JWT key fallback mismatch.** `TokenService` fallback key (`..._2026`) differs from `Program.cs` fallback (`..._2026_DotNetCore`). Only matters if `Jwt:Key` config is absent (tokens would be signed with one key and validated with another). | `TokenService.cs:31` vs `Program.cs:25` | Latent misconfiguration risk. |
| **S14** | **Swagger enabled unconditionally; Development exception page leaks stack traces/paths.** Observed in `500` responses (`ASPNETCORE_ENVIRONMENT=Development` in launch profiles). | `Program.cs:141-146`; `launchSettings.json`; [live] | Information disclosure if deployed as-is. |
| **S15** | **Sessions not invalidated on password change/reset.** | `AuthService.cs:160-176`, `:195-215` | Old JWTs stay valid. |
| **Q1** | **Inconsistent status codes.** "Not found" is returned as `400` in most endpoints (`profile/me`, `block`, auth verify/resend/forgot/reset, privacy). Wrong password in `login` and `change-password` returns `401`, the same status as an invalid/expired session. | `ProfileController.cs:33-36`, `:52-55`, `:99-102`; `UsersController.cs:57-60`; `AuthController.cs:82-85`, `:99-102`, `:118-125` | A global FE "401 -> logout" interceptor would log the user out on a wrong current password. Handle `401` per endpoint. |
| **Q2** | **Chat paging unguarded.** `page<=0` -> `500`; no `pageSize` upper bound (or lower bound). Search silently resets invalid `pageSize` to 10 instead of clamping. | `ChatController.cs:129-137`; `MemberService.cs:68-69` | FE must send `page>=1` and `pageSize` 1..50. |
| **Q3** | **Unhandled input lengths.** `RegisterRequest.fullName` has no `MaxLength` while the entity column is 100; chat group `name` has no `MaxLength` while the entity column is 100 [expected `500`, not executed]. Duplicate-email race on register hits the unique index and surfaces as `500` (only `InvalidOperationException` is caught). | `AuthDTOs.cs:8` vs `User.cs:17`; `ChatDTOs.cs:11` vs `ChatModels.cs:12`; `AuthController.cs:31-34` | Client-side limits recommended: fullName ≤ 100, group name ≤ 100. |
| **Q4** | **Data-model gaps for chat UI:** `senderAvatarUrl` never populated; `ChatRoomResponse` has no members; Direct room `name` is identical for both participants; `user_<id>` hub group is unused. | `ChatController.cs:187`; `ChatHub.cs:33, 103`; `ChatDTOs.cs:19-26` | FE must derive display names/avatars (e.g. call `GET profile/{id}`), and exclude own name from the Direct room label. |
| **Q5** | **Hub failure modes are silent.** Blank content or non-GUID room id in `SendMessage` returns without error or event; unknown room produces a generic server error. | `ChatHub.cs:77-82`; [live] | Validate on the FE before invoking. |
| **Q6** | **Writes on GET and non-idempotent defaults:** `GET profile/privacy` inserts a row if missing; `PUT profile/privacy` treats missing booleans as `false`. | `ProfileService.cs:146-152`; DTO record non-nullable bools [expected] | Always send all six flags. |

---

## 9. Recommended FE consumption map (by FE route / action)

Use `ROUTES` from `src/constants/routes.ts`. Service column: **U** = UserService (5164), **C** = ChatService (5199).

| FE route / action | BE endpoint(s) | Notes for implementation |
| :--- | :--- | :--- |
| `AUTH.LOGIN` — submit | U2 `POST /api/auth/login` | Read `data.token`, `data.userId`, `data.role`, `data.isEmailVerified`; map role per 6.2. Clear any stored token first (S8). On `401` show "wrong email/password". If `isEmailVerified=false` route to `AUTH.VERIFY_EMAIL`. |
| `AUTH.LOGIN` — Google button | U3 `POST /api/auth/google-login` | **Do not wire in production until BE validates the ID token (S1).** Requires `idToken`, `email`, `fullName` all non-empty. |
| `AUTH.REGISTER` — submit | U1 `POST /api/auth/register` | Send `{email, password(min 6), fullName(≤100), role: 'Student'|'Alumni', campus, major(=department), batch(=cohort)}`. `studentId` and `FACULTY` unsupported. Response already contains a usable token with `isEmailVerified=false`. |
| `AUTH.VERIFY_EMAIL` — confirm | U4 `POST /api/auth/verify-email`; resend: U5 `POST /api/auth/resend-verification` | Token is printed in the UserService console only (S4). |
| `AUTH.FORGOT_PASSWORD` — request / reset | U7 `POST /api/auth/forgot-password`, U8 `POST /api/auth/reset-password` | FE route currently renders only `<Outlet />`. Do not auto-fill the returned `token` outside a dev build (S3). |
| Header / layout "Log out" | U9 `POST /api/auth/logout` | Then clear `access_token`, stop the SignalR connection, `clearAuth()`. Chat tokens remain valid server-side (S7). |
| Session bootstrap after reload | U10 `GET /api/profile/me` | Use to refresh the user (name, role, avatar, privacy). A `401` here means expired/revoked -> clear auth. |
| `APP.PROFILE` — view/edit own profile | U10, U11 `PUT /api/profile/me` | Send the **complete** profile on save (full overwrite, 4.3). Only fields in 3.1 exist. |
| `APP.SETTINGS` — privacy | U13 `GET`, U14 `PUT /api/profile/privacy` | Send all six flags. |
| `APP.SETTINGS` — change password | U6 `POST /api/auth/change-password` | Treat `401` as "current password wrong", not as logout. |
| `APP.SETTINGS` — blocked users | U18 `GET /api/users/blocked`, U17 `DELETE /api/users/{id}/block` | |
| `APP.ALUMNI` — directory list | U15 `GET /api/users/search?role=Alumni&keyword=&campus=&major=&page=&pageSize=` | `pageSize` 1..50. Only name/avatar/campus/major/batch available. Exclude self if shown. |
| `APP.ALUMNI_PROFILE` (`:userId`) | U12 `GET /api/profile/{id}` | Handle `404` as "not found / unavailable". Show only non-null fields. Actions: Block U16, Message -> C2. |
| `APP.SEARCH` — people tab | U15 `GET /api/users/search` | Other result types have no BE. |
| `APP.CHAT` — conversation list | C1 `GET /api/chat/rooms` | Group + Direct. For `Direct`, build the label from `name` minus own `fullName`; there is no participant id in the response. |
| `APP.CHAT` — start 1-1 chat (from profile/search card) | C2 `POST /api/chat/rooms/direct` | Body `{targetUserId, targetUserName}` (use real values from search/profile). Store `roomId`. |
| `APP.CHAT` — create group room | C3 `POST /api/chat/rooms/group` | `name` ≤ 100. Any user can create group rooms, visible to everyone. |
| `APP.CHAT` — open room / history / infinite scroll up | C4 `GET /api/chat/rooms/{id}/messages?page=n&pageSize=50` | `page>=1`. Items arrive oldest->newest within a page; fetch `page+1` for older; stop when `items.length === 0` or `page*pageSize >= totalCount`. |
| `APP.CHAT` — send message | Hub `SendMessage(roomId, content)` preferred; fallback C5 `POST /api/chat/rooms/{id}/messages` | De-duplicate by `message.id` (5). |
| `APP.CHAT` — realtime | Hub `/hubs/chat?access_token=` events `ReceiveMessage`, `UserTyping`, `UserJoined`, `UserLeft` | `JoinRoom` for the open room; `SendTyping` debounced; re-join after reconnect. Add dependency `@microsoft/signalr` (not installed). |
| `APP.HOME`, `COMMUNITIES*`, `POSTS_*`, `POST_DETAIL`, `JOBS*`, `INTERNSHIPS`, `SCHOLARSHIP*`, `NOTIFICATIONS`, `AI`, `SAVED` | — | **No BE.** Keep mock data (see section 7). |
| `ADMIN.USERS` | U15 (read-only list: id, name, avatar, campus, major, batch, role) | No email/status/ban/role-change. Treat ban/unban UI as mock-only. |
| `ADMIN.DASHBOARD`, `ANALYTICS`, `ALUMNI_VERIFICATION`, `COMMUNITIES`, `POSTS`, `OPPORTUNITIES`, `REPORTS`, `SETTINGS` | — | **No BE.** Keep mock data. |

### 9.1 FE integration notes (from reading `src/`)

- `apiClient` (`src/services/api/apiClient.ts`) already attaches `Bearer` from `localStorage.access_token`; it must skip the header (or be cleared first) on login/register/forgot-password calls (S8) and needs separate base URLs for the User and Chat services.
- `errorHandler.normalizeError` should map ProblemDetails `errors` (PascalCase keys) and `{message}` bodies; a `401` with empty body (invalid/expired token) differs from `401 {message}` (login/change-password/revoked).
- `authStore.setToken` / `switchUser` currently fabricate demo tokens (`fpt-demo-session-*`); these must not be used once the BE is wired (the BE would answer `401`).
- Do not decode the JWT using `JwtTokenPayload` as typed today (6.1).

## 10. Open questions for the BE owner (Nguyen Chi Trung)

1. Will Google login validate `IdToken` server-side (e.g. Google tokeninfo / `Google.Apis.Auth`) before issuing a JWT? (S1)
2. Should `role` at registration be restricted to `Student|Alumni`, with `Admin` assigned only server-side? (S2)
3. Should `forgot-password` stop returning `token` and return a generic success? (S3) Is an email sender planned? (S4)
4. Should ChatService enforce room membership/ownership and share the revocation check or switch to short-lived tokens? (S5, S7)
5. Will Admin Service expose user list/ban/verification endpoints, and will it add `MODERATOR`/`FACULTY` roles and an `isVerified` flag to the JWT/profile? (Section 7)
6. Preferred canonical envelope: keep three shapes, or standardise on `{message,data}`/RFC 9457 ProblemDetails for all errors?
7. Should `ChatRoomResponse` include members (id, name, avatar) so Direct rooms can be labelled without parsing `name`?
