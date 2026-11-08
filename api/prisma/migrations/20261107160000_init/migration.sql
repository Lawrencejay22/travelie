-- PostGIS powers nearby-discovery queries from milestone week 7 onward
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TRAVELER', 'CONTENT_MANAGER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TRAVELER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "openingHours" TEXT,
    "entranceFee" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "location" geography(Point, 4326),

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationPhoto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "destinationId" TEXT NOT NULL,

    CONSTRAINT "DestinationPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","destinationId")
);

-- CreateTable
CREATE TABLE "_CategoryToDestination" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToDestination_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "City"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "City_countryId_slug_key" ON "City"("countryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- CreateIndex
CREATE INDEX "Destination_cityId_idx" ON "Destination"("cityId");

-- CreateIndex
CREATE INDEX "Destination_isPublished_isFeatured_idx" ON "Destination"("isPublished", "isFeatured");

-- CreateIndex
CREATE INDEX "DestinationPhoto_destinationId_idx" ON "DestinationPhoto"("destinationId");

-- CreateIndex
CREATE INDEX "Favorite_destinationId_idx" ON "Favorite"("destinationId");

-- CreateIndex
CREATE INDEX "_CategoryToDestination_B_index" ON "_CategoryToDestination"("B");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationPhoto" ADD CONSTRAINT "DestinationPhoto_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToDestination" ADD CONSTRAINT "_CategoryToDestination_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToDestination" ADD CONSTRAINT "_CategoryToDestination_B_fkey" FOREIGN KEY ("B") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Keep the geography column in sync with latitude/longitude for PostGIS queries
CREATE INDEX "Destination_location_idx" ON "Destination" USING GIST ("location");

CREATE OR REPLACE FUNCTION sync_destination_location() RETURNS trigger AS $$
BEGIN
  NEW."location" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER destination_location_sync
BEFORE INSERT OR UPDATE OF "latitude", "longitude" ON "Destination"
FOR EACH ROW EXECUTE FUNCTION sync_destination_location();

UPDATE "Destination" SET "latitude" = "latitude";
