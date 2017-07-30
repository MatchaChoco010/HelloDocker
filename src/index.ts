import * as fs from 'fs';
import * as https from 'https';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mysql from 'mysql2/promise';

const connectionOption = {
  host: 'db',
  user: 'app',
  password: process.env.DB_PASSWORD!,
};

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log(`Request from: ${req.path}`);
  res.send('<h1>Hello, World!</h1><p>Hello, hello...</p>');
});

app.get('/get', (req, res) => (async () => {
  try {
    console.log(`Request from: ${req.path}`);

    const cn = await mysql.createConnection(connectionOption);

    const sql = {sql: 'SELECT str FROM test.test_table'};
    const [rows, _] = await cn.execute<any>(sql);
    cn.end();

    let sendData = '<h1>データベースの中身</h1>\n';

    for (let row of rows) {
      console.log(row);
      sendData += `<p>${row.str}</p>\n`;
    }

    res.send(sendData);
  }
  catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
})());

app.post('/set', (req, res) => (async() => {
  try {
    console.log(`Request from: ${req.path}`);
    console.log('Request body:')
    console.log(req.body);

    const cn = await mysql.createConnection(connectionOption);

    if (req.body.str && typeof req.body.str === 'string') {
      const sql = {sql: 'INSERT test.test_table (str) VALUES (?)'};
      const [results, _] = await cn.execute<any>(sql, [req.body.str]);
      cn.end();

      console.log(results);

      res.sendStatus(200);
    }
    else {
      res.sendStatus(400);
    }
  }
  catch(err) {
    console.log(err);
    res.sendStatus(500);
  }
})());

const httpsOptions = {
  key: fs.readFileSync(process.env.PRIVATE_KEY_PATH!),
  cert: fs.readFileSync(process.env.PUBLIC_CERT_PATH!),
};
https.createServer(httpsOptions, app)
.listen(3000, () => console.log('listen: 3000'));
