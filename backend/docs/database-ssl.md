# Database SSL/TLS Examples

NEXUS currently uses MySQL locally for the XAMPP/phpMyAdmin workflow. If you move the backend to a managed PostgreSQL provider in production, the backend enforces `sslmode=require` on PostgreSQL `DATABASE_URL` values.

## Supabase PostgreSQL

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

## Railway PostgreSQL

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST].railway.app:5432/railway?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://postgres:[PASSWORD]@[HOST].railway.app:5432/railway?sslmode=require
```

## Render PostgreSQL

```env
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST].oregon-postgres.render.com/[DATABASE]?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://[USER]:[PASSWORD]@[HOST].oregon-postgres.render.com/[DATABASE]?sslmode=require
```

For local XAMPP/phpMyAdmin MySQL development, keep using your MySQL URL without `sslmode=require`.
