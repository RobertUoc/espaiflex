export class Reserva { 

    constructor(
        public id: string = '0',
        public dia: Date = new Date(),
        public hora_inici: string = '',
        public hora_fi: string = '',
        public import_sala: number = 0,
        public user: string = '',
        public id_complements: string = '0',
        public complement: string = '',
        public preu: string = '0',
        public nom_sala: string = '',
        public id_edifici: string = '',
        public preu_sala: string = '0',
        public max_ocupacio: string = '0',
        public missatge: string = '',
        public horari: string = '1'
    ) { }
    
}