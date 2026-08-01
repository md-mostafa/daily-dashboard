import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TasksModule } from "./tasks/tasks.module";
import { WeatherModule } from "./weather/weather.module";
import { QuotesModule } from "./quotes/quotes.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TasksModule,
    WeatherModule,
    QuotesModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}