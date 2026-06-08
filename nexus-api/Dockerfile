# Estágio de construção e execução
FROM node:22-alpine

# Instalar dependências necessárias para o Prisma e Sharp (se usar)
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências e limpar cache para reduzir tamanho
RUN npm install && npm cache clean --force

# Copiar todo o código fonte
COPY . .

# Gerar o Prisma Client (importante para o banco de dados)
RUN npx prisma generate

# Criar o build de produção
RUN npm run build

# Expor a porta da API
EXPOSE 3000

# Rodar a aplicação
CMD ["npm", "run", "start:prod"]