.PHONY: help install dev build preview lint format check gacp

# Default target - show help
.DEFAULT_GOAL := help

## Help:
help: ## Show this help message
	@printf "\n\033[1mUsage:\033[0m make \033[36m<target>\033[0m\n"
	@awk 'BEGIN {FS = ":.*##"; section=""} \
		/^## [A-Za-z]/ { section=substr($$0, 4); next } \
		/^[a-zA-Z0-9_-]+:.*##/ { \
			if (section != "") { printf "\n\033[1m%s\033[0m\n", section; section="" } \
			printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 \
		}' $(MAKEFILE_LIST)
	@printf "\n"

## Dev:
install: ## Install dependencies
	bun install

dev: ## Start the development server on port 4567
	bun run dev

build: ## Build for production
	bun run build

preview: build ## Build and preview the production build on port 4567
	bun run preview

## Quality:
lint: ## Run Prettier check and ESLint
	bun run lint

format: ## Format with Prettier
	bun run format

check: ## Run svelte-check type checking
	bun run check

## Git:
gacp: ## Git add, commit, push (Usage: make gacp M="type(scope): message")
	git add -A && git commit -m "$(M)" && git push
