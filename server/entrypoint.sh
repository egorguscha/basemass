#!/bin/bash
cd orbitez-server && npm i && NODE_ENV=production CONTRACT_ADDRESS=${CONTRACT_ADDRESS} SERVER_NAME=${SERVER_NAME} node src/index.js