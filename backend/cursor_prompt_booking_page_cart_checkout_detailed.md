```
PROMPT FOR CURSOR (paste this as a single prompt into Cursor)

---
Goal
---
Enhance the existing **React + Django** booking application to deliver a polished, production-level booking experience inspired by leading travel booking sites. The task includes improving the **Booking Page**, and implementing a fully functional **Cart/Basket** and **Checkout Page**. When a user adds an appointment to the cart, show a confirmation (mini-cart / toast / drawer) and redirect them to the Checkout page if appropriate. The final result should feel like a complete, working site — visually refined, responsive, and bug-free.

---
Context & assumptions
---
- Frontend: React + TypeScript + Tailwind CSS.
- Backend: Django REST Framework (DRF) providing JSON APIs.
- Use Django for backend endpoints (cart, checkout, availability), and React for all UI/UX.
- Cart should persist on the frontend (localStorage) and sync with Django via REST endpoints.
- Cursor should first analyze the current codebase and outline a step-by-step enhancement plan before implementing changes.

---
Deliverables
---
1. **Implementation plan** — list components, routes, API contracts, and UI/UX decisions.
2. **Enhanced Booking Page** with refined layout, improved visuals, and better user flow.
3. **Add-to-Cart flow** (toast/drawer confirmation + redirect option).
4. **Cart Page** displaying selected appointments, prices, and totals.
5. **Checkout Page** with form validation, order summary, and mock or real payment flow.
6. **Client-side cart state management** (React Context or Zustand) synced with Django backend.
7. **Backend Django APIs** (if missing) for cart and checkout endpoints.
8. **Responsiveness and accessibility** improvements across all pages.
9. **Unit tests** for frontend logic (React Testing Library) and **Django API tests** (pytest or Django test framework).

---
Functional requirements
---
- User can add appointments to the cart from the booking page.
- Adding to cart triggers a visible success state (drawer or toast) with actions: [View Cart] [Go to Checkout].
- Appointments persist between reloads (localStorage) and sync with backend cart endpoints.
- Checkout collects contact details (name, email, phone) and confirms booking with backend.
- UI shows a confirmation page after successful booking.
- Prevent duplicate or expired appointments from being added.

---
Visual & UX requirements
---
- Design inspired by major booking platforms (Booking.com, Expedia, Airbnb): clean layout, clear typography, card-based visuals.
- Responsive breakpoints: 640px (mobile), 768px (tablet), 1024px+ (desktop).
- Smooth animations for cart drawer/toast (Framer Motion or CSS transitions).

---
Backend API contracts (Django REST Framework)
---
Endpoints to be verified or created:
- `GET /api/cart/` → { cart }
- `POST /api/cart/items/` → { cart }
- `DELETE /api/cart/items/<id>/` → { cart }
- `POST /api/checkout/` → { orderId, status }
- `POST /api/availability/check/` → { available: boolean }

Models (simplified):
```python
class Appointment(models.Model):
    title = models.CharField(max_length=255)
    provider = models.ForeignKey(User, on_delete=models.CASCADE)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField(null=True, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=5, default='USD')

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    items = models.ManyToManyField(Appointment, through='CartItem')

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
```

---
Frontend implementation details
---
**React Components:**
- `BookingPage.tsx` — main page showing appointments and booking cards.
- `AddToCartButton.tsx` — handles cart actions and feedback.
- `MiniCartDrawer.tsx` — shows cart preview after adding items.
- `CartPage.tsx` — full cart view with summary and actions.
- `CheckoutPage.tsx` — collects user info, confirms checkout.
- `CartContext.tsx` — global cart state synced with backend.
- `api.ts` — Axios/fetch wrappers for Django endpoints.

**TypeScript interfaces:**
```ts
interface Appointment { id: number; title: string; startAt: string; endAt?: string; price: number; currency: string; }
interface CartItem { id: number; appointmentId: number; title: string; price: number; qty: number; }
interface Cart { id?: number; items: CartItem[]; subtotal: number; total: number; }
interface CheckoutPayload { cartId?: number; contact: { name: string; email: string; phone: string; }; }
```

---
Testing
---
**Frontend:** Jest + React Testing Library for add-to-cart, redirect, and cart persistence.
**Backend:** Django tests for cart endpoints and checkout flow.
**Optional:** Cypress/Playwright for E2E (React + Django running together).

---
Acceptance criteria
---
- Booking → Add to Cart → Checkout → Confirmation flow works seamlessly.
- API integration tested locally with Django dev server.
- No UI errors, broken layouts, or missing states.
- Cart persists and syncs properly.
- All code strongly typed and documented.

---
Instructions to Cursor assistant
---
- Analyze the current repo first, identify missing components/APIs.
- Propose a 5–7 step plan before implementing.
- Build iteratively and validate UI/UX consistency.
- Take time to think — ensure the solution feels like a real-world booking platform.

---
Final deliverable
---
A production-ready, visually refined, React + Django booking system with a complete cart and checkout experience — matching the polish of famous booking websites.
```

