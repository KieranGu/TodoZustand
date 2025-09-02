import styles from './TodoList.module.css';
import { useState, useEffect } from 'react';
import { useTodoStore } from './stores/TodoStores';
import api from './service/api';

function TodoItem({ title, completed, onToggle }) {
    const itemClassName = `${styles.item} ${completed ? styles.completed : ''}`;
    return (
        <>
            <li className={itemClassName}>
                <label>
                    <input type="checkbox" checked={completed} onChange={onToggle} />
                    {title} {completed && '✅'}
                </label>
            </li>           
        </>
    );
}

export default function TodoList() {
    const [inputValue, setInputValue] = useState('');
    const { todos, addTodo, toggleTodo, deleteCompletedTodos, setTodos } = useTodoStore();
    const [isInitialized, setIsInitialized] = useState(false);

    // 只在初始化时加载远程数据，避免重复
    useEffect(() => {
        if (isInitialized) return;
        async function fetchRemoteTodos() {
            try {
                const response = await api.get('/todos');
                if (response && response.data) {
                    setTodos(response.data.map(item => ({
                        id: item.id,
                        title: item.title,
                        status: item.status // 用 status 字段
                    })));
                    setIsInitialized(true);
                }
            } catch (err) {
                console.error('远程获取失败', err);
            }
        }
        fetchRemoteTodos();
    }, [isInitialized, setTodos]);

    // 过滤掉已完成
    const [isFilter, setIsFilter] = useState(false);
    const filteredItems = isFilter ? todos.filter(todo => todo.status !== 'completed') : todos;

    // 切换 todo 状态并同步数据库
    const handleItemToggle = async (todoId) => {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;
        const newStatus = todo.status === 'todo' ? 'completed' : 'todo';
        try {
            await api.post(`/todos/${todoId}`, {
                ...todo,
                status: newStatus
            });
            toggleTodo(todoId); // 本地切换状态
        } catch (err) {
            // 错误处理已在拦截器里统一 alert
        }
    };

    // 使用 Zustand
    const AddTodo = async () => {
        if (inputValue.trim()) {
            try {
                const response = await api.post('/todos', {
                    title: inputValue.trim(),
                    status: 'todo'
                });
                // 后端返回新 todo（带 id），直接加入本地
                if (response && response.data) {
                    addTodo({
                        id: response.data.id,
                        title: response.data.title,
                        status: response.data.status
                    });
                }
                setInputValue(''); // 清空输入框
            } catch (err) {
                // 错误处理已在拦截器里统一 alert
            }
        }
    };

    // 删除选中的 todos，并同步数据库
    const handleDeleteCompleted = async () => {
        const completedTodos = todos.filter(todo => todo.status === 'completed');
        // 删除数据库中的已完成 todo
        await Promise.all(
            completedTodos.map(todo =>
                api.delete(`/todos/${todo.id}`).catch(() => {})
            )
        );
        // 删除后重新拉取远程 todos，确保同步
        try {
            const response = await api.get('/todos');
            if (response && response.data) {
                setTodos(response.data.map(item => ({
                    id: item.id,
                    title: item.title,
                    status: item.status
                })));
            }
        } catch (err) {
            // 错误处理已在拦截器里统一 alert
        }
    };

    return (
        <section className={styles.container}>
            <h1>Sally Ride 的 Todo 清单</h1>
            {/* 输入框 */}
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="new Todo"
                    className={styles.todoInput}

                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button className={styles.addButton} onClick={AddTodo}>添加</button>
            </div>

            <label>
                <input type="checkbox" checked={isFilter} onChange={() => setIsFilter(!isFilter)} />
                过滤已完成的待办事项
            </label>
            <ul>
                {filteredItems.map(item => (
                    <TodoItem key={item.id}
                        title={item.title}
                        completed={item.status === 'completed'}
                        onToggle={() => handleItemToggle(item.id)}
                    />
                ))}
            </ul>
            <button className={styles.deleteButton} onClick={handleDeleteCompleted}>删除</button>
        </section>
    );
}