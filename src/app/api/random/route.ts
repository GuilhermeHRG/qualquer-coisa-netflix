import { NextResponse } from 'next/server';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

interface Genre {
  id: number;
  name: string;
}

interface Video {
  site: string;
  type: string;
  key: string;
}

interface Creator {
  name: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'movie';
  const genre = searchParams.get('genre');

  try {
    const discoverUrl = `${BASE_URL}/discover/${type}`;
    const response = await axios.get(discoverUrl, {
      params: {
        api_key: TMDB_API_KEY,
        with_watch_providers: 8, // Netflix
        watch_region: 'BR',
        with_genres: genre || '',
        sort_by: 'popularity.desc',
        language: 'pt-BR',
        include_adult: false,
        page: 1,
      },
    });

    const results = response.data.results;
    if (!results || results.length === 0) {
      return NextResponse.json({ error: 'Nenhum título encontrado' }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * results.length);
    const chosen = results[randomIndex];

    const [detailsRes, videosRes] = await Promise.all([
      axios.get(`${BASE_URL}/${type}/${chosen.id}`, {
        params: { api_key: TMDB_API_KEY, language: 'pt-BR' },
      }),
      axios.get(`${BASE_URL}/${type}/${chosen.id}/videos`, {
        params: { api_key: TMDB_API_KEY, language: 'pt-BR' },
      }),
    ]);

    const details = detailsRes.data;
    const creators = (details.created_by as Creator[] || []).map(c => c.name).slice(0, 2);

    const trailer = (videosRes.data.results as Video[]).find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    );

    return NextResponse.json({
      title: details.title || details.name,
      year: (details.release_date || details.first_air_date || '').split('-')[0],
      overview: details.overview,
      genres: (details.genres as Genre[]).map((g) => g.name),
      poster: details.poster_path
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
        : null,
      rating: details.vote_average ? Math.round(details.vote_average * 10) : null,
      status: details.status,
      creators,
      trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    });
  } catch (error) {
    console.error('Erro na API do TMDb:', error);
    return NextResponse.json({ error: 'Erro ao buscar título completo' }, { status: 500 });
  }
}
