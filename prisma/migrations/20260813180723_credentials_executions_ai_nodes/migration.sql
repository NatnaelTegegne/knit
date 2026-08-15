-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('OPENAI', 'ANTHROPIC', 'GOOGLE_GEMINI', 'DISCORD_WEBHOOK', 'SLACK_WEBHOOK', 'API_KEY');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'OPENAI';
ALTER TYPE "NodeType" ADD VALUE 'ANTHROPIC';
ALTER TYPE "NodeType" ADD VALUE 'GOOGLE_GEMINI';
ALTER TYPE "NodeType" ADD VALUE 'DISCORD';
ALTER TYPE "NodeType" ADD VALUE 'SLACK';

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "credentialId" TEXT;

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CredentialType" NOT NULL,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "triggerType" TEXT,
    "output" JSONB,
    "error" TEXT,
    "stack" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Credential_userId_idx" ON "Credential"("userId");

-- CreateIndex
CREATE INDEX "Execution_workflowId_startedAt_idx" ON "Execution"("workflowId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "Execution_userId_startedAt_idx" ON "Execution"("userId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "Node_credentialId_idx" ON "Node"("credentialId");

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
