"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ExternalLink, MessageCircle, Heart, Repeat2, Eye, Sparkles, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { getXProfiles, createXProfile, deleteXProfile, getTweets } from "@/src/actions/x-profiles"
import { generateTweet } from "@/src/actions/generate-tweet"
import { toast } from "sonner"

interface XProfile {
  id: string
  handle: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

interface Tweet {
  id: string
  text: string
  createdAt: string
  replyCount: number
  retweetCount: number
  likeCount: number
  viewCount: number
  url: string
}

export default function CreatePostPage() {
  const [profiles, setProfiles] = useState<XProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isTweetsDialogOpen, setIsTweetsDialogOpen] = useState(false)
  const [isLoadingTweets, setIsLoadingTweets] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [hasNextPage, setHasNextPage] = useState(false)
  
  const [formData, setFormData] = useState({
    handle: "",
    notes: "",
  })

  // Generate tweet state
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [generateProfileId, setGenerateProfileId] = useState<string | null>(null)
  const [generateTopic, setGenerateTopic] = useState("")
  const [generatedTweet, setGeneratedTweet] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      setIsLoading(true)
      const data = await getXProfiles()
      setProfiles(data)
    } catch (error) {
      toast.error("Failed to load profiles")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.handle.trim()) {
      toast.error("Profile handle is required")
      return
    }

    try {
      setIsSubmitting(true)
      await createXProfile({
        handle: formData.handle.replace('@', ''),
        notes: formData.notes || undefined,
      })
      
      toast.success("Profile added successfully")
      setIsDialogOpen(false)
      setFormData({
        handle: "",
        notes: "",
      })
      await loadProfiles()
    } catch (error: any) {
      toast.error(error.message || "Failed to add profile")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this profile?")) {
      return
    }

    try {
      await deleteXProfile(id)
      toast.success("Profile deleted successfully")
      await loadProfiles()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete profile")
      console.error(error)
    }
  }

  const loadTweets = async (profileId: string, cursor?: string) => {
    try {
      setIsLoadingTweets(true)
      
      const data = await getTweets(profileId, cursor)
      
      if (cursor) {
        setTweets(prev => [...(prev || []), ...(data.tweets || [])])
      } else {
        setTweets(data.tweets || [])
      }
      
      setNextCursor(data.next_cursor)
      setHasNextPage(data.has_next_page)
    } catch (error: any) {
      toast.error(error.message || "Failed to load tweets")
      setTweets([])
      console.error(error)
    } finally {
      setIsLoadingTweets(false)
    }
  }

  const handleViewTweets = async (profileId: string) => {
    setSelectedProfile(profileId)
    setTweets([])
    setNextCursor(undefined)
    setHasNextPage(false)
    setIsTweetsDialogOpen(true)
    await loadTweets(profileId)
  }

  const handleLoadMore = () => {
    if (selectedProfile && nextCursor && hasNextPage) {
      loadTweets(selectedProfile, nextCursor)
    }
  }

  const handleOpenGenerateDialog = (profileId: string) => {
    setGenerateProfileId(profileId)
    setGenerateTopic("")
    setGeneratedTweet("")
    setIsGenerateDialogOpen(true)
  }

  const handleGenerate = async () => {
    if (!generateProfileId) return

    try {
      setIsGenerating(true)
      const tweet = await generateTweet({
        profileId: generateProfileId,
        topic: generateTopic || undefined,
      })
      setGeneratedTweet(tweet)
      toast.success("Tweet generated!")
    } catch (error: any) {
      toast.error(error.message || "Failed to generate tweet")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyTweet = async () => {
    if (!generatedTweet) return
    
    try {
      await navigator.clipboard.writeText(generatedTweet)
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '0'
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create X Post</h1>
        <p className="text-muted-foreground">
          Upload and manage profiles that create great posts to help inspire your content
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reference Profiles</CardTitle>
              <CardDescription>
                Add X profiles that consistently create engaging posts
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add X Profile</DialogTitle>
                    <DialogDescription>
                      Add a profile that creates posts you'd like to learn from
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="handle">
                        X Handle <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="handle"
                        placeholder="@username or username"
                        value={formData.handle}
                        onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Why you're adding this profile, what makes their posts great..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Profile"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading profiles...
            </div>
          ) : profiles.length === 0 ? (
            <Alert>
              <AlertDescription>
                No profiles added yet. Add your first profile to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">@{profile.handle}</h3>
                      <a
                        href={`https://x.com/${profile.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    {profile.notes && (
                      <p className="text-sm text-muted-foreground">{profile.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenGenerateDialog(profile.id)}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTweets(profile.id)}
                    >
                      View Tweets
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(profile.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isTweetsDialogOpen} onOpenChange={setIsTweetsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tweets from @{profiles.find(p => p.id === selectedProfile)?.handle}</DialogTitle>
            <DialogDescription>
              Recent tweets from this profile
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingTweets && (!tweets || tweets.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tweets...
            </div>
          ) : !tweets || tweets.length === 0 ? (
            <Alert>
              <AlertDescription>
                No tweets found for this profile.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <Card key={tweet.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(tweet.createdAt)}
                      </span>
                      <a
                        href={tweet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-xs"
                      >
                        View on X
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap break-words">{tweet.text}</p>
                    
                    <div className="flex items-center gap-6 text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MessageCircle className="h-4 w-4" />
                        <span>{formatNumber(tweet.replyCount)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Repeat2 className="h-4 w-4" />
                        <span>{formatNumber(tweet.retweetCount)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Heart className="h-4 w-4" />
                        <span>{formatNumber(tweet.likeCount)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(tweet.viewCount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingTweets}
                  >
                    {isLoadingTweets ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Tweet Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Tweet
            </DialogTitle>
            <DialogDescription>
              Generate a new tweet in the style of @{profiles.find(p => p.id === generateProfileId)?.handle}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (optional)</Label>
              <Textarea
                id="topic"
                placeholder="What should the tweet be about? Leave empty for a random topic in their style..."
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                rows={2}
              />
            </div>

            {generatedTweet && (
              <div className="space-y-2">
                <Label>Generated Tweet</Label>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{generatedTweet}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        {generatedTweet.length}/280 characters
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyTweet}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : generatedTweet ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
