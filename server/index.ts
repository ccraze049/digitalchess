import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Add a simple test route
  app.get('/test', (req, res) => {
    res.send(`
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Server is working! 🎉</h1>
          <p>Time: ${new Date().toISOString()}</p>
          <p>Host: ${req.get('host')}</p>
          <a href="/">Go to Chess Game</a>
        </body>
      </html>
    `);
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  // Serve the app on port 5000 as required by Replit
  const port = Number(process.env.PORT) || 5000;
  const host = process.env.HOST || "0.0.0.0";
  
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use. Attempting to kill existing process...`);
      // Try to kill any existing process and restart
      process.exit(1);
    } else {
      log(`Server error: ${err.message}`);
      process.exit(1);
    }
  });
  
  server.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
