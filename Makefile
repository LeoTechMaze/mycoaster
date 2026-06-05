.PHONY: up down logs migrate rollback seed psql redis-cli reset

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	cd api && npm run migrate:latest

rollback:
	cd api && npm run migrate:rollback

seed:
	cd api && npm run seeds:run

psql:
	docker compose exec postgres psql -U $${POSTGRES_USER:-coaster} -d $${POSTGRES_DB:-coaster_tracker}

redis-cli:
	docker compose exec redis redis-cli

reset:
	docker compose down -v
	docker compose up -d
	@echo "Waiting for postgres to be ready..."
	@sleep 3
	cd api && npm run migrate:latest
