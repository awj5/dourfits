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
});

app.use(Express.static(Path.join(__dirname, 'client/build'))); // React
app.use(Cors());
app.use(Express.json());

app.listen(port, () => {
  console.log(`App running on port ${ port }.`);
});

/* API endpoints */

app.get('/api/events/:type', Queries.getEvents);
app.get('/api/event/:id', Queries.getEvent);
app.get('/api/event/:id/prizes', Queries.getEventPrizes);
app.post('/api/entries/:id/:wallet', Queries.addEntry);
app.get('/api/vote/entries/:id/:wallet', Queries.getEventEntries);
app.post('/api/vote/:id/:wallet', Queries.addVote);
app.get('/api/results/:id', Queries.getEventResults);
app.get('/api/xp/:wallet', Queries.getWalletXP);

// Router

app.get('*', (req, res) => {
  res.sendFile(Path.join(__dirname + '/client/build/index.html'));
});