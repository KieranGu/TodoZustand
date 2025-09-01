import styles from './TodoList.module.css';
import { useState } from 'react';
import { useTodoStore } from './stores/TodoStores';
import todoItems from './todoitems.json';

function TodoItem({ title, completed, onToggle }) {
    const itemClassName = `${styles.item} ${completed ? styles.completed : ''}`;
    return (
        <li className={itemClassName}>
            <label>
                <input type="checkbox" checked={completed} onChange={onToggle} />
                {title} {completed && '✅'}
            </label>
        </li>
    );
}


export default function TodoList() {
    // const { formData, onUpdateFormData } = useRegisterStore();
    const [todos, setTodos] = useState(todoItems);
    
    const [inputValue, setInputValue] = useState(''); 
    // 过滤掉已完成
    const [isFilter, setIsFilter] = useState(false);
    const filteredItems = isFilter ? todos.filter(todo => !todo.completed) : todos;
    const handleItemToggle = (todoId, newCompletedValue) => {
        setTodos(prevTodos => prevTodos.map(todo => (
            todo.id === todoId ? {
                ...todo, completed:
                    newCompletedValue
            } : todo
        )));
    };


    
    const AddTodo = () => {
        if (inputValue.trim()) { // 如果输出框有东西
            const newTodo = {
                id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
                title: inputValue.trim(),
                completed: false
            };
            setTodos(prevTodos => [...prevTodos, newTodo]);
            setInputValue(''); // 清空输入框
        }
    };


    return (
        <section>
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
                    <TodoItem key={item.id}{...item} onToggle={() => handleItemToggle(item.id, !item.completed)} />
                ))}
            </ul>
        </section>
    );
}