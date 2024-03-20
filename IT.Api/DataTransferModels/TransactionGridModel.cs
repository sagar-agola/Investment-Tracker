using System;

namespace IT.Api.DataTransferModels;

public class TransactionGridModel
{
    public int Id { get; set; }
    public DateTime TransactionDate { get; set; }
    public int Amount { get; set; }
    public int Interest150 { get; set; }
    public int Interest125 { get; set; }
    public int Interest100 { get; set; }
}
