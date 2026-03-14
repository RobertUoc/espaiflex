export class Edificis { 

    constructor(
       public id:string = '0',
       public nom:string = '',       
       public id_provincia: number | null = null,       
       public descripcio:string = "",
       public actiu:string = 'SI',
       public provincia:string | null,
       public latitud:number = 0,
       public longitud:number = 0,
       public imatge:string = "",
    ) { }
    
}