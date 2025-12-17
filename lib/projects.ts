import { createClient } from '@/lib/supabase/client'

export type Project = {
  id: string
  user_id: string
  name: string
  prompt: string
  html_content: string | null
  chat_history: any[]
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  last_viewed_at: string
}

export type CreateProjectData = {
  name: string
  prompt: string
  html_content?: string
  chat_history?: any[]
  thumbnail_url?: string
}

export type UpdateProjectData = {
  name?: string
  html_content?: string
  chat_history?: any[]
  thumbnail_url?: string
  last_viewed_at?: string
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectData): Promise<Project | null> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('Auth error:', authError)
    return null
  }

  if (!user) {
    console.error('No user found - not authenticated')
    return null
  }

  console.log('Creating project for user:', user.id)

  const insertData = {
    user_id: user.id,
    name: data.name,
    prompt: data.prompt,
    html_content: data.html_content || null,
    chat_history: data.chat_history || [],
    thumbnail_url: data.thumbnail_url || null
  }

  console.log('Insert data:', insertData)

  const { data: project, error } = await supabase
    .from('projects')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('❌ Error creating project:')
    console.error('Message:', error.message)
    console.error('Details:', error.details)
    console.error('Hint:', error.hint)
    console.error('Code:', error.code)
    console.error('Full error object:', JSON.stringify(error, null, 2))
    return null
  }

  console.log('Project created in database:', project)
  return project
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectData
): Promise<Project | null> {
  const supabase = createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return null
  }

  return project
}

/**
 * Get a project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  // Update last_viewed_at
  await updateProject(projectId, { last_viewed_at: new Date().toISOString() })

  return project
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects(): Promise<Project[]> {
  const supabase = createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return projects || []
}

/**
 * Get recently viewed projects (last 5)
 */
export async function getRecentlyViewedProjects(): Promise<Project[]> {
  const supabase = createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('last_viewed_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching recently viewed projects:', error)
    return []
  }

  return projects || []
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    return false
  }

  return true
}
