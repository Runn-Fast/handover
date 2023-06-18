-- CreateTable
CREATE TABLE "Format" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pattern" TEXT NOT NULL,
    "replacement" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Format_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Format" ADD CONSTRAINT "Format_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
