'use strict';

import PG from 'pg';

const pool = new PG.Pool({
  user: process.env.DATABASE_USER ? process.env.DATABASE_USER : 'adamjohnson',
  host: process.env.DATABASE_NAME ? 'ec2-44-207-133-100.compute-1.amazonaws.com' : 'localhost',
  database: process.env.DATABASE_NAME ? process.env.DATABASE_NAME : 'adamjohnson',
  password: process.env.DATABASE_PASSWORD ? process.env.DATABASE_PASSWORD : '',
  port: 5432,
  ssl: process.env.DATABASE_NAME ? { rejectUnauthorized: false } : false
});

/* Queries */

const getEvents = async (request, response) => {
  try {
    const events = await pool.query('SELECT * FROM df_events WHERE $1 = \'open\' AND submit_start <= now() AND submit_end > now() OR $1 = \'upcoming\' AND submit_start > now() ORDER BY submit_start', [request.params.type]);
    response.status(200).json(events.rows);
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
}

const addEntry = async (request, response) => {
  try {
    const event = await pool.query('SELECT * FROM df_events WHERE id = $1 AND submit_start <= now() AND submit_end > now()', [request.params.id]);
    const userEntries = await pool.query('SELECT * FROM df_entries WHERE event_id = $1 AND wallet = $2', [request.params.id, request.params.wallet]);

    // Insert only if user not already submitted and event still open
    if (!userEntries.rows.length && event.rows.length) {
      const entry = await pool.query('INSERT INTO df_entries (event_id, wallet, background, shoesandlegs, head, eye, hairandhats, bottoms, tops, bodyaccessories, arms, facialhair, mouth, headaccessories, glasses) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id', [request.params.id, request.params.wallet, request.body.background, request.body.shoesAndLegs, request.body.head, request.body.eye, request.body.hairAndHats, request.body.bottoms, request.body.tops, request.body.bodyAccessories, request.body.arms, request.body.facialHair, request.body.mouth, request.body.headAccessories, request.body.glasses]);
      response.status(201).send(entry.rows[0].id.toString());
    } else {
      response.status(!event.rows.length ? 403 : 409).send(); // Event not open or already submitted
    }
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
}

/* Export */

export default { getEvents, addEntry }