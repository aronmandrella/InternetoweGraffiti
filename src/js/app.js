window.onerror = function(msg, url, linenumber) {
  alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
  return true;
}


// ----- IMPORTOWANIE OBIEKTÓW, IKON I STYLÓW LIBKI FRAMEWORK7 -------//

// Obiekt do operacji w stylu jQuery z paczki Framework7
import $ from 'dom7';
// Główny obiekt libki Framework7
import Framework7 from 'framework7/framework7.esm.bundle.js';
const  Storage = window.localStorage;
// Style Framework7
import 'framework7/css/framework7.bundle.css';
// Ikony z Framework7
import '../css/icons.css';

import 'babel-polyfill'

// -------------- IMPORTOWANIE DODATKOWYCH STYLÓW I IKON -------------//

// Ikony i style specyficzne dla apki.
import '../css/fontawesome.css';
import '../css/app.css';
import '../css/entry-card.css';
import '../css/dialogs.css';
import '../css/add-settings.css';

// ------------------ IMPORT POTRZEBNYCH OBIEKTÓW --------------------//

// Import obiektu do zarządzania cordovą.
import cordovaApp from './cordova-app.js';
// Import obiektu do komunikacji z serwerem.
import clientServer from './client-server.js';
// Import zdefiniowanych linków.
import routes from './routes.js';

// ----------------------- KONFIGURACJA APLIKACJI --------------------//

// Inicializacja zmiennych aplikacji.
if(!Storage.getItem('serverUrl')){
  Storage.setItem('serverUrl', 'https://www.cwiczeniawokalne.pl/igraffiti');
}

// Inicializacja obiektu Framework7
const app = new Framework7({
  root:   '#app',                   // App root element
  id:     'io.framework7.myapp',    // App bundle ID
  name:   'Internetowe Graffiti',   // App name
  theme:  'auto',                   // Automatic theme detection
  language: 'pl',

  on: {
    init: function () {
      var f7 = this;
      cordovaApp.init(f7);
      clientServer.init(f7);
    },
  },


  // App root data
  data: function () {
    return {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
      // Demo products for Catalog section
      products: [
        {
          id: '1',
          title: 'Apple iPhone 8',
          description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
        },
        {
          id: '2',
          title: 'Apple iPhone 8 Plus',
          description: 'Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus quasi est ut aliquid blanditiis beatae suscipit odio vel! Nostrum porro sunt sint eveniet maiores, dolorem itaque!'
        },
        {
          id: '3',
          title: 'Apple iPhone X',
          description: 'Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis placeat, mollitia necessitatibus reprehenderit. Labore dolores amet quos, accusamus earum asperiores officiis assumenda optio architecto quia neque, quae eum.'
        },
      ]
    };
  },
  // App root methods
  methods: {
    showErrorMessage: function (message) {
      var dialog = app.dialog.create({
        title: 'Wystąpił błąd!',
        text: message,
        destroyOnClose: true,
        cssClass: 'error-dialog',
        buttons: [{text: 'Ok', bold: true}],
      });
      dialog.open();
    },
    showConectionError: function () {
      var dialog = app.dialog.create({
        title: 'Błąd połączenia z serwerem!',
        content: '<img src="./static/servernotreached.jpg" style="width:100%"/>',
        destroyOnClose: true,
        cssClass: 'error-dialog',
        buttons: [{text: 'Ok', bold: true}],
      });
      dialog.open();
    },
  },
  // App routes
  routes: routes,

  // Input settings
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
});