install:
	npm ci

build:
	npm run build

dev:
	npx webpack serve

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix