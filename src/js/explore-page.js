// --------------- IMPORTOWANIE POTRZEBNYCH OBIEKTÓW I LIBEK ---------//

// Libki i obiekty z libek:
import 'leaflet/dist/leaflet.js';
import 'leaflet/dist/leaflet.css';
// import $ from 'dom7';
import $        from 'jquery';
import moment   from 'moment'; moment.locale('pl');
const  Storage = window.localStorage;

import clientServer from './client-server.js';

// ---------------------- ZASADNICZA CZĘŚĆ KODU -----------------------//

class ExplorePage{
  // ------ FUNKCJE UTILITY ------- //

  // Konweruje wartość na sliderze na promień na mapie.
  sliderValueToRadius(sliderVal){
    return 25 * Math.pow(2, sliderVal);
  }
  // Konwertuje wartość na sliderze na zoom dla Leaflet.
  sliderValueToZoom(sliderVal){
    return 18 - sliderVal;
  }
  // Określa pozycję slidera w oparciu o wartość zoom.
  zoomToSliderValue(zoom){
    return 18 - zoom;
  }
  // Buduje HTML wpisu w oparciu o dane JSON.
  createEntryJQ(data){
    // Parsowanie koordynat na floaty.
    data.lat = parseFloat(data.lat);
    data.lon = parseFloat(data.lon);

    // Limit znaków po których post jest skracany.
    const CHAR_LIMIT = 250;

    // Przygotowanie części wpisu związanej z tekstem.
    var HTMLContentText = '';
    if(data.text){
      data.text = data.text.trim();

      if(data.text.length < 50 && !data.image){
        HTMLContentText = `<div class="entry-text entry-text-large">${data.text}</div>`;
      }
      else if(data.text.length > CHAR_LIMIT + CHAR_LIMIT * 0.25){
        var textBeg = data.text.substr(0, CHAR_LIMIT).trim() + '... ';

        HTMLContentText = `<div class="entry-text"><span class="text-beginning">${textBeg
        }</span><span class="show-more-button">Wyświetl więcej</span><span class="show-more-content">${data.text}</div>`;
      }
      else{
        HTMLContentText = `<div class="entry-text">${data.text}</div>`;
      }
    }

    // Przygotowanie reszty wpisu.
    var HTMLcontent = 
      HTMLContentText +
      (!data.image ? '': `<div class="entry-image"><img src="${data.image}"/></div>`);
  
    // Liczy odległość wpisu od obecnego położenia usera.
    const distance = L.latLng([this.currentPosition.lat, this.currentPosition.lon])
      .distanceTo([data.lat, data.lon]).toFixed(0);

    const userName = data.userName ? data.userName : 'Użytkownik #' + data.userId;

    var jQ = $(`<div class="entry-card">
      <div class="entry-header">
        <div class="entry-user-avatar">
          <img src="${data.userAvatar ? data.userAvatar : './static/user.png'}"/>
        </div>
        <div class="entry-info">
          <div class="entry-user-name">
            ${userName}
          </div>
          <div class="entry-parameters">
            <span class="entry-coords">
              <i class="fas fa-map-marker-alt"></i> 
              ${data.lat.toFixed(5)}, ${data.lon.toFixed(5)} (${distance} m)
            </span>
            <span class="entry-date">
              ${moment(data.date).fromNow()}
            </span>
          </div>
        </div>
      </div>  
      <div class="entry-content">${HTMLcontent}</div>
    </div>`);

    // Dodanie eventu pokazywania całości długiego tekstu.
    var showMoreButton = jQ.find('.show-more-button');
    var showMoreContent = jQ.find('.show-more-content');
    showMoreButton.on('click', function(){
      var container = showMoreContent.parent();
      container.text(showMoreContent.text());
    });

    // Dodanie eventu obsługi podglądu zdjęcia.
    var postImage = jQ.find('.entry-image img');
    postImage.on('click', ()=>{
      var photoB = this.f7.photoBrowser.create({
        photos : [
          postImage.attr('src')
        ],
        exposition: false,
        theme: 'dark',
        type: 'standalone',
        toolbar: false,
        popupCloseLinkText: 'Zamknij',
      });
      photoB.open();
    });

    // Dodanie eventu obsługi podglądu avatara.
    var postAvatar = jQ.find('.entry-user-avatar img');
    postAvatar.on('click', ()=>{
      var photoB = this.f7.photoBrowser.create({
        photos : [{
          url: postAvatar.attr('src'),
          caption: userName
        }],
        exposition: false,
        theme: 'dark',
        type: 'standalone',
        toolbar: false,
        popupCloseLinkText: 'Zamknij',
      });
      photoB.open();
    });

    return jQ;
  }    

