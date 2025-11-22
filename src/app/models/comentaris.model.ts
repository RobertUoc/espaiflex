export class Comentaris {
  constructor(
    public nom: string = '',
    public descripcio: string = '',
    public dia_inici: string = '',
    public dia_fi: string = '',
    public hora_inici: string = '',
    public hora_fi: string = '',
    public comentari: string = '',
    public puntuacio: number = 0,
    public creat: string = ''
  ) {}
}
