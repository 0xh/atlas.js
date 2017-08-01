bin := node_modules/.bin/

# Do this when make is invoked without targets
all: compile

compile: install
	$(bin)babel . -q --extensions .es --source-maps both --out-dir .

# In layman's terms: node_modules directory depends on the state of package.json Make will compare
# their timestamps and only if package.json is newer, it will run this target.
# Note about `touch`:
# npm does not update the timestamp of the node_modules folder itself. This confuses Make as it
# thinks node_modules is not up to date and tries to constantly install pacakges. Touching
# node_modules after installation fixes that.
node_modules: package.json
	npm install && \
	$(bin)lerna bootstrap --loglevel success && \
	touch node_modules

install: node_modules

lint:
	$(bin)eslint --ext .es .

test: compile
	$(bin)mocha

test-debug: compile
	$(bin)mocha --inspect --inspect-brk

coverage: compile
	$(bin)nyc $(MAKE) test

clean:
	rm -rf {.nyc_output,coverage,docs}

# Delete all the .js and .js.map files (excluding any potential dotfiles with .js extension)
distclean: clean
	find packages test \
		\( \
			-name '*.js' \
			-or -name '*.js.map' \
		\) \
		-not -path "*/node_modules/*" \
		-not -name '.*.js' \
		-print -delete

pristine: distclean
	rm -rf node_modules packages/*/node_modules

.PHONY: install lint test test-debug clean distclean pristine
