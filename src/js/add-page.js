// --------------- IMPORTOWANIE POTRZEBNYCH OBIEKTÓW I LIBEK ---------//

// import $ from 'dom7';
import $      from 'jquery';

import clientServer from './client-server.js';


// ---------------------- ZASADNICZA CZĘŚĆ KODU -----------------------//

class AddPage{
  // ------ FUNKCJE UTILITY ------- //


  // ------ OBSŁUGA EVENTÓW W PANELU PRZEGLĄDANIA POSTÓW ------- //

  // Obsługa gudzika dodawania grafiki z aparatu.
  eventHandler_buttonCamera(){
    this.addPostImage('camera');
  }
  // Obsługa gudzika dodawania grafiki z galerii.
  eventHandler_buttonGalery(){
    this.addPostImage('galery');
  }
  // Obsługa guzika publikacji postu.
  eventHandler_buttonPublish(){
    this.publishPost();
  }
  // Obsługa guzika usuwania grafiki.
  eventHandler_buttonRemoveImage(){
    this.removePostImage();
  }
  // Event wpisywania znaków do textarea.
  eventHandler_textareaInput(){
    var text = this.jqTextarea.val();
    this.jqCharCount.text(text.length);
    if(text.length > 0)
      this.postText = text;
    else
      this.postText = null;
  }

  // ------ FUNKCJE API ZWIĄZANE Z ZKŁADKĄ PRZEGLĄDANIA POSTÓW  ------- //
 
  // Publikuje post na serwerze.
  async publishPost(){
    try{
      // Walidacja wprowadzonych danych.
      if(!this.postImage && !this.postText){
        this.f7.dialog.alert("By opublikować post dodaj zdjęcie, grafikę, lub jakiś tekst!", null);
        return;
      }

      // Włączenie paska ładowania.
      this.f7.dialog.preloader('Publikuję post...');

      // Pobranie aktualnych współrzędnych.
      var position = await this.cordovaApp.getCurrentPosition();

      // Wykonanie rzadania do serwera.
      await clientServer.request({
        data: {
          lat: position.lat,
          lon: position.lon,
          image: this.postImage,
          text: this.postText,
        },
        endpoint: '/publish.php',
      });

      // Wyczyszczenie edytora.
      this.refresh();
      this.f7.dialog.close();
      this.f7.dialog.alert(null, 'Opublikowano!');
    }
    catch(error){
      this.f7.dialog.close();
      this.f7.methods.showErrorMessage(`Nie udało się opublikować postu!`);
      alert(error.message);
    }
  }
  // Funkcja usuwająca załadowaną grafikę.
  removePostImage(){
    this.jqImagePreview.css('display', 'none');
    this.postImage = null;
  }
  // Czyści cały tekst z textarea.
  clearTextarea(){
    this.jqTextarea.val('');
    this.eventHandler_textareaInput();
    this.postText = null;
  }

  // Funkcja realizująca pobranie grafiki do postu.
  async addPostImage(source){
    try{
      // Włączenie paska ładowania.
      this.f7.dialog.preloader('');

      // Pobranie grafiki z telefonu
      this.postImage = await this.cordovaApp.getPicture(source);

      // Update GUI (timeout po podmianie by stara grafika nie migła):
      this.jqImage.attr('src', this.postImage);
      setTimeout(() => {
        this.f7.dialog.close();
        this.jqImagePreview.css('display', 'inline-block');
      }, 1000);
    }
    catch(error){
      this.f7.dialog.close();
      if(error.message != 'No Image Selected'){
        this.f7.methods.showErrorMessage(`Nie udało się pobrać grafiki lub zdjęcia!`);
        alert(error.message);
      }
    }
  }
  refresh(){
    this.removePostImage();
    this.clearTextarea();
  }

  // -------------------- INICIALIZACJA OBKIEKTU ------------------ //

  constructor(){
    // Inicializacja zmiennych.
    this.f7 = null;
    this.cordovaApp = null;
    this.postImage = null;
    this.postText = null;
  }

  // Inicializacja zakładki po załadowaniu obiektu przez router.
  init(f7, cordovaApp){
    // Zachowanie obiektu aplikacji Framework7 i Cordova.
    this.f7 = f7;
    this.cordovaApp = cordovaApp;

    // Zapisanie obiektów jQuery.
    this.jqButtonCamera = $('#camera-button');
    this.jqButtonGalery = $('#galery-button');
    this.jqButtonPublish = $('#publish-button');
    this.jqButtonRemoveImage = $('.image-preview button');
    this.jqTextarea = $('.post-editor textarea');
    this.jqCharCount = $('#char-counter-current');
    this.jqImagePreview = $('.image-preview');
    this.jqImage = $('.image-preview img');

    // Zaplanowanie dalszej inicializacji gdy gotowe będą API Cordovy.
    this.cordovaApp.onDeviceReady(()=>{
      this.jqButtonCamera.on('click', ()=>{this.eventHandler_buttonCamera()});
      this.jqButtonGalery.on('click', ()=>{this.eventHandler_buttonGalery()});
      this.jqButtonPublish.on('click', ()=>{this.eventHandler_buttonPublish()});
      this.jqButtonRemoveImage.on('click', ()=>{this.eventHandler_buttonRemoveImage()});
      this.jqTextarea.on('input', ()=>{this.eventHandler_textareaInput()});
      this.refresh();
    });
  }
}

export default new AddPage();