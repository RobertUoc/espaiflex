import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'PipeFecha',
    standalone: true
})

export class PipeFechaPipe implements PipeTransform {
    transform(value: string | Date): string {
        let dd:number;
        let mm: number;
        let yyyy: number;
        let ddFormat: string;
        let mmFormat: string;
        
        let dateTransform = new Date(value);        

        dd = dateTransform.getDate();
        mm = dateTransform.getMonth() + 1;
        yyyy = dateTransform.getFullYear();

        ddFormat = this.needZero(dd);
        mmFormat = this.needZero(mm);
        
        return ddFormat + '-' + mmFormat + '-' + yyyy ;
                
    }

    private needZero(checkNumber: number): string {
        return checkNumber < 10 ? '0' + checkNumber : String(checkNumber);
    }    
}


