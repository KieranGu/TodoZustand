import React, { useState, useEffect } from "react";
import axios from "axios";
const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    async function fetchTodos() {
        const api = axios.create({
            baseURL: "https://jsonplaceholder.typicode.com",
        });

        api.interceptors.request.use((config) => {
            config.headers.Authorization = 'Bearer fake-token';//添加认证token
            setLoading(true);
            return config;
        }, error => {
            return Promise.reject(error);
        });
        try {
            const { data } = await api.get("/todos");
            setTodos(data);
        } catch (err) {
            setError('请求失败');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchTodos();
    }, []);
    return (
        <div>
            {loading && <div>加载中...</div>}
            {error && <div style={{color:'red'}}>{error}</div>}
            {todos.map((todo) => (
                <div key={todo.id}>{todo.title}</div>
            ))}
        </div>
    );
};
export default TodoList;