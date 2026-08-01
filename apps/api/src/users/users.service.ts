import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  async findAll() {
    // TODO: Implement real user management
    return [];
  }

  async findOne(id: string) {
    // TODO: Implement real user lookup
    return { id, message: "User endpoint ready" };
  }
}