import React, { createContext, useReducer, useContext, useCallback, ReactNode } from 'react';
import { fetchTodos } from '../api/todoService';
import { Todo } from '../api/types';

type TodoState = {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalTodos: number;
  pageSize: number;
};

type TodoAction =
  | { type: 'FETCH_TODOS_REQUEST' }
  | { type: 'FETCH_TODOS_SUCCESS'; payload: Todo[] }
  | { type: 'FETCH_TODOS_FAILURE'; payload: string }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_TOTAL'; payload: number };

const TodoContext = createContext<{
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
  refreshTodos: () => Promise<void>;
}>(undefined!);

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'FETCH_TODOS_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_TODOS_SUCCESS':
      return { ...state, isLoading: false, todos: action.payload };
    case 'FETCH_TODOS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD_TODO':
      return { ...state, todos: [action.payload, ...state.todos] };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? action.payload : todo
        ),
      };
    case 'DELETE_TODO':
      return { ...state, todos: state.todos.filter(todo => todo.id !== action.payload) };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_TOTAL':
      return { ...state, totalTodos: action.payload };
    default:
      return state;
  }
};

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalTodos: 0,
    pageSize: 30
  });

  const refreshTodos = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_TODOS_REQUEST' });
      const { todos, total } = await fetchTodos(state.pageSize, (state.currentPage - 1) * state.pageSize);
      dispatch({ type: 'FETCH_TODOS_SUCCESS', payload: todos });
      dispatch({ type: 'SET_TOTAL', payload: total });
    } catch (error) {
      dispatch({ type: 'FETCH_TODOS_FAILURE', payload: (error as Error).message });
    }
  }, [state.currentPage, state.pageSize]);

  return (
    <TodoContext.Provider value={{ state, dispatch, refreshTodos }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};