export interface Todo {
    id: number;
    todo: string;
    completed?: boolean;
    userId: number;
    inProgress?: boolean;
    status?:string
  }