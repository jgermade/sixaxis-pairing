#!make
SHELL := env PATH=./node_modules/.bin:$(PATH) /bin/bash -O extglob

.PHONY: install up

install:; npm install
node_modules: install
i: install

up: node_modules
	npm start

build: node_modules
	npm run build
