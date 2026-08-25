import clientPromise from "@/lib/mongodb"
import { generateEmbedding } from "@/lib/ai/rag"

const COLLECTION =
  "knowledge"

const INDEX_NAME =
  "knowledge_vector_index"

export type KnowledgeInput = {
  title: string
  content: string
  category: string
  tags?: string[]
}

export async function createKnowledge(
  input: KnowledgeInput
) {
  const client =
    await clientPromise

  const db =
    client.db("hayesride")

  const text = `${input.title}\n\n${input.content}`

  const embedding =
    await generateEmbedding(text)

  const result =
    await db
      .collection(COLLECTION)
      .insertOne({
        title: input.title,
        content: input.content,
        category: input.category,
        tags: input.tags || [],
        embedding,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

  return {
    id: result.insertedId.toString(),
    title: input.title,
    content: input.content,
    category: input.category,
    tags: input.tags || [],
  }
}

export async function searchKnowledge(
  query: string,
  limit = 5
) {
  const client =
    await clientPromise

  const db =
    client.db("hayesride")

  const collection =
    db.collection(COLLECTION)

  const queryEmbedding =
    await generateEmbedding(query)

  const results =
    await collection
      .aggregate([
        {
          $vectorSearch: {
            index: INDEX_NAME,

            path: "embedding",

            queryVector:
              queryEmbedding,

            numCandidates:
              Math.max(limit * 10, 50),

            limit,
          },
        },

        {
          $project: {
            _id: 1,
            title: 1,
            content: 1,
            category: 1,
            tags: 1,

            score: {
              $meta:
                "vectorSearchScore",
            },
          },
        },
      ])
      .toArray()

  return results
}