# Mettle - Ship-Readiness Compliance Plan

**Document Version**: 1.1
**Created**: 2025-12-22
**Updated**: 2025-12-22
**Target Completion**: v0.5.0 Release

---

## Sprint 1 Completion Summary

**Status**: ✅ COMPLETE

### Completed Tasks:
- [x] Test infrastructure (Vitest + React Testing Library)
- [x] 76 unit tests for calculations.ts and storage.ts
- [x] Error Boundary component
- [x] Debounced auto-save in HeroContext
- [x] Production logger utility
- [x] All 6 class panel TODOs replaced with functional content
- [x] CombatContext sacrifice TODO documented and resolved

### Files Modified/Created:
- `vitest.config.ts` - Test configuration
- `src/test/setup.ts` - Test setup with mocks
- `src/utils/__tests__/calculations.test.ts` - 55 tests
- `src/utils/__tests__/storage.test.ts` - 21 tests
- `src/components/shared/ErrorBoundary.tsx` - Error boundary
- `src/utils/logger.ts` - Production logging
- `src/context/HeroContext.tsx` - Debounced save
- `src/components/classes/*/View.tsx` - Class panels updated
- `src/components/classes/ClassView.css` - Shared triggered-action styles

---

## Sprint 2 Completion Summary

**Status**: ✅ COMPLETE

### Completed Tasks:
- [x] Custom hook: `useCharacterCreation.ts` - 600+ lines of extracted logic
- [x] Step components: NameStep, CharacteristicsStep, CultureStep, CareerStep, KitStep, LanguagesStep
- [x] Custom hook: `useDiceRolling.ts` - Dice rolling and history management
- [x] Custom hook: `useTurnTracking.ts` - Turn and phase tracking
- [x] Custom hook: `useConditionManagement.ts` - Condition add/remove/update
- [x] Custom hook: `useCharacterManagement.ts` - Export/import/duplicate/delete
- [x] ErrorBoundary applied to CharacterCreation, CharacterDetailsView, AbilitiesView, CombatView
- [x] Logger integrated into themeManager.ts (9 console statements replaced)

### Files Created:
- `src/hooks/useCharacterCreation.ts` - Character creation state/logic
- `src/hooks/useDiceRolling.ts` - Dice rolling hook
- `src/hooks/useTurnTracking.ts` - Turn tracking hook
- `src/hooks/useConditionManagement.ts` - Condition management hook
- `src/hooks/useCharacterManagement.ts` - Character CRUD hook
- `src/hooks/index.ts` - Hook exports
- `src/components/creation/steps/NameStep.tsx`
- `src/components/creation/steps/CharacteristicsStep.tsx`
- `src/components/creation/steps/CultureStep.tsx`
- `src/components/creation/steps/CareerStep.tsx`
- `src/components/creation/steps/KitStep.tsx`
- `src/components/creation/steps/LanguagesStep.tsx`
- `src/components/creation/steps/index.ts`

### Files Modified:
- `src/App.tsx` - Added ErrorBoundary imports and wrapping
- `src/utils/themeManager.ts` - Replaced 9 console calls with logger

---

## Executive Summary

This compliance plan addresses findings from the comprehensive code review to achieve full ship-readiness. Work is organized into 4 phases over an estimated 3-4 development sprints.

---

## Phase 1: Critical Infrastructure (P0)

### 1.1 Test Infrastructure Setup

**Goal**: Establish testing foundation with 40%+ coverage on critical paths.

#### Tasks

| ID | Task | Files Affected | Estimated Effort |
|----|------|----------------|------------------|
| T1.1.1 | Install Vitest, React Testing Library | `package.json` | 15 min |
| T1.1.2 | Configure Vitest for React/TypeScript | `vitest.config.ts` | 30 min |
| T1.1.3 | Add test scripts to package.json | `package.json` | 5 min |
| T1.1.4 | Write tests for `utils/storage.ts` | `src/utils/__tests__/storage.test.ts` | 2 hrs |
| T1.1.5 | Write tests for `utils/calculations.ts` | `src/utils/__tests__/calculations.test.ts` | 1 hr |
| T1.1.6 | Write tests for `HeroContext` | `src/context/__tests__/HeroContext.test.tsx` | 2 hrs |
| T1.1.7 | Write tests for type guards | `src/types/__tests__/hero.test.ts` | 1 hr |
| T1.1.8 | Add CI workflow for tests | `.github/workflows/test.yml` | 30 min |

#### Acceptance Criteria
- [ ] `npm run test` executes successfully
- [ ] Coverage report generated
- [ ] Critical paths tested: storage, calculations, context
- [ ] CI runs tests on PR

---

### 1.2 Complete Class-Specific Panels

**Goal**: Replace all TODO placeholders with functional implementations.

#### Current State

