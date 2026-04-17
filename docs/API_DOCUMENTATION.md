# API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": "1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "pincode": "10001"
      }
    },
    "token": "jwt_token_here"
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": "1234567890"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User
**GET** `/auth/me`

Get current authenticated user details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": "1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "pincode": "10001"
      },
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Logout User
**POST** `/auth/logout`

Invalidate the current client session (token should be removed on client side).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Update Profile
**PUT** `/auth/profile`

Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543210",
  "address": {
    "street": "456 New St",
    "city": "Boston",
    "state": "MA",
    "pincode": "02101"
  }
}
```

## Pass Endpoints

### Apply for Pass
**POST** `/passes`

Submit a new pass application.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
```
source: "delhi"
destination: "mumbai"
duration: "1-month"
documents: [File, File, File] // Up to 3 files
```

**Response:**
```json
{
  "success": true,
  "message": "Pass application submitted successfully",
  "data": {
    "pass": {
      "id": "pass_id",
      "userId": "user_id",
      "source": "delhi",
      "destination": "mumbai",
      "duration": "1-month",
      "price": 500,
      "status": "pending",
      "applicationDate": "2023-01-01T00:00:00.000Z",
      "documents": [
        {
          "filename": "document_123.jpg",
          "originalName": "id_proof.jpg",
          "path": "/uploads/document_123.jpg",
          "mimetype": "image/jpeg",
          "size": 1024000
        }
      ]
    }
  }
}
```

### Get My Passes
**GET** `/passes/my-passes`

Get current user's pass applications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending, approved, rejected, expired)

**Response:**
```json
{
  "success": true,
  "data": {
    "passes": [
      {
        "id": "pass_id",
        "userId": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "source": "delhi",
        "destination": "mumbai",
        "duration": "1-month",
        "price": 500,
        "status": "pending",
        "applicationDate": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Get Pass Details
**GET** `/passes/:id`

Get detailed information about a specific pass.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "pass": {
      "id": "pass_id",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "pincode": "10001"
        }
      },
      "source": "delhi",
      "destination": "mumbai",
      "duration": "1-month",
      "price": 500,
      "status": "approved",
      "passNumber": "TP20231234",
      "applicationDate": "2023-01-01T00:00:00.000Z",
      "approvedDate": "2023-01-02T00:00:00.000Z",
      "expiryDate": "2023-02-01T00:00:00.000Z",
      "documents": [
        {
          "filename": "document_123.jpg",
          "originalName": "id_proof.jpg",
          "path": "/uploads/document_123.jpg",
          "mimetype": "image/jpeg",
          "size": 1024000
        }
      ]
    }
  }
}
```

### Get All Passes (Admin Only)
**GET** `/passes`

Get all pass applications (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `source` (optional): Filter by source
- `destination` (optional): Filter by destination

### Update Pass Status (Admin Only)
**PUT** `/passes/:id/status`

Update pass status (approve/reject).

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "status": "approved",
  "rejectionReason": "Documents incomplete" // Only required for rejected status
}
```

### Get Statistics (Admin Only)
**GET** `/passes/statistics`

Get system statistics and analytics.

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "statusStats": [
      {
        "_id": "pending",
        "count": 10,
        "totalRevenue": 0
      },
      {
        "_id": "approved",
        "count": 25,
        "totalRevenue": 12500
      },
      {
        "_id": "rejected",
        "count": 5,
        "totalRevenue": 0
      }
    ],
    "totalApplications": 40,
    "monthlyApplications": [
      {
        "_id": {
          "year": 2023,
          "month": 12
        },
        "count": 15
      }
    ]
  }
}
```

## Route Endpoints

### Get All Routes
**GET** `/routes`

Get all available transport routes.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `source` (optional): Filter by source
- `destination` (optional): Filter by destination

**Response:**
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "id": "route_id",
        "source": "delhi",
        "destination": "mumbai",
        "basePrice": 500,
        "distance": 1400,
        "estimatedTime": "24 hours",
        "routeType": "train",
        "isActive": true,
        "durationMultipliers": {
          "1-month": 1,
          "3-months": 2.5,
          "6-months": 4.5,
          "1-year": 8
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### Calculate Price
**POST** `/routes/calculate-price`

Calculate pass price for a specific route and duration.

**Request Body:**
```json
{
  "source": "delhi",
  "destination": "mumbai",
  "duration": "3-months"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "route": {
      "source": "delhi",
      "destination": "mumbai",
      "basePrice": 500,
      "distance": 1400,
      "estimatedTime": "24 hours"
    },
    "duration": "3-months",
    "calculatedPrice": 1250
  }
}
```

### Create Route (Admin Only)
**POST** `/routes`

Create a new transport route.

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "source": "delhi",
  "destination": "mumbai",
  "basePrice": 500,
  "distance": 1400,
  "estimatedTime": "24 hours",
  "routeType": "train",
  "stops": [
    {
      "name": "Mathura",
      "order": 1
    },
    {
      "name": "Agra",
      "order": 2
    }
  ]
}
```

### Update Route (Admin Only)
**PUT** `/routes/:id`

Update an existing route.

**Headers:** `Authorization: Bearer <admin-token>`

### Delete Route (Admin Only)
**DELETE** `/routes/:id`

Soft delete a route (set isActive to false).

**Headers:** `Authorization: Bearer <admin-token>`

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation errors |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Invalid data |
| 500 | Internal Server Error |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per 15 minutes per IP address
- File upload endpoints have additional limits

## File Upload

- **Maximum file size:** 5MB per file
- **Allowed file types:** JPG, JPEG, PNG, GIF, PDF, DOC, DOCX
- **Maximum files per application:** 3 files
- **Upload path:** `/uploads/`

## Security Considerations

1. **JWT Tokens:** Use HTTPS in production to protect tokens
2. **File Upload:** All uploaded files are scanned and validated
3. **Input Validation:** All inputs are validated and sanitized
4. **Rate Limiting:** Implemented to prevent abuse
5. **CORS:** Configured to allow only specified origins

## Testing

Use tools like Postman or curl to test the API endpoints. Example curl command:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```
