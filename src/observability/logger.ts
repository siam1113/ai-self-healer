export class Logger {
  info(message: string, meta?: object): void { console.log(JSON.stringify({ level: "info", message, ...meta })); }
  warn(message: string, meta?: object): void { console.warn(JSON.stringify({ level: "warn", message, ...meta })); }
  error(message: string, meta?: object): void { console.error(JSON.stringify({ level: "error", message, ...meta })); }
}