| Class | View File | TODO Location | Status |
|-------|-----------|---------------|--------|
| Censor | `CensorView.tsx` | Line 80 - Judgment Actions | ✅ Complete |
| Conduit | `ConduitView.tsx` | Line 92 - Prayer Mechanics | ✅ Complete |
| Elementalist | `ElementalistView.tsx` | Line 103 - Persistent Effects | ✅ Complete |
| Shadow | `ShadowView.tsx` | Line 106 - Hesitation Is Weakness | ✅ Complete |
| Tactician | `TacticianView.tsx` | Line 105 - Mark Effects | ✅ Complete |
| Talent | `TalentView.tsx` | Line 106 - Strain Mechanics | ✅ Complete |
| Summoner | `SummonerView.tsx` | N/A | ✅ Complete |

#### Tasks

| ID | Task | Reference Implementation | Estimated Effort |
|----|------|-------------------------|------------------|
| T1.2.1 | Implement Censor Pronouncements Panel | Use SummonerView as template | 3 hrs |
| T1.2.2 | Implement Conduit Prayers Panel | Use SummonerView as template | 3 hrs |
| T1.2.3 | Implement Elementalist Persistent Effects | Use SummonerView as template | 3 hrs |
| T1.2.4 | Implement Shadow Techniques Panel | Use SummonerView as template | 3 hrs |
| T1.2.5 | Implement Tactician Commands Panel | Use SummonerView as template | 3 hrs |
| T1.2.6 | Implement Talent Psionic Abilities Panel | Use SummonerView as template | 3 hrs |
| T1.2.7 | Fix CombatContext sacrifice TODO | `src/context/CombatContext.tsx:464` | 1 hr |

#### Acceptance Criteria
- [ ] All 10 classes have functional detail panels
- [ ] No TODO comments remain in view components
- [ ] Each panel follows established patterns from SummonerView

---

## Phase 2: Code Quality (P1)

### 2.1 Refactor Large Components

**Goal**: Break down monolithic components for maintainability.

#### CharacterCreation.tsx Refactor (1,730 lines → ~200 lines per file)

| ID | New Component | Lines to Extract | Location |
|----|---------------|------------------|----------|
| T2.1.1 | `NameStep.tsx` | ~50 | `src/components/creation/steps/` |
| T2.1.2 | `ClassStep.tsx` | ~100 | `src/components/creation/steps/` |
| T2.1.3 | `SubclassStep.tsx` | ~150 | `src/components/creation/steps/` |
| T2.1.4 | `AncestryStep.tsx` | ~100 | `src/components/creation/steps/` |
| T2.1.5 | `CultureStep.tsx` | ~150 | `src/components/creation/steps/` |
| T2.1.6 | `CareerStep.tsx` | ~100 | `src/components/creation/steps/` |
| T2.1.7 | `KitStep.tsx` | ~100 | `src/components/creation/steps/` |
| T2.1.8 | `CharacteristicsStep.tsx` | ~150 | `src/components/creation/steps/` |
| T2.1.9 | `useCharacterCreation.ts` hook | ~300 | `src/hooks/` |
| T2.1.10 | Update `CharacterCreation.tsx` to use new components | - | - |

#### App.tsx Refactor (648 lines → ~250 lines)

| ID | New Hook/Component | Purpose |
|----|-------------------|---------|
| T2.1.11 | `useCharacterManagement.ts` | Export/Import/Delete/Duplicate handlers |
| T2.1.12 | `useDiceRolling.ts` | Roll handlers and history |
| T2.1.13 | `useTurnTracking.ts` | Combat turn state |
| T2.1.14 | `useConditionManagement.ts` | Condition add/remove/update |

---

### 2.2 Add Error Boundaries

| ID | Task | Location |
|----|------|----------|
| T2.2.1 | Create `ErrorBoundary` component | `src/components/shared/ErrorBoundary.tsx` |
| T2.2.2 | Create `ErrorFallback` UI component | `src/components/shared/ErrorFallback.tsx` |
| T2.2.3 | Wrap CharacterCreation | `App.tsx` |
| T2.2.4 | Wrap CombatView | `App.tsx` |
| T2.2.5 | Wrap AbilitiesView | `App.tsx` |
| T2.2.6 | Add error recovery actions | `ErrorFallback.tsx` |

---

### 2.3 Debounce Auto-save

**Current Issue**: `HeroContext.tsx:83-87` saves on every hero state change.

```typescript
// BEFORE (current)
useEffect(() => {
  if (hero) {
    saveCharacter(hero);
  }
}, [hero]);

// AFTER (debounced)
useEffect(() => {
  if (!hero) return;

  const timeoutId = setTimeout(() => {
    saveCharacter(hero);
  }, 500);

  return () => clearTimeout(timeoutId);
}, [hero]);
```

