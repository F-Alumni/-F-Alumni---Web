import { aiApiClient } from '@/services/api/apiClient'

export interface CitationItem {
  sourceTitle: string
  section: string
  programCode?: string | null
  snippet: string
}

export interface AiChatPayload {
  question: string
  conversationId?: string | null
  campus?: string
  major?: string
}

export interface AiChatResponse {
  conversationId: string
  answer: string
  citations: CitationItem[]
  createdAt: string
}

export interface RagIngestPayload {
  directoryPath?: string
  forceReindex?: boolean
}

export interface RagIngestResult {
  totalIndexed: number
  message?: string
}

export interface RecommendMentorPayload {
  major?: string
  targetSkills?: string[]
  careerGoal?: string
}

export interface MentorItem {
  id: string
  userId: string
  fullName: string
  email: string
  major: string
  currentCompany: string
  jobTitle: string
  skills: string
  bio: string
  avatarUrl: string
  matchScore: number
}

/**
 * AI Service operations connecting to AI Microservice & API Gateway.
 */
export const aiService = {
  /**
   * Ask AI question with multi-turn conversation and university citations.
   * POST /api/v1/ai/chat
   */
  async ask(payload: AiChatPayload): Promise<AiChatResponse> {
    const res = await aiApiClient.post<AiChatResponse>('/ai/chat', payload)
    return res.data
  },

  /**
   * Recommend Alumni mentors matching student's major, target skills, and career aspirations.
   * POST /api/v1/ai/mentors/recommend
   */
  async recommendMentors(payload: RecommendMentorPayload = {}): Promise<MentorItem[]> {
    const res = await aiApiClient.post<MentorItem[]>('/ai/mentors/recommend', {
      major: payload.major || 'SE',
      targetSkills: payload.targetSkills || [],
      careerGoal: payload.careerGoal || null,
    })
    return res.data
  },

  /**
   * Administrative RAG Ingestion / re-indexing trigger.
   * POST /api/v1/ai/rag/ingest
   */
  async ingestRag(payload?: RagIngestPayload): Promise<RagIngestResult> {
    const res = await aiApiClient.post<RagIngestResult>('/ai/rag/ingest', payload || {})
    return res.data
  },
}
