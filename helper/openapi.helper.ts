import fs from 'node:fs';
import path from 'node:path';

export type OpenApiDocument = {
  paths?: Record<string, Record<string, { responses?: Record<string, unknown> }>>;
};

/** Horoshop publishes docs in Notion, not as live OpenAPI — we keep a local contract. */
export function loadOpenApiDoc(): OpenApiDocument {
  const filePath = path.resolve(__dirname, '../openapi/horoshop.openapi.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as OpenApiDocument;
}

export function documentedStatusCodes(
  doc: OpenApiDocument,
  apiPath: string,
  method: string,
): string[] {
  const operation = doc.paths?.[apiPath]?.[method.toLowerCase()];
  if (!operation) {
    throw new Error(`OpenAPI missing ${method.toUpperCase()} ${apiPath}`);
  }
  return Object.keys(operation.responses ?? {}).sort();
}

export function assertOperationExists(doc: OpenApiDocument, apiPath: string, method: string): void {
  documentedStatusCodes(doc, apiPath, method);
}
