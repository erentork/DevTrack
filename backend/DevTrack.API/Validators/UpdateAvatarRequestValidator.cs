using DevTrack.API.Common;
using DevTrack.API.DTOs.Users;
using FluentValidation;

namespace DevTrack.API.Validators;

public class UpdateAvatarRequestValidator
    : AbstractValidator<UpdateAvatarRequest>
{
    public UpdateAvatarRequestValidator()
    {
        RuleFor(request => request.AvatarKey)
            .NotEmpty()
            .WithMessage(
                "Avatar seçimi zorunludur.")
            .Must(AvatarOptions.IsValid)
            .WithMessage(
                "Geçersiz avatar seçimi.");
    }
}