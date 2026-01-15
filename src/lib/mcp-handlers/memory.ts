import { promises as fs } from "fs";
import path from "path";
import os from "os";

interface Entity {
  name: string;
  type: string;
  observations: string[];
  createdAt: string;
  updatedAt: string;
}

interface Relation {
  from: string;
  to: string;
  type: string;
  createdAt: string;
}

interface MemoryStore {
  entities: Entity[];
  relations: Relation[];
}

const MEMORY_FILE = path.join(os.tmpdir(), "mcpilot-memory.json");

async function loadMemory(): Promise<MemoryStore> {
  try {
    const content = await fs.readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return { entities: [], relations: [] };
  }
}

async function saveMemory(store: MemoryStore): Promise<void> {
  await fs.writeFile(MEMORY_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function handleMemory(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const store = await loadMemory();

  switch (toolName) {
    case "create_entities": {
      const entities = params.entities as Array<{ name: string; type: string; observations?: string[] }>;
      if (!entities || !Array.isArray(entities)) throw new Error("Entities array is required");
      
      const created: Entity[] = [];
      const now = new Date().toISOString();
      
      for (const entity of entities) {
        const existing = store.entities.find(e => e.name === entity.name);
        if (!existing) {
          const newEntity: Entity = {
            name: entity.name,
            type: entity.type || "unknown",
            observations: entity.observations || [],
            createdAt: now,
            updatedAt: now,
          };
          store.entities.push(newEntity);
          created.push(newEntity);
        }
      }
      
      await saveMemory(store);
      return { created, totalEntities: store.entities.length };
    }

    case "create_relations": {
      const relations = params.relations as Array<{ from: string; to: string; type: string }>;
      if (!relations || !Array.isArray(relations)) throw new Error("Relations array is required");
      
      const created: Relation[] = [];
      const now = new Date().toISOString();
      
      for (const relation of relations) {
        const existing = store.relations.find(
          r => r.from === relation.from && r.to === relation.to && r.type === relation.type
        );
        if (!existing) {
          const newRelation: Relation = {
            from: relation.from,
            to: relation.to,
            type: relation.type,
            createdAt: now,
          };
          store.relations.push(newRelation);
          created.push(newRelation);
        }
      }
      
      await saveMemory(store);
      return { created, totalRelations: store.relations.length };
    }

    case "search_nodes": {
      const query = (params.query as string)?.toLowerCase();
      if (!query) throw new Error("Query is required");
      
      const matchingEntities = store.entities.filter(
        e => e.name.toLowerCase().includes(query) ||
             e.type.toLowerCase().includes(query) ||
             e.observations.some(o => o.toLowerCase().includes(query))
      );
      
      return {
        query,
        results: matchingEntities,
        count: matchingEntities.length,
      };
    }

    case "open_nodes": {
      const names = params.names as string[];
      if (!names || !Array.isArray(names)) throw new Error("Names array is required");
      
      const entities = store.entities.filter(e => names.includes(e.name));
      const relatedRelations = store.relations.filter(
        r => names.includes(r.from) || names.includes(r.to)
      );
      
      return {
        entities,
        relations: relatedRelations,
      };
    }

    case "delete_entities": {
      const entityNames = params.entityNames as string[];
      if (!entityNames || !Array.isArray(entityNames)) throw new Error("entityNames array is required");
      
      const deletedCount = store.entities.length;
      store.entities = store.entities.filter(e => !entityNames.includes(e.name));
      store.relations = store.relations.filter(
        r => !entityNames.includes(r.from) && !entityNames.includes(r.to)
      );
      
      await saveMemory(store);
      return {
        deleted: entityNames,
        entitiesRemoved: deletedCount - store.entities.length,
        remainingEntities: store.entities.length,
      };
    }

    case "read_graph": {
      return {
        entities: store.entities,
        relations: store.relations,
        stats: {
          totalEntities: store.entities.length,
          totalRelations: store.relations.length,
        },
      };
    }

    default:
      throw new Error(`Unknown memory tool: ${toolName}`);
  }
}
