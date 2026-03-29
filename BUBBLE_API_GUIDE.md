# Bubble.io API Integration Guide — JIA Ideas

This document describes every API endpoint you need to build in Bubble,
how to call them from the React frontend, and the recommended data types
for each Bubble table (Data Type).

---

## 1. Architecture overview

```
React Frontend (Vercel / Netlify)
       │
       │  HTTPS + Bearer token
       ▼
Bubble.io Data API  ─────►  Bubble Database
       │
       │  Workflow API calls
       ▼
Bubble.io Workflow API  (auth, orders, emails)
```

**Base URL:** `https://YOUR-APP.bubbleapps.io/api/1.1/`

All requests need:
```
Authorization: Bearer <user_token>   ← from login
Content-Type: application/json
```

---

## 2. Bubble Data Types (tables)

Create these in **Data → Data Types**:

### User (built-in, extend with)
| Field           | Type    | Notes                          |
|-----------------|---------|--------------------------------|
| display_name    | text    |                                |
| phone           | text    |                                |
| property_type   | text    | BTO / Resale / Condo / Landed  |
| is_own_property | yes/no  |                                |
| zip_code        | text    |                                |
| unit_number     | text    |                                |

### Product
| Field           | Type    | Notes                                      |
|-----------------|---------|--------------------------------------------|
| name            | text    | "Type A-D-D"                               |
| product_id      | text    | "type-a-d-d" (slug/key)                    |
| area            | text    | "wardrobe" or "kitchen"                    |
| series_id       | text    | "hanging-drawers"                          |
| description     | text    |                                            |
| base_price      | number  | Before discount                            |
| images          | list of files |                                      |
| sketch_image    | file    | Technical drawing                          |
| is_active       | yes/no  |                                            |

### ProductPriceOption  (kitchen width-based pricing)
| Field       | Type    |
|-------------|---------|
| product     | Product |
| width       | text    | "400mm"  |
| price       | number  |
| available   | yes/no  |
| door_type   | text    | "single" or "double" |

### Project
| Field           | Type    |
|-----------------|---------|
| user            | User    |
| property_type   | text    |
| is_own_property | yes/no  |
| zip_code        | text    |
| unit_number     | text    |
| key_date        | text    |
| number_of_rooms | number  |
| status          | text    | "draft" / "submitted" |
| created_date    | date    |

### Room
| Field     | Type    |
|-----------|---------|
| project   | Project |
| name      | text    | "Master Bedroom" |
| area      | text    | "wardrobe" / "kitchen" |
| order     | number  |

### CartItem
| Field                   | Type    |
|-------------------------|---------|
| room                    | Room    |
| product                 | Product |
| product_name            | text    |
| base_price              | number  |
| discounted_price        | number  |
| product_image           | text    | URL |
| config_json             | text    | JSON blob of ProductConfig |
| internal_color          | text    |
| external_color          | text    |
| width                   | text    |
| door_option             | text    |
| side_panel              | text    |
| add_lock                | text    |
| number_of_locks         | text    |
| led_strip               | text    |
| handle_design           | text    |
| handle_color            | text    |
| aluminium_frame_color   | text    |
| aluminium_door_finishing| text    |
| remarks                 | text    |
| blum_runner_upgrade     | text    |
| casement_door_opening   | text    |

### Order
| Field           | Type       |
|-----------------|------------|
| user            | User       |
| project         | Project    |
| cart_items      | list Room  |
| total_price     | number     |
| discounted_total| number     |
| status          | text       | "pending_payment" / "paid" / "processing" / "completed" |
| payment_ref     | text       |
| created_date    | date       |
| notes           | text       |

---

## 3. API Endpoints to build in Bubble

### ── Auth ──────────────────────────────────────────────────────────────

#### POST /wf/signup
**Bubble Workflow API** — Create account

Request body:
```json
{ "email": "user@example.com", "password": "...", "phone": "+6591234567" }
```
Response:
```json
{ "status": "success", "token": "<bubble_user_token>", "user_id": "..." }
```
Bubble workflow steps:
1. Sign the user up (built-in Bubble action)
2. Return token in response body

---

#### POST /wf/login
Request: `{ "email": "...", "password": "..." }`
Response: `{ "token": "...", "user_id": "...", "email": "..." }`

---

#### POST /wf/logout
Header: `Authorization: Bearer <token>`
Response: `{ "status": "success" }`

---

### ── Products ──────────────────────────────────────────────────────────

#### GET /obj/product
Fetch all active products, optionally filtered by area/series.

Query params: `?constraints=[{"key":"is_active","constraint_type":"equals","value":true},{"key":"area","constraint_type":"equals","value":"wardrobe"}]`

Response (Bubble default):
```json
{
  "response": {
    "results": [
      {
        "_id": "...",
        "name": "Type A-D-D",
        "product_id": "type-a-d-d",
        "area": "wardrobe",
        "series_id": "hanging-drawers",
        "base_price": 100,
        "images": ["https://..."],
        "is_active": true
      }
    ],
    "count": 1
  }
}
```

