import { counter, getCurrencySymbol } from '/js/utils.js';

// Set momentjs locale to Dutch
moment.locale('NL');

window.addEventListener('load', () => {
  import('/accounts/accounts.js')
    .then(module => {
      main({ ...module.accounts, demo: 'demo' });
    })
    .catch(error => {
      main({
        demo: 'demo'
      });
    });
});

const main = accounts => {
  const url = window.location.href.replace(/\/$/, '');
  const accountId = accounts[url.substring(url.lastIndexOf('/') + 1)];
  const fetchUrl = `${window.location.origin}/getAccount/${accountId}`;

  const togglePlaceholder = (loaded = false) => {
    const box = $('.box');
    const ph = $('.box-placeholder');

    if (!loaded) {
      box.hide();
      ph.show();
    } else {
      box.show();
      ph.hide();
    }
  };

  const fetchData = function() {
    const transactionsTable = $('div#transactions.table');
    const nameElem = $('h1#name');
    const balanceElem = $('h3#balance');
    const balanceCounterElem = $('<span>', { id: 'balance-counter', class: 'counter' });

    $.ajax(fetchUrl, {
      dataType: 'json',
      cache: false,
      beforeSend: function() {
        togglePlaceholder();
      },
      complete: function() {
        togglePlaceholder(true);
        setTimeout(counter, 200, balanceCounterElem);
      },
      error: function(data) {
        nameElem.text('Niet gevonden');
        balanceCounterElem.data('count', 0);
      },
      success: function(data) {
        balanceElem.text(`Saldo ${getCurrencySymbol(data.currency)} `);
        balanceElem.append(balanceCounterElem);
        balanceCounterElem.data('count', data.value);
        nameElem.text(data.description);

        if (data.value < 0) {
          balanceCounterElem.addClass('amount negative');
        } else {
          balanceCounterElem.addClass('amount positive');
        }

        for (var i = 0, len = data.payments.length; i < len; i++) {
          const payment = data.payments[i]['Payment'];
          const created = (({ created = undefined } = {}) => moment(created))(payment);

          // Destructure payment properties
          const {
            id,
            description,
            amount: { currency, value }
          } = payment;

          transactionsTable.append(`<div class="table-row-item created">${created.fromNow()}</div>`);
          transactionsTable.append(`<div class="table-row-item description">${description}</div>`);
          transactionsTable.append(
            `<div class="table-row-item"><span class="currency-symbol">${getCurrencySymbol(currency)}</span> <span class="amount ${value < 0 ? 'negative' : 'positive'}">${Math.abs(
              value
            ).toFixed(2)}</span></div>`
          );
        }
      }
    });
  };

  if (/demo$/.test(window.location.pathname)) {
    // Emulate slow AJAX request
    setTimeout(fetchData, 3000);
  } else {
    fetchData();
  }
};
