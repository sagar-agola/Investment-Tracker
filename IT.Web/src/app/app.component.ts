import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { InvestmentGridModel, InvestmentGridUiModel } from './models/investment-grid.model';
import { environment } from '../environments/environment';
import { TransactionGridModel, TransactionGridUiModel } from './models/transaction-grid.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  investments: InvestmentGridUiModel[] = [];
  transactions: TransactionGridUiModel[] = [];
  selectedInvestmentId: number = 0;

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _http: HttpClient,
    private readonly _currencyPipe: CurrencyPipe,
    private readonly _datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.getInvestments();
  }

  getInvestments(): void {
    this._http.get<InvestmentGridModel[]>(`${environment.apiUrl}/investments`).subscribe({
      next: (response) => {
        this.investments = response.map(item => {
          return {
            ...item,
            totalInvestments: this._currencyPipe.transform(item.totalInvestments, 'USD', 'symbol', '1.0-2')
          }
        });

        if (this.investments.length > 0) {
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
}
