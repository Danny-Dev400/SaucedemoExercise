import rawUsers from "../data/users.json";

export interface UserCredentials {
  username: string;
  password: string;
}

export const users = rawUsers satisfies Record<string, UserCredentials>;

export type UserKey = keyof typeof users;
