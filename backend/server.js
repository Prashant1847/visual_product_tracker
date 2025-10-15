import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dotenv from 'dotenv'
import { 
  searchByImageUrl, 
  searchByImageFile, 
  initializeSearchService, 
} from './services/searchService.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const upload = multer({ storage: multer.memoryStorage() })



app.post('/api/search/url', async (req, res) => {
  console.log('[DEBUG] /api/search/url payload:', req.body)
  
  try {
    const { image_url, top_k, category } = req.body
    
    // Validate required parameters
    if (!image_url) {
      return res.status(400).json({ error: 'image_url is required' })
    }
    
    const topK = parseInt(top_k) || 5
    console.log('[DEBUG] Search parameters - URL:', image_url, 'topK:', topK, 'category:', category)
    
    // Perform the search
    const results = await searchByImageUrl(image_url, topK, category)
    
    console.log('[DEBUG] /api/search/url completed successfully, found', results.results.length, 'results')
    return res.json(results)

  } catch (error) {
    console.error('[ERROR] /api/search/url failed:', error)
    res.status(500).json({ 
      error: 'search failed', 
      message: error.message,
      debug: process.env.NODE_ENV === 'development'
    })
  }
})



app.post('/api/search/upload', upload.single('file'), async (req, res) => {
  console.log('[DEBUG] /api/search/upload received file upload')
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'file required' })
    }
    
    const { top_k, category } = req.body
    const topK = parseInt(top_k) || 5
    
    console.log('[DEBUG] Upload parameters - filename:', req.file.originalname, 'size:', req.file.size, 'mimetype:', req.file.mimetype, 'topK:', topK, 'category:', category)
    
    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' })
    }
    
    // Perform the search
    const results = await searchByImageFile(
      req.file.buffer, 
      req.file.mimetype, 
      topK, 
      category
    )
    
    console.log('[DEBUG] /api/search/upload completed successfully, found', results.results.length, 'results')
    return res.json(results)

  } catch (error) {
    console.error('[ERROR] /api/search/upload failed:', error)
    res.status(500).json({ 
      error: 'upload search failed', 
      message: error.message,
      debug: process.env.NODE_ENV === 'development'
    })
  }
})


// Initialize search service and start server
async function startServer() {
  try {
    console.log('[DEBUG] Initializing search service...')
    await initializeSearchService()
    
    const PORT = process.env.NODE_PORT || 8080
    app.listen(PORT, () => {
      console.log(`Backend listening on :${PORT}`)
      console.log('[DEBUG] Server started successfully')
    })
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error)
    process.exit(1)
  }
}


startServer()


