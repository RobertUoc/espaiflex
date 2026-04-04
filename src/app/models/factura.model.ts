export interface FacturaMes {  
  mes: number;
  total: number;
}

export interface FacturaDia {
  dia: number;
  total: number;
}

export interface Complemento {
  nombre: string;
  precio: number;
}

export interface FacturaDetalle { 
  id: number;
  id_reserva: number;
  data_factura: string;
  dias: number,
  precio_dia: number,
  base: number;
  iva: number;
  iva_import: number;
  total_factura: number;
  enviada: number;
  dia_inici: string;
  dia_fi: string;
  sala?: number;
  nom_sala?: string;
  nom_user?: string;
  email_user?: string;
  complements: Complemento[];
}

export class Factures { 

    constructor(
       public id:number,
       public id_reserva:number,
       public data_factura:string,
       public dias:number,
       public precio_dia:number,
       public base:number,
       public iva:number,
       public iva_import:number,
       public total_factura:number,
       public enviada:number,
       public sala?: number,      
       public nom_sala?: string,
       public nom_user?: string,          
    ) { }
    
}
