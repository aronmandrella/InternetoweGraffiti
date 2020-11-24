// --------------- IMPORTOWANIE POTRZEBNYCH OBIEKTÓW I LIBEK ---------//

// import $ from 'dom7';
import $       from 'jquery';
const  Storage = window.localStorage;

import clientServer from './client-server.js';

// ---------------------- ZASADNICZA CZĘŚĆ KODU -----------------------//

class SettingsPage{
  // ------ FUNKCJE UTILITY ------- //


  // ------ OBSŁUGA EVENTÓW W PANELU PRZEGLĄDANIA POSTÓW ------- //

  // Obsługa kliknięcia w avatar.
  eventHandler_userAvatarClick(){
    var photoB = this.f7.photoBrowser.create({
      photos : [{
        url: this.jqUserAvatar.attr('src'),
        caption: this.userData.userName,
      }],
      exposition: false,
      theme: 'dark',
      type: 'standalone',
      toolbar: false,
      popupCloseLinkText: 'Zamknij',
    });
    photoB.open();
  }
  // Obsługa guzika zmiany avatara.
  eventHandler_userAvatarButton(){
    const dialog = this.f7.dialog.create({
      destroyOnClose: true,
      text: 'Skąd pobrać zdjęcie profilowe?',
      buttons: [
        {text: '<i class="fas fa-camera"></i> Aparat',
          onClick: ()=>{this.getUserAvatar('camera')}},
        {text: '<i class="fas fa-image"></i> Galeria',
          onClick: ()=>{this.getUserAvatar('galery')}},
        {text: 'Anuluj', color: 'gray'},
      ],
    });
    dialog.open();
  }
  // Obsługa guzika zmiany nazwy użytkownika.
  eventHandler_userNameButton(){
    this.f7.dialog.prompt(
      null, null,
      (newUserName)=>{
        // Zapisanie nowej nazwy użytkownika w obiekcie
        this.userData.userName = newUserName;
        // Aktualizacja danych na serwerze
        this.updateServerUserData();
      },
      ()=>{}, this.userData.userName
    );
  }
  // Obsługa guzika zmiany adresu serwera.
  eventHandler_serverUrlButton(){
    this.f7.dialog.confirm(
      'Zmiana tej opcji może popsuć działanie aplikacji. Kontynuować?', 'Uwaga!',
      ()=>{
        this.f7.dialog.prompt(
          null, null,
          (newServerUrl)=>{
            Storage.setItem('serverUrl', newServerUrl);
            this.refresh();
          },
          ()=>{}, Storage.getItem('serverUrl')
        );
      },
      ()=>{}
    );
  }

  // ------ FUNKCJE API ZWIĄZANE Z ZKŁADKĄ PRZEGLĄDANIA POSTÓW  ------- //
 
  // Funkcja realizująca pobranie nowego avatara użytkownika.
  async getUserAvatar(avatarSource){
    try{
      // Włączenie paska ładowania.
      this.f7.dialog.preloader('');

      // Pobranie grafiki z telefonu
      var newUserAvatar = await this.cordovaApp.getPicture(avatarSource);
      this.f7.dialog.close();

      var dialog = this.f7.dialog.create({
        title: 'Ustawić nowe zdjęcie profilowe?',
        content: `<img src="${newUserAvatar}"/>`,
        closeByBackdropClick: false,
        destroyOnClose: true,
        cssClass: 'image-dialog',
        buttons: [
          {text: 'Ok', onClick: ()=>{
            this.userData.userAvatar = newUserAvatar;
            this.updateServerUserData();
          }},
          {text: 'Anuluj', color: 'gray'},
        ],
      });
      dialog.open();
    }
    catch(error){
      this.f7.dialog.close();
      if(error.message != 'No Image Selected'){
        this.f7.methods.showErrorMessage(`Nie udało się pobrać nowej grafiki profilowej!`);
        alert(error.message);
      }
    }
  }
  // Wrzuca na serwer zaktualizowane dane użytkownika.
  async updateServerUserData(){
    try{
      // Włączenie paska ładowania.
      this.f7.dialog.preloader('Kopiuję dane na serwer...');

      // Pobranie awatara i nazwy użytkownika.
      await clientServer.request({
        data: {
          userName: this.userData.userName,
          userAvatar: this.userData.userAvatar,
        },
        endpoint: '/setuser.php',
      });

      // Zamkniecie paska ładowania.
      this.f7.dialog.close();

      // Aktualizacja GUI:
      this.refresh();
    }
    catch(error){
      this.f7.dialog.close();
      this.f7.methods.showErrorMessage(`Nie udało się zaktualizować danych użytkownika!`);
      alert(error.message);
    }
  }

