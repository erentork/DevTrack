using DevTrack.API.DTOs.Users;
using FluentValidation;

namespace DevTrack.API.Validators;

public class UpdateProfileRequestValidator
    : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(request => request.Username)
            .NotEmpty()
            .WithMessage(
                "Kullanıcı adı zorunludur.")
            .MinimumLength(3)
            .WithMessage(
                "Kullanıcı adı en az 3 karakter olmalıdır.")
            .MaximumLength(50)
            .WithMessage(
                "Kullanıcı adı en fazla 50 karakter olabilir.");

        RuleFor(request => request.Email)
            .NotEmpty()
            .WithMessage(
                "E-posta zorunludur.")
            .EmailAddress()
            .WithMessage(
                "Geçerli bir e-posta adresi giriniz.");
    }
}