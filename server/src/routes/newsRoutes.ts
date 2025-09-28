// server/src/routes/newsRoutes.ts - API routes using existing NewsArticle schema
import express, { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/authMiddleware';

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

// ADMIN/EDITOR ROUTES FOR NEWS MANAGEMENT

// GET /api/news/admin/articles - Get all articles for admin/editor dashboard
router.get('/admin/articles', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user } = req;
    
    if (!user || !['admin', 'manager', 'editor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin/Manager/Editor role required.'
      });
    }

    console.log(`🔄 Fetching articles for ${user.role}...`);

    // Build where clause based on user role
    const whereClause: any = {};
    
    // Editors can only see their own articles
    if (user.role === 'editor') {
      whereClause.authorId = user.id;
    }
    // Admins and managers can see all articles

    const articles = await prisma.newsArticle.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        imageUrl: true,
        category: true,
        status: true,
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
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { auditInfo: 'desc' } // Order by creation/update time
      ]
    });

    console.log(`✅ Fetched ${articles.length} articles for ${user.role}`);

    res.json({
      success: true,
      data: articles,
      count: articles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error fetching articles for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
      details: error.message
    });
  }
});

// POST /api/news/admin/articles - Create new article
router.post('/admin/articles', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user } = req;
    
    if (!user || !['admin', 'manager', 'editor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin/Manager/Editor role required.'
      });
    }

    const { title, content, description, category, imageUrl, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    console.log(`🔄 Creating article by ${user.role}: ${title}`);

    // Determine article status based on user role
    let articleStatus = status || 'draft';
    if (user.role === 'editor') {
      // Editors' articles need approval
      articleStatus = 'pending';
    } else if (user.role === 'admin' || user.role === 'manager') {
      // Admins and managers can publish directly
      articleStatus = status || 'published';
    }

    const newArticle = await prisma.newsArticle.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        description: description?.trim() || null,
        category: category || 'general',
        imageUrl: imageUrl?.trim() || null,
        status: articleStatus,
        authorId: user.id,
        publishDate: articleStatus === 'published' ? new Date() : null,
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: user.id,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id
        }
      },
      include: {
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

    console.log(`✅ Created article: ${newArticle.title} (Status: ${newArticle.status})`);

    res.status(201).json({
      success: true,
      data: newArticle,
      message: `Article created successfully${articleStatus === 'pending' ? ' and submitted for approval' : ''}`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error creating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create article',
      details: error.message
    });
  }
});

// PUT /api/news/admin/articles/:id - Update article
router.put('/admin/articles/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const articleId = parseInt(req.params.id);
    
    if (!user || !['admin', 'manager', 'editor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin/Manager/Editor role required.'
      });
    }

    // Check if article exists and user has permission to edit
    const existingArticle = await prisma.newsArticle.findUnique({
      where: { id: articleId }
    });

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Editors can only edit their own articles
    if (user.role === 'editor' && existingArticle.authorId !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only edit your own articles.'
      });
    }

    const { title, content, description, category, imageUrl, status } = req.body;

    console.log(`🔄 Updating article ${articleId} by ${user.role}`);

    // Prepare update data
    const updateData: any = {
      auditInfo: {
        ...existingArticle.auditInfo as object,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
      }
    };

    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (category) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;

    // Handle status updates based on user role
    if (status) {
      if (user.role === 'editor') {
        // Editors can change draft to pending, but not publish
        if (['draft', 'pending'].includes(status)) {
          updateData.status = status;
        }
      } else if (user.role === 'admin' || user.role === 'manager') {
        // Admins and managers can set any status
        updateData.status = status;
        if (status === 'published' && existingArticle.status !== 'published') {
          updateData.publishDate = new Date();
          updateData.approvedBy = user.id;
        }
      }
    }

    const updatedArticle = await prisma.newsArticle.update({
      where: { id: articleId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Updated article: ${updatedArticle.title}`);

    res.json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error updating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update article',
      details: error.message
    });
  }
});

// DELETE /api/news/admin/articles/:id - Delete article
router.delete('/admin/articles/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const articleId = parseInt(req.params.id);
    
    if (!user || !['admin', 'manager', 'editor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin/Manager/Editor role required.'
      });
    }

    // Check if article exists and user has permission to delete
    const existingArticle = await prisma.newsArticle.findUnique({
      where: { id: articleId }
    });

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Editors can only delete their own articles, and only if they're drafts or pending
    if (user.role === 'editor') {
      if (existingArticle.authorId !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only delete your own articles.'
        });
      }
      if (!['draft', 'pending'].includes(existingArticle.status)) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete draft or pending articles.'
        });
      }
    }

    console.log(`🔄 Deleting article ${articleId} by ${user.role}`);

    await prisma.newsArticle.delete({
      where: { id: articleId }
    });

    console.log(`✅ Deleted article ${articleId}`);

    res.json({
      success: true,
      message: 'Article deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error deleting article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete article',
      details: error.message
    });
  }
});

export default router;