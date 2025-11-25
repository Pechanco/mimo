# CLAUDE.md - AI Assistant Guide for mimo

This file provides guidance for AI assistants (like Claude) working on the mimo repository.

## Project Overview

**Repository:** Pechanco/mimo
**Status:** New repository (initial setup)

> **Note:** This is a newly initialized repository. Update this section as the project evolves with:
> - Project purpose and goals
> - Target users/audience
> - Key features and capabilities

## Repository Structure

```
mimo/
├── CLAUDE.md          # This file - AI assistant guidance
├── README.md          # Project documentation (to be created)
├── src/               # Source code (to be created)
├── tests/             # Test files (to be created)
├── docs/              # Documentation (to be created)
└── .github/           # GitHub workflows (to be created)
```

> Update this structure diagram as the codebase grows.

## Development Workflow

### Branch Naming Convention

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Documentation: `docs/<description>`
- Claude AI branches: `claude/<session-id>`

### Commit Message Format

Use clear, descriptive commit messages:
```
<type>: <short description>

[optional body with more details]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Pull Request Process

1. Create a feature branch from main
2. Make changes and commit with clear messages
3. Push to remote and create a PR
4. Ensure all tests pass
5. Request review if needed
6. Merge after approval

## Code Conventions

### General Guidelines

- Write clear, self-documenting code
- Keep functions small and focused (single responsibility)
- Use meaningful variable and function names
- Add comments only for complex logic, not obvious code
- Follow the DRY principle (Don't Repeat Yourself)

### File Organization

- Group related functionality together
- Keep files focused and not too large
- Use consistent naming conventions for files

## Testing Guidelines

- Write tests for new functionality
- Maintain good test coverage
- Run tests before committing
- Test edge cases and error conditions

## Common Tasks

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd mimo

# Install dependencies (update as needed)
# npm install / pip install -r requirements.txt / etc.
```

### Running Tests

```bash
# Add test commands here as they are configured
```

### Building/Running

```bash
# Add build/run commands here as they are configured
```

## AI Assistant Guidelines

### When Working on This Repository

1. **Read First**: Always read existing code before making changes
2. **Minimal Changes**: Make only the changes requested; avoid over-engineering
3. **Preserve Style**: Match existing code style and conventions
4. **Test Impact**: Consider how changes affect existing functionality
5. **Document Changes**: Update documentation when adding features

### Do Not

- Add unnecessary dependencies
- Create files that aren't needed
- Make changes beyond the scope of the request
- Skip reading relevant existing code
- Introduce security vulnerabilities

### File Handling

- Prefer editing existing files over creating new ones
- Delete unused code completely (no commented-out code)
- Keep files focused on their purpose

### Security Considerations

- Never commit secrets or credentials
- Validate user input at system boundaries
- Follow OWASP guidelines for web applications
- Use parameterized queries for database access

## Environment Variables

Document environment variables as they are added:

| Variable | Description | Required |
|----------|-------------|----------|
| _TBD_    | _TBD_       | _TBD_    |

## Dependencies

List major dependencies as they are added:

| Package | Purpose | Version |
|---------|---------|---------|
| _TBD_   | _TBD_   | _TBD_   |

## Troubleshooting

Document common issues and solutions as they arise:

### Issue: _Template_

**Symptoms:** _Description_
**Solution:** _Steps to resolve_

---

## Changelog

Track significant updates to this CLAUDE.md file:

- **2025-11-25**: Initial creation of CLAUDE.md for new repository

---

> **Maintenance Note:** Keep this file updated as the project evolves. Add specific commands, conventions, and guidelines as they are established.
