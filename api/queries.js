'use strict';

import PG from 'pg';

const pool = new PG.Pool({
  user: process.env.DATABASE_USER ? process.env.DATABASE_USER : 'adamjohnson',
  host: process.env.DATABASE_NAME ? 'ec2-52-73-155-171.compute-1.amazonaws.com' : 'localhost',
  database: process.env.DATABASE_NAME ? process.env.DATABASE_NAME : 'adamjohnson',
  password: process.env.DATABASE_PASSWORD ? process.env.DATABASE_PASSWORD : '',
  port: 5432,
  ssl: process.env.DATABASE_NAME ? { rejectUnauthorized: false } : false
});

/* Queries */

const getEvents = async (request, response) => {
  try {
    const select = await pool.query('SELECT * FROM df_events ORDER BY start');
    response.status(200).json(select.rows);
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
}

const addEntry = async (request, response) => {
  try {
    const insert = await pool.query('INSERT INTO df_entries (event_id, wallet, background, shoesandlegs, head, eye, hairandhats, bottoms, tops, bodyaccessories, arms, facialhair, mouth, headaccessories, glasses) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id', [request.params.id, request.params.wallet, request.body.background, request.body.shoesandlegs, request.body.head, request.body.eye, request.body.hairandhats, request.body.bottoms, request.body.tops, request.body.bodyaccessories, request.body.arms, request.body.facialhair, request.body.mouth, request.body.headaccessories, request.body.glasses]);
    response.status(201).send(insert.rows[0].id.toString());
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
}

/* Export */

export default { getEvents, addEntry }