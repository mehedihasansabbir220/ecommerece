# Advanced E-commerce API Project

## Project Structure
```
ecommerce-api/
│
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── environment.ts
│   │   └── logger.ts
│   │
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── category.model.ts
│   │   ├── order.model.ts
│   │   ├── review.model.ts
│   │   └── wishlist.model.ts
│   │
│   ├── controllers/
│   │   ├── user.controller.ts
│   │   ├── product.controller.ts
│   │   ├── order.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── review.controller.ts
│   │   └── analytics.controller.ts
│   │
│   ├── routes/
│   │   ├── user.routes.ts
│   │   ├── product.routes.ts
│   │   ├── order.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── review.routes.ts
│   │   └── analytics.routes.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── payment.service.ts
│   │   ├── email.service.ts
│   │   ├── search.service.ts
│   │   └── notification.service.ts
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   │
│   └── app.ts
│
├── tests/
│   ├── user.test.ts
│   ├── product.test.ts
│   └── order.test.ts
│
├── package.json
├── tsconfig.json
├── .env
└── README.md
```