**Frontend usage (`src/services/api.ts`):**
```ts
export async function fetchProducts(area: string, seriesId: string) {
  const constraints = JSON.stringify([
    { key: "is_active", constraint_type: "equals", value: true },
    { key: "area", constraint_type: "equals", value: area },
    { key: "series_id", constraint_type: "equals", value: seriesId },
  ]);
  const res = await apiFetch(`/obj/product?constraints=${encodeURIComponent(constraints)}`);
  return res.response.results;
}
```

---

#### GET /obj/product/:id
Single product by Bubble ID.

---

#### GET /obj/productpriceoption
Fetch pricing options for a product.

Query: `?constraints=[{"key":"product","constraint_type":"equals","value":"<product_bubble_id>"}]`

---

### ── Projects ──────────────────────────────────────────────────────────

#### POST /wf/create_project
Creates a project and its rooms in one workflow call.

Request:
```json
{
  "property_type": "BTO",
  "is_own_property": true,
  "zip_code": "612512",
  "unit_number": "#04-10",
  "key_date": "15th September 2025",
  "number_of_rooms": 3,
  "area": "wardrobe"
}
```
Response:
```json
{
  "status": "success",
  "project_id": "<bubble_id>",
  "room_ids": ["<id1>", "<id2>", "<id3>"]
}
```
Bubble workflow steps:
1. Create Project record (set user = current user)
2. Loop through number_of_rooms, create Room records
3. Return project_id and list of room_ids

---

#### GET /obj/project
Fetch current user's projects:
`?constraints=[{"key":"user","constraint_type":"equals","value":"<user_id>"}]`

---

#### GET /obj/room
Fetch rooms for a project:
`?constraints=[{"key":"project","constraint_type":"equals","value":"<project_id>"}]`

---

#### PATCH /obj/room/:id
Rename a room:
```json
{ "name": "Master Bedroom" }
```

---

### ── Cart ─────────────────────────────────────────────────────────────

#### POST /wf/add_cart_item
Adds a configured product to a room.

Request:
```json
{
  "room_id": "<bubble_room_id>",
  "product_id": "<bubble_product_id>",
  "product_name": "Type A-D-D",
  "base_price": 100,
  "discounted_price": 80,
  "product_image": "https://...",
  "internal_color": "Light",
  "external_color": "oat-linen",
  "width": "450mm",
  "door_option": "Single Timber Door",
  "side_panel": "not-required",
  "add_lock": "No",
  "led_strip": "Yes",
  "handle_design": "Handle 1",
  "handle_color": "Black",
  "casement_door_opening": "Right",
  "remarks": "Please use matte finish",
  "config_json": "{...full config as JSON string...}"
}
```
Response:
```json
{ "status": "success", "cart_item_id": "<bubble_id>" }
```

---

#### DELETE /obj/cartitem/:id
Remove a cart item (enable Bubble Data API DELETE on CartItem type).

---

#### GET /obj/cartitem
Fetch all cart items for a project's rooms:
```
?constraints=[{"key":"room","constraint_type":"in","value":["<room1_id>","<room2_id>"]}]
```

---

### ── Orders / Checkout ─────────────────────────────────────────────────

#### POST /wf/create_order
Creates the order and triggers the email confirmation.

Request:
```json
{
  "project_id": "<bubble_project_id>",
  "cart_item_ids": ["<id1>", "<id2>"],
  "total_price": 500,
  "discounted_total": 400,
  "property_info": {
    "type": "BTO",
    "zip_code": "612512",
    "unit": "#04-10"
  }
}
```
Response:
```json
{
  "status": "success",
  "order_id": "<bubble_id>",
  "payment_url": "https://payment-gateway.com/pay?ref=..."
}
```
Bubble workflow steps:
1. Create Order record
2. Mark project status = "submitted"
3. Send confirmation email (Sendgrid / Postmark plugin)
4. (Optional) trigger Stripe payment link
5. Return order_id

---

#### GET /obj/order
Fetch user's order history:
`?constraints=[{"key":"user","constraint_type":"equals","value":"<user_id>"}]&sort_field=created_date&descending=true`

---

#### POST /wf/payment_success
Called after payment gateway webhook.

Request: `{ "order_id": "<bubble_id>", "payment_ref": "pi_xyz" }`
Bubble steps:
1. Find Order → set status = "paid", payment_ref = payment_ref
2. Send "Payment Confirmed" email to user
3. Notify admin (Slack/email)

---

### ── User profile ──────────────────────────────────────────────────────

#### GET /obj/user/:id
Returns current user's record.

#### PATCH /obj/user/:id
Update profile fields.

---

## 4. Frontend API service layer

Create `src/services/api.ts`:

