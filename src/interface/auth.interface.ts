export interface IUserData {
  id?: string;
  user_name: string;
  email: string;
  pass_word: string;
  is_active: boolean;
  last_logged_in: string;
  ip_address: string;
}

export interface TokenPayload {
  id: string;
  email: string;
}
