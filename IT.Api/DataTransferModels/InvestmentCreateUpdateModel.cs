using System.ComponentModel.DataAnnotations;

namespace IT.Api.DataTransferModels;

public class InvestmentCreateUpdateModel
{
    public int? Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; }
}
