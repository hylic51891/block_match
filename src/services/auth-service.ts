import type { IAuthService } from './types';
import type { IPlatformAdapter } from '@/platform/types';

export class AuthService implements IAuthService {
  private userId: string | null = null;

  constructor(_platform: IPlatformAdapter) {
    // platform reserved for WeChat wx.login() integration
  }

  isLoggedIn(): boolean {
    return this.userId !== null;
  }

  getUserId(): string | null {
    return this.userId;
  }

  async login(): Promise<string> {
    // Web: return mock user id
    // WeChat: call wx.login() -> code -> server exchange -> openid
    const mockId = 'web-user-' + Date.now();
    this.userId = mockId;
    return mockId;
  }
}
