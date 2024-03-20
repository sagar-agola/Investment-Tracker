using System;
using System.ComponentModel.DataAnnotations;

namespace IT.Api.DataTransferModels;

public class TransactionCreateUpdateModel
{
    public int Amount { get; set; }
    public DateTime TransactionDate { get; set; }
}