```ts
const BASE = import.meta.env.VITE_BUBBLE_API_URL;
// e.g. "https://jia-ideas.bubbleapps.io/api/1.1"

function getToken() {
  return localStorage.getItem("jia_token") ?? "";
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Auth ──
export async function login(email: string, password: string) {
  const data = await apiFetch("/wf/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("jia_token", data.token);
  return data; // { token, user_id, email }
}

export async function signup(email: string, password: string, phone: string) {
  const data = await apiFetch("/wf/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, phone }),
  });
  localStorage.setItem("jia_token", data.token);
  return data;
}

export function logout() {
  localStorage.removeItem("jia_token");
}

// ── Products ──
export async function fetchProducts(area: string, seriesId: string) {
  const c = JSON.stringify([
    { key: "is_active", constraint_type: "equals", value: true },
    { key: "area", constraint_type: "equals", value: area },
    { key: "series_id", constraint_type: "equals", value: seriesId },
  ]);
  const data = await apiFetch(`/obj/product?constraints=${encodeURIComponent(c)}`);
  return data.response.results;
}

export async function fetchPriceOptions(productBubbleId: string) {
  const c = JSON.stringify([
    { key: "product", constraint_type: "equals", value: productBubbleId },
  ]);
  const data = await apiFetch(`/obj/productpriceoption?constraints=${encodeURIComponent(c)}`);
  return data.response.results;
}

// ── Project ──
export async function createProject(payload: {
  property_type: string;
  is_own_property: boolean;
  zip_code: string;
  unit_number: string;
  key_date: string;
  number_of_rooms: number;
  area: string;
}) {
  return apiFetch("/wf/create_project", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchUserProjects(userId: string) {
  const c = JSON.stringify([{ key: "user", constraint_type: "equals", value: userId }]);
  const data = await apiFetch(`/obj/project?constraints=${encodeURIComponent(c)}`);
  return data.response.results;
}

export async function renameRoom(roomId: string, name: string) {
  return apiFetch(`/obj/room/${roomId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

// ── Cart ──
export async function addCartItem(payload: Record<string, unknown>) {
  return apiFetch("/wf/add_cart_item", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteCartItem(cartItemId: string) {
  return apiFetch(`/obj/cartitem/${cartItemId}`, { method: "DELETE" });
}

// ── Order ──
export async function createOrder(payload: {
  project_id: string;
  cart_item_ids: string[];
  total_price: number;
  discounted_total: number;
  property_info: Record<string, string>;
}) {
  return apiFetch("/wf/create_order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchOrders(userId: string) {
  const c = JSON.stringify([{ key: "user", constraint_type: "equals", value: userId }]);
  const data = await apiFetch(
    `/obj/order?constraints=${encodeURIComponent(c)}&sort_field=created_date&descending=true`
  );
  return data.response.results;
}
```

---

## 5. Environment variables

Create `.env.local` (never commit this):
```
VITE_BUBBLE_API_URL=https://YOUR-APP.bubbleapps.io/api/1.1
```

Access in code: `import.meta.env.VITE_BUBBLE_API_URL`

---

## 6. Bubble setup checklist

- [ ] Enable **Data API** in Settings → API → enable Data API
- [ ] Enable **Workflow API** in Settings → API → enable Workflow API
- [ ] For each Data Type, enable **GET** (read) and **PUT/PATCH/DELETE** as needed
- [ ] Create all Workflow API endpoints (Backend Workflows, check "This workflow can be run without authentication" ONLY for webhook endpoints)
- [ ] Set **Privacy Rules** so users can only see their own Projects, Rooms, CartItems, and Orders
- [ ] Install **Sendgrid** or **Postmark** plugin for transactional email
- [ ] Install **Stripe** plugin for payments (or use a payment link)
- [ ] Set CORS to allow your frontend domain

---

## 7. Security rules (Bubble Privacy tab)

**Project:** Only visible when Current User = project's User  
**Room:** Only visible when Current User = room's Project's User  
**CartItem:** Only visible when Current User = cart item's Room's Project's User  
**Order:** Only visible when Current User = order's User  
**Product:** Everyone can see (no restriction)

---

## 8. Connecting the React app to Bubble

When the user logs in, store the Bubble token and user_id in `AppContext`:

```ts
// In LoginPage.tsx, swap the stub:
const { token, user_id, email } = await login(formEmail, formPassword);
handleLogin(email, token, user_id); // add token+userId to AppContext

// In AppContext.tsx, add:
const [authToken, setAuthToken] = useState(localStorage.getItem("jia_token") ?? "");
const [userId, setUserId] = useState(localStorage.getItem("jia_user_id") ?? "");
```

Then replace in-memory cart operations with API calls:
```ts
// Instead of local handleAddProductToCart:
await addCartItem({ room_id: bubbleRoomId, ...configFields });
```

Use **React Query** (`npm i @tanstack/react-query`) to manage loading/error state:
```ts
const { data: products, isLoading } = useQuery({
  queryKey: ["products", selectedArea, selectedSeriesId],
  queryFn: () => fetchProducts(selectedArea, selectedSeriesId),
});
```
