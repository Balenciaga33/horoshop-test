import fs from 'node:fs';
import path from 'node:path';

export type OpenApiDocument = {
  paths?: Record<string, Record<string, { responses?: Record<string, unknown> }>>;
};

/** Horoshop публікує docs у Notion, не як live OpenAPI — тримаємо локальний контракт. */
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

/** За можливості: status.enum у схемі responses.200 application/json. */
export function documentedBusinessStatusEnum(
  doc: OpenApiDocument,
  apiPath: string,
  method: string,
): string[] | undefined {
  const operation = doc.paths?.[apiPath]?.[method.toLowerCase()] as
    | {
        responses?: Record<
          string,
          {
            content?: {
              'application/json'?: {
                schema?: { properties?: { status?: { enum?: string[] } } };
              };
            };
          }
        >;
      }
    | undefined;

  return operation?.responses?.['200']?.content?.['application/json']?.schema?.properties?.status
    ?.enum;
}