  // ------ OBSŁUGA EVENTÓW W PANELU PRZEGLĄDANIA POSTÓW ------- //

  // Zakładka zostaje pokazana.
  eventHandler_tabShow(){      
    this.setRefreshTimeout(0);
  }
  //Zakładka zostaje ukryta.
  eventHandler_tabClose(){
    this.clearPage();
  }
  // Slider zostaje poruszony.
  eventHandler_sliderMove(sliderValue){
    Storage.setItem('sliderValue', sliderValue);
    this.setMapZoom(this.sliderValueToZoom(sliderValue));
  }
    // Slider zostaje poruszony.
  eventHandler_mapZoomEnd(){
    this.setMapZoom(this.map.getZoom());
  }

  // ------ FUNKCJE API ZWIĄZANE Z ZKŁADKĄ PRZEGLĄDANIA POSTÓW  ------- //
 
  // Inicializuje mapę w zakładce przeglądania postów.
  initMap(){
    // Token MapBox wygenerowany do używania map MabBox bo te czyste OSV są brzydkie.
    this.mapboxToken = 'pk.eyJ1IjoiZWplbWRpIiwiYSI6ImNrMzFwajRqbjBhc24zZHBnODluZzhieHoifQ.KFq05lLLrr6cHrmDikR22w';
    // Obiekt mapy w panelu przeglądania.
    this.map = null;

    // Zaincializowanie DIVu z mapą.
    this.map = L.map('explore-map',{
        // Wyłączenie zbędnych opcji mapy.
        zoomControl: false,
        dragging: false,
        closePopupOnClick: false,
        boxZoom: false,
        keyboard: false,

        scrollWheelZoom: 'center', 
        doubleClickZoom: 'center',
        touchZoom:       'center',

        // Poziomy zbliżeń mapy.
        zoomSnap: 1,
        zoomDelta: 1,
        minZoom: 1,
      }).fitWorld();
      
    // Podanie linku do API mapy i tokenu.
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      accessToken: this.mapboxToken,
      id: 'mapbox.streets',
    }).addTo(this.map);

    // Poprawienie linku do Leaflet tak by Framework7 się nie pluł:
    $('#explore-map .leaflet-control-attribution a')
      .addClass('link external').attr('onclick', "window.open(this.href, '_system'); return false;");

    const mainColor = $(':root').css('--main-app-color');

    // Dodanie do mapy koła zakresu widoczności.
    this.mapCircle = L.circle([0,0], {
        color: mainColor,
        fillColor: mainColor,
        fillOpacity: 0.2,
    }).addTo(this.map);

    // Podpięcie eventu ręcznej zmiany zooma.
    this.map.on('zoomend', ()=>{this.eventHandler_mapZoomEnd()});
  }
  // Inicializuje slider pod mapą.
  initRangeSlider(){
    // Parametryzacja slidera i stopni zoom-u.
    const maxZoomIn  = 0;
    const maxZoomOut = 6;
    const initValue  = Storage.getItem('sliderValue') || 1;
    
    // Przygotowanie slidera i jego eventów.
    this.rangeSlider = this.f7.range.create({
      el: "#map-range-slider",
      value: initValue,
      step: 1, min: maxZoomIn, max: maxZoomOut,
      scale: true, scaleSteps: maxZoomOut - maxZoomIn, //label: true,
      formatScaleLabel: (value)=>{
        return this.sliderValueToRadius(value) + 'm';
      },
      on: {
        change: (obj,v)=>{this.eventHandler_sliderMove(v)}
      }
    });

    // Inicializacja zoom-u mapy.
    this.eventHandler_sliderMove(initValue);
  }
  // Ustawia pozycję mapy i okręgu w oparciu o współrzędne geograficzne.
  setMapCenter(coordinates){
    this.map.panTo(coordinates);
    this.mapCircle.setLatLng(coordinates);
  }
  // Ustawia rozmiar okręgu i zbliżenie mapy w oprciu o wartość ze slidera.
  setMapZoom(zoom){
    const sliderVal = this.zoomToSliderValue(zoom);
    const radius = this.sliderValueToRadius(sliderVal);

    // Mapa jest tylko ręcznie oddalona.
    if(this.rangeSlider.max < sliderVal){
      return this.loadMarkers(); 
    }

    // Aktualizacja zoom-u mapy, slidera i rozmiaru koła.
    if(this.rangeSlider.getValue() !== sliderVal)
      return this.rangeSlider.setValue(sliderVal);
    if(this.map.getZoom() !== zoom)
      return this.map.setZoom(zoom);
    if(this.mapCircle.getRadius() !== radius)
      this.mapCircle.setRadius(radius);

    // Wyczyszczenie postów.
    this.clearPage();
    // Aktualizacja tekstu w navbarze.
    this.putPositionNameIntoNavbar();

    // Zarządanie odświerzenia strony.
    this.setRefreshTimeout();
  }
  // Wstawia napis do navbaru.
  setNavbarHTML(html = ''){
    this.jqNavabr.html(html);
  }
  // Aktualizuje tekst navbarze w obarciu o zmienne zoomu i nazwy lokalizacji. 
  putPositionNameIntoNavbar(){
    var radius = this.mapCircle.getRadius();
    this.setNavbarHTML(
      `${this.currentPositionName} <span style="opacity: 0.6">(${radius}m)</span>`
    );
  }
  // Pokazuje preloader w pojemniku.
  showPreloader(){
    this.jqPreloader.css('display', 'block');
  }
  // Ukrywa preloader w pojemniku.
  hidePreloader(){
    this.jqPreloader.css('display', 'none');
  }
  // Usuwa wszystkie markery.
  clearMarkers(){
    for(const marker of this.markers){
      marker.remove();
    }
    this.markers = [];
  }
  // Czyści zakładkę do stanu początkowego.
  resetPage(){
    this.clearPage();
    this.lastEntryId = null;
    this.showPreloader();
    this.jqContentContiner.off('infinite');

    // Trickowy BUGFIX:
    // Dodanie postu powoduje zmianę rozmiaru okna w innej zakładce przy
    // wysuwaniu klawiatury. To z jakiegoś powodu psuje wyświetlanie mapki.
    // Dlatego na wszelki wypadek warto ją poinformować że okno mogło zmienić
    // chwilowo rozmiar i potrzebny jest update.
    this.map._onResize();
  }
  // Usuwa z GUI wszystkie wczytane posty.
  clearPage(){
    this.jqCardsContainer.empty();
  }
  // Funkcja spróbuje ustalić ładna nazwę po koordynatach.
  updateCurrentPositionName(){
    // Przygotowanie zmiennych.
    const position = this.currentPosition;

    // HTTP Request metodą GET:
    var request = $.ajax({
      url: "https://nominatim.openstreetmap.org/reverse.php",
      method: "GET",
      dataType: "json",
      timeout: 3000,
      data: { format : 'json', lat: position.lat, lon: position.lon, zoom: 18 },
      success: (json)=>{
        var address = json.address;

        // Wybranie członów adresu tak by zrobić ładną nazwę.
        var nameParts = [];
        if(address.road){
          nameParts.push(address.road);
          if(address.house_number)
            nameParts[0] += ' ' + address.house_number;
        }
        else
          if(address.city_district)
            nameParts.push(address.city_district);
        if(address.city)
          nameParts.push(address.city);
        else
          if(address.country)
            nameParts.push(address.country);
        
        // Określenie słownej nazwy lokalizacji.
        this.currentPositionName = nameParts.join(', ');
        this.putPositionNameIntoNavbar();
      },
      error: (jqXHR, textStatus, errorThrown )=>{
        // Jeśli nie udało pozyskać nazwy lokalizacji to jako nazwa brane są współrzędne.
        this.currentPositionName = position.lat.toFixed(6) + ', ' + position.lon.toFixed(6);
        this.putPositionNameIntoNavbar();
      }
    });
  }
  // Pobiera informację o wszystkich postach widocznych na mapie i umieszcza markery.
  // Wywołuje się po ustawieniu mapy.
  loadMarkers(){
    // Zaplanowanie naniesienia markerów na mapę by uniknąć zbyt czestych requestów.
    if(this.loadMarkersTimeout) clearTimeout(this.loadMarkersTimeout);
    this.loadMarkersTimeout = setTimeout(async ()=>{
      this.loadMarkersTimeout = null;
      try{
        // Pobranie informacji o wpisach na widocznym fragmęcie mapy.
        var mapBounds = this.map.getBounds();
        var points = await clientServer.request({
          data: {
            "northEast": {
              lat: mapBounds._northEast.lat,
              lon: mapBounds._northEast.lng,
            },
            "southWest": {
              lat: mapBounds._southWest.lat,
              lon: mapBounds._southWest.lng,
            },
          },
          endpoint: '/getpoints.php',
        });

        // Usunięcie wszystkich markerów które obecnie są na mapie.
        this.clearMarkers();
  
        // Potrzebne zmienne.
        const mainColor = $(':root').css('--main-app-color');
        const currentPosition = L.latLng(
          [this.currentPosition.lat, this.currentPosition.lon]);
        const radius = this.mapCircle.getRadius();

        // Dodanie nowych markerów na mapę.
        for(const point of points){
          var marker = null;
          // Punkty poza promieniem widocznosci.
          if(currentPosition.distanceTo([point.lat, point.lon]) > radius){
            marker = L.circleMarker([point.lat, point.lon], {
              color: mainColor, opacity: 1, weight: 1,
              fillColor: 'red', fillOpacity: 0.5, radius: 4,
            });
          }
          // Punkty w promieniu widocznosci.
          else{
            marker = L.circleMarker([point.lat, point.lon], {
              color: mainColor, opacity: 1, weight: 1,
              fillColor: 'red', fillOpacity: 0.5, radius: 4,
            });
            marker.on('click', ()=>{
              alert(JSON.stringify(point));
            });
          }
          marker.addTo(this.map);
          this.markers.push(marker);
        }
      }catch(error){
        this.f7.methods.showErrorMessage(`Nie udało się nanieść wpisów na mapę!`);
        alert(error.message);
      }
    }, 500);
  }
  // Realizuję operacje dodawania wpisów do GUI i infinite scrolla.
  async loadNextEntries(){
    try{
      // Pobranie z serwa danych kolejnych wpisów.
      var entriesData = await clientServer.request({
        data: {
          lastId: this.lastEntryId,
          lat: this.currentPosition.lat,
          lon: this.currentPosition.lon,
          radius: this.mapCircle.getRadius(),
        },
        endpoint: '/getposts.php',
      });

              // ######### DEVELOPMENT:
              if(clientServer.FAKE_SERVER_REQUESTS){
                entriesData = [{
                    id: 1,
                    userId: 1,
                    userName: 'Tadeusz Półklata',
                    lat: 50.36287,
                    lon: 18.85391,
                    date: '2012-04-23T18:25:43.511Z',
                    image: 'https://www2.fch.vut.cz/lectures/thermophysics/2014/images/invited_Bodzenta.jpg',
                  },{
                    id: 2,
                    userId: 1,
                    userAvatar: 'https://4.allegroimg.com/original/035fec/5067e31547da8fe44c7875ebe574',
                    userName: 'Aroff Mandela',
                    lat: 50.36587,
                    lon: 18.85691,
                    date: '2012-04-23T18:25:43.511Z',
                    text: 'Dobra bożena nie jest zła',
                    //image: 'https://www.radiopiekary.pl/wp-content/uploads/2018/12/pasteura-bytom-zmiana.jpg',
                  }
                ];
              }

      // Wrzucenie wpisów do GUI.
      for(var data of entriesData)
        this.jqCardsContainer.append(
          this.createEntryJQ(data)
        );

      // Zaktualizowanie ostatniego wczytanego indeksu.
      if(entriesData.length !== 0)
        this.lastEntryId = entriesData[entriesData.length - 1].id;

      // Kontynuowanie infiniteScrolla jeśli jest co wczytywać.
      if(entriesData.length === this.AJAX_MAX_ITEM_LOAD){
        var obj = this;
        this.jqContentContiner.one('infinite', function(){
          obj.loadNextEntries();
        });
      }
      // Zakończenie wczytywania wpisów.
      else{
        this.hidePreloader();
      }
    }
    catch(error){
      this.hidePreloader();
      this.f7.methods.showErrorMessage(`Nie udało się pobrać wpisów!`);
      alert(error.message);
    }
  }

  // Wczytuję obecną lokalizację i rozpoczyna proces wczytywania postów.
  async refresh(){
    // Reset stanu zakładki.
    this.resetPage();

    // Uruchomienie wczytywania postów.
    try{
      // Określenie pozycji i aktualizacja GUI:
      this.setNavbarHTML('<span style="opacity: 0.6">Trwa pozyskiwanie lokalizacji...</span>');
      var position = await this.cordovaApp.getCurrentPosition();
      this.setMapCenter([position.lat, position.lon]);
      this.currentPosition = position;

      // Naniesienie postów na mapę.
      this.loadMarkers();
      // Próbuje przez odwróćoną geolokację ustalić ładną nazwę lokalizacji.
      this.updateCurrentPositionName();
      // Uruchomienie wczytywania wpisów.
      this.loadNextEntries();
    }
    catch(error){
      this.hidePreloader();
      this.f7.methods.showErrorMessage(`Nie udało się ustalić lokalizacji!`);
      this.setNavbarHTML(`<i class="fas fa-exclamation-triangle"></i> Nie udało się ustalić lokalizacji!`);
      alert(error.message);
    }
  }
  // Zarządanie wywołania funkcji refresh z zapobiegnieciem nadmiernego odświerzania.
  setRefreshTimeout(timeoutTime = 1000){
    if(this.allowRefresh){
      // Usunięcie zaplanowanego refresh-a.
      clearTimeout(this.sliderMoveRefreshTimeout);
      // Zaplanowanie nowego refresha.
      this.sliderMoveRefreshTimeout = setTimeout(()=>{
        this.sliderMoveRefreshTimeout = null;
        this.refresh();
      }, timeoutTime);
    }
  }


  // -------------------- INICIALIZACJA OBKIEKTU ------------------ //

  constructor(){
    // Inicializacja zmiennych.
    this.f7 = null;
    this.cordovaApp = null;
    this.currentPosition = null;
    this.currentPositionName = '???';
    this.lastEntryId = null;
    this.sliderMoveRefreshTimeout = null;
    this.loadMarkersTimeout = null;
    this.rangeSlider = null;
    this.allowRefresh = null;
    this.markers = [];

    // Parametry.
    this.AJAX_MAX_ITEM_LOAD = 20;
  }

  // Inicializacja zakładki po załadowaniu obiektu przez router.
  init(f7, cordovaApp){
    // Zachowanie obiektu aplikacji Framework7 i Cordova.
    this.f7 = f7;
    this.cordovaApp = cordovaApp;

    // Zapisanie obiektów jQuery.
    this.jqExploreView = $('#view-explore');
    this.jqContentContiner = $('.explore-page-content');
    this.jqCardsContainer = $('.entry-cards-container');
    this.jqPreloader = $('.explore-page-content .preloader');
    this.jqNavabr = $('#explore-page-navbar .title');

    // Inicializacja mapy i slidera.
    this.initMap();
    this.initRangeSlider();

    // Zaplanowanie dalszej inicializacji gdy gotowe będą API Cordovy.
    this.cordovaApp.onDeviceReady(()=>{
      this.allowRefresh = true;
      this.setRefreshTimeout(0);
      this.jqExploreView.on('tab:show', ()=>{this.eventHandler_tabShow()});
      this.jqExploreView.on('tab:hide', ()=>{this.eventHandler_tabClose()});
      this.jqContentContiner.on('ptr:refresh', ()=>{this.refresh(); this.f7.ptr.done();});
    });
  }
}

export default new ExplorePage();