import { IsEmail, IsString, MinLength, MaxLength, Matches } from "class-validator";

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>?])/,
    {
      message: "Password must contain uppercase, lowercase, number, and special character",
    },
  )
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;
}