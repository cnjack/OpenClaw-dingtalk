// Re-export the actual implementation from src.
// OpenClaw loads this extension directly as TypeScript (no JS build step required).

export { default } from "./src/index.ts";
export * from "./src/index.ts";
