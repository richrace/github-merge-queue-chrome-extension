build:
	@rm dist/*.zip 2> /dev/null || true
	@mkdir -p dist
	@zip dist/Github\ Merge\ Queue\ Link.zip manifest.json src/* icons/*
