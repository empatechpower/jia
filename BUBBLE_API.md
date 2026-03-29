# JIA Ideas — Bubble API Reference

> **Purpose**: Every API endpoint the React frontend calls.  
> Build each item as a **Backend Workflow** (POST → returns JSON) or
> use the built-in **Bubble Data API** (GET). Bubble's Data API is
> automatically available for any Data Type — no custom workflow needed
> for GET endpoints.

---

## Base URL

```
https://jia-ideas.bubbleapps.io/api/1.1
```

All **custom workflow** endpoints use the path prefix `/wf/`.  
All **Data API** reads use the path prefix `/obj/`.

---

## Authentication

Bubble uses a Bearer token. The frontend stores it in `localStorage` as `jia_token`.

All protected endpoints require:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### POST `/wf/login`
**Trigger**: User submits email + password on LoginPage.

**Input**:
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Bubble workflow steps**:
1. Search for User where email = `email`
2. Validate password (Bubble's built-in password check)
3. Generate API token (use Bubble's `Generate a random string` or user's existing token)
4. Return JSON:

**Output**:
```json
{
  "status": "success",
  "token": "abc123xyz",
  "user_id": "1234567890",
  "email": "user@example.com",
  "name": "John Doe"
}
```

---

### POST `/wf/signup`
**Input**:
```json
{ "email": "user@example.com", "password": "secret123", "phone": "+6591234567" }
```

**Bubble workflow steps**:
1. Create User (email, password, phone fields)
2. Generate token
3. Return same shape as `/login`

---

### POST `/wf/logout`
**Input**: (none, token from header identifies user)  
**Steps**: Invalidate token (set user's api_token to empty).  
**Output**: `{ "status": "success" }`

---

### POST `/wf/forgot-password`
**Input**: `{ "email": "user@example.com" }`  
**Steps**: Bubble's built-in "Send password reset email"  
**Output**: `{ "status": "success" }`

---

## 2. User Endpoints

### GET `/obj/user/:user_id` *(Data API)*
Returns the public fields of the User data type.

**Bubble Data Type: `User`**
| Field | Type |
|---|---|
| `email` | email |
| `name` | text |
| `phone` | text |
| `created_date` | date |

---

### POST `/wf/update-profile`
**Input**:
```json
{ "name": "Jane Doe", "phone": "+6591234567" }
```
**Steps**: Make changes to current user.  
**Output**: Updated user object.

---

## 3. Data Types to Create in Bubble

### `Product`
| Field | Type | Notes |
|---|---|---|
| `product_id` | text | slug, e.g. `type-a-d-d` |
| `name` | text | display name |
| `series_id` | text | e.g. `hanging-drawers` |
| `area` | text | `wardrobe` or `kitchen` |
| `description` | text |  |
| `images` | list of texts | CDN URLs |
| `sketch_image` | text | CAD drawing URL |
| `is_active` | yes/no | default yes |

### `KitchenPricing`
| Field | Type | Notes |
|---|---|---|
| `product_id` | text | FK to Product |
| `width` | text | e.g. `400mm` |
| `price` | number | SGD |
| `available` | yes/no |  |
| `door_type` | text | `single` or `double` |

### `Series`
| Field | Type | Notes |
|---|---|---|
| `series_id` | text | slug |
| `name` | text | display name |
| `area` | text | `wardrobe` or `kitchen` |
| `image` | text | CDN URL |
| `is_active` | yes/no |  |

### `Project`
| Field | Type | Notes |
|---|---|---|
| `user` | User | creator |
| `property_type` | text | BTO, Resale, Condo, Landed |
| `is_own_property` | yes/no |  |
| `zip_code` | text |  |
| `unit` | text |  |
| `key_date` | text |  |
| `number_of_rooms` | number |  |
| `status` | text | draft/submitted/in_progress/completed |

### `Room`
| Field | Type | Notes |
|---|---|---|
| `project` | Project |  |
| `name` | text | e.g. `Master Bedroom` |
| `area` | text | `wardrobe` or `kitchen` |

### `CartItem`
| Field | Type | Notes |
|---|---|---|
| `user` | User |  |
| `room` | Room |  |
| `room_name` | text | denormalized for display |
| `product_id` | text |  |
| `product_name` | text |  |
| `product_image` | text | URL |
| `base_price` | number |  |
| `final_price` | number | after discount |
| `discount_rate` | number | 0.2 = 20% |
| `config_json` | text | JSON-stringified config |

### `Order`
| Field | Type | Notes |
|---|---|---|
| `user` | User |  |
| `project` | Project |  |
| `items` | list of CartItem |  |
| `subtotal` | number |  |
| `discount_total` | number |  |
| `total` | number |  |
| `status` | text | pending/confirmed/in_progress/completed/cancelled |
| `payment_status` | text | unpaid/paid/refunded |

### `PortfolioProject`
| Field | Type | Notes |
|---|---|---|
| `title` | text |  |
| `location` | text |  |
| `category` | text |  |
| `year` | text |  |
| `cover_image` | text | URL |
| `gallery_images` | list of texts | URLs |
| `description` | text |  |
| `challenges` | list of texts |  |
| `solutions` | list of texts |  |
| `features` | list of texts |  |
| `client` | text |  |
| `duration` | text |  |
| `size` | text |  |
| `is_featured` | yes/no |  |

---

## 4. Product Endpoints

### GET `/obj/product` *(Data API — enable in Bubble settings)*

**Filter by series** (Bubble constraint format):
```
GET /obj/product?constraints=[{"key":"series_id","constraint_type":"equals","value":"hanging-drawers"},{"key":"is_active","constraint_type":"equals","value":"true"}]
```

**Filter by area**:
```
GET /obj/product?constraints=[{"key":"area","constraint_type":"equals","value":"kitchen"}]
```

### GET `/obj/product/:id` *(Data API)*

### GET `/obj/kitchenpricing` *(Data API)*
```
GET /obj/kitchenpricing?constraints=[{"key":"product_id","constraint_type":"equals","value":"bottom-w-door"}]
```

---

## 5. Series Endpoints

### GET `/obj/series` *(Data API)*
```
GET /obj/series?constraints=[{"key":"area","constraint_type":"equals","value":"wardrobe"},{"key":"is_active","constraint_type":"equals","value":"true"}]
```

---

## 6. Project Endpoints

### POST `/wf/create-project`
**Input**:
```json
{
  "property_type": "BTO",
  "is_own_property": true,
  "zip_code": "612512",
  "unit": "#04-10",
  "key_date": "15th September 2025",
  "number_of_rooms": 3
}
```
**Bubble steps**:
1. Create new Project (link to current user)
2. Return `{ "project_id": "..." }`

---

### GET `/obj/project` *(Data API)*
Frontend sends auth token → Bubble returns only current user's projects.
Set **Privacy Rules** so users can only see their own projects.

---

## 7. Room Endpoints

### POST `/wf/create-room`
**Input**:
```json
{ "project_id": "abc123", "name": "Master Bedroom", "area": "wardrobe" }
```
**Bubble steps**:
1. Create Room (link to Project)
2. Return `{ "room_id": "..." }`

### POST `/wf/rename-room`
**Input**: `{ "room_id": "abc", "name": "Study Room" }`

### GET `/obj/room?constraints=[{"key":"project","constraint_type":"equals","value":"<project_id>"}]`

---

## 8. Cart Endpoints

### POST `/wf/add-to-cart`
**Input**:
```json
{
  "room_id": "room-1",
  "room_name": "Master Bedroom",
  "product_id": "type-a-d-d",
  "product_name": "Type A-D-D",
  "product_image": "https://cdn.example.com/img.jpg",
  "base_price": 100.00,
  "final_price": 80.00,
  "discount_rate": 0.20,
  "config": {
    "internal_color": "Light",
    "external_color": "oat-linen",
    "width": "450mm",
    "door_option": "Timber Door",
    "side_panel": "not-required",
    "add_lock": "No",
    "led_strip": "Yes",
    "remarks": ""
  }
}
```
**Bubble steps**:
1. Create CartItem (link to current user, Room, config stored as JSON text)
2. Return `{ "cart_item_id": "..." }`

### POST `/wf/remove-from-cart`
**Input**: `{ "cart_item_id": "abc123" }`  
**Steps**: Delete CartItem (check it belongs to current user first)

### POST `/wf/clear-cart`
**Steps**: Delete all CartItems for current user

### GET `/obj/cartitem` *(Data API)*
Privacy rules ensure users only see their own items.

---

## 9. Order Endpoints

### POST `/wf/create-order`
This is called at checkout confirmation.

**Input**:
```json
{
  "project_id": "proj-123",
  "property_info": {
    "property_type": "BTO",
    "zip_code": "612512",
    "unit": "#04-10"
  }
}
```
**Bubble steps**:
1. Search CartItems for current user
2. Calculate subtotal, discount, total
3. Create Order (with all CartItems, property info)
4. Send confirmation email (use Bubble's "Send email" action)
5. Clear CartItems for user
6. Return `{ "order_id": "...", "status": "confirmed" }`

### GET `/obj/order` *(Data API)*

---

## 10. Portfolio Endpoints

### GET `/obj/portfolioproject?sort_field=year&descending=true` *(Data API)*
### GET `/obj/portfolioproject/:id` *(Data API)*

---

## 11. Admin Endpoints (optional, for your admin panel)

### GET `/obj/order?constraints=[{"key":"status","constraint_type":"not equals","value":"completed"}]`
Returns all pending orders (admin-only privacy rule).

### POST `/wf/update-order-status`
**Input**: `{ "order_id": "abc", "status": "in_progress" }`

---

## Bubble Setup Checklist

- [ ] Enable Data API in Bubble Settings → API → Enable Data API
- [ ] Enable Workflow API in Bubble Settings → API → Enable Workflow API
- [ ] Create all Data Types listed in Section 3
- [ ] Set Privacy Rules on all types (users see only their own data; admin role sees all)
- [ ] Create all Backend Workflows listed above
- [ ] Enable CORS for your frontend domain in API settings
- [ ] Add `VITE_API_BASE_URL=https://your-app.bubbleapps.io/api/1.1` to your `.env.local`
- [ ] Test every endpoint with Bubble's API debugger before connecting frontend
- [ ] Seed initial Product, Series, and KitchenPricing data in Bubble's App Data tab

---

## Environment Variables (.env.local)

```env
VITE_API_BASE_URL=https://jia-ideas.bubbleapps.io/api/1.1
VITE_API_VERSION=live
```

For staging/testing:
```env
VITE_API_BASE_URL=https://jia-ideas.bubbleapps.io/version-test/api/1.1
VITE_API_VERSION=test
```
