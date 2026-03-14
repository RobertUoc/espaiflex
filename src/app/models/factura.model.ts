export interface FacturaMes {  
  mes: number;
  total: number;
}

export interface FacturaDia {
  dia: number;
  total: number;
}

export class Factures { 

    constructor(
       public id:number,
       public id_reserva:number,
       public data_factura:string,
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
