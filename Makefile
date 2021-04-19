install:
	npm install
	npm link
exs:
	page-loader https://sea-battle-nine.vercel.app
lint:
	npx eslint --ext js --ext mjs .
test:
	NODE_OPTIONS=--experimental-vm-modules npx jest