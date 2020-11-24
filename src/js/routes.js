
// ------------- ZAIMPORTOWANIE SZABLONOWYcH PLIKÓW HTML ------------//

// Zawartość błędnej ścieżki.
import NotFoundPage     from '../pages/404.f7.html';

// Zawartośc głównych zakładek aplikacji...
import AddPage          from '../pages/add.f7.html';
import ExplorePage      from '../pages/explore.f7.html';
import SettingsPage     from '../pages/settings.f7.html';

// ------------------ IMPORT POTRZEBNYCH OBIEKTÓW --------------------//

// Import obiektu do zarządzania cordovą.
import cordovaApp from './cordova-app.js';

// Import obiektów zarządzających zakładkami.
import explorePage from './explore-page.js';
import settingsPage from './settings-page';
import addPage from './add-page.js';

// ----------------------- KONFIGURACJA ŚCIEŻEK ----------------------//

const routes = [
  // Ścieżki do głównych zakłądek aplikacji...
  {
    path: '/add/',
    component: AddPage,
    on: {
      pageInit: function(){
        const f7 = this.app;
        addPage.init(f7, cordovaApp);
      }
    }
  },{
    path: '/explore/',
    component: ExplorePage,
    on: {
      pageInit: function(){
        const f7 = this.app;
        explorePage.init(f7, cordovaApp);
      }
    }
  },{
    path: '/settings/',
    component: SettingsPage,
    on: {
      pageInit: function(){
        const f7 = this.app;
        settingsPage.init(f7, cordovaApp);
      }
    }
  },

  // Domyślna ścieżka dla dowolnej niewymienionej błędnej ścieżki.
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;