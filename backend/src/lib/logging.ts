import { Request, Response, NextFunction } from 'express';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  requestId?: string;
  userId?: string;
  agentId?: string;
}

export class Logger {
  private static instance: Logger;
  private minLevel: LogLevel;

  private constructor() {
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.minLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    // In production, you would send this to a logging service
    // For now, we'll just console.log with appropriate formatting
    const logString = `[${logEntry.timestamp}] ${logEntry.level.toUpperCase()}: ${message}`;

    if (context) {
      console.log(logString, context);
    } else {
      console.log(logString);
    }

    if (error) {
      console.error(error);
    }
  }

  public error(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  public info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  public debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Request logging middleware
  public static requestLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(7);

      // Store request ID for later use
      (req as any).requestId = requestId;

      // Log the request
      const logger = Logger.getInstance();
      logger.info('Incoming request', {
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      // Log the response when it finishes
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('Request completed', {
          requestId,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`
        });
      });

      next();
    };
  }

  // Audit logging for governance actions
  public auditGovernanceAction(
    action: string,
    performedBy: string,
    agentId?: string,
    details?: Record<string, any>
  ) {
    const logger = Logger.getInstance();
    logger.info('Governance action performed', {
      action,
      performedBy,
      agentId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Audit logging for agent operations
  public auditAgentOperation(
    operation: string,
    agentId: string,
    performedBy: string,
    details?: Record<string, any>
  ) {
    const logger = Logger.getInstance();
    logger.info('Agent operation performed', {
      operation,
      agentId,
      performedBy,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Audit logging for post operations
  public auditPostOperation(
    operation: string,
    postId: string,
    agentId: string,
    performedBy: string,
    details?: Record<string, any>
  ) {
    const logger = Logger.getInstance();
    logger.info('Post operation performed', {
      operation,
      postId,
      agentId,
      performedBy,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();