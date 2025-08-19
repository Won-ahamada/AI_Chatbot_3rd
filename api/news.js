export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock news data for KERIS AI Assistant
    const mockNews = [
      {
        date: '2025.08.19',
        title: 'KERIS, 차세대 교육 플랫폼 구축을 위한 AI 기술 도입 발표'
      },
      {
        date: '2025.08.18',
        title: '전국 초중고 디지털 교과서 도입률 90% 달성'
      },
      {
        date: '2025.08.17',
        title: '교육 데이터 분석을 통한 맞춤형 학습 지원 시스템 확대'
      },
      {
        date: '2025.08.16',
        title: '메타버스 활용 원격교육 모델 개발 및 시범 운영 시작'
      },
      {
        date: '2025.08.15',
        title: 'AI 튜터링 시스템 도입으로 개별 학습 효과성 30% 향상'
      },
      {
        date: '2025.08.14',
        title: '교육 빅데이터 플랫폼 구축으로 정책 수립 지원 강화'
      }
    ];

    // If NEWS_API_KEY is provided, you can implement real news fetching here
    if (process.env.NEWS_API_KEY) {
      // Example: Fetch real news from NewsAPI or other services
      // const realNews = await fetchRealNews();
      // return res.status(200).json(realNews);
    }

    return res.status(200).json(mockNews);

  } catch (error) {
    console.error('News API Error:', error);
    
    // Return fallback news in case of error
    const fallbackNews = [
      {
        date: '2025.08.19',
        title: '뉴스를 불러오는 중 오류가 발생했습니다.'
      }
    ];

    return res.status(200).json(fallbackNews);
  }
}

// Optional: Function to fetch real news (implement as needed)
async function fetchRealNews() {
  // Implementation example for NewsAPI
  // const response = await fetch(`https://newsapi.org/v2/everything?q=education+digital+korea&apiKey=${process.env.NEWS_API_KEY}&language=ko&sortBy=publishedAt&pageSize=6`);
  // const data = await response.json();
  // 
  // return data.articles.map(article => ({
  //   date: new Date(article.publishedAt).toLocaleDateString('ko-KR'),
  //   title: article.title,
  //   url: article.url
  // }));
  
  return [];
}