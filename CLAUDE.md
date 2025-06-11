# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `pnpm run dev` - Run the bot locally with hot reload
- `pnpm install` - Install dependencies
- `pnpm run build` - Build TypeScript to dist/
- `pnpm run start` - Start production build

### Code Quality
- `pnpm run tidy` - Auto-fix code style with XO
- `pnpm run tidy:check` - Check code style without fixing

### Testing
- `pnpm run test` - Run tests (requires .env.test file)
- `pnpm prisma:test db push` - Setup test database

### Database
- `pnpm run prisma db push` - Push schema changes to database
- `pnpm run prisma migrate dev --name=[name]` - Create and run new migration
- `pnpm run prisma generate` - Generate Prisma client
- `pnpm run prisma:test db push` - Setup test database

### Command Conventions
- Use `pnpm run [script]` for package.json scripts
- Use `pnpm exec [command]` for executables not in scripts
- Prisma commands use `pnpm run prisma [args]` wrapper

## Architecture

### Core Components
- **Slack Bot**: Built with @slack/bolt, listens to messages in socket mode
- **Message Processing**: Sequential queue-based processing to handle Slack events
- **Database**: PostgreSQL with Prisma ORM for users, posts, reminders, and formatting rules
- **Commands**: CLI-style commands triggered by @mentions in Slack

### Key Flows
1. **Message Handling**: `listen-to-message.ts` → `map-message-to-action.ts` → `actions.ts`
2. **Command Processing**: Commands are detected by @mention pattern and routed through `command/` directory
3. **Post Management**: Messages create/update PostItems linked to daily Posts per user
4. **Reminders**: Background job checks for users needing handover reminders based on workdays

### Database Schema
- **User**: Slack user info, timezone, reminder settings, workdays
- **Post**: Daily handover posts per user
- **PostItem**: Individual messages/items within a post
- **Reminder**: Reminder messages sent to users
- **Format**: Custom text formatting rules per user

### Environment Setup
Requires `.env` file with Slack tokens, database URL, and OpenAI API key. Use `.env.template` as reference.

### Testing
Tests use Vitest with separate `.env.test` file and test database setup.