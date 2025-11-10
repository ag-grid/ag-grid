# AG Grid Developer Onboarding Guide

Welcome to the AG Grid team! This guide will help you get up and running with the AG Grid codebase.

## 📚 Table of Contents

- [Welcome](#welcome)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style and Standards](#code-style-and-standards)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## 🎉 Welcome

AG Grid is a fully-featured and highly customizable JavaScript Data Grid with support for React, Angular, and Vue. The project is organized as a monorepo containing community (MIT license) and enterprise (commercial license) packages, along with framework-specific wrappers and comprehensive documentation.

### What You'll Be Working On

- **ag-grid-community**: Core grid features (MIT license)
- **ag-grid-enterprise**: Advanced features (commercial license)
- **Framework Wrappers**: React, Angular, and Vue 3 integrations
- **Documentation**: Astro-based documentation website
- **Testing**: Comprehensive test suites including unit, E2E, and accessibility tests

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js**: v20.19.4 (required)
  ```bash
  node --version  # Should output v20.19.4
  ```

- **Yarn**: v1.22.21 (required)
  ```bash
  yarn --version  # Should output 1.22.21
  ```

- **Git**: Latest version
  ```bash
  git --version
  ```

### Recommended Tools

- **VSCode**: Recommended IDE with workspace settings pre-configured
- **Chrome**: For running E2E tests

### Knowledge Prerequisites

- **TypeScript**: Primary language used throughout the codebase
- **JavaScript (ES2020+)**: Modern JavaScript features
- **CSS/SCSS**: For theming and styling
- **Framework Knowledge** (at least one):
  - React 18+ with Hooks
  - Angular 18+
  - Vue 3+ with Composition API

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ag-grid/ag-grid.git
cd ag-grid
```

### 2. Install Dependencies

```bash
yarn
```

This command runs the bootstrap script and installs all dependencies across the monorepo using Yarn Workspaces.

### 3. Build All Packages

```bash
yarn nx run-many -t build
```

This builds all packages in the correct order. Initial build may take several minutes.

### 4. Verify Setup

Run tests to ensure everything is working:

```bash
yarn nx run-many -t test
```

### 5. Open in VSCode

The repository includes pre-configured VSCode settings:

```bash
code .
```

VSCode will automatically:
- Use Prettier for formatting
- Enable format on save
- Use the workspace TypeScript version
- Apply custom spell check dictionary

## 📁 Project Structure

### Monorepo Architecture

AG Grid uses a **Yarn Workspaces + Nx** monorepo structure:

```
ag-grid/
├── packages/                      # Main publishable packages
│   ├── ag-grid-community/        # Core grid (MIT license)
│   ├── ag-grid-enterprise/       # Enterprise features
│   ├── ag-grid-react/            # React wrapper
│   ├── ag-grid-angular/          # Angular wrapper
│   └── ag-grid-vue3/             # Vue 3 wrapper
├── community-modules/            # Shared community assets
│   ├── locale/                   # i18n translations (35+ languages)
│   └── styles/                   # SCSS themes & styling
├── documentation/                # Documentation website
│   └── ag-grid-docs/            # Astro-based docs site
├── testing/                      # Test suites
│   ├── behavioural/             # Vitest behavioral tests
│   ├── accessibility/           # Axe accessibility tests
│   ├── module-size/             # Bundle size tests
│   ├── react-package-tests/     # Framework package tests
│   ├── angular-package-tests/
│   └── vue-package-tests/
├── plugins/                      # Custom Nx plugins
├── scripts/                      # Build & deployment scripts
└── external/                     # External shared libraries
    └── ag-shared/               # Shared utilities
```

### Key Packages

#### ag-grid-community
Core grid functionality with 35+ feature directories:
- `src/agStack/` - Core grid stack
- `src/api/` - Public API
- `src/columns/` - Column management
- `src/components/` - UI components
- `src/filter/` - Filtering system
- `src/clientSideRowModel/` - Default row model

#### ag-grid-enterprise
Advanced features with modular architecture:
- `src/charts/` - Integrated charting
- `src/rowGrouping/` - Row grouping
- `src/pivot/` - Pivoting
- `src/serverSideRowModel/` - Server-side data
- `src/excelExport/` - Excel export
- And 25+ more enterprise modules

#### Framework Wrappers
- **ag-grid-react**: Hooks-based React components
- **ag-grid-angular**: Angular CLI integration
- **ag-grid-vue3**: Vue 3 Composition API

## 🔧 Development Workflow

### Building Packages

```bash
# Build a specific package
yarn nx build ag-grid-community

# Build with watch mode (auto-rebuild on changes)
yarn nx build ag-grid-community -c watch

# Build all affected packages
yarn nx affected -t build

# Build specific packages
yarn nx run-many -t build -p ag-grid-community ag-grid-react
```

### Build Targets

Each package has multiple build targets:

1. **build:types** - Generate TypeScript declarations
2. **build:package** - Create ESM & CJS bundles
3. **build:umd** - Generate UMD bundles for CDN
4. **build:styles** - Compile CSS from SCSS
5. **build:css** - Generate inline CSS-in-JS

### Running the Development Server

```bash
# Run documentation website locally
yarn nx serve ag-grid-docs

# Visit http://localhost:4321
```

### Working with Nx

Nx is used for task orchestration and caching:

```bash
# Run a specific target for a project
yarn nx <target> <project>

# Run target for multiple projects
yarn nx run-many -t <target>

# Run target only for affected projects
yarn nx affected -t <target>

# View project graph
yarn nx graph

# Clear Nx cache
yarn nx reset
```

### Git Workflow

#### Branching Strategy

- **latest**: Main development branch
- **b[version]**: Release branches (e.g., b34.3.1)
- **Feature branches**: Use descriptive names for PRs

#### Making Changes

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Your descriptive commit message"

# Push to remote
git push -u origin feature/your-feature-name

# Create a PR targeting 'latest' branch
```

## 🧪 Testing

### Test Framework Overview

AG Grid uses multiple testing frameworks:

- **Jest**: Unit tests (community & enterprise packages)
- **Vitest**: Behavioral tests
- **Playwright**: E2E tests
- **Axe**: Accessibility testing

### Running Tests

```bash
# Run unit tests for a package
yarn nx test ag-grid-community

# Run unit tests with watch mode
yarn nx test ag-grid-community --watch

# Run all tests
yarn nx run-many -t test

# Run affected tests only
yarn nx affected -t test

# Run E2E tests
yarn nx test:e2e <test-package>

# Run behavioral tests
yarn nx test testing-behavioural

# Run accessibility tests
yarn nx test testing-accessibility
```

### Writing Tests

#### Unit Tests (Jest)

Unit tests should be co-located with source files:

```typescript
// myFeature.ts
export function myFeature(param: string): string {
    return `Hello ${param}`;
}

// myFeature.test.ts
import { myFeature } from './myFeature';

describe('myFeature', () => {
    it('should return greeting', () => {
        expect(myFeature('World')).toBe('Hello World');
    });
});
```

#### E2E Tests (Playwright)

Located in `testing/*/src/**/*.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('grid renders correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.ag-root')).toBeVisible();
});
```

### Test Best Practices

- Write tests alongside your code
- Use descriptive test names
- Test edge cases and error conditions
- Keep tests fast and isolated
- Mock external dependencies

## 🎨 Code Style and Standards

### Formatting with Prettier

Configuration (`.prettierrc.json`):
- Line width: 120 characters
- Indentation: 4 spaces
- Quotes: Single quotes
- Trailing commas: ES5
- Semi-colons: Always

Format on save is enabled in VSCode. Manual formatting:

```bash
# Check formatting
yarn nx format:check

# Fix formatting
yarn nx format:write
```

### Linting with ESLint

```bash
# Lint a specific package
yarn nx lint ag-grid-community

# Lint all packages
yarn nx run-many -t lint

# Auto-fix issues
yarn nx lint ag-grid-community --fix
```

### TypeScript Guidelines

- Use strict mode (enabled by default)
- Prefer interfaces over types for object shapes
- Use explicit return types for public APIs
- Avoid `any` - use `unknown` if type is truly unknown
- Use const assertions where appropriate

### Code Organization

- Keep files focused and single-purpose
- Organize imports:
  1. External dependencies
  2. Internal ag-grid imports
  3. Relative imports
- Use barrel exports (`index.ts`) for public APIs
- Co-locate tests with source files

### Naming Conventions

- **Files**: camelCase (e.g., `myComponent.ts`)
- **Classes**: PascalCase (e.g., `GridApi`)
- **Interfaces**: PascalCase, prefix with `I` if needed (e.g., `IRowNode`)
- **Functions**: camelCase (e.g., `calculateTotal`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ROWS`)

## 📝 Common Tasks

### Adding a New Feature

1. Create feature branch from `latest`
2. Implement feature in appropriate package
3. Add unit tests
4. Update documentation if needed
5. Run tests and linting
6. Create PR

### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Implement the fix
3. Verify test now passes
4. Check for regressions
5. Create PR with bug description and fix

### Adding a New Package

1. Create package directory in appropriate location
2. Add `package.json` with standard configuration
3. Add `tsconfig.json` extending root config
4. Add build targets in Nx configuration
5. Update workspace references

### Updating Dependencies

```bash
# Update a specific dependency
yarn workspace <package-name> add <dependency>@<version>

# Update root dependency
yarn add -W <dependency>@<version>

# Update dev dependency
yarn add -D -W <dependency>@<version>
```

### Building Documentation

```bash
# Build documentation site
yarn nx build ag-grid-docs

# Serve locally
yarn nx serve ag-grid-docs

# Run link checker
yarn nx link-checker ag-grid-docs
```

### Creating a Release Build

```bash
# Build all packages for production
yarn nx run-many -t build -c production

# Verify bundle sizes
yarn nx test testing-module-size
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

**Issue**: TypeScript compilation errors
```bash
# Solution: Rebuild types first
yarn nx run-many -t build:types
```

**Issue**: Out of memory during build
```bash
# Solution: Increase Node memory
export NODE_OPTIONS="--max-old-space-size=8192"
yarn nx run-many -t build
```

#### Test Failures

**Issue**: Tests fail locally but pass in CI
```bash
# Solution: Clear Nx cache and node_modules
yarn nx reset
rm -rf node_modules
yarn install
```

**Issue**: E2E tests timeout
```bash
# Solution: Increase timeout in test configuration
# or run tests with more time
yarn nx test:e2e --timeout=60000
```

#### Dependency Issues

**Issue**: Conflicting package versions
```bash
# Solution: Use resolutions in root package.json
# Add to package.json:
"resolutions": {
  "package-name": "specific-version"
}
# Then reinstall
yarn install
```

#### IDE Issues

**Issue**: VSCode not recognizing TypeScript paths
```bash
# Solution: Reload VSCode TypeScript server
# Command Palette (Cmd/Ctrl+Shift+P) -> "TypeScript: Reload Project"
```

### Getting Help

If you're stuck:

1. Check existing documentation in `documentation/ag-grid-docs/`
2. Search for similar issues in the codebase
3. Ask team members in your communication channel
4. Refer to the [official documentation](https://www.ag-grid.com/documentation)

## 📚 Resources

### Essential Links

- **Website**: [ag-grid.com](https://www.ag-grid.com)
- **Documentation**: [ag-grid.com/documentation](https://www.ag-grid.com/documentation)
- **GitHub**: [github.com/ag-grid/ag-grid](https://github.com/ag-grid/ag-grid)
- **Community**: [ag-grid.com/community](https://www.ag-grid.com/community)

### Documentation

- `README.md` - Project overview and quick start
- `CONTRIBUTING.md` - Per-framework contribution guidelines
- `SECURITY.md` - Security policy and reporting
- Framework-specific READMEs in each package directory

### Code Quality Tools

- **SonarCloud**: [sonarcloud.io/dashboard?id=ag-grid-community](https://sonarcloud.io/dashboard?id=ag-grid-community)
- **GitHub Actions**: Check `.github/workflows/` for CI/CD pipelines

### Learning Resources

#### Understanding the Grid

1. Start with `packages/ag-grid-community/src/agStack/`
2. Review the public API in `packages/ag-grid-community/src/api/`
3. Explore specific features in their respective directories

#### Framework Integration

- **React**: `packages/ag-grid-react/src/`
- **Angular**: `packages/ag-grid-angular/projects/ag-grid-angular/src/`
- **Vue**: `packages/ag-grid-vue3/src/`

#### Testing Examples

- Unit tests: Throughout the codebase as `*.test.ts`
- E2E tests: `testing/behavioural/src/`
- Accessibility: `testing/accessibility/src/`

### Development Commands Cheat Sheet

```bash
# Setup
yarn                                          # Install dependencies
yarn nx run-many -t build                     # Build all packages

# Development
yarn nx build <package> -c watch              # Watch mode
yarn nx serve ag-grid-docs                    # Run docs locally

# Testing
yarn nx test <package>                        # Run unit tests
yarn nx affected -t test                      # Test affected
yarn nx test:e2e <package>                    # Run E2E tests

# Code Quality
yarn nx lint <package>                        # Lint package
yarn nx format:check                          # Check formatting
yarn nx format:write                          # Fix formatting

# Utilities
yarn nx graph                                 # View project graph
yarn nx reset                                 # Clear cache
yarn nx affected:graph                        # View affected graph
```

### Next Steps

Now that you're set up, here are some suggested next steps:

1. **Explore the codebase**: Start with `packages/ag-grid-community/`
2. **Run examples**: Check out the documentation site locally
3. **Pick a good first issue**: Look for issues labeled "good first issue"
4. **Read contributing guidelines**: Review framework-specific CONTRIBUTING.md
5. **Join the community**: Connect with other developers

Welcome aboard, and happy coding!

---

**Questions or Issues?**

If you encounter any problems with this onboarding guide or have suggestions for improvements, please reach out to your team lead or open an issue in the repository.
