import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "todo-frontend.tasks";

const initialTodos = [
  {
    id: "seed-plan",
    title: "Plan the first feature",
    completed: false,
    createdAt: Date.now() - 3000
  },
  {
    id: "seed-review",
    title: "Review completed tasks",
    completed: true,
    createdAt: Date.now() - 2000
  }
];

function loadTodos() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialTodos;
  } catch {
    return initialTodos;
  }
}

function createTodo(title) {
  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: Date.now()
  };
}

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" }
];

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    return {
      total: todos.length,
      completed,
      active: todos.length - completed
    };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [filter, todos]);

  function handleAddTodo(event) {
    event.preventDefault();
    const title = draft.trim();

    if (!title) {
      return;
    }

    setTodos((currentTodos) => [createTodo(title), ...currentTodos]);
    setDraft("");
    setFilter("all");
  }

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function removeTodo(id) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  function beginEdit(todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  function saveEdit(id) {
    const title = editingTitle.trim();

    if (!title) {
      removeTodo(id);
      cancelEdit();
      return;
    }

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, title } : todo
      )
    );
    cancelEdit();
  }

  function handleEditKeyDown(event, id) {
    if (event.key === "Enter") {
      saveEdit(id);
    }

    if (event.key === "Escape") {
      cancelEdit();
    }
  }

  function clearCompleted() {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  }

  return (
    <main className="app-shell">
      <section className="todo-panel" aria-labelledby="todo-heading">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Todo workspace</p>
            <h1 id="todo-heading">Today&apos;s tasks</h1>
          </div>
          <div className="stats-grid" aria-label="Todo summary">
            <span>
              <strong>{stats.total}</strong>
              Total
            </span>
            <span>
              <strong>{stats.active}</strong>
              Active
            </span>
            <span>
              <strong>{stats.completed}</strong>
              Done
            </span>
          </div>
        </div>

        <form className="todo-form" onSubmit={handleAddTodo}>
          <label htmlFor="todo-title">New task</label>
          <div className="todo-entry">
            <input
              id="todo-title"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a task"
              maxLength="120"
            />
            <button type="submit" disabled={!draft.trim()}>
              Add
            </button>
          </div>
        </form>

        <div className="toolbar">
          <div className="filter-group" aria-label="Filter todos">
            {filters.map((item) => (
              <button
                key={item.value}
                className={filter === item.value ? "selected" : ""}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            className="clear-button"
            type="button"
            onClick={clearCompleted}
            disabled={stats.completed === 0}
          >
            Clear completed
          </button>
        </div>

        {visibleTodos.length > 0 ? (
          <ul className="todo-list" aria-label="Todos">
            {visibleTodos.map((todo) => {
              const isEditing = editingId === todo.id;

              return (
                <li
                  className={todo.completed ? "todo-item completed" : "todo-item"}
                  key={todo.id}
                >
                  <label className="check-control">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <span aria-hidden="true" />
                  </label>

                  {isEditing ? (
                    <input
                      className="edit-input"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      onBlur={() => saveEdit(todo.id)}
                      onKeyDown={(event) => handleEditKeyDown(event, todo.id)}
                      autoFocus
                      aria-label={`Edit ${todo.title}`}
                      maxLength="120"
                    />
                  ) : (
                    <button
                      className="todo-title"
                      type="button"
                      onClick={() => beginEdit(todo)}
                    >
                      {todo.title}
                    </button>
                  )}

                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => removeTodo(todo.id)}
                    aria-label={`Delete ${todo.title}`}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state" role="status">
            <h2>No tasks here</h2>
            <p>
              {filter === "all"
                ? "Add a task to get started."
                : `No ${filter} tasks match this view.`}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
