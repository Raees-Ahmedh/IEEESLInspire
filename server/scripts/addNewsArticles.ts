// scripts/addNewsArticles.ts - Add sample news articles using existing NewsArticle schema
import { prisma } from '../src/config/database';

async function addNewsArticles() {
  try {
    console.log('📰 Adding sample news articles using existing schema...');
    
    // First, we need a user to be the author (check if one exists or create one)
    let author = await prisma.user.findFirst({
      where: { 
        role: { in: ['admin', 'editor', 'manager'] }
      }
    });

    if (!author) {
      console.log('🔄 Creating sample author user...');
      author = await prisma.user.create({
        data: {
          userType: 'admin',
          email: 'admin@pathfinder.com',
          passwordHash: 'hashed_password_placeholder',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          profileData: { role: 'content_admin' },
          isActive: true,
          auditInfo: {
            createdAt: new Date().toISOString(),
            createdBy: 'system',
            updatedAt: new Date().toISOString(),
            updatedBy: 'system'
          }
        }
      });
      console.log(`✅ Created author user: ${author.firstName} ${author.lastName}`);
    }

    // Sample news articles data using existing schema
    const newsArticlesToAdd = [
      {
        authorId: author.id,
        title: 'University Applications for 2024 Now Open - Complete Guide',
        content: `
The University Grants Commission (UGC) has officially opened applications for undergraduate programs for the 2024 academic year. Here's everything you need to know to submit a successful application.

## Important Dates

**Application Period**: February 1 - March 15, 2024
**Document Submission**: March 20, 2024
**Results Announcement**: May 30, 2024

## Required Documents

1. **Original A/L Certificate** and certified copies
2. **Birth Certificate** (original and copies)
3. **National Identity Card** or passport
4. **Grama Niladhari Certificate**
5. **Income Certificate** (for scholarship applications)
6. **Medical Certificate**
7. **Character Certificate** from your school

## Application Process

### Step 1: Online Registration
Visit the official UGC website and create your account using your A/L index number.

### Step 2: Fill Application Form
Complete all sections carefully, including personal information, educational qualifications, course preferences (up to 5 choices), and district quota preferences.

### Step 3: Document Upload
Scan and upload all required documents in PDF format. Ensure files are clear and under 2MB each.

### Step 4: Payment
Pay the application fee via online banking or at any Bank of Ceylon branch.

### Step 5: Submission
Review all information carefully before final submission. You cannot edit after submission.

Don't miss this opportunity to secure your place in a Sri Lankan university. Start your application early and ensure all documents are properly prepared.

Good luck with your applications!
        `,
        description: 'Complete guide to university applications for 2024, including important dates, required documents, and step-by-step application process.',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop',
        category: 'intake',
        status: 'published',
        tags: ['Applications', 'University', 'UGC', '2024', 'Admissions'],
        publishDate: new Date('2024-12-20'),
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
          readTime: 6,
          viewCount: 45
        }
      },
      {
        authorId: author.id,
        title: 'New STEM Scholarship Program Launched - Apply Now!',
        content: `
The Ministry of Education, in partnership with leading technology companies, has announced a groundbreaking scholarship program for students pursuing Science, Technology, Engineering, and Mathematics (STEM) fields.

## Program Overview

The **STEM Excellence Scholarship 2024** aims to support 500 outstanding students across Sri Lankan universities with full financial assistance and industry mentorship opportunities.

## Eligibility Criteria

### Academic Requirements
- Minimum Z-score of 1.5 for university admission
- Strong performance in Mathematics and Science subjects
- Admission to a STEM program at a recognized university

### Financial Criteria
- Family income below Rs. 100,000 per month
- Priority given to students from rural areas
- First-generation university students preferred

## Scholarship Benefits

### Financial Support
- **Full tuition coverage** for the entire degree program
- **Monthly stipend** of Rs. 25,000 for living expenses
- **Laptop and equipment allowance** of Rs. 150,000
- **Research project funding** up to Rs. 50,000 annually

### Professional Development
- **Industry mentorship** from leading tech professionals
- **Internship opportunities** at partner companies
- **Career guidance and placement support**
- **International conference participation** opportunities

## Application Process

Visit www.stemsrilanka.gov.lk and complete the online application form. Required documents include university admission letter, A/L results sheet, income certificate, and essays on career goals.

### Key Dates
- **Application Opens**: January 15, 2024
- **Application Deadline**: March 1, 2024
- **Results Announcement**: April 15, 2024

This scholarship represents a significant investment in Sri Lanka's future technological capabilities. Don't miss this opportunity to be part of the next generation of STEM leaders!
        `,
        description: 'New scholarship program offers full financial support and industry mentorship for 500 STEM students across Sri Lankan universities.',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop',
        category: 'scholarship',
        status: 'published',
        tags: ['STEM', 'Scholarships', 'Technology', 'Engineering', 'Science'],
        publishDate: new Date('2024-12-18'),
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
          readTime: 8,
          viewCount: 78
        }
      },
      {
        authorId: author.id,
        title: 'Career Fair 2024: 150+ Companies Recruiting Graduates',
        content: `
The largest career fair in Sri Lanka is set to take place next month, bringing together over 150 companies actively recruiting fresh graduates and experienced professionals.

## Event Details

**Date**: March 25-26, 2024
**Time**: 9:00 AM - 5:00 PM
**Venue**: Bandaranaike Memorial International Conference Hall (BMICH)
**Entry**: Free for all participants

## Participating Companies

### Technology Sector
- **99X Technology** - Software developers, QA engineers
- **Virtusa** - Full-stack developers, data scientists
- **IFS** - Software engineers, product managers
- **Sysco LABS** - Mobile developers, DevOps engineers

### Banking & Finance
- **Commercial Bank** - Management trainees, IT specialists
- **Sampath Bank** - Credit analysts, relationship managers
- **HNB** - Digital banking specialists, risk analysts

### Manufacturing
- **Unilever Sri Lanka** - Management trainees, marketing
- **MAS Holdings** - Industrial engineers, sustainability
- **Brandix** - Design, merchandising, operations

## In-Demand Skills 2024

1. **Full-Stack Development** (React, Node.js, Python)
2. **Data Science & Analytics** (Python, R, SQL)
3. **Cloud Computing** (AWS, Azure, GCP)
4. **Digital Marketing** (SEO, social media, analytics)
5. **Project Management** (Agile, Scrum methodologies)

## Preparation Tips

### Before the Fair
- Research companies and their openings
- Update your CV for different industries
- Practice your elevator pitch
- Prepare thoughtful questions
- Dress professionally

### Special Features 2024
- **CV Review Station**: Free professional feedback
- **Mock Interviews**: Practice with HR professionals
- **Industry Panels**: Learn about tech and finance trends
- **Startup Corner**: 25+ startups seeking early employees

Don't miss this opportunity to jumpstart your career! Mark your calendars: March 25-26, 2024 at BMICH!
        `,
        description: 'Over 150 companies will participate in Career Fair 2024, offering opportunities for fresh graduates and professionals across multiple industries.',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=500&fit=crop',
        category: 'general',
        status: 'published',
        tags: ['Career Fair', 'Jobs', 'Graduates', 'Recruitment', 'Companies'],
        publishDate: new Date('2024-12-16'),
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
          readTime: 7,
          viewCount: 92
        }
      },
      {
        authorId: author.id,
        title: 'University of Moratuwa Opens New AI Research Center',
        content: `
The University of Moratuwa has officially opened its state-of-the-art Artificial Intelligence Research Center, positioning itself as a leader in AI education and research in South Asia.

## Center Overview

The new **Center for Artificial Intelligence and Machine Learning** (CAIML) is a Rs. 500 million investment that will serve as a hub for cutting-edge AI research, industry collaboration, and student innovation.

## World-Class Facilities

### Research Infrastructure
- **High-Performance Computing Cluster** with 1000+ GPU cores
- **AI Development Labs** equipped with latest hardware
- **Collaborative Workspaces** for interdisciplinary research
- **Industry Partnership Hub** for real-world projects

### Research Focus Areas
1. **Machine Learning & Deep Learning**
2. **Computer Vision & Image Processing**
3. **Natural Language Processing**
4. **Robotics & Automation**
5. **AI for Healthcare**
6. **Smart Agriculture**

## Academic Programs

### New Degree Offerings
**MSc in Artificial Intelligence** (Starting September 2024)
- Duration: 2 years (full-time), 3 years (part-time)
- Curriculum: Machine learning, deep learning, AI ethics
- Industry projects and internships included

**Professional Certificate Programs**
- AI for Business Leaders (6 weeks)
- Machine Learning for Developers (12 weeks)
- Data Science Bootcamp (16 weeks)

## Industry Partnerships

### Founding Partners
- **99X Technology** - AI product development
- **IFS** - Enterprise AI solutions
- **Dialog Axiata** - Telecommunications AI
- **John Keells Holdings** - Business intelligence

### International Collaborations
- **MIT Computer Science and Artificial Intelligence Laboratory (CSAIL)**
- **Stanford AI Lab**
- **University of Oxford - Department of Computer Science**

## Student Opportunities

### Research Assistantships
- 50 funded research positions for students
- Monthly stipend of Rs. 30,000 - Rs. 50,000
- Opportunity to work on cutting-edge projects
- Co-authorship on research publications

### Current Projects
1. **Sinhala Language AI Assistant** - NLP for local languages
2. **Smart Agriculture Platform** - Crop disease detection using computer vision
3. **Healthcare AI Solutions** - Medical image analysis for diagnosis

This landmark initiative represents a significant step forward for Sri Lanka's technological advancement and positions the country to compete globally in the AI revolution.

For more information: www.caiml.mrt.ac.lk
        `,
        description: 'University of Moratuwa opens new Rs. 500 million AI Research Center with world-class facilities and international partnerships.',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop',
        category: 'announcement',
        status: 'published',
        tags: ['AI', 'Research', 'University of Moratuwa', 'Technology', 'Innovation'],
        publishDate: new Date('2024-12-14'),
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
          readTime: 9,
          viewCount: 156
        }
      },
      {
        authorId: author.id,
        title: 'Student Life Guide: Making the Most of University Years',
        content: `
University is more than just attending lectures and passing exams. It's a transformative experience that shapes your personality, builds lifelong friendships, and prepares you for the professional world.

## Academic Excellence

### Effective Study Strategies
1. **Active Learning**: Engage with material through discussions and practice
2. **Time Management**: Use tools like calendars and task lists
3. **Group Study**: Collaborate with classmates for better understanding
4. **Regular Review**: Don't leave everything for last-minute cramming
5. **Seek Help**: Visit professors during office hours when needed

### Research Opportunities
- **Undergraduate Research Programs**: Work with faculty on projects
- **Conference Presentations**: Share your findings with academic community
- **Publication Opportunities**: Co-author papers with professors
- **Research Grants**: Apply for student research funding

## Extracurricular Activities

### Student Organizations
**Academic Societies**
- Engineering Students' Association
- Medical Students' Union
- Business Students' Society
- Computing Society

**Cultural Clubs**
- Drama and Theatre Society
- Music and Dance Groups
- Art and Photography Club
- Literary Society

**Sports Teams**
- Cricket, Rugby, Football teams
- Athletics and Swimming
- Indoor games (Chess, Carrom)
- Adventure sports clubs

### Leadership Development
- **Student Council**: Represent student interests
- **Club Executive Positions**: Develop organizational skills
- **Event Organization**: Plan festivals and competitions
- **Volunteer Programs**: Serve the community

## Building Professional Network

### Industry Connections
1. **Guest Lectures**: Attend talks by industry professionals
2. **Career Fairs**: Meet potential employers
3. **Alumni Network**: Connect with graduates in your field
4. **Internships**: Gain real-world experience
5. **Professional Associations**: Join relevant industry bodies

## Personal Development

### Life Skills
**Financial Literacy**
- Budget management on student allowance
- Understanding loans and scholarships
- Basic investment knowledge
- Part-time job opportunities

**Communication Skills**
- Public speaking through presentations
- Writing skills through assignments
- Digital communication etiquette
- Cross-cultural communication

### Health and Wellness

**Physical Health**
- Regular exercise using campus facilities
- Healthy eating habits in hostels/canteens
- Adequate sleep schedule
- Regular health check-ups

**Mental Health**
- Stress management techniques
- Counseling services availability
- Mindfulness and meditation
- Social support systems

## Campus Resources

### Academic Support
- **Library Services**: Research databases and study spaces
- **Writing Centers**: Help with assignments and reports
- **Tutoring Programs**: Peer and professional tutoring
- **Computer Labs**: Access to software and technology

### Student Services
- **Career Services**: Job placement and career guidance
- **Counseling Center**: Mental health and personal support
- **Health Center**: Medical services and health education
- **Financial Aid Office**: Scholarship and loan assistance

Remember, university years are a unique time in your life. Embrace challenges as learning opportunities, step out of your comfort zone, and create memories that will last a lifetime!
        `,
        description: 'Comprehensive guide to maximizing your university experience through academics, extracurriculars, networking, and personal development.',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop',
        category: 'general',
        status: 'published',
        tags: ['Student Life', 'University', 'Personal Development', 'Campus Life', 'Academic Success'],
        publishDate: new Date('2024-12-12'),
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
          readTime: 10,
          viewCount: 203
        }
      }
    ];

    // Add news articles one by one
    let addedCount = 0;
    for (const article of newsArticlesToAdd) {
      try {
        console.log(`🔄 Adding article: ${article.title}...`);
        
        // Check if article already exists
        const existingArticle = await prisma.newsArticle.findFirst({
          where: { 
            title: article.title
          }
        });

        if (existingArticle) {
          console.log(`⚠️  Article already exists: ${article.title}, skipping...`);
          continue;
        }

        // Create news article
        const createdArticle = await prisma.newsArticle.create({
          data: article
        });

        console.log(`✅ Successfully added: ${article.title} (ID: ${createdArticle.id})`);
        addedCount++;
        
      } catch (error: any) {
        console.error(`❌ Error adding ${article.title}:`, error.message);
      }
    }

    // Display summary
    console.log('\n🎉 News article addition completed!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Added ${addedCount} new articles`);
    
    // Get updated statistics
    const stats = await prisma.newsArticle.aggregate({
      _count: { id: true }
    });
    
    const publishedCount = await prisma.newsArticle.count({
      where: { status: 'published' }
    });

    console.log(`📰 Total Articles: ${stats._count.id}`);
    console.log(`✅ Published Articles: ${publishedCount}`);
    console.log('═══════════════════════════════════════');
    
    // List all articles by category
    console.log('\n📋 Articles by Category:');
    const categories = await prisma.newsArticle.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { category: 'asc' }
    });

    categories.forEach(cat => {
      const categoryName = cat.category || 'Uncategorized';
      console.log(`📂 ${categoryName}: ${cat._count.category} articles`);
    });

    console.log('\n🌐 You can now view these articles at: http://localhost:3000');
    console.log('🔍 API endpoint: http://localhost:4000/api/news');
    
  } catch (error: any) {
    console.error('❌ Error in addNewsArticles function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
async function main() {
  try {
    console.log('🚀 Starting news articles addition script...');
    await addNewsArticles();
    console.log('🎉 Script completed successfully!');
  } catch (error: any) {
    console.error('💥 Script failed:', error);
  }
}

// Execute the main function
main();