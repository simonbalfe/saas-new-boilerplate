"use server"

import { db } from "@/src/services/db"
import { xProfile } from "@/src/services/db/schema"
import { auth } from "@/src/services/better-auth/auth"
import env from "@/src/env"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function getXProfiles() {
  const session = await auth.api.getSession({ headers: await headers() })
  console.log("[getXProfiles] Session:", session?.user?.id)

  if (!session?.user) {
    console.error("[getXProfiles] Unauthorized access attempt")
    throw new Error("Unauthorized")
  }

  const profiles = await db.query.xProfile.findMany({
    where: eq(xProfile.userId, session.user.id),
    orderBy: (xProfile, { desc }) => [desc(xProfile.createdAt)],
  })

  console.log(`[getXProfiles] Found ${profiles.length} profiles for user ${session.user.id}`)

  return profiles
}

async function fetchTwitterUserId(userName: string): Promise<string | null> {
  console.log(`[fetchTwitterUserId] Looking up Twitter userId for ${userName}`)

  try {
    const scrapingApiUrl = env.SCRAPING_API_URL
    const response = await fetch(
      `${scrapingApiUrl}/x/user-info?userName=${userName}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      console.error(`[fetchTwitterUserId] Scraping API responded with ${response.status}: ${response.statusText}`)
      return null
    }

    const result = await response.json()

    if (result.status === 'success' && result.data?.id) {
      console.log(`[fetchTwitterUserId] Resolved Twitter userId: ${result.data.id} for handle: ${userName}`)
      return result.data.id
    }

    console.warn(`[fetchTwitterUserId] Could not resolve Twitter userId for ${userName}`)
    return null
  } catch (error) {
    console.error("[fetchTwitterUserId] Failed to fetch Twitter user ID:", error)
    return null
  }
}

export async function createXProfile(data: {
  handle: string
  notes?: string
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  console.log("[createXProfile] Request data:", data, "Session:", session?.user?.id)

  if (!session?.user) {
    console.error("[createXProfile] Unauthorized access attempt")
    throw new Error("Unauthorized")
  }

  const existing = await db.query.xProfile.findFirst({
    where: and(
      eq(xProfile.userId, session.user.id),
      eq(xProfile.handle, data.handle)
    ),
  })

  if (existing) {
    console.warn(`[createXProfile] Profile with handle "${data.handle}" already exists for user ${session.user.id}`)
    throw new Error("This profile has already been added")
  }

  const twitterUserId = await fetchTwitterUserId(data.handle)
  if (!twitterUserId) {
    console.warn(`[createXProfile] Twitter userId not found for handle "${data.handle}"`)
  } else {
    console.log(`[createXProfile] Twitter userId for handle "${data.handle}" is ${twitterUserId}`)
  }

  const profile = await db.insert(xProfile).values({
    id: nanoid(),
    userId: session.user.id,
    handle: data.handle,
    twitterUserId,
    notes: data.notes,
  }).returning()

  console.log("[createXProfile] Created new profile:", profile?.[0])

  return profile[0]
}

export async function updateXProfile(id: string, data: {
  notes?: string
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  console.log(`[updateXProfile] id: ${id}, data:`, data, "Session:", session?.user?.id)

  if (!session?.user) {
    console.error("[updateXProfile] Unauthorized access attempt")
    throw new Error("Unauthorized")
  }

  const profile = await db.query.xProfile.findFirst({
    where: and(
      eq(xProfile.id, id),
      eq(xProfile.userId, session.user.id)
    ),
  })

  if (!profile) {
    console.error(`[updateXProfile] Profile ${id} not found for user ${session.user.id}`)
    throw new Error("Profile not found")
  }

  const updated = await db.update(xProfile)
    .set({
      notes: data.notes,
    })
    .where(eq(xProfile.id, id))
    .returning()

  console.log("[updateXProfile] Updated profile:", updated?.[0])

  return updated[0]
}

export async function deleteXProfile(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  console.log(`[deleteXProfile] id: ${id}, Session:`, session?.user?.id)

  if (!session?.user) {
    console.error("[deleteXProfile] Unauthorized access attempt")
    throw new Error("Unauthorized")
  }

  const profile = await db.query.xProfile.findFirst({
    where: and(
      eq(xProfile.id, id),
      eq(xProfile.userId, session.user.id)
    ),
  })

  if (!profile) {
    console.error(`[deleteXProfile] Profile ${id} not found for user ${session.user.id}`)
    throw new Error("Profile not found")
  }

  await db.delete(xProfile).where(eq(xProfile.id, id))
  console.log(`[deleteXProfile] Deleted profile ${id} for user ${session.user.id}`)

  return { success: true }
}

export async function getTweets(profileId: string, cursor?: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const profile = await db.query.xProfile.findFirst({
    where: and(
      eq(xProfile.id, profileId),
      eq(xProfile.userId, session.user.id)
    ),
  })

  if (!profile) {
    throw new Error("Profile not found")
  }

  const scrapingApiUrl = env.SCRAPING_API_URL
  
  const params = new URLSearchParams({
    includeReplies: "false",
  })

  if (profile.twitterUserId) {
    params.append("userId", profile.twitterUserId)
  } else {
    params.append("userName", profile.handle)
  }

  if (cursor) {
    params.append("cursor", cursor)
  }

  try {
    const response = await fetch(
      `${scrapingApiUrl}/x/tweets?${params}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      throw new Error(`Scraping API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[getTweets] Scraping API response:`, JSON.stringify(data).substring(0, 200)) // Log first 200 chars to avoid clutter
    
    // Check if the response matches the new flattened structure
    if (data.status === "success" && Array.isArray(data.tweets)) {
       return {
         tweets: data.tweets,
         has_next_page: data.has_next_page,
         next_cursor: data.next_cursor,
       }
    }

    if (data.status !== "success" && !data.tweets && !data.data?.tweets) {
       throw new Error(data.message || "Failed to fetch tweets")
    }

    const tweets = data.tweets || data.data?.tweets || [];
    const nextCursor = data.next_cursor || data.data?.next_cursor || "";
    const hasNextPage = data.has_next_page || data.data?.has_next_page || false;

    return {
      tweets,
      has_next_page: hasNextPage,
      next_cursor: nextCursor,
    }
  } catch (error: any) {
    console.error("[getTweets] Error fetching tweets:", error)
    throw new Error(error.message || "Failed to fetch tweets")
  }
}
