install:
	npm install
	npm build
	npm link
lint:
	npx eslint .
test:
	DEBUG=axios,page-loader jest