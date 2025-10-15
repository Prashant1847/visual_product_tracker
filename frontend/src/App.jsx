import React from 'react'
import demoImages from './data/DemoImages'



export default function App() {
  const [imageUrl, setImageUrl] = React.useState('')
  const [file, setFile] = React.useState(null)
  const [preview, setPreview] = React.useState('')
  const [topK, setTopK] = React.useState(12)
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState([])
  const [error, setError] = React.useState('')

  React.useEffect(() => { 
    if (file) { 
      const url = URL.createObjectURL(file);
      setPreview(url); 
      return () => URL.revokeObjectURL(url) }
    }, [file])

  async function searchByUrl() {
    setError(''); setLoading(true); setResults([])
    try {
      console.log( imageUrl)
      const res = await fetch('http://localhost:8080/api/search/url', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          { image_url: imageUrl, top_k: topK })
        })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setResults(data.results || [])
      setPreview(imageUrl)
    } catch (err) { setError(err.message || 'Failed') }
    finally { setLoading(false) }
  }

  async function searchByUpload() {
    if (!file) { 
      setError('Choose a file');
      return
    }


    setError('');
    setLoading(true); 
    setResults([])

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('top_k', String(topK))


      const res = await fetch('http://localhost:8080/api/search/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Request failed')

      setResults(data.results || [])
    } catch (err) { 
      setError(err.message || 'Failed')
    }
    finally { setLoading(false) }

  }

  return (
    <div className="container">
      <h1>Visual Product Matcher</h1>

      <div className="controls">
        <input type="text" placeholder="Paste image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        <button onClick={searchByUrl} disabled={loading || !imageUrl}>{loading ? <span className="spinner" /> : 'Search by URL'}</button>
      </div>

      <div className="row">
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button onClick={searchByUpload} disabled={loading || !file}>{loading ? <span className="spinner" /> : 'Search by Upload'}</button>
        <input type="number" min={1} max={20  } value={topK} onChange={e => setTopK(Number(e.target.value) || 12)} />
      </div>

      {/* Quick Demo Section */}
      <div className="quick-demo">
        <h2>Quick Demo</h2>
        <div className="demo-images">
          {demoImages.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Demo ${idx + 1}`}
              style={{ width: 150, height: 150, cursor: 'pointer', marginRight: 10, objectFit: 'cover' }}
              onClick={() => {
                setImageUrl(url)
              }}
            />
          ))}
        </div>
      </div>


      {preview && (
        <div className="preview">
          <div className="card">
            <div className="muted">Query Image</div>
            <img src={preview} alt="preview" />
          </div>
        </div>
      )}

      {error && <div className="card">{error}</div>}

      <div className="grid">
        {results.map((r, i) => (
          <a key={i} className="item" href={r.image_url} target="_blank" rel="noreferrer">
            <img className="thumb" src={r.image_url} alt={r.name} />
            <div className="meta">
              <div className="name">{r.name || r.id || 'Unknown'}</div>
              <div className="score">Score: {typeof r.score === 'number' ? r.score.toFixed(4) : r.score}</div>
            </div>
          </a>
        ))}
      </div>

    </div>
  )
}


