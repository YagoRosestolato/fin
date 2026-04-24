-- CreateTable
CREATE TABLE "monthly_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "savingsGoal" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "paymentDay" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_configs_userId_month_year_key" ON "monthly_configs"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "monthly_configs" ADD CONSTRAINT "monthly_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
