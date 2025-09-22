export class Calendario { 

    constructor(
        public id: string = '0',
        public dia: Date = new Date(),
        public hora_inici: string = '',
        public hora_fi: string = '',
        public color: string = '',
        public descripcio: string = '',
        public sala: string = ''
    ) { }
    
}