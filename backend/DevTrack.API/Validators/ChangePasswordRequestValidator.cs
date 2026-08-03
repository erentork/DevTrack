using DevTrack.API.DTOs.Users;
using FluentValidation;

namespace DevTrack.API.Validators;

public class ChangePasswordRequestValidator
    : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(request =>
                request.CurrentPassword)
            .NotEmpty()
            .WithMessage(
                "Mevcut şifre zorunludur.");

        RuleFor(request =>
                request.NewPassword)
            .NotEmpty()
            .WithMessage(
                "Yeni şifre zorunludur.")
            .MinimumLength(8)
            .WithMessage(
                "Yeni şifre en az 8 karakter olmalıdır.");

        RuleFor(request =>
                request.ConfirmNewPassword)
            .Equal(request =>
                request.NewPassword)
            .WithMessage(
                "Yeni şifreler eşleşmiyor.");
    }
}