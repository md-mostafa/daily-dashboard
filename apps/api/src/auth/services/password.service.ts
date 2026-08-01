import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  /**
   * Hash a plaintext password using bcrypt.
   * Cost factor 12 provides ~250ms hash time on modern hardware.
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare a plaintext password against a bcrypt hash.
   * Uses constant-time comparison to prevent timing attacks.
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}