#!make
# SHELL := env PATH=./node_modules/.bin:$(PATH) /bin/bash -O extglob

.PHONY: install up

install:; npm install
node_modules:; npm install
i: install

up: node_modules
	npm start

build: node_modules
	npm run build

preview: node_modules
	npm run preview