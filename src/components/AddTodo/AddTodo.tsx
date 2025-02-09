import { useState } from 'react';
import { useTodos } from '../../hooks/useTodos';

const AddTodo = () => {
  const [text, setText] = useState('');
  const { addTodo } = useTodos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addTodo(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new task..."
        className="add-todo-input"
      />
      <button type="submit" className="add-todo-button">
        Add Task
      </button>
    </form>
  );
};

export default AddTodo;