import { useCallback} from "react";
import { useTodoContext } from "../context/TodoContext";
import { createTodo, updateTodo, deleteTodo } from "../api/todoService";
import { Status } from "../constants/statuses";
import { Todo } from "../api/types";

export const useTodos = () => {
  const { state, dispatch, refreshTodos } = useTodoContext();

  const addTodo = useCallback(
    async (text: string) => {
      try {
        const min = state.totalTodos + 1;
        const max = state.totalTodos + 1000;
        console.log("state",state);
        const todoId = Math.floor(Math.random() * (max - min + 1)) + min; // // Generate a random id that's always greater than state.totalTodos
        const newTodo :Todo ={
            id: todoId,
            todo: text,
            userId: 1
        }
        dispatch({
          type: "ADD_TODO",
          payload: { ...newTodo, inProgress: false, status: Status.PENDING },
        });
        await createTodo(text); // api call to add record in database for specific added todo
      } catch (error) {
        console.error("Failed to add todo", error);
      }
    },
    [dispatch]
  );

  const editTodo = useCallback(
    async (id: number, updates: { todo: string },individualTodo:Todo) => {
      try {
        const updatedTodo:Todo = individualTodo;
        updatedTodo.todo = updates.todo;
        // Preserve existing inProgress flag if any
        const current = state.todos.find((t) => t.id === id);
        dispatch({
          type: "UPDATE_TODO",
          payload: {
            ...updatedTodo,
            inProgress: current?.inProgress || false,
            status: updatedTodo.completed
              ? Status.COMPLETED
              : current?.inProgress
              ? Status.IN_PROGRESS
              : Status.PENDING,
          },
        });
        await updateTodo(id, updates); //update todo on the api endpoint and preserve UI state
      } catch (error) {
        console.error("Failed to update todo ", error);
      }
    },
    [dispatch, state.todos]
  );

  // Optimistic update: update state immediately then call API in background
  const toggleStatus = useCallback(
    (id: number, newStatus: Status) => {
      const todo = state.todos.find((t) => t.id === id);
      if (!todo) return;
      const updatedTodo = {
        ...todo,
        completed: newStatus === Status.COMPLETED,
        inProgress: newStatus === Status.IN_PROGRESS,
        status: newStatus,
      };
      // Immediately update UI state
      dispatch({ type: "UPDATE_TODO", payload: updatedTodo });
      // Call API asynchronously; if error, you might optionally refresh state
      updateTodo(id, { completed: updatedTodo.completed }).catch((error) => {
        console.error("Failed to update status on API", error);
        // Optionally call refreshTodos() here to revert optimistic update
      });
    },
    [dispatch, state.todos]
  );

  const removeTodo = useCallback(
    async (id: number) => {
        dispatch({ type: "DELETE_TODO", payload: id }); // to make ui state updates are seemless as api is bounded to fail for deletion of newly added todo that does not exists in database
      try {      
        await deleteTodo(id);
      } catch (error) {
        console.error("Failed to delete todo", error);
      }
    },
    [dispatch]
  );

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
