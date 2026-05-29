-- Add paid status to transactions
ALTER TABLE "transactions" ADD COLUMN "paid" BOOLEAN NOT NULL DEFAULT false;
