-- CreateEnum
CREATE TYPE "ConversationStyle" AS ENUM ('standard', 'basic', 'humorous', 'british', 'kiwi', 'unhinged');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "conversationStyle" "ConversationStyle" NOT NULL DEFAULT 'standard';
