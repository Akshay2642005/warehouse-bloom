# Warehouse Bloom API (Draft)

## Auth

POST /api/auth/register

- Summary: Register a new user
- Request Body: { email, password }
- Responses: 201 Created { user }

POST /api/auth/login

- Summary: Login and receive JWT
- Request Body: { email, password }
- Responses: 200 OK { user, token }

## Items

GET /api/items

- Summary: List items (paginated)
- Query: page, pageSize, q
- Responses: 200 OK { items, page, pageSize, total }

POST /api/items

- Summary: Create item
- Body: { name, sku, quantity, priceCents, imageUrl?, description? }
- Responses: 201 Created { item }

GET /api/items/{id}

- Summary: Get item by id
- Responses: 200 OK { item }

PUT /api/items/{id}

- Summary: Update item by id
- Responses: 200 OK { item }

DELETE /api/items/{id}

- Summary: Delete item by id
- Responses: 204 No Content
