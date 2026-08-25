import { NextResponse } from "next/server"

import {
  createKnowledge,
  searchKnowledge,
} from "@/lib/knowledge/knowledge-service"

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json()

    if (
      body.action === "search"
    ) {
      const query =
        body.query?.trim()

      if (!query) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Query is required.",
          },
          { status: 400 }
        )
      }

      const results =
        await searchKnowledge(
          query,
          body.limit || 5
        )

      return NextResponse.json({
        success: true,
        results,
      })
    }

    const title =
      body.title?.trim()

    const content =
      body.content?.trim()

    const category =
      body.category?.trim()

    if (
      !title ||
      !content ||
      !category
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "title, content and category are required.",
        },
        { status: 400 }
      )
    }

    const knowledge =
      await createKnowledge({
        title,
        content,
        category,
        tags:
          Array.isArray(body.tags)
            ? body.tags
            : [],
      })

    return NextResponse.json({
      success: true,
      knowledge,
    })
  } catch (error) {
    console.error(
      "Knowledge API error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Knowledge operation failed.",
      },
      { status: 500 }
    )
  }
}