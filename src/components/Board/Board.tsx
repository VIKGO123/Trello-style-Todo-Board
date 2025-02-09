import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useMemo } from 'react';
import { useTodos } from '../../hooks/useTodos';
import Lane from '../Lane/Lane';
import { Status } from '../../constants/statuses';

const Board = () => {
  const { todos, toggleStatus } = useTodos();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const todoId = Number(result.draggableId);
    const newStatus = result.destination.droppableId as Status;
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    // Determine current status based on flags
    const currentStatus = todo.completed ? Status.COMPLETED :
                          todo.inProgress ? Status.IN_PROGRESS :
                          Status.PENDING;

    // If status has changed, update immediately (optimistically)
    if (currentStatus !== newStatus) {
      toggleStatus(todoId, newStatus);
    }
  };

  const categorizedTodos = useMemo(() => ({
    [Status.PENDING]: todos.filter(todo => !todo.completed && !todo.inProgress),
    [Status.IN_PROGRESS]: todos.filter(todo => !todo.completed && todo.inProgress),
    [Status.COMPLETED]: todos.filter(todo => todo.completed)
  }), [todos]);

  return (
    <div className="board">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="lanes">
          {Object.values(Status).map((status) => (
            <Lane
              key={status}
              status={status}
              todos={categorizedTodos[status]}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;
