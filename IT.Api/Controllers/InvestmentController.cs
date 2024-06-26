﻿using Dapper;
using IT.Api.DataTransferModels;
using IT.Api.Helpers;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Threading;
using System.Threading.Tasks;

namespace IT.Api.Controllers;

[ApiController]
public class InvestmentController(DatabaseHelpers databaseHelpers) : ControllerBase
{
    [HttpGet("api/investments")]
    public async Task<IActionResult> GetInvestments(CancellationToken cancellationToken)
    {
        string connectionString = databaseHelpers.GetDefaultConnection();
        string query = @"
SELECT [i].[Id],
       [i].[Title],
       SUM([t].[Amount]) AS [TotalInvestments]
FROM [dbo].[Investments] AS [i]
    LEFT JOIN [dbo].[Transactions] AS [t]
        ON [t].[InvestmentId] = [i].[Id]
GROUP BY [i].[Id],
         [i].[Title]
ORDER BY [i].[Title]";

        using SqlConnection connection = new(connectionString);

        await connection.OpenAsync(cancellationToken);

        IEnumerable<InvestmentGridModel> investments = await connection.QueryAsync<InvestmentGridModel>(query);

        return Ok(investments);
    }

    [HttpPost("api/investments")]
    public async Task<IActionResult> CreateUpdateInvestment([FromBody] InvestmentCreateUpdateModel model)
    {
        string connectionString = databaseHelpers.GetDefaultConnection();
        string query;

        if (model.Id.HasValue && model.Id.Value > 0)
        {
            query = "UPDATE [dbo].[Investments] SET [Title] = @Title WHERE [Id] = @Id";
        }
        else
        {
            query = "INSERT INTO [dbo].[Investments] ([Title]) VALUES (@Title)";
        }

        using SqlConnection connection = new(connectionString);

        await connection.OpenAsync();
        await connection.ExecuteAsync(query, model);

        return Ok();
    }

    [HttpDelete("api/investments/{id:int}")]
    public async Task<IActionResult> DeleteInvestment(int id)
    {
        string deleteTransactionsQuery = "DELETE FROM [dbo].[Transactions] WHERE [InvestmentId] = @InvestmentId";
        string deleteInvestmentQuery = "DELETE FROM [dbo].[Investments] WHERE [Id] = @InvestmentId";

        string connectionString = databaseHelpers.GetDefaultConnection();

        using SqlConnection connection = new(connectionString);

        await connection.OpenAsync();

        DbTransaction transaction = await connection.BeginTransactionAsync();

        try
        {
            await connection.ExecuteAsync(deleteTransactionsQuery, new { InvestmentId = id }, transaction);
            await connection.ExecuteAsync(deleteInvestmentQuery, new { InvestmentId = id }, transaction);

            await transaction.CommitAsync();
        }
        catch (Exception exception)
        {
            await transaction.RollbackAsync();

            throw exception;
        }

        return Ok();
    }

    [HttpGet("api/investments/{investmentId:int}/transactions")]
    public async Task<IActionResult> GetTransactions([FromRoute] int investmentId, CancellationToken cancellationToken)
    {
        string connectionString = databaseHelpers.GetDefaultConnection();
        string query = @"
WITH [cte]
AS (SELECT [Id],
           [CreatedAt] AS [TransactionDate],
           [Amount],
           DATEDIFF(MONTH, [CreatedAt], GETUTCDATE()) AS Months
    FROM [dbo].[Transactions]
    WHERE [InvestmentId] = @InvestmentId
   )
SELECT [Id],
       [TransactionDate],
       [Amount],
       CAST([Months] * [Amount] * 0.015 AS DECIMAL(18, 0)) AS Interest150,
       CAST([Months] * [Amount] * 0.0125 AS DECIMAL(18, 0)) AS Interest125,
       CAST([Months] * [Amount] * 0.01 AS DECIMAL(18, 0)) AS Interest100
FROM [cte]
ORDER BY [TransactionDate]";

        using SqlConnection connection = new(connectionString);

        await connection.OpenAsync(cancellationToken);

        IEnumerable<TransactionGridModel> investments = await connection.QueryAsync<TransactionGridModel>(query, new { investmentId });

        return Ok(investments);
    }

    [HttpPost("api/investments/{investmentId:int}/transactions")]
    public async Task<IActionResult> AddTransaction([FromRoute] int investmentId, [FromBody] TransactionCreateUpdateModel model)
    {
        string connectionString = databaseHelpers.GetDefaultConnection();
        string query = "INSERT INTO [dbo].[Transactions] ([Amount], [CreatedAt], [InvestmentId]) VALUES (@amount, @transactionDate, @investmentId)";

        using SqlConnection connection = new(connectionString);

        await connection.OpenAsync();
        await connection.ExecuteAsync(query, new { model.Amount, model.TransactionDate, investmentId });

        return Ok();
    }
}
