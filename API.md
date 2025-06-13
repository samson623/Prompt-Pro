# API Documentation

## Authentication

All API endpoints except login/logout require authentication via Replit Auth. Include session cookies with requests.

### Endpoints

#### `GET /api/auth/user`
Get current authenticated user information.

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "profileImageUrl": "string",
  "currentPlan": "free|basic|plus|pro",
  "promptsUsed": 0,
  "promptsLimit": 10,
  "stripeCustomerId": "string",
  "stripeSubscriptionId": "string"
}
```

#### `GET /api/login`
Redirect to Replit authentication flow.

#### `GET /api/logout`
Logout current user and redirect to homepage.

## Prompt Enhancement

#### `POST /api/generate-questions`
Generate AI clarifying questions for prompt enhancement.

**Request:**
```json
{
  "originalPrompt": "string",
  "enhancementOptions": {
    "variations": 1,
    "style": "formal|casual|technical|creative",
    "format": "paragraph|bullets|numbered|outline",
    "length": "brief|moderate|detailed|comprehensive",
    "constraints": {
      "statistics": false,
      "examples": false,
      "balanced": false,
      "citations": false,
      "stepByStep": false,
      "avoidJargon": false
    },
    "customInstructions": "string"
  }
}
```

**Response:**
```json
{
  "questionnaireId": "string",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "type": "multiple-choice|text|boolean",
      "options": ["string"] // for multiple-choice only
    }
  ]
}
```

#### `POST /api/enhance-prompt`
Submit questionnaire answers and get enhanced prompt.

**Request:**
```json
{
  "questionnaireId": "string",
  "answers": ["string"],
  "enhancementOptions": { /* same as above */ }
}
```

**Response:**
```json
{
  "enhancedPrompt": "string",
  "originalPrompt": "string"
}
```

#### `GET /api/prompts`
Get user's prompt enhancement history.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
[
  {
    "id": "string",
    "originalPrompt": "string",
    "enhancedPrompt": "string",
    "createdAt": "ISO 8601 date",
    "questionnaireData": {
      "questions": [/* Question objects */],
      "answers": ["string"]
    }
  }
]
```

## Subscriptions

#### `POST /api/create-subscription`
Create or retrieve Stripe subscription for plan upgrade.

**Request:**
```json
{
  "plan": "basic|plus|pro"
}
```

**Response:**
```json
{
  "subscriptionId": "string",
  "clientSecret": "string"
}
```

#### `POST /api/stripe-webhook`
Handle Stripe webhook events (payment confirmations, subscription updates).

**Headers:**
- `stripe-signature`: Webhook signature for verification

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid data)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (usage limit reached)
- `404`: Not Found
- `500`: Internal Server Error

**Error Format:**
```json
{
  "message": "Error description"
}
```

## Rate Limiting

- Free plan: 10 prompts per month
- Basic plan: 75 prompts per month ($1)
- Plus plan: 300 prompts per month ($3)
- Pro plan: 500 prompts per month ($5)

Usage tracking is enforced on prompt enhancement endpoints.

## Models and Pricing

The application uses OpenRouter API with the following default model:
- `mistralai/mistral-7b-instruct` for both question generation and prompt enhancement

Users can customize model selection through enhancement options.
