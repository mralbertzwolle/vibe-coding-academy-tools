# Naming Conventions

All plugins enforce these naming conventions based on industry standards.

---

## Overview

| Layer | Convention | Example |
|-------|------------|---------|
| TypeScript | camelCase | `userId`, `getUserById()` |
| React Components | PascalCase | `UserProfile.tsx` |
| Database | snake_case | `user_id`, `created_at` |
| API JSON | camelCase | `{ userId, createdAt }` |
| Foreign Keys | `{table}_id` | `user_id`, `order_id` |
| Booleans (DB) | `is_{prop}` | `is_active`, `is_published` |
| Timestamps | `{action}_at` | `created_at`, `updated_at` |

---

## TypeScript/JavaScript

Based on [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html).

| Context | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `userId`, `orderTotal` |
| Functions | camelCase | `getUserById`, `calculateTotal` |
| Classes | PascalCase | `UserService`, `OrderController` |
| Interfaces | PascalCase | `User`, `OrderInput` |
| Types | PascalCase | `UserRole`, `OrderStatus` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `API_URL` |

---

## React Components

Based on [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react).

| File Type | Convention | Example |
|-----------|------------|---------|
| Components | PascalCase | `UserProfile.tsx`, `OrderList.tsx` |
| Hooks | camelCase with 'use' prefix | `useAuth.ts`, `useOrders.ts` |
| Services | camelCase | `userService.ts` |

---

## Database (PostgreSQL)

Based on [SQL Style Guide by Simon Holywell](https://www.sqlstyle.guide/).

| Element | Convention | Example | Anti-Pattern |
|---------|------------|---------|--------------|
| Tables | snake_case, plural | `users`, `order_items` | `Users`, `orderItems` |
| Columns | snake_case | `user_id`, `created_at` | `userId`, `createdAt` |
| Foreign Keys | `{table_singular}_id` | `user_id`, `order_id` | `userid`, `userID` |
| Timestamps | `{action}_at` | `created_at`, `updated_at` | `createdat`, `last_edited` |
| Booleans | `is_{property}` | `is_active`, `is_published` | `active`, `published` |
| Status | `status` | `status` | `state`, `type` (mixed) |

---

## Boundary Transformation

**Critical Rule:** Database snake_case must be transformed to TypeScript camelCase at the service layer.

```typescript
// ❌ WRONG - Database naming leaked into TypeScript
interface User {
  user_id: string;
  organization_id: string;
}

// ✅ CORRECT - Transformed at boundary
interface User {
  userId: string;
  organizationId: string;
}

// Transformer functions
function transformFromDB(row: UserRow): User { ... }
function transformToDB(user: User): UserRow { ... }
```

---

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Backend files | kebab-case | `user-profile.ts`, `auth-middleware.ts` |
| React components | PascalCase | `UserProfile.tsx`, `OrderList.tsx` |
| Test files | `.test.ts` suffix | `user.service.test.ts` |
| Type files | `.types.ts` suffix | `order.types.ts` |

---

## API Endpoints

Based on [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines).

| Pattern | Example |
|---------|---------|
| Collection | `GET /api/orders` |
| Single item | `GET /api/orders/:id` |
| Create | `POST /api/orders` |
| Update | `PUT /api/orders/:id` |
| Delete | `DELETE /api/orders/:id` |
| Nested | `GET /api/users/:id/orders` |

---

## Consistency Over Convention

The **#1 rule** is CONSISTENCY within your codebase. If you have:
- 67 columns named `organization_id`
- 71 columns named `organizationid`

This is a **CRITICAL** issue regardless of which format is "correct". Pick one and standardize.

---

## Running a Naming Check

```bash
/codebase-setup:naming-check
```

This audits both database schema and code for naming convention violations.

---

*Part of [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
