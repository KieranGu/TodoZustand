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
    // 从URL参数初始化分页
    const params = new URLSearchParams(window.location.search);
    const initialPage = Number(params.get('page')) || 1;
    const initialSize = Number(params.get('size')) || 5;

    const [inputValue, setInputValue] = useState('');
    const { todos, addTodo, toggleTodo, deleteCompletedTodos, setTodos } = useTodoStore();
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);
    const [total, setTotal] = useState(0);

    // 只拉取分页数据
    useEffect(() => {
        async function fetchRemoteTodos() {
            try {
                const response = await api.get(`/todos?page=${page}&size=${size}`);
                if (response && response.data) {
                    setTodos(response.data.map(item => ({
                        id: item.id,
                        title: item.title,
                        complete: item.complete
                    })));
                }
            } catch (err) {
                console.error('远程获取失败', err);
            }
        }
        fetchRemoteTodos();
    }, [page, size, setTodos]);

    // 初始化时获取总数
    useEffect(() => {
        async function fetchTotal() {
            try {
                const response = await api.get('/todos?page=1&size=-1');
                if (response && response.data) {
                    setTotal(response.data.length);
                }
            } catch (err) {
                // 错误处理已在拦截器里统一 alert
            }
        }
        fetchTotal();
    }, []);

    // 分页参数同步到URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page);
        params.set('size', size);
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }, [page, size]);

    // 过滤掉已完成
    const [isFilter, setIsFilter] = useState(false);
    const filteredItems = isFilter ? todos.filter(todo => !todo.complete) : todos;

    // 切换 todo 状态并同步数据库
    const handleItemToggle = async (todoId) => {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;
        const newComplete = !todo.complete;
        try {
            await api.post(`/todos/${todoId}`, {
                ...todo,
                complete: newComplete
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
                await api.post('/todos', {
                    title: inputValue.trim(),
                    complete: false
                });
                setInputValue(''); // 清空输入框
                // 添加后重新拉取当前页和总数
                const [listRes, totalRes] = await Promise.all([
                    api.get(`/todos?page=${page}&size=${size}`),
                    api.get('/todos?page=1&size=-1')
                ]);
                if (listRes && listRes.data) {
                    setTodos(listRes.data.map(item => ({
                        id: item.id,
                        title: item.title,
                        complete: item.complete
                    })));
                }
                if (totalRes && totalRes.data) {
                    setTotal(totalRes.data.length);
                }
            } catch (err) {
                // 错误处理已在拦截器里统一 alert
            }
        }
    };

    // 删除选中的 todos，并同步数据库
    const handleDeleteCompleted = async () => {
        const completedTodos = todos.filter(todo => todo.complete);
        await Promise.all(
            completedTodos.map(todo =>
                api.delete(`/todos/${todo.id}`).catch(() => {})
            )
        );
        // 删除后重新拉取当前页和总数
        try {
            const [listRes, totalRes] = await Promise.all([
                api.get(`/todos?page=${page}&size=${size}`),
                api.get('/todos?page=1&size=-1')
            ]);
            if (listRes && listRes.data) {
                setTodos(listRes.data.map(item => ({
                    id: item.id,
                    title: item.title,
                    complete: item.complete
                })));
            }
            if (totalRes && totalRes.data) {
                setTotal(totalRes.data.length);
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
                        completed={item.complete}
                        onToggle={() => handleItemToggle(item.id)}
                    />
                ))}
            </ul>
            <div style={{marginBottom: '10px'}}>
                <button onClick={() => setPage(page > 1 ? page - 1 : 1)}>上一页</button>
                <span style={{margin: '0 10px'}}>第 {page} 页</span>
                <button 
                    onClick={() => setPage(page + 1)}
                    disabled={page * size >= total}
                >下一页</button>
                <span style={{marginLeft: '20px'}}>每页
                    <input type="number" value={size > 0 ? size : 5} min={1} style={{width: '40px'}} onChange={e => setSize(Number(e.target.value))} />
                    条</span>
            </div>
            <button className={styles.deleteButton} onClick={handleDeleteCompleted}>删除</button>
        </section>
    );
}