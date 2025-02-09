import { Droppable } from '@hello-pangea/dnd';
import TodoCard from '../TodoCard/TodoCard';
import { Status } from '../../constants/statuses';
import { Todo } from '../../api/types';

interface LaneProps {
  status: Status;
  todos: Todo[];
}

const Lane = ({ status, todos }: LaneProps) => {
  return (
    <div className="lane">
      <h3 className="lane-title">{status}</h3>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`cards-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {todos.map((todo, index) => (
              <TodoCard key={todo.id} todo={todo} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Lane;