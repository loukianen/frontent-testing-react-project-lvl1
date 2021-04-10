install:
	npm install
exs:
	pageloader -o /var/tmp __fixture__/hello.txt
publish:
	npm publish --dry-run
lint:
	npx eslint .
test:
	NODE_OPTIONS=--experimental-vm-modules npx jest