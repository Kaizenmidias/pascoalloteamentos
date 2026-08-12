# Pascoal Loteamentos — nova aplicação

Fundação Laravel + React + Inertia.js + Tailwind CSS da reconstrução do site. O WordPress na pasta pai é somente uma fonte de referência e não é modificado pela aplicação.

## Requisitos

- PHP 8.3+ com `fileinfo` e `pdo_mysql`;
- Composer;
- Node.js 22+ e npm;
- MySQL 8+.

## Instalação local

```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan pascoal:create-admin admin@exemplo.com
npm install
npm run dev
php artisan serve
```

Configure antes as credenciais `DB_*` no `.env`. O alvo da aplicação é MySQL; a suíte automatizada usa SQLite em memória apenas para testes rápidos das migrations e relações.

## Verificações

```bash
php artisan test
npm run build
php artisan wordpress:inspect
php artisan wordpress:verify
php artisan wordpress:import-properties
```

Todos os comandos `wordpress:import-*` permanecem em dry-run nesta fase. O uso de `--commit` é intencionalmente bloqueado até que os mappers sejam homologados.

Consulte `docs/DESIGN_TOKENS.md` para a origem dos tokens visuais e `../IMPLEMENTATION_STATUS.md` para o estado da etapa.
