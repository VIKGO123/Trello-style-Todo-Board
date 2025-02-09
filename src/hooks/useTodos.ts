import { useCallback } from 'react';
import { useTodoContext } from '../context/TodoContext';
import { createTodo, updateTodo, deleteTodo } from '../api/todoService';
import { Status } from '../constants/statuses';

export const useTodos = () => {
  const { state, dispatch, refreshTodos } = useTodoContext();

  const addTodo = useCallback(async (text: string) => {
    try {
      const newTodo = await createTodo(text);
      dispatch({ 
        type: 'ADD_TODO', 
        payload: { ...newTodo, inProgress: false, status: Status.PENDING } 
      });
    } catch (error) {
      console.error('Failed to add todo', error);
    }
  }, [dispatch]);

  const editTodo = useCallback(async (id: number, updates: { todo: string }) => {
    try {
      const updatedTodo = await updateTodo(id, updates);
      // Preserve existing inProgress flag if any
      const current = state.todos.find(t => t.id === id);
      dispatch({ 
        type: 'UPDATE_TODO', 
        payload: { 
          ...updatedTodo, 
          inProgress: current?.inProgress || false, 
          status: updatedTodo.completed ? Status.COMPLETED : (current?.inProgress ? Status.IN_PROGRESS : Status.PENDING)
        }
      });
    } catch (error) {
      console.error('Failed to update todo', error);
    }
  }, [dispatch, state.todos]);

  // Optimistic update: update state immediately then call API in background
  const toggleStatus = useCallback((id: number, newStatus: Status) => {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;
    const updatedTodo = {
      ...todo,
      completed: newStatus === Status.COMPLETED,
      inProgress: newStatus === Status.IN_PROGRESS,
      status: newStatus,
    };
    // Immediately update UI state
    dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
    // Call API asynchronously; if error, you might optionally refresh state
    updateTodo(id, { completed: updatedTodo.completed })
      .catch(error => {
        console.error('Failed to update status on API', error);
        // Optionally call refreshTodos() here to revert optimistic update
      });
  }, [dispatch, state.todos]);

  const removeTodo = useCallback(async (id: number) => {
    try {
      await deleteTodo(id);
      dispatch({ type: 'DELETE_TODO', payload: id });
    } catch (error) {
      console.error('Failed to delete todo', error);
    }
  }, [dispatch]);

  return {
    todos: state.todos,
    isLoading: state.isLoading,
    error: state.error,
    currentPage: state.currentPage,
    totalTodos: state.totalTodos,
    pageSize: state.pageSize,
    addTodo,
    editTodo,
    toggleStatus,
    removeTodo,
    refreshTodos,
  };
};
