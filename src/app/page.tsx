'use client';

import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

type TitleData = {
  title: string;
  year: string;
  genres: string[];
  status: string;
  creators: string[];
  rating: number | null;
  overview: string;
  poster: string | null;
  trailer_url: string | null;
};

export default function Home() {
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [genre, setGenre] = useState('');
  const [result, setResult] = useState<TitleData | null>(null);
  const [loading, setLoading] = useState(false);

  const genres = [
    { id: 28, name: 'Ação' },
    { id: 35, name: 'Comédia' },
    { id: 18, name: 'Drama' },
    { id: 99, name: 'Documentário' },
    { id: 27, name: 'Terror' },
    { id: 10749, name: 'Romance' },
    { id: 16, name: 'Animação' },
    { id: 878, name: 'Ficção Científica' },
    { id: 14, name: 'Fantasia' },
    { id: 53, name: 'Suspense' },
  ];

  const getRandomTitle = async () => {
    setLoading(true);
    try {
      const res = await axios.get<TitleData>('/api/random', {
        params: { type, genre },
      });
      setResult(res.data);
    } catch {
      alert('Erro ao buscar título');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.logo}>🎬 Qualquer Coisa Netflix</h1>
        <div style={styles.controls}>
          <select value={type} onChange={(e) => setType(e.target.value as 'movie' | 'tv')} style={styles.select}>
            <option value="movie">Filme</option>
            <option value="tv">Série</option>
          </select>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} style={styles.select}>
            <option value="">Todos os Gêneros</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <button onClick={getRandomTitle} disabled={loading} style={styles.button}>
            {loading ? 'Buscando...' : 'Sortear'}
          </button>
        </div>
      </div>

      {result && (
        <div style={styles.card}>
          {result.poster && (
            <Image
              src={result.poster}
              alt={result.title}
              width={800}
              height={450}
              style={styles.poster}
              priority
            />
          )}
          <div style={styles.info}>
            <h2>{result.title} <span style={{ color: '#888' }}>({result.year})</span></h2>
            <p style={styles.genres}>{result.genres.join(', ')}</p>
            <p style={styles.status}>Status: {result.status}</p>
            {result.creators.length > 0 && (
              <p><strong>Criação:</strong> {result.creators.join(', ')}</p>
            )}
            {result.rating !== null && (
              <p style={styles.rating}>⭐ {result.rating}% aprovação</p>
            )}
            <p style={styles.overview}>{result.overview}</p>
            {result.trailer_url && (
              <a href={result.trailer_url} target="_blank" rel="noopener noreferrer" style={styles.trailerButton}>
                ▶ Ver Trailer
              </a>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

const styles = {
  page: {
    backgroundColor: '#141414',
    minHeight: '100vh',
    padding: '40px 20px',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    maxWidth: 900,
    margin: '0 auto 40px auto',
    textAlign: 'center' as const,
  },
  logo: {
    color: '#e50914',
    fontSize: '2.5rem',
    marginBottom: 20,
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '10px',
  },
  select: {
    padding: '10px',
    fontSize: '1rem',
    backgroundColor: '#000',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '4px',
  },
  button: {
    backgroundColor: '#e50914',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    borderRadius: '4px',
  },
  card: {
    maxWidth: 900,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#1e1e1e',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
  },
  poster: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover' as const,
  },
  info: {
    padding: '20px',
  },
  genres: {
    color: '#aaa',
    fontStyle: 'italic',
    margin: '8px 0',
  },
  status: {
    color: '#ccc',
    marginBottom: '8px',
  },
  overview: {
    color: '#ddd',
    marginTop: '15px',
    lineHeight: '1.5',
  },
  rating: {
    color: '#44c767',
    fontWeight: 'bold' as const,
  },
  trailerButton: {
    marginTop: '20px',
    display: 'inline-block',
    backgroundColor: '#e50914',
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 18px',
    borderRadius: '5px',
    fontWeight: 'bold' as const,
  },
};
