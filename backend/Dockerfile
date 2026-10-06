# ==========================================
# STAGE 1: Build stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalação de dependências
COPY package*.json ./
RUN npm install

# Geração do cliente Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# Compilação TypeScript
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ==========================================
# STAGE 2: Production runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Instala apenas dependências de produção
COPY package*.json ./
RUN npm install --omit=dev

# Copia schema do Prisma e gera cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copia artefato compilado do estágio anterior
COPY --from=builder /app/dist ./dist

# Usuário sem privilégios de root para segurança
USER node

EXPOSE 3001

# Verificação de integridade (Health Check)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]
