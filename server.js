import Express from 'express';
import Cors from 'cors';
import Path from 'path';
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

app.listen(port, () => {
  console.log(`App running on port ${ port }.`);
});

// Router

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

app.get('*', (req, res) => {
  res.sendFile(Path.join(__dirname + '/client/build/index.html'));
});

/* Endpoints */