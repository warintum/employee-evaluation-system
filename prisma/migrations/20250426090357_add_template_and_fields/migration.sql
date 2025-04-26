-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "maxScore" DOUBLE PRECISION,
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "description" TEXT,
ADD COLUMN     "gradeA" TEXT,
ADD COLUMN     "gradeB" TEXT,
ADD COLUMN     "gradeC" TEXT,
ADD COLUMN     "gradeD" TEXT,
ADD COLUMN     "gradeE" TEXT,
ADD COLUMN     "maxScore" DOUBLE PRECISION,
ADD COLUMN     "minScore" DOUBLE PRECISION,
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateCategory" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TemplateCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateCategory_templateId_categoryId_key" ON "TemplateCategory"("templateId", "categoryId");

-- AddForeignKey
ALTER TABLE "TemplateCategory" ADD CONSTRAINT "TemplateCategory_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateCategory" ADD CONSTRAINT "TemplateCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
