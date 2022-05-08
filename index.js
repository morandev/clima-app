//IMPORTS
require('dotenv').config();

const colors = require('colors');

const { userInput,
        inquirerMenu,
        menuPauser,
        listarCiudades
     } = require('./helpers/inquirer');

const Busquedas = require('./models/busquedas');

//GLOBAL VARIABLES
const busquedasObj = new Busquedas();

//MAIN FUNCTION
async function main() {
    //clear the console to the user
    process.stdout.write("\u001b[0J\u001b[1J\u001b[2J\u001b[0;0H\u001b[0;0W");
    let opt = '';
    let historialArr = [];

    do { //DO-WHILE
        console.clear();
        opt = await inquirerMenu();
        historialArr = busquedasObj.ultimoHistorial();

        switch (opt) {

            //              El usuario elije la opcion uno e introduce el nombre de una ciudad que le interesa 
            //         para conocer el clima y la tempetarura de la misma. Por lo tanto, se realiza dos peticiones 
            //              distintas, una hacia la API de mapa MAPBOX y la otra hacia la API de OPENWEATHER
            case '1': {
                try {

                    const ciudad = await userInput('Nombre de la ciudad:');
                    const ciudadesArr = await busquedasObj.getCiudad(ciudad);
                    const idCiudad = await listarCiudades(ciudadesArr, 'Ninguna coincidencia encontrada, intente otra vez!', 'ciudades encontradas');

                    if (!idCiudad == 0) {

                        const ciudadSeleccionada = ciudadesArr.find(({ id }) => id == idCiudad);
                        const ciudadClimaInfo = await busquedasObj.getClima(ciudadSeleccionada.lat, ciudadSeleccionada.lng);

                        busquedasObj.guardarBusqueda(ciudadSeleccionada, ciudadClimaInfo);
                        
                        imprimirCiudadInfo(ciudadSeleccionada, ciudadClimaInfo);
                    }

                } catch (error) {
                    await menuPauser(error.message);
                }

                break;
            }

            //          El usuario elije la opcion dos y le mostramos o le imprimimos su historial de busqueda,
            //      pero no completo, solo sus ultimos 5 busquedas, en este caso hacemos uso de nuestros datos persistidos
            //          por lo tanto, no se realiza ninguna peticion a ninguna API
            case '2': {
                try {

                    const idCiudad = await listarCiudades( historialArr, 'Historial Vacio!', 'historial');

                    if (!(idCiudad === 0)) {
                        ciudadSeleccionada = historialArr.find(({ id }) => id == idCiudad);
                        imprimirCiudadInfo(ciudadSeleccionada, ciudadSeleccionada.clima);
                    }

                } catch (error) {
                    await menuPauser(error.message);
                }

                break;
            }
        }

        console.log();
        await menuPauser('Menu Principal. Presione');

    } while (opt !== '0'); //DO-WHILE

}

/**
 *  Salida a la consola formateada
 * 
 * @param {*} ciudad objeto con informacion de una ciudad
 * @param {*} climaCiudad objeto con informacion sobre el clima de una ciudad
 */
function imprimirCiudadInfo( ciudad={}, climaCiudad={} ) {
    console.clear();
    console.log(colors.bgYellow('Informacion:\n'.blue));
    console.log(`\tCiudad: `.yellow + `${ ciudad.nombre }`.green);
    console.log(`\tClima: `.yellow + `${ climaCiudad.desc }`.charAt(0).toUpperCase().green + `${ climaCiudad.desc }`.slice(1).green);
    console.log(`\tTemperatura: `.yellow + `${ climaCiudad.temp }°C`.green);
    console.log(`\tT.Max: `.yellow + `${ climaCiudad.tempMax }°C`.green);
    console.log(`\tT.Min: `.yellow + `${ climaCiudad.tempMin }°C`.green);
    console.log(`\tT.Termica: `.yellow + `${ climaCiudad.sensacionTermica }°C`.green);
}

main();
