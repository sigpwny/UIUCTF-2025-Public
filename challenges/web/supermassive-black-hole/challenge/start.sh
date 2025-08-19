#!/bin/sh
python smtp_server.py &
waitress-serve web_server:app
