// IMPORTS  
require('colors');
const axios = require('axios');
const fs = require('fs');

/**
 * 
 *  Representa los datos o el conjunto de busquedas realizadas
 * 
 */
class Busquedas {

    historial = [];
    rutaBaseDatos = './db/basededatos.json';

    constructor() {
        // Leer DB
        try {

            const data = this.leerBaseDeDatos();
            this.historial = data.historial;

        } catch (error) {
            this.historial =  [];
        }
    }

    /**
     * 
     *  GETTER, parametros para realizar peticion a MAPBOX
     * 
     */
    get paramsMapBox() {
        return {
            'limit': 5,
            'language': 'es',
            'access_token': process.env.MAPBOX_KEY 
        }
    }

    /**
     * 
     *  GETTER, parametros de busqueda para realizar peticion a OPENWEATHER
     * 
     */
    get paramsOpenWeather() {

        const dataUnidadMedida = 'metric';
        const dataLang = 'es';

        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': dataUnidadMedida,
            'lang': dataLang
        }
    }

    /**
     * 
     *  Funcion asincrona encargada de realizar una peticion a la API de MAPBOX, con el objetivo de conseguir
     *  informacion sobre una ciudad utilizando axios
     * 
     * @param {*} ciudad string nombre de la ciudad
     * @returns array con ciudades encontradas
     */
    async getCiudad( ciudad = '' ) {
     
        try {
            
            const axiosInstance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ ciudad }.json`,
                timeout: 3000,
                params: this.paramsMapBox
            });
    
            const resp = await axiosInstance.get();

            return resp.data.features.map( ciudad => ({
                id: ciudad.id,
                nombre: ciudad.place_name_es,
                lng: ciudad.center[0],
                lat: ciudad.center[1]
            }));

        } catch ( error ) {
            throw new Error('Ninguna coincidencia encontrada, intente otra vez!'.red);
        }
    }

    /**
     * 
     *  Funcion asincrona encargada de realizar una peticion a la API de OPENWEATHER, con el objetivo de conseguir
     *  informacion sobre el clima de una ciudad utilizando axios
     * 
     * @param {*} lat number latitud de la ciudad
     * @param {*} lon number longitud de la ciudad
     * @returns objeto con informacion sobre el clima
     */
    async getClima( lat=0, lon=0 ) {

        try {
            
            const axiosInstance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                timeout: 5000,
                params: { lat, lon, ...this.paramsOpenWeather }
            });
    
            const resp = await axiosInstance.get();
            const { weather, main } = resp.data;
            
            return {
                desc: weather[0].description,
                temp: main.temp,
                tempMax: main.temp_max,
                tempMin: main.temp_min,
                sensacionTermica: main.feels_like
            }

        } catch (error) {
            throw error;
        }

    }
    
    /**
     * 
     *  Mantiene actualizado el listado de busquedas. Tambien actualiza la base de datos.
     *  
     * @param {*} ciudad objeto con informacion de una ciudad
     * @param {*} climaCiudad objeto con informacion sobre el clima de una ciudad
     */
    guardarBusqueda( ciudad={}, climaCiudad={} ) {
        
        try {

            let ciudadRepetidaIndex = 0; 

            // Prevenir duplicados
            const noExisteRegistroPrevio = this.historial.every( ( busqueda, index ) => {
                
                if(busqueda.id === ciudad.id ) {
                    ciudadRepetidaIndex = index;
                    busqueda.clima = climaCiudad;
                    return false;
                }
                
                return true;
            });
            
            // La busqueda con registro actualizado debera relocalizarse al comienzo del array
            //                como si se tratase de una nueva busqueda
            if ( !noExisteRegistroPrevio ) {
                if ( ciudadRepetidaIndex > 4 ) 
                    this.historial.unshift( this.historial.splice(ciudadRepetidaIndex, 1)[0] );
            }
                
            // Cargar el array
            if (noExisteRegistroPrevio) 
                this.historial.unshift( { id: ciudad.id, nombre: ciudad.nombre, clima: climaCiudad } );

            // Grabar en archivo
            this.persistirData();
            
        } catch (error) {
            throw new Error('No se puede almacenar busquedas: ' + error.message + ' Ver: ' + error.name);
        }
    }

    /**
     *  Retorna las ultimas cinco busquedas del historial o lo que es lo mismo, las cinco busquedas mas recientes
     * 
     * @returns array que representa el historial de busqueda del usuario
     */
    ultimoHistorial() {
        
        if (this.historial.length > 5)
            return this.historial.slice(0,5);
        
        return this.historial;
    }

    /**
     *  Realiza la lectura de los datos persistidos del usuario
     * 
     * @returns array data
     * 
     */
    leerBaseDeDatos() {
        try {

            //flag 'r': Open file for reading. An exception occurs if the file does not exist.
            const datos = fs.readFileSync( this.rutaBaseDatos, { encoding: 'utf8', flag: 'r' } );

            return JSON.parse(datos);

        } catch (error) {
            throw error;
        }
    }

    /**
     * 
     *  Persiste los datos generados por el usuario
     * 
     */
    persistirData() {
        try {
            
            const payload = {
                historial: this.historial
            };
    
            fs.writeFileSync( this.rutaBaseDatos, JSON.stringify( payload ) );

        } catch (error) {
            throw error;
        }
    }

}

module.exports = Busquedas; 