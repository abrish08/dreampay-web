import { authPost } from "@/lib/api/client";

export type SignupInput = { business_name: string; name: string; email: string; phone: string; password: string };

export const authApi = {
  login: (email: string, password: string) => authPost<{ mfa_required?: boolean }>("login", { email, password }),
  mfa: (code: string) => authPost("mfa", { code }),
  signup: (input: SignupInput) => authPost("signup", input),
  verify: (email: string, code: string) => authPost("verify", { email, code }),
  resendCode: (email: string) => authPost("verify", { email, resend: true }),
  forgot: (email: string) => authPost("password", { email }),
  reset: (token: string, newPassword: string) => authPost("password", { token, new_password: newPassword }),
};
