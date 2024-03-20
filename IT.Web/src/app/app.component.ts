import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { InvestmentGridModel, InvestmentGridUiModel } from './models/investment-grid.model';
import { environment } from '../environments/environment';
import { TransactionGridModel, TransactionGridUiModel } from './models/transaction-grid.model';
import { NgbModal, NgbModalModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { InvestmentCreateUpdateModel } from './models/investment-create-update-model';
import { FormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgbModalModule,
    NgbToastModule,
    ToastrModule
  ],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  selectedInvestmentId: number = 0;
  deleteInvestmentId: number = 0;
  investments: InvestmentGridUiModel[] = [];
  transactions: TransactionGridUiModel[] = [];
  investmentModel: InvestmentCreateUpdateModel = {
    title: ""
  };

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _http: HttpClient,
    private readonly _currencyPipe: CurrencyPipe,
    private readonly _datePipe: DatePipe,
    private readonly _modalService: NgbModal,
    private readonly _toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getInvestments();
  }

  getInvestments(autoSelect: boolean = true): void {
    this._http.get<InvestmentGridModel[]>(`${environment.apiUrl}/investments`).subscribe({
      next: (response) => {
        this.investments = response.map(item => {
          return {
            ...item,
            totalInvestments: this._currencyPipe.transform(item.totalInvestments, 'USD', 'symbol', '1.0-2')
          }
        });

        if (autoSelect && this.investments.length > 0) {
          this.selectedInvestmentId = this.investments[0].id;
          this.getTransactions();
        }
        else {
          this._cdr.detectChanges();
        }
      }
    });
  }

  getTransactions(): void {
    this._http.get<TransactionGridModel[]>(`${environment.apiUrl}/investments/${this.selectedInvestmentId}/transactions`).subscribe({
      next: (response) => {
        this.transactions = response.map(item => {
          return {
            id: item.id,
            transactionDate: this._datePipe.transform(item.transactionDate),
            amount: this._currencyPipe.transform(item.amount, 'USD', 'symbol', '1.0-2'),
            interest150: this._currencyPipe.transform(item.interest150, 'USD', 'symbol', '1.0-2'),
            interest125: this._currencyPipe.transform(item.interest125, 'USD', 'symbol', '1.0-2'),
            interest100: this._currencyPipe.transform(item.interest100, 'USD', 'symbol', '1.0-2'),
          }
        });

        this._cdr.detectChanges();
      }
    });
  }

  openInvestmentCreateUpdatePopup(modalContent: TemplateRef<any>, id: number | undefined = undefined, title: string = ""): void {
    this.investmentModel.id = id;
    this.investmentModel.title = title;

    this.openModal(modalContent);
  }

  saveInvestment(): void {
    this._http.post<void>(`${environment.apiUrl}/investments`, this.investmentModel).subscribe({
      next: () => {
        this._modalService.dismissAll();
        this.getInvestments(false);
      },
      error: (errorResponse: HttpErrorResponse) => {
        this._toastr.error(errorResponse.error.title);
      }
    });
  }

  openDeleteInvestmentConfirmation(modalContent: TemplateRef<any>, investmentId: number): void {
    this.deleteInvestmentId = investmentId;
    this.openModal(modalContent);
  }

  deleteInvestment(): void {
    this._http.delete<void>(`${environment.apiUrl}/investments/${this.deleteInvestmentId}`).subscribe({
      next: () => {
        this._modalService.dismissAll();
        this.getInvestments(this.selectedInvestmentId == this.deleteInvestmentId ? true : false);
      },
      error: (errorResponse) => {
        this._toastr.error(errorResponse.error.title);
      }
    });
  }

  private openModal(modalContent: TemplateRef<any>): void {
    this._modalService.open(modalContent, { backdrop: 'static', keyboard: false });
  }
}
