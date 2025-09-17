export class Sales {
  constructor(
    public id: string = '0',
    public descripcio: string = '',
    public id_edifici: string = '',
    public nom_edifici: string = '',
    public preu: number = 0,
    public actiu: string = 'SI',
    public color: string = '',
    public missatge: string = '',
    public max_ocupacio: string = '1',
    public horari: string = '1'
  ) {}
}
