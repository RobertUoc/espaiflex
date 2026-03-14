import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Users } from '../../../../models/users.model';
import { UsersService } from '../../../../service/users.service';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [FormsModule, NgIf ],
  templateUrl: './register-modal.component.html'
})
export class RegisterModalComponent {
  @Input() user: Users | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Users>();  
  public confirm: string = '';
  public validationErrors: { [key: string]: string[] } = {};
  public backendMessage: string = '';

  registerData = new Users();
  finestra = 1; // 1 = insert, 3 = update

  constructor(private userService: UsersService) { }

  ngOnInit(): void {
    if (this.registerData.id == 0) {
      this.registerData = new Users();
      this.confirm = '';
    }
  }

  onInputChange() {
    this.validationErrors = {};
    this.backendMessage = '';
  }

  getError(field: string): string | null {
    return this.validationErrors[field]?.[0] || null;
  }

  ngOnChanges() {
    if (this.user) {      
      this.registerData = { ...this.user };
    }
  }

  onRegisterSubmit() {
    const action$ = this.isUpdate()
      ? this.userService.putUser(          
          this.registerData
        )
      : this.userService.insertUser(
          this.registerData
        );
      action$.subscribe({
        next: () => {
          this.validationErrors = {};
          this.backendMessage = '';
          this.saved.emit(this.registerData);
          this.close.emit();
        },
        error: (err) => {
          if (err.status === 422) {
             this.backendMessage = err.error.message;
             this.validationErrors = err.error.errors || {};
          }
        }
      });    
  }
  
  passwordsMatch(): boolean {
    return this.registerData.password === this.confirm;
  }

  isUpdate(): boolean {
    return !!this.registerData?.id && this.registerData.id !== 0;
  }  

}
