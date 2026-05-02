# Message Central System Design

## Project Overview

**Message Central** is a full-stack message management application where users can create, view, and track messages. The system demonstrates modern architecture patterns with emphasis on separation of concerns, centralized logging, and scalability.

**Key Features:**
- Create and post messages with title and content
- View all messages with read/unread status
- Mark messages as read
- Centralized logging to external evaluation service
- Real-time error handling and state management

---

## Architecture

```
Frontend (React + Vite)          Backend (Express + TypeScript)
├── Components                   ├── Routes (/messages)
├── Custom Hooks                 ├── Controllers (Validation)
├── API Client                   ├── Services (Business Logic)
└── Theme & UI                   └── Data Storage (In-Memory)
        ↕                                  ↕
        └─────── HTTP REST API ──────────┘
                        ↓
        Shared Logging Middleware
                (JWT Auth)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component-based UI with type safety |
| **Build** | Vite | Fast bundling and dev server |
| **UI Framework** | Material-UI v5 | Pre-built components with theming |
| **Backend** | Express + TypeScript | RESTful API server |
| **HTTP Client** | Axios | Promise-based API requests |
| **Logging** | Custom JWT Auth | Centralized observability |

---

## Data Flow

### Create Message Flow
```
User Input → PostMessageForm → useMessageBoard Hook
    ↓
messageApi.postMessage() → HTTP POST /messages
    ↓
Backend: messageHandler → messageStore → messages[]
    ↓
Response: Message object → Update UI state → Re-render
```

### Fetch Messages Flow
```
Component Mount → useMessageBoard Hook (useRef prevents double-fetch)
    ↓
messageApi.getMessages() → HTTP GET /messages
    ↓
Backend: messageHandler → messageStore → messages[]
    ↓
Response: Message[] → setMessages() → UI renders list
```

### Mark as Read Flow
```
User Click → MessageTile Component → useMessageBoard.markAsRead()
    ↓
messageApi.setMessageRead(id) → HTTP PATCH /messages/:id
    ↓
Backend: messageHandler → messageStore (update flag)
    ↓
Response: Success → Update local state → Re-render UI
```

---

## Logging Strategy

All actions across frontend and backend are captured with structured logs sent to external evaluation service.

### Log Function Signature
```typescript
Log(stack: "frontend" | "backend", level: string, module: string, message: string)
```

### Logging Coverage

**Frontend:**
- API calls: "just fetching all my messages" → "got 5 messages back from server"
- User actions: "marking message 123 as read"
- Errors: "couldn't fetch messages, server error: 500"

**Backend:**
- Request entry: Timestamp logger logs `[ISO_TIME] METHOD /path`
- Handler execution: "just grabbed all the messages"
- Errors: "couldn't save that, validation failed"

### Log Levels
| Level | Usage |
|-------|-------|
| **debug** | Component renders, state updates |
| **info** | Successful operations |
| **warn** | Validation failures, missing fields |
| **error** | API failures, server errors |

**External Service:** `http://20.244.56.144/evaluation-service/logs`  
**Authentication:** JWT Bearer token from `LOG_ACCESS_TOKEN` env  
**Timeout:** 3000ms (graceful degradation if unavailable)

---

## Scalability Approach

### Current Implementation
- **Storage:** In-memory array for simplicity and demo purposes
- **Message ID:** `Date.now()` for simple, sortable IDs
- **Type Safety:** TypeScript interfaces shared between frontend and backend

### Production Migration Path

**Database Layer**
- Replace in-memory `messages[]` array with PostgreSQL/MongoDB
- Services (`messageStore`) remain unchanged—only data layer swaps
- Enables persistence, querying, filtering

**Scaling Opportunities**
1. **Database:** PostgreSQL with indexes on `id`, `created_at`
2. **Caching:** Redis for frequently accessed messages
3. **Real-time:** WebSocket (Socket.IO) for live message updates
4. **Authentication:** JWT-based user isolation
5. **Pagination:** Cursor-based for large datasets
6. **Search:** Full-text search indexes for message content

### Architecture Benefits for Scaling
- **Route → Controller → Service → Data separation** enables testing and swapping implementations
- **Custom React hooks** encapsulate state logic, easy to replace with Redux/Zustand
- **HTTP API** allows scaling frontend independently (CDN, multi-region deployment)
- **Centralized logging** provides observability for debugging at scale

---

## Project Structure

```
notification-system/
├── notification_app_be/              (Express backend)
│   ├── src/
│   │   ├── index.ts                 (Middleware setup, server)
│   │   ├── logger.ts                (Logging implementation)
│   │   ├── routes/messageRoutes.ts  (API endpoints)
│   │   ├── controllers/messageHandler.ts  (Request validation)
│   │   ├── services/messageStore.ts (Business logic)
│   │   └── data/messages.ts         (In-memory storage)
│   └── package.json
│
├── notification_app_fe/              (React frontend)
│   ├── src/
│   │   ├── main.tsx                 (React init, theme)
│   │   ├── App.tsx                  (Root component)
│   │   ├── api/messageApi.ts        (HTTP calls)
│   │   ├── hooks/useMessageBoard.ts (State management)
│   │   ├── components/              (UI components)
│   │   ├── pages/MessageHubPage.tsx (Main page)
│   │   └── types/index.ts           (TypeScript interfaces)
│   └── package.json
│
└── logging_middleware/               (Shared logging)
    ├── src/logger.ts
    └── package.json
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **GET** | `/messages` | Retrieve all messages |
| **POST** | `/messages` | Create new message |
| **PATCH** | `/messages/:id` | Mark message as read |

### Request/Response Examples

**POST /messages**
```json
// Request
{ "title": "Hello", "message": "First post!" }

// Response (201 Created)
{ "id": 1714743156789, "title": "Hello", "message": "First post!", "read": false }
```

**PATCH /messages/1714743156789**
```json
// Response (200 OK)
{ "success": true }
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **React Hooks** | Cleaner state management than class components |
| **useRef for mount detection** | Prevents double-fetch in React StrictMode |
| **Route → Controller → Service** | Services testable independently of HTTP |
| **Material-UI + Custom Theme** | Accessibility + consistent branding (#d946ef purple) |
| **Custom logging package** | Centralized observability across stack |
| **Casual log messages** | "got messages" vs "fetched messages"—more readable |

---

## Getting Started

### Install Dependencies
```bash
cd logging_middleware && npm install && cd ..
cd notification_app_be && npm install && cd ..
cd notification_app_fe && npm install && cd ..
```

### Configure Backend
Create `notification_app_be/.env`:
```env
LOG_ACCESS_TOKEN=your_jwt_token_here
```

### Run Development Servers
```bash
# Terminal 1 - Backend (port 3000)
cd notification_app_be && npm run dev

# Terminal 2 - Frontend (port 5173)
cd notification_app_fe && npm run dev
```

### Build for Production
```bash
cd notification_app_be && npm run build
cd notification_app_fe && npm run build
```

---

## Summary

Message Central demonstrates a professional full-stack architecture with:
- ✅ Clean separation of concerns (routes → controllers → services)
- ✅ Type-safe React with custom hooks for state management
- ✅ Centralized logging for observability
- ✅ Scalable design ready for database persistence
- ✅ Material-UI for consistent, accessible UI
- ✅ RESTful API design with proper HTTP semantics
