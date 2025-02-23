import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { groqService } from "./groq";
import { insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks = await storage.getTasksByUserId(req.user.id);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const validatedData = insertTaskSchema.parse(req.body);
    const aiTags = await groqService.generateTaskTags(
      validatedData.title,
      validatedData.description || ""
    );

    const task = await storage.createTask({
      ...validatedData,
      userId: req.user.id,
      aiTags,
    });

    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const task = await storage.updateTask(parseInt(req.params.id), req.body);
    if (!task) return res.sendStatus(404);
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    await storage.deleteTask(parseInt(req.params.id));
    res.sendStatus(204);
  });

  app.get("/api/insights", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const tasks = await storage.getTasksByUserId(req.user.id);
    const insights = await groqService.generateTaskInsights(tasks);
    res.json(insights);
  });

  // New endpoint for manually refreshing insights
  app.post("/api/insights/refresh", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const tasks = await storage.getTasksByUserId(req.user.id);
    const insights = await groqService.generateTaskInsights(tasks);
    res.json(insights);
  });

  // New endpoint for generating reports
  app.get("/api/report", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const tasks = await storage.getTasksByUserId(req.user.id);

      if (!tasks || tasks.length === 0) {
        return res.status(400).json({ 
          message: 'No tasks found. Please add some tasks before generating a report.'
        });
      }

      console.log(`Generating report for user ${req.user.id} with ${tasks.length} tasks`);

      const insights = await groqService.generateTaskInsights(tasks);
      const report = await groqService.generateReport(tasks, insights, req.user);

      if (!report) {
        throw new Error('Failed to generate report: No report data received');
      }

      console.log('Report generated successfully');
      res.json(report);
    } catch (error: any) {
      console.error('Report generation failed:', {
        error: error.message,
        stack: error.stack,
        userId: req.user.id
      });

      res.status(500).json({ 
        message: 'Failed to generate report',
        details: error.message || 'An unexpected error occurred'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}