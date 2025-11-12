# Copilot Instructions for NOVA E-commerce

## Project Overview
NOVA is a Next.js 15 fashion e-commerce platform with TypeScript, featuring customer shopping, admin management, delivery tracking, and AI-powered product search. Uses PostgreSQL with Prisma ORM, NextAuth for authentication, and Firebase Genkit for AI features.

## Architecture Patterns

### Authentication & Authorization
- **Auth**: NextAuth v4 with JWT sessions (`src/lib/auth.ts`)
  - Providers: Google OAuth + Credentials (email/password)
  - Session strategy: JWT tokens
  - Email verification required for credentials sign-in
- **RBAC**: Three roles (USER, ADMIN, DELIVERY) via `src/lib/rbac.ts`
  - Use `requireRole(session, ['ADMIN'])` in API routes for enforcement
  - Middleware protects routes: `/admin/*`, `/profile/*`, `/cart/*`, `/wishlist/*`
  - Check: `isAdmin(session)` or `isDelivery(session)`

### API Route Structure
- **Pattern**: Next.js App Router API routes in `src/app/api/`
- **Standard flow**:
  1. Get session: `const session = await getCurrentUser()`
  2. Validate role: `requireRole(session, ['ADMIN'])`
  3. Parse body: `const body = await req.json()`
  4. Validate with Zod: `const data = schema.parse(body)`
  5. Database operation with Prisma
  6. Return JSON response

Example from `src/app/api/products/route.ts`:
```typescript
export async function POST(req: Request) {
  const session = await getCurrentUser();
  requireRole(session, ['ADMIN']);
  const body = await req.json();
  const data = productCreateSchema.parse(body);
  const product = await prisma.product.create({ data: {...} });
  return NextResponse.json(product, { status: 201 });
}
```

### Validation Strategy
- **Dual schemas** for forms vs APIs (see `src/lib/validation/product.ts`):
  - `productFormSchema`: React Hook Form with nested objects `{ value: string }[]`
  - `productCreateSchema`: API routes with flat arrays `string[]`
  - Transform form data before API submission
- **Error handling**: Catch ZodError separately, return 400 with first error message
- **Field types**: Use `z.coerce.number()` for form inputs that come as strings

### Image Upload System
- **Multipart uploads**: Formidable-based, production-ready (`src/app/api/upload/route.ts`, `src/app/api/upload/product/route.ts`)
- **Storage**: Local filesystem with bucket organization
  - Products: `/public/uploads/products/` (flat structure)
  - Banners: `/public/uploads/banners/YYYY/MM/` (date-organized)
  - Proofs: `/public/uploads/proofs/YYYY/MM/` (date-organized)
  - Avatars: `/public/uploads/avatars/` (flat structure)
- **Limits**: 
  - General upload: 5MB per file, JPEG/PNG/WebP only
  - Product upload: 6 images max, 5MB per file
  - Avatar upload: 1 file, 2MB max, JPEG/PNG/GIF/WebP
- **URL format**: Returns paths like `/uploads/products/2025/01/product-123.jpg`
- **Workflow**: 
  1. Upload images to `/api/upload?bucket=products` or `/api/upload/product` → get URLs/filenames
  2. Include URLs/filenames in product create/update payload
- **Component**: `ImageUploadZone` provides drag-drop UI with preview/remove
- **Documentation**: See `docs/VPS_DEPLOYMENT_GUIDE.md`, `docs/UPLOAD_MIGRATION_GUIDE.md`

### Database Patterns (Prisma)
- **Relation mode**: `prisma` (for compatibility with serverless DBs)
- **Key models**: User, Product, Category, Order, Cart, Wishlist, Address
- **Include patterns**: Always include related data in queries
  ```typescript
  prisma.product.findMany({ include: { category: true } })
  prisma.order.findMany({ include: { items: { include: { product: true } }, shippingAddress: true } })
  ```
- **Array fields**: `images: String[]`, `sizes: String[]`, `colors: String[]` stored as PostgreSQL arrays
- **Enums**: OrderStatus, PaymentStatus, UserRole defined in schema

### State Management
- **Global state**: React Context API for cart and wishlist (`src/contexts/`)
  - `CartContext`: Syncs with backend via `/api/cart` on auth state change
  - `WishlistContext`: Same pattern for `/api/wishlist`
  - Both debounce updates and show loading states
- **Auth state**: NextAuth's `useSession()` hook
- **Server state**: No React Query - direct fetch calls in components

### AI Integration (Genkit)
- **Setup**: `src/ai/genkit.ts` initializes Google AI plugin with Gemini 2.5 Flash
- **Flows**: Located in `src/ai/flows/`
  - `product-search-flow.ts`: Semantic product search
  - `summarize-product-descriptions.ts`: Description summarization
- **Usage**: Import `ai` instance, call `.run()` or `.stream()` methods

## Development Commands

```bash
npm run dev        # Dev server on port 9002 with Turbopack
npm run build      # Production build (runs prisma generate first)
npm run db:seed    # Seed database with sample data
npm run typecheck  # TypeScript validation without emitting files
```

## Key Files & Conventions

### Types & Interfaces
- **Central types**: `src/lib/types.ts` exports enhanced Prisma types with relations
- **Pattern**: Omit timestamps, add nested relations and computed fields
  ```typescript
  export type Product = Omit<PrismaProduct, 'createdAt' | 'updatedAt'> & {
    category: Category;
    reviews?: Review[];
    averageRating?: number;
  };
  ```

### Component Organization
- **Admin**: `src/components/admin/` - CRUD dialogs and forms
- **Feature**: `src/components/[feature]/` - domain-specific (cart, product, auth)
- **Layout**: `src/components/layout/` - header, footer, navigation
- **UI**: `src/components/ui/` - Radix primitives with Tailwind (shadcn/ui)

### Styling
- **Framework**: Tailwind CSS with custom theme in `tailwind.config.ts`
- **Colors**: Soft peach (#FFDAB9) primary, light coral (#F08080) accents
- **Fonts**: Not currently configured, but blueprint specifies Playfair (headlines) + PT Sans (body)
- **Icons**: Lucide React exclusively
- **Animations**: Framer Motion for interactions

### Error Handling
- **API routes**: Try-catch with specific error types
  ```typescript
  if (error instanceof z.ZodError) return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  ```
- **Client**: Toast notifications via `sonner` library
- **Auth errors**: Thrown as Error in authorize(), caught by NextAuth

## Payment & Orders
- **Gateway**: Razorpay integration (`src/lib/razorpay.ts`)
- **Methods**: Razorpay (online) + COD (cash on delivery)
- **Flow**: Cart → Checkout → Create order → Payment → Update order status
- **Webhook**: `/api/payment/webhook` verifies Razorpay signatures

## Common Gotchas
1. **Form vs API schemas**: Transform form data before POST/PUT (arrays of objects → arrays of strings)
2. **Image URLs**: Upload returns paths starting with `/uploads/`, not full URLs
3. **Auth in API**: Always call `getCurrentUser()` before accessing session, even for public routes with optional auth
4. **Prisma relations**: Must explicitly `include` related data or it won't be returned
5. **Middleware matching**: Routes like `/admin` require trailing `/:path*` in matcher config
6. **Port**: Dev server runs on 9002, not standard 3000

## Testing Patterns
Shell scripts exist for testing upload systems:
- `test-product-images.sh`: Tests multipart product image upload
- `test-upload-system.sh`: General upload endpoint testing

When writing tests, use actual session tokens and FormData for multipart requests.
