import PG from "pg";

// Heroku or localhost
const pool = new PG.Pool({
  user: process.env.DATABASE_USER ? process.env.DATABASE_USER : "adamjohnson",
  host: process.env.DATABASE_NAME ? "cbgm3648033tc7.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com" : "localhost",
  database: process.env.DATABASE_NAME ? process.env.DATABASE_NAME : "adamjohnson",
  password: process.env.DATABASE_PASSWORD ? process.env.DATABASE_PASSWORD : "",
  port: 5432,
  ssl: process.env.DATABASE_NAME ? { rejectUnauthorized: false } : false,
});

/* Queries */

const getEvents = async (request, response) => {
  try {
    const events = await pool.query(
      "SELECT * FROM df_events WHERE $1 = 'open' AND submit_start <= now() AND submit_end > now() OR $1 = 'upcoming' AND submit_start > now() OR $1 = 'vote' AND submit_end <= now() AND voting_end > now() OR $1 = 'archive' AND voting_end <= now() ORDER BY submit_start DESC",
      [request.params.type]
    );
    response.status(200).json(events.rows);
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
};

const getEvent = async (request, response) => {
  try {
    const event = await pool.query(
      "SELECT * FROM df_events WHERE id = $1 AND $2 = 'voting' AND submit_end <= now() AND voting_end > now() OR id = $1 AND $2 = 'results' AND voting_end <= now()",
      [request.params.id, request.params.type]
    );

    if (event.rows.length) {
      response.status(200).json(event.rows[0]);
    } else {
      response.status(403).send();
    }
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
};

const getEventPrizes = async (request, response) => {
  try {
    const prizes = await pool.query("SELECT * FROM df_prizes WHERE event_id = $1 ORDER BY order_num", [
      request.params.id,
    ]);
    response.status(200).json(prizes.rows);
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
};

const addEntry = async (request, response) => {
  try {
    const event = await pool.query(
      "SELECT * FROM df_events WHERE id = $1 AND submit_start <= now() AND submit_end > now()",
      [request.params.id]
    );
    const userEntries = await pool.query("SELECT * FROM df_entries WHERE event_id = $1 AND wallet = $2", [
      request.params.id,
      request.params.wallet,
    ]);

    // Insert only if user not already submitted and event still open
    if (!userEntries.rows.length && event.rows.length) {
      const entry = await pool.query(
        "INSERT INTO df_entries (event_id, wallet, background, shoesandlegs, head, eye, hairandhats, bottoms, tops, bodyaccessories, arms, facialhair, mouth, headaccessories, glasses) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id",
        [
          request.params.id,
          request.params.wallet,
          request.body.background,
          request.body.shoesAndLegs,
          request.body.head,
          request.body.eye,
          request.body.hairAndHats,
          request.body.bottoms,
          request.body.tops,
          request.body.bodyAccessories,
          request.body.arms,
          request.body.facialHair,
          request.body.mouth,
          request.body.headAccessories,
          request.body.glasses,
        ]
      );
      response.status(201).send(entry.rows[0].id.toString());
    } else {
      response.status(!event.rows.length ? 403 : 409).send(); // Event not open or already submitted
    }
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
};

const getEventEntries = async (request, response) => {
  try {
    const entries = await pool.query(
      "SELECT * FROM df_entries WHERE event_id = $1 AND id NOT IN (SELECT entry_id FROM df_votes WHERE wallet = $2) ORDER BY random() LIMIT 2",
      [request.params.id, request.params.wallet]
    ); // Query excludes entries user has already voted on
    response.status(200).json(entries.rows);
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
};

const addVote = async (request, response) => {
  try {
    const event = await pool.query(
      "SELECT * FROM df_events WHERE id = $1 AND submit_end <= now() AND voting_end > now()",
      [request.params.event]
    );

    // Insert only if event still open for voting
    if (event.rows.length) {
      // Record winner
      if (request.body.winner === parseInt(request.params.id)) {
        await pool.query("UPDATE df_entries SET votes = votes + 1 WHERE id = $1", [request.body.winner]);
      }

      // Record vote
      const vote = await pool.query("INSERT INTO df_votes (entry_id, wallet) VALUES ($1, $2) RETURNING id", [
        request.params.id,
        request.params.wallet,
      ]);
      response.status(201).send(vote.rows[0].id.toString());
    } else {
      response.status(403).send(); // Event voting closed
    }
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
};

const getEventResults = async (request, response) => {
  try {
    const results = await pool.query(
      "SELECT wallet, background, shoesandlegs, head, eye, hairandhats, bottoms, tops, bodyaccessories, arms, facialhair, mouth, headaccessories, glasses FROM df_entries WHERE event_id = $1 ORDER BY votes DESC LIMIT 50",
      [request.params.id]
    );
    response.status(200).json(results.rows);
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
};

const getWalletXP = async (request, response) => {
  try {
    const entries = await pool.query("SELECT * FROM df_entries WHERE wallet = $1 AND prize_claimed = FALSE", [
      request.params.wallet,
    ]);
    const xp = await pool.query("SELECT * FROM df_xp WHERE wallet = $1", [request.params.wallet]);
    var total = xp.rows.length ? xp.rows[0].xp : 0;

    if (entries.rows.length) {
      // Claim XP
      for (let x = 0; x < entries.rows.length; x++) {
        const event = await pool.query("SELECT * FROM df_events WHERE id = $1", [entries.rows[x].event_id]);
        const results = await pool.query("SELECT * FROM df_entries WHERE event_id = $1 ORDER BY votes DESC", [
          event.rows[0].id,
        ]);
        await pool.query("UPDATE df_entries SET prize_claimed = TRUE WHERE id = $1", [entries.rows[x].id]);
        total =
          total +
          (results.rows[0].wallet === request.params.wallet
            ? event.rows[0].xp_first
            : results.rows[1].wallet === request.params.wallet
            ? event.rows[0].xp_second
            : results.rows[2].wallet === request.params.wallet
            ? event.rows[0].xp_third
            : event.rows[0].xp_entry); // 1st, 2nd, 3rd or entry prize
      }

      // Save
      if (xp.rows.length) {
        await pool.query("UPDATE df_xp SET xp = $1 WHERE id = $2", [total, xp.rows[0].id]);
      } else {
        await pool.query("INSERT INTO df_xp (wallet, xp) VALUES ($1, $2)", [request.params.wallet, total]);
      }
    }

    response.status(200).json(total);
  } catch (error) {
    console.log(error);
    response.status(500).send();
  }
};

/* Export */

export default {
  getEvents,
  getEvent,
  getEventPrizes,
  addEntry,
  getEventEntries,
  addVote,
  getEventResults,
  getWalletXP,
};
