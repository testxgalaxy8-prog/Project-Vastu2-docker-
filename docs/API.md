# VASTU RITAM — API Documentation

Complete reference for the **Vastu Ritam** RESTful API served by `server.ts` on port `3000`.

---

## Base URL & Content-Type

- **Local Development**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **Compression**: Responses larger than `1 KB` are automatically Gzip-compressed unless `x-no-compression` header is present.

---

## Authentication & Authorization

Protected endpoints (`/api/admin/*`) require authentication via one of the following mechanisms:

1. **HTTP-Only Session Cookie**: `vr_session=<token>` (automatically set upon `POST /api/auth/login`)
2. **Bearer Token Header**: `Authorization: Bearer <token>` (supports both HMAC-signed session tokens and Firebase ID tokens for pre-authorized admin/editor accounts)

### Role-Based Access Control (RBAC)
- `admin`: Full access to articles, topics, categories, keywords, videos, advertisements, media, users, site settings, and audit logs.
- `editor`: Create/update access to articles, topics, keywords, videos, advertisements, and site contact/logo settings.

---

## 1. Health & SEO Endpoints

### `GET /health`
Health check endpoint for container orchestrators (Docker, Cloud Run, Kubernetes).
- **Auth Required**: No
- **Response (`200 OK`)**: `OK` (plain text)

### `GET /sitemap.xml`
Dynamically generates an XML sitemap containing all published articles, categories, and topics.
- **Auth Required**: No
- **Response (`200 OK`)**: `application/xml`

### `GET /robots.txt`
Returns crawler directives and the canonical sitemap URL.
- **Auth Required**: No
- **Response (`200 OK`)**: `text/plain`

---

## 2. Public Content API

### `GET /api/videos`
Lists published video learning entries from the Gyan Kosh Video Learning library.
- **Auth Required**: No
- **Query Parameters**:
  - `category` *(optional, string)*: Filter by category slug or ID
  - `topic` *(optional, string)*: Filter by topic slug or ID
  - `featured` *(optional, boolean)*: Filter featured videos (`true` / `false`)
  - `q` / `search` *(optional, string)*: Full-text search across title and description
  - `limit` *(optional, number, default `50`, max `100`)*
  - `offset` *(optional, number, default `0`)*
- **Response (`200 OK`)**:
```json
{
  "videos": [
    {
      "id": 1,
      "title": "Introduction to Vastu Purusha Mandala",
      "slug": "introduction-to-vastu-purusha-mandala",
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "videoPlatform": "youtube",
      "videoId": "dQw4w9WgXcQ",
      "embedUrl": "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
      "description": "Foundational explanation of the 81-grid cosmic diagram.",
      "status": "published",
      "isFeatured": true
    }
  ],
  "total": 1
}
```

### `GET /api/videos/:slugOrId`
Fetches a single published video by its slug or numeric ID and increments its view counter.
- **Auth Required**: No
- **Response (`200 OK`)**: `{ "video": { ... }, "relatedVideos": [ ... ] }`
- **Error (`404 Not Found`)**: `{ "error": "Video not found" }`

---

### `GET /api/articles`
Lists published knowledge articles with pagination and filtering.
- **Auth Required**: No (admins passing `status=all` can view drafts)
- **Query Parameters**:
  - `category` *(optional, string)*: Category slug
  - `topic` *(optional, string)*: Topic slug
  - `keyword` *(optional, string)*: Keyword slug
  - `q` *(optional, string)*: Search query
  - `limit` *(optional, number, default `12`, max `50`)*
  - `page` *(optional, number, default `1`)*
