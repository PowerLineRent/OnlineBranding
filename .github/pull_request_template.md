## Summary
- 

## Validation
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] Security-relevant changes reviewed

## Git Safety
- [ ] No generated files, secrets, or local environment files committed
- [ ] Migration/data-changing behavior is reversible or documented
- [ ] Branch is up to date with the target branch or conflicts are understood

## Code Review Checklist
- [ ] Logic is correct for normal, edge, and failure paths
- [ ] Inputs are validated at trust boundaries
- [ ] Errors do not leak secrets or sensitive internals
- [ ] Authorization checks protect server-side actions and API routes
- [ ] Performance impact is acceptable
- [ ] Tests cover changed behavior or a test gap is explained

## Security Checklist
- [ ] OWASP Top 10 risks considered
- [ ] Dependencies and lockfile changes are intentional
- [ ] No new credential, token, key, or secret exposure
- [ ] No unsafe dynamic code execution, shell execution, SQL/NoSQL injection, template injection, or XSS vector
