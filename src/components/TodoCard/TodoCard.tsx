import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { Todo } from "../../api/types";
import { useTodos } from "../../hooks/useTodos";

interface TodoCardProps {
  todo: Todo;
  index: number;
}

const TodoCard = ({ todo, index }: TodoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.todo);
  const { editTodo, removeTodo } = useTodos();

  const handleSave = async () => {
    if (editedText.trim() && editedText !== todo.todo) {
      await editTodo(todo.id, { todo: editedText });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(todo.todo);
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={String(todo.id)} index={index}>
      {(provided, snapshot) => (
        <div
          className={`todo-card ${snapshot.isDragging ? "dragging" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {isEditing ? (
            <div className="edit-container">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="edit-input"
                autoFocus
              ></textarea>

              <div className="edit-buttons">
                <button
                  type="button"
                  onClick={handleSave}
                  className="save-button"
                  disabled={editedText.trim() === todo.todo}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="card-content">
              <span className="todo-text">{todo.todo}</span>
              <div className="actions">
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-button"
                  aria-label="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeTodo(todo.id)}
                  className="delete-button"
                  aria-label="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TodoCard;
