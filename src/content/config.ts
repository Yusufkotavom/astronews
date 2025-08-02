import { defineCollection, z } from 'astro:content';

const postCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().optional(),
    authorBio: z.string().optional(),
    authorImage: z.string().optional(),
    publishDate: z.string().or(z.date()),
    updateDate: z.string().or(z.date()).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    readingTime: z.number().optional(),
    tableOfContents: z.boolean().optional(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    lang: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    relatedPosts: z.array(z.string()).optional(),
  }),
});

const pageCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().optional(),
    publishDate: z.string().or(z.date()).optional(),
    updateDate: z.string().or(z.date()).optional(),
    category: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  'post': postCollection,
  'page': pageCollection,
};