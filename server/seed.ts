import pool from './db.js';
import { v4 as uuidv4 } from 'uuid';

export const seedDatabase = async () => {
  const result = await pool.query('SELECT COUNT(*) as count FROM problems');
  const count = parseInt(result.rows[0].count);
  
  if (count === 0) {
    console.log('Seeding database...');
    
    // Seed Problems
    await pool.query(`
      INSERT INTO problems (id, title, description, image_url, latitude, longitude, district, votes_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [uuidv4(), 'Road crack', 'Deep crack on the main road', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800', 39.9667, 66.4833, 'Ishtixon', 15]);
    
    await pool.query(`
      INSERT INTO problems (id, title, description, image_url, latitude, longitude, district, votes_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [uuidv4(), 'Broken traffic light', 'Traffic light is not working at the intersection', 'https://images.unsplash.com/photo-1470116945706-e6bf5d5a53ca?auto=format&fit=crop&q=80&w=800', 41.3111, 69.2797, 'Tashkent', 45]);
    
    await pool.query(`
      INSERT INTO problems (id, title, description, image_url, latitude, longitude, district, votes_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [uuidv4(), 'Garbage issue', 'Illegal trash dumping near the canal', 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800', 39.6547, 66.9757, 'Samarqand', 88]);

    // Seed Gov Task
    const taskId = uuidv4();
    await pool.query(`
      INSERT INTO gov_tasks (id, title, description, district, location_text, expected_length)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [taskId, '1000 meter asphalt', '1000 meters asphalt completed', 'Ishtixon', 'Main street', 1000]);

    // Seed Verifications
    await pool.query(`
      INSERT INTO gov_verifications (id, task_id, user_id, status, reported_length, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [uuidv4(), taskId, 'user1', 'done', 1000, 'Looks great!']);
    
    await pool.query(`
      INSERT INTO gov_verifications (id, task_id, user_id, status, reported_length, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [uuidv4(), taskId, 'user2', 'partial', 500, 'Only half is done.']);
    
    await pool.query(`
      INSERT INTO gov_verifications (id, task_id, user_id, status, reported_length, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [uuidv4(), taskId, 'user3', 'not_done', 0, 'Nothing has been done yet.']);
    
    console.log('Database seeded successfully.');
  }
};
