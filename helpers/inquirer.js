// IMPORTS
const colors = require('colors');
const inquirer = require('inquirer');

// creamos un objeto con formato de QUESTION para utilizarlo con INQUIRER
const menuOpts = [
    /**
     *  Este objeto le indicara a inquirer que debera crear un menu LISTA
     *  en el cual el valor de la opcion que el usuario elija se guardara en NAME: optValue
     *  el titulo a mostrar sera el valor de MESSAGE
     *  luego CHOICES contendra cada una de las opciones disponibles de la lista con su
     *  respectivo valor, y titulo a mostrar
     * 
     *  Tambien estamos haciendo uso de COLORS.JS en cada sentencia '.black, color.green(string), etc'
     * 
     */
    {
        type: 'list',
        name: 'optValue',
        message: colors.green('Seleccione usando flechas:').bgBlack,
        choices: [
            {
                value:'1',
                name: colors.green(` 1. Buscar ciudad`).bgBlack
            },
            {
                value:'2',
                name: colors.green(` 2. Historial`).bgBlack
            },
            {
                value:'0',
                name: colors.green(` 0. Salir`).bgBlack
            }
        ]
    }
];

/**
 *  Muestra en consola el menu principal de la aplicacion haciendo uso de INQUIRER.PROMPT()
 * 
 * @returns string, el valor STRING de la opcion que el usuario haya elegido
 */
const inquirerMenu = async () => {
    console.clear();

    console.log('==============================='.green);
    console.log(colors.gray(' Author:   Facundo Moran.'.bgYellow));
    console.log(colors.gray(' Github:   https://github.com/morandev'.bgYellow));
    console.log(colors.gray(' Linkedin: https://www.linkedin.com/in/facumoransi'.bgYellow));
    console.log('===============================\n'.green);
    
    const { optValue } = await inquirer.prompt(menuOpts);

    return optValue;

}

/**
 *  Utiliza INQUIRER.PROMPT() para simular una pausa durante la ejecucion del menu de la aplicacion. Obliga al usuario
 * a presionar la tecla ENTER para continuar con el uso.
 * 
 * @param {*} message, string que quisieramos que el usuario lea o interprete
 * @returns promise
 */
const menuPauser = async ( message = '' ) => {
    return await inquirer.prompt([{
        type: 'input',
        name: 'enterPressed',
        message: `${message}. ${ 'ENTER'.green } para continuar`
    }]);
}

/**
 *  Input de consola que permite al usuario ingresar un valor o cadena. Obliga al usuario a no ingresar una cadena vacia.
 * 
 * @param {*} message, string que quisieramos que el usuario lea o interprete antes de ingresar algo
 * @returns cadena o valor que representa lo que el usuario ingreso 
 */
const userInput = async ( message = '' ) => {
    const { userMessage } = await inquirer.prompt([{
        type: 'input',
        name: 'userMessage',
        message,
        validate( messageValue ) {
            return  messageValue.length === 0 ? 
                    'Ingrese un valor'
                    : true;
        }
    }]);

    return userMessage;
}

/**
 * 
 *  Imprime en consola una lista de ciudades. Este menu tiene varias opciones. 
 * 
 *  En caso de no poder listar ciudades se disparara una simulacion de pausa indicandole al usuario que debera realizar.
 * 
 * @param {*} ciudades array con ciudades
 * @param {*} mensajeDeError string que comunica al usuario que hacer en caso de error
 * @param {*} titulo string que presenta la informacion a imprimir
 * @returns 
 */
const listarCiudades = async ( ciudades = [], mensajeDeError = '' , titulo = '' ) => {

    try {
        if ( ciudades.length === 0 )
            throw new Error(`${ mensajeDeError }`.red);
        
        console.clear();
    
        console.log('==============================='.green);
        console.log(`     ${ titulo.toUpperCase() }    `.green);
        console.log('===============================\n'.green);
    
    
        // CHOICES: QUESTION PROPERTY
        const choices = ciudades.map( ({ id, nombre }, index) => {
    
            return {
                value: id,
                name: `${ (index+1) }. `.green + `${ nombre }`
            };
    
        })
    
        choices.push(new inquirer.Separator('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), {
            value: 0,
            name: `0. `.green + `cancelar`.blue
        });

        // LISTADO DE CIUDADES
        const { idValue } = await inquirer.prompt([{
            type: 'list',
            name: 'idValue',
            message: 'Elejir una:\n'.yellow,
            choices
        }]);
    
        return idValue;

    } catch ( error ) {
        throw error;
    } 

}

module.exports = {
    inquirerMenu,
    menuPauser,
    userInput,
    listarCiudades,
}