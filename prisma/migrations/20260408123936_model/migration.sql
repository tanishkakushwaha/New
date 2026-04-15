-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invitedUsers" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
