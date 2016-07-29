### Quick start

1. Install npm dependencies:
  `npm install`
2. Build:
  * dev: `npm run watch`
  * production: `npm run build` 
3. Run:
  * dev: `npm run dev-server`
  * production `npm run start`

### Configuring your dev envirnoment

Create a file in the root called `start.sh` and make it executable `chmod +x start.sh`.
This file is automatically ignore by git and you can use it to start the server instead
of `npm run`.

#### Example

```sh
#!/bin/bash
GOOGLE_ANALYTICS_ID='UA-XXXXXX-1' \
DEBUG_LEVEL='info' \
OAUTH_CLIENT_ID=XXXXXXXXX \
SECRET_OAUTH_CLIENT_ID=XXXXXXXXX \
OAUTH_SECRET=XXXXXXXXX \
PROCESSES=2 \
API_PASS_THROUGH_HEADERS='accept-language' \
STATSD_DEBUG="true" \
npm run dev-server
```
