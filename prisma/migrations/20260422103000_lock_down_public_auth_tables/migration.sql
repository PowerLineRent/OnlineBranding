-- Supabase Security Advisor hotfix:
-- Lock down Prisma-managed auth tables in the public schema.
-- This prevents anonymous/authenticated API roles from reading or mutating sensitive data.

REVOKE ALL ON TABLE public."User" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Account" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Session" FROM anon, authenticated;
REVOKE ALL ON TABLE public."VerificationToken" FROM anon, authenticated;
REVOKE ALL ON TABLE public."SsoDomainMapping" FROM anon, authenticated;
REVOKE ALL ON TABLE public."SsoProviderConfig" FROM anon, authenticated;

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SsoDomainMapping" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SsoProviderConfig" ENABLE ROW LEVEL SECURITY;

-- Enforce RLS for table owners too; roles with BYPASSRLS (e.g. service roles) still work.
ALTER TABLE public."User" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."Account" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."Session" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."SsoDomainMapping" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."SsoProviderConfig" FORCE ROW LEVEL SECURITY;
