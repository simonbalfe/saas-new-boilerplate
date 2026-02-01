"use server"

import { db } from "@/src/services/db"
import { xProfile } from "@/src/services/db/schema"
import { auth } from "@/src/services/better-auth/auth"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
import env from "@/src/env"
import { generate } from "@/src/services/openrouter"
import { 
  GENERATE_TWEET_SYSTEM_PROMPT, 
  createGenerateTweetUserPrompt 
} from "@/src/lib/prompts/generate-tweet"

interface GenerateTweetOptions {
  profileId: string
  topic?: string
}

interface Tweet {
  id: string
  text: string
  createdAt: string
}

async function fetchTweetsFromProfile(profileId: string, userId: string): Promise<Tweet[]> {
  const profile = await db.query.xProfile.findFirst({
    where: and(
      eq(xProfile.id, profileId),
      eq(xProfile.userId, userId)
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
    throw new Error(`Failed to fetch tweets: ${response.statusText}`)
  }

  const data = await response.json()
  
  if (data.status === "success" && Array.isArray(data.tweets)) {
    return data.tweets
  }

  return data.tweets || data.data?.tweets || []
}

export async function generateTweet(options: GenerateTweetOptions): Promise<string> {
  const { profileId, topic } = options

  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  console.log(`[generateTweet] Generating tweet for profile ${profileId} with topic: ${topic || 'none'}`)

  const tweets = await fetchTweetsFromProfile(profileId, session.user.id)

  if (tweets.length === 0) {
    throw new Error("No tweets found for this profile. Cannot generate without examples.")
  }

  const exampleTweets = tweets.slice(0, 20).map(t => t.text)

  console.log(`[generateTweet] Using ${exampleTweets.length} tweets as examples`)

  const text = await generate({
    system: GENERATE_TWEET_SYSTEM_PROMPT,
    prompt: createGenerateTweetUserPrompt(exampleTweets, topic),
    maxTokens: 300,
  })

  console.log(`[generateTweet] Generated tweet: ${text}`)

  return text
}
