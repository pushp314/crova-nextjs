# Search Functionality Quick Start Guide

## 🔍 Storefront Search

### Access
Navigate to `/search` or use the search bar in the header.

### Features
- **AI-Powered Search**: Natural language queries like "blue summer dress for women"
- **Filters**:
  - Category selection
  - Price range (min/max)
  - In-stock only
  - Sort by: Relevance, Newest, Price, Name
- **Responsive**: Mobile filter sheet, desktop sidebar

### Example Queries
```
blue shirts for men
summer dresses under 2000
formal wear
cotton t-shirts in stock
```

---

## 🛠️ Admin Search (Requires ADMIN Role)

### Access
Navigate to `/admin/search` from the admin dashboard.

### 1. Product Search

**Filters**:
- Category
- Price range
- Featured only
- In-stock only

**Search By**:
- Product name
- Description
- Product ID

**View**: Table with image, name, ID, category, price, stock, featured status

### 2. Order Search

**Filters**:
- Order status (Pending, Processing, Shipped, Delivered, Cancelled)
- Payment status (Pending, Paid, Failed)
- Payment method (Razorpay, COD)

**Search By**:
- Order ID
- Customer name
- Customer email
- Payment ID

**View**: Table with order details, customer info, payment info, status badges

### 3. User Search

**Filters**:
- Role (USER, ADMIN, DELIVERY)
- Email verification status

**Search By**:
- User name
- Email address

**View**: Table with avatar, name, email, role, verification status, order count

---

## 📱 Mobile vs Desktop

### Mobile
- Filter button with active indicator badge
- Slide-out filter sheet
- Collapsible results

### Desktop
- Fixed sidebar with filters
- Sticky filter panel
- Wide table layouts

---

## 🎯 Tips

1. **Clear Filters**: Use the "Clear Filters" button to reset all filters
2. **Active Filters**: Look for the badge indicator on mobile filter button
3. **Sort Options**: Use sort dropdown to change result ordering
4. **AI Search**: Storefront search understands natural language - be descriptive!
5. **Admin Links**: Click order IDs in order search to view full details

---

## 🔐 Security

- Admin search endpoints require ADMIN role
- Unauthorized access returns 403 Forbidden
- User passwords and sensitive data are excluded from search results

---

## 🐛 Troubleshooting

**No results found**:
- Try removing some filters
- Check spelling
- Use broader search terms

**AI search not working**:
- System automatically falls back to keyword search
- No action needed from user

**Can't access admin search**:
- Verify you have ADMIN role assigned
- Check you're logged in
- Contact system administrator to change role

---

## 📊 API Endpoints

### Public
- `GET /api/search?q=query&category=id&minPrice=100&maxPrice=1000&inStock=true&sortBy=price-asc`

### Admin (Protected)
- `GET /api/admin/search/products?q=query&category=id&featured=true&inStock=true`
- `GET /api/admin/search/orders?q=query&status=PENDING&paymentStatus=PAID`
- `GET /api/admin/search/users?q=query&role=USER&emailVerified=true`

---

## 🚀 Next Steps

After implementing search:
1. Test with various queries
2. Adjust filter options based on user feedback
3. Consider adding pagination for large result sets
4. Monitor AI search performance
5. Add search analytics

For detailed implementation information, see [SEARCH_IMPLEMENTATION.md](./SEARCH_IMPLEMENTATION.md)
