const pad = function(str, max) {
  str = str.toString();
  return str.length < max ? pad('0' + str, max) : str;
};

const counter = function(elem) {
  $(elem).each(function() {
    const $this = $(this),
      countTo = parseFloat($this.data('count')).toFixed(2);

    // Calculate maximum number of characters for padding
    const max = countTo.toString().length;

    // Apply slight blur to counter text
    // $this.css('filter', 'blur(0.5px)');

    $({ countNum: $this.text() }).animate(
      {
        countNum: countTo
      },
      {
        duration: 5000,
        easing: 'easeOutQuint',
        step: function() {
          const num = parseFloat(this.countNum).toFixed(2);
          $this.text(pad(num, max));
        },
        complete: function() {
          const num = parseFloat(this.countNum).toFixed(2);
          // $this.css('filter', 'blur(0)');
          $this.text(pad(num, max));
        }
      }
    );
  });
};

const getCurrencySymbol = currency => {
  const currencySymbols = {
    USD: '$', // US Dollar
    EUR: '€', // Euro
    CRC: '₡', // Costa Rican Colón
    GBP: '£', // British Pound Sterling
    ILS: '₪', // Israeli New Sheqel
    INR: '₹', // Indian Rupee
    JPY: '¥', // Japanese Yen
    KRW: '₩', // South Korean Won
    NGN: '₦', // Nigerian Naira
    PHP: '₱', // Philippine Peso
    PLN: 'zł', // Polish Zloty
    PYG: '₲', // Paraguayan Guarani
    THB: '฿', // Thai Baht
    UAH: '₴', // Ukrainian Hryvnia
    VND: '₫' // Vietnamese Dong
  };

  return currencySymbols[currency] || currency;
};

export { pad, counter, getCurrencySymbol };
