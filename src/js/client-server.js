// --------------- IMPORTOWANIE POTRZEBNYCH OBIEKTÓW I LIBEK ---------//

import $ from 'jquery';
const  Storage = window.localStorage;

// ---------------------- ZASADNICZA CZĘŚĆ KODU -----------------------//

// Klasa do komunikacji z serwerem.
class ClientServer {
    // Wewnętrzna funkcja do Ajax opakowana w Promise.
    _serverAjax(ajaxData){
        return new Promise((resolve, reject)=>{
            // Upewnienie się że przekazano jakiś obiekt.
            if(typeof ajaxData === 'undefined') ajaxData = {};

            // Pobranie adresu serwera.
            var serverUrl = Storage.getItem('serverUrl');

            // Przygotowanie potrzebnych zmiennych.
            var requestEndpoint = ajaxData.endpoint || '';
            var requestMethod = ajaxData.method || "POST";
            var requestData = ajaxData.data || {};
            var requestUrl = serverUrl + requestEndpoint;

                    //######### DEVELOPMENT:
                    this.FAKE_SERVER_REQUESTS = (serverUrl === 'http://httpbin.org/post' || serverUrl === 'https://httpbin.org/post');
                    if(this.FAKE_SERVER_REQUESTS) {requestUrl = serverUrl; requestMethod = 'POST';}

            // Wstrzyknięcie hasłą (tokenu);
            requestData.userPass = this.userPass;

            // Wykonania rządania Ajax.
            $.ajax({
                dataType: "json", // timeout: 3000,

                url: requestUrl,
                method: requestMethod,
                data: requestData,

                // headers: {
                //     "Authorization": this.userPass
                // },
        
                // Doszło do komunikacji z serwerem...
                success: (json)=>{
                  return resolve(json);
                },
      
                // Nie udało się połączyć z serwerem...
                error: (jqXHR, textStatus, errorThrown )=>{
                    // Przygotowanie informacji o błędzie.
                    const message = `AjaxError!\n- url: ${requestUrl}\n- textStatus: ${textStatus}\n- errorThrown:${errorThrown}`;
                    return reject({'message': message});
                }
              });
        });
    }
    // Wykonuje rządanie do serwera.
    request(ajaxData){
        return new Promise(async (resolve, reject)=>{
            // -------- PRZYGOTOWANIE ZMIENNYCH:

            // Upewnienie się że przekazano jakiś obiekt.
            if(typeof ajaxData === 'undefined') ajaxData = {};

            // -------- FUNKCJE POMOCNICZE:

            // Funkcja rejestrująca nowego użytkownika.
            const registerUser = async ()=>{
                var userData = await this._serverAjax({
                    data: {},
                    endpoint: '/register.php',
                });

                        //######### DEVELOPMENT:
                        if (this.FAKE_SERVER_REQUESTS){
                            userData = { userPass: 'abcd', };
                        }

                this.userPass = userData.userPass;
                Storage.setItem('userPass', this.userPass);
            }
            // Funkcja przetwarzająca odpowiedź JSON.
            const processResponse = async (response, allowRegister)=>{
                if(!response.error){
                    // Odpowiedź nie zawiera błędu...
                    return resolve(response);
                }
                else{
                    switch(response.error.code){
                        // Dane użytkownika były niepoprawne...
                        case this.ERROR_CODES.BAD_USER_DATA:
                            if(allowRegister){
                                await registerUser();
                                const newResponse = await this._serverAjax(ajaxData);
                                return await processResponse(newResponse, false);
                            }
                            else{
                                return reject({
                                    message: 'Dane użytkownika są niepoprawne. ' +
                                    'Ponowna rejestracja nie pomogła.',
                                });
                            }
                            break;
                        // Niespodziewany błąd...
                        default:
                            return reject(response.error);
                    }
                }
            }

            // -------- WYKONANIE ŻADANIA AJAX:
            try{
                // Jeśli dane dostępowe nie są znane nastąpi rejestracja.
                if(!this.userPass) await registerUser();

                // Wykonanie właściwego rządania Ajax
                var response = await this._serverAjax(ajaxData);
                return await processResponse(response, true);
            }
            catch(error){
                // Wywalenie do GUI informacji o błędzie połączenia.
                this.f7.methods.showConectionError();
                reject(error);
            }
        });
    }

    // -------------------- INICIALIZACJA OBKIEKTU ------------------ //

    constructor(){        
        this.f7 = null;
        this.ERROR_CODES = {
            BAD_USER_DATA: 1,
        };

        // Pobranie danych dostępowych użytkownika.
        this.userPass = Storage.getItem('userPass');
    }
    // Inicializuje obiekt do komunikacji z serwerem.
    init(f7){
        this.f7 = f7;
    }
}

export default new ClientServer();