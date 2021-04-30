install:
	npm install
	npm link
exs:
	page-loader https://sea-battle-nine.vercel.app
lint:
	npx eslint .
test:
	jest