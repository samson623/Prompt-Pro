# Contributing to Prompt Enhancer

Thank you for your interest in contributing to Prompt Enhancer! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/prompt-enhancer.git
   cd prompt-enhancer
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in required API keys and database credentials
   - See README.md for detailed setup instructions

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   └── replitAuth.ts     # Authentication setup
├── shared/               # Shared TypeScript types
│   └── schema.ts        # Database schema and types
```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use Prettier for code formatting
- Maintain consistent indentation (2 spaces)

### Database Changes
1. Update schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Update storage interface if needed
4. Add appropriate TypeScript types

### API Development
1. Define routes in `server/routes.ts`
2. Use proper HTTP status codes
3. Validate request data with Zod schemas
4. Handle errors appropriately
5. Add authentication where required

### Frontend Development
1. Use shadcn/ui components when possible
2. Implement responsive design
3. Handle loading and error states
4. Use React Query for data fetching
5. Follow accessibility best practices

### Testing
- Write unit tests for new utilities
- Test API endpoints with various inputs
- Verify responsive design on different screen sizes
- Test authentication flows

## Contribution Types

### Bug Fixes
1. Search existing issues first
2. Create a detailed bug report if needed
3. Include steps to reproduce
4. Reference the issue in your PR

### Feature Requests
1. Open an issue to discuss the feature
2. Get approval before starting development
3. Follow the feature request template
4. Update documentation as needed

### Documentation
- Improve README.md clarity
- Add code comments for complex logic
- Update API documentation
- Fix typos and grammar

## Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clear, focused commits
   - Follow conventional commit format
   - Keep changes small and focused

3. **Test Thoroughly**
   - Test your changes locally
   - Ensure no TypeScript errors
   - Verify functionality works end-to-end

4. **Submit Pull Request**
   - Use descriptive title and description
   - Reference related issues
   - Include screenshots for UI changes
   - Request review from maintainers

## Commit Guidelines

Use conventional commit format:
```
type(scope): description

feat(auth): add password reset functionality
fix(api): handle rate limit errors properly
docs(readme): update installation instructions
style(ui): improve button hover states
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: UI/styling changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Issue Guidelines

### Bug Reports
Include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, OS, etc.)
- Screenshots or error messages

### Feature Requests
Include:
- Clear use case description
- Proposed solution or approach
- Alternative solutions considered
- Additional context or mockups

## Code Review

Reviewers will check for:
- Code quality and readability
- Proper error handling
- Security considerations
- Performance implications
- Documentation updates
- Test coverage

## Getting Help

- Check existing documentation first
- Search closed issues for similar problems
- Ask questions in GitHub Discussions
- Join community Discord (if available)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Prompt Enhancer!
