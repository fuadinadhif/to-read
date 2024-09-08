declare global {
  namespace Express {
    export interface Request {
      user?: {
        id?: number;
        fullName: string;
        email: string;
        roleId: number;
        roleName: string;
      } | null;
    }
  }
}

export {};