| ID | Task | Estimated Effort |
|----|------|------------------|
| T2.3.1 | Create `useDebouncedSave` hook | 30 min |
| T2.3.2 | Update HeroContext to use debounced save | 15 min |
| T2.3.3 | Add manual save trigger for critical operations | 15 min |
| T2.3.4 | Test auto-save behavior | 30 min |

---

## Phase 3: Production Hardening (P2)

### 3.1 Replace Console Statements

**Current State**: 28 console statements across the codebase.

| ID | Task | Files Affected |
|----|------|----------------|
| T3.1.1 | Create `utils/logger.ts` with log levels | New file |
| T3.1.2 | Replace console.error in storage.ts | 5 occurrences |
| T3.1.3 | Replace console.warn in themeManager.ts | 7 occurrences |
| T3.1.4 | Replace console.error in hooks | 6 occurrences |
| T3.1.5 | Replace console.warn in components | 4 occurrences |
| T3.1.6 | Add environment-based log filtering | `logger.ts` |

#### Logger Implementation

```typescript
// src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL: LogLevel = import.meta.env.PROD ? 'warn' : 'debug';

export const logger = {
  debug: (msg: string, ...args: unknown[]) => { /* ... */ },
  info: (msg: string, ...args: unknown[]) => { /* ... */ },
  warn: (msg: string, ...args: unknown[]) => { /* ... */ },
  error: (msg: string, ...args: unknown[]) => { /* ... */ },
};
```

---

### 3.2 Performance Optimization

| ID | Task | Target Component | Rationale |
|----|------|------------------|-----------|
| T3.2.1 | Add React.memo | `AbilityCard.tsx` | Rendered in lists |
| T3.2.2 | Add React.memo | `MinionCard.tsx` | Rendered in lists |
| T3.2.3 | Add React.memo | `SquadTracker.tsx` | Complex re-renders |
| T3.2.4 | Add useMemo for filtered abilities | `AbilitiesView.tsx` | Computed on each render |
| T3.2.5 | Profile with React DevTools | All views | Identify bottlenecks |

---

## Phase 4: Documentation & Polish

### 4.1 Code Documentation

| ID | Task | Priority |
|----|------|----------|
| T4.1.1 | Add JSDoc to `types/hero.ts` exports | High |
| T4.1.2 | Add JSDoc to `utils/calculations.ts` | High |
| T4.1.3 | Add JSDoc to `utils/storage.ts` | High |
| T4.1.4 | Document context providers | Medium |
| T4.1.5 | Add inline comments to complex logic | Medium |

### 4.2 Project Documentation

| ID | Task | File |
|----|------|------|
| T4.2.1 | Update README with architecture overview | `README.md` |
| T4.2.2 | Create CONTRIBUTING.md | `CONTRIBUTING.md` |
| T4.2.3 | Document type system | `docs/TYPE_SYSTEM.md` |
| T4.2.4 | Add component storybook (optional) | `/.storybook/` |

---

## Implementation Schedule

### Sprint 1 (Week 1-2): Foundation
- [ ] T1.1.1 - T1.1.8: Test Infrastructure
- [ ] T2.3.1 - T2.3.4: Debounce Auto-save
- [ ] T2.2.1 - T2.2.2: Error Boundary Components

### Sprint 2 (Week 3-4): Class Completion
- [ ] T1.2.1 - T1.2.7: All Class Panels
- [ ] T2.2.3 - T2.2.6: Apply Error Boundaries

### Sprint 3 (Week 5-6): Refactoring
- [ ] T2.1.1 - T2.1.10: CharacterCreation Refactor
- [ ] T2.1.11 - T2.1.14: App.tsx Refactor

### Sprint 4 (Week 7-8): Hardening
- [ ] T3.1.1 - T3.1.6: Logging
- [ ] T3.2.1 - T3.2.5: Performance
- [ ] T4.1.1 - T4.2.4: Documentation

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Test Coverage | 0% | 40%+ | `vitest --coverage` |
| TODO Comments | 8 | 0 | `grep -r "TODO" src/` |
| Console Statements | 28 | 0 | `grep -r "console\." src/` |
| Large Files (>500 lines) | 3 | 0 | `wc -l` audit |
| Error Boundaries | 0 | 3+ | Code review |
| Class Panel Completion | 3/10 | 10/10 | Manual review |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Class panel complexity underestimated | Medium | High | Start with simplest class (Shadow) |
| Refactoring introduces regressions | Medium | High | Write tests BEFORE refactoring |
| Auto-save debounce causes data loss | Low | High | Keep manual save on critical paths |
| Breaking changes to Hero type | Low | Medium | Run full build after each change |

---

## Approval & Sign-off

- [ ] Engineering Lead Approval
- [ ] Code Review Complete
- [ ] All Tests Passing
- [ ] Documentation Updated
- [ ] Version Bumped to 0.5.0

---

*This document should be updated as work progresses. Mark tasks complete and update metrics after each sprint.*
