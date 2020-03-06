# node-bunq-balance <!-- omit in toc -->

- [Screenshot](#screenshot)
- [Details](#details)
  - [What does it do?](#what-does-it-do)
  - [Who is it for?](#who-is-it-for)
- [Setup](#setup)
- [Installation](#installation)
  - [Copy volume data](#copy-volume-data)
  - [Create encryption key](#create-encryption-key)
  - [Create accounts.js](#create-accountsjs)
  - [Run the container](#run-the-container)
  - [docker-compose](#docker-compose)
- [Ready, set, GO!](#ready-set-go)
- [To Do's](#to-dos)

## Screenshot

![alt text][screenshot]

## Details

### What does it do?

It shows the current account balance for a given account along with the 5 most recent transactions for your Bunq account.

### Who is it for?

I made this simple app so my kids can view their current account balance (when they get their allowance) so they don't have to depend on getting their hands on my mobile phone.

## Setup

In your Bunq app generate a unique API key to use with **bunq-balance**. The key can be created in the app by going to **Profile >> Security & Settings >> Developers >> API Keys**. Once you use your API key for the first time it will set the allowed IP address you have provided during the steps that follow. The API key will then be set to be used by (only) the **node-bunq-balance** app.

## Installation

### Copy volume data

The container uses a data volume to store the demo account and user accounts. These files need to be copied to a location on the Docker host prior running the container for the first time. Choose a suitable location for the data on the host and create the folder.

To assist with copying the files you can use the **scripts/copy-data.sh** script in the repository. The example below assumes `/opt/bunq-balance` as the location for the host mounted volume.

```bash
# Create the host mounted volume folder
mkdir -p /opt/bunq-balance
# Enter the newly created folder
cd /opt/bunq-balance
# Download the helper script
curl --silent --output copy-data.sh -L "https://raw.githubusercontent.com/updev-it/node-bunq-balance/master/scripts/copy-data.sh?$(date +%s)" && sudo chmod 0755 copy-data.sh
# Execute the helper script
./data-copy.sh
# Remove the helper script
rm -rf data-copy.sh
```

### Create encryption key

Create a unique encryption key:

```bash
docker run --rm qnimbus/docker-bunq-balance:latest yarn create_encryption_key
```

Use the generated encryption key in the `docker run` command or in the `docker-compose` script below to encrypt the **storage.json** file.

### Create accounts.js

Modify the `/opt/bunq-balance/accounts.example.js` file and save it as `/opt/bunq-balance/accounts.js`. You need to specify the user friendly name for each allowed Bunq account that you want to access using the web interface. e.g. :

```js
const accounts = {
  hypotheek: '12345',
  sparen: '67890'
};

export { accounts };
```

\* _Note: To retrieve your account ID's you can run `docker run --rm -e ENCRYPTION_KEY=<YOUR_ENCRYPTION_KEY> qnimbus/docker-bunq-balance:latest yarn get_accounts`. Just make sure you have activated your API key prior to running this command_

### Run the container

```bash
docker run --name bunq-balance -v /opt/bunq-balance:/usr/src/app/dist/public/accounts -p 3000:8080 -e API_KEY=<YOUR_BUNQ_API_KEY> -e ALLOWED_ACCOUNTS=<12345,67890,etc> -e LISTENINGADDRESS=0.0.0.0 -e ENCRYPTION_KEY=<YOUR_ENCRYPTION_KEY> -e ALLOWED_IPS=<YOUR_PUBLIC_IP> -d qnimbus/docker-bunq-balance
```

### docker-compose

To use this container with docker-compose check out the following `yaml`.

```yaml
version: '3.7'
services:
  bunq-balance:
    container_name: 'bunq-balance'
    image: qnimbus/docker-bunq-balance:latest
    healthcheck:
      test: nc -z 127.0.0.1 8080 || exit 1
    ports:
      - 8080:8080
    environment:
      - ENVIRONMENT=PRODUCTION
      - LISTENING_PORT=8080
      - LISTENING_ADDRESS=0.0.0.0
      - ALLOWED_IPS=<YOUR_PUBLIC_IP>
      - API_KEY=<YOUR_BUNQ_API_KEY>
      - ALLOWED_ACCOUNTS=<12345,67890,etc>
      - ENCRYPTION_KEY=<YOUR_ENCRYPTION_KEY>
    volumes:
      - type: bind
        source: /opt/bunq-balance
        target: /usr/src/app/dist/public/accounts
    restart: always
    stop_grace_period: 10s
```

## Ready, set, GO!

Go to your container url and check it out:

`http://my-container:8080/view/demo`

## To Do's

- Use Docker `secret` in compose file to prevent sensitive information from leaking.
- Make HTML responsive for use on mobile phones and tablets.

[screenshot]: https://raw.githubusercontent.com/updev-it/node-bunq-balance/master/screenshot.png 'Screenshot'
