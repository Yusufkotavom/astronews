// Content utilities for performance optimization
import { getCollection } from 'astro:content';

// Cache for content collections to avoid repeated calls
let postsCache: any[] | null = null;
let pagesCache: any[] | null = null;

export async function getCachedPosts() {
  if (!postsCache) {
    try {
      postsCache = await getCollection('post');
    } catch (error) {
      console.warn('Post collection not found, using empty array');
      postsCache = [];
    }
  }
  return postsCache;
}

export async function getCachedPages() {
  if (!pagesCache) {
    try {
      pagesCache = await getCollection('page');
    } catch (error) {
      console.warn('Page collection not found, using empty array');
      pagesCache = [];
    }
  }
  return pagesCache;
}

// Get all categories with counts
export async function getCategories() {
  const posts = await getCachedPosts();
  const pages = await getCachedPages();
  
  const postCategories = posts.map(post => post.data.category).filter(Boolean);
  const pageCategories = pages.map(page => page.data.category).filter(Boolean);
  const allCategories = [...postCategories, ...pageCategories];
  
  const categoryCount = allCategories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .map(([category, count]) => ({ category, count }));
}

// Get all tags with counts
export async function getTags() {
  const posts = await getCachedPosts();
  
  const allTags = posts.flatMap(post => 
    Array.isArray(post.data.tags) ? post.data.tags : []
  ).filter(Boolean);
  
  const tagCount = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(tagCount)
    .sort(([,a], [,b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));
}

// Get recent posts
export async function getRecentPosts(limit: number = 5) {
  const posts = await getCachedPosts();
  
  return posts
    .sort((a, b) => new Date(b.data.publishDate || 0).getTime() - new Date(a.data.publishDate || 0).getTime())
    .slice(0, limit);
}

// Get featured posts
export async function getFeaturedPosts(limit: number = 3) {
  const posts = await getCachedPosts();
  
  return posts
    .filter(post => post.data.featured)
    .sort((a, b) => new Date(b.data.publishDate || 0).getTime() - new Date(a.data.publishDate || 0).getTime())
    .slice(0, limit);
}

// Search functionality
export async function searchContent(query: string) {
  const posts = await getCachedPosts();
  const pages = await getCachedPages();
  
  const searchTerm = query.toLowerCase();
  
  // Search in posts
  const postResults = posts.filter((post) => {
    const title = post.data.title?.toLowerCase() || '';
    const description = post.data.description?.toLowerCase() || '';
    const content = post.body?.toLowerCase() || '';
    const category = post.data.category?.toLowerCase() || '';
    const tags = Array.isArray(post.data.tags) 
      ? post.data.tags.join(' ').toLowerCase() 
      : (post.data.tags || '').toLowerCase();
    const author = post.data.author?.toLowerCase() || '';
    
    return title.includes(searchTerm) || 
           description.includes(searchTerm) || 
           content.includes(searchTerm) ||
           category.includes(searchTerm) ||
           tags.includes(searchTerm) ||
           author.includes(searchTerm);
  }).map(post => ({
    title: post.data.title,
    url: `/${post.slug}`,
    description: post.data.description,
    type: 'post',
    category: post.data.category || 'Blog',
    date: post.data.publishDate,
    author: post.data.author,
    image: post.data.image,
    source: 'static'
  }));
  
  // Search in pages
  const pageResults = pages.filter((page) => {
    const title = page.data.title?.toLowerCase() || '';
    const description = page.data.description?.toLowerCase() || '';
    const content = page.body?.toLowerCase() || '';
    
    return title.includes(searchTerm) || 
           description.includes(searchTerm) ||
           content.includes(searchTerm);
  }).map(page => ({
    title: page.data.title,
    url: `/${page.slug}`,
    description: page.data.description,
    type: 'page',
    category: page.data.category || 'Page',
    date: page.data.publishDate,
    author: page.data.author,
    image: page.data.image,
    source: 'static'
  }));
  
  // Additional static pages
  const additionalPages = [
    {
      title: 'Home',
      url: '/',
      description: 'Welcome to Kotacom - Professional IT Services and Web Development',
      type: 'page',
      category: 'Main'
    },
    {
      title: 'About',
      url: '/about',
      description: 'Learn about Kotacom and our mission',
      type: 'page',
      category: 'Main'
    },
    {
      title: 'Services',
      url: '/services',
      description: 'Our comprehensive IT and web development services',
      type: 'page',
      category: 'Services'
    },
    {
      title: 'Portfolio',
      url: '/portfolio',
      description: 'View our completed projects and work samples',
      type: 'page',
      category: 'Portfolio'
    },
    {
      title: 'Contact',
      url: '/contact',
      description: 'Get in touch with our team',
      type: 'page',
      category: 'Contact'
    },
    {
      title: 'Blog',
      url: '/blog',
      description: 'Latest insights, tutorials, and updates',
      type: 'page',
      category: 'Blog'
    }
  ];
  
  const additionalPageResults = additionalPages.filter((page) => {
    const title = page.title.toLowerCase();
    const description = page.description.toLowerCase();
    const category = page.category.toLowerCase();
    
    return title.includes(searchTerm) || 
           description.includes(searchTerm) ||
           category.includes(searchTerm);
  }).map(page => ({
    ...page,
    source: 'static'
  }));
  
  // Combine and sort results
  const allResults = [...postResults, ...pageResults, ...additionalPageResults];
  
  return allResults.sort((a, b) => {
    // Prioritize exact title matches
    const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
    const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
    
    if (aTitleMatch && !bTitleMatch) return -1;
    if (!aTitleMatch && bTitleMatch) return 1;
    
    // Then prioritize posts over pages
    if (a.type === 'post' && b.type === 'page') return -1;
    if (a.type === 'page' && b.type === 'post') return 1;
    
    // Finally sort by date (newest first for posts)
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    return 0;
  });
}

// Date formatting utility
export function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// HTML stripping utility
export function stripHtml(html: string, maxLength: number = 120) {
  return html.replace(/<[^>]*>/g, '').substring(0, maxLength) + '...';
}

// Get type badge color
export function getTypeBadgeColor(type: string) {
  return type === 'post' 
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
}