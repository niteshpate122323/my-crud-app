console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL)
console.log("Supabase Key:", import.meta.env.VITE_SUPABASE_ANON_KEY)

import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'


export default function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState(null) // { id, title, description }
  const [loading, setLoading] = useState(false)

  async function fetchTodos(){
    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if(error){
      console.error(error)
    } else {
      setTodos(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchTodos() }, [])

  async function addTodo(){
    if(!title.trim()) return
    const { error } = await supabase
      .from('todos')
      .insert({ title, description })
    if(error) return console.error(error)
    setTitle('')
    setDescription('')
    fetchTodos()
  }

  function startEdit(todo){
    setEditing(todo)
    setTitle(todo.title)
    setDescription(todo.description || '')
  }

  async function saveEdit(){
    if(!editing) return
    const { id } = editing
    const { error } = await supabase
      .from('todos')
      .update({ title, description })
      .eq('id', id)
    if(error) return console.error(error)
    setEditing(null)
    setTitle('')
    setDescription('')
    fetchTodos()
  }

  async function toggleDone(todo){
    const { error } = await supabase
      .from('todos')
      .update({ done: !todo.done })
      .eq('id', todo.id)
    if(error) return console.error(error)
    fetchTodos()
  }

  async function deleteTodo(id){
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
    if(error) return console.error(error)
    fetchTodos()
  }

  // 👉 THIS PART was missing in your code:
  return (
    <div className="container py-4">
      <h1 className="mb-4">my-crud-app Todos (CRUD)</h1>

      <div className="card mb-4">
        <div className="card-body">
          <div className="mb-2">
            <input
              className="form-control"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <textarea
              className="form-control"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          {editing ? (
            <div>
              <button className="btn btn-success me-2" onClick={saveEdit}>Save</button>
              <button className="btn btn-secondary" onClick={() => {
                setEditing(null)
                setTitle('')
                setDescription('')
              }}>Cancel</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={addTodo}>Add Todo</button>
          )}
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="list-group">
          {todos.map(t => (
            <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <input
                  type="checkbox"
                  className="form-check-input me-2"
                  checked={t.done}
                  onChange={() => toggleDone(t)}
                />
                <strong style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
                  {t.title}
                </strong>
                <div className="text-muted small">{t.description}</div>
              </div>
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => startEdit(t)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteTodo(t.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
