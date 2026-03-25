const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        template_choice VARCHAR(50) DEFAULT 'classic',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        teacher_name VARCHAR(255),
        grade VARCHAR(100),
        subject VARCHAR(255),
        school_name VARCHAR(255),
        class_date DATE,
        warmup_activity TEXT,
        warmup_duration INTEGER,
        exit_ticket TEXT,
        differentiation_notes TEXT,
        materials TEXT,
        homework_reminder TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add new columns to existing classes table (idempotent)
    const classColumns = [
      'warmup_activity TEXT',
      'warmup_duration INTEGER',
      'exit_ticket TEXT',
      'differentiation_notes TEXT',
      'materials TEXT',
      'homework_reminder TEXT',
    ];
    for (const col of classColumns) {
      const colName = col.split(' ')[0];
      await client.query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS ${col};`).catch(() => {});
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
        title VARCHAR(500),
        grade VARCHAR(100),
        subject VARCHAR(255),
        step_data JSONB DEFAULT '{}',
        current_step INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'in_progress',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add class_id to existing lessons table
    await client.query(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL;`).catch(() => {});

    console.log('Database tables initialized successfully');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
