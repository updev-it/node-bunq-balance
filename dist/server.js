/* eslint-env node */

'use strict';

// Load config from .env file
require('dotenv').config();

// The TCP port for this systems web interface - picked up from env, package.json or afixed default value
const useHTTPS = process.env.USEHTTPS || process.env.npm_package_config_useHTTPS === 'true' || false;
const listeningPort = process.env.LISTENING_PORT || process.env.npm_package_config_listeningPort || 3000;
const listeningAddress = process.env.LISTENING_ADDRESS || process.env.npm_package_config_listeningAddress || 'localhost';
const allowedAccounts = process.env.ALLOWED_ACCOUNTS ? process.env.ALLOWED_ACCOUNTS.split(',').map(value => parseInt(value)) : [];

const express = require('express');
const setup = require('./common/setup');
const http = useHTTPS ? require('https') : require('http');
const path = require('path');
const fs = require('fs');

// Create an Express app
const app = express();

let httpServer;

// Create the http(s) server
if (!useHTTPS) {
  httpServer = http.createServer(app);
} else {
  const privateKey = fs.readFileSync('./server.key', 'utf8');
  const certificate = fs.readFileSync('./server.crt', 'utf8');
  const credentials = {
    key: privateKey,
    cert: certificate
  };
  httpServer = http.createServer(credentials, app);
}

httpServer.listen(listeningPort, listeningAddress, function() {
  console.info(
    'Express 4 https server listening on %s://%s:%d%s - serving BunqBalance',
    useHTTPS ? 'https' : 'http',
    httpServer.address().address.replace('127.0.0.1', 'localhost'),
    httpServer.address().port,
    '/'
  );
});

app.use('/view/:accountName', (req, res, next) => {
  express.static(path.join(__dirname, 'public/accounts/index.html'))(req, res, next);
});

// API

app.get('/getAccount/:accountId/:balance?', async (req, res, next) => {
  if (req.params.accountId.toLowerCase() === 'demo') {
    const now = Date.now();
    const randomOffset = Math.ceil(Math.random() * (86400000 - 1000) + 1000);
    const demoData = {
      id: 'demo',
      description: 'Demo account',
      currency: 'USD',
      value: req.params.balance ? req.params.balance : (Math.random() * (10000 - 50) + 50).toFixed(2),
      payments: [
        {
          Payment: {
            created: now - Math.ceil(Math.random() + 1) * randomOffset * 1,
            description: 'Eerste demo transactie',
            amount: {
              value: ((Math.random() * (1000 - 5) + 5) * (Math.random() < 0.5 ? -1 : 1)).toFixed(2),
              currency: 'USD'
            }
          }
        },
        {
          Payment: {
            created: now - Math.ceil(Math.random() + 1) * randomOffset * 2,
            description: 'Tweede demo transactie',
            amount: {
              value: ((Math.random() * (1000 - 5) + 5) * (Math.random() < 0.5 ? -1 : 1)).toFixed(2),
              currency: 'USD'
            }
          }
        },
        {
          Payment: {
            created: now - Math.ceil(Math.random() + 1) * randomOffset * 3,
            description: 'Derde demo transactie',
            amount: {
              value: ((Math.random() * (1000 - 5) + 5) * (Math.random() < 0.5 ? -1 : 1)).toFixed(2),
              currency: 'USD'
            }
          }
        },
        {
          Payment: {
            created: now - Math.ceil(Math.random() + 1) * randomOffset * 4,
            description: 'Vierde demo transactie',
            amount: {
              value: ((Math.random() * (1000 - 5) + 5) * (Math.random() < 0.5 ? -1 : 1)).toFixed(2),
              currency: 'USD'
            }
          }
        },
        {
          Payment: {
            created: now - Math.ceil(Math.random() + 1) * randomOffset * 5,
            description: 'Vijfde demo transactie',
            amount: {
              value: ((Math.random() * (1000 - 5) + 5) * (Math.random() < 0.5 ? -1 : 1)).toFixed(2),
              currency: 'USD'
            }
          }
        }
      ]
    };
    res.json(demoData);
  } else {
    // Cast account id to integer
    const accountId = parseInt(req.params.accountId);

    setup()
      .then(async BunqClient => {
        const accountParser = ({ MonetaryAccountBank, MonetaryAccountSavings, MonetaryAccountJoint }) => ({
          ...(MonetaryAccountBank && { ...MonetaryAccountBank }),
          ...(MonetaryAccountSavings && { ...MonetaryAccountSavings }),
          ...(MonetaryAccountJoint && { ...MonetaryAccountJoint })
        });

        const getMonetaryAccounts = async userid => {
          return BunqClient.api.monetaryAccount.list(userid);
        };

        const getPayments = async (userid, monetaryaccountid) => {
          return BunqClient.api.payment.list(userid, monetaryaccountid);
        };

        // Fet user info connected to this account
        const users = await BunqClient.getUsers(true);

        // Fet the direct user object
        const { id: userId } = users[Object.keys(users)[0]];

        // Get active accounts list
        const accounts = await getMonetaryAccounts(userId);

        // Get all payments for the monetary account
        const payments = await getPayments(userId, accountId);

        // Compile accounts array
        const account = accounts.reduce((acc, account) => {
          const {
            id,
            display_name: name,
            description,
            status,
            balance: { currency, value },
            ...acount
          } = accountParser(account);

          if (id === accountId && allowedAccounts.includes(id) && status === 'ACTIVE') {
            return acc.concat({ id, name, description, currency, value, payments: payments.splice(0, 5) });
          } else {
            return acc;
          }
        }, []);

        if (account.length > 0) {
          res.json(...account);
        } else {
          res.sendStatus(404);
        }
      })
      .catch(e => {
        // TODO Handle errors and exceptions
        next(e);
      });
  }
});

// Static assets

app.use('/', express.static(path.join(__dirname, 'public')));

// Default redirect

app.use(function(req, res) {
  res.redirect('/view/demo');
});
