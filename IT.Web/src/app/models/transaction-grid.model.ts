export interface TransactionGridModel {
  id: number;
  transactionDate: Date;
  amount: number;
  interest150: number;
  interest125: number;
  interest100: number;
}

export interface TransactionGridUiModel {
  id: number;
  transactionDate: string | null;
  amount: string | null;
  interest150: string | null;
  interest125: string | null;
  interest100: string | null;
}