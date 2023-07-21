-- AlterTable
ALTER TABLE "User" ADD COLUMN     "workdays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[];
