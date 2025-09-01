import styles from './TodoList.module.css';
import { useState } from 'react';
import { useTodoStore } from './stores/TodoStores';
import todoItems from './todoitems.json';

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
    const { todos, addTodo, toggleTodo, deleteCompletedTodos } = useTodoStore();

    // 过滤掉已完成
    const [isFilter, setIsFilter] = useState(false);
    const filteredItems = isFilter ? todos.filter(todo => !todo.completed) : todos;

    const handleItemToggle = (todoId) => {
        toggleTodo(todoId); // 使用 Zustand store
    };

    // 使用 Zustand
    const AddTodo = () => {
        if (inputValue.trim()) {
            addTodo(inputValue); // 使用 store 的方法
            setInputValue(''); // 清空输入框
        }
    };

    // 删除选中的 、todos
    const handleDeleteCompleted = () => {
        deleteCompletedTodos();
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
                    <TodoItem key={item.id}{...item} onToggle={() => handleItemToggle(item.id)} />
                ))}
            </ul>
            <button className={styles.deleteButton} onClick={handleDeleteCompleted}>删除</button>
        </section>
    );
}