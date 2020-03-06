/* eslint-env node */

'use strict';

// Load config from .env file
require('dotenv').config();

const path = require('path');

const deviceName =
  process.env.DEVICE_NAME || process.env.npm_package_config_deviceName || `BunqBalance${process.env.npm_package_version ? '-v' + process.env.npm_package_version : ''}`;

// Setup a custom store which works in a node environment
const customStore = require('@bunq-community/bunq-js-client/dist/Stores/JSONFileStore').default;
const BunqJSClient = require('@bunq-community/bunq-js-client/dist/BunqJSClient').default;

const defaultErrorLogger = error => {
  if (error.response) {
    throw error.response.data;
  }
  throw error;
};

// which IP addresses are allowed for the given API key
const allowedIps = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];

// the basic setup function
const setup = async () => {
  // setup a new store instance
  const customStoreInstance = customStore(`${__dirname}${path.sep}storage.json`);

  // setup a bunqClient
  const BunqClient = new BunqJSClient(customStoreInstance);

  // load and refresh bunq client
  await BunqClient.run(process.env.API_KEY, allowedIps, process.env.ENVIRONMENT, process.env.ENCRYPTION_KEY).catch(exception => {
    throw exception;
  });

  // disable keep-alive since the server will stay online without the need for a constant active session
  BunqClient.setKeepAlive(false);

  // create/re-use a system installation
  await BunqClient.install();

  // create/re-use a device installation
  await BunqClient.registerDevice(deviceName);

  // create/re-use a bunq session installation
  await BunqClient.registerSession();

  return BunqClient;
};

module.exports = setup;
