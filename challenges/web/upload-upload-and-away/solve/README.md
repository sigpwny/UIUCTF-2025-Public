# Spoilers...

- `"concurrently \"tsc -w\" \"nodemon dist/index.js\""` causes tsc to run whenever a .ts file is uploaded into images/.

- When tsc is run successfully, it writes to dist/index.js which triggers nodemon to reload the server. When tsc fails, it does not emit any output because of "noEmitOnError": true, so nodemon does not reload the server.

- This causes an information leak, you can upload a file that uses typescript to check if your flag guess is correct, then error if it is. This will reload the page causing the file_count to go to 0 and which can be detected.
