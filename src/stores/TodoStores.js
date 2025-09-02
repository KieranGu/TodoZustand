import { create } from 'zustand';
import todoItems from '../todoitems.json';



export const useTodoStore = create((set, get) => ({
    // todos: todoItems,
    isFilter: false,

    todos: [],
    loading: false,
    error: null,

    toggleFilter: () => set((state) => ({ isFilter: !state.isFilter })),

    // 点todo的checkbox
    toggleTodo: (todoId) => set((state) => ({
        todos: state.todos.map(todo =>
            todo.id === todoId
                ? { ...todo, completed: !todo.completed }
                : todo
        )
    })),

    // 添加新的 todo
    addTodo: (todo) => set((state) => {
        // 如果传入的是字符串，则走原逻辑
        if (typeof todo === 'string') {
            const maxId = state.todos.length > 0 ? Math.max(...state.todos.map(t => t.id)) : 0;
            const newTodo = {
                id: maxId + 1,
                title: todo.trim(),
                completed: false
            };
            return { todos: [...state.todos, newTodo] };
        }
        // 如果传入的是对象，直接用对象里的 id/title/completed
        return { todos: [...state.todos, todo] };
    }),

    // 删除已完成的 todos
    deleteCompletedTodos: () => set((state) => ({
        todos: state.todos.filter(todo => !todo.completed)
    })),

    // 获取过滤后的 todos
    getFilteredTodos: () => {
        const { todos, isFilter } = get();
        return isFilter ? todos.filter(todo => !todo.completed) : todos;
    },

    // 一次性设置 todos
    setTodos: (todos) => set(() => ({ todos })),
}));