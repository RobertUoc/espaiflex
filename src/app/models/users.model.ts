export class Users { 
    constructor(
       public id:number = 0,
       public name:string = '',
       public email:string = '',
       public password:string = '',       
       public role: string = 'user',       
    ) { }    
}