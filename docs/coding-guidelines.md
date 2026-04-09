# Coding Guidelines

## Formatting

- Use 2-space indentation for JavaScript and JSON files.
- Use single quotes for strings.
- Always include semicolons at the end of statements.
- Keep lines to a reasonable length (120 characters max).
- Use trailing commas in multi-line arrays and objects.

## Import Organization

- Group imports in the following order, separated by a blank line:
  1. External/third-party modules (e.g., `react`, `express`)
  2. Internal modules and components
  3. Styles and assets

## Linting

- Use **ESLint** to enforce consistent code style and catch potential issues.
- All code must pass linting before committing.
- Do not disable lint rules without a documented reason.

## Best Practices

- **DRY (Don't Repeat Yourself)** — Extract shared logic into reusable functions or components rather than duplicating code.
- Use meaningful, descriptive names for variables, functions, and components.
- Keep functions small and focused on a single responsibility.
- Prefer `const` over `let`; avoid `var`.
- Use arrow functions for callbacks and anonymous functions.
- Handle errors appropriately — do not silently swallow exceptions.
