all:
	@echo "Building all..."
	cd popup && npm install && npm run build
	cd background && npm install && npm run build

dev:
	@echo "Starting development mode..."
	cd popup && npm run watch-build