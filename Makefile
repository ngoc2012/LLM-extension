all:
	@echo "Building all..."
	cd popup && npm install && npm run build
	cd background && npm install && npm run build