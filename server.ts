import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import pool, { initDb } from "./server/db.js";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

async function startServer() {
  // Initialize Database
  await initDb();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // API Routes

  // --- Problems ---
  app.get("/api/problems", async (req, res) => {
    const { district } = req.query;
    let query = "SELECT * FROM problems ORDER BY created_at DESC";
    let params: any[] = [];
    
    if (district) {
      query = "SELECT * FROM problems WHERE district = $1 ORDER BY created_at DESC";
      params.push(district);
    }
    
    try {
      const result = await pool.query(query, params);
      const problems = result.rows;
      
      // Map to frontend expected format
      const mappedProblems = problems.map(p => ({
        ...p,
        image: p.image_url,
        votes: p.votes_count,
        createdAt: p.created_at
      }));
      
      res.json(mappedProblems);
    } catch (error) {
      console.error("Error fetching problems from DB:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/problems", async (req, res) => {
    const { title, description, image, imageUrl, latitude, longitude, district } = req.body;
    const id = uuidv4();
    const finalImage = image || imageUrl || 'https://picsum.photos/seed/problem/800/600';
    
    try {
      await pool.query(`
        INSERT INTO problems (id, title, description, image_url, latitude, longitude, district, votes_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [id, title, description, finalImage, latitude, longitude, district, 1]);
      
      const result = await pool.query("SELECT * FROM problems WHERE id = $1", [id]);
      const p = result.rows[0];
      res.status(201).json({
        ...p,
        image: p.image_url,
        votes: p.votes_count,
        createdAt: p.created_at
      });
    } catch (error) {
      console.error("Error creating problem:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/problems/:id/vote", async (req, res) => {
    const { id } = req.params;
    try {
      const checkResult = await pool.query("SELECT * FROM problems WHERE id = $1", [id]);
      const problem = checkResult.rows[0];
      
      if (problem) {
        await pool.query("UPDATE problems SET votes_count = votes_count + 1 WHERE id = $1", [id]);
        const result = await pool.query("SELECT * FROM problems WHERE id = $1", [id]);
        const p = result.rows[0];
        res.json({
          ...p,
          image: p.image_url,
          votes: p.votes_count,
          createdAt: p.created_at
        });
      } else {
        res.status(404).json({ error: "Problem not found" });
      }
    } catch (error) {
      console.error("Error voting for problem:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Government Tasks ---
  app.post("/api/tasks", async (req, res) => {
    const { title, description, district, location_text, expected_length } = req.body;
    const id = uuidv4();
    
    try {
      await pool.query(`
        INSERT INTO gov_tasks (id, title, description, district, location_text, expected_length)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, title, description, district, location_text, expected_length]);
      
      const result = await pool.query("SELECT * FROM gov_tasks WHERE id = $1", [id]);
      const t = result.rows[0];
      res.status(201).json({
        ...t,
        status: "In Progress",
        verifications: []
      });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    const { district } = req.query;
    let query = "SELECT * FROM gov_tasks ORDER BY created_at DESC";
    let params: any[] = [];
    
    if (district) {
      query = "SELECT * FROM gov_tasks WHERE district = $1 ORDER BY created_at DESC";
      params.push(district);
    }
    
    try {
      const result = await pool.query(query, params);
      const tasks = result.rows;
      
      // Map to frontend expected format
      const mappedTasks = await Promise.all(tasks.map(async (t) => {
        const vResult = await pool.query("SELECT * FROM gov_verifications WHERE task_id = $1", [t.id]);
        const verifications = vResult.rows;
        return {
          ...t,
          status: "In Progress",
          verifications
        };
      }));
      
      res.json(mappedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tasks/:id/verify", async (req, res) => {
    const { id } = req.params;
    const { user_id, status, reported_length, comment } = req.body;
    
    try {
      const checkResult = await pool.query("SELECT * FROM gov_tasks WHERE id = $1", [id]);
      const task = checkResult.rows[0];
      if (task) {
        const verificationId = uuidv4();
        await pool.query(`
          INSERT INTO gov_verifications (id, task_id, user_id, status, reported_length, comment)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [verificationId, id, user_id || 'anonymous', status, reported_length || 0, comment || '']);
        
        res.json({ message: "Verification submitted" });
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error) {
      console.error("Error verifying task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tasks/:id/verifications", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM gov_verifications WHERE task_id = $1 ORDER BY created_at DESC", [id]);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tasks/:id/stats", async (req, res) => {
    const { id } = req.params;
    try {
      const checkResult = await pool.query("SELECT * FROM gov_tasks WHERE id = $1", [id]);
      const task = checkResult.rows[0];
      
      if (task) {
        const vResult = await pool.query("SELECT * FROM gov_verifications WHERE task_id = $1", [id]);
        const verifications = vResult.rows;
        
        const stats = {
          done: verifications.filter((v) => v.status === "done").length,
          partial: verifications.filter((v) => v.status === "partial").length,
          not_done: verifications.filter((v) => v.status === "not_done").length,
          average_reported_length:
            verifications.length > 0
              ? verifications.reduce((acc, v) => acc + (v.reported_length || 0), 0) / verifications.length
              : 0,
        };
        
        // Keep backward compatibility for frontend
        const frontendStats = {
          ...stats,
          average_meters: stats.average_reported_length
        };
        
        res.json(frontendStats);
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error) {
      console.error("Error fetching task stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GEOASR Proxy Routes with Caching and Retries
  const getGeoAsrToken = () => {
    const token = process.env.VITE_GEOASR_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoid2ViX3VzZXIiLCJleHAiOjE3Nzk4Mzk0ODV9.WCy4ooIDvL0o8G5udEuba4POyJMMH2CnjM2FcgybG10";
    return token.trim();
  };

  const geoCache: Record<string, { data: any, timestamp: number }> = {};
  const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

  const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${getGeoAsrToken()}` },
          timeout: 15000 // 15s timeout
        });
        return response.data;
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 429) {
          console.warn(`Rate limited by upstream: ${url}. Retry ${i + 1}/${retries}`);
          // Wait longer for 429
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
          continue;
        }
        
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const handleGeoRequest = async (key: string, url: string, res: any) => {
    const now = Date.now();
    if (geoCache[key] && (now - geoCache[key].timestamp < CACHE_TTL)) {
      return res.json(geoCache[key].data);
    }

    try {
      let data = await fetchWithRetry(url);
      
      // Limit results to 25 items as requested (between 20 and 30)
      if (Array.isArray(data)) {
        data = data.slice(0, 25);
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        // Some APIs wrap the array in a 'data' property
        data.data = data.data.slice(0, 25);
      }
      
      geoCache[key] = { data, timestamp: now };
      res.json(data);
    } catch (error: any) {
      console.error(`Error fetching ${key}:`, error.response?.status || error.message);
      if (geoCache[key]) {
        console.log(`Serving ${key} from stale cache`);
        return res.json(geoCache[key].data);
      }
      res.status(error.response?.status || 500).json({ 
        error: `Failed to fetch ${key}`,
        details: error.response?.data || error.message
      });
    }
  };

  app.get(["/api/geoasr/schools", "/api/geoasr/schools/"], (req, res) => handleGeoRequest("schools", "https://duasr.uz/api4/maktab44", res));
  app.get(["/api/geoasr/kindergartens", "/api/geoasr/kindergartens/"], (req, res) => handleGeoRequest("kindergartens", "https://duasr.uz/api4/bogcha", res));
  app.get(["/api/geoasr/healthcare", "/api/geoasr/healthcare/"], (req, res) => handleGeoRequest("healthcare", "https://duasr.uz/api4/ssv", res));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
