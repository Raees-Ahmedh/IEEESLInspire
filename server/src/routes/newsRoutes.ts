// server/src/routes/newsRoutes.ts - API routes using existing NewsArticle schema
import express, { Request, Response } from 'express';
import { prisma } from '../config/database';

const router = express.Router();

// GET /api/news - Get published news articles for landing page
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = 6, category, status = 'published' } = req.query;
    
    console.log('🔄 Fetching news articles...');

    // Build where clause using existing schema
    const whereClause: any = {
      status: status as string // draft/pending/approved/published/archived
    };

    if (category) {
      whereClause.category = category;
    }

    // Fetch news articles using existing NewsArticle model
    const newsArticles = await prisma.newsArticle.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true, // Using description instead of excerpt
        imageUrl: true,
        category: true,
        tags: true,
        publishDate: true,
        auditInfo: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { publishDate: 'desc' },
        { id: 'desc' }
      ],
      take: parseInt(limit as string)
    });

    // Transform data to match frontend expectations
    const transformedArticles = newsArticles.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.description, // Using description as excerpt
      imageUrl: article.imageUrl,
      authorName: article.author ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() : 'Anonymous',
      authorEmail: article.author?.email,
      category: article.category || 'General',
      tags: Array.isArray(article.tags) ? article.tags : [],
      publishDate: article.publishDate?.toISOString(),
      // Extract reading time from auditInfo if available, otherwise estimate
      readTime: article.auditInfo && typeof article.auditInfo === 'object' && 'readTime' in article.auditInfo 
        ? article.auditInfo.readTime 
        : Math.ceil(Math.random() * 8) + 2, // Random 2-10 minutes for demo
      viewCount: article.auditInfo && typeof article.auditInfo === 'object' && 'viewCount' in article.auditInfo 
        ? article.auditInfo.viewCount 
        : Math.floor(Math.random() * 100)
    }));

    console.log(`✅ Fetched ${transformedArticles.length} news articles`);

    res.json({
      success: true,
      data: transformedArticles,
      count: transformedArticles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error fetching news articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news articles',
      details: error.message
    });
  }
});

// GET /api/news/:id - Get single news article by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const articleId = parseInt(req.params.id);
    
    console.log(`🔄 Fetching news article: ${articleId}`);

    const newsArticle = await prisma.newsArticle.findUnique({
      where: {
        id: articleId,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        content: true,
        description: true,
        imageUrl: true,
        category: true,
        tags: true,
        publishDate: true,
        auditInfo: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!newsArticle) {
      return res.status(404).json({
        success: false,
        error: 'News article not found'
      });
    }

    // Transform data
    const transformedArticle = {
      id: newsArticle.id,
      title: newsArticle.title,
      content: newsArticle.content,
      excerpt: newsArticle.description,
      imageUrl: newsArticle.imageUrl,
      authorName: newsArticle.author ? `${newsArticle.author.firstName || ''} ${newsArticle.author.lastName || ''}`.trim() : 'Anonymous',
      authorEmail: newsArticle.author?.email,
      category: newsArticle.category || 'General',
      tags: Array.isArray(newsArticle.tags) ? newsArticle.tags : [],
      publishDate: newsArticle.publishDate?.toISOString(),
      readTime: newsArticle.auditInfo && typeof newsArticle.auditInfo === 'object' && 'readTime' in newsArticle.auditInfo 
        ? newsArticle.auditInfo.readTime 
        : Math.ceil(newsArticle.content.split(' ').length / 200), // Estimate based on content
      viewCount: newsArticle.auditInfo && typeof newsArticle.auditInfo === 'object' && 'viewCount' in newsArticle.auditInfo 
        ? newsArticle.auditInfo.viewCount 
        : 0
    };

    console.log(`✅ Fetched news article: ${transformedArticle.title}`);

    res.json({
      success: true,
      data: transformedArticle,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error fetching news article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news article',
      details: error.message
    });
  }
});

// GET /api/news/category/:category - Get news by category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = 10, status = 'published' } = req.query;
    
    console.log(`🔄 Fetching news for category: ${category}`);

    const newsArticles = await prisma.newsArticle.findMany({
      where: {
        category: category,
        status: status as string
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        category: true,
        tags: true,
        publishDate: true,
        auditInfo: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { publishDate: 'desc' }
      ],
      take: parseInt(limit as string)
    });

    // Transform data
    const transformedArticles = newsArticles.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.description,
      imageUrl: article.imageUrl,
      authorName: article.author ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() : 'Anonymous',
      category: article.category || 'General',
      tags: Array.isArray(article.tags) ? article.tags : [],
      publishDate: article.publishDate?.toISOString(),
      readTime: article.auditInfo && typeof article.auditInfo === 'object' && 'readTime' in article.auditInfo 
        ? article.auditInfo.readTime 
        : Math.ceil(Math.random() * 8) + 2,
      viewCount: article.auditInfo && typeof article.auditInfo === 'object' && 'viewCount' in article.auditInfo 
        ? article.auditInfo.viewCount 
        : Math.floor(Math.random() * 100)
    }));

    console.log(`✅ Fetched ${transformedArticles.length} articles for category: ${category}`);

    res.json({
      success: true,
      data: transformedArticles,
      category: category,
      count: transformedArticles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error fetching news by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news by category',
      details: error.message
    });
  }
});

// GET /api/news/stats/overview - Get news statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Fetching news statistics...');

    const [
      totalArticles,
      publishedArticles,
      categories,
      recentArticles
    ] = await Promise.all([
      prisma.newsArticle.count(),
      prisma.newsArticle.count({ where: { status: 'published' } }),
      prisma.newsArticle.groupBy({
        by: ['category'],
        where: { status: 'published' },
        _count: { category: true }
      }),
      prisma.newsArticle.count({
        where: {
          status: 'published',
          publishDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    const stats = {
      total: totalArticles,
      published: publishedArticles,
      draft: await prisma.newsArticle.count({ where: { status: 'draft' } }),
      pending: await prisma.newsArticle.count({ where: { status: 'pending' } }),
      recentlyPublished: recentArticles,
      categories: categories.map(cat => ({
        name: cat.category || 'Uncategorized',
        count: cat._count.category
      }))
    };

    console.log('✅ Fetched news statistics');

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error fetching news statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news statistics',
      details: error.message
    });
  }
});

export default router;