const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryId(request, response, next){
  const{ id } = request.params;
  if(isUuid(id)){ return next() }
  return response.status(400).json({error: "Invalid Id"})
}

function getRepositoryIndex(request, response, next){
  const{ id } = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  if(repositoryIndex < 0){ return response.status(400).json({error : "Repository not found."}) }
  request.repositoryIndex = repositoryIndex;
  return next()
}

app.use("/repositories/:id", validateRepositoryId, getRepositoryIndex);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  let arrayTechs;
  if(techs) arrayTechs = Array.isArray(techs) ? techs : new Array(techs);
  const repository = { 
    id: uuid(),
    title,
    url,
    techs: arrayTechs,
    likes: 0
  }
  repositories.push(repository);
  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = repositories[request.repositoryIndex]
  repository.title = title ? title : repository.title;
  repository.url = url ? url : repository.url;
  if(techs) repository.techs = Array.isArray(techs) ? techs : new Array(techs);
  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  repositories.splice(request.repositoryIndex, 1);
  return response.status(204).json();
});

app.post("/repositories/:id/like", (request, response) => {
  const repository = repositories[request.repositoryIndex];
  repository.likes++;
  return response.json(repository);
});

module.exports = app;
