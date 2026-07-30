import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  async login(body: { email: string; password: string }) {
    // TODO: Implement real authentication
    return { message: "Login endpoint ready", email: body.email };
  }

  async register(body: { name: string; email: string; password: string }) {
    // TODO: Implement real registration
    return { message: "Register endpoint ready", email: body.email };
  }
}