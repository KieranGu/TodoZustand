import { create } from 'zustand';
import todoItems from '../todoitems.json';



export const useTodoStore = create((set, get) => ({
    todos: todoItems,
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
    addTodo: (title) => set((state) => {
        const newTodo = {
            id: Math.max(...state.todos.map(todo => todo.id)) + 1,
            title: title.trim(),
            completed: false
        };
        return { todos: [...state.todos, newTodo] };
    }),

    // 删除已完成的 todos
    deleteCompletedTodos: () => set((state) => ({
        todos: state.todos.filter(todo => !todo.completed)
    })),

    // 获取过滤后的 todos
    getFilteredTodos: () => {
        const { todos, isFilter } = get();
        return isFilter ? todos.filter(todo => !todo.completed) : todos;
    }
}));