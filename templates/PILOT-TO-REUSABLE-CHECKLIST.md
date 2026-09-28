# Pilot → Reusable Pattern Checklist

Use this checklist whenever a KERSAA pilot, Devina experiment, research tool, or technical prototype becomes useful enough to preserve.

## Pilot evidence

- [ ] Problem / hypothesis stated clearly
- [ ] Minimum success condition defined
- [ ] Scope exclusions recorded
- [ ] Minimal working implementation exists
- [ ] Synthetic test completed
- [ ] End-to-end path verified
- [ ] Test data cleaned up

## Operational knowledge

- [ ] Required APIs documented
- [ ] Required permissions documented
- [ ] Runtime/service account documented by role, not hard-coded identity
- [ ] OAuth scopes documented
- [ ] Environment variables documented
- [ ] Deployment assumptions documented
- [ ] Failure modes documented
- [ ] Resolved incidents documented
- [ ] Reproduction checklist written

## Reusable extraction

Choose one:

- [ ] Extract
- [ ] Keep Local
- [ ] Defer
- [ ] Retire

If **Extract**:

- [ ] Remove production IDs
- [ ] Remove secrets and credentials
- [ ] Remove personal/client/learner data
- [ ] Remove domain-specific logic that is not reusable
- [ ] Replace configuration with environment variables/placeholders
- [ ] Add README with purpose / best use cases
- [ ] Add setup guide
- [ ] Add troubleshooting guide
- [ ] Record provenance
- [ ] Record limitations
- [ ] Add search vocabulary / topics

## Adoption back into production

When a reusable starter is adopted by KERSAA or another project:

- [ ] Copy/fork the generic pattern
- [ ] Reintroduce project-specific schema and rules
- [ ] Apply project governance
- [ ] Configure production identities and permissions separately
- [ ] Run a fresh synthetic test
- [ ] Verify persisted/observable final result
- [ ] Back-port generic improvements when worthwhile

## Principle

**A project should leave behind more than an output. It should leave behind reusable knowledge.**
