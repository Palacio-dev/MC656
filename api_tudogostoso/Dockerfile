FROM ghcr.io/puppeteer/puppeteer:latest

# Volta para root para instalar dependências
USER root

WORKDIR /app

# Copiar package.json primeiro (boa prática de cache)
COPY package.json package-lock.json ./

# Dar permissão ao diretório
RUN mkdir -p /app/node_modules && \
    chown -R pptruser:pptruser /app

# Instalar dependências como o usuário correto
USER pptruser
RUN npm install

# Copiar o restante do código
COPY --chown=pptruser:pptruser . .

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]
