export interface InvestmentGridModel {
  id: number;
  title: string;
  totalInvestments: number;
}

export interface InvestmentGridUiModel {
  id: number;
  title: string;
  totalInvestments: string | null;
}