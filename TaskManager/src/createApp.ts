// src/createApp.ts
import "express-async-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users.route";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.route";
import projectMemberRoutes from "./routes/project-member.route";
import projectColumnRoutes from "./routes/project-column.route";
import issueRoutes from "./routes/issue.route";
import sprintRoutes from "./routes/sprint.route";
import activityRoutes from "./routes/activity.route";
import invitationRoutes from "@/routes/invitation.route";
import adminRoutes from "@/routes/admin.route";
import { requestLogger, errorHandler } from "@/middlewares";
import { specs, swaggerUi } from "./config/swagger";
import logger from "./utils/logger";
import { connectMongo } from "./config/mongodb";

export const createApp = async () => {
  await connectMongo();
  const app = express();

  // Middlewares - CORS Configuration
  // Support both CORS_ORIGIN and FRONTEND_URL for flexibility
  // CORS_ORIGIN can be a single URL or comma-separated URLs for multiple origins
  const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173";
  const allowedOrigins = corsOrigin.split(",").map((origin) => origin.trim());
  
  // Log CORS configuration for debugging
  logger.info(`CORS Configuration - Allowed origins: ${allowedOrigins.join(", ")}`);
  logger.info(`CORS_ORIGIN env: ${process.env.CORS_ORIGIN || "not set"}`);
  logger.info(`FRONTEND_URL env: ${process.env.FRONTEND_URL || "not set"}`);
  
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(", ")}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // API Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  logger.info("Swagger API documentation is available at http://localhost:3000/api-docs");

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/projects", projectMemberRoutes);
  app.use("/api/invitations", invitationRoutes);
  app.use("/api/issues", issueRoutes);
  app.use("/api/sprints", sprintRoutes);
  app.use("/api/activities", activityRoutes);

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};
