import { lazy, Suspense, useEffect } from "react";
import { TodoProvider } from "./context/TodoContext";
import { useTodoContext } from "./context/TodoContext";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import Pagination from "./components/Pagination/Pagination";
import "./styles/global.css";

const AddTodo = lazy(() => import("./components/AddTodo/AddTodo"));
const Board = lazy(() => import("./components/Board/Board"));

const AppContent = () => {
  const { state, dispatch, refreshTodos } = useTodoContext();

  useEffect(() => {
    refreshTodos();
  }, [state.currentPage, refreshTodos]);

  if (state.isLoading) return <div className="loading">Loading todos...</div>;
  if (state.error) {
    throw new Error(state.error);
  }

  return (
    <div className="app-container">
      <h1 className="app-header">Todo Board</h1>
      <Suspense fallback={<div className="loading">Loading components...</div>}>
        <AddTodo />
        <Board />
        <Pagination
          currentPage={state.currentPage}
          totalItems={state.totalTodos}
          pageSize={state.pageSize}
          onPageChange={(page) => dispatch({ type: "SET_PAGE", payload: page })}
        />
      </Suspense>
    </div>
  );
};

const App = () => (
  <TodoProvider>
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  </TodoProvider>
);

export default App;
