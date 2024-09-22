const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
const dbFilePath = path.join(__dirname, 'moviesData.db')
const PORT_NU = 3000
const MOVIE_TABLE_NAME = 'movie'
const DIRECTOR_TABLE_NAME = 'director'
let db = null

app.use(express.json())

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(
        'Server is running on https://nitishbfiesnjscpdiitb.drops.nxtwave.tech/movies',
      )
    })
  } catch (e) {
    console.log('Db Error:', e.message)
    process.exit(1)
  }
}
initializeDbAndServer()

app.get('/movies/', async (req, res) => {
  let query = `
    select movie_name as movieName from ${MOVIE_TABLE_NAME};`

  let movies = await db.all(query)
  res.send(movies)
})

app.get('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  let query = `
    select 
    movie_id as movieId,
    director_id as directorId,
    movie_name as movieName, 
    lead_actor as leadActor 
    from ${MOVIE_TABLE_NAME}
    where movie_id=${movieId};`
  let movie = await db.get(query)

  res.send(movie)
})

app.post('/movies/', async (req, res) => {
  const {movieName, directorId, leadActor} = req.body;
  let query = `
    insert into ${MOVIE_TABLE_NAME} (director_id, movie_name, lead_actor)
    values(${directorId}, "${movieName}", "${leadActor}");`

  await db.run(query)
  res.send('Movie Successfully Added')
})

app.put('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params
  const {movieName, directorId, leadActor} = req.body

  let query = `
    update ${MOVIE_TABLE_NAME}
    set movie_name="${movieName}",
    lead_actor="${leadActor}",
    director_id=${directorId}
    where movie_id=${movieId};`

  await db.run(query)
  res.send('Movie Details Updated')
})

app.delete('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params
  let query = `
    delete from ${MOVIE_TABLE_NAME}
    where movie_id=${movieId};`

  await db.run(query)
  res.send('Movie Removed')
})

app.get('/directors', async (req, res) => {
  let query = `
    select director_id as directorId, director_name as directorName from ${DIRECTOR_TABLE_NAME};`

  let directors = await db.all(query)
  res.send(directors)
})

app.get('/directors/:directorId/movies/', async (req, res) => {
  const {directorId} = req.params

  // let query = `
  //   select movie_name as movieName from
  //   ${DIRECTOR_TABLE_NAME} join ${MOVIE_TABLE_NAME} on ${DIRECTOR_TABLE_NAME}.director_id=${MOVIE_TABLE_NAME}.director_id
  //   where ${DIRECTOR_TABLE_NAME}.director_id=${directorId};
  //   `
  let query=`
  select movie_name as movieName
  from ${MOVIE_TABLE_NAME} where 
  director_id=${directorId};`;

  let movies = await db.all(query)
  res.send(movies);
})

module.exports = app