  // Odświerza całą stronę ustawień.
  async refresh(){
    if(this.allowRefresh){
        try{
          // Włączenie paska ładowania.
          this.f7.dialog.preloader('Wczytuję dane...');


          // Wpisanie do GUI aktualnego URL serwera.
          var serverUrl = Storage.getItem('serverUrl');
          this.jqServerUrl.text(serverUrl);

          // Pobranie awatara i nazwy użytkownika.
          var userData = await clientServer.request({
            data: {},
            endpoint: '/getuser.php',
          });

                  // ######## DEVELOPMENT:
                  if(clientServer.FAKE_SERVER_REQUESTS){
                    userData.userId = 1;
                    userData.userName = 'Użytkownik #1';
                    userData.userAvatar = null;
                  }

          // Określenie co zostanie wpisane do GUI.
          this.userData = {};
          this.userData.userId = userData.userId;
          this.userData.userName = (!userData.userName) ? 'Użytkownik #' + userData.userId : userData.userName;
          this.userData.userAvatar = userData.userAvatar;

          // Wpisanie odpowiednich danych do GUI.
          this.jqUserAvatar.attr('src', (!userData.userAvatar) ? './static/user.png' : userData.userAvatar);
          this.jqUserName.text(this.userData.userName);

          // Zamkniecie paska ładowania.
          this.f7.dialog.close();
        }
        catch(error){
          this.f7.dialog.close();
          this.f7.methods.showErrorMessage(`Nie udało się pobrać danych użytkownika!`);
          alert(error.message);
        }
    }
  }

  // -------------------- INICIALIZACJA OBKIEKTU ------------------ //

  constructor(){
    // Inicializacja zmiennych.
    this.f7 = null;
    this.cordovaApp = null;
    this.allowRefresh = null;
    this.userData = {
      userId: null,
      userName: null,
      userAvatar: null,
    }
  }

  // Inicializacja zakładki po załadowaniu obiektu przez router.
  init(f7, cordovaApp){
    // Zachowanie obiektu aplikacji Framework7 i Cordova.
    this.f7 = f7;
    this.cordovaApp = cordovaApp;

    // Zapisanie obiektów jQuery.
    this.jqUserName = $('.profile-name');
    this.jqUserAvatar = $('.profile-picture img');
    this.jqServerUrl = $('#server-url');
    this.jqButtonUserName = $('#setting-user-name');
    this.jqButtonUserAvatar = $('#setting-user-avatar');
    this.jqButtonServerUrl = $('#setting-server-url');

    // Zaplanowanie dalszej inicializacji gdy gotowe będą API Cordovy.
    this.cordovaApp.onDeviceReady(()=>{
      this.jqButtonUserName.on('click', ()=>{this.eventHandler_userNameButton()});
      this.jqButtonUserAvatar.on('click', ()=>{this.eventHandler_userAvatarButton()});
      this.jqButtonServerUrl.on('click', ()=>{this.eventHandler_serverUrlButton()});
      this.jqUserAvatar.on('click', ()=>{this.eventHandler_userAvatarClick()});
      this.allowRefresh = true;
      this.refresh();
    });
  }
}

export default new SettingsPage();