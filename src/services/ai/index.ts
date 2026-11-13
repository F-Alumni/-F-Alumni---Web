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
  totalFilesProcessed: number
  totalChunksCreated: number
  ingestedFiles: string[]
  message: string
}

export interface AiMessageDto {
  id: string
  role: string
  content: string
  citations: CitationItem[]
  createdAt: string
}

export interface AiConversationDto {
  id: string
  title: string
  createdAt: string
  lastMessageAt: string
  messages: AiMessageDto[]
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

  /**
   * Administrative RAG document upload (.docx, .md, .txt) + immediate re-indexing.
   * POST /api/v1/ai/rag/upload
   */
  async uploadRagDocument(file: File): Promise<RagIngestResult> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await aiApiClient.post<RagIngestResult>('/ai/rag/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
    return res.data
  },

  /**
   * List authenticated user's AI conversation history.
   * GET /api/v1/ai/conversations
   */
  async getConversations(): Promise<AiConversationDto[]> {
    const res = await aiApiClient.get<AiConversationDto[]>('/ai/conversations')
    return res.data || []
  },

  /**
   * Load full message history for a specific AI conversation.
   * GET /api/v1/ai/conversations/{conversationId}
   */
  async getConversationById(conversationId: string): Promise<AiConversationDto> {
    const res = await aiApiClient.get<AiConversationDto>(`/ai/conversations/${conversationId}`)
    return res.data
  },
}
