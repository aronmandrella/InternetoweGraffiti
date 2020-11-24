// --------------- IMPORTOWANIE POTRZEBNYCH OBIEKTÓW I LIBEK ---------//

// ...

// ---------------------- ZASADNICZA CZĘŚĆ KODU -----------------------//

class cordovaApp{
  // ------ METODY ZDEFINIOWANE W TEMPLATCE F7 (nie trza ruszać) ------ //

  // This method hides splashscreen after 2 seconds
  handleSplashscreen(){
    var f7 = this.f7;
    if (!window.navigator.splashscreen || f7.device.electron) return;
    setTimeout(()=>{ window.navigator.splashscreen.hide(); }, 2000);
  }
  // This method prevents back button tap to exit from app on android.
  // In case there is an opened modal it will close that modal instead.
  // In case there is a current view with navigation history, it will go back instead.
  handleAndroidBackButton(){
    var f7 = this.f7;
    const $ = f7.$;
    if (f7.device.electron) return;

    document.addEventListener('backbutton', function (e) {
      if ($('.actions-modal.modal-in').length) {
        f7.actions.close('.actions-modal.modal-in');
        e.preventDefault();
        return false;
      }
      if ($('.dialog.modal-in').length) {
        f7.dialog.close('.dialog.modal-in');
        e.preventDefault();
        return false;
      }
      if ($('.sheet-modal.modal-in').length) {
        f7.sheet.close('.sheet-modal.modal-in');
        e.preventDefault();
        return false;
      }
      if ($('.popover.modal-in').length) {
        f7.popover.close('.popover.modal-in');
        e.preventDefault();
        return false;
      }
      if ($('.popup.modal-in').length) {
        f7.popup.close('.popup.modal-in');
        e.preventDefault();
        return false;
      }
      if ($('.login-screen.modal-in').length) {
        f7.loginScreen.close('.login-screen.modal-in');
        e.preventDefault();
        return false;
      }

      const currentView = f7.views.current;
      if (currentView && currentView.router && currentView.router.history.length > 1) {
        currentView.router.back();
        e.preventDefault();
        return false;
      }

      if ($('.panel.panel-in').length) {
        f7.panel.close('.panel.panel-in');
        e.preventDefault();
        return false;
      }
    }, false);
  }
  // This method does the following:
  // - provides cross-platform view "shrinking" on keyboard open/close
  // - hides keyboard accessory bar for all inputs except where it required
  handleKeyboard(){
    var f7 = this.f7;
    if (!window.Keyboard || !window.Keyboard.shrinkView || f7.device.electron) return;
    var $ = f7.$;

    window.Keyboard.shrinkView(false);
    window.Keyboard.disableScrollingInShrinkView(true);
    window.Keyboard.hideFormAccessoryBar(true);
  
    window.addEventListener('keyboardWillShow', () => {
      f7.input.scrollIntoView(document.activeElement, 0, true, true);
    });
    window.addEventListener('keyboardDidShow', () => {
      f7.input.scrollIntoView(document.activeElement, 0, true, true);
    });
    window.addEventListener('keyboardDidHide', () => {
      if (document.activeElement && $(document.activeElement).parents('.messagebar').length) {
        return;
      }
      window.Keyboard.hideFormAccessoryBar(false);
    });
    window.addEventListener('keyboardHeightWillChange', (event) => {
      var keyboardHeight = event.keyboardHeight;
      if (keyboardHeight > 0) {
        // Keyboard is going to be opened
        document.body.style.height = `calc(100% - ${keyboardHeight}px)`;
        $('html').addClass('device-with-keyboard');
      } else {
        // Keyboard is going to be closed
        document.body.style.height = '';
        $('html').removeClass('device-with-keyboard');
      }

    });
    $(document).on('touchstart', 'input, textarea, select', function (e) {
      var nodeName = e.target.nodeName.toLowerCase();
      var type = e.target.type;
      var showForTypes = ['datetime-local', 'time', 'date', 'datetime'];
      if (nodeName === 'select' || showForTypes.indexOf(type) >= 0) {
        window.Keyboard.hideFormAccessoryBar(false);
      } else {
        window.Keyboard.hideFormAccessoryBar(true);
      }
    }, true);
  }


  // ------ FUNKCJE API DO UŻYWANIA PRZEZ INNE KLASY (po init()) ------ //

  // Sprawdza czy aplikacja jest uruchomiona na cordovie.
  isCordova(){
    return this.f7.device.cordova;
  }

  // Dodaje callback dla eventu onDeviceReady jeśli aplikacja to cordova,
  // lub wywołuje go go natychmiast jeśli to zwykła strona.
  onDeviceReady(callback){
    if(this.isCordova())
      document.addEventListener('deviceready', callback, false);
    else
      callback();
  }

  // Zwraca obecne współrzędne lub błąd jeśli urządzenie to cordova, lub losowe,
  // współrzjędne w przeciwnym wypadku.
  getCurrentPosition(){
    return new Promise((resolve, reject)=>{
      if(!this.isCordova()){
        // Zwrócenie losowej pozycji dla nie cordovy.
        return resolve({
          lat: 50.36004240381323,
          lon: 18.841820955276493,
        });
      }
      else{
        // Poprawne zwrócenie pozycji.
        var onSuccess = (p)=>{
          return resolve({
              lat: p.coords.latitude,
              lon: p.coords.longitude,
              heading: p.coords.heading,
          })
        };
        // Poinformowanie o problemie przy uzykiwaniu pozycji.
        var onError = (e)=>{
          return reject({
            message: e.message,
          });
        }
        // Funkcja cordovy do odczytywania pozycji urządzenia.
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
          timeout: 10000, enableHighAccuracy: true});
      }
    });
  }

  // Zwraca obraz pobrany z aparatu lub galerii.
  getPicture(source){
    return new Promise((resolve, reject)=>{
      if(!this.isCordova()){
        // Zwrócenie losowej grafiki.
        return resolve('https://www.bytom.pl/userfiles/news/p1de0es4us1i0u1pd312hjkas1qcs4.JPG');
      }
      else{
        // Poprawne zwrócenie pobranej grafiki.
        var onSuccess = (imageData)=>{
          return resolve("data:image/jpeg;base64," + imageData);
        };
        // Poinformowanie o problemie przy uzykiwaniu grafiki.
        var onFail = (message)=>{
          return reject({
            message: message,
          });
        }
        // Funkcja cordovy do odczytywania grafiki z urządzenia.
        navigator.camera.getPicture(onSuccess, onFail, {
          correctOrientation: true,
          quality: 25,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: (source === 'camera') 
            ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        });
      }
    });
  }

  // -------------------- INICIALIZACJA OBKIEKTU ------------------ //

  constructor(){
    this.f7 = null;
    this.isCordovaDevice = null;
  }
  init(f7){
    // Zachowanie obiektu aplikacji Framework7.
    this.f7 = f7;

    if (this.isCordova()) {
      // Wywołanie metod z templatki w przypadku cordovy.
      this.handleAndroidBackButton();
      this.handleSplashscreen();
      this.handleKeyboard();

      // Ustawienie funkcji otwierania linków zewnętrznych.
      window.open = cordova.InAppBrowser.open;
    }
  }
};

export default new cordovaApp();