- **Response (`200 OK`)**:
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Understanding Before Remedies: Reclaiming Classical Vastu From Modern Superstition",
      "slug": "understanding-before-remedies",
      "excerpt": "Why installing commercial pyramids and yantras...",
      "categoryName": "Classical Vastu Vidya",
      "categorySlug": "classical-vastu-vidya",
      "readingTimeMinutes": 7,
      "viewsCount": 382,
      "publishedAt": "2026-10-09T00:00:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "totalPages": 1
}
```

### `GET /api/knowledge`
Alias redirect (`307 Temporary Redirect`) to `/api/articles` preserving query strings.

### `GET /api/articles/:slug`
Retrieves a single article by slug, increments its view count, and returns associated topics, keywords, and related articles.
- **Auth Required**: No
- **Response (`200 OK`)**:
```json
{
  "article": {
    "id": 1,
    "title": "Understanding Before Remedies: Reclaiming Classical Vastu From Modern Superstition",
    "slug": "understanding-before-remedies",
    "content": "...",
    "topics": [{ "id": 1, "name": "Vastu Purusha Mandala", "slug": "vastu-purusha-mandala" }],
    "keywords": []
  },
  "relatedArticles": []
}
```

### `GET /api/articles/:slug/topics`
Lists all topics linked to a given article slug.

### `POST /api/articles/:slug/topics`
Links a topic (`{ "topicId": 1 }` or `{ "topicSlug": "brahmasthana" }`) to an article.

### `DELETE /api/articles/:slug/topics`
Unlinks a topic (`{ "topicId": 1 }`) from an article.

---

### `GET /api/topics`
Lists all sacred Vastu topics (concepts, directions, deities, classical texts, remedies).
- **Auth Required**: No
- **Query Parameters**:
  - `type` *(optional, string)*: Filter by `entityType` (`concept`, `direction`, `deity`, `text`, `remedy`)
- **Response (`200 OK`)**: `{ "topics": [ ... ] }`

### `GET /api/topics/:slug`
Retrieves a topic by slug along with semantically linked topics (`relatedTopics`) and associated articles (`articles`).
- **Auth Required**: No
- **Response (`200 OK`)**: `{ "topic": { ... }, "relatedTopics": [ ... ], "articles": [ ... ] }`

### `POST /api/topics/link` & `DELETE /api/topics/link`
Creates or removes a semantic relationship between two topics (`sourceTopicId`, `targetTopicId`, `relationType`).

---

### `GET /api/categories`
Lists all knowledge categories ordered by `displayOrder`, including published article counts.
- **Auth Required**: No
- **Response (`200 OK`)**: `{ "categories": [ ... ] }`

### `GET /api/categories/:slug`
Retrieves category metadata and all published articles within that category.
- **Auth Required**: No
- **Response (`200 OK`)**: `{ "category": { ... }, "articles": [ ... ] }`

---

### `GET /api/keywords`
Lists all SEO & research taxonomy keywords.
- **Auth Required**: No
- **Response (`200 OK`)**: `{ "keywords": [ ... ] }`

### `GET /api/search`
Unified search endpoint across articles, topics, and categories.
- **Auth Required**: No
- **Query Parameters**:
  - `q` *(required, string)*: Search query
- **Response (`200 OK`)**:
```json
{
  "query": "mandala",
  "articles": [ ... ],
  "topics": [ ... ],
  "categories": [ ... ]
}
```

---

## 3. Advertisements & Site Configuration API

### `GET /api/adsense-config`
Retrieves public Google AdSense publisher configuration.
- **Response (`200 OK`)**: `{ "publisherId": "ca-pub-...", "enabled": true, "autoAds": false }`

### `GET /api/ads`
Lists active advertisements, optionally filtered by `?placement=<placement>`.

### `GET /api/ads/:placement`
Retrieves active advertisements for a specific placement slot (`header`, `sidebar`, `in-article`, `footer`, `category-top`) and records an impression.

### `POST /api/ads/:id/click`
Records a user click event on advertisement `:id`.

### `GET /api/contact-details`
Retrieves public institutional contact details, consultation hours, social handles, and official logo URL.
- **Response (`200 OK`)**: `{ "settings": { "primaryPhone": "...", "primaryEmail": "...", "logoUrl": "..." } }`

---

## 4. Authentication API

### `POST /api/auth/login`
Authenticates an administrator or editor using email/username and password.
- **Request Body**:
```json
{
  "username": "admin@vasturitam.com",
  "password": "your-password"
}
```
- **Response (`200 OK`)**: Sets `vr_session` HTTP-only cookie and returns:
```json
{
  "user": {
    "id": 1,
    "uid": "local-admin-1",
    "email": "admin@vasturitam.com",
    "displayName": "Vastu Ritam Acharya",
    "role": "admin"
  },
  "token": "<hmac-session-token>"
}
```

### `GET /api/auth/me`
Returns the currently authenticated user session (`{ "user": { ... } }` or `{ "user": null }`).

### `GET /api/auth/login-info`
Returns hint metadata for the admin login portal (default login email and whether custom credentials are configured).

### `POST /api/auth/logout`
Clears the `vr_session` cookie and terminates the active session.

---

## 5. Admin CMS API (`/api/admin/*`)

All endpoints below require `requireAuth` (`401 Unauthorized` if unauthenticated) and role verification (`403 Forbidden` if insufficient privileges).

| Method | Endpoint | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Any Auth | Aggregate CMS metrics (articles, topics, categories, views, ad CTR, audit logs) |
| `PUT` | `/api/admin/change-credentials` | Any Auth | Update administrator email, display name, and bcrypt password hash |
| `GET` | `/api/admin/articles` | Any Auth | List all articles across all statuses (`draft`, `review`, `published`, `archived`) |
| `POST` | `/api/admin/articles` | `admin`, `editor` | Create a new article with topics and keywords |
| `PUT` | `/api/admin/articles/:id` | `admin`, `editor` | Update an existing article and create slug redirects if changed |
| `DELETE` | `/api/admin/articles/:id` | `admin` | Permanently delete an article |
| `GET` | `/api/admin/topics` | Any Auth | List all knowledge graph topics |
| `POST` | `/api/admin/topics` | `admin`, `editor` | Create a new knowledge graph topic |
| `PUT` | `/api/admin/topics/:id` | `admin`, `editor` | Update a topic by ID |
| `DELETE` | `/api/admin/topics/:id` | `admin` | Delete a topic by ID |
| `POST` | `/api/admin/topic-relations` | `admin`, `editor` | Create a directional relation between two topics |
| `DELETE` | `/api/admin/topic-relations/:id` | `admin`, `editor` | Remove a topic relation by ID |
| `GET` | `/api/admin/categories` | Any Auth | List all categories for CMS management |
| `POST` | `/api/admin/categories` | `admin` | Create a new category |
| `PUT` | `/api/admin/categories/:id` | `admin` | Update a category |
| `DELETE` | `/api/admin/categories/:id` | `admin` | Delete a category |
| `GET` | `/api/admin/keywords` | Any Auth | List keywords with optional search and pagination |
| `POST` | `/api/admin/keywords` | `admin`, `editor` | Create a new SEO keyword |
| `PUT` | `/api/admin/keywords/:id` | `admin`, `editor` | Update a keyword |
| `DELETE` | `/api/admin/keywords/:id` | `admin` | Delete a keyword |
| `GET` | `/api/admin/ads` | Any Auth | List all advertisement campaigns and metrics |
| `POST` | `/api/admin/ads` | `admin`, `editor` | Create a new advertisement slot |
| `PUT` | `/api/admin/ads/:id` | `admin`, `editor` | Update an advertisement slot |
| `DELETE` | `/api/admin/ads/:id` | `admin` | Delete an advertisement slot |
| `GET` | `/api/admin/videos` | Any Auth | List all video learning entries |
| `POST` | `/api/admin/validate-video-url` | Any Auth | Validate YouTube/Vimeo URL and generate privacy-enhanced embed URL |
| `POST` | `/api/admin/upload-thumbnail` | `admin`, `editor` | Upload base64 custom video thumbnail image (`<= 5MB`) |
| `POST` | `/api/admin/videos` | `admin`, `editor` | Create a new video learning entry |
| `PUT` | `/api/admin/videos/:id` | `admin`, `editor` | Update a video learning entry |
| `PATCH` | `/api/admin/videos/:id/status` | `admin`, `editor` | Toggle video status (`draft`, `published`, `unpublished`) |
| `DELETE` | `/api/admin/videos/:id` | `admin`, `editor` | Delete a video learning entry |
| `GET` | `/api/admin/media` | Any Auth | List uploaded media assets |
| `POST` | `/api/admin/media` | Any Auth | Register a media asset |
| `GET` | `/api/admin/users` | `admin` | List all registered CMS users |
| `PUT` | `/api/admin/users/:id/role` | `admin` | Update user role (`admin`, `editor`, `viewer`) |
| `GET` | `/api/admin/audit-logs` | `admin` | Retrieve recent administrative audit logs |
| `GET` | `/api/admin/settings/contact` | Any Auth | Retrieve full site contact & AdSense configuration |
| `PUT` | `/api/admin/settings/contact` | `admin`, `editor` | Update site contact details and AdSense configuration |
| `GET` | `/api/admin/settings/logo` | Public / Any | Retrieve current active website logo URL |
| `PUT` | `/api/admin/settings/logo` | `admin`, `editor` | Set website logo URL |
| `POST` | `/api/admin/upload-logo` | `admin`, `editor` | Upload base64 website logo (`PNG`, `JPG`, `WebP`, `SVG`, max `5MB`) |
