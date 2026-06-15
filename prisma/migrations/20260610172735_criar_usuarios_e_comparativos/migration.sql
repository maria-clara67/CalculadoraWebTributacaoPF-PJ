-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "profissao" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparativo" (
    "id" SERIAL NOT NULL,
    "profissao" TEXT NOT NULL,
    "tipoCalculoPJ" TEXT NOT NULL,
    "rendaMensal" DECIMAL(10,2) NOT NULL,
    "custosMensais" DECIMAL(10,2) NOT NULL,
    "totalTributosPF" DECIMAL(10,2) NOT NULL,
    "totalTributosPJ" DECIMAL(10,2) NOT NULL,
    "rendaLiquidaPF" DECIMAL(10,2) NOT NULL,
    "rendaLiquidaPJ" DECIMAL(10,2) NOT NULL,
    "melhorOpcao" TEXT NOT NULL,
    "economiaMensal" DECIMAL(10,2) NOT NULL,
    "dadosPF" JSONB NOT NULL,
    "dadosPJ" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Comparativo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Comparativo" ADD CONSTRAINT "Comparativo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
