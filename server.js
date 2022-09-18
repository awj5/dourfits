import Express from 'express';
import Cors from 'cors';
import Path from 'path';
import Queries from './api/queries.js';
const app = Express();
const port = process.env.PORT || 3002;
const __dirname = Path.resolve();

/* App */

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
})

app.use(Express.static(Path.join(__dirname, 'client/build'))); // React
app.use(Cors());
app.use(Express.json());

app.listen(port, () => {
  console.log(`App running on port ${ port }.`);
});

/* API endpoints */

app.get('/api/events', Queries.getEvents);
app.post('/api/entries/:id/:wallet', Queries.addEntry);

// Router

app.get('*', (req, res) => {
  res.sendFile(Path.join(__dirname + '/client/build/index.html'));
});