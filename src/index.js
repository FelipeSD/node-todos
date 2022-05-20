const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.filter(user => user.username === username);

  if (!user.length) {
    return response.status(404).json({error: "User not found."});
  }

  request.user = user[0];
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find(user => user.username === username);

  if (user) return response.status(400).json({ error: "User already exists." });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  response.json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(task);

  response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const task = user.todos.find(t => t.id === id);

  if (!task) return response.status(404).json({ error: "Task not found." })

  task.title = title;
  task.deadline = deadline;

  response.json(task);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const task = user.todos.find(t => t.id === id);

  if (!task) return response.status(404).json({ error: "Task not found." });

  task.done = true;

  response.status(201).json(task);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const task = user.todos.find(t => t.id === id);

  if (!task) return response.status(404).json({ error: "Task not found." });

  user.todos = user.todos.filter(t => t.id !== id);

  response.status(204).json(task);
});

// Montar um middleware checksExistsTodo

module.exports = app;