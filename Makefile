install:
	npm install
	npm build
	npm link
lint:
	npx eslint .
test:
	jest