import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function writeTextFile(outputPath: string, content: string): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, content, "utf8");
}
